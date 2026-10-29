const mongoose = require('mongoose');

const brokenLinkReportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'anonymous',
      index: true,
    },
    opportunityId: {
      type: String,
      default: null,
      index: true,
    },
    applicationId: {
      type: String,
      default: null,
      index: true,
    },
    targetUrl: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      enum: [
        'page_not_found',
        'unreachable',
        'invalid_scheme',
        'unverified',
        'login_blocked',
        'expired_deadline',
        'other',
      ],
      default: 'page_not_found',
    },
    comments: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BrokenLinkReport', brokenLinkReportSchema);

