const mongoose = require("mongoose");

const savedOpportunitySchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: true,
  },
  userId: {
    type: String,
    default: "default_student_user",
    index: true,
  },
  status: {
    type: String,
    enum: ["Interested", "Preparing", "Applied", "Completed"],
    default: "Interested",
  },
  notes: {
    type: String,
    default: "",
    maxlength: 1000,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

savedOpportunitySchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model("SavedOpportunity", savedOpportunitySchema);
