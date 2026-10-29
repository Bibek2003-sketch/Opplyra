const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    inAppNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    deadlineReminderAlerts: {
      type: Boolean,
      default: true,
    },
    reminderIntervals: {
      type: [Number],
      default: [7, 3, 1], // Remind 7 days, 3 days, and 1 day before deadline
    },
    statusUpdateAlerts: {
      type: Boolean,
      default: true,
    },
    actionRequiredAlerts: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);

