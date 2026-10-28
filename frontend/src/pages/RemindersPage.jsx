import React from 'react';
import {
  BellRing,
  Clock,
  Calendar,
  Trash2,
  CheckCircle2,
  Building
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export function RemindersPage({
  reminders,
  onDeleteReminder,
  onSelectOpportunity,
  onNavigate
}) {
  return (
    <div className="space-y-6 pb-12 text-[#F7F5FC]">
      {/* Intro Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F7F5FC] font-display">
              Deadlines & Reminders ({reminders.length})
            </h1>
            <p className="text-xs sm:text-sm text-[#B7B0C7] mt-0.5">
              Reminders you set for upcoming application deadlines
            </p>
          </div>

          <div className="bg-[rgba(13,11,19,0.6)] backdrop-blur-md border border-[rgba(196,181,253,0.14)] rounded-xl p-3 text-xs text-[#B7B0C7] max-w-sm">
            <span className="font-bold text-[#C4B5FD] block mb-0.5">In-App Reminders:</span>
            These alerts appear right here inside Opplyra. Email or phone notifications are not connected for this demo.
          </div>
        </div>
      </div>

      {/* Empty State */}
      {reminders.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(18,16,25,0.7)] text-[#A78BFA] border border-[rgba(196,181,253,0.16)] flex items-center justify-center mx-auto text-xl">
            ⏰
          </div>
          <h2 className="text-sm font-bold text-[#F7F5FC] font-display">No reminders yet</h2>
          <p className="text-xs text-[#B7B0C7]">
            Save an opportunity and set a reminder so you don't miss its deadline.
          </p>
          <button
            onClick={() => onNavigate('catalogue')}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Find Opportunities
          </button>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((r) => {
          const opp = r.opportunity;
          const isTriggered = r.status === 'Simulated_Delivered';
          const triggerDate = new Date(r.triggerAt);
          const deadlineDate = opp?.deadline ? new Date(opp.deadline) : null;

          return (
            <div
              key={r._id}
              className={`glass-card glass-card-interactive rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                isTriggered
                  ? 'border-[#7C3AED]/70 bg-[rgba(36,28,51,0.65)]'
                  : 'hover:border-[#7C3AED]/40'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                      isTriggered
                        ? 'bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40'
                        : 'bg-[rgba(10,8,15,0.6)] text-[#B7B0C7] border-[rgba(255,255,255,0.10)]'
                    }`}
                  >
                    {isTriggered ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#A78BFA]" />
                        <span>Deadline Due</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-[#A78BFA]" />
                        <span>Scheduled</span>
                      </>
                    )}
                  </span>

                  <span className="text-xs font-semibold text-[#EDE5FF] bg-[rgba(22,18,31,0.6)] border border-[rgba(255,255,255,0.10)] px-2.5 py-0.5 rounded-lg">
                    {r.offsetLabel || r.offset}
                  </span>

                  {opp?.category && (
                    <StatusBadge status={opp.category} type="category" />
                  )}
                </div>

                <h2
                  onClick={() => opp && onSelectOpportunity(opp)}
                  className="text-base sm:text-lg font-bold text-[#F7F5FC] hover:text-[#C4B5FD] cursor-pointer transition-colors font-display"
                >
                  {opp?.title || 'Opportunity Reference'}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#B7B0C7]">
                  {opp?.organization && (
                    <span className="flex items-center gap-1 font-medium">
                      <Building className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>{opp.organization}</span>
                    </span>
                  )}
                  {deadlineDate && (
                    <span className="flex items-center gap-1 font-semibold text-[#F7F5FC]">
                      <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Official Deadline: {deadlineDate.toLocaleDateString()}</span>
                    </span>
                  )}
                  <span className="text-white/20">•</span>
                  <span className="text-[#8F879F]">
                    Remind on: {triggerDate.toLocaleDateString()} at {triggerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.10)]">
                {opp && (
                  <button
                    onClick={() => onSelectOpportunity(opp)}
                    className="px-3.5 py-2 rounded-xl bg-[rgba(14,12,21,0.6)] hover:bg-[rgba(22,18,31,0.7)] border border-[rgba(255,255,255,0.12)] text-[#F7F5FC] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                )}
                <button
                  onClick={() => onDeleteReminder(r._id)}
                  className="p-2 rounded-xl text-[#92899F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors cursor-pointer"
                  title="Delete Reminder"
                  aria-label="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
