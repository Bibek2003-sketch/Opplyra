/**
 * Opplyra Frontend API Client
 * Uses backend at 127.0.0.1:5005 directly with CORS fallback to /api proxy
 */

const API_BASE = (window.location.port === '5173' || window.location.port === '5174')
  ? 'http://127.0.0.1:5005/api'
  : '/api';

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem('opplyra_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user?.id || parsed?.user?._id) {
        return {
          'x-user-id': parsed.user.id || parsed.user._id,
        };
      }
    }
  } catch {}
  return {};
}

async function request(endpoint, options = {}) {
  const authHeaders = getAuthHeaders();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Request Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // System Health
  getHealth: () => request('/health'),

  // Opportunities
  getDashboardSummary: () => request('/opportunities/dashboard-summary'),
  getOpportunities: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return request(`/opportunities${qs ? `?${qs}` : ''}`);
  },
  getOpportunityById: (id) => request(`/opportunities/${id}`),
  checkOpportunityLink: (id) => request(`/opportunities/${id}/check-link`),
  reportOpportunityLink: (id, payload) =>
    request(`/opportunities/${id}/report-link`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Student Profile
  getProfile: () => request('/profile'),
  updateProfile: (profileData) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  uploadAvatar: (payload) =>
    request('/profile/avatar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removeAvatar: () =>
    request('/profile/avatar', {
      method: 'DELETE',
    }),
  changePassword: (payload) =>
    request('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Application Tracking System (Official Portal Workflow & Status Pipeline)
  getApplications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return request(`/applications${qs ? `?${qs}` : ''}`);
  },
  getApplicationSummary: () => request('/applications/summary'),
  getApplicationById: (id) => request(`/applications/${id}`),
  createApplication: (payload) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateApplicationStatus: (id, payload) =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateApplication: (id, payload) =>
    request(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteApplication: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),
  checkApplicationLink: (id) => request(`/applications/${id}/check-link`),
  reportApplicationLink: (id, payload) =>
    request(`/applications/${id}/report-link`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // In-App & Email Notifications Center
  getNotifications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.unreadOnly !== undefined) query.append('unreadOnly', params.unreadOnly);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    const qs = query.toString();
    return request(`/notifications${qs ? `?${qs}` : ''}`);
  },
  getUnreadNotificationCount: () => request('/notifications/unread-count'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllNotificationsRead: () =>
    request('/notifications/mark-all-read', {
      method: 'POST',
    }),
  dismissNotification: (id) =>
    request(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  // Notification Preferences & Scheduled Alerts
  getNotificationPreferences: () => request('/notifications/preferences'),
  updateNotificationPreferences: (payload) =>
    request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  triggerDeadlineCheck: () =>
    request('/applications/check-deadlines', {
      method: 'POST',
    }),

  // Legacy Saved Opportunities (backward compatibility)
  getSaved: (status) => {
    const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/saved${qs}`);
  },
  saveOpportunity: (opportunityId, status = 'Interested', notes = '') =>
    request('/saved', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, status, notes }),
    }),
  updateSavedStatus: (opportunityId, status, notes) =>
    request(`/saved/${opportunityId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  removeSaved: (opportunityId) =>
    request(`/saved/${opportunityId}`, {
      method: 'DELETE',
    }),

  // Rule-Based Verification Engine
  verifyAnnouncement: (payload) =>
    request('/verification/check', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Deadline Reminders
  getReminders: () => request('/reminders'),
  createReminder: (opportunityId, offset) =>
    request('/reminders', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, offset }),
    }),
  deleteReminder: (id) =>
    request(`/reminders/${id}`, {
      method: 'DELETE',
    }),
};
