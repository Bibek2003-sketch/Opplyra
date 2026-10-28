const Reminder = require('../models/Reminder');
const Opportunity = require('../models/Opportunity');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');

const OFFSET_MAP = {
  '7_days_before': { ms: 7 * 24 * 60 * 60 * 1000, label: '7 days before deadline' },
  '1_day_before': { ms: 24 * 60 * 60 * 1000, label: '1 day before deadline' },
  '1_hour_before': { ms: 60 * 60 * 1000, label: '1 hour before deadline' }
};

// Retrieve all reminders configured by student
async function getReminders(req, res) {
  try {
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const reminders = await Reminder.find({ userId: 'default_student_user' })
        .populate('opportunityId')
        .sort({ triggerAt: 1 });

      const now = Date.now();
      const formatted = reminders.map(r => {
        let currentStatus = r.status;
        // Check if scheduled time has passed
        if (currentStatus === 'Scheduled' && new Date(r.triggerAt).getTime() <= now) {
          currentStatus = 'Simulated_Delivered';
        }

        return {
          _id: r._id,
          opportunityId: r.opportunityId ? r.opportunityId._id : null,
          opportunity: r.opportunityId,
          offset: r.offset,
          offsetLabel: r.offsetLabel,
          triggerAt: r.triggerAt,
          status: currentStatus,
          createdAt: r.createdAt
        };
      });

      return res.json({
        success: true,
        count: formatted.length,
        storageMode: 'mongodb',
        data: formatted
      });
    }

    // Memory Store
    const now = Date.now();
    const list = memoryStore.getReminders().map(r => {
      let currentStatus = r.status;
      if (currentStatus === 'Scheduled' && new Date(r.triggerAt).getTime() <= now) {
        currentStatus = 'Simulated_Delivered';
      }
      return {
        ...r,
        status: currentStatus
      };
    });

    return res.json({
      success: true,
      count: list.length,
      storageMode: 'memory',
      data: list
    });
  } catch (err) {
    console.error('Error fetching reminders:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reminders.', error: err.message });
  }
}

// Create or update a deadline reminder
async function createReminder(req, res) {
  try {
    const { opportunityId, offset } = req.body;

    if (!opportunityId || !offset) {
      return res.status(400).json({
        success: false,
        message: 'Both opportunityId and offset are required.'
      });
    }

    if (!OFFSET_MAP[offset]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offset. Allowed values: 7_days_before, 1_day_before, 1_hour_before.'
      });
    }

    const { mode } = getDbStatus();
    const offsetConfig = OFFSET_MAP[offset];

    if (mode === 'mongodb') {
      const opp = await Opportunity.findById(opportunityId);
      if (!opp) {
        return res.status(404).json({ success: false, message: 'Opportunity not found.' });
      }

      const deadlineMs = new Date(opp.deadline).getTime();
      const triggerAt = new Date(Math.max(Date.now(), deadlineMs - offsetConfig.ms));

      const reminder = await Reminder.findOneAndUpdate(
        { userId: 'default_student_user', opportunityId, offset },
        {
          $set: {
            offsetLabel: offsetConfig.label,
            triggerAt,
            status: 'Scheduled',
            createdAt: new Date()
          }
        },
        { new: true, upsert: true }
      ).populate('opportunityId');

      return res.status(201).json({
        success: true,
        message: `Reminder scheduled for ${offsetConfig.label}.`,
        data: reminder
      });
    }

    // Memory Store
    const reminder = memoryStore.createReminder(opportunityId, offset);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    return res.status(201).json({
      success: true,
      message: `Reminder scheduled for ${offsetConfig.label}.`,
      data: reminder
    });
  } catch (err) {
    console.error('Error creating reminder:', err);
    return res.status(500).json({ success: false, message: 'Failed to schedule reminder.', error: err.message });
  }
}

// Delete reminder
async function deleteReminder(req, res) {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const result = await Reminder.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Reminder record not found.' });
      }
      return res.json({ success: true, message: 'Reminder deleted.' });
    }

    const deleted = memoryStore.deleteReminder(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reminder record not found.' });
    }
    return res.json({ success: true, message: 'Reminder deleted.' });
  } catch (err) {
    console.error('Error deleting reminder:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete reminder.', error: err.message });
  }
}

module.exports = {
  getReminders,
  createReminder,
  deleteReminder
};

