import React from 'react';

export function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  // Category Badges in Balanced Multi-Accent System
  if (type === 'category') {
    const categoryColors = {
      'Scholarships': 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
      'Internships': 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
      'Competitive Examinations': 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
      'Jobs & Training': 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30',
    };
    const style = categoryColors[status] || 'bg-[#15121C] text-[#F7F5FC] border-white/[0.10]';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${style}`}>
        {status}
      </span>
    );
  }

  // 10 Application Tracking Pipeline Badges (Semantic Multi-Accent)
  if (type === 'pipeline' || type === 'status') {
    const pipelineColors = {
      // Violet: Active or interested states
      'Applied': 'bg-[#7C3AED]/20 text-[#B69AFF] border-[#7C3AED]/35',
      'Interested': 'bg-[#7C3AED]/15 text-[#B69AFF] border-[#7C3AED]/25',

      // Blue: In-progress evaluation states
      'Application Started': 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/35',
      'Under Review': 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/35',
      'Shortlisted': 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/35',

      // Green: Successful outcome states
      'Selected / Awarded': 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/35',
      'Completed': 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/35',

      // Amber: Action required and approaching deadlines
      'Action Required': 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/35',
      'Preparing': 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/35',

      // Coral: Rejected or overdue states
      'Rejected': 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/35',
      'Deadline Passed': 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/35',

      // Neutral slate
      'Withdrawn': 'bg-[#3F3F46]/25 text-[#A1A1AA] border-[#3F3F46]/40',
    };

    const style = pipelineColors[status] || 'bg-[#15121C] text-[#F7F5FC] border-white/[0.10]';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border ${style}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-90" />
        {status}
      </span>
    );
  }

  // Update Source Badges (Discloses User-Reported vs Official Verification)
  if (type === 'source') {
    const sourceStyles = {
      'User Confirmed': {
        label: 'Student Confirmed',
        style: 'bg-[#7C3AED]/15 text-[#B69AFF] border-[#7C3AED]/30',
      },
      'Manual Update': {
        label: 'User Reported',
        style: 'bg-white/[0.04] text-[#B69AFF] border-white/[0.10]',
      },
      'Official Integration': {
        label: 'Official Verification',
        style: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/35',
      },
      'Email Notification': {
        label: 'Email Alert',
        style: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/35',
      },
    };

    const conf = sourceStyles[status] || {
      label: status,
      style: 'bg-[rgba(255,255,255,0.05)] text-[#B7B0C7] border-[rgba(255,255,255,0.10)]',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${conf.style}`}>
        {conf.label}
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
