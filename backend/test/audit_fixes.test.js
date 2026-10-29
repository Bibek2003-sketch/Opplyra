process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { authenticateUser } = require('../src/middleware/auth');
const { connectDB } = require('../src/config/db');
const savedController = require('../src/controllers/savedController');
const reminderController = require('../src/controllers/reminderController');
const applicationController = require('../src/controllers/applicationController');
const { register } = require('../src/controllers/authController');
const memoryStore = require('../src/services/memoryStore');

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

test('Audit Fixes & Security Hardening Suite', async (suite) => {
  await connectDB();

  await suite.test('1. authenticateUser rejects unauthenticated request with 401', async () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await authenticateUser(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Authentication required/i);
  });

  await suite.test('2. authenticateUser rejects non-existent student user with 401', async () => {
    const req = { headers: { 'x-user-id': 'non_existent_fake_student_9999' } };
    const res = createMockRes();
    let nextCalled = false;

    await authenticateUser(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid student session/i);
  });

  await suite.test('3. authenticateUser accepts valid student user and sets req.user', async () => {
    // Register a test user
    const regReq = {
      body: {
        email: `audit.auth.${Date.now()}@college.edu`,
        password: 'Password123!',
        fullName: 'Audit Student',
        course: 'B.Tech IT',
        academicYear: '3rd Year',
      },
    };
    const regRes = createMockRes();
    await register(regReq, regRes);
    const userId = regRes.body.data.user.id || regRes.body.data.user._id;

    const req = { headers: { 'x-user-id': userId.toString() } };
    const res = createMockRes();
    let nextCalled = false;

    await authenticateUser(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.email, regReq.body.email);
    assert.equal(req.user.fullName, 'Audit Student');
  });

  await suite.test('4. Saved opportunities are isolated per user', async () => {
    const userA = { id: `user_save_a_${Date.now()}` };
    const userB = { id: `user_save_b_${Date.now()}` };
    const oppId = memoryStore.opportunities[0]._id;

    // User A saves opp
    const reqSaveA = {
      user: userA,
      headers: { 'x-user-id': userA.id },
      body: { opportunityId: oppId, status: 'Interested' },
    };
    const resSaveA = createMockRes();
    await savedController.saveOpportunity(reqSaveA, resSaveA);
    assert.equal(resSaveA.statusCode, 201);

    // User B checks saved items - should not see User A's item
    const reqGetB = {
      user: userB,
      headers: { 'x-user-id': userB.id },
      query: {},
    };
    const resGetB = createMockRes();
    await savedController.getSavedOpportunities(reqGetB, resGetB);
    assert.equal(resGetB.statusCode, 200);
    const userBItems = resGetB.body.data.filter((s) => s.opportunityId === oppId || s.opportunity?._id === oppId);
    assert.equal(userBItems.length, 0);
  });

  await suite.test('5. Deadline reminders are isolated per user', async () => {
    const userA = { id: `user_rem_a_${Date.now()}` };
    const userB = { id: `user_rem_b_${Date.now()}` };
    const oppId = memoryStore.opportunities[1]._id;

    // User A creates reminder
    const reqRemA = {
      user: userA,
      headers: { 'x-user-id': userA.id },
      body: { opportunityId: oppId, offset: '1_day_before' },
    };
    const resRemA = createMockRes();
    await reminderController.createReminder(reqRemA, resRemA);
    assert.equal(resRemA.statusCode, 201);

    // User B retrieves reminders - User A's reminder should not appear
    const reqGetB = {
      user: userB,
      headers: { 'x-user-id': userB.id },
    };
    const resGetB = createMockRes();
    await reminderController.getReminders(reqGetB, resGetB);
    assert.equal(resGetB.statusCode, 200);
    const userBReminders = resGetB.body.data.filter((r) => r.opportunityId === oppId || r.opportunity?._id === oppId);
    assert.equal(userBReminders.length, 0);
  });

  await suite.test('6. Enforces strict ownership: caller cannot bypass via default_student_user', async () => {
    const userA = { id: `owner_test_a_${Date.now()}`, email: 'a@college.edu', fullName: 'User A' };
    const attackerClaimingDefault = { id: 'default_student_user', email: 'priya.sharma@college.edu', fullName: 'Priya' };

    // User A creates application
    const reqCreate = {
      user: userA,
      body: {
        opportunityTitle: 'Restricted CERN Fellowship',
        organization: 'CERN Geneva',
        status: 'Interested',
      },
    };
    const resCreate = createMockRes();
    await applicationController.createApplication(reqCreate, resCreate);
    const appId = resCreate.body.data._id;

    // Attacker presenting default_student_user tries to delete User A application
    const reqDelete = {
      user: attackerClaimingDefault,
      params: { id: appId },
    };
    const resDelete = createMockRes();
    await applicationController.deleteApplication(reqDelete, resDelete);

    assert.equal(resDelete.statusCode, 403);
    assert.match(resDelete.body.message, /Access denied/i);
  });

  await suite.test('7. Database safeguard: refuses silent in-memory fallback in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalAllowFallback = process.env.ALLOW_IN_MEMORY_FALLBACK;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;

      await assert.rejects(
        async () => {
          await connectDB();
        },
        (err) => {
          assert.match(err.message, /In-memory fallback is disabled in production/i);
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalAllowFallback !== undefined) {
        process.env.ALLOW_IN_MEMORY_FALLBACK = originalAllowFallback;
      }
    }
  });
});
