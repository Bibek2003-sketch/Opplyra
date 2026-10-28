import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

export function Navbar({
  onToggleSidebar,
  onOpenSidebar,
  onCloseSidebar,
  activeTab,
  onOpenProfile,
  onOpenVerification,
  profile,
  onToggleDeadlines,
  deadlinesCount = 0
}) {
  const titles = {
    dashboard: {
      title: 'Discover Opportunities',
      subtitle: 'Find scholarships, internships, and jobs that fit you.'
    },
    catalogue: {
      title: 'Find Opportunities',
      subtitle: 'Search scholarships, internships, exams, and training.'
    },
    verification: {
      title: 'Check an Announcement',
      subtitle: 'Paste an announcement or link to check for warning signs.'
    },
    tracker: {
      title: 'My Applications',
      subtitle: 'Organize and track the opportunities you want to apply for.'
    },
    reminders: {
      title: 'Deadlines & Reminders',
      subtitle: 'Set helpful alerts so you never miss an application deadline.'
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-[rgba(13,11,19,0.72)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.12)] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-[#F7F5FC]">
      {/* 1. Left Logo + 2. Center/Left Title Area */}
      <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
        {/* Compact Opplyra Brand Logo (Enforced: 96px x 46px) */}
        <button
          type="button"
          onMouseEnter={onOpenSidebar}
          onMouseLeave={onCloseSidebar}
          onClick={onToggleSidebar}
          className="navbar-logo-container bg-[#FAF8F2] hover:bg-white border border-white/25 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 shrink-0"
          title="Open menu"
          aria-label="Open navigation menu"
        >
          <img
            src="/logo.png"
            alt="Opplyra — Opportunities for a Brighter You"
            className="select-none pointer-events-none"
          />
        </button>

        {/* Flexible Page Heading & Subtitle Area */}
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-bold text-[#F7F5FC] tracking-tight leading-tight font-display truncate">
            {current.title}
          </h1>
          <p className="text-xs text-[#91899F] hidden sm:block font-normal truncate mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* 3. Right: Action Buttons & User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Deadlines Shortcut */}
        <button
          onClick={onToggleDeadlines}
          className="h-9 px-3 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-[rgba(167,139,250,0.30)] bg-[rgba(22,18,31,0.55)] hover:bg-[rgba(32,25,46,0.70)] text-[#F7F5FC] inline-flex items-center gap-2 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 active:scale-[0.98]"
          title="Open Upcoming Deadlines Sidebar"
          aria-label="Upcoming Deadlines"
        >
          <Clock className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
          <span className="hidden md:inline">Deadlines</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[rgba(124,58,237,0.20)] text-[#C4B5FD] text-[10px] font-semibold border border-[rgba(167,139,250,0.25)]">
            {deadlinesCount}
          </span>
        </button>

        {/* Check an Announcement Shortcut */}
        <button
          onClick={onOpenVerification}
          className="h-9 px-3.5 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-[rgba(167,139,250,0.30)] bg-[rgba(22,18,31,0.55)] hover:bg-[rgba(32,25,46,0.70)] text-[#F7F5FC] hidden md:inline-flex items-center gap-2 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 active:scale-[0.98]"
          title="Check an Announcement for safety"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
          <span className="hidden lg:inline">Check an Announcement</span>
          <span className="lg:hidden">Check Notice</span>
        </button>

        {/* User Profile Control */}
        <button
          onClick={onOpenProfile}
          className="h-9 px-2.5 sm:px-3 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-[rgba(167,139,250,0.30)] bg-[rgba(22,18,31,0.55)] hover:bg-[rgba(32,25,46,0.70)] text-[#F7F5FC] inline-flex items-center gap-2 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 active:scale-[0.98]"
          title="View Student Profile"
          aria-label="User Profile"
        >
          <div className="w-5.5 h-5.5 rounded-lg bg-[rgba(124,58,237,0.22)] text-[#C4B5FD] border border-[rgba(167,139,250,0.30)] flex items-center justify-center font-bold text-[11px] font-display shrink-0">
            {profile?.fullName ? profile.fullName.charAt(0) : 'P'}
          </div>
          <span className="font-semibold text-[#F7F5FC] hidden sm:inline max-w-[110px] truncate">
            {profile?.fullName ? profile.fullName.split(' ')[0] : 'My Profile'}
          </span>
        </button>
      </div>
    </header>
  );
}
