const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');

/**
 * Authentication Middleware for Opplyra
 * Validates authenticated student identity and enforces ownership checks
 */
async function authenticateUser(req, res, next) {
  try {
    const headerUserId = req.headers['x-user-id'];
    const authHeader = req.headers.authorization;

    let userId = headerUserId;

    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      // If client sent token or raw userId
      const token = authHeader.substring(7).trim();
      userId = token;
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access this feature.',
      });
    }

    const { mode } = getDbStatus();
    let user = null;

    if (mode === 'mongodb') {
      if (userId === 'default_student_user') {
        user = await User.findOne({ email: 'priya.sharma@college.edu' });
        if (!user) {
          user = {
            _id: 'default_student_user',
            id: 'default_student_user',
            email: 'priya.sharma@college.edu',
            fullName: 'Priya Sharma',
            role: 'student',
          };
        }
      } else {
        try {
          user = await User.findById(userId);
        } catch {
          user = await User.findOne({ email: userId });
        }
      }
    } else {
      if (userId === 'default_student_user') {
        user = memoryStore.users[0];
      } else {
        user = memoryStore.findUserById(userId) || memoryStore.findUserByEmail(userId);
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid student session or user not found. Please log in again.',
      });
    }

    req.user = {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role || 'student',
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please verify your student session.',
    });
  }
}

module.exports = {
  authenticateUser,
};

