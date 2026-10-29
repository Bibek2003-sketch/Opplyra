const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

async function register(req, res) {
  try {
    const { email, password, fullName, course, academicYear } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanCourse = (course && course.trim()) || 'B.Tech Computer Science';
    const cleanYear = academicYear || '3rd Year';

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.'
        });
      }

      const hashedPassword = hashPassword(password);
      const user = await User.create({
        email: cleanEmail,
        password: hashedPassword,
        fullName: cleanName,
        course: cleanCourse,
        academicYear: cleanYear,
        authProvider: 'local',
        role: 'student',
      });

      // Synchronize with student profile
      await Profile.findOneAndUpdate(
        { userId: 'default_student_user' },
        {
          $set: {
            fullName: cleanName,
            course: cleanCourse,
            academicYear: cleanYear,
            updatedAt: new Date(),
          }
        },
        { upsert: true }
      );

      return res.status(201).json({
        success: true,
        message: 'Student account registered successfully in database.',
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            course: user.course,
            academicYear: user.academicYear,
            role: user.role || 'student',
            authProvider: 'local',
            createdAt: user.createdAt,
          }
        }
      });
    }

    // Memory Store
    const existing = memoryStore.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    const hashedPassword = hashPassword(password);
    const user = memoryStore.createUser({
      email: cleanEmail,
      password: hashedPassword,
      fullName: cleanName,
      course: cleanCourse,
      academicYear: cleanYear,
      authProvider: 'local',
      role: 'student',
    });

    memoryStore.updateProfile({
      fullName: cleanName,
      course: cleanCourse,
      academicYear: cleanYear,
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          course: user.course,
          academicYear: user.academicYear,
          role: user.role || 'student',
          authProvider: 'local',
          createdAt: user.createdAt,
        }
      }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error. Please try again.',
      error: err.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const { mode } = getDbStatus();

    let user = null;

    if (mode === 'mongodb') {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email in the database. Please check your email or create an account.'
      });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    return res.json({
      success: true,
      message: 'Sign in successful.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          course: user.course,
          academicYear: user.academicYear,
          role: user.role || 'student',
          authProvider: user.authProvider || 'local',
          createdAt: user.createdAt,
        }
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to a server error. Please try again.',
      error: err.message
    });
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  register,
  login,
};
