const mongoose = require('mongoose');

const jobLockSchema = new mongoose.Schema(
  {
    lockName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobLock', jobLockSchema);

