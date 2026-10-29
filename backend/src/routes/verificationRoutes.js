const express = require('express');
const router = express.Router();
const { verifyAnnouncement, getExamples } = require('../controllers/verificationController');

router.post('/check', verifyAnnouncement);
router.get('/examples', getExamples);

module.exports = router;
