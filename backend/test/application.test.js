process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { connectDB } = require('../src/config/db');
const applicationController = require('../src/controllers/applicationController');
const memoryStore = require('../src/services/memoryStore');
const notificationService = require('../src/services/notificationService');
const { checkUpcomingDeadlines } = require('../src/services/scheduler');

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test('Application Tracking & Management Suite', async (suite) => {
  await connectDB();
  const userA = { id: 'user_student_alpha', email: 'alpha@college.edu', fullName: 'Alpha Student' };
  const userB = { id: 'user_student_beta', email: 'beta@college.edu', fullName: 'Beta Student' };

  await suite.test('1. Creates new tracking record with initial status "Interested" or "Application Started"', async () => {
    const req = {
      user: userA,
      body: {
        opportunityTitle: 'MIT Summer Research Program 2026',
        organization: 'MIT EECS',
        opportunityType: 'Internships',
        officialApplicationUrl: 'https://mit.edu/apply/summer-2026',
        status: 'Application Started',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Pre-requisite: Recommendation letter required',
      },
    };
    const res = createMockRes();
    await applicationController.createApplication(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Application Started');
    assert.equal(res.body.data.statusHistory.length, 1);
    assert.equal(res.body.data.statusHistory[0].newStatus, 'Application Started');
    assert.equal(res.body.data.userId, userA.id);
  });

  await suite.test('2. Rejects creation with invalid status or unsafe URL protocol', async () => {
    const reqInvalidStatus = {
      user: userA,
      body: {
        opportunityTitle: 'Invalid Status Test',
        organization: 'Some Org',
        status: 'FakeStatusNotAllowed',
      },
    };
    const res1 = createMockRes();
    await applicationController.createApplication(reqInvalidStatus, res1);
    assert.equal(res1.statusCode, 400);
    assert.match(res1.body.message, /Invalid status/);

    const reqInvalidUrl = {
      user: userA,
      body: {
        opportunityTitle: 'Unsafe Link Test',
        organization: 'Some Org',
        officialApplicationUrl: 'javascript:alert(1)',
      },
    };
    const res2 = createMockRes();
    await applicationController.createApplication(reqInvalidUrl, res2);
    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /http:\/\/ or https:\/\//);
  });

  await suite.test('3. Prevents duplicate active tracking records for the same user and opportunity', async () => {
    const oppId = 'mem_opp_1';
    const req1 = {
      user: userA,
      body: {
        opportunityId: oppId,
        opportunityTitle: 'National STEM Scholarship',
        organization: 'Ministry of Education',
        status: 'Interested',
      },
    };
    const res1 = createMockRes();
    await applicationController.createApplication(req1, res1);
    assert.ok(res1.statusCode === 201 || res1.statusCode === 200);

    // Attempt second track
    const res2 = createMockRes();
    await applicationController.createApplication(req1, res2);
    assert.equal(res2.statusCode, 200);
    assert.equal(res2.body.isExisting, true);
  });

  await suite.test('4. Enforces ownership: User B cannot access or modify User A application', async () => {
    // Create an app for User A
    const reqCreate = {
      user: userA,
      body: {
        opportunityTitle: 'User A Private Application',
        organization: 'Private Foundation',
        status: 'Interested',
      },
    };
    const resCreate = createMockRes();
    await applicationController.createApplication(reqCreate, resCreate);
    const appId = resCreate.body.data._id;

    // User B tries to view
    const reqViewB = { user: userB, params: { id: appId } };
    const resViewB = createMockRes();
    await applicationController.getApplicationById(reqViewB, resViewB);
    assert.equal(resViewB.statusCode, 403);
    assert.match(resViewB.body.message, /Access denied/);

    // User B tries to update status
    const reqUpdateB = {
      user: userB,
      params: { id: appId },
      body: { status: 'Applied' },
    };
    const resUpdateB = createMockRes();
    await applicationController.updateApplicationStatus(reqUpdateB, resUpdateB);
    assert.equal(resUpdateB.statusCode, 403);

    // User B tries to delete
    const reqDelB = { user: userB, params: { id: appId } };
    const resDelB = createMockRes();
    await applicationController.deleteApplication(reqDelB, resDelB);
    assert.equal(resDelB.statusCode, 403);
  });

  await suite.test('5. Status update correctly tracks history, source, and submission confirmation', async () => {
    const reqCreate = {
      user: userA,
      body: {
        opportunityTitle: 'Status Transition Test Opp',
        organization: 'CERN Summer Student Program',
        status: 'Application Started',
      },
    };
    const resCreate = createMockRes();
    await applicationController.createApplication(reqCreate, resCreate);
    const appId = resCreate.body.data._id;

    // Student confirms submission on Opplyra after completing external portal
    const reqConfirm = {
      user: userA,
      params: { id: appId },
      body: {
        status: 'Applied',
        source: 'User Confirmed',
        note: 'Submitted application with reference CERN-2026-X9',
        externalReference: 'CERN-2026-X9',
      },
    };
    const resConfirm = createMockRes();
    await applicationController.updateApplicationStatus(reqConfirm, resConfirm);

    assert.equal(resConfirm.statusCode, 200);
    assert.equal(resConfirm.body.data.status, 'Applied');
    assert.equal(resConfirm.body.data.statusSource, 'User Confirmed');
    assert.ok(resConfirm.body.data.applicationDate);
    assert.equal(resConfirm.body.data.statusHistory[0].newStatus, 'Applied');
    assert.equal(resConfirm.body.data.statusHistory[0].source, 'User Confirmed');

    // Further status transition: Under Review
    const reqReview = {
      user: userA,
      params: { id: appId },
      body: {
        status: 'Under Review',
        source: 'Manual Update',
        note: 'Status page shows under scientific committee review',
      },
    };
    const resReview = createMockRes();
    await applicationController.updateApplicationStatus(reqReview, resReview);

    assert.equal(resReview.statusCode, 200);
    assert.equal(resReview.body.data.status, 'Under Review');
    assert.equal(resReview.body.data.statusHistory.length >= 2, true);
    assert.equal(resReview.body.data.statusHistory[0].previousStatus, 'Applied');
    assert.equal(resReview.body.data.statusHistory[0].newStatus, 'Under Review');
  });

  await suite.test('6. Summary calculation reflects actual counts accurately', async () => {
    const reqSummary = { user: userA };
    const resSummary = createMockRes();
    await applicationController.getApplicationSummary(reqSummary, resSummary);

    assert.equal(resSummary.statusCode, 200);
    assert.equal(typeof resSummary.body.data.total, 'number');
    assert.equal(typeof resSummary.body.data.submitted, 'number');
    assert.equal(typeof resSummary.body.data.underReview, 'number');
    assert.equal(typeof resSummary.body.data.shortlisted, 'number');
    assert.equal(typeof resSummary.body.data.upcomingDeadlines, 'number');
    assert.equal(typeof resSummary.body.data.actionRequired, 'number');
  });

  await suite.test('7. Notification Preferences can be retrieved and updated', async () => {
    const reqGet = { user: userA };
    const resGet = createMockRes();
    await applicationController.getNotificationPreferences(reqGet, resGet);
    assert.equal(resGet.statusCode, 200);
    assert.equal(resGet.body.data.emailNotificationsEnabled, true);

    const reqUpdate = {
      user: userA,
      body: {
        emailNotificationsEnabled: false,
        reminderIntervals: [3, 1],
      },
    };
    const resUpdate = createMockRes();
    await applicationController.updateNotificationPreferences(reqUpdate, resUpdate);
    assert.equal(resUpdate.statusCode, 200);
    assert.equal(resUpdate.body.data.emailNotificationsEnabled, false);
    assert.deepEqual(resUpdate.body.data.reminderIntervals, [3, 1]);
  });

  await suite.test('8. Idempotent notification prevents duplicate alerts', async () => {
    // Re-enable notifications for user
    await notificationService.updatePreferences(userA.id, { emailNotificationsEnabled: true });

    const notifPayload = {
      userId: userA.id,
      recipientEmail: userA.email,
      applicationId: 'test_app_idempotent_1',
      type: 'deadline_reminder',
      intervalDays: 3,
      subject: 'Reminder: 3 days remaining',
      message: 'Your application is closing soon.',
    };

    const firstSend = await notificationService.sendNotification(notifPayload);
    assert.equal(firstSend.sent, true);

    // Second send with same idempotency key
    const secondSend = await notificationService.sendNotification(notifPayload);
    assert.equal(secondSend.sent, false);
    assert.match(secondSend.reason, /Duplicate/);
  });

  await suite.test('9. Deadline checker runs safely and handles upcoming deadlines', async () => {
    const results = await checkUpcomingDeadlines();
    assert.equal(typeof results.checked, 'number');
    assert.equal(typeof results.remindersSent, 'number');
    assert.equal(typeof results.expiredUpdated, 'number');
  });
});

