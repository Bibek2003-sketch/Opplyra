const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
  getReminders,
  createReminder,
  deleteReminder,
} = require("../controllers/reminderController");

// All reminder routes require authenticated student identity
router.use(authenticateUser);

router.get("/", getReminders);
router.post("/", createReminder);
router.delete("/:id", deleteReminder);

module.exports = router;
