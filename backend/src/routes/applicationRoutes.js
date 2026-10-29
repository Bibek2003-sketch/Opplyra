const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

// All application tracking routes require authenticated student identity
router.use(authenticateUser);

router.post('/', applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.get('/summary', applicationController.getApplicationSummary);
router.get('/preferences', applicationController.getNotificationPreferences);
router.put('/preferences', applicationController.updateNotificationPreferences);
router.post('/check-deadlines', applicationController.triggerDeadlineCheck);
router.get('/:id', applicationController.getApplicationById);
router.get('/:id/check-link', applicationController.checkApplicationLink);
router.post('/:id/report-link', applicationController.reportApplicationLink);
router.patch('/:id/status', applicationController.updateApplicationStatus);
router.patch('/:id', applicationController.updateApplicationDetails);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;

