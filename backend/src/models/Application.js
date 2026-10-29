const mongoose = require('mongoose');

const VALID_STATUSES = [
  'Interested',
  'Application Started',
  'Applied',
  'Under Review',
  'Shortlisted',
  'Selected / Awarded',
  'Rejected',
  'Action Required',
  'Withdrawn',
  'Deadline Passed',
];

const VALID_SOURCES = [
  'User Confirmed',
  'Manual Update',
  'Official Integration',
  'Email Notification',
];

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      enum: VALID_STATUSES,
      required: true,
    },
    newStatus: {
      type: String,
      enum: VALID_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: VALID_SOURCES,
      default: 'Manual Update',
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required for application tracking'],
      index: true,
      trim: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
      index: true,
    },
    opportunityTitle: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    opportunityType: {
      type: String,
      default: 'General',
      trim: true,
    },
    officialApplicationUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'Official application URL must start with http:// or https://',
      },
    },
    officialHomepageUrl: {
      type: String,
      default: null,
      trim: true,
    },
    urlVerificationStatus: {
      type: String,
      enum: ['verified', 'needs_review', 'unavailable'],
      default: 'verified',
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'Interested',
      index: true,
    },
    applicationDate: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
      index: true,
    },
    externalReference: {
      type: String,
      default: '',
      trim: true,
    },
    statusSource: {
      type: String,
      enum: VALID_SOURCES,
      default: 'Manual Update',
    },
    lastCheckedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate active tracking records for the same user & opportunity
applicationSchema.index(
  { userId: 1, opportunityId: 1 },
  { unique: true, partialFilterExpression: { opportunityId: { $type: 'objectId' } } }
);

module.exports = {
  Application: mongoose.model('Application', applicationSchema),
  VALID_STATUSES,
  VALID_SOURCES,
};

