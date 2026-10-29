const { Application } = require('../models/Application');
const User = require('../models/User');
const JobLock = require('../models/JobLock');
const { getDbStatus } = require('../config/db');
const memoryStore = require('./memoryStore');
const notificationService = require('./notificationService');

const INSTANCE_ID = `proc_${process.pid}_${Math.random().toString(36).substring(2, 6)}`;
const LOCK_NAME = 'opplyra_deadline_scheduler_lock';
const LOCK_TTL_MS = 4 * 60 * 1000; // 4 minutes lease

/**
 * Acquires a distributed or in-memory lock
 */
async function acquireSchedulerLock() {
  const { mode } = getDbStatus();
  const now = new Date();
  const lockExpires = new Date(now.getTime() + LOCK_TTL_MS);

  if (mode === 'mongodb') {
    try {
      const lock = await JobLock.findOneAndUpdate(
        {
          lockName: LOCK_NAME,
          $or: [{ lockedUntil: { $lt: now } }, { lockedUntil: null }, { lockedBy: INSTANCE_ID }],
        },
        {
          $set: {
            lockedUntil: lockExpires,
            lockedBy: INSTANCE_ID,
          },
        },
        { upsert: true, new: true }
      );
      return Boolean(lock);
    } catch (err) {
      // E11000 duplicate key race means another instance just acquired it
      return false;
    }
  }

  return memoryStore.acquireJobLock(LOCK_NAME, LOCK_TTL_MS, INSTANCE_ID);
}

/**
 * Releases the scheduler lock
 */
async function releaseSchedulerLock() {
  const { mode } = getDbStatus();
  if (mode === 'mongodb') {
    try {
      await JobLock.updateOne(
        { lockName: LOCK_NAME, lockedBy: INSTANCE_ID },
        { $set: { lockedUntil: null, lockedBy: null } }
      );
    } catch {
      // Silent catch
    }
  } else {
    memoryStore.releaseJobLock(LOCK_NAME, INSTANCE_ID);
  }
}

/**
 * Checks upcoming deadlines and dispatches idempotent in-app & email reminders
 */
async function checkUpcomingDeadlines() {
  const lockAcquired = await acquireSchedulerLock();
  if (!lockAcquired) {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Scheduler] Deadline check skipped: another instance is currently running.');
    }
    return { skipped: true, reason: 'Lock held by peer instance' };
  }

  const { mode } = getDbStatus();
  const now = new Date();
  const results = {
    checked: 0,
    remindersSent: 0,
    expiredUpdated: 0,
  };

  const terminalStatuses = ['Selected / Awarded', 'Rejected', 'Withdrawn', 'Deadline Passed'];

  try {
    let applications = [];

    if (mode === 'mongodb') {
      applications = await Application.find({
        status: { $nin: terminalStatuses },
        deadline: { $ne: null },
      });
    } else {
      applications = memoryStore.getApplications().filter(
        (app) => !terminalStatuses.includes(app.status) && app.deadline
      );
    }

    results.checked = applications.length;

    for (const app of applications) {
      const deadlineDate = new Date(app.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Resolve student user
      let studentUser = null;
      if (mode === 'mongodb') {
        studentUser = (await User.findById(app.userId)) || (await User.findOne({ email: app.userId }));
      } else {
        studentUser = memoryStore.findUserById(app.userId) || memoryStore.findUserByEmail(app.userId);
      }

      if (!studentUser) {
        studentUser = { id: app.userId, email: 'student@college.edu', fullName: 'Student' };
      }

      // 1. Handle passed deadlines for unsubmitted applications
      if (diffMs < 0) {
        if (['Interested', 'Application Started'].includes(app.status)) {
          const previousStatus = app.status;
          app.status = 'Deadline Passed';
          app.statusSource = 'Manual Update';
          const historyEntry = {
            previousStatus,
            newStatus: 'Deadline Passed',
            timestamp: new Date(),
            source: 'Manual Update',
            note: 'Application deadline elapsed before confirmation.',
          };

          if (mode === 'mongodb') {
            app.statusHistory.unshift(historyEntry);
            await app.save();
          } else {
            const hist = app.statusHistory || [];
            hist.unshift(historyEntry);
            memoryStore.updateApplication(app._id, {
              status: 'Deadline Passed',
              statusSource: 'Manual Update',
              statusHistory: hist,
            });
          }
          results.expiredUpdated++;

          // Dispatch in-app notification & alert
          await notificationService.notifyDeadlinePassed(studentUser, app).catch(() => {});
        }
        continue;
      }

      // 2. Check student's individual reminder preferences
      const prefs = await notificationService.getPreferences(app.userId);
      const targetIntervals = prefs.reminderIntervals || [7, 3, 1];

      if (targetIntervals.includes(diffDays)) {
        const notifyRes = await notificationService.notifyDeadlineReminder(
          studentUser,
          app,
          diffDays
        );

        if (notifyRes && notifyRes.sent) {
          results.remindersSent++;
        }
      }
    }
  } catch (err) {
    console.error('[Deadline Scheduler Error]:', err.message);
  } finally {
    await releaseSchedulerLock();
  }

  return results;
}

/**
 * Starts periodic scheduler (e.g. every 6 hours)
 */
function startScheduler(intervalMs = 6 * 60 * 60 * 1000) {
  if (process.env.NODE_ENV === 'test') return null;

  console.log('[Scheduler] Starting Application Deadline Reminder Scheduler...');
  // Initial check on boot
  checkUpcomingDeadlines()
    .then((res) => {
      if (!res.skipped) {
        console.log(`[Scheduler] Initial deadline check complete. Checked: ${res.checked}, Reminders Sent: ${res.remindersSent}`);
      }
    })
    .catch(() => {});

  const intervalId = setInterval(() => {
    checkUpcomingDeadlines()
      .then((res) => {
        if (!res.skipped) {
          console.log(`[Scheduler] Periodic deadline check complete. Reminders: ${res.remindersSent}`);
        }
      })
      .catch(() => {});
  }, intervalMs);

  return intervalId;
}

module.exports = {
  checkUpcomingDeadlines,
  startScheduler,
};
