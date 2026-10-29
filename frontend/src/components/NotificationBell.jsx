import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  FileText,
  Sliders,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NotificationBell({
  unreadCount = 0,
  onOpenPreferences,
  onViewAllNotifications,
  onNavigateToApplication,
  onNotificationChanged,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadRecentNotifications();
    }
  }, [isOpen]);

  const loadRecentNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications({ limit: 6, page: 1 });
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load notifications in dropdown:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
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

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await api.dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (onNotificationChanged) onNotificationChanged();
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      if (onNotificationChanged) onNotificationChanged();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.markNotificationRead(notif._id);
        if (onNotificationChanged) onNotificationChanged();
      } catch (err) {
        console.error('Failed to mark as read on click:', err);
      }
    }
    setIsOpen(false);
    if (onNavigateToApplication) {
      onNavigateToApplication(notif);
    }
  };

  const getCategoryIcon = (notif) => {
    if (notif.type === 'deadline_reminder' || notif.category === 'deadline') {
      return (
        <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border border-[rgba(245,158,11,0.25)] flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      );
    }
    if (notif.type === 'action_required' || notif.category === 'action') {
      return (
        <div className="w-8 h-8 rounded-lg bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.25)] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (notif.type === 'submission_confirmed') {
      return (
        <div className="w-8 h-8 rounded-lg bg-[rgba(52,211,153,0.15)] text-[#34D399] border border-[rgba(52,211,153,0.25)] flex items-center justify-center shrink-0">
          <Check className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/15 text-[#B69AFF] border border-[#7C3AED]/25 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 active:scale-[0.98] ${
          isOpen
            ? 'bg-[rgba(124,58,237,0.20)] border-[rgba(167,139,250,0.40)] text-[#F3E8FF]'
            : 'bg-[rgba(22,18,31,0.55)] hover:bg-[rgba(32,25,46,0.70)] border-[rgba(255,255,255,0.12)] hover:border-[rgba(167,139,250,0.30)] text-[#F7F5FC]'
        }`}
        title="Notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 text-[#C4B5FD] transition-transform duration-200 hover:scale-110" />

        {/* Unread Pill Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.6)] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Glassmorphism Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[rgba(16,13,24,0.96)] backdrop-blur-2xl border border-[rgba(255,255,255,0.15)] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(124,58,237,0.15)] z-50 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.10)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#F7F5FC]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[rgba(124,58,237,0.25)] text-[#C4B5FD] text-[10px] font-semibold border border-[rgba(167,139,250,0.30)]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="text-[11px] text-[#A78BFA] hover:text-white px-2 py-1 rounded-lg hover:bg-[rgba(124,58,237,0.20)] transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="overflow-y-auto divide-y divide-[rgba(255,255,255,0.06)] flex-1 min-h-[160px] max-h-[380px]">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-[#91899F] space-y-2">
                <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#91899F]">
                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mx-auto mb-2 text-[#6B7280]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-[#D1D5DB]">All caught up!</p>
                <p className="text-[11px] text-[#91899F] mt-1">No recent notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-[rgba(255,255,255,0.04)] transition-all cursor-pointer flex items-start gap-3 relative group ${
                    !notif.isRead ? 'bg-[rgba(124,58,237,0.08)]' : ''
                  }`}
                >
                  {/* Category Icon */}
                  {getCategoryIcon(notif)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !notif.isRead ? 'text-white' : 'text-[#D1D5DB]'
                        }`}
                      >
                        {notif.title || notif.subject}
                      </h4>
                      <span className="text-[10px] text-[#7E788B] shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#A59FBD] line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Footer tags */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[#91899F] border border-[rgba(255,255,255,0.08)]">
                        {notif.category || 'General'}
                      </span>
                      {notif.destinationRoute && (
                        <span className="text-[10px] text-[#A78BFA] flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                          <span>View record</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Mark read / Dismiss) */}
                  <div className="flex items-center gap-1 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, notif._id)}
                        className="p-1 rounded-lg hover:bg-[rgba(124,58,237,0.30)] text-[#C4B5FD] hover:text-white transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(e, notif._id)}
                      className="p-1 rounded-lg hover:bg-[rgba(239,68,68,0.20)] text-[#91899F] hover:text-[#F87171] transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unread Glow Dot */}
                  {!notif.isRead && (
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA] group-hover:hidden" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.10)] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onViewAllNotifications) onViewAllNotifications();
              }}
              className="text-[#C4B5FD] hover:text-white font-medium px-2.5 py-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.20)] transition-colors flex items-center gap-1.5"
            >
              <span>View full history</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenPreferences) onOpenPreferences();
              }}
              className="text-[#91899F] hover:text-white p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors flex items-center gap-1"
              title="Notification Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[11px]">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

