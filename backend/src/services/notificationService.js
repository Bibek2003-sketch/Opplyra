const NotificationLog = require('../models/NotificationLog');
const NotificationPreference = require('../models/NotificationPreference');
const { getDbStatus } = require('../config/db');
const memoryStore = require('./memoryStore');

const ALLOWED_DESTINATION_ROUTES = [
  '/app',
  '/app#tracker',
  '/app#dashboard',
  '/app#catalogue',
  '/app#reminders',
  '/app#verification',
  '/app#notifications',
];

/**
 * Opplyra Notification & In-App / Email Delivery Service
 * Coordinates multi-channel notifications (in-app alerts and idempotent email)
 */
class NotificationService {
  constructor() {
    this.emailEnabled = process.env.NOTIFICATION_EMAIL_ENABLED === 'true';
    this.fromEmail = process.env.EMAIL_FROM || 'Opplyra Notifications <notifications@opplyra.app>';
  }

  /**
   * Sanitizes and allowlists internal routes
   */
  sanitizeRoute(route) {
    if (!route || typeof route !== 'string') return '/app#tracker';
    const trimmed = route.trim();
    if (ALLOWED_DESTINATION_ROUTES.includes(trimmed)) {
      return trimmed;
    }
    // Safe fallback if matches internal pattern
    if (trimmed.startsWith('/app')) {
      return trimmed.replace(/[<>"'`]/g, '');
    }
    return '/app#tracker';
  }

  /**
   * Retrieves or initializes student notification preferences
   */
  async getPreferences(userId) {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      let prefs = await NotificationPreference.findOne({ userId });
      if (!prefs) {
        prefs = await NotificationPreference.create({
          userId,
          inAppNotificationsEnabled: true,
          emailNotificationsEnabled: true,
          deadlineReminderAlerts: true,
          reminderIntervals: [7, 3, 1],
          statusUpdateAlerts: true,
          actionRequiredAlerts: true,
        });
      }
      return prefs;
    }

    return memoryStore.getNotificationPreferences(userId);
  }

  /**
   * Updates student notification preferences
   */
  async updatePreferences(userId, updateData) {
    const { mode } = getDbStatus();
    const sanitized = {};

    if (typeof updateData.inAppNotificationsEnabled === 'boolean') {
      sanitized.inAppNotificationsEnabled = updateData.inAppNotificationsEnabled;
    }
    if (typeof updateData.emailNotificationsEnabled === 'boolean') {
      sanitized.emailNotificationsEnabled = updateData.emailNotificationsEnabled;
    }
    if (typeof updateData.deadlineReminderAlerts === 'boolean') {
      sanitized.deadlineReminderAlerts = updateData.deadlineReminderAlerts;
    }
    if (typeof updateData.statusUpdateAlerts === 'boolean') {
      sanitized.statusUpdateAlerts = updateData.statusUpdateAlerts;
    }
    if (typeof updateData.actionRequiredAlerts === 'boolean') {
      sanitized.actionRequiredAlerts = updateData.actionRequiredAlerts;
    }
    if (Array.isArray(updateData.reminderIntervals)) {
      sanitized.reminderIntervals = updateData.reminderIntervals
        .map((n) => Number(n))
        .filter((n) => !isNaN(n) && n > 0 && n <= 60);
    }

    if (mode === 'mongodb') {
      const prefs = await NotificationPreference.findOneAndUpdate(
        { userId },
        { $set: sanitized },
        { new: true, upsert: true }
      );
      return prefs;
    }

    return memoryStore.updateNotificationPreferences(userId, sanitized);
  }

  /**
   * Dispatches unified in-app and email notification
   */
  async dispatchNotification({
    userId,
    recipientEmail = '',
    applicationId = null,
    opportunityId = null,
    type,
    category = 'application',
    title,
    subject,
    message,
    intervalDays = null,
    destinationRoute = '/app#tracker',
    customIdempotencyKey = null,
  }) {
    if (!userId) {
      return { sent: false, reason: 'Missing user ID' };
    }

    // Load student preferences
    const prefs = await this.getPreferences(userId);

    // Verify category preference
    if (type === 'deadline_reminder' && !prefs.deadlineReminderAlerts) {
      return { sent: false, reason: 'User disabled deadline reminder alerts' };
    }
    if (type === 'status_updated' && !prefs.statusUpdateAlerts) {
      return { sent: false, reason: 'User disabled status update alerts' };
    }
    if (type === 'action_required' && !prefs.actionRequiredAlerts) {
      return { sent: false, reason: 'User disabled action required alerts' };
    }

    const inAppAllowed = prefs.inAppNotificationsEnabled !== false;
    const emailAllowed = prefs.emailNotificationsEnabled === true && Boolean(recipientEmail);

    if (!inAppAllowed && !emailAllowed) {
      return { sent: false, reason: 'Both in-app and email channels disabled by user preferences' };
    }

    // Determine unique idempotency key
    const idempotencyKey =
      customIdempotencyKey ||
      `${userId}_${applicationId || opportunityId || 'gen'}_${type}_${intervalDays !== null ? `${intervalDays}d` : Date.now()}`;

    const { mode } = getDbStatus();

    // Prevent duplicate notification processing
    if (mode === 'mongodb') {
      const existing = await NotificationLog.findOne({ idempotencyKey });
      if (existing) {
        return { sent: false, reason: 'Duplicate notification already recorded', idempotencyKey };
      }
    } else {
      if (memoryStore.hasNotificationLog(idempotencyKey)) {
        return { sent: false, reason: 'Duplicate notification already recorded', idempotencyKey };
      }
    }

    let emailStatus = emailAllowed ? 'sent' : 'skipped';
    let errorMessage = null;

    if (emailAllowed) {
      try {
        if (this.emailEnabled && process.env.SMTP_HOST) {
          // SMTP transport simulation/integration
          console.log(`[Notification Service] Dispatched SMTP email to ${recipientEmail}: "${subject || title}"`);
        } else {
          if (process.env.NODE_ENV !== 'test') {
            console.log(`[Notification Service Preview] Email to: ${recipientEmail} | Subject: ${subject || title}`);
          }
        }
      } catch (err) {
        console.error('[Notification Service Error]:', err.message);
        emailStatus = 'failed';
        errorMessage = err.message;
      }
    }

    const resolvedTitle = title || subject || 'Opplyra Notification';
    const resolvedSubject = subject || title || 'Opplyra Notification';
    const safeRoute = this.sanitizeRoute(destinationRoute);

    const recordData = {
      userId,
      applicationId: applicationId ? applicationId.toString() : null,
      opportunityId: opportunityId ? opportunityId.toString() : null,
      type,
      category,
      title: resolvedTitle,
      subject: resolvedSubject,
      message: message || '',
      isRead: false,
      readAt: null,
      isDismissed: false,
      dismissedAt: null,
      destinationRoute: safeRoute,
      channels: {
        inApp: inAppAllowed,
        email: emailAllowed,
      },
      intervalDays,
      recipientEmail: recipientEmail || '',
      status: emailStatus,
      idempotencyKey,
      error: errorMessage,
      sentAt: new Date(),
    };

    let createdRecord = null;

    if (mode === 'mongodb') {
      try {
        createdRecord = await NotificationLog.create(recordData);
      } catch (logErr) {
        if (logErr.code === 11000) {
          return { sent: false, reason: 'Duplicate caught by unique index constraint', idempotencyKey };
        }
        console.warn('[Notification Service] Log creation error:', logErr.message);
      }
    } else {
      createdRecord = memoryStore.createNotificationLog(recordData);
    }

    return {
      sent: true,
      inAppDelivered: inAppAllowed,
      emailDelivered: emailStatus === 'sent',
      idempotencyKey,
      notification: createdRecord,
    };
  }

  /**
   * Backward-compatibility alias for sendNotification
   */
  async sendNotification(params) {
    return this.dispatchNotification(params);
  }

  // --- Specialized Event Helpers ---

  /**
   * Event: Application Tracking Created
   */
  async notifyTrackingCreated(user, application) {
    const oppTitle = application.opportunityTitle || 'Opportunity';
    return this.dispatchNotification({
      userId: user.id || user._id,
      recipientEmail: user.email,
      applicationId: application._id,
      opportunityId: application.opportunityId,
      type: 'tracking_created',
      category: 'application',
      title: 'Tracking Started',
      subject: `Tracking Started: ${oppTitle}`,
      message: `You started tracking "${oppTitle}". Keep an eye on deadlines and remember to confirm once submitted on the official portal.`,
      destinationRoute: '/app#tracker',
    });
  }

  /**
   * Event: Student Confirmed Portal Submission
   */
  async notifySubmissionConfirmed(user, application, note, externalReference) {
    const oppTitle = application.opportunityTitle || 'Opportunity';
    const refSnippet = externalReference ? ` (Ref: ${externalReference})` : '';
    return this.dispatchNotification({
      userId: user.id || user._id,
      recipientEmail: user.email,
      applicationId: application._id,
      opportunityId: application.opportunityId,
      type: 'submission_confirmed',
      category: 'application',
      title: 'Submission Confirmed',
      subject: `Submission Confirmed: ${oppTitle}${refSnippet}`,
      message: `You confirmed submitting "${oppTitle}" on the official portal.${refSnippet} Your status is now recorded as Applied.`,
      destinationRoute: '/app#tracker',
    });
  }

  /**
   * Event: Application Status Changed
   */
  async notifyStatusUpdated(user, application, previousStatus, newStatus, source = 'Manual Update', note = '') {
    if (previousStatus === newStatus) return null;

    const oppTitle = application.opportunityTitle || 'Opportunity';
    const isVerifiedSource = source === 'Official Integration';
    const sourceLabel = isVerifiedSource ? 'Verified Official Source' : (source === 'User Confirmed' ? 'Student Submission' : 'Manual Student Update');

    return this.dispatchNotification({
      userId: user.id || user._id,
      recipientEmail: user.email,
      applicationId: application._id,
      opportunityId: application.opportunityId,
      type: 'status_updated',
      category: 'application',
      title: `Status: ${newStatus}`,
      subject: `Status Update: ${oppTitle} (${newStatus})`,
      message: `Status for "${oppTitle}" changed from "${previousStatus}" to "${newStatus}". Update Source: ${sourceLabel}.${note ? ` Note: ${note}` : ''}`,
      destinationRoute: '/app#tracker',
    });
  }

  /**
   * Event: Application Marked as Requiring Action
   */
  async notifyActionRequired(user, application, source = 'Manual Update', note = '') {
    const oppTitle = application.opportunityTitle || 'Opportunity';
    return this.dispatchNotification({
      userId: user.id || user._id,
      recipientEmail: user.email,
      applicationId: application._id,
      opportunityId: application.opportunityId,
      type: 'action_required',
      category: 'action',
      title: 'Action Required',
      subject: `Action Required: ${oppTitle}`,
      message: `Action is needed on your application for "${oppTitle}". Please review instructions or submit required documents.${note ? ` Note: ${note}` : ''}`,
      destinationRoute: '/app#tracker',
    });
  }

  /**
   * Event: Approaching Deadline Reminder
   */
  async notifyDeadlineReminder(user, application, intervalDays) {
    const oppTitle = application.opportunityTitle || 'Opportunity';
    const daysLabel = intervalDays === 1 ? '1 day' : `${intervalDays} days`;
    const formattedDate = application.deadline ? new Date(application.deadline).toLocaleDateString() : 'soon';

    return this.dispatchNotification({
      userId: user.id || user._id,
      recipientEmail: user.email,
      applicationId: application._id,
      opportunityId: application.opportunityId,
      type: 'deadline_reminder',
      category: 'deadline',
      intervalDays,
      title: `Deadline in ${daysLabel}`,
      subject: `Deadline Alert: ${oppTitle} closes in ${daysLabel}`,
      message: `The deadline for "${oppTitle}" is in ${daysLabel} (${formattedDate}). Make sure to finalize and submit before it closes!`,
      destinationRoute: '/app#tracker',
      customIdempotencyKey: `${user.id || user._id}_${application._id}_deadline_reminder_${intervalDays}d`,
    });
  }

  /**
   * Event: Deadline Elapsed
   */
  async notifyDeadlinePassed(user, application) {
    const oppTitle = application.opportunityTitle || 'Opportunity';
    return this.dispatchNotification({
      userId: user.id || user._id,
      recipientEmail: user.email,
      applicationId: application._id,
      opportunityId: application.opportunityId,
      type: 'deadline_passed',
      category: 'deadline',
      title: 'Deadline Passed',
      subject: `Deadline Elapsed: ${oppTitle}`,
      message: `The deadline for "${oppTitle}" has elapsed before submission was confirmed. The status has been updated to Deadline Passed.`,
      destinationRoute: '/app#tracker',
      customIdempotencyKey: `${user.id || user._id}_${application._id}_deadline_passed`,
    });
  }
}

module.exports = new NotificationService();
