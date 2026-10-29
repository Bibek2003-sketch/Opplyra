const { analyzeAnnouncement } = require('../services/ruleEngine');
const { DEMONSTRATION_EXAMPLES } = require('../data/fraudExamples');

async function verifyAnnouncement(req, res) {
  try {
    const { text = '', url = '' } = req.body;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    const trimmedUrl = typeof url === 'string' ? url.trim() : '';

    if (!trimmedText && !trimmedUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either announcement text or a target announcement URL for verification.',
      });
    }

    if (trimmedText && trimmedText.length > 25000) {
      return res.status(400).json({
        success: false,
        message: 'Announcement text exceeds maximum allowed size of 25,000 characters.',
      });
    }

    if (trimmedUrl && trimmedUrl.length > 2048) {
      return res.status(400).json({
        success: false,
        message: 'Target URL exceeds maximum allowed length of 2,048 characters.',
      });
    }

    // Run explainable, deterministic analysis
    const result = analyzeAnnouncement({ text: trimmedText, url: trimmedUrl });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[Verification Controller Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete verification analysis.',
      error: err.message,
    });
  }
}

async function getExamples(req, res) {
  return res.json({
    success: true,
    data: DEMONSTRATION_EXAMPLES,
  });
}

module.exports = {
  verifyAnnouncement,
  getExamples,
};
