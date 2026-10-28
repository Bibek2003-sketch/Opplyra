const Opportunity = require("../models/Opportunity");
const SavedOpportunity = require("../models/SavedOpportunity");
const Profile = require("../models/Profile");
const Reminder = require("../models/Reminder");
const { getDbStatus } = require("../config/db");
const memoryStore = require("../services/memoryStore");
const { evaluateEligibility } = require("../services/eligibilityService");

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

      studentProfile = await Profile.findOne({
        userId: "default_student_user",
      });
      const savedDoc = await SavedOpportunity.findOne({
        opportunityId: id,
        userId: "default_student_user",
      });
      if (savedDoc) {
        isSaved = true;
        savedStatus = savedDoc.status;
      }
    } else {
      opportunity = memoryStore.getOpportunityById(id);
      if (!opportunity) {
        return res
          .status(404)
          .json({ success: false, message: "Opportunity not found." });
      }
      studentProfile = memoryStore.getProfile();
      const savedDoc = memoryStore.isSaved(id);
      if (savedDoc) {
        isSaved = true;
        savedStatus = savedDoc.status;
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
    let totalCount = 0;
    let savedCount = 0;
    let inProgressCount = 0;
    let upcomingDeadlines = [];
    let recommended = [];

    if (mode === "mongodb") {
      totalCount = await Opportunity.countDocuments();
      const savedList = await SavedOpportunity.find({
        userId: "default_student_user",
      });
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
      const savedList = memoryStore.getSaved();
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

module.exports = {
  getOpportunities,
  getOpportunityById,
  getDashboardSummary,
};
