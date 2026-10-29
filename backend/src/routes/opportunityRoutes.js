const express = require("express");
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  getDashboardSummary,
  checkOpportunityLink,
  reportOpportunityLink,
} = require("../controllers/opportunityController");

router.get("/", getOpportunities);
router.get("/dashboard-summary", getDashboardSummary);
router.get("/:id", getOpportunityById);
router.get("/:id/check-link", checkOpportunityLink);
router.post("/:id/report-link", reportOpportunityLink);

module.exports = router;
