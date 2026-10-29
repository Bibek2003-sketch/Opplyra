const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    applicationId: {
      type: String,
      default: null,
      index: true,
    },
    opportunityId: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'tracking_created',
        'deadline_reminder',
        'status_updated',
        'action_required',
        'submission_confirmed',
        'deadline_passed',
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ['application', 'deadline', 'action', 'system'],
      default: 'application',
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDismissed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    destinationRoute: {
      type: String,
      default: '/app#tracker',
    },
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
    },
    intervalDays: {
      type: Number,
      default: null,
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      default: 'sent',
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    error: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal notification queries
notificationLogSchema.index({ userId: 1, isDismissed: 1, createdAt: -1 });
notificationLogSchema.index({ userId: 1, isRead: 1, isDismissed: 1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);

