const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All notification routes require authenticated student identity
router.use(authenticateUser);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.dismissNotification);

module.exports = router;

