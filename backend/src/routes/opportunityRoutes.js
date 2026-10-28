const express = require("express");
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  getDashboardSummary,
} = require("../controllers/opportunityController");

router.get("/", getOpportunities);
router.get("/dashboard-summary", getDashboardSummary);
router.get("/:id", getOpportunityById);

module.exports = router;
