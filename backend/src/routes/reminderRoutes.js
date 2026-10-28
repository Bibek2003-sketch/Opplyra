const express = require("express");
const router = express.Router();
const {
  getReminders,
  createReminder,
  deleteReminder,
} = require("../controllers/reminderController");

router.get("/", getReminders);
router.post("/", createReminder);
router.delete("/:id", deleteReminder);

module.exports = router;
