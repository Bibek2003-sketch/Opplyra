import React from 'react';
import { Bookmark, ExternalLink, Building, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function OpportunityRow({
  opportunity,
  onSelect,
  isSaved,
  savedStatus,
  onToggleSave,
  onApplyNow,
}) {
  const deadlineDate = new Date(opportunity.deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays > 0 && diffDays <= 5;
  const isCritical = diffDays > 0 && diffDays <= 2;
  const isExpired = diffDays < 0;

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="group px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.025] transition-all cursor-pointer text-[#F7F5FC]"
    >
      {/* Left / Info Column */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Meta badges: Category, Organization, Saved Status */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <StatusBadge status={opportunity.category} type="category" />

          <span className="text-[#6B637B] hidden sm:inline">•</span>

          <span className="inline-flex items-center gap-1 text-xs text-[#B7B0C7] font-medium truncate max-w-[200px]">
            <Building className="w-3.5 h-3.5 text-[#B69AFF] shrink-0" />
            <span className="truncate">{opportunity.organization}</span>
          </span>

          {opportunity.stipendOrAward && opportunity.stipendOrAward !== 'Not specified' && (
            <span className="text-[11px] font-semibold text-[#B69AFF] bg-[#7C3AED]/15 px-2 py-0.5 rounded-md border border-[#7C3AED]/30">
              {opportunity.stipendOrAward}
            </span>
          )}

          {isSaved && savedStatus && (
            <span className="inline-flex items-center gap-1">
              <span className="text-[#6B637B] hidden sm:inline">•</span>
              <StatusBadge status={savedStatus} type="pipeline" />
            </span>
          )}
        </div>

        {/* Opportunity Title */}
        <h3 className="text-base sm:text-[17px] font-bold text-[#F7F5FC] group-hover:text-[#F3E8FF] transition-colors font-display line-clamp-1 leading-snug">
          {opportunity.title}
        </h3>

        {/* Short description / Eligibility preview */}
        <p className="text-xs text-[#91899F] line-clamp-1 leading-relaxed max-w-3xl font-normal">
          {opportunity.eligibilitySummary || opportunity.shortDescription}
        </p>
      </div>

      {/* Right / Deadline & Action Buttons */}
      <div
        className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.05]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deadline Indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <Clock
            className={`w-3.5 h-3.5 shrink-0 ${
              isCritical
                ? 'text-[#FB7185]'
                : isUrgent
                ? 'text-[#FBBF24]'
                : isExpired
                ? 'text-[#FB7185]'
                : 'text-[#91899F]'
            }`}
          />
          <span
            className={`font-semibold text-xs ${
              isCritical
                ? 'text-[#FB7185]'
                : isUrgent
                ? 'text-[#FCD34D]'
                : isExpired
                ? 'text-[#FB7185]'
                : 'text-[#B7B0C7]'
            }`}
          >
            {isExpired
              ? 'Closed'
              : diffDays === 0
              ? 'Closes Today'
              : diffDays === 1
              ? '1 day left'
              : `${diffDays} days left`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opportunity._id);
            }}
            className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
              isSaved
                ? 'bg-[#7C3AED]/20 text-[#B69AFF] border-[#7C3AED]/35 shadow-sm'
                : 'text-[#91899F] hover:text-[#F7F5FC] hover:bg-white/[0.05] border-white/[0.08]'
            }`}
            title={isSaved ? 'Saved in My Applications' : 'Save opportunity'}
            aria-label={isSaved ? 'Unsave opportunity' : 'Save opportunity'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Details Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(opportunity);
            }}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-white/[0.10] hover:border-white/[0.20] bg-white/[0.03] hover:bg-white/[0.08] text-[#F7F5FC] transition-all cursor-pointer"
          >
            Details
          </button>

          {/* Apply Now Button */}
          {opportunity.sourceUrl && opportunity.urlVerificationStatus !== 'unavailable' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onApplyNow) {
                  onApplyNow(opportunity);
                } else {
                  window.open(opportunity.sourceUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                opportunity.urlVerificationStatus === 'needs_review'
                  ? 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/30'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white active:scale-[0.98]'
              }`}
              title={
                opportunity.urlVerificationStatus === 'needs_review'
                  ? 'Official link pending manual review'
                  : 'Open verified official portal'
              }
            >
              <span>{opportunity.urlVerificationStatus === 'needs_review' ? 'Review Link' : 'Apply Now'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opportunity);
              }}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-white/[0.04] text-[#B7B0C7] border border-white/[0.08] cursor-pointer"
            >
              Notice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

