const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default_student_user',
    unique: true,
  },
  fullName: {
    type: String,
    default: 'Priya Sharma',
    trim: true,
  },
  course: {
    type: String,
    default: 'B.Tech Computer Science',
    trim: true,
  },
  academicYear: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduates', 'Postgraduate'],
    default: '3rd Year',
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 8.2,
  },
  location: {
    type: String,
    default: 'Karnataka, India',
    trim: true,
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    default: 'General',
  },
  gender: {
    type: String,
    enum: ['Female', 'Male', 'Non-Binary', 'Prefer not to say'],
    default: 'Female',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Profile', profileSchema);

