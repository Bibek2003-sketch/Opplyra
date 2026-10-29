import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  BookOpen,
  Rocket,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityRow } from '../components/OpportunityRow';

export function DashboardPage({
  summary,
  profile,
  onNavigate,
  onSelectOpportunity,
  savedMap,
  onToggleSave,
  onOpenReminder,
  onApplyNow,
}) {
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' (primary) | 'cards'

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('catalogue', { search: dashboardSearch });
  };

  const categories = [
    {
      name: 'Scholarships',
      icon: GraduationCap,
      color: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/15',
      iconBorder: 'border-[#38BDF8]/25',
      hoverBorder: 'hover:border-[#38BDF8]/40',
      desc: 'Government, merit & need-based student grants',
    },
    {
      name: 'Internships',
      icon: Briefcase,
      color: 'text-[#34D399]',
      iconBg: 'bg-[#34D399]/15',
      iconBorder: 'border-[#34D399]/25',
      hoverBorder: 'hover:border-[#34D399]/40',
      desc: 'Industry & research internships across disciplines',
    },
    {
      name: 'Competitive Examinations',
      icon: BookOpen,
      color: 'text-[#FBBF24]',
      iconBg: 'bg-[#FBBF24]/15',
      iconBorder: 'border-[#FBBF24]/25',
      hoverBorder: 'hover:border-[#FBBF24]/40',
      desc: 'GATE, RBI, UPSC and national test opportunities',
    },
    {
      name: 'Jobs & Training',
      icon: Rocket,
      color: 'text-[#FB7185]',
      iconBg: 'bg-[#FB7185]/15',
      iconBorder: 'border-[#FB7185]/25',
      hoverBorder: 'hover:border-[#FB7185]/40',
      desc: 'Early career graduate programs & apprenticeships',
    },
  ];

  const recommendedOpportunities = summary?.recommended || [];
  const totalCount = summary?.totalOpportunities ?? 8;

  return (
    <div className="space-y-8 pb-12 text-[#F7F5FC]">
      {/* ======================================================== */}
      {/* 1. EDITORIAL HERO SECTION                                */}
      {/* Clean headline, focused search bar, compact student tag  */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-6 sm:p-9 lg:p-10 shadow-sm">
        {/* Subtle violet-to-blue ambient glow behind the hero section */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7C3AED]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Compact Student Context & Pill */}
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-[#B69AFF] backdrop-blur-md">
            <span className="flex items-center gap-1.5 font-semibold text-[#B69AFF]">
              <Sparkles className="w-3 h-3 text-[#B69AFF]" />
              Opplyra Discovery
            </span>
            <span className="text-[#6B637B]">•</span>
            <span className="text-[#B7B0C7]">
              Curated for <strong className="text-[#F7F5FC] font-semibold">{profile?.fullName || 'Student'}</strong>
              {profile?.course ? ` • ${profile.course}` : ''}
              {profile?.academicYear ? ` (${profile.academicYear})` : ''}
            </span>
          </div>

          {/* Editorial Display Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F7F5FC] leading-[1.12] font-display">
            Find Opportunities That Fit Your Journey
          </h1>

          <p className="text-xs sm:text-sm text-[#B7B0C7] max-w-2xl leading-relaxed">
            Discover verified scholarships, internships, competitive exams, and training programs.
            Verify eligibility criteria, track application milestones, and never miss an official deadline.
          </p>

          {/* Integrated Prominent Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative pt-2 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[#91899F]" />
              <input
                type="text"
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                placeholder="Search scholarships, internships, exams, or jobs…"
                className="w-full pl-11 pr-32 py-3.5 rounded-2xl bg-[rgba(14,12,19,0.60)] border border-white/[0.12] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/25 text-xs sm:text-sm text-[#F7F5FC] placeholder-[#91899F] transition-all outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. UNIFIED METRICS STRIP                                 */}
      {/* Typography & hairline dividers with distinct accent icons*/}
      {/* ======================================================== */}
      <section aria-label="Dashboard Key Metrics">
        <div className="rounded-2xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07]">
            {/* Metric 1: Total Opportunities (Scholarship Blue) */}
            <div className="p-3 sm:px-5 sm:py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#B7B0C7] tracking-wider uppercase">
                  Available Opportunities
                </span>
                <div className="w-6 h-6 rounded-md bg-[#38BDF8]/15 border border-[#38BDF8]/25 text-[#38BDF8] flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F7F5FC] font-display">
                {totalCount}
              </div>
              <p className="text-[11px] text-[#91899F] mt-1 font-medium">
                Across 4 main sectors
              </p>
            </div>

            {/* Metric 2: Saved to Apply (Soft Lavender) */}
            <div className="p-3 sm:px-5 sm:py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#B7B0C7] tracking-wider uppercase">
                  Saved to Apply
                </span>
                <div className="w-6 h-6 rounded-md bg-[#B69AFF]/15 border border-[#B69AFF]/25 text-[#B69AFF] flex items-center justify-center">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F7F5FC] font-display">
                {summary?.savedCount ?? 0}
              </div>
              <p className="text-[11px] text-[#91899F] mt-1 font-medium">
                Saved in your tracker
              </p>
            </div>

            {/* Metric 3: In Progress (Internship Green) */}
            <div className="p-3 sm:px-5 sm:py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#B7B0C7] tracking-wider uppercase">
                  In Progress
                </span>
                <div className="w-6 h-6 rounded-md bg-[#34D399]/15 border border-[#34D399]/25 text-[#34D399] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F7F5FC] font-display">
                {summary?.inProgressCount ?? 0}
              </div>
              <p className="text-[11px] text-[#91899F] mt-1 font-medium">
                Active & submitted
              </p>
            </div>

            {/* Metric 4: Upcoming Deadlines (Deadline Amber) */}
            <div className="p-3 sm:px-5 sm:py-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#B7B0C7] tracking-wider uppercase">
                  Upcoming Deadlines
                </span>
                <div className="w-6 h-6 rounded-md bg-[#FBBF24]/15 border border-[#FBBF24]/25 text-[#FBBF24] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#F7F5FC] font-display">
                {(summary?.upcomingDeadlines || []).length}
              </div>
              <p className="text-[11px] text-[#91899F] mt-1 font-medium">
                Closing soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. COMPACT OPPORTUNITY CATEGORIES                        */}
      {/* Clean tiles with restrained multi-accent icon colors     */}
      {/* ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#B69AFF] uppercase tracking-wider">
            Explore by Category
          </h2>
          <button
            onClick={() => onNavigate('catalogue')}
            className="text-xs font-semibold text-[#B69AFF] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.name}
                onClick={() => onNavigate('catalogue', { category: c.name })}
                className={`group p-4 rounded-xl bg-[rgba(21,18,28,0.50)] hover:bg-[rgba(26,22,35,0.70)] border border-white/[0.07] ${c.hoverBorder} transition-all duration-200 text-left flex items-start gap-3.5 cursor-pointer`}
              >
                <div className={`w-9 h-9 rounded-lg ${c.iconBg} border ${c.iconBorder} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-[#F7F5FC] group-hover:text-white transition-colors font-display truncate">
                      {c.name}
                    </h3>
                    <ArrowRight className="w-3 h-3 text-[#91899F] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-[#91899F] line-clamp-1 mt-0.5 font-normal leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. RECOMMENDED OPPORTUNITIES                             */}
      {/* Compact List Rows as primary presentation, toggleable    */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#F7F5FC] font-display">
              Recommended for You
            </h2>
            <p className="text-xs text-[#B7B0C7] font-medium">
              Matches based on {profile?.course || 'your course'} • {profile?.academicYear || 'your study year'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: List (Default) vs Cards */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[rgba(10,8,15,0.60)] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#91899F] hover:text-[#F7F5FC]'
                }`}
                title="List View (Compact)"
                aria-label="List View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-[#91899F] hover:text-[#F7F5FC]'
                }`}
                title="Card View (Expanded)"
                aria-label="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('catalogue')}
              className="text-xs font-semibold text-[#B69AFF] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Browse All ({totalCount})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Primary View: Polished Compact Rows */}
        {viewMode === 'list' ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[rgba(21,18,28,0.50)] backdrop-blur-xl divide-y divide-white/[0.06] overflow-hidden">
            {recommendedOpportunities.map((opp) => (
              <OpportunityRow
                key={opp._id}
                opportunity={opp}
                onSelect={onSelectOpportunity}
                isSaved={!!savedMap[opp._id]}
                savedStatus={savedMap[opp._id]?.status}
                onToggleSave={onToggleSave}
                onApplyNow={onApplyNow}
              />
            ))}
            {recommendedOpportunities.length === 0 && (
              <div className="p-8 text-center text-xs text-[#91899F]">
                No specific recommendations currently found. Browse the catalogue to see all opportunities.
              </div>
            )}
          </div>
        ) : (
          /* Secondary View: Expanded Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
            {recommendedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                onSelect={onSelectOpportunity}
                isSaved={!!savedMap[opp._id]}
                savedStatus={savedMap[opp._id]?.status}
                onToggleSave={onToggleSave}
                onSetReminder={onOpenReminder}
                onApplyNow={onApplyNow}
              />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. VERIFICATION SCAM NOTICE CALLOUT                      */}
      {/* Clean editorial callout replacing heavy card             */}
      {/* ======================================================== */}
      <section className="rounded-2xl border border-white/[0.08] bg-[rgba(21,18,28,0.50)] backdrop-blur-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-[#B69AFF] font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B69AFF]" />
            <span>Check Announcements for Scams</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#F7F5FC] font-display">
            Received a circular or message asking for application fees?
          </h3>
          <p className="text-xs text-[#B7B0C7] leading-relaxed">
            Verify circulars, unofficial emails, or suspicious domains with our scam detection tool before sharing personal documents or paying fees.
          </p>
        </div>

        <button
          onClick={() => onNavigate('verification')}
          className="shrink-0 py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>Verify Announcement</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
}
