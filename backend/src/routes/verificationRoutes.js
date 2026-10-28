const express = require("express");
const router = express.Router();
const { verifyAnnouncement } = require("../controllers/verificationController");

router.post("/check", verifyAnnouncement);

module.exports = router;
