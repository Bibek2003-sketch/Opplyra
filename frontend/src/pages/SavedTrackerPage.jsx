import React, { useState } from 'react';
import {
  BookmarkCheck,
  Building,
  Calendar,
  ExternalLink,
  Trash2,
  Bell,
  Clock,
  FileEdit,
  Save,
  Search,
  Filter,
  CheckCircle2,
  Sliders,
  History,
  AlertTriangle,
  ArrowRight,
  Hash,
  Sparkles,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export function SavedTrackerPage({
  applications = [],
  summary = null,
  onUpdateStatus,
  onConfirmSubmission,
  onDeleteApplication,
  onOpenReminder,
  onSelectOpportunity,
  onNavigate,
  onOpenPreferences,
  onRefresh,
  onOpenPortalError,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updated');

  const handleOpenOfficialPortal = (app) => {
    const url = app.officialApplicationUrl;
    if (!url || !/^https?:\/\//i.test(url)) {
      if (onOpenPortalError) {
        onOpenPortalError({
          errorType: 'invalid_url',
          application: app,
          opportunityTitle: app.opportunityTitle,
          organization: app.organization,
          targetUrl: url,
          officialHomepageUrl: app.officialHomepageUrl,
          applicationId: app._id,
        });
      }
      return;
    }

    if (
      app.urlVerificationStatus === 'needs_review' ||
      app.urlVerificationStatus === 'unavailable' ||
      url.includes('/demo/') ||
      url.includes('-demo')
    ) {
      if (onOpenPortalError) {
        onOpenPortalError({
          errorType: 'unverified',
          application: app,
          opportunityTitle: app.opportunityTitle,
          organization: app.organization,
          targetUrl: url,
          officialHomepageUrl: app.officialHomepageUrl,
          applicationId: app._id,
        });
      }
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const statusOptions = [
    'All',
    'Interested',
    'Application Started',
    'Applied',
    'Under Review',
    'Shortlisted',
    'Selected / Awarded',
    'Rejected',
    'Action Required',
    'Withdrawn',
  ];

  const typeOptions = [
    'All',
    'Scholarships',
    'Internships',
    'Competitive Examinations',
    'Jobs & Training',
  ];

  // Calculate local fallback summary if server summary is not yet provided
  const computedSummary = summary || {
    total: applications.length,
    submitted: applications.filter((a) => a.status === 'Applied').length,
    underReview: applications.filter((a) => a.status === 'Under Review').length,
    shortlisted: applications.filter((a) => ['Shortlisted', 'Selected / Awarded'].includes(a.status)).length,
    upcomingDeadlines: applications.filter(
      (a) => a.deadline && new Date(a.deadline) > new Date() && !['Selected / Awarded', 'Rejected', 'Withdrawn'].includes(a.status)
    ).length,
    actionRequired: applications.filter((a) => a.status === 'Action Required').length,
  };

  // Filter & Sort
  const filteredApplications = applications
    .filter((app) => {
      if (statusFilter !== 'All' && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (typeFilter !== 'All' && app.opportunityType.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (app.opportunityTitle || '').toLowerCase().includes(q);
        const orgMatch = (app.organization || '').toLowerCase().includes(q);
        const refMatch = (app.externalReference || '').toLowerCase().includes(q);
        if (!titleMatch && !orgMatch && !refMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      }
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-6 pb-12 text-[#F7F5FC]">
      {/* Header Bar */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
              Application Tracking System
            </span>
            <span className="text-xs text-[#91899F]">•</span>
            <span className="text-xs text-[#C4B5FD] font-semibold">
              Single Dashboard for All Your Applications
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F7F5FC] font-display">
            My Applications ({applications.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#B7B0C7] mt-0.5">
            Apply via verified official portals, confirm submissions, and track your timeline
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenPreferences}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[#F7F5FC] text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Configure deadline reminders & email notifications"
          >
            <Bell className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Reminder Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('catalogue')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>Find Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Cards Grid (Computed from Actual Database Records) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-[#91899F] mb-1">Total Tracked</div>
          <div className="text-2xl font-bold text-white font-display">
            {computedSummary.total}
          </div>
          <div className="text-[10px] text-[#B69AFF] mt-1">In your pipeline</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-[#91899F] mb-1">Submitted</div>
          <div className="text-2xl font-bold text-[#B69AFF] font-display">
            {computedSummary.submitted}
          </div>
          <div className="text-[10px] text-[#B69AFF]/80 mt-1">Confirmed applied</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-[#91899F] mb-1">Under Review</div>
          <div className="text-2xl font-bold text-[#38BDF8] font-display">
            {computedSummary.underReview}
          </div>
          <div className="text-[10px] text-[#38BDF8]/80 mt-1">Being evaluated</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-[#91899F] mb-1">Shortlisted</div>
          <div className="text-2xl font-bold text-[#34D399] font-display">
            {computedSummary.shortlisted}
          </div>
          <div className="text-[10px] text-[#34D399]/80 mt-1">Advancing or awarded</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-[#91899F] mb-1">Upcoming Deadlines</div>
          <div className="text-2xl font-bold text-[#FBBF24] font-display">
            {computedSummary.upcomingDeadlines}
          </div>
          <div className="text-[10px] text-[#FBBF24]/80 mt-1">Closing soon</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
          <div className="text-[11px] font-medium text-[#91899F] mb-1">Action Required</div>
          <div className="text-2xl font-bold text-[#FBBF24] font-display">
            {computedSummary.actionRequired}
          </div>
          <div className="text-[10px] text-[#FBBF24]/80 mt-1">Pending submission</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by opportunity title, issuing organization, or reference ID..."
              className="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-xs text-[#F7F5FC] placeholder-[#91899F]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 glass-input rounded-xl text-xs text-[#F7F5FC] bg-[#14101F] font-medium cursor-pointer"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t} className="bg-[#14101F] text-white">
                  {t === 'All' ? 'All Categories' : t}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 glass-input rounded-xl text-xs text-[#F7F5FC] bg-[#14101F] font-medium cursor-pointer"
            >
              <option value="updated" className="bg-[#14101F] text-white">Sort: Recently Updated</option>
              <option value="deadline" className="bg-[#14101F] text-white">Sort: Nearest Deadline</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold pt-1">
          {statusOptions.map((status) => {
            const active = statusFilter.toLowerCase() === status.toLowerCase();
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  active
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm font-bold'
                    : 'glass-card border-[rgba(255,255,255,0.08)] text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Application Cards List */}
      {filteredApplications.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              {searchQuery || statusFilter !== 'All' || typeFilter !== 'All'
                ? 'No tracked applications match your filter'
                : 'No Tracked Applications Yet'}
            </h3>
            <p className="text-xs text-[#91899F] mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'All' || typeFilter !== 'All'
                ? 'Try clearing your search query or switching filters to see other applications.'
                : 'Discover verified scholarships, internships, and competitive exams in the catalogue and track them here.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setTypeFilter('All');
                }}
                className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.12)] text-xs text-[#B7B0C7] hover:text-white cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('catalogue')}
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Explore Catalogue
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const deadlineDate = app.deadline ? new Date(app.deadline) : null;
            const diffDays = deadlineDate
              ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const isUrgent = diffDays !== null && diffDays > 0 && diffDays <= 5;
            const isExpired = diffDays !== null && diffDays < 0;

            const isPendingSubmission = ['Interested', 'Application Started'].includes(app.status);

            return (
              <div
                key={app._id}
                className="glass-card rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] hover:border-[#7C3AED]/40 transition-all duration-200 relative group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Organization, Title, Badges */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={app.opportunityType} type="category" />
                      <StatusBadge status={app.status} type="pipeline" />
                      <StatusBadge status={app.statusSource || 'Manual Update'} type="source" />
                      {app.externalReference && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-[#14101F] text-[#DDD6FE] border border-[rgba(255,255,255,0.10)]">
                          <Hash className="w-3 h-3 text-[#A78BFA]" />
                          <span>{app.externalReference}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#B7B0C7]">
                      <Building className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
                      <span className="font-medium truncate">{app.organization}</span>
                    </div>

                    <h2
                      onClick={() => onSelectOpportunity && onSelectOpportunity(app)}
                      className="text-base sm:text-lg font-bold text-white hover:text-[#C4B5FD] transition-colors cursor-pointer line-clamp-1 font-display"
                    >
                      {app.opportunityTitle}
                    </h2>

                    {/* Submission Date / Deadline Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#B7B0C7] pt-1">
                      {app.applicationDate ? (
                        <div className="flex items-center gap-1.5 text-[#34D399]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            Submitted on {new Date(app.applicationDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Not yet submitted on external portal</span>
                        </div>
                      )}

                      {deadlineDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span className={isUrgent ? 'text-amber-400 font-semibold' : isExpired ? 'text-rose-400 font-semibold' : ''}>
                            Deadline: {deadlineDate.toLocaleDateString()} {isExpired ? '(Passed)' : `(${diffDays} days left)`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes Snippet if present */}
                    {app.notes && (
                      <p className="text-xs text-[#D8D2E7] line-clamp-1 pt-1 italic">
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[rgba(255,255,255,0.06)]">
                    {/* Official Portal Button with Link Validation */}
                    {app.officialApplicationUrl && (
                      <button
                        type="button"
                        onClick={() => handleOpenOfficialPortal(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.10)] text-[#F7F5FC] text-xs font-semibold transition-all cursor-pointer"
                        title="Open external application portal safely"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#A78BFA]" />
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Prominent "Did you submit?" button for pending items */}
                      {isPendingSubmission && (
                        <button
                          type="button"
                          onClick={() => onConfirmSubmission && onConfirmSubmission(app)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Confirm you completed and submitted on external portal"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Confirm Submitted</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onUpdateStatus && onUpdateStatus(app)}
                        className="px-3 py-1.5 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/35 text-[#C4B5FD] border border-[#7C3AED]/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Status</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectOpportunity && onSelectOpportunity(app)}
                        className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] text-[#91899F] hover:text-white transition-colors cursor-pointer"
                        title="View Full Status History & Details"
                        aria-label="View Full Status History & Details"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteApplication && onDeleteApplication(app._id)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-[#91899F] hover:text-rose-300 transition-colors cursor-pointer"
                        title="Untrack this application"
                        aria-label="Untrack this application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
