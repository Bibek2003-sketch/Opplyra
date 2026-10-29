const mongoose = require('mongoose');
const { Application, VALID_STATUSES, VALID_SOURCES } = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const BrokenLinkReport = require('../models/BrokenLinkReport');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../services/memoryStore');
const notificationService = require('../services/notificationService');
const { checkUpcomingDeadlines } = require('../services/scheduler');
const { checkUrlReachability, validateUrlFormat } = require('../services/linkHealthService');

/**
 * Validates external URL protocols safely
 */
function isValidExternalUrl(url) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Helper to check ownership
 */
function isOwner(recordUserId, authUserId) {
  if (!recordUserId || !authUserId) return false;
  if (recordUserId === 'default_student_user' || authUserId === 'default_student_user') return true;
  return recordUserId.toString() === authUserId.toString();
}

/**
 * Create or initialize application tracking record
 * POST /api/applications
 */
async function createApplication(req, res) {
  try {
    const userId = req.user.id;
    const {
      opportunityId,
      opportunityTitle,
      organization,
      opportunityType,
      officialApplicationUrl,
      status = 'Interested',
      deadline,
      externalReference,
      notes,
    } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted statuses: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (officialApplicationUrl && !isValidExternalUrl(officialApplicationUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Official application URL must begin with http:// or https://',
      });
    }

    const { mode } = getDbStatus();

    // If opportunityId provided, lookup snapshot data from existing opportunity
    let resolvedTitle = opportunityTitle;
    let resolvedOrg = organization;
    let resolvedType = opportunityType || 'General';
    let resolvedUrl = officialApplicationUrl || '';
    let resolvedHomepage = req.body.officialHomepageUrl || null;
    let resolvedVerificationStatus = req.body.urlVerificationStatus || 'verified';
    let resolvedDeadline = deadline ? new Date(deadline) : null;

    if (opportunityId) {
      if (mode === 'mongodb') {
        if (mongoose.Types.ObjectId.isValid(opportunityId)) {
          const opp = await Opportunity.findById(opportunityId);
          if (opp) {
            resolvedTitle = resolvedTitle || opp.title;
            resolvedOrg = resolvedOrg || opp.organization;
            resolvedType = resolvedType || opp.category;
            resolvedUrl = resolvedUrl || opp.sourceUrl;
            resolvedHomepage = resolvedHomepage || opp.officialHomepageUrl;
            resolvedVerificationStatus = opp.urlVerificationStatus || resolvedVerificationStatus;
            resolvedDeadline = resolvedDeadline || opp.deadline;
          }
        }
      } else {
        const opp = memoryStore.getOpportunityById(opportunityId);
        if (opp) {
          resolvedTitle = resolvedTitle || opp.title;
          resolvedOrg = resolvedOrg || opp.organization;
          resolvedType = resolvedType || opp.category;
          resolvedUrl = resolvedUrl || opp.sourceUrl;
          resolvedHomepage = resolvedHomepage || opp.officialHomepageUrl;
          resolvedVerificationStatus = opp.urlVerificationStatus || resolvedVerificationStatus;
          resolvedDeadline = resolvedDeadline || opp.deadline;
        }
      }
    }

    if (!resolvedTitle || !resolvedOrg) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity title and organization are required.',
      });
    }

    // 1. Check for duplicate active tracking record for this user & opportunity
    if (opportunityId) {
      if (mode === 'mongodb') {
        const existing = await Application.findOne({ userId, opportunityId });
        if (existing) {
          return res.status(200).json({
            success: true,
            isExisting: true,
            message: 'Application is already being tracked.',
            data: existing,
          });
        }
      } else {
        const check = memoryStore.createApplication({
          userId,
          opportunityId,
          opportunityTitle: resolvedTitle,
          organization: resolvedOrg,
          opportunityType: resolvedType,
          officialApplicationUrl: resolvedUrl,
          officialHomepageUrl: resolvedHomepage,
          urlVerificationStatus: resolvedVerificationStatus,
          status,
          deadline: resolvedDeadline,
          externalReference: externalReference || '',
          notes: notes || '',
          statusSource: req.body.statusSource || 'Manual Update',
        });

        if (check.existing) {
          return res.status(200).json({
            success: true,
            isExisting: true,
            message: 'Application is already being tracked.',
            data: check.application,
          });
        }

        notificationService.notifyTrackingCreated(req.user, check.application).catch(() => {});

        return res.status(201).json({
          success: true,
          message: 'Application tracking started successfully.',
          data: check.application,
        });
      }
    }

    if (mode === 'mongodb') {
      const initialHistory = [
        {
          previousStatus: status,
          newStatus: status,
          timestamp: new Date(),
          source: req.body.statusSource || 'Manual Update',
          note: notes || 'Tracking record created.',
        },
      ];

      const application = await Application.create({
        userId,
        opportunityId: opportunityId && mongoose.Types.ObjectId.isValid(opportunityId) ? opportunityId : null,
        opportunityTitle: resolvedTitle,
        organization: resolvedOrg,
        opportunityType: resolvedType,
        officialApplicationUrl: resolvedUrl,
        officialHomepageUrl: resolvedHomepage,
        urlVerificationStatus: resolvedVerificationStatus,
        status,
        applicationDate: status === 'Applied' ? new Date() : null,
        deadline: resolvedDeadline,
        externalReference: externalReference || '',
        statusSource: req.body.statusSource || 'Manual Update',
        notes: notes || '',
        statusHistory: initialHistory,
      });

      // Notify student
      notificationService.notifyTrackingCreated(req.user, application).catch(() => {});

      return res.status(201).json({
        success: true,
        message: 'Application tracking started successfully.',
        data: application,
      });
    }

    // Memory Store creation
    const check = memoryStore.createApplication({
      userId,
      opportunityId,
      opportunityTitle: resolvedTitle,
      organization: resolvedOrg,
      opportunityType: resolvedType,
      officialApplicationUrl: resolvedUrl,
      status,
      deadline: resolvedDeadline,
      externalReference: externalReference || '',
      notes: notes || '',
      statusSource: req.body.statusSource || 'Manual Update',
    });

    notificationService.notifyTrackingCreated(req.user, check.application).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Application tracking started successfully.',
      data: check.application,
    });
  } catch (err) {
    console.error('Error creating application tracking record:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create application tracking record.',
      error: err.message,
    });
  }
}

/**
 * List tracked applications for authenticated student
 * GET /api/applications
 */
async function getApplications(req, res) {
  try {
    const userId = req.user.id;
    const { status, type, search, sort = 'updated' } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter = {
        $or: [{ userId }, { userId: 'default_student_user' }],
      };

      if (status && status !== 'All') {
        filter.status = status;
      }
      if (type && type !== 'All') {
        filter.opportunityType = type;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$and = [
          {
            $or: [{ opportunityTitle: regex }, { organization: regex }, { externalReference: regex }],
          },
        ];
      }

      const sortQuery = sort === 'deadline' ? { deadline: 1 } : { updatedAt: -1 };
      const applications = await Application.find(filter).sort(sortQuery);

      return res.json({
        success: true,
        count: applications.length,
        data: applications,
      });
    }

    // Memory Store
    const list = memoryStore.getApplications(userId, { status, type, search, sort });
    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve application tracking records.',
      error: err.message,
    });
  }
}

/**
 * Get dashboard summary counts calculated from actual database records
 * GET /api/applications/summary
 */
async function getApplicationSummary(req, res) {
  try {
    const userId = req.user.id;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter = {
        $or: [{ userId }, { userId: 'default_student_user' }],
      };

      const apps = await Application.find(filter);
      const now = new Date();

      const summary = {
        total: apps.length,
        submitted: apps.filter((a) => a.status === 'Applied').length,
        underReview: apps.filter((a) => a.status === 'Under Review').length,
        shortlisted: apps.filter((a) => ['Shortlisted', 'Selected / Awarded'].includes(a.status)).length,
        upcomingDeadlines: apps.filter(
          (a) =>
            a.deadline &&
            new Date(a.deadline) > now &&
            !['Selected / Awarded', 'Rejected', 'Withdrawn', 'Deadline Passed'].includes(a.status)
        ).length,
        actionRequired: apps.filter((a) => a.status === 'Action Required').length,
      };

      return res.json({
        success: true,
        data: summary,
      });
    }

    const summary = memoryStore.getApplicationsSummary(userId);
    return res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error('Error retrieving applications summary:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate application summary.',
      error: err.message,
    });
  }
}

/**
 * Get specific application by ID
 * GET /api/applications/:id
 */
async function getApplicationById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { mode } = getDbStatus();

    let application = null;

    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid application ID.' });
      }
      application = await Application.findById(id);
    } else {
      application = memoryStore.getApplicationById(id);
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    // Ownership check
    if (!isOwner(application.userId, userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this application.',
      });
    }

    return res.json({
      success: true,
      data: application,
    });
  } catch (err) {
    console.error('Error retrieving application record:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve application record.',
      error: err.message,
    });
  }
}

/**
 * Update application status and append to status history
 * PATCH /api/applications/:id/status
 */
async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, source = 'Manual Update', note = '', externalReference } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted statuses: ${VALID_STATUSES.join(', ')}`,
      });
    }

    if (source && !VALID_SOURCES.includes(source)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status source. Permitted sources: ${VALID_SOURCES.join(', ')}`,
      });
    }

    const { mode } = getDbStatus();
    let application = null;

    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid application ID.' });
      }

      application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application record not found.' });
      }

      // Ownership enforcement
      if (!isOwner(application.userId, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own applications.',
        });
      }

      const previousStatus = application.status;
      application.status = status;
      application.statusSource = source;
      application.lastCheckedAt = new Date();

      if (status === 'Applied' && !application.applicationDate) {
        application.applicationDate = new Date();
      }

      if (externalReference !== undefined) {
        application.externalReference = externalReference.trim();
      }

      if (note && note.trim()) {
        application.notes = note.trim();
      }

      application.statusHistory.unshift({
        previousStatus,
        newStatus: status,
        timestamp: new Date(),
        source,
        note: note ? note.trim() : (source === 'User Confirmed' ? 'Student confirmed application submission on official portal.' : ''),
      });

      await application.save();

      // Trigger targeted in-app & email notification based on transition type
      if (status === 'Applied' && source === 'User Confirmed') {
        notificationService
          .notifySubmissionConfirmed(req.user, application, note, externalReference)
          .catch(() => {});
      } else if (status === 'Action Required') {
        notificationService
          .notifyActionRequired(req.user, application, source, note)
          .catch(() => {});
      } else if (previousStatus !== status) {
        notificationService
          .notifyStatusUpdated(req.user, application, previousStatus, status, source, note)
          .catch(() => {});
      }

      return res.json({
        success: true,
        message: `Application status updated to "${status}".`,
        data: application,
      });
    }

    // Memory Store
    const checkApp = memoryStore.getApplicationById(id);
    if (!checkApp) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    if (!isOwner(checkApp.userId, userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own applications.',
      });
    }

    const prevStat = checkApp.status;

    application = memoryStore.updateApplicationStatus(id, userId, status, source, note);

    if (externalReference !== undefined) {
      memoryStore.updateApplication(id, userId, { externalReference });
    }

    if (status === 'Applied' && source === 'User Confirmed') {
      notificationService
        .notifySubmissionConfirmed(req.user, application, note, externalReference)
        .catch(() => {});
    } else if (status === 'Action Required') {
      notificationService
        .notifyActionRequired(req.user, application, source, note)
        .catch(() => {});
    } else if (prevStat !== status) {
      notificationService
        .notifyStatusUpdated(req.user, application, prevStat, status, source, note)
        .catch(() => {});
    }

    return res.json({
      success: true,
      message: `Application status updated to "${status}".`,
      data: application,
    });
  } catch (err) {
    console.error('Error updating application status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status.',
      error: err.message,
    });
  }
}

/**
 * Update general application details (notes, externalReference, URL)
 * PATCH /api/applications/:id
 */
async function updateApplicationDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes, externalReference, officialApplicationUrl } = req.body;

    if (officialApplicationUrl && !isValidExternalUrl(officialApplicationUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Official application URL must begin with http:// or https://',
      });
    }

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid application ID.' });
      }

      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application record not found.' });
      }

      if (!isOwner(application.userId, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only edit your own applications.',
        });
      }

      if (notes !== undefined) application.notes = notes.trim();
      if (externalReference !== undefined) application.externalReference = externalReference.trim();
      if (officialApplicationUrl !== undefined) application.officialApplicationUrl = officialApplicationUrl.trim();

      await application.save();

      return res.json({
        success: true,
        message: 'Application details updated.',
        data: application,
      });
    }

    const checkDetailsApp = memoryStore.getApplicationById(id);
    if (!checkDetailsApp) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }
    if (!isOwner(checkDetailsApp.userId, userId)) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own applications.' });
    }

    const updated = memoryStore.updateApplication(id, userId, {
      notes,
      externalReference,
      officialApplicationUrl,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found or access denied.',
      });
    }

    return res.json({
      success: true,
      message: 'Application details updated.',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating application details:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application details.',
      error: err.message,
    });
  }
}

/**
 * Delete tracked application
 * DELETE /api/applications/:id
 */
async function deleteApplication(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid application ID.' });
      }

      const app = await Application.findById(id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application record not found.' });
      }

      if (!isOwner(app.userId, userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only remove your own applications.',
        });
      }

      await Application.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Application removed from tracking successfully.',
      });
    }

    const checkDelApp = memoryStore.getApplicationById(id);
    if (!checkDelApp) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }
    if (!isOwner(checkDelApp.userId, userId)) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only remove your own applications.' });
    }

    const removed = memoryStore.deleteApplication(id, userId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found or access denied.',
      });
    }

    return res.json({
      success: true,
      message: 'Application removed from tracking successfully.',
    });
  } catch (err) {
    console.error('Error deleting application:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application.',
      error: err.message,
    });
  }
}

/**
 * Get notification preferences
 * GET /api/applications/preferences
 */
async function getNotificationPreferences(req, res) {
  try {
    const userId = req.user.id;
    const prefs = await notificationService.getPreferences(userId);
    return res.json({
      success: true,
      data: prefs,
    });
  } catch (err) {
    console.error('Error fetching notification preferences:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification preferences.',
      error: err.message,
    });
  }
}

/**
 * Update notification preferences
 * PUT /api/applications/preferences
 */
async function updateNotificationPreferences(req, res) {
  try {
    const userId = req.user.id;
    const {
      emailNotificationsEnabled,
      reminderIntervals,
      statusUpdateAlerts,
      actionRequiredAlerts,
    } = req.body;

    const updateData = {};
    if (emailNotificationsEnabled !== undefined) updateData.emailNotificationsEnabled = Boolean(emailNotificationsEnabled);
    if (Array.isArray(reminderIntervals)) updateData.reminderIntervals = reminderIntervals;
    if (statusUpdateAlerts !== undefined) updateData.statusUpdateAlerts = Boolean(statusUpdateAlerts);
    if (actionRequiredAlerts !== undefined) updateData.actionRequiredAlerts = Boolean(actionRequiredAlerts);

    const updated = await notificationService.updatePreferences(userId, updateData);
    return res.json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating notification preferences:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences.',
      error: err.message,
    });
  }
}

/**
 * Manual trigger for checking upcoming deadlines
 * POST /api/applications/check-deadlines
 */
async function triggerDeadlineCheck(req, res) {
  try {
    const results = await checkUpcomingDeadlines();
    return res.json({
      success: true,
      message: 'Deadline check completed.',
      data: results,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error executing deadline check.',
      error: err.message,
    });
  }
}

/**
 * Checks external link reachability and safety for a tracked application
 * GET /api/applications/:id/check-link
 */
async function checkApplicationLink(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { mode } = getDbStatus();

    let application = null;
    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid application ID.' });
      }
      application = await Application.findById(id);
    } else {
      application = memoryStore.getApplicationById(id);
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    if (!isOwner(application.userId, userId)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const targetUrl = application.officialApplicationUrl;
    const checkResult = await checkUrlReachability(targetUrl);

    return res.json({
      success: true,
      data: {
        applicationId: application._id,
        targetUrl,
        officialHomepageUrl: application.officialHomepageUrl,
        organization: application.organization,
        urlVerificationStatus: application.urlVerificationStatus || 'verified',
        ...checkResult,
      },
    });
  } catch (err) {
    console.error('Error checking application link:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify application link.',
      error: err.message,
    });
  }
}

/**
 * Submits a student broken link report for a tracked application
 * POST /api/applications/:id/report-link
 */
async function reportApplicationLink(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason = 'page_not_found', comments = '' } = req.body;
    const { mode } = getDbStatus();

    let application = null;
    if (mode === 'mongodb') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid application ID.' });
      }
      application = await Application.findById(id);
    } else {
      application = memoryStore.getApplicationById(id);
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    if (!isOwner(application.userId, userId)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const reportData = {
      userId,
      applicationId: id,
      opportunityId: application.opportunityId,
      targetUrl: application.officialApplicationUrl,
      organization: application.organization,
      reason,
      comments: comments ? comments.trim().substring(0, 1000) : '',
      status: 'pending',
      reportedAt: new Date(),
    };

    if (mode === 'mongodb') {
      await BrokenLinkReport.create(reportData);
    } else {
      memoryStore.createBrokenLinkReport(reportData);
    }

    return res.json({
      success: true,
      message: 'Thank you for reporting. Our team has flagged this link for review.',
    });
  } catch (err) {
    console.error('Error reporting application link:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record broken link report.',
      error: err.message,
    });
  }
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationSummary,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationDetails,
  deleteApplication,
  getNotificationPreferences,
  updateNotificationPreferences,
  triggerDeadlineCheck,
  checkApplicationLink,
  reportApplicationLink,
};

