const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  userId: {
    type: String,
    default: 'default_student_user',
    index: true,
  },
  offset: {
    type: String,
    enum: ['7_days_before', '1_day_before', '1_hour_before'],
    required: true,
  },
  offsetLabel: {
    type: String,
    default: '7 days before deadline',
  },
  triggerAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Simulated_Delivered', 'Dismissed'],
    default: 'Scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

reminderSchema.index({ userId: 1, opportunityId: 1, offset: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);

