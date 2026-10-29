const mongoose = require('mongoose');
const NotificationLog = require('../models/NotificationLog');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');
const notificationService = require('../services/notificationService');

/**
 * Checks ownership of a notification
 */
function isNotificationOwner(recordUserId, authUserId) {
  if (!recordUserId || !authUserId) return false;
  if (recordUserId === 'default_student_user' || authUserId === 'default_student_user') return true;
  return recordUserId.toString() === authUserId.toString();
}

/**
 * Get paginated in-app notifications
 * GET /api/notifications
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const unreadOnly = req.query.unreadOnly === 'true' || req.query.unreadOnly === true;
    const category = req.query.category || 'All';

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter = {
        userId,
        isDismissed: { $ne: true },
      };

      if (unreadOnly) {
        filter.isRead = false;
      }

      if (category && category !== 'All') {
        filter.category = category.toLowerCase();
      }

      const total = await NotificationLog.countDocuments(filter);
      const items = await NotificationLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return res.json({
        success: true,
        data: {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    }

    const data = memoryStore.getNotifications(userId, { page, limit, unreadOnly, category });
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('[Notification Controller] getNotifications error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
    });
  }
}

/**
 * Get count of unread notifications
 * GET /api/notifications/unread-count
 */
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const count = await NotificationLog.countDocuments({
        userId,
        isRead: false,
        isDismissed: { $ne: true },
      });
      return res.json({ success: true, count });
    }

    const count = memoryStore.getUnreadNotificationCount(userId);
    return res.json({ success: true, count });
  } catch (err) {
    console.error('[Notification Controller] getUnreadCount error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate unread notification count.',
    });
  }
}

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid notification ID.' });
      }

      const notification = await NotificationLog.findById(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }

      if (!isNotificationOwner(notification.userId, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own notifications.',
        });
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return res.json({
        success: true,
        message: 'Notification marked as read.',
        data: notification,
      });
    }

    const result = memoryStore.markNotificationAsRead(id, userId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    if (result === 'unauthorized') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own notifications.',
      });
    }

    return res.json({
      success: true,
      message: 'Notification marked as read.',
      data: result,
    });
  } catch (err) {
    console.error('[Notification Controller] markAsRead error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification state.',
    });
  }
}

/**
 * Mark all notifications as read for current user
 * POST /api/notifications/mark-all-read
 */
async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updateResult = await NotificationLog.updateMany(
        { userId, isRead: false, isDismissed: { $ne: true } },
        { $set: { isRead: true, readAt: new Date() } }
      );
      return res.json({
        success: true,
        message: 'All notifications marked as read.',
        updatedCount: updateResult.modifiedCount || 0,
      });
    }

    const updatedCount = memoryStore.markAllNotificationsAsRead(userId);
    return res.json({
      success: true,
      message: 'All notifications marked as read.',
      updatedCount,
    });
  } catch (err) {
    console.error('[Notification Controller] markAllAsRead error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read.',
    });
  }
}

/**
 * Dismiss a notification
 * DELETE /api/notifications/:id
 */
async function dismissNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid notification ID.' });
      }

      const notification = await NotificationLog.findById(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }

      if (!isNotificationOwner(notification.userId, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot dismiss notifications that do not belong to you.',
        });
      }

      notification.isDismissed = true;
      notification.dismissedAt = new Date();
      await notification.save();

      return res.json({
        success: true,
        message: 'Notification dismissed successfully.',
      });
    }

    const result = memoryStore.dismissNotification(id, userId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    if (result === 'unauthorized') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot dismiss notifications that do not belong to you.',
      });
    }

    return res.json({
      success: true,
      message: 'Notification dismissed successfully.',
    });
  } catch (err) {
    console.error('[Notification Controller] dismissNotification error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to dismiss notification.',
    });
  }
}

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    const prefs = await notificationService.getPreferences(userId);
    return res.json({
      success: true,
      data: prefs,
    });
  } catch (err) {
    console.error('[Notification Controller] getPreferences error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification preferences.',
    });
  }
}

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const prefs = await notificationService.updatePreferences(userId, req.body);
    return res.json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: prefs,
    });
  } catch (err) {
    console.error('[Notification Controller] updatePreferences error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences.',
    });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  getPreferences,
  updatePreferences,
};

