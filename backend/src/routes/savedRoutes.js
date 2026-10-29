const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getSavedOpportunities,
  saveOpportunity,
  updateSavedStatus,
  removeSavedOpportunity
} = require('../controllers/savedController');

// All saved routes require authenticated student identity
router.use(authenticateUser);

router.get('/', getSavedOpportunities);
router.post('/', saveOpportunity);
router.patch('/:opportunityId', updateSavedStatus);
router.delete('/:opportunityId', removeSavedOpportunity);

module.exports = router;

