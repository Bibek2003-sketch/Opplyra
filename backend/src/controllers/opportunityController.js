const Opportunity = require("../models/Opportunity");
const SavedOpportunity = require("../models/SavedOpportunity");
const Profile = require("../models/Profile");
const Reminder = require("../models/Reminder");
const BrokenLinkReport = require("../models/BrokenLinkReport");
const { getDbStatus } = require("../config/db");
const memoryStore = require("../services/memoryStore");
const { evaluateEligibility } = require("../services/eligibilityService");
const { checkUrlReachability, validateUrlFormat } = require("../services/linkHealthService");

// Get all opportunities with search and filter
async function getOpportunities(req, res) {
  try {
    const { category, search, sort = "deadline_asc" } = req.query;
    const { mode } = getDbStatus();

    if (mode === "mongodb") {
      const filter = {};
      if (category && category !== "All") {
        filter.category = category;
      }
      if (search && search.trim()) {
        const queryRegex = new RegExp(search.trim(), "i");
        filter.$or = [
          { title: queryRegex },
          { organization: queryRegex },
          { shortDescription: queryRegex },
          { tags: queryRegex },
        ];
      }

      let query = Opportunity.find(filter);
      if (sort === "deadline_asc") {
        query = query.sort({ deadline: 1 });
      } else if (sort === "deadline_desc") {
        query = query.sort({ deadline: -1 });
      } else {
        query = query.sort({ createdAt: -1 });
      }

      const opportunities = await query.exec();
      return res.json({
        success: true,
        count: opportunities.length,
        storageMode: "mongodb",
        data: opportunities,
      });
    }

    // Memory store fallback
    const list = memoryStore.getOpportunities({ search, category, sort });
    return res.json({
      success: true,
      count: list.length,
      storageMode: "memory",
      data: list,
    });
  } catch (err) {
    console.error("Error fetching opportunities:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve opportunities.",
      error: err.message,
    });
  }
}

// Get single opportunity detail with eligibility evaluation
async function getOpportunityById(req, res) {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();
    const activeUserId = req.headers['x-user-id'] || req.user?.id || null;

    let opportunity = null;
    let studentProfile = null;
    let isSaved = false;
    let savedStatus = null;

    if (mode === "mongodb") {
      opportunity = await Opportunity.findById(id);
      if (!opportunity) {
        return res
          .status(404)
          .json({ success: false, message: "Opportunity not found." });
      }

      if (activeUserId) {
        studentProfile = await Profile.findOne({
          userId: activeUserId,
        });
        const savedDoc = await SavedOpportunity.findOne({
          opportunityId: id,
          userId: activeUserId,
        });
        if (savedDoc) {
          isSaved = true;
          savedStatus = savedDoc.status;
        }
      }
    } else {
      opportunity = memoryStore.getOpportunityById(id);
      if (!opportunity) {
        return res
          .status(404)
          .json({ success: false, message: "Opportunity not found." });
      }
      if (activeUserId) {
        studentProfile = memoryStore.getProfile(activeUserId);
        const savedDoc = memoryStore.isSaved(id, activeUserId);
        if (savedDoc) {
          isSaved = true;
          savedStatus = savedDoc.status;
        }
      }
    }

    const eligibilityResult = evaluateEligibility(studentProfile, opportunity);

    return res.json({
      success: true,
      data: {
        ...(opportunity.toObject ? opportunity.toObject() : opportunity),
        isSaved,
        savedStatus,
        eligibility: eligibilityResult,
      },
    });
  } catch (err) {
    console.error("Error fetching opportunity detail:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve opportunity details.",
      error: err.message,
    });
  }
}

// Get Dashboard Summary
async function getDashboardSummary(req, res) {
  try {
    const { mode } = getDbStatus();
    const activeUserId = req.headers['x-user-id'] || req.user?.id || null;
    let totalCount = 0;
    let savedCount = 0;
    let inProgressCount = 0;
    let upcomingDeadlines = [];
    let recommended = [];

    if (mode === "mongodb") {
      totalCount = await Opportunity.countDocuments();
      let savedList = [];
      if (activeUserId) {
        savedList = await SavedOpportunity.find({
          userId: activeUserId,
        });
      }
      savedCount = savedList.length;
      inProgressCount = savedList.filter((s) =>
        ["Interested", "Preparing", "Applied"].includes(s.status),
      ).length;

      upcomingDeadlines = await Opportunity.find({
        deadline: { $gte: new Date() },
      })
        .sort({ deadline: 1 })
        .limit(4)
        .select("title organization category deadline stipendOrAward");

      recommended = await Opportunity.find({})
        .limit(3)
        .select(
          "title organization category shortDescription deadline stipendOrAward tags isDemonstration",
        );
    } else {
      const all = memoryStore.opportunities;
      totalCount = all.length;
      const savedList = activeUserId ? memoryStore.getSaved(activeUserId) : [];
      savedCount = savedList.length;
      inProgressCount = savedList.filter((s) =>
        ["Interested", "Preparing", "Applied"].includes(s.status),
      ).length;

      upcomingDeadlines = all
        .filter((o) => new Date(o.deadline) >= new Date())
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 4);

      recommended = all.slice(0, 3);
    }

    return res.json({
      success: true,
      storageMode: mode,
      data: {
        totalOpportunities: totalCount,
        savedCount,
        inProgressCount,
        upcomingDeadlines,
        recommended,
      },
    });
  } catch (err) {
    console.error("Error in getDashboardSummary:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary.",
      error: err.message,
    });
  }
}

/**
 * Checks reachability and verification state of an opportunity's official application link
 * GET /api/opportunities/:id/check-link
 */
async function checkOpportunityLink(req, res) {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();
    let opportunity = null;

    if (mode === "mongodb") {
      opportunity = await Opportunity.findById(id);
    } else {
      opportunity = memoryStore.getOpportunityById(id);
    }

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    const targetUrl = opportunity.sourceUrl;
    const checkResult = await checkUrlReachability(targetUrl);

    // Save health check result
    if (mode === "mongodb") {
      opportunity.lastHealthCheckAt = new Date();
      opportunity.lastHealthStatus = checkResult.status;
      await opportunity.save();
    } else {
      opportunity.lastHealthCheckAt = new Date();
      opportunity.lastHealthStatus = checkResult.status;
    }

    return res.json({
      success: true,
      data: {
        opportunityId: opportunity._id,
        targetUrl,
        officialHomepageUrl: opportunity.officialHomepageUrl,
        organization: opportunity.organization,
        urlVerificationStatus: opportunity.urlVerificationStatus || 'verified',
        ...checkResult,
      },
    });
  } catch (err) {
    console.error("Error checking opportunity link:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify opportunity application link.",
      error: err.message,
    });
  }
}

/**
 * Records a student report for a broken, outdated, or unreachable application link
 * POST /api/opportunities/:id/report-link
 */
async function reportOpportunityLink(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'page_not_found', comments = '' } = req.body;
    const userId = req.user ? (req.user.id || req.user._id) : 'student_user';
    const { mode } = getDbStatus();

    let opportunity = null;
    if (mode === "mongodb") {
      opportunity = await Opportunity.findById(id);
    } else {
      opportunity = memoryStore.getOpportunityById(id);
    }

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    const reportData = {
      userId,
      opportunityId: id,
      targetUrl: opportunity.sourceUrl,
      organization: opportunity.organization,
      reason,
      comments: comments ? comments.trim().substring(0, 1000) : '',
      status: 'pending',
      reportedAt: new Date(),
    };

    if (mode === "mongodb") {
      await BrokenLinkReport.create(reportData);
      opportunity.brokenLinkReportCount = (opportunity.brokenLinkReportCount || 0) + 1;
      await opportunity.save();
    } else {
      memoryStore.createBrokenLinkReport(reportData);
    }

    return res.json({
      success: true,
      message: "Thank you for reporting. Our team has flagged this link for review.",
    });
  } catch (err) {
    console.error("Error reporting broken opportunity link:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to record broken link report.",
      error: err.message,
    });
  }
}

module.exports = {
  getOpportunities,
  getOpportunityById,
  getDashboardSummary,
  checkOpportunityLink,
  reportOpportunityLink,
};
