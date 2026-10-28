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
      category: "General",
      gender: "Female",
      updatedAt: new Date(),
    };

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
  getProfile() {
    return { ...this.profile };
  }

  updateProfile(data) {
    this.profile = {
      ...this.profile,
      ...data,
      updatedAt: new Date(),
    };
    return this.profile;
  }

  // Saved Opportunities
  getSaved() {
    return this.saved.map((s) => {
      const opp = this.getOpportunityById(s.opportunityId) || s.opportunity;
      return {
        ...s,
        opportunity: opp,
      };
    });
  }

  saveOpportunity(opportunityId, status = "Interested", notes = "") {
    const opp = this.getOpportunityById(opportunityId);
    if (!opp) return null;

    const existingIdx = this.saved.findIndex(
      (s) => s.opportunityId.toString() === opportunityId.toString(),
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
      userId: "default_student_user",
      status,
      notes,
      savedAt: new Date(),
      updatedAt: new Date(),
    };
    this.saved.unshift(newSave);
    return newSave;
  }

  updateSavedStatus(opportunityId, status, notes) {
    const item = this.saved.find(
      (s) => s.opportunityId.toString() === opportunityId.toString(),
    );
    if (!item) return null;
    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;
    item.updatedAt = new Date();
    return item;
  }

  removeSaved(opportunityId) {
    const beforeCount = this.saved.length;
    this.saved = this.saved.filter(
      (s) => s.opportunityId.toString() !== opportunityId.toString(),
    );
    return this.saved.length < beforeCount;
  }

  isSaved(opportunityId) {
    return (
      this.saved.find(
        (s) => s.opportunityId.toString() === opportunityId.toString(),
      ) || null
    );
  }

  // Reminders
  getReminders() {
    return this.reminders.map((r) => {
      const opp = this.getOpportunityById(r.opportunityId) || r.opportunity;
      return {
        ...r,
        opportunity: opp,
      };
    });
  }

  createReminder(opportunityId, offset) {
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

    // Remove existing with same offset if present
    this.reminders = this.reminders.filter(
      (r) =>
        !(
          r.opportunityId.toString() === opportunityId.toString() &&
          r.offset === offset
        ),
    );

    const reminder = {
      _id: `mem_rem_${Date.now()}`,
      opportunityId,
      opportunity: opp,
      userId: "default_student_user",
      offset,
      offsetLabel: label,
      triggerAt,
      status: "Scheduled",
      createdAt: new Date(),
    };
    this.reminders.unshift(reminder);
    return reminder;
  }

  deleteReminder(reminderId) {
    const before = this.reminders.length;
    this.reminders = this.reminders.filter(
      (r) => r._id.toString() !== reminderId.toString(),
    );
    return this.reminders.length < before;
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
