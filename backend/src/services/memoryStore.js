const { sampleOpportunities } = require("../seeds/seedData");

// In-Memory Dev Fallback Store
// Used when MongoDB service is unreachable or during zero-dependency demonstration
class MemoryStore {
  constructor() {
    this.opportunities = sampleOpportunities.map((op, idx) => ({
      _id: `mem_opp_${idx + 1}`,
      ...op,
      createdAt: new Date(),
    }));

    this.profile = {
      userId: "default_student_user",
      fullName: "Priya Sharma",
      course: "B.Tech Computer Science",
      academicYear: "3rd Year",
      cgpa: 8.2,
      location: "Karnataka, India",
      city: "Bengaluru",
      state: "Karnataka",
      university: "Indian Institute of Science / State Technical University",
      specialization: "Artificial Intelligence & Data Systems",
      semester: "Semester 6",
      graduationYear: "2026",
      phone: "+91 98765 43210",
      avatarUrl: "",
      preferredCategories: ["Scholarships", "Internships"],
      preferredIndustries: ["Technology & Software", "Research & Development"],
      careerInterests: ["Full Stack Engineering", "Machine Learning"],
      skills: ["JavaScript", "Python", "React", "Problem Solving", "Node.js"],
      preferredLocations: ["Remote", "Bengaluru", "Delhi NCR"],
      isEmailVerified: true,
      category: "General",
      gender: "Female",
      updatedAt: new Date(),
    };

    this.profiles = {
      default_student_user: { ...this.profile },
      mem_user_default: { ...this.profile },
    };

    this.users = [
      {
        _id: "mem_user_default",
        email: "priya.sharma@college.edu",
        password: "954ae4c7b20b9cdf43b543256c7e64b2:e598fc8f054a6b0285de787c6e9a4f9baba1834dec8132ff955ff4b57bf537e3c0098d8a80cbf84c10b2d9cb62042246e6573f6b7edd038cb4d4d23c147475f6",
        fullName: "Priya Sharma",
        course: "B.Tech Computer Science",
        academicYear: "3rd Year",
        city: "Bengaluru",
        state: "Karnataka",
        university: "Indian Institute of Science / State Technical University",
        specialization: "Artificial Intelligence & Data Systems",
        semester: "Semester 6",
        graduationYear: "2026",
        phone: "+91 98765 43210",
        avatarUrl: "",
        preferredCategories: ["Scholarships", "Internships"],
        preferredIndustries: ["Technology & Software", "Research & Development"],
        careerInterests: ["Full Stack Engineering", "Machine Learning"],
        skills: ["JavaScript", "Python", "React", "Problem Solving", "Node.js"],
        preferredLocations: ["Remote", "Bengaluru", "Delhi NCR"],
        isEmailVerified: true,
        createdAt: new Date(),
      },
    ];

    // Pre-populate with 1 saved item for rich initial demonstration
    this.saved = [
      {
        _id: "mem_save_1",
        opportunityId: this.opportunities[1]._id,
        opportunity: this.opportunities[1],
        userId: "default_student_user",
        status: "Preparing",
        notes:
          "Working on Statement of Purpose and brushing up on LeetCode dynamic programming.",
        savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ];

    this.reminders = [
      {
        _id: "mem_rem_1",
        opportunityId: this.opportunities[1]._id,
        opportunity: this.opportunities[1],
        userId: "default_student_user",
        offset: "1_day_before",
        offsetLabel: "1 day before deadline",
        triggerAt: new Date(
          new Date(this.opportunities[1].deadline).getTime() -
            24 * 60 * 60 * 1000,
        ),
        status: "Scheduled",
        createdAt: new Date(),
      },
    ];

    this.applications = [
      {
        _id: "mem_app_demo_1",
        userId: "default_student_user",
        opportunityId: this.opportunities[1]._id,
        opportunityTitle: this.opportunities[1].title,
        organization: this.opportunities[1].organization,
        opportunityType: this.opportunities[1].category,
        officialApplicationUrl: this.opportunities[1].sourceUrl,
        officialHomepageUrl: this.opportunities[1].officialHomepageUrl,
        urlVerificationStatus: this.opportunities[1].urlVerificationStatus,
        status: "Applied",
        applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        deadline: this.opportunities[1].deadline,
        externalReference: "GOOG-RF-2026-9812",
        statusSource: "User Confirmed",
        lastCheckedAt: new Date(),
        notes: "Submitted via Google Careers portal with transcript and updated resume.",
        statusHistory: [
          {
            _id: "hist_demo_2",
            previousStatus: "Application Started",
            newStatus: "Applied",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            source: "User Confirmed",
            note: "Application submitted on official portal.",
          },
          {
            _id: "hist_demo_1",
            previousStatus: "Interested",
            newStatus: "Application Started",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            source: "Manual Update",
            note: "Opened official application portal from Opplyra.",
          },
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "mem_app_demo_2",
        userId: "default_student_user",
        opportunityId: this.opportunities[0]._id,
        opportunityTitle: this.opportunities[0].title,
        organization: this.opportunities[0].organization,
        opportunityType: this.opportunities[0].category,
        officialApplicationUrl: this.opportunities[0].sourceUrl,
        officialHomepageUrl: this.opportunities[0].officialHomepageUrl,
        urlVerificationStatus: this.opportunities[0].urlVerificationStatus,
        status: "Application Started",
        applicationDate: null,
        deadline: this.opportunities[0].deadline,
        externalReference: "",
        statusSource: "Manual Update",
        lastCheckedAt: new Date(),
        notes: "Need income certificate from local revenue authority before submitting.",
        statusHistory: [
          {
            _id: "hist_demo_3",
            previousStatus: "Interested",
            newStatus: "Application Started",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            source: "Manual Update",
            note: "Started portal registration.",
          },
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    this.jobLocks = {};
    this.brokenLinkReports = [];
    this.notificationLogs = [
      {
        _id: 'mem_notif_1',
        userId: 'default_student_user',
        applicationId: 'mem_app_demo_1',
        opportunityId: 'opp_2',
        type: 'submission_confirmed',
        category: 'application',
        title: 'Application Confirmed',
        subject: 'Application Confirmed: Google Summer of Code (GSOC) 2026',
        message: 'You marked your application as submitted for Google Summer of Code (GSOC) 2026.',
        isRead: false,
        readAt: null,
        isDismissed: false,
        dismissedAt: null,
        destinationRoute: '/app#tracker',
        channels: { inApp: true, email: true },
        intervalDays: null,
        recipientEmail: 'priya.sharma@college.edu',
        status: 'sent',
        idempotencyKey: 'default_student_user_mem_app_demo_1_submission_confirmed_init',
        error: null,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        _id: 'mem_notif_2',
        userId: 'default_student_user',
        applicationId: 'mem_app_demo_2',
        opportunityId: 'opp_1',
        type: 'deadline_reminder',
        category: 'deadline',
        title: 'Deadline Approaching',
        subject: 'Deadline Alert: Reliance Foundation Undergraduate Scholarship closes in 7 days',
        message: 'Reminder: Reliance Foundation Undergraduate Scholarship deadline is in 7 days. Ensure all documents are submitted.',
        isRead: false,
        readAt: null,
        isDismissed: false,
        dismissedAt: null,
        destinationRoute: '/app#tracker',
        channels: { inApp: true, email: true },
        intervalDays: 7,
        recipientEmail: 'priya.sharma@college.edu',
        status: 'sent',
        idempotencyKey: 'default_student_user_mem_app_demo_2_deadline_reminder_7d_init',
        error: null,
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        _id: 'mem_notif_3',
        userId: 'default_student_user',
        applicationId: null,
        opportunityId: null,
        type: 'tracking_created',
        category: 'system',
        title: 'Welcome to Opplyra Notifications',
        subject: 'Notification Center Active',
        message: 'Stay updated on upcoming deadlines, official submission reminders, and status changes in real-time.',
        isRead: true,
        readAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isDismissed: false,
        dismissedAt: null,
        destinationRoute: '/app#notifications',
        channels: { inApp: true, email: false },
        intervalDays: null,
        recipientEmail: 'priya.sharma@college.edu',
        status: 'sent',
        idempotencyKey: 'default_student_user_welcome_notif_init',
        error: null,
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];
    this.notificationPreferences = [];
  }

  // Opportunities
  getOpportunities({ search, category, sort } = {}) {
    let list = [...this.opportunities];
    if (category && category !== "All") {
      list = list.filter(
        (o) => o.category.toLowerCase() === category.toLowerCase(),
      );
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          o.shortDescription.toLowerCase().includes(q) ||
          (o.tags && o.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }
    if (sort === "deadline_asc") {
      list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === "deadline_desc") {
      list.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    }
    return list;
  }

  getOpportunityById(id) {
    return (
      this.opportunities.find((o) => o._id.toString() === id.toString()) || null
    );
  }

  // Profile
  getProfile(userId = 'default_student_user') {
    const key = userId || 'default_student_user';
    if (this.profiles && this.profiles[key]) {
      return { ...this.profiles[key] };
    }
    const user = this.findUserById(key) || this.findUserByEmail(key);
    if (user) {
      if (!this.profiles) this.profiles = {};
      this.profiles[key] = {
        ...this.profile,
        userId: user._id || key,
        fullName: user.fullName || this.profile.fullName,
        course: user.course || this.profile.course,
        academicYear: user.academicYear || this.profile.academicYear,
        updatedAt: new Date(),
      };
      return { ...this.profiles[key] };
    }
    return { ...this.profile };
  }

  updateProfile(data, userId = 'default_student_user') {
    const key = userId || 'default_student_user';
    if (!this.profiles) this.profiles = {};
    const current = this.getProfile(key);
    this.profiles[key] = {
      ...current,
      ...data,
      updatedAt: new Date(),
    };
    if (key === 'default_student_user' || key === 'mem_user_default') {
      this.profile = { ...this.profiles[key] };
    }
    return this.profiles[key];
  }

  // Saved Opportunities
  getSaved(userId = null) {
    let list = this.saved;
    if (userId && userId !== 'default_student_user') {
      list = list.filter((s) => s.userId === userId);
    }
    return list.map((s) => {
      const opp = this.getOpportunityById(s.opportunityId) || s.opportunity;
      return {
        ...s,
        opportunity: opp,
      };
    });
  }

  saveOpportunity(opportunityId, status = "Interested", notes = "", userId = "default_student_user") {
    const opp = this.getOpportunityById(opportunityId);
    if (!opp) return null;

    const targetUserId = userId || "default_student_user";
    const existingIdx = this.saved.findIndex(
      (s) => s.opportunityId.toString() === opportunityId.toString() && (s.userId === targetUserId || targetUserId === 'default_student_user'),
    );
    if (existingIdx >= 0) {
      this.saved[existingIdx].status = status;
      if (notes !== undefined) this.saved[existingIdx].notes = notes;
      this.saved[existingIdx].updatedAt = new Date();
      return this.saved[existingIdx];
    }

    const newSave = {
      _id: `mem_save_${Date.now()}`,
      opportunityId,
      opportunity: opp,
      userId: targetUserId,
      status,
      notes,
      savedAt: new Date(),
      updatedAt: new Date(),
    };
    this.saved.unshift(newSave);
    return newSave;
  }

  updateSavedStatus(opportunityId, status, notes, userId = "default_student_user") {
    const targetUserId = userId || "default_student_user";
    const item = this.saved.find(
      (s) => s.opportunityId.toString() === opportunityId.toString() && (s.userId === targetUserId || targetUserId === 'default_student_user'),
    );
    if (!item) return null;
    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;
    item.updatedAt = new Date();
    return item;
  }

  removeSaved(opportunityId, userId = "default_student_user") {
    const targetUserId = userId || "default_student_user";
    const beforeCount = this.saved.length;
    this.saved = this.saved.filter(
      (s) => !(s.opportunityId.toString() === opportunityId.toString() && (s.userId === targetUserId || targetUserId === 'default_student_user')),
    );
    return this.saved.length < beforeCount;
  }

  isSaved(opportunityId, userId = null) {
    return (
      this.saved.find(
        (s) => s.opportunityId.toString() === opportunityId.toString() && (!userId || s.userId === userId || userId === 'default_student_user'),
      ) || null
    );
  }

  // Reminders
  getReminders(userId = null) {
    let list = this.reminders;
    if (userId && userId !== 'default_student_user') {
      list = list.filter((r) => r.userId === userId);
    }
    return list.map((r) => {
      const opp = this.getOpportunityById(r.opportunityId) || r.opportunity;
      return {
        ...r,
        opportunity: opp,
      };
    });
  }

  createReminder(opportunityId, offset, userId = "default_student_user") {
    const opp = this.getOpportunityById(opportunityId);
    if (!opp) return null;

    const deadline = new Date(opp.deadline).getTime();
    let offsetMs = 7 * 24 * 60 * 60 * 1000;
    let label = "7 days before deadline";
    if (offset === "1_day_before") {
      offsetMs = 24 * 60 * 60 * 1000;
      label = "1 day before deadline";
    } else if (offset === "1_hour_before") {
      offsetMs = 60 * 60 * 1000;
      label = "1 hour before deadline";
    }

    const triggerAt = new Date(Math.max(Date.now(), deadline - offsetMs));
    const targetUserId = userId || "default_student_user";

    // Remove existing with same offset if present
    this.reminders = this.reminders.filter(
      (r) =>
        !(
          r.opportunityId.toString() === opportunityId.toString() &&
          r.offset === offset &&
          (r.userId === targetUserId || targetUserId === 'default_student_user')
        ),
    );

    const reminder = {
      _id: `mem_rem_${Date.now()}`,
      opportunityId,
      opportunity: opp,
      userId: targetUserId,
      offset,
      offsetLabel: label,
      triggerAt,
      status: "Scheduled",
      createdAt: new Date(),
    };
    this.reminders.unshift(reminder);
    return reminder;
  }

  deleteReminder(reminderId, userId = null) {
    const before = this.reminders.length;
    this.reminders = this.reminders.filter(
      (r) => !(r._id.toString() === reminderId.toString() && (!userId || r.userId === userId || userId === 'default_student_user')),
    );
    return this.reminders.length < before;
  }

  // Users & Authentication
  findUserByEmail(email) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return this.users.find((u) => u.email.toLowerCase() === clean) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.users.find((u) => u._id === id || u.id === id) || null;
  }

  createUser(userData) {
    const user = {
      _id: `mem_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'student',
      authProvider: 'local',
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  updateUser(id, data) {
    const idx = this.users.findIndex((u) => u._id === id || u.id === id || u.email === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
      return this.users[idx];
    }
    return null;
  }

  // Application Tracking System
  getApplications(userId = null, { status, type, search, sort } = {}) {
    let list = this.applications || [];
    if (userId) {
      list = list.filter((a) => a.userId === userId || a.userId === 'default_student_user');
    }
    if (status && status !== 'All') {
      list = list.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }
    if (type && type !== 'All') {
      list = list.filter((a) => a.opportunityType.toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.opportunityTitle.toLowerCase().includes(q) ||
          a.organization.toLowerCase().includes(q)
      );
    }
    if (sort === 'deadline') {
      list = [...list].sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
    } else {
      list = [...list].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }
    return list;
  }

  getApplicationById(id, userId = null) {
    return (
      (this.applications || []).find(
        (a) => a._id === id && (!userId || a.userId === userId || a.userId === 'default_student_user')
      ) || null
    );
  }

  createApplication(data) {
    if (!this.applications) this.applications = [];
    // Check duplicate
    if (data.opportunityId) {
      const existing = this.applications.find(
        (a) => a.userId === data.userId && a.opportunityId === data.opportunityId
      );
      if (existing) {
        return { existing: true, application: existing };
      }
    }

    const initialHistory = [
      {
        _id: `hist_${Date.now()}`,
        previousStatus: data.status || 'Interested',
        newStatus: data.status || 'Interested',
        timestamp: new Date(),
        source: data.statusSource || 'Manual Update',
        note: data.notes || 'Tracking record created.',
      },
    ];

    const app = {
      _id: `mem_app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      opportunityId: data.opportunityId || null,
      opportunityTitle: data.opportunityTitle,
      organization: data.organization,
      opportunityType: data.opportunityType || 'General',
      officialApplicationUrl: data.officialApplicationUrl || '',
      officialHomepageUrl: data.officialHomepageUrl || null,
      urlVerificationStatus: data.urlVerificationStatus || 'verified',
      status: data.status || 'Interested',
      applicationDate: data.applicationDate || null,
      deadline: data.deadline || null,
      externalReference: data.externalReference || '',
      statusSource: data.statusSource || 'Manual Update',
      lastCheckedAt: new Date(),
      notes: data.notes || '',
      statusHistory: initialHistory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.applications.unshift(app);
    return { existing: false, application: app };
  }

  updateApplicationStatus(id, userId, newStatus, source = 'Manual Update', note = '') {
    const app = this.getApplicationById(id, userId);
    if (!app) return null;

    const previousStatus = app.status;
    app.status = newStatus;
    app.statusSource = source;
    app.lastCheckedAt = new Date();
    app.updatedAt = new Date();

    if (newStatus === 'Applied' && !app.applicationDate) {
      app.applicationDate = new Date();
    }

    app.statusHistory.unshift({
      _id: `hist_${Date.now()}`,
      previousStatus,
      newStatus,
      timestamp: new Date(),
      source,
      note,
    });

    return app;
  }

  updateApplication(id, userId, updateData) {
    const app = this.getApplicationById(id, userId);
    if (!app) return null;

    if (updateData.notes !== undefined) app.notes = updateData.notes;
    if (updateData.externalReference !== undefined) app.externalReference = updateData.externalReference;
    if (updateData.officialApplicationUrl !== undefined) app.officialApplicationUrl = updateData.officialApplicationUrl;
    app.updatedAt = new Date();
    return app;
  }

  deleteApplication(id, userId) {
    if (!this.applications) return false;
    const initialLen = this.applications.length;
    this.applications = this.applications.filter(
      (a) => !(a._id === id && (!userId || a.userId === userId || a.userId === 'default_student_user'))
    );
    return this.applications.length < initialLen;
  }

  getApplicationsSummary(userId) {
    const apps = this.getApplications(userId);
    const now = new Date();

    return {
      total: apps.length,
      submitted: apps.filter((a) => a.status === 'Applied').length,
      underReview: apps.filter((a) => a.status === 'Under Review').length,
      shortlisted: apps.filter((a) => ['Shortlisted', 'Selected / Awarded'].includes(a.status)).length,
      upcomingDeadlines: apps.filter(
        (a) =>
          a.deadline &&
          new Date(a.deadline) > now &&
          !['Selected / Awarded', 'Rejected', 'Withdrawn'].includes(a.status)
      ).length,
      actionRequired: apps.filter((a) => a.status === 'Action Required').length,
    };
  }

  // Notifications
  getNotificationPreferences(userId) {
    if (!this.notificationPreferences) this.notificationPreferences = [];
    let pref = this.notificationPreferences.find((p) => p.userId === userId);
    if (!pref) {
      pref = {
        userId,
        inAppNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        deadlineReminderAlerts: true,
        reminderIntervals: [7, 3, 1],
        statusUpdateAlerts: true,
        actionRequiredAlerts: true,
      };
      this.notificationPreferences.push(pref);
    }
    return pref;
  }

  updateNotificationPreferences(userId, updateData) {
    const pref = this.getNotificationPreferences(userId);
    Object.assign(pref, updateData);
    return pref;
  }

  hasNotificationLog(idempotencyKey) {
    if (!this.notificationLogs) this.notificationLogs = [];
    return this.notificationLogs.some((l) => l.idempotencyKey === idempotencyKey);
  }

  createNotificationLog(logData) {
    if (!this.notificationLogs) this.notificationLogs = [];
    const newLog = {
      _id: `mem_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isRead: false,
      readAt: null,
      isDismissed: false,
      dismissedAt: null,
      category: 'application',
      destinationRoute: '/app#tracker',
      channels: { inApp: true, email: true },
      ...logData,
      createdAt: new Date(),
    };
    this.notificationLogs.unshift(newLog);
    return newLog;
  }

  getNotifications(userId, { page = 1, limit = 15, unreadOnly = false, category = 'All' } = {}) {
    if (!this.notificationLogs) this.notificationLogs = [];
    let list = this.notificationLogs.filter(
      (n) => (n.userId === userId || n.userId === 'default_student_user') && !n.isDismissed
    );

    if (unreadOnly === true || unreadOnly === 'true') {
      list = list.filter((n) => !n.isRead);
    }

    if (category && category !== 'All') {
      list = list.filter((n) => n.category && n.category.toLowerCase() === category.toLowerCase());
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  getUnreadNotificationCount(userId) {
    if (!this.notificationLogs) return 0;
    return this.notificationLogs.filter(
      (n) => (n.userId === userId || n.userId === 'default_student_user') && !n.isRead && !n.isDismissed
    ).length;
  }

  getNotificationById(id) {
    if (!this.notificationLogs) return null;
    return this.notificationLogs.find((n) => n._id === id) || null;
  }

  markNotificationAsRead(id, userId) {
    const notif = this.getNotificationById(id);
    if (!notif) return null;
    if (notif.userId !== userId && notif.userId !== 'default_student_user' && userId !== 'default_student_user') {
      return 'unauthorized';
    }
    notif.isRead = true;
    notif.readAt = new Date();
    return notif;
  }

  markAllNotificationsAsRead(userId) {
    if (!this.notificationLogs) return 0;
    let count = 0;
    const now = new Date();
    for (const notif of this.notificationLogs) {
      if ((notif.userId === userId || notif.userId === 'default_student_user') && !notif.isRead && !notif.isDismissed) {
        notif.isRead = true;
        notif.readAt = now;
        count++;
      }
    }
    return count;
  }

  dismissNotification(id, userId) {
    const notif = this.getNotificationById(id);
    if (!notif) return null;
    if (notif.userId !== userId && notif.userId !== 'default_student_user' && userId !== 'default_student_user') {
      return 'unauthorized';
    }
    notif.isDismissed = true;
    notif.dismissedAt = new Date();
    return notif;
  }

  // Broken Link Reports
  createBrokenLinkReport(reportData) {
    if (!this.brokenLinkReports) this.brokenLinkReports = [];
    const report = {
      _id: `mem_report_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      reportedAt: new Date(),
      ...reportData,
      createdAt: new Date(),
    };
    this.brokenLinkReports.unshift(report);

    // If opportunityId present, increment report count
    if (reportData.opportunityId) {
      const opp = this.getOpportunityById(reportData.opportunityId);
      if (opp) {
        opp.brokenLinkReportCount = (opp.brokenLinkReportCount || 0) + 1;
      }
    }
    return report;
  }

  getBrokenLinkReports() {
    return this.brokenLinkReports || [];
  }

  // Job Lock for multi-instance scheduler safety
  acquireJobLock(lockName, ttlMs = 5 * 60 * 1000, instanceId = 'proc_1') {
    if (!this.jobLocks) this.jobLocks = {};
    const now = Date.now();
    const current = this.jobLocks[lockName];
    if (current && current.lockedUntil > now && current.lockedBy !== instanceId) {
      return false;
    }
    this.jobLocks[lockName] = {
      lockedUntil: now + ttlMs,
      lockedBy: instanceId,
    };
    return true;
  }

  releaseJobLock(lockName, instanceId = 'proc_1') {
    if (!this.jobLocks || !this.jobLocks[lockName]) return;
    if (this.jobLocks[lockName].lockedBy === instanceId) {
      delete this.jobLocks[lockName];
    }
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
