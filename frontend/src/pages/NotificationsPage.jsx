import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Sliders,
  ExternalLink,
  Trash2,
  Inbox,
  RefreshCw,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';

export function NotificationsPage({
  onOpenPreferences,
  onNavigateToApplication,
  onNotificationChanged,
}) {
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [page, categoryFilter, unreadOnly]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications({
        page,
        limit: 12,
        category: categoryFilter === 'All' ? undefined : categoryFilter,
        unreadOnly: unreadOnly ? true : undefined,
      });

      if (res.success && res.data) {
        setNotifications(res.data.items || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError('Failed to load notifications from server.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to notifications service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      if (onNotificationChanged) onNotificationChanged();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (onNotificationChanged) onNotificationChanged();
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      if (onNotificationChanged) onNotificationChanged();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }
    if (onNavigateToApplication) {
      onNavigateToApplication(notif);
    }
  };

  // Client-side search filtering
  const filteredNotifications = notifications.filter((notif) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (notif.title && notif.title.toLowerCase().includes(q)) ||
      (notif.subject && notif.subject.toLowerCase().includes(q)) ||
      (notif.message && notif.message.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (notif) => {
    if (notif.type === 'deadline_reminder' || notif.category === 'deadline') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border border-[rgba(245,158,11,0.25)] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      );
    }
    if (notif.type === 'action_required' || notif.category === 'action') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.25)] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    if (notif.type === 'submission_confirmed') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[rgba(52,211,153,0.15)] text-[#34D399] border border-[rgba(52,211,153,0.25)] flex items-center justify-center shrink-0">
          <Check className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 text-[#B69AFF] border border-[#7C3AED]/25 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  const categories = [
    { id: 'All', label: 'All Notifications' },
    { id: 'application', label: 'Applications' },
    { id: 'deadline', label: 'Deadlines' },
    { id: 'action', label: 'Action Required' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[rgba(22,18,31,0.60)] backdrop-blur-xl border border-[rgba(255,255,255,0.10)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(124,58,237,0.20)] text-[#C4B5FD] border border-[rgba(167,139,250,0.30)] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Notification History
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#91899F] mt-1.5 max-w-2xl leading-relaxed">
            Audit trail of upcoming deadline alerts, student submission confirmations, and verified status updates across all tracked opportunities.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(124,58,237,0.15)] text-[#C4B5FD] hover:text-white border border-[rgba(255,255,255,0.10)] hover:border-[rgba(167,139,250,0.30)] text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            onClick={onOpenPreferences}
            className="px-3.5 py-2 rounded-xl bg-[rgba(124,58,237,0.18)] hover:bg-[rgba(124,58,237,0.30)] text-white border border-[rgba(167,139,250,0.35)] text-xs font-semibold transition-all flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
          >
            <Sliders className="w-4 h-4 text-[#C4B5FD]" />
            <span>Reminder Settings</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-[rgba(18,15,26,0.60)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[rgba(124,58,237,0.25)] text-white border border-[rgba(167,139,250,0.40)] shadow-sm'
                  : 'bg-[rgba(255,255,255,0.03)] text-[#91899F] hover:text-[#D1D5DB] border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Unread Only Toggle */}
          <button
            onClick={() => {
              setUnreadOnly((prev) => !prev);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ml-1 ${
              unreadOnly
                ? 'bg-[rgba(236,72,153,0.20)] text-[#F472B6] border border-[rgba(236,72,153,0.35)]'
                : 'bg-[rgba(255,255,255,0.03)] text-[#91899F] hover:text-[#D1D5DB] border border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${unreadOnly ? 'bg-[#EC4899]' : 'bg-[#6B7280]'}`} />
            <span>Unread Only</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#91899F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] focus:border-[rgba(167,139,250,0.40)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#6B7280] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.20)] p-8 text-center text-red-200">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-400 mb-2" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-3 px-4 py-1.5 rounded-xl bg-[rgba(239,68,68,0.20)] hover:bg-[rgba(239,68,68,0.30)] text-xs font-semibold text-white transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl bg-[rgba(22,18,31,0.40)] border border-[rgba(255,255,255,0.08)] p-12 text-center text-[#91899F]">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(124,58,237,0.10)] border border-[rgba(167,139,250,0.20)] text-[#A78BFA] flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white font-display">No Notifications Found</h3>
          <p className="text-xs text-[#91899F] mt-1 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'All' || unreadOnly
              ? 'No notifications match your active search and filter criteria.'
              : 'You have no notifications right now. Alerts for upcoming deadlines and status updates will appear here.'}
          </p>
          {(searchQuery || categoryFilter !== 'All' || unreadOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setUnreadOnly(false);
              }}
              className="mt-4 px-3.5 py-1.5 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.10)] text-xs text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`rounded-2xl border transition-all p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                !notif.isRead
                  ? 'bg-[rgba(124,58,237,0.09)] border-[rgba(167,139,250,0.30)] shadow-[0_4px_20px_rgba(124,58,237,0.10)]'
                  : 'bg-[rgba(20,16,28,0.50)] hover:bg-[rgba(28,23,40,0.65)] border-[rgba(255,255,255,0.08)]'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Category Icon */}
                {getCategoryIcon(notif)}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        !notif.isRead ? 'text-white' : 'text-[#E5E7EB]'
                      }`}
                    >
                      {notif.title || notif.subject}
                    </h3>

                    {/* Unread Pill */}
                    {!notif.isRead && (
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(236,72,153,0.20)] text-[#F472B6] border border-[rgba(236,72,153,0.30)] text-[10px] font-semibold">
                        Unread
                      </span>
                    )}

                    {/* Delivery Channels Badge */}
                    <div className="flex items-center gap-1">
                      {notif.channels?.inApp && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[#A78BFA] border border-[rgba(255,255,255,0.08)] flex items-center gap-1">
                          <Bell className="w-2.5 h-2.5" />
                          <span>In-App</span>
                        </span>
                      )}
                      {notif.channels?.email && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[#34D399] border border-[rgba(255,255,255,0.08)] flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          <span>Email</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#A59FBD] mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-[#7E788B]">
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {notif.readAt && (
                      <span className="text-[#9CA3AF]">
                        Read {new Date(notif.readAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}

                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.04)] text-[#91899F]">
                      Category: {notif.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end border-t sm:border-t-0 border-[rgba(255,255,255,0.06)] pt-2.5 sm:pt-0">
                {/* Navigate Button */}
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(124,58,237,0.18)] hover:bg-[rgba(124,58,237,0.30)] text-[#C4B5FD] hover:text-white border border-[rgba(167,139,250,0.25)] text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                {/* Mark as Read */}
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-2 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(124,58,237,0.20)] text-[#C4B5FD] hover:text-white border border-[rgba(255,255,255,0.08)] transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={() => handleDismiss(notif._id)}
                  className="p-2 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(239,68,68,0.20)] text-[#91899F] hover:text-[#F87171] border border-[rgba(255,255,255,0.08)] transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.08)] text-xs text-[#91899F]">
              <span>
                Showing page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.10)] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.10)] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

