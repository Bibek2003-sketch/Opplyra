const express = require('express');
const router = express.Router();
const {
  getSavedOpportunities,
  saveOpportunity,
  updateSavedStatus,
  removeSavedOpportunity
} = require('../controllers/savedController');

router.get('/', getSavedOpportunities);
router.post('/', saveOpportunity);
router.patch('/:opportunityId', updateSavedStatus);
router.delete('/:opportunityId', removeSavedOpportunity);

module.exports = router;

