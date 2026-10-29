import React, { useState, useEffect } from 'react';
import { X, Bell, Mail, Clock, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { api } from '../api/client';

export function NotificationPreferencesModal({ isOpen, onClose, onSaveSuccess }) {
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [intervals, setIntervals] = useState([7, 3, 1]);
  const [statusAlerts, setStatusAlerts] = useState(true);
  const [actionAlerts, setActionAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoading(true);

    api.getNotificationPreferences()
      .then((res) => {
        if (!isMounted) return;
        const d = res.data;
        if (d) {
          setInAppEnabled(d.inAppNotificationsEnabled !== false);
          setEmailEnabled(d.emailNotificationsEnabled !== false);
          setDeadlineAlerts(d.deadlineReminderAlerts !== false);
          setIntervals(Array.isArray(d.reminderIntervals) ? d.reminderIntervals : [7, 3, 1]);
          setStatusAlerts(d.statusUpdateAlerts !== false);
          setActionAlerts(d.actionRequiredAlerts !== false);
        }
      })
      .catch((err) => {
        console.warn('Could not load notification preferences:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleInterval = (num) => {
    if (intervals.includes(num)) {
      if (intervals.length > 1) {
        setIntervals(intervals.filter((i) => i !== num));
      }
    } else {
      setIntervals([...intervals, num].sort((a, b) => b - a));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateNotificationPreferences({
        inAppNotificationsEnabled: inAppEnabled,
        emailNotificationsEnabled: emailEnabled,
        deadlineReminderAlerts: deadlineAlerts,
        reminderIntervals: intervals,
        statusUpdateAlerts: statusAlerts,
        actionRequiredAlerts: actionAlerts,
      });
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F7F5FC] font-display">
                Notification Preferences
              </h2>
              <p className="text-xs text-[#91899F]">
                Configure in-app bells, email alerts, and deadline reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#91899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#C4B5FD] flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
            <span>Loading preferences...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Delivery Channels */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#A78BFA] uppercase tracking-wider">
                Delivery Channels
              </span>

              {/* In-App Notifications Toggle */}
              <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#A78BFA]" />
                    <span>In-App Notification Center</span>
                  </div>
                  <div className="text-[11px] text-[#91899F] mt-0.5">
                    Show real-time alerts in dashboard navbar bell and history
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={inAppEnabled}
                  onChange={(e) => setInAppEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#7C3AED] rounded cursor-pointer"
                />
              </div>

              {/* Email Notifications Toggle */}
              <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#34D399]" />
                    <span>Email Delivery</span>
                  </div>
                  <div className="text-[11px] text-[#91899F] mt-0.5">
                    Deliver digest alerts and deadline reminders to your email
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#7C3AED] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Reminder Intervals */}
            <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FBBF24]" />
                  <span>Approaching Deadline Reminders</span>
                </div>
                <input
                  type="checkbox"
                  checked={deadlineAlerts}
                  onChange={(e) => setDeadlineAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#7C3AED] rounded cursor-pointer"
                />
              </div>

              <div className={`space-y-2 transition-opacity ${deadlineAlerts ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="text-[11px] text-[#91899F]">
                  Remind me before each application closing date:
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[7, 3, 1].map((days) => {
                    const active = intervals.includes(days);
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => toggleInterval(days)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? 'bg-[#7C3AED]/30 border-[#A78BFA] text-white shadow-sm'
                            : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.10)] text-[#91899F] hover:text-white'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 text-[#C4B5FD]" />}
                        <span>{days === 1 ? '1 day before' : `${days} days before`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category Subscriptions */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-[#A78BFA] uppercase tracking-wider">
                Event Subscriptions
              </span>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] cursor-pointer">
                <div>
                  <div className="font-medium text-[#F7F5FC]">Application Status Updates</div>
                  <div className="text-[10px] text-[#91899F]">Alerts when an application transitions to review, interview, or shortlisted</div>
                </div>
                <input
                  type="checkbox"
                  checked={statusAlerts}
                  onChange={(e) => setStatusAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#7C3AED] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] cursor-pointer">
                <div>
                  <div className="font-medium text-[#F7F5FC]">Action Required Alerts</div>
                  <div className="text-[10px] text-[#91899F]">Urgent alerts when additional documents or responses are required</div>
                </div>
                <input
                  type="checkbox"
                  checked={actionAlerts}
                  onChange={(e) => setActionAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#7C3AED] rounded"
                />
              </label>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-white/20 text-[#B7B0C7] hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
