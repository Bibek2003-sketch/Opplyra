import React, { useState } from 'react';
import {
  Clock,
  X,
  ChevronRight,
  Bookmark,
  Bell,
  ArrowRight,
  ShieldAlert,
  ChevronLeft
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs xl:hidden"
        />
      )}

      {/* Right Sidebar Panel: Collapsible on both Desktop and Mobile */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-80 bg-[rgba(13,11,19,0.90)] backdrop-blur-2xl text-[#F7F5FC] flex flex-col justify-between border-l border-white/[0.08] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[rgba(14,12,21,0.40)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/25 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F7F5FC] tracking-tight font-display">
                  Deadlines
                </h2>
                <span className="text-[11px] text-[#91899F]">
                  {displayedList.length} closing soon
                </span>
              </div>
            </div>

            {/* Desktop & Mobile Collapse Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#91899F] hover:text-[#F7F5FC] hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse deadlines panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter: All vs Saved */}
          <div className="flex items-center p-0.5 bg-[rgba(10,8,15,0.60)] backdrop-blur-md rounded-xl border border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#7C3AED] text-white shadow-xs font-bold'
                  : 'text-[#91899F] hover:text-[#F7F5FC]'
              }`}
            >
              All ({allUpcoming.length})
            </button>
            <button
              onClick={() => setFilterMode('saved')}
              className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                filterMode === 'saved'
                  ? 'bg-[#7C3AED] text-white shadow-xs font-bold'
                  : 'text-[#91899F] hover:text-[#F7F5FC]'
              }`}
            >
              Saved ({savedItems.length})
            </button>
          </div>
        </div>

        {/* Scrollable Deadlines Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {displayedList.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-[#A78BFA] flex items-center justify-center mx-auto text-sm">
                ⏰
              </div>
              <h3 className="text-xs font-bold text-[#F7F5FC]">
                {filterMode === 'saved' ? 'No saved deadlines' : 'No upcoming deadlines'}
              </h3>
              <p className="text-[11px] text-[#91899F] leading-relaxed">
                {filterMode === 'saved'
                  ? 'Save opportunities to track their deadlines here.'
                  : 'All recorded deadlines are currently closed.'}
              </p>
              {filterMode === 'saved' && (
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Browse Catalogue
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Nearest Urgency Feature Card: Emphasize closing soonest */}
              {nearestOpp && (
                <div>
                  <div className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
                      Closing Soonest
                    </span>
                    <span className="text-[#91899F] font-medium text-[10px]">Priority</span>
                  </div>

                  <div className="border-l-2 border-l-[#FBBF24] bg-white/[0.02] hover:bg-white/[0.04] rounded-xl p-3.5 border-t border-r border-b border-white/[0.06] transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <StatusBadge status={nearestOpp.category} type="category" />
                      {(() => {
                        const days = getDaysLeft(nearestOpp.deadline);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            days <= 2
                              ? 'bg-[#FB7185]/20 text-[#FB7185] border-[#FB7185]/40'
                              : 'bg-[#FBBF24]/15 text-[#FCD34D] border-[#FBBF24]/35'
                          }`}>
                            {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d left`}
                          </span>
                        );
                      })()}
                    </div>

                    <h3
                      onClick={() => onSelectOpportunity(nearestOpp)}
                      className="text-xs sm:text-sm font-bold text-[#F7F5FC] group-hover:text-[#F3E8FF] transition-colors cursor-pointer line-clamp-2 leading-snug mb-1 font-display"
                    >
                      {nearestOpp.title}
                    </h3>

                    <div className="text-[11px] text-[#91899F] truncate mb-2.5">
                      {nearestOpp.organization}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectOpportunity(nearestOpp)}
                        className="text-[11px] font-semibold text-[#B69AFF] hover:text-[#F3E8FF] flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onOpenReminder(nearestOpp)}
                        className="p-1 rounded-lg text-[#91899F] hover:text-[#F7F5FC] hover:bg-[#7C3AED]/20 transition-colors cursor-pointer"
                        title="Set Reminder"
                        aria-label="Set Reminder"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Upcoming Deadlines List: Compact Rows with Hairline Dividers */}
              {otherOpps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#91899F] uppercase tracking-wider mb-1">
                    Following Deadlines ({otherOpps.length})
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] divide-y divide-white/[0.05] overflow-hidden">
                    {otherOpps.map((opp) => {
                      const days = getDaysLeft(opp.deadline);
                      const isApproaching = days <= 5;
                      const dateObj = new Date(opp.deadline);

                      return (
                        <div
                          key={opp._id}
                          onClick={() => onSelectOpportunity(opp)}
                          className="p-3 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#F7F5FC] group-hover:text-[#C4B5FD] line-clamp-1 font-display">
                              {opp.title}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 border ${
                              isApproaching
                                ? 'bg-[#FBBF24]/15 text-[#FCD34D] border-[#FBBF24]/30'
                                : 'bg-white/[0.03] text-[#91899F] border-white/[0.06]'
                            }`}>
                              {days === 0 ? 'Today' : `${days}d`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#91899F]">
                            <span className="truncate max-w-[150px]">{opp.organization}</span>
                            <span className="text-[10px] text-[#B7B0C7]">
                              {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
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
        <div className="p-4 border-t border-white/[0.08] bg-[rgba(14,12,21,0.40)] backdrop-blur-md space-y-2">
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
            className="w-full py-2 px-3 rounded-xl border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.02] hover:bg-white/[0.05] text-[#B7B0C7] hover:text-[#F7F5FC] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#B69AFF]" />
            <span>Check an Announcement</span>
          </button>
        </div>
      </aside>
    </>
  );
}
