import React from 'react';
import { Bookmark, ExternalLink, Building, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function OpportunityCard({
  opportunity,
  onSelect,
  isSaved,
  savedStatus,
  onToggleSave
}) {
  const deadlineDate = new Date(opportunity.deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays > 0 && diffDays <= 5;
  const isExpired = diffDays < 0;

  return (
    <div className="glass-card glass-card-interactive rounded-2xl p-5 flex flex-col justify-between group relative text-[#F7F5FC]">
      {/* Top Meta row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={opportunity.category} type="category" />
            {opportunity.isDemonstration && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-lg bg-[rgba(22,18,31,0.6)] text-[#B7B0C7] border border-[rgba(255,255,255,0.10)]">
                Sample Listing
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opportunity._id);
            }}
            className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
              isSaved
                ? 'bg-[#7C3AED]/25 text-[#C4B5FD] border-[#7C3AED]/40 shadow-sm'
                : 'text-[#92899F] hover:text-[#F7F5FC] hover:bg-[rgba(22,18,31,0.6)] border-transparent'
            }`}
            title={isSaved ? 'Saved in My Applications' : 'Save this opportunity'}
            aria-label={isSaved ? 'Unsave opportunity' : 'Save opportunity'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Organization & Title */}
        <div className="flex items-center gap-1.5 text-xs text-[#B7B0C7] mb-1.5 font-medium">
          <Building className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
          <span className="truncate">{opportunity.organization}</span>
        </div>

        <h3
          onClick={() => onSelect(opportunity)}
          className="text-base font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] transition-colors cursor-pointer line-clamp-2 leading-snug mb-2 font-display"
        >
          {opportunity.title}
        </h3>

        <p className="text-xs text-[#B7B0C7] line-clamp-2 mb-4 leading-relaxed font-normal">
          {opportunity.shortDescription}
        </p>

        {/* Stated Eligibility Snapshot Box */}
        <div className="bg-[rgba(10,8,15,0.48)] border border-[rgba(255,255,255,0.10)] rounded-xl p-3 mb-4 backdrop-blur-md">
          <div className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-1">
            Eligibility Summary
          </div>
          <p className="text-xs text-[#EDE5FF] line-clamp-2 leading-relaxed">
            {opportunity.eligibilitySummary}
          </p>
        </div>
      </div>

      {/* Bottom Footer Info & Actions */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.10)] mt-1">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-[#FBBF24]' : isExpired ? 'text-[#FB7185]' : 'text-[#92899F]'}`} />
            <span className={`font-semibold ${isUrgent ? 'text-[#FBBF24]' : isExpired ? 'text-[#FB7185]' : 'text-[#B7B0C7]'}`}>
              {isExpired ? 'Application Closed' : diffDays === 0 ? 'Closes Today' : `${diffDays} days left`}
            </span>
          </div>

          {opportunity.stipendOrAward && opportunity.stipendOrAward !== 'Not specified' && (
            <div className="font-semibold text-[#C4B5FD] text-[11px] bg-[#7C3AED]/20 px-2.5 py-0.5 rounded-lg border border-[#7C3AED]/40 shadow-sm">
              {opportunity.stipendOrAward}
            </div>
          )}
        </div>

        {/* Saved status indicator */}
        {isSaved && savedStatus && (
          <div className="mb-3 flex items-center justify-between bg-[rgba(10,8,15,0.48)] px-2.5 py-1.5 rounded-xl border border-[rgba(255,255,255,0.10)] text-xs">
            <span className="text-[11px] font-medium text-[#B7B0C7]">Status:</span>
            <StatusBadge status={savedStatus} type="pipeline" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(opportunity)}
            className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-all text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>View Details & Eligibility</span>
          </button>

          {opportunity.sourceUrl && (
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(10,8,15,0.52)] text-[#B7B0C7] hover:text-[#F7F5FC] hover:border-[#7C3AED]/50 hover:bg-[rgba(22,18,31,0.6)] transition-all cursor-pointer"
              title="Open Official Website"
              aria-label="Open Official Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
