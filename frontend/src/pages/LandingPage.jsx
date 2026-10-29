import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  Rocket,
  UserCheck,
  HelpCircle,
  Menu,
  X,
  Lock,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function LandingPage({
  onOpenAuth,
  onNavigateToCategory,
  onOpenDashboard,
  isAuthenticated,
  user,
  onLogout,
  onOpenLegal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('discovery'); // 'discovery' | 'eligibility' | 'safety'
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const categories = [
    {
      id: 'Scholarships',
      title: 'Scholarships',
      icon: GraduationCap,
      color: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/15',
      iconBorder: 'border-[#38BDF8]/25',
      hoverBorder: 'hover:border-[#38BDF8]/40',
      badge: 'Funding & Grants',
      desc: 'Merit-based scholarships, government aid schemes, and tuition grants to support your academic goals.'
    },
    {
      id: 'Internships',
      title: 'Internships',
      icon: Briefcase,
      color: 'text-[#34D399]',
      iconBg: 'bg-[#34D399]/15',
      iconBorder: 'border-[#34D399]/25',
      hoverBorder: 'hover:border-[#34D399]/40',
      badge: 'Hands-on Experience',
      desc: 'Industry apprenticeships, software engineering roles, and university research fellowships with verified stipends.'
    },
    {
      id: 'Competitive Examinations',
      title: 'Competitive Examinations',
      icon: BookOpen,
      color: 'text-[#FBBF24]',
      iconBg: 'bg-[#FBBF24]/15',
      iconBorder: 'border-[#FBBF24]/25',
      hoverBorder: 'hover:border-[#FBBF24]/40',
      badge: 'National Testing',
      desc: 'National exams including GATE, Civil Services, Banking, and Defense recruitment deadlines.'
    },
    {
      id: 'Jobs & Training',
      title: 'Jobs & Training',
      icon: Rocket,
      color: 'text-[#FB7185]',
      iconBg: 'bg-[#FB7185]/15',
      iconBorder: 'border-[#FB7185]/25',
      hoverBorder: 'hover:border-[#FB7185]/40',
      badge: 'Early Career',
      desc: 'Graduate engineer trainee programs, public sector apprenticeships, and entry-level positions.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0A10] text-[#F7F5FC] selection:bg-[#7C3AED] selection:text-white relative overflow-x-hidden">
      {/* Vercel-style Background Ambient Light */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Subtle grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient violet hero glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#7C3AED]/20 via-[#4F46E5]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 1. PUBLIC NAVIGATION BAR                                 */}
      {/* ======================================================== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(8,8,13,0.85)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.08)] shadow-lg'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Opplyra Logo + Brand Name */}
          <div className="flex items-center gap-8 shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 select-none group cursor-pointer"
              aria-label="Opplyra Home"
            >
              <img
                src="/brand-mark.png"
                alt="Opplyra Emblem"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(167,139,250,0.5)] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-black text-2xl sm:text-[26px] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E8FF] to-[#C4B5FD] select-none">
                Opplyra
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#B7B0C7]">
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-[#F7F5FC] transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#F7F5FC] transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('opportunities')}
                className="hover:text-[#F7F5FC] transition-colors cursor-pointer"
              >
                Opportunities
              </button>
              <button
                onClick={() => scrollToSection('safety')}
                className="hover:text-[#F7F5FC] transition-colors cursor-pointer"
              >
                Safety
              </button>
            </nav>
          </div>

          {/* Right: Auth Controls */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <button
                  onClick={onOpenDashboard}
                  className="h-9 px-4 rounded-xl bg-white text-[#08080D] hover:bg-[#F0EFF5] font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="h-9 px-3 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.22)] text-[#B7B0C7] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="h-9 px-3.5 rounded-xl text-xs font-medium text-[#B7B0C7] hover:text-white transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="h-9 px-4 rounded-xl bg-white text-[#08080D] hover:bg-[#F0EFF5] font-semibold text-xs transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[rgba(255,255,255,0.12)] text-[#B7B0C7] hover:text-white md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,8,15,0.96)] backdrop-blur-2xl px-5 py-4 space-y-3.5">
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#B7B0C7]">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 hover:text-white cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 hover:text-white cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('opportunities')}
                className="text-left py-2 hover:text-white cursor-pointer"
              >
                Opportunities
              </button>
              <button
                onClick={() => scrollToSection('safety')}
                className="text-left py-2 hover:text-white cursor-pointer"
              >
                Safety & Trust
              </button>
            </div>

            <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={onOpenDashboard}
                    className="w-full py-2.5 rounded-xl bg-white text-[#08080D] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full py-2 text-xs text-[#B7B0C7] hover:text-white cursor-pointer"
                  >
                    Log Out ({user?.fullName || 'Student'})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white text-[#08080D] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2.5 rounded-xl border border-[rgba(255,255,255,0.14)] text-white font-medium text-xs text-center cursor-pointer"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Vercel-inspired Spacious Typography)   */}
      {/* ======================================================== */}
      <section className="relative z-10 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md mb-8 group hover:border-[#7C3AED]/50 transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#C4B5FD]">
            ONE PLACE FOR YOUR NEXT OPPORTUNITY
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#91899F] group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.08] text-white font-display max-w-4xl mx-auto">
          Find opportunities.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EDE5FF] to-[#A78BFA]">
            Verify information.
          </span>{' '}
          Never miss a deadline.
        </h1>

        {/* Supporting Text */}
        <p className="mt-6 sm:mt-8 text-base sm:text-xl text-[#B7B0C7] max-w-2xl mx-auto leading-relaxed font-normal">
          Discover scholarships, internships, exams, and jobs in one place. Check eligibility, review official sources, and keep track of the opportunities that matter to you.
        </p>

        {/* Dual Call-To-Action Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <button
            onClick={() => {
              if (isAuthenticated) onOpenDashboard();
              else onOpenAuth('register');
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-[#08080D] hover:bg-[#F3F2F8] font-bold text-sm transition-all shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:shadow-[0_0_32px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-[#F7F5FC] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Features</span>
          </button>
        </div>

        {/* Trust Statement */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#91899F]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Built to help students make more informed decisions.</span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PRODUCT PREVIEW SECTION (Vercel-style Dashboard Frame) */}
      {/* ======================================================== */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
        <div className="relative rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(14,12,21,0.70)] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Window Bar (Product Demonstration Frame) */}
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,8,15,0.85)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56]/80" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E]/80" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F]/80" />
            </div>

            <div className="flex items-center gap-2 px-3 sm:px-4 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-[#C4B5FD] select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
              <span>OPPLYRA · STUDENT PORTAL</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#91899F] font-medium shrink-0 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
              <span>Product Preview</span>
            </div>
          </div>

          {/* Interactive Feature Showcase Selector */}
          <div className="p-3.5 sm:p-5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(18,15,26,0.4)] flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <button
                role="tab"
                aria-selected={activePreviewTab === 'discovery'}
                onClick={() => setActivePreviewTab('discovery')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePreviewTab === 'discovery'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#B7B0C7] hover:text-white bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                Opportunity & Eligibility
              </button>
              <button
                role="tab"
                aria-selected={activePreviewTab === 'eligibility'}
                onClick={() => setActivePreviewTab('eligibility')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePreviewTab === 'eligibility'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#B7B0C7] hover:text-white bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                Eligibility Breakdown
              </button>
              <button
                role="tab"
                aria-selected={activePreviewTab === 'safety'}
                onClick={() => setActivePreviewTab('safety')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePreviewTab === 'safety'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#B7B0C7] hover:text-white bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                Scam & Safety Verification
              </button>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#91899F] px-2.5 py-1 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] shrink-0 hidden md:inline-block select-none">
              SAMPLE PREVIEW
            </span>
          </div>

          {/* Dashboard Preview Inner Canvas */}
          <div className="p-4 sm:p-7 space-y-6">
            {activePreviewTab === 'discovery' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start animate-fade-in">
                {/* Simulated Opportunity Card (7 cols) */}
                <div className="md:col-span-7 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(22,18,31,0.65)] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/35">
                        Internships
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/35">
                        ✓ Matches Profile
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium uppercase tracking-wider bg-[rgba(255,255,255,0.05)] text-[#91899F] border border-[rgba(255,255,255,0.08)]">
                        Sample Preview
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#FBBF24] bg-[#FBBF24]/15 px-2 py-0.5 rounded-lg border border-[#FBBF24]/30">
                      14 days left
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-[#B7B0C7] mb-1 font-medium">Google India • Engineering Division</div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      Summer Student Research Fellowship 2026
                    </h3>
                    <p className="text-xs text-[#B7B0C7] mt-1.5 leading-relaxed">
                      10-week summer research program in systems, AI, and distributed computing with industry mentorship.
                    </p>
                  </div>

                  <div className="bg-[rgba(10,8,15,0.5)] p-3 rounded-xl border border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs">
                    <span className="text-[#91899F]">Monthly Stipend:</span>
                    <span className="font-bold text-[#C4B5FD]">₹75,000 / month + Accommodation</span>
                  </div>

                  {/* Integrated Eligibility Match Summary */}
                  <div className="p-3.5 rounded-xl bg-[rgba(10,8,15,0.55)] border border-[rgba(255,255,255,0.08)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#C4B5FD] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                        Eligibility Match Summary
                      </span>
                      <span className="text-[10px] font-bold text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded border border-[#34D399]/30">
                        3 of 3 Criteria Met
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-[#B7B0C7]">
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]">
                        <span className="block text-[10px] text-[#91899F]">Course</span>
                        <span className="font-medium text-white truncate block">B.Tech / B.E.</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]">
                        <span className="block text-[10px] text-[#91899F]">Year</span>
                        <span className="font-medium text-white truncate block">3rd Year</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]">
                        <span className="block text-[10px] text-[#91899F]">Min CGPA</span>
                        <span className="font-medium text-white truncate block">7.5+</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold text-center hover:bg-[#6D28D9] transition-colors cursor-pointer"
                    >
                      View Details & Eligibility
                    </button>
                    <a
                      href="https://careers.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-[rgba(255,255,255,0.12)] text-[#91899F] hover:text-white transition-colors"
                      title="Official Source"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Simulated Deadline Tracker Widget (5 cols) */}
                <div className="md:col-span-5 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(16,13,24,0.5)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#FBBF24]" />
                      <span className="text-xs font-bold text-white font-display">Upcoming Deadlines</span>
                    </div>
                    <span className="text-[10px] text-[#91899F] font-mono border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded">
                      Sample Schedule
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[rgba(22,18,31,0.65)] border border-[rgba(255,255,255,0.08)] text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white truncate">GATE 2026 Examination</span>
                        <span className="text-[10px] text-[#FB7185] font-bold">Closes in 4d</span>
                      </div>
                      <div className="text-[11px] text-[#91899F]">National Entrance • IIT Roorkee</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[rgba(22,18,31,0.65)] border border-[rgba(255,255,255,0.08)] text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white truncate">Aditya Birla Scholarship</span>
                        <span className="text-[10px] text-[#FBBF24] font-bold">18d left</span>
                      </div>
                      <div className="text-[11px] text-[#91899F]">Merit Funding • Corporate Grant</div>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-[#91899F] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>In-app deadline alerts & calendar reminders</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'eligibility' && (
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(22,18,31,0.65)] p-5 sm:p-6 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white font-display">
                        Automated Eligibility Breakdown
                      </h3>
                      <span className="text-[10px] font-mono text-[#91899F] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded">
                        SAMPLE EVALUATION
                      </span>
                    </div>
                    <p className="text-xs text-[#B7B0C7]">
                      Evaluated against illustrative student profile: Priya Sharma (B.Tech Computer Science, 3rd Year)
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 self-start sm:self-auto">
                    Eligible to Apply
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[rgba(10,8,15,0.6)] border border-[rgba(255,255,255,0.06)] text-xs space-y-1">
                    <span className="text-[#34D399] font-bold text-[11px] block">✓ Course Match</span>
                    <span className="text-white font-medium">B.Tech / B.E. recognized</span>
                    <span className="text-[10px] text-[#91899F] block">Student's registered degree matches program scope</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[rgba(10,8,15,0.6)] border border-[rgba(255,255,255,0.06)] text-xs space-y-1">
                    <span className="text-[#34D399] font-bold text-[11px] block">✓ Academic Year</span>
                    <span className="text-white font-medium">3rd Year students eligible</span>
                    <span className="text-[10px] text-[#91899F] block">Penultimate year cohort requirement met</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[rgba(10,8,15,0.6)] border border-[rgba(255,255,255,0.06)] text-xs space-y-1">
                    <span className="text-[#34D399] font-bold text-[11px] block">✓ Academic Standing</span>
                    <span className="text-white font-medium">Requires minimum 7.5 CGPA</span>
                    <span className="text-[10px] text-[#91899F] block">Student profile: 8.4 CGPA satisfies requirement</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'safety' && (
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(22,18,31,0.65)] p-5 sm:p-6 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-display">
                          Deterministic Anti-Fraud Heuristics
                        </h3>
                        <span className="text-[10px] font-mono text-[#91899F] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded hidden sm:inline-block">
                          SAMPLE ENGINE
                        </span>
                      </div>
                      <p className="text-xs text-[#B7B0C7]">Automated circular screening against common scam signatures</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#A78BFA] bg-[#7C3AED]/15 px-2.5 py-1 rounded-lg border border-[#7C3AED]/30 self-start sm:self-auto">
                    Rule Engine Active
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 flex items-start gap-2.5 text-[#F7F5FC]">
                    <AlertTriangle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#FB7185] block">High-Risk Pattern Example (Detected in Circular):</span>
                      <span className="text-[#B7B0C7]">"Selected candidates must send ₹2,500 security deposit via Google Pay before midnight."</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 flex items-start gap-2.5 text-[#F7F5FC]">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#34D399] block">Verified Government Notice Example:</span>
                      <span className="text-[#B7B0C7]">Official registration hosted on certified `.gov.in` portal without private payment demands.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Caption & Product Action */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(10,8,15,0.85)] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#91899F] gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] shrink-0" />
              <span>Illustrative sample preview. Opportunity listings, criteria, and deadlines shown here demonstrate platform features; verified data is evaluated dynamically in your student account.</span>
            </div>
            <button
              onClick={() => {
                if (isAuthenticated) onOpenDashboard();
                else onOpenAuth('register');
              }}
              className="text-[#C4B5FD] hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FEATURES SECTION (#features)                          */}
      {/* ======================================================== */}
      <section id="features" className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-2xl mb-16 sm:mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] block mb-3 font-mono">
            CORE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white font-display">
            Everything you need to manage opportunities
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#B7B0C7] leading-relaxed">
            Spend less time searching across websites and more time preparing for the opportunities that fit you.
          </p>
        </div>

        {/* 4 Bento Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="group rounded-3xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(167,139,250,0.35)] bg-[rgba(14,12,21,0.55)] p-7 sm:p-9 transition-all duration-300 hover:bg-[rgba(22,18,31,0.65)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-[#C4B5FD] group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Discover Opportunities</h3>
            <p className="text-sm text-[#B7B0C7] leading-relaxed">
              Find scholarships, internships, competitive examinations, jobs, and training opportunities in one place without jumping between dozens of unverified portals.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-3xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(167,139,250,0.35)] bg-[rgba(14,12,21,0.55)] p-7 sm:p-9 transition-all duration-300 hover:bg-[rgba(22,18,31,0.65)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] flex items-center justify-center text-[#6EE7B7] group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6 text-[#34D399]" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Check Eligibility</h3>
            <p className="text-sm text-[#B7B0C7] leading-relaxed">
              Compare opportunity requirements with your student profile to instantly see if you meet academic criteria, courses, graduation years, and prerequisite qualifications.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-3xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(167,139,250,0.35)] bg-[rgba(14,12,21,0.55)] p-7 sm:p-9 transition-all duration-300 hover:bg-[rgba(22,18,31,0.65)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(251,113,133,0.15)] border border-[rgba(251,113,133,0.3)] flex items-center justify-center text-[#FB7185] group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-[#FB7185]" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Check for Warning Signs</h3>
            <p className="text-sm text-[#B7B0C7] leading-relaxed">
              Review announcements and links for suspicious patterns such as upfront fee demands, personal UPI requests, and spoofed domains before sharing private documents.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group rounded-3xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(167,139,250,0.35)] bg-[rgba(14,12,21,0.55)] p-7 sm:p-9 transition-all duration-300 hover:bg-[rgba(22,18,31,0.65)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(251,191,36,0.15)] border border-[rgba(251,191,36,0.3)] flex items-center justify-center text-[#FBBF24] group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-[#FBBF24]" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Track Deadlines</h3>
            <p className="text-sm text-[#B7B0C7] leading-relaxed">
              Save opportunities, track applications from planning to submission, and set custom reminders so you never miss an important registration window.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW IT WORKS SECTION (#how-it-works)                  */}
      {/* ======================================================== */}
      <section id="how-it-works" className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] block mb-3 font-mono">
            SIMPLE WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white font-display">
            From discovery to application, in a few simple steps
          </h2>
        </div>

        {/* 4 Sequential Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              num: '01',
              title: 'Explore',
              desc: 'Find opportunities by category, department, qualification, or targeted search.'
            },
            {
              num: '02',
              title: 'Check',
              desc: 'Review requirements, official source links, and potential warning signs.'
            },
            {
              num: '03',
              title: 'Save',
              desc: 'Keep relevant opportunities organized in your personal application pipeline.'
            },
            {
              num: '04',
              title: 'Track',
              desc: 'Follow applications and receive helpful alerts before portals close.'
            }
          ].map((st, idx) => (
            <div
              key={st.num}
              className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(14,12,21,0.45)] p-6 sm:p-7 relative flex flex-col justify-between hover:border-[rgba(255,255,255,0.2)] transition-colors"
            >
              <div>
                <span className="text-3xl font-extrabold text-[#7C3AED]/40 font-mono block mb-4">
                  {st.num}
                </span>
                <h3 className="text-lg font-bold text-white font-display mb-2">{st.title}</h3>
                <p className="text-xs sm:text-sm text-[#B7B0C7] leading-relaxed">{st.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] text-[#91899F]">
                <span>Step {idx + 1} of 4</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A78BFA]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. OPPORTUNITY CATEGORIES SECTION (#opportunities)       */}
      {/* ======================================================== */}
      <section id="opportunities" className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] block mb-3 font-mono">
              CURATED DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white font-display">
              Explore opportunities that move you forward
            </h2>
          </div>
          <button
            onClick={() => {
              if (isAuthenticated) onOpenDashboard();
              else onOpenAuth('login');
            }}
            className="text-xs font-semibold text-[#C4B5FD] hover:text-white flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                onClick={() => onNavigateToCategory(c.id)}
                className={`group rounded-3xl border border-[rgba(255,255,255,0.08)] ${c.hoverBorder} bg-[rgba(14,12,21,0.55)] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:bg-[rgba(22,18,31,0.7)] cursor-pointer`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-5 h-5 ${c.color}`} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[rgba(255,255,255,0.04)] text-[#91899F] border border-[rgba(255,255,255,0.06)]">
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-display mb-2 group-hover:text-[#C4B5FD] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#B7B0C7] leading-relaxed">{c.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-semibold text-[#A78BFA] group-hover:text-white">
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. SAFETY & TRUST SECTION (#safety)                      */}
      {/* ======================================================== */}
      <section id="safety" className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.08)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#34D399] block font-mono">
              STUDENT PROTECTION FIRST
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white font-display leading-[1.1]">
              Pause. Check. Apply with more confidence.
            </h2>
            <p className="text-sm sm:text-base text-[#B7B0C7] leading-relaxed">
              Every admission and recruitment cycle brings deceptive advertisements, spoofed application forms, and upfront fee demands. Opplyra encourages a defensive mindset before sharing private data or paying registration fees.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Review the original official source</h3>
                  <p className="text-xs text-[#B7B0C7] mt-0.5">Always verify notices directly on certified `.gov.in`, `.nic.in`, or recognized institution domains.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Watch for payment demands & high pressure</h3>
                  <p className="text-xs text-[#B7B0C7] mt-0.5">Genuine scholarship programs never demand security deposits via individual UPI numbers or Telegram channels.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Guidance, not an absolute guarantee</h3>
                  <p className="text-xs text-[#B7B0C7] mt-0.5">Automated screening flags known red flags. No automated tool can guarantee authenticity—always double-check with the issuing authority.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Verification Matrix Card (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(14,12,21,0.65)] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#C4B5FD]">
                  <ShieldCheck className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Announcement Safety Standards</h4>
                  <p className="text-[11px] text-[#91899F]">How Opplyra evaluates incoming circulars</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span className="text-white font-medium">Approved Official Source</span>
                </div>
                <span className="text-[10px] text-[#34D399] font-bold">Confirmed Domain</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                  <span className="text-white font-medium">Demonstration Listing</span>
                </div>
                <span className="text-[10px] text-[#93C5FD] font-bold">Standard Criteria Model</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                  <span className="text-white font-medium">Warning Sign Detected</span>
                </div>
                <span className="text-[10px] text-[#FB7185] font-bold">Urgent Pressure / Fee Demand</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                  <span className="text-white font-medium">Inconclusive Result</span>
                </div>
                <span className="text-[10px] text-[#FBBF24] font-bold">Requires Manual Review</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#91899F] leading-relaxed">
              Have an announcement to check? Paste it in our Scam Checker anytime to inspect for suspicious phone numbers and deceptive links.
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FINAL CALL TO ACTION SECTION                          */}
      {/* ======================================================== */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-[rgba(255,255,255,0.12)] bg-gradient-to-b from-[rgba(24,19,34,0.7)] to-[rgba(12,10,18,0.85)] backdrop-blur-2xl p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          {/* Subtle violet ambient halo behind CTA card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white font-display">
              Your next opportunity could start here.
            </h2>
            <p className="text-sm sm:text-base text-[#B7B0C7] leading-relaxed">
              Create your Opplyra account to discover relevant opportunities and keep track of important deadlines.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (isAuthenticated) onOpenDashboard();
                  else onOpenAuth('register');
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-white text-[#08080D] hover:bg-[#F3F2F8] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Enter Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated) onOpenDashboard();
                  else onOpenAuth('login');
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl border border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.03)] text-white font-semibold text-sm transition-all cursor-pointer"
              >
                <span>{isAuthenticated ? 'View Saved Items' : 'Log In'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. PUBLIC FOOTER                                         */}
      {/* ======================================================== */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(8,8,13,0.95)] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[rgba(255,255,255,0.06)]">
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <a href="#" className="inline-flex items-center gap-2.5 select-none group">
              <img
                src="/brand-mark.png"
                alt="Opplyra Emblem"
                className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(167,139,250,0.45)] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E8FF] to-[#C4B5FD]">
                Opplyra
              </span>
            </a>
            <p className="text-xs text-[#91899F] max-w-sm leading-relaxed">
              Opplyra is a student opportunity platform built for discovering scholarships, internships, competitive examinations, and career programs while keeping track of critical deadlines.
            </p>
            <div className="text-[11px] text-[#A78BFA] flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Opportunities for a brighter you.</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Platform</h4>
            <ul className="space-y-2 text-xs text-[#B7B0C7]">
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('opportunities')} className="hover:text-white transition-colors cursor-pointer">
                  Opportunities
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('safety')} className="hover:text-white transition-colors cursor-pointer">
                  Safety & Trust
                </button>
              </li>
            </ul>
          </div>

          {/* Opportunities Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Categories</h4>
            <ul className="space-y-2 text-xs text-[#B7B0C7]">
              <li>
                <button onClick={() => onNavigateToCategory('Scholarships')} className="hover:text-white transition-colors cursor-pointer">
                  Scholarships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToCategory('Internships')} className="hover:text-white transition-colors cursor-pointer">
                  Internships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToCategory('Competitive Examinations')} className="hover:text-white transition-colors cursor-pointer">
                  Competitive Exams
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateToCategory('Jobs & Training')} className="hover:text-white transition-colors cursor-pointer">
                  Jobs & Training
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Account Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Account & Legal</h4>
            <ul className="space-y-2 text-xs text-[#B7B0C7]">
              <li>
                <button
                  onClick={() => {
                    if (isAuthenticated) onOpenDashboard();
                    else onOpenAuth('login');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAuthenticated ? 'Enter Dashboard' : 'Log In'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (isAuthenticated) onOpenDashboard();
                    else onOpenAuth('register');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isAuthenticated ? 'My Profile' : 'Register'}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('safety')} className="hover:text-white transition-colors cursor-pointer">
                  Safety Notice
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#91899F] gap-4">
          <p>© {new Date().getFullYear()} Opplyra. Built to help students make more informed decisions.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal('safety')} className="hover:text-white transition-colors cursor-pointer">
              Disclaimer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

