const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');
const { hashPassword, verifyPassword } = require('./authController');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/avatars');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Fetch Current User's Profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.user?.id || 'default_student_user';
    const userEmail = req.user?.email || 'priya.sharma@college.edu';
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      let user = null;
      try {
        user = await User.findById(userId).select('-password');
      } catch {
        user = await User.findOne({ email: userEmail }).select('-password');
      }

      if (!user) {
        user = await User.findOne({ email: 'priya.sharma@college.edu' }).select('-password');
      }

      let profile = await Profile.findOne({ userId: user ? user._id.toString() : 'default_student_user' });
      if (!profile && user) {
        profile = await Profile.create({
          userId: user._id.toString(),
          fullName: user.fullName,
          course: user.course,
          academicYear: user.academicYear,
          phone: user.phone || '',
          city: user.city || '',
          state: user.state || '',
          university: user.university || 'Indian Institute of Technology / State University',
          specialization: user.specialization || '',
          semester: user.semester || '',
          graduationYear: user.graduationYear || '',
          cgpa: user.cgpa || 8.2,
          avatarUrl: user.avatarUrl || '',
          preferredCategories: user.preferredCategories || ['Scholarships', 'Internships'],
          preferredIndustries: user.preferredIndustries || ['Technology & Software'],
          careerInterests: user.careerInterests || [],
          skills: user.skills || [],
          preferredLocations: user.preferredLocations || [],
          isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : true,
        });
      }

      // Merge user & profile data
      const mergedData = {
        id: user ? user._id : 'default_student_user',
        _id: user ? user._id : 'default_student_user',
        email: user ? user.email : userEmail,
        fullName: profile?.fullName || user?.fullName || 'Priya Sharma',
        course: profile?.course || user?.course || 'B.Tech Computer Science',
        academicYear: profile?.academicYear || user?.academicYear || '3rd Year',
        phone: profile?.phone || user?.phone || '',
        city: profile?.city || user?.city || '',
        state: profile?.state || user?.state || '',
        university: profile?.university || user?.university || 'Indian Institute of Technology / State University',
        specialization: profile?.specialization || user?.specialization || '',
        semester: profile?.semester || user?.semester || '',
        graduationYear: profile?.graduationYear || user?.graduationYear || '',
        cgpa: profile?.cgpa ?? user?.cgpa ?? 8.2,
        location: profile?.location || `${profile?.city || 'Karnataka'}, India`,
        category: profile?.category || 'General',
        gender: profile?.gender || 'Female',
        avatarUrl: profile?.avatarUrl || user?.avatarUrl || '',
        preferredCategories: profile?.preferredCategories || user?.preferredCategories || ['Scholarships', 'Internships'],
        preferredIndustries: profile?.preferredIndustries || user?.preferredIndustries || ['Technology & Software'],
        careerInterests: profile?.careerInterests || user?.careerInterests || [],
        skills: profile?.skills || user?.skills || ['JavaScript', 'Python', 'React'],
        preferredLocations: profile?.preferredLocations || user?.preferredLocations || ['Remote', 'Bangalore'],
        isEmailVerified: user?.isEmailVerified !== undefined ? user.isEmailVerified : true,
        role: user?.role || 'student',
        createdAt: user?.createdAt || new Date(),
        updatedAt: profile?.updatedAt || new Date(),
      };

      return res.json({ success: true, storageMode: 'mongodb', data: mergedData });
    }

    // Memory Store mode
    const memUser = memoryStore.findUserById(userId) || memoryStore.findUserByEmail(userEmail) || memoryStore.users[0];
    const memProfile = memoryStore.getProfile();

    const merged = {
      id: memUser ? memUser._id : 'default_student_user',
      _id: memUser ? memUser._id : 'default_student_user',
      email: memUser ? memUser.email : userEmail,
      fullName: memProfile.fullName || memUser?.fullName || 'Priya Sharma',
      course: memProfile.course || memUser?.course || 'B.Tech Computer Science',
      academicYear: memProfile.academicYear || memUser?.academicYear || '3rd Year',
      phone: memProfile.phone || memUser?.phone || '+91 98765 43210',
      city: memProfile.city || memUser?.city || 'Bengaluru',
      state: memProfile.state || memUser?.state || 'Karnataka',
      university: memProfile.university || memUser?.university || 'Indian Institute of Science / State Technical University',
      specialization: memProfile.specialization || memUser?.specialization || 'Artificial Intelligence & Data Systems',
      semester: memProfile.semester || memUser?.semester || 'Semester 6',
      graduationYear: memProfile.graduationYear || memUser?.graduationYear || '2026',
      cgpa: memProfile.cgpa ?? memUser?.cgpa ?? 8.2,
      location: memProfile.location || 'Karnataka, India',
      category: memProfile.category || 'General',
      gender: memProfile.gender || 'Female',
      avatarUrl: memProfile.avatarUrl || memUser?.avatarUrl || '',
      preferredCategories: memProfile.preferredCategories || ['Scholarships', 'Internships'],
      preferredIndustries: memProfile.preferredIndustries || ['Technology & Software'],
      careerInterests: memProfile.careerInterests || ['Full Stack Engineering', 'Machine Learning'],
      skills: memProfile.skills || ['JavaScript', 'Python', 'React', 'Problem Solving'],
      preferredLocations: memProfile.preferredLocations || ['Remote', 'Bengaluru'],
      isEmailVerified: true,
      role: 'student',
      createdAt: memUser?.createdAt || new Date(),
      updatedAt: memProfile.updatedAt || new Date(),
    };

    return res.json({
      success: true,
      storageMode: 'memory',
      data: merged,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student profile.', error: err.message });
  }
}

/**
 * Update Current User's Profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user?.id || 'default_student_user';
    const userEmail = req.user?.email || 'priya.sharma@college.edu';
    const { mode } = getDbStatus();

    // Whitelist permitted editable fields
    const ALLOWED_FIELDS = [
      'fullName',
      'course',
      'academicYear',
      'phone',
      'city',
      'state',
      'university',
      'specialization',
      'semester',
      'graduationYear',
      'cgpa',
      'location',
      'category',
      'gender',
      'preferredCategories',
      'preferredIndustries',
      'careerInterests',
      'skills',
      'preferredLocations',
    ];

    const updateData = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        if (field === 'cgpa') {
          const num = parseFloat(req.body[field]);
          if (!isNaN(num) && num >= 0 && num <= 10) {
            updateData.cgpa = num;
          }
        } else if (Array.isArray(req.body[field])) {
          updateData[field] = req.body[field].filter((x) => typeof x === 'string' && x.trim());
        } else if (typeof req.body[field] === 'string') {
          updateData[field] = req.body[field].trim();
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    if (updateData.fullName !== undefined && !updateData.fullName) {
      return res.status(400).json({ success: false, message: 'Full name cannot be blank.' });
    }

    updateData.updatedAt = new Date();

    if (mode === 'mongodb') {
      let updatedUser = null;
      try {
        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');
      } catch {
        updatedUser = await User.findOneAndUpdate({ email: userEmail }, { $set: updateData }, { new: true }).select('-password');
      }

      const updatedProfile = await Profile.findOneAndUpdate(
        { userId: updatedUser ? updatedUser._id.toString() : 'default_student_user' },
        { $set: updateData },
        { new: true, upsert: true }
      );

      const mergedResponse = {
        ...updatedProfile.toObject(),
        email: updatedUser?.email || userEmail,
        id: updatedUser?._id || userId,
      };

      return res.json({ success: true, message: 'Profile updated successfully.', data: mergedResponse });
    }

    // Memory Store update
    memoryStore.updateProfile(updateData);
    if (userId) {
      memoryStore.updateUser(userId, updateData);
    }

    const updated = {
      ...memoryStore.getProfile(),
      email: userEmail,
      id: userId,
    };

    return res.json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.', error: err.message });
  }
}

/**
 * Upload Avatar (Accepts Base64 image payload)
 */
async function uploadAvatar(req, res) {
  try {
    const userId = req.user?.id || 'default_student_user';
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided.' });
    }

    // Validate MIME type
    const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    let cleanMime = mimeType;
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      if (match) {
        cleanMime = match[1].toLowerCase();
        base64Data = image.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
      }
    }

    if (!cleanMime || !ALLOWED_MIME_TYPES.includes(cleanMime)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported image format. Allowed formats: PNG, JPEG, WebP.'
      });
    }

    // Validate buffer size (Max 2MB)
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds maximum allowed limit of 2MB.'
      });
    }

    ensureUploadsDir();

    // Map extension
    const extMap = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
    };
    const ext = extMap[cleanMime] || 'png';
    const safeFilename = `avatar_${crypto.randomBytes(12).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);
    const avatarUrl = `/uploads/avatars/${safeFilename}`;

    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      try {
        await User.findByIdAndUpdate(userId, { $set: { avatarUrl } });
      } catch {
        await User.findOneAndUpdate({ email: req.user?.email }, { $set: { avatarUrl } });
      }
      await Profile.findOneAndUpdate(
        { userId: userId.toString() },
        { $set: { avatarUrl } },
        { upsert: true }
      );
    } else {
      memoryStore.updateProfile({ avatarUrl });
      memoryStore.updateUser(userId, { avatarUrl });
    }

    return res.json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      data: { avatarUrl }
    });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload profile photo.', error: err.message });
  }
}

/**
 * Remove Avatar
 */
async function removeAvatar(req, res) {
  try {
    const userId = req.user?.id || 'default_student_user';
    const { mode } = getDbStatus();

    let currentAvatarUrl = '';
    if (mode === 'mongodb') {
      let user = null;
      try {
        user = await User.findById(userId);
      } catch {
        user = await User.findOne({ email: req.user?.email });
      }
      currentAvatarUrl = user?.avatarUrl || '';

      await User.updateOne({ _id: user?._id || userId }, { $set: { avatarUrl: '' } });
      await Profile.updateOne({ userId: userId.toString() }, { $set: { avatarUrl: '' } });
    } else {
      currentAvatarUrl = memoryStore.getProfile().avatarUrl || '';
      memoryStore.updateProfile({ avatarUrl: '' });
      memoryStore.updateUser(userId, { avatarUrl: '' });
    }

    // If local file on disk, safely delete it
    if (currentAvatarUrl && currentAvatarUrl.startsWith('/uploads/avatars/')) {
      const filename = path.basename(currentAvatarUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (delErr) {
          console.warn('Could not delete old avatar file:', delErr.message);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Profile photo removed successfully.',
      data: { avatarUrl: '' }
    });
  } catch (err) {
    console.error('Error removing avatar:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove profile photo.', error: err.message });
  }
}

/**
 * Change Password
 */
async function changePassword(req, res) {
  try {
    const userId = req.user?.id || 'default_student_user';
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Please enter your current password.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const { mode } = getDbStatus();

    let user = null;
    if (mode === 'mongodb') {
      try {
        user = await User.findById(userId);
      } catch {
        user = await User.findOne({ email: req.user?.email });
      }
    } else {
      user = memoryStore.findUserById(userId) || memoryStore.findUserByEmail(req.user?.email);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const isValid = verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHashed = hashPassword(newPassword);

    if (mode === 'mongodb') {
      await User.updateOne({ _id: user._id }, { $set: { password: newHashed } });
    } else {
      memoryStore.updateUser(user._id, { password: newHashed });
    }

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.', error: err.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
};
