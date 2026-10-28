import React from 'react';

export function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  // Category Badges in Black & Violet theme
  if (type === 'category') {
    const categoryColors = {
      'Scholarships': 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30',
      'Internships': 'bg-[#7C3AED]/15 text-[#C4B5FD] border-[#7C3AED]/35',
      'Competitive Examinations': 'bg-[#60A5FA]/15 text-[#93C5FD] border-[#60A5FA]/35',
      'Jobs & Training': 'bg-[#34D399]/15 text-[#6EE7B7] border-[#34D399]/35',
    };
    const style = categoryColors[status] || 'bg-[#17141F] text-[#F7F5FC] border-[#30283D]';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${style}`}>
        {status}
      </span>
    );
  }

  // Application Pipeline Badges
  if (type === 'pipeline') {
    const labels = {
      'Interested': 'Saved',
      'Preparing': 'Planning to Apply',
      'Applied': 'Applied',
      'Completed': 'Completed',
    };
    const pipelineColors = {
      'Interested': 'bg-[#1E1929] text-[#B7B0C7] border-[#30283D]',
      'Preparing': 'bg-[#FBBF24]/15 text-[#FCD34D] border-[#FBBF24]/35',
      'Applied': 'bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40',
      'Completed': 'bg-[#34D399]/20 text-[#6EE7B7] border-[#34D399]/40',
    };
    const style = pipelineColors[status] || 'bg-[#17141F] text-[#F7F5FC] border-[#30283D]';
    const displayLabel = labels[status] || status;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border ${style}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
        {displayLabel}
      </span>
    );
  }

  // Eligibility Badges
  if (type === 'eligibility') {
    if (status === 'MATCHED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/35">
          <span className="mr-1">✓</span> Matches Profile
        </span>
      );
    }
    if (status === 'UNMATCHED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/35">
          <span className="mr-1">✕</span> Doesn't Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
        <span className="mr-1">?</span> Check Official Rules
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#17141F] text-[#F7F5FC] border border-[#30283D]">
      {status}
    </span>
  );
}
