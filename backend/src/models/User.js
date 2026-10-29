const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String, // Stored as "salt:hash"
    required: true,
  },
  authProvider: {
    type: String,
    default: 'local',
  },
  role: {
    type: String,
    enum: ['student'],
    default: 'student',
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: String,
    default: 'B.Tech Computer Science',
    trim: true,
  },
  academicYear: {
    type: String,
    default: '3rd Year',
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  state: {
    type: String,
    default: '',
    trim: true,
  },
  university: {
    type: String,
    default: 'Indian Institute of Technology / State University',
    trim: true,
  },
  specialization: {
    type: String,
    default: '',
    trim: true,
  },
  semester: {
    type: String,
    default: '',
    trim: true,
  },
  graduationYear: {
    type: String,
    default: '',
    trim: true,
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 8.2,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  preferredCategories: {
    type: [String],
    default: ['Scholarships', 'Internships'],
  },
  preferredIndustries: {
    type: [String],
    default: ['Technology & Software', 'Research & Development'],
  },
  careerInterests: {
    type: [String],
    default: ['Full Stack Engineering', 'Machine Learning'],
  },
  skills: {
    type: [String],
    default: ['JavaScript', 'Python', 'React', 'Problem Solving'],
  },
  preferredLocations: {
    type: [String],
    default: ['Remote', 'Bangalore', 'Delhi NCR'],
  },
  isEmailVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
