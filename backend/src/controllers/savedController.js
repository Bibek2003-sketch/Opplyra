const SavedOpportunity = require("../models/SavedOpportunity");
const Opportunity = require("../models/Opportunity");
const { getDbStatus } = require("../config/db");
const memoryStore = require("../services/memoryStore");

// List all saved opportunities for user
async function getSavedOpportunities(req, res) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'default_student_user';
    const { status } = req.query;
    const { mode } = getDbStatus();

    if (mode === "mongodb") {
      const filter = { userId };
      if (status && status !== "All") {
        filter.status = status;
      }
      const saved = await SavedOpportunity.find(filter)
        .populate("opportunityId")
        .sort({ updatedAt: -1 });

      const formatted = saved.map((s) => ({
        _id: s._id,
        opportunityId: s.opportunityId ? s.opportunityId._id : null,
        opportunity: s.opportunityId,
        status: s.status,
        notes: s.notes,
        savedAt: s.savedAt,
        updatedAt: s.updatedAt,
      }));

      return res.json({
        success: true,
        count: formatted.length,
        storageMode: "mongodb",
        data: formatted,
      });
    }

    // Memory Store
    let list = memoryStore.getSaved(userId);
    if (status && status !== "All") {
      list = list.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return res.json({
      success: true,
      count: list.length,
      storageMode: "memory",
      data: list,
    });
  } catch (err) {
    console.error("Error fetching saved opportunities:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve saved opportunities.",
      error: err.message,
    });
  }
}

// Save or toggle an opportunity
async function saveOpportunity(req, res) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'default_student_user';
    const { opportunityId, status = "Interested", notes = "" } = req.body;
    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        message: "opportunityId is required in request body.",
      });
    }

    const { mode } = getDbStatus();

    if (mode === "mongodb") {
      const opp = await Opportunity.findById(opportunityId);
      if (!opp) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found in database.",
        });
      }

      let saved = await SavedOpportunity.findOne({
        userId,
        opportunityId,
      });

      if (saved) {
        // Update if already saved
        saved.status = status;
        if (notes) saved.notes = notes;
        saved.updatedAt = new Date();
        await saved.save();
      } else {
        saved = await SavedOpportunity.create({
          userId,
          opportunityId,
          status,
          notes,
          savedAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const populated = await SavedOpportunity.findById(saved._id).populate(
        "opportunityId",
      );

      return res.status(201).json({
        success: true,
        message: "Opportunity successfully saved to tracker.",
        data: populated,
      });
    }

    // Memory Store
    const savedItem = memoryStore.saveOpportunity(opportunityId, status, notes, userId);
    if (!savedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Opportunity not found." });
    }

    return res.status(201).json({
      success: true,
      message: "Opportunity successfully saved to tracker.",
      data: savedItem,
    });
  } catch (err) {
    console.error("Error saving opportunity:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save opportunity.",
      error: err.message,
    });
  }
}

// Update application status
async function updateSavedStatus(req, res) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'default_student_user';
    const { opportunityId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["Interested", "Preparing", "Applied", "Completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const { mode } = getDbStatus();

    if (mode === "mongodb") {
      const saved = await SavedOpportunity.findOne({
        userId,
        opportunityId,
      });

      if (!saved) {
        return res.status(404).json({
          success: false,
          message: "Saved opportunity record not found.",
        });
      }

      if (status) saved.status = status;
      if (notes !== undefined) saved.notes = notes;
      saved.updatedAt = new Date();
      await saved.save();

      const populated = await SavedOpportunity.findById(saved._id).populate(
        "opportunityId",
      );
      return res.json({
        success: true,
        message: "Application status updated.",
        data: populated,
      });
    }

    // Memory Store
    const updated = memoryStore.updateSavedStatus(opportunityId, status, notes, userId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Saved opportunity record not found.",
      });
    }

    return res.json({
      success: true,
      message: "Application status updated.",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status.",
      error: err.message,
    });
  }
}

// Remove from saved
async function removeSavedOpportunity(req, res) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'default_student_user';
    const { opportunityId } = req.params;
    const { mode } = getDbStatus();

    if (mode === "mongodb") {
      const result = await SavedOpportunity.findOneAndDelete({
        userId,
        opportunityId,
      });

      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "Item was not saved." });
      }

      return res.json({
        success: true,
        message: "Opportunity removed from saved list.",
      });
    }

    // Memory Store
    const removed = memoryStore.removeSaved(opportunityId, userId);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "Item was not saved." });
    }

    return res.json({
      success: true,
      message: "Opportunity removed from saved list.",
    });
  } catch (err) {
    console.error("Error removing saved opportunity:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to remove saved opportunity.",
      error: err.message,
    });
  }
}

module.exports = {
  getSavedOpportunities,
  saveOpportunity,
  updateSavedStatus,
  removeSavedOpportunity,
};
