process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const { connectDB } = require('../src/config/db');
const notificationController = require('../src/controllers/notificationController');
const notificationService = require('../src/services/notificationService');
const memoryStore = require('../src/services/memoryStore');
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

test('Notification Center & Delivery Suite', async (suite) => {
  await connectDB();

  const userA = { id: 'student_notif_alice', email: 'alice@college.edu', fullName: 'Alice Walker' };
  const userB = { id: 'student_notif_bob', email: 'bob@college.edu', fullName: 'Bob Martin' };

  await suite.test('1. Dispatches unified notification and stores record with in-app state', async () => {
    const dispatchResult = await notificationService.dispatchNotification({
      userId: userA.id,
      recipientEmail: userA.email,
      type: 'tracking_created',
      category: 'application',
      title: 'Tracking Started',
      subject: 'Tracking Started: CERN Openlab 2026',
      message: 'You started tracking CERN Openlab 2026.',
      destinationRoute: '/app#tracker',
    });

    assert.equal(dispatchResult.sent, true);
    assert.equal(dispatchResult.inAppDelivered, true);
    assert.ok(dispatchResult.notification);
    assert.equal(dispatchResult.notification.isRead, false);
    assert.equal(dispatchResult.notification.category, 'application');
  });

  await suite.test('2. Retrieves user notifications with pagination and counts unread accurately', async () => {
    // Dispatch another unread notification for userA
    await notificationService.dispatchNotification({
      userId: userA.id,
      recipientEmail: userA.email,
      type: 'action_required',
      category: 'action',
      title: 'Action Needed',
      subject: 'Upload Transcript',
      message: 'Please upload your official transcript.',
      destinationRoute: '/app#tracker',
    });

    // Test getNotifications
    const req = { user: userA, query: { page: 1, limit: 10 } };
    const res = createMockRes();
    await notificationController.getNotifications(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.items.length >= 2);

    // Test getUnreadCount
    const countReq = { user: userA };
    const countRes = createMockRes();
    await notificationController.getUnreadCount(countReq, countRes);

    assert.equal(countRes.statusCode, 200);
    assert.ok(countRes.body.count >= 2);
  });

  await suite.test('3. Marks single notification as read and records read timestamp', async () => {
    // Get notifications for userA
    const getReq = { user: userA, query: {} };
    const getRes = createMockRes();
    await notificationController.getNotifications(getReq, getRes);

    const firstItem = getRes.body.data.items[0];
    assert.ok(firstItem);

    const readReq = { user: userA, params: { id: firstItem._id } };
    const readRes = createMockRes();
    await notificationController.markAsRead(readReq, readRes);

    assert.equal(readRes.statusCode, 200);
    assert.equal(readRes.body.success, true);
    assert.equal(readRes.body.data.isRead, true);
    assert.ok(readRes.body.data.readAt);
  });

  await suite.test('4. Enforces ownership: User B cannot mark or dismiss User A notification (403)', async () => {
    // Get notification belonging to userA
    const getReq = { user: userA, query: {} };
    const getRes = createMockRes();
    await notificationController.getNotifications(getReq, getRes);

    const targetItem = getRes.body.data.items[0];
    assert.ok(targetItem);

    // User B tries to mark it as read
    const hackReq = { user: userB, params: { id: targetItem._id } };
    const hackRes = createMockRes();
    await notificationController.markAsRead(hackReq, hackRes);

    assert.equal(hackRes.statusCode, 403);
    assert.equal(hackRes.body.success, false);

    // User B tries to dismiss it
    const dismissRes = createMockRes();
    await notificationController.dismissNotification(hackReq, dismissRes);

    assert.equal(dismissRes.statusCode, 403);
    assert.equal(dismissRes.body.success, false);
  });

  await suite.test('5. Marks all notifications as read for current user', async () => {
    const markAllReq = { user: userA };
    const markAllRes = createMockRes();
    await notificationController.markAllAsRead(markAllReq, markAllRes);

    assert.equal(markAllRes.statusCode, 200);
    assert.equal(markAllRes.body.success, true);

    // Check count is now 0
    const countReq = { user: userA };
    const countRes = createMockRes();
    await notificationController.getUnreadCount(countReq, countRes);

    assert.equal(countRes.body.count, 0);
  });

  await suite.test('6. Dismisses a notification so it no longer appears in active list', async () => {
    const getReq = { user: userA, query: {} };
    const getRes = createMockRes();
    await notificationController.getNotifications(getReq, getRes);

    const initialTotal = getRes.body.data.total;
    const targetItem = getRes.body.data.items[0];

    const dismissReq = { user: userA, params: { id: targetItem._id } };
    const dismissRes = createMockRes();
    await notificationController.dismissNotification(dismissReq, dismissRes);

    assert.equal(dismissRes.statusCode, 200);
    assert.equal(dismissRes.body.success, true);

    // Verify list count decreased
    const afterReq = { user: userA, query: {} };
    const afterRes = createMockRes();
    await notificationController.getNotifications(afterReq, afterRes);

    assert.equal(afterRes.body.data.total, initialTotal - 1);
  });

  await suite.test('7. Manages notification preferences with validation and persistence', async () => {
    const getPrefReq = { user: userA };
    const getPrefRes = createMockRes();
    await notificationController.getPreferences(getPrefReq, getPrefRes);

    assert.equal(getPrefRes.statusCode, 200);
    assert.equal(getPrefRes.body.data.inAppNotificationsEnabled, true);

    // Update preferences
    const updatePrefReq = {
      user: userA,
      body: {
        inAppNotificationsEnabled: true,
        emailNotificationsEnabled: false,
        reminderIntervals: [5, 2],
        statusUpdateAlerts: true,
      },
    };
    const updatePrefRes = createMockRes();
    await notificationController.updatePreferences(updatePrefReq, updatePrefRes);

    assert.equal(updatePrefRes.statusCode, 200);
    assert.equal(updatePrefRes.body.data.emailNotificationsEnabled, false);
    assert.deepEqual(updatePrefRes.body.data.reminderIntervals, [5, 2]);
  });

  await suite.test('8. Prevents duplicate event notifications via idempotency key', async () => {
    const idempotencyKey = `userA_test_event_idempotent_${Date.now()}`;
    const first = await notificationService.dispatchNotification({
      userId: userA.id,
      recipientEmail: userA.email,
      type: 'status_updated',
      subject: 'Interview Scheduled',
      customIdempotencyKey: idempotencyKey,
    });
    assert.equal(first.sent, true);

    const second = await notificationService.dispatchNotification({
      userId: userA.id,
      recipientEmail: userA.email,
      type: 'status_updated',
      subject: 'Interview Scheduled',
      customIdempotencyKey: idempotencyKey,
    });
    assert.equal(second.sent, false);
    assert.ok(second.reason.includes('Duplicate'));
  });

  await suite.test('9. Scheduler locks safely and handles deadline checks without crashes', async () => {
    const checkResult = await checkUpcomingDeadlines();
    assert.ok(checkResult);
    assert.ok(typeof checkResult.checked === 'number' || checkResult.skipped === true);
  });
});

