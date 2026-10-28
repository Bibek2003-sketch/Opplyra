import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Bell,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function DeadlinesSidebar({
  isOpen,
  onClose,
  opportunities = [],
  savedItems = [],
  onSelectOpportunity,
  onOpenReminder,
  onNavigate
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'saved'

  // Extract upcoming opportunities sorted by deadline
  const now = new Date();
  
  const allUpcoming = opportunities
    .filter(opp => new Date(opp.deadline) >= now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const savedOppIds = new Set(
    savedItems.map(s => s.opportunityId?._id || s.opportunityId || s._id)
  );

  const displayedList = filterMode === 'saved'
    ? allUpcoming.filter(opp => savedOppIds.has(opp._id))
    : allUpcoming;

  const nearestOpp = displayedList[0];
  const otherOpps = displayedList.slice(1);

  const getDaysLeft = (dateString) => {
    const diff = new Date(dateString).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      {/* Mobile/Tablet backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm xl:hidden"
        />
      )}

      {/* Right Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-80 bg-[rgba(13,11,19,0.75)] backdrop-blur-2xl text-[#F7F5FC] flex flex-col justify-between border-l border-[rgba(255,255,255,0.12)] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[rgba(255,255,255,0.10)] bg-[rgba(14,12,21,0.55)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center shadow-sm">
                <Clock className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F7F5FC] tracking-tight font-display">
                  Upcoming Deadlines
                </h2>
                <span className="text-[11px] text-[#B7B0C7]">
                  {displayedList.length} closing soon
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#92899F] hover:text-[#F7F5FC] hover:bg-[rgba(22,18,31,0.6)] xl:hidden transition-colors cursor-pointer"
                aria-label="Close deadlines panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter: All vs Saved */}
          <div className="flex items-center p-1 bg-[rgba(10,8,15,0.60)] backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.10)] text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                  : 'text-[#B7B0C7] hover:text-[#F7F5FC]'
              }`}
            >
              All ({allUpcoming.length})
            </button>
            <button
              onClick={() => setFilterMode('saved')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                filterMode === 'saved'
                  ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                  : 'text-[#B7B0C7] hover:text-[#F7F5FC]'
              }`}
            >
              My Saved ({savedItems.length})
            </button>
          </div>
        </div>

        {/* Scrollable Deadlines Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {displayedList.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(14,12,21,0.7)] text-[#A78BFA] border border-[rgba(255,255,255,0.10)] flex items-center justify-center mx-auto text-base">
                ⏰
              </div>
              <h3 className="text-xs font-bold text-[#F7F5FC]">
                {filterMode === 'saved' ? 'No saved deadlines yet' : 'No upcoming deadlines'}
              </h3>
              <p className="text-[11px] text-[#B7B0C7] leading-relaxed">
                {filterMode === 'saved'
                  ? 'Save opportunities from the catalogue to see their deadlines here.'
                  : 'All current opportunities are recorded. Check back for newly announced dates.'}
              </p>
              {filterMode === 'saved' && (
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Browse Catalogue
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Nearest Urgency Feature Card */}
              {nearestOpp && (
                <div>
                  <div className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Closing Soonest</span>
                    <span className="flex items-center gap-1 text-[#FBBF24]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-ping" />
                      Priority
                    </span>
                  </div>

                  <div className="bg-[rgba(22,18,31,0.62)] backdrop-blur-xl border border-[rgba(255,255,255,0.14)] hover:border-[#7C3AED]/40 rounded-2xl p-4 shadow-glass transition-all group relative">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <StatusBadge status={nearestOpp.category} type="category" />
                      {(() => {
                        const days = getDaysLeft(nearestOpp.deadline);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                            days <= 2
                              ? 'bg-[#FB7185]/20 text-[#FB7185] border-[#FB7185]/40'
                              : 'bg-[#FBBF24]/15 text-[#FCD34D] border-[#FBBF24]/35'
                          }`}>
                            {days === 0 ? 'Closes Today' : days === 1 ? 'Closes Tomorrow' : `${days} days left`}
                          </span>
                        );
                      })()}
                    </div>

                    <h3
                      onClick={() => onSelectOpportunity(nearestOpp)}
                      className="text-xs sm:text-sm font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] transition-colors cursor-pointer line-clamp-2 leading-snug mb-1 font-display"
                    >
                      {nearestOpp.title}
                    </h3>

                    <div className="text-[11px] text-[#B7B0C7] truncate mb-3">
                      {nearestOpp.organization}
                    </div>

                    <div className="pt-2 border-t border-[rgba(255,255,255,0.10)] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectOpportunity(nearestOpp)}
                        className="text-[11px] font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onOpenReminder(nearestOpp)}
                        className="p-1.5 rounded-lg bg-[rgba(14,12,21,0.7)] text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[#7C3AED]/25 transition-colors cursor-pointer"
                        title="Set Reminder"
                        aria-label="Set Reminder"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Upcoming Deadlines List */}
              {otherOpps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#92899F] uppercase tracking-wider mb-2">
                    Following Deadlines ({otherOpps.length})
                  </div>

                  <div className="space-y-2.5">
                    {otherOpps.map((opp) => {
                      const days = getDaysLeft(opp.deadline);
                      const isApproaching = days <= 5;
                      const dateObj = new Date(opp.deadline);

                      return (
                        <div
                          key={opp._id}
                          className="glass-card glass-card-interactive rounded-xl p-3 transition-all duration-200 group border border-[rgba(255,255,255,0.10)]"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span
                              onClick={() => onSelectOpportunity(opp)}
                              className="text-xs font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] cursor-pointer line-clamp-1 font-display"
                            >
                              {opp.title}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                              isApproaching
                                ? 'bg-[#FBBF24]/15 text-[#FCD34D] border-[#FBBF24]/30'
                                : 'bg-[rgba(14,12,21,0.7)] text-[#B7B0C7] border-[rgba(255,255,255,0.08)]'
                            }`}>
                              {days === 0 ? 'Today' : `${days}d`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#92899F]">
                            <span className="truncate max-w-[140px]">{opp.organization}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#B7B0C7]">
                                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <button
                                onClick={() => onSelectOpportunity(opp)}
                                className="text-[#A78BFA] hover:text-[#C4B5FD] font-semibold text-[11px] ml-1 cursor-pointer"
                              >
                                View →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.10)] bg-[rgba(14,12,21,0.55)] backdrop-blur-md space-y-2.5">
          <button
            onClick={() => {
              onNavigate('reminders');
              if (onClose) onClose();
            }}
            className="w-full py-2 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Manage All Reminders</span>
          </button>

          <button
            onClick={() => {
              onNavigate('verification');
              if (onClose) onClose();
            }}
            className="w-full py-2 px-3 glass-card glass-card-interactive border border-[rgba(196,181,253,0.18)] text-[#B7B0C7] hover:text-[#F7F5FC] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Check an Announcement</span>
          </button>

          <div className="text-[10px] text-[#92899F] text-center pt-1">
            Deadlines automatically update based on official dates.
          </div>
        </div>
      </aside>
    </>
  );
}
