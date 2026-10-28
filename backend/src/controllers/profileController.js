const Profile = require('../models/Profile');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');

async function getProfile(req, res) {
  try {
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      let profile = await Profile.findOne({ userId: 'default_student_user' });
      if (!profile) {
        profile = await Profile.create({
          userId: 'default_student_user',
          fullName: 'Priya Sharma',
          course: 'B.Tech Computer Science',
          academicYear: '3rd Year',
          cgpa: 8.2,
          location: 'Karnataka, India',
          category: 'General',
          gender: 'Female',
        });
      }
      return res.json({ success: true, storageMode: 'mongodb', data: profile });
    }

    // Memory Store
    return res.json({
      success: true,
      storageMode: 'memory',
      data: memoryStore.getProfile()
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student profile.', error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { fullName, course, academicYear, cgpa, location, category, gender } = req.body;
    const { mode } = getDbStatus();

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (course !== undefined) updateData.course = course.trim();
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (cgpa !== undefined) {
      const numCgpa = parseFloat(cgpa);
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        return res.status(400).json({ success: false, message: 'CGPA must be a valid number between 0 and 10.' });
      }
      updateData.cgpa = numCgpa;
    }
    if (location !== undefined) updateData.location = location.trim();
    if (category !== undefined) updateData.category = category;
    if (gender !== undefined) updateData.gender = gender;
    updateData.updatedAt = new Date();

    if (mode === 'mongodb') {
      const profile = await Profile.findOneAndUpdate(
        { userId: 'default_student_user' },
        { $set: updateData },
        { new: true, upsert: true }
      );
      return res.json({ success: true, message: 'Profile updated successfully.', data: profile });
    }

    // Memory Store
    const updated = memoryStore.updateProfile(updateData);
    return res.json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.', error: err.message });
  }
}

module.exports = {
  getProfile,
  updateProfile
};

