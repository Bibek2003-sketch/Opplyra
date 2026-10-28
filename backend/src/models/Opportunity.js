const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Opportunity title is required'],
    trim: true,
  },
  organization: {
    type: String,
    required: [true, 'Issuing organization is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Scholarships', 'Internships', 'Competitive Examinations', 'Jobs & Training'],
  },
  type: {
    type: String,
    default: 'General',
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
  },
  fullDescription: {
    type: String,
    required: [true, 'Full description is required'],
  },
  eligibilitySummary: {
    type: String,
    required: [true, 'Eligibility summary is required'],
  },
  eligibilityCriteria: {
    coursesAllowed: [{ type: String }],
    academicYearsAllowed: [{ type: String }],
    minimumCgpa: { type: Number, default: null },
    locationsAllowed: [{ type: String }],
    genderPreference: { type: String, default: 'All' },
    ageLimitMax: { type: Number, default: null },
    incomeCeiling: { type: String, default: null }
  },
  requiredDocuments: [{ type: String }],
  stipendOrAward: { type: String, default: 'Not specified' },
  deadline: {
    type: Date,
    required: [true, 'Deadline date is required'],
  },
  sourceUrl: {
    type: String,
    required: [true, 'Original source URL is required'],
  },
  sourceTimestamp: {
    type: Date,
    default: Date.now,
  },
  isDemonstration: {
    type: Boolean,
    default: true,
  },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexing for search
opportunitySchema.index({ title: 'text', organization: 'text', shortDescription: 'text', tags: 'text' });
opportunitySchema.index({ category: 1, deadline: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);

