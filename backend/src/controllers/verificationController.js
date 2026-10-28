const { analyzeAnnouncement } = require("../services/ruleEngine");

async function verifyAnnouncement(req, res) {
  try {
    const { text, url } = req.body;

    if (!text && !url) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide either announcement text or a target announcement URL for verification.",
      });
    }

    if (text && typeof text === "string" && text.length > 25000) {
      return res.status(400).json({
        success: false,
        message:
          "Announcement text exceeds maximum allowed size of 25,000 characters.",
      });
    }

    // Run deterministic empirical rule analysis
    const result = analyzeAnnouncement({ text, url });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error verifying announcement:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to complete verification analysis.",
      error: err.message,
    });
  }
}

module.exports = {
  verifyAnnouncement,
};
