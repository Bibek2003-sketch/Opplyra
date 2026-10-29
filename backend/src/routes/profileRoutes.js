const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
} = require('../controllers/profileController');

// All profile endpoints are protected by student authentication
router.use(authenticateUser);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', uploadAvatar);
router.delete('/avatar', removeAvatar);
router.post('/change-password', changePassword);

module.exports = router;
