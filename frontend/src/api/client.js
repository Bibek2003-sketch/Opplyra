/**
 * Opplyra Frontend API Client
 * Uses backend at 127.0.0.1:5001 directly with CORS fallback to /api proxy
 */

const API_BASE = (window.location.port === '5173' || window.location.port === '5174')
  ? 'http://127.0.0.1:5005/api'
  : '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
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

  // Student Profile
  getProfile: () => request('/profile'),
  updateProfile: (profileData) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Saved Opportunities & Application Tracker
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

