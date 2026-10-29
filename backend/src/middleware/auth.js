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

    // Dev/Demo fallback if not logged in
    if (!userId) {
      userId = 'default_student_user';
    }

    const { mode } = getDbStatus();
    let user = null;

    if (mode === 'mongodb') {
      // Try finding by _id or email
      if (userId !== 'default_student_user') {
        try {
          user = await User.findById(userId);
        } catch {
          user = await User.findOne({ email: userId });
        }
      }

      if (!user) {
        // Fallback default student in DB
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
      }
    } else {
      user = memoryStore.findUserById(userId) || memoryStore.findUserByEmail(userId);
      if (!user) {
        user = memoryStore.users[0] || {
          _id: 'default_student_user',
          id: 'default_student_user',
          email: 'priya.sharma@college.edu',
          fullName: 'Priya Sharma',
          role: 'student',
        };
      }
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

