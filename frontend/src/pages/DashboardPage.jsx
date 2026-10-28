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
  Rocket
} from 'lucide-react';
import { OpportunityCard } from '../components/OpportunityCard';

export function DashboardPage({
  summary,
  profile,
  onNavigate,
  onSelectOpportunity,
  savedMap,
  onToggleSave,
  onOpenReminder
}) {
  const [dashboardSearch, setDashboardSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('catalogue', { search: dashboardSearch });
  };

  const categories = [
    {
      name: 'Scholarships',
      icon: GraduationCap,
      color: 'text-[#FBBF24]',
      desc: 'Financial support and grants to fund your studies.'
    },
    {
      name: 'Internships',
      icon: Briefcase,
      color: 'text-[#A78BFA]',
      desc: 'Hands-on industry and research experience.'
    },
    {
      name: 'Competitive Examinations',
      icon: BookOpen,
      color: 'text-[#60A5FA]',
      desc: 'National exams including GATE, RBI, and Civil Services.'
    },
    {
      name: 'Jobs & Training',
      icon: Rocket,
      color: 'text-[#34D399]',
      desc: 'Graduate programs, apprenticeships, and entry roles.'
    },
  ];

  return (
    <div className="space-y-8 pb-12 text-[#F7F5FC]">
      {/* Welcome Hero Panel (Black & Violet Glassmorphism) */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-9 text-[#F7F5FC] shadow-glass">
        {/* Subtle violet ambient glow behind the panel */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-[#7C3AED]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#8B5CF6]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/15 text-[#C4B5FD] text-[11px] font-bold tracking-wider uppercase border border-[#7C3AED]/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>YOUR NEXT OPPORTUNITY STARTS HERE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F7F5FC] leading-[1.15] font-display">
              Find Opportunities That Fit You
            </h1>

            <p className="text-xs sm:text-sm text-[#B7B0C7] max-w-xl leading-relaxed">
              Explore scholarships, internships, exams, and jobs in one place. Check eligibility, review sources, and keep track of deadlines.
            </p>

            {/* Prominent Glass Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative pt-2 max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-[#92899F]" />
                <input
                  type="text"
                  value={dashboardSearch}
                  onChange={(e) => setDashboardSearch(e.target.value)}
                  placeholder="Search scholarships, internships, exams, or jobs…"
                  className="w-full pl-11 pr-32 py-3.5 rounded-2xl glass-input placeholder-[#92899F] text-xs sm:text-sm font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Hero Showcase Element (5 Cols): Distinct Elevated Glass Card */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl glass-panel-elevated p-5 shadow-glass-elevated space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.10)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
                  <span className="text-xs font-bold text-[#F7F5FC]">Student Opportunity Discovery</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35">
                  Verified
                </span>
              </div>

              {/* Opplyra Brand Pill inside Hero */}
              <div className="bg-[#FAF8F2] p-3 rounded-xl border border-white/20 shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="Opplyra" className="h-8 w-auto object-contain" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#B7B0C7]">
                  <span>Student Profile</span>
                  <span className="font-bold text-[#F7F5FC] truncate max-w-[160px]">{profile?.fullName || 'Priya Sharma'}</span>
                </div>
                <div className="flex items-center justify-between text-[#B7B0C7]">
                  <span>Course</span>
                  <span className="font-semibold text-[#A78BFA]">{profile?.course || 'Engineering / Science'}</span>
                </div>
                <div className="flex items-center justify-between text-[#B7B0C7]">
                  <span>Year</span>
                  <span className="text-[#C4B5FD] font-semibold">{profile?.academicYear || '3rd Year'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[rgba(10,8,15,0.45)] border border-[rgba(255,255,255,0.10)] flex items-center gap-2 text-xs text-[#B7B0C7]">
                <CheckCircle2 className="w-4 h-4 text-[#A78BFA] shrink-0" />
                <span>Automated criteria matching against student details</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row (Translucent Charcoal Glass Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-card-interactive rounded-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#B7B0C7]">Available Opportunities</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] flex items-center justify-center font-bold border border-[#7C3AED]/35 shadow-sm">
              📚
            </div>
          </div>
          <div className="text-2xl font-black text-[#F7F5FC] font-display">
            {summary?.totalOpportunities ?? 8}
          </div>
          <p className="text-[11px] text-[#92899F] mt-1 font-medium">Across 4 main categories</p>
        </div>

        <div className="glass-card glass-card-interactive rounded-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#B7B0C7]">Saved Opportunities</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] flex items-center justify-center font-bold border border-[#7C3AED]/35 shadow-sm">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F7F5FC] font-display">
            {summary?.savedCount ?? 0}
          </div>
          <p className="text-[11px] text-[#92899F] mt-1 font-medium">Saved to apply later</p>
        </div>

        <div className="glass-card glass-card-interactive rounded-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#B7B0C7]">Applications in Progress</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] flex items-center justify-center font-bold border border-[#7C3AED]/35 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F7F5FC] font-display">
            {summary?.inProgressCount ?? 0}
          </div>
          <p className="text-[11px] text-[#92899F] mt-1 font-medium">Planning & applied</p>
        </div>

        <div className="glass-card glass-card-interactive rounded-2xl p-5 shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#B7B0C7]">Upcoming Deadlines</span>
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] flex items-center justify-center font-bold border border-[#7C3AED]/35 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F7F5FC] font-display">
            {(summary?.upcomingDeadlines || []).length}
          </div>
          <p className="text-[11px] text-[#92899F] mt-1 font-medium">Shown in right sidebar</p>
        </div>
      </div>

      {/* Category Cards (Glass Cards with Restrained Violet Hover Elevation) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
            Find Your Next Opportunity
          </h2>
          <button
            onClick={() => onNavigate('catalogue')}
            className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.name}
                onClick={() => onNavigate('catalogue', { category: c.name })}
                className="glass-card glass-card-interactive rounded-2xl p-5 text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer border border-[rgba(196,181,253,0.18)] hover:border-[rgba(167,139,250,0.48)] shadow-glass"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[rgba(20,16,28,0.55)] border border-[rgba(196,181,253,0.18)] flex items-center justify-center mb-3 group-hover:border-[#7C3AED]/50 transition-colors shadow-sm">
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <div className="text-sm font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] transition-colors font-display mb-1">
                    {c.name}
                  </div>
                  <div className="text-xs text-[#B7B0C7] leading-relaxed">{c.desc}</div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#A78BFA] group-hover:translate-x-1 transition-transform">
                  <span>Browse Category</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended for You Grid (Expanded with full width breathing room) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F7F5FC] font-display">Recommended for You</h2>
            <p className="text-xs text-[#B7B0C7] font-medium">
              Based on {profile?.course || 'your course'} • {profile?.academicYear || 'your year of study'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalogue')}
            className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] transition-colors cursor-pointer"
          >
            Browse All ({summary?.totalOpportunities ?? 8}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {(summary?.recommended || []).map((opp) => (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              isSaved={!!savedMap[opp._id]}
              savedStatus={savedMap[opp._id]?.status}
              onToggleSave={onToggleSave}
              onSetReminder={onOpenReminder}
            />
          ))}
        </div>
      </div>

      {/* Verification Safety Banner (Glass Panel) */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-[#C4B5FD] font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#A78BFA]" />
            <span>Check Announcements for Scams</span>
          </div>
          <h3 className="text-base font-bold text-[#F7F5FC] font-display">
            Received a suspicious scholarship or job notice?
          </h3>
          <p className="text-xs text-[#B7B0C7] leading-relaxed">
            Paste any circular, email text, or website link into our rule-based scam checker to identify suspicious fees, spoofed domains, and pressure tactics before you share personal documents.
          </p>
        </div>

        <button
          onClick={() => onNavigate('verification')}
          className="shrink-0 py-3 px-5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>Check an Announcement</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
