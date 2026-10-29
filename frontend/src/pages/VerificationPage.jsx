import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileSearch,
  Lock,
  ChevronRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Globe,
  FileText,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';

// Fallback curated demonstration cases in case backend endpoint is unreachable
const DEFAULT_DEMO_SAMPLES = [
  {
    id: 'demo_advance_fee',
    label: 'Advance-Fee Job Scam',
    badge: 'Advance UPI Fee & Guaranteed Joining',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'http://railway-jobs-portal-direct.xyz/apply',
    text: 'DIRECT RECRUITMENT IN INDIAN RAILWAYS! 100% selection guaranteed without exam or interview. Selected candidate must pay a refundable laptop security deposit of Rs. 2,500 via Google Pay / UPI to HR Officer (+919876543210) before midnight or your seat will be cancelled and offered to waitlist candidates.'
  },
  {
    id: 'demo_wfh_unrealistic',
    label: 'Fake Work-From-Home Offer',
    badge: 'Personal Webmail & Telegram Task Scam',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'https://careers-google-verify.blogspot.com',
    text: 'Urgent hiring for Google Data Entry & AI Work from Home. Earn Rs. 4,500 daily without any skills. Send your resume to recruiter.google.hiring2026@gmail.com and join our official Telegram group to apply. Only 3 seats left hurry!'
  },
  {
    id: 'demo_credential_theft',
    label: 'Credential & OTP Theft Form',
    badge: 'Bank Card CVV & 6-Digit OTP Request',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'http://scholarship-disbursement-portal.xyz/verify',
    text: 'Urgent notice regarding your National STEM Scholarship sanction. To release your ₹50,000 grant immediately, enter your card number with CVV and provide your 6-digit OTP for Aadhaar bank account verification. Failure to verify within 2 hours will forfeit the award.'
  },
  {
    id: 'demo_lookalike_domain',
    label: 'Lookalike Government Portal',
    badge: 'Spoofed Subdomain on .xyz TLD',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'https://isro.gov.in.careers-apply.xyz/trainee',
    text: 'Indian Space Research Organisation Apprentice Trainee online registration link. Review qualification norms and submit graduation details. Registration open for 2025/2026 engineering graduates.'
  },
  {
    id: 'demo_ambiguous_review',
    label: 'Ambiguous Career Notice',
    badge: 'Third-Party Notice Requiring Review',
    badgeType: 'caution',
    isDemonstration: true,
    url: 'https://tech-student-updates-hub.com/internships',
    text: 'Summer Software Engineering Internships 2026 are opening across Bangalore and Hyderabad for 3rd and 4th year B.Tech students. Stipend ranges from ₹40,000 to ₹80,000 per month. Check the blog update for links to original company career portals.'
  },
  {
    id: 'demo_benign_official',
    label: 'Authentic Official Notice',
    badge: 'Approved Government Educational Domain',
    badgeType: 'lower_risk',
    isDemonstration: true,
    url: 'https://www.isro.gov.in/Careers.html',
    text: 'Indian Space Research Organisation invites online applications from eligible engineering and technology graduates for engagement as Graduate Apprentice Trainees under the Apprentices Act. Applications are accepted strictly through the verified NATS portal. Selection is purely on academic merit. Beware of fraudulent agents claiming to guarantee selection; ISRO never collects money for recruitment.'
  }
];

export function VerificationPage() {
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [examples, setExamples] = useState(DEFAULT_DEMO_SAMPLES);
  const [selectedExampleId, setSelectedExampleId] = useState(null);

  // Load demonstration examples dynamically from backend API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchExamples() {
      try {
        const res = await api.getVerificationExamples();
        if (isMounted && res?.success && Array.isArray(res?.data) && res.data.length > 0) {
          setExamples(res.data);
        }
      } catch (e) {
        // Fall back gracefully to bundled default examples
      }
    }
    fetchExamples();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSample = (sample) => {
    setSelectedExampleId(sample.id);
    setInputText(sample.text || '');
    setInputUrl(sample.url || '');
    handleVerify(sample.text || '', sample.url || '');
  };

  const handleClear = () => {
    setInputText('');
    setInputUrl('');
    setResult(null);
    setError(null);
    setSelectedExampleId(null);
  };

  const handleVerify = async (textToUse = inputText, urlToUse = inputUrl) => {
    const trimmedText = (textToUse || '').trim();
    const trimmedUrl = (urlToUse || '').trim();

    if (!trimmedText && !trimmedUrl) {
      setError('Please provide announcement text, a website link, or both to evaluate.');
      return;
    }

    if (trimmedText && trimmedText.length < 15 && !trimmedUrl) {
      setError('Announcement text must be at least 15 characters long if no website link is provided.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null); // Clear previous result so stale findings never linger
    setError(null);

    try {
      const response = await api.verifyAnnouncement({
        text: trimmedText,
        url: trimmedUrl,
      });

      if (response?.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error(response?.message || 'Verification analysis failed.');
      }
    } catch (err) {
      setError(err.message || 'Could not complete the fraud analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 text-[#F7F5FC]">
      {/* Intro Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-glass relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/15 text-[#C4B5FD] text-xs font-semibold border border-[#7C3AED]/30">
            <ShieldAlert className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Opportunity Fraud & Safety Detector</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F5FC] tracking-tight font-display">
            Check an Announcement Before You Trust It
          </h1>

          <p className="text-xs sm:text-sm text-[#B7B0C7] leading-relaxed">
            Paste a scholarship notification, job offer, internship message, or application link. Opplyra detects advance fee demands, credential theft, lookalike spoofing portals, and artificial urgency using transparent, deterministic rules.
          </p>
        </div>

        {/* Curated Selectable Demonstration Examples */}
        <div className="mt-6 pt-6 border-t border-[rgba(196,181,253,0.14)] relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
              Demonstration Example Library
            </div>
            <span className="text-[10px] text-[#92899F]">
              Click any synthetic case to populate and test live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examples.map((s) => {
              const isSelected = selectedExampleId === s.id;
              const isHigh = s.badgeType === 'high_risk' || s.expectedOutcome === 'HIGH_RISK';
              const isCaution = s.badgeType === 'caution' || s.expectedOutcome === 'CAUTION';

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className={`text-left p-3.5 rounded-xl glass-card transition-all duration-200 group cursor-pointer border ${
                    isSelected
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-[0_0_15px_rgba(124,58,237,0.25)]'
                      : 'border-[rgba(196,181,253,0.12)] hover:border-[#7C3AED]/40 hover:bg-[rgba(26,22,37,0.7)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                        isHigh
                          ? 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/35'
                          : isCaution
                          ? 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/35'
                          : 'bg-[#B69AFF]/15 text-[#B69AFF] border-[#B69AFF]/35'
                      }`}
                    >
                      {s.badge || 'Synthetic Test'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#92899F] group-hover:text-[#A78BFA] transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] font-display transition-colors">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-[#92899F] mt-1 line-clamp-1 font-mono">
                    {s.url ? s.url : s.text}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Input vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
              <FileSearch className="w-4 h-4 text-[#A78BFA]" />
              <span>Announcement Submission</span>
            </div>
            {(inputText || inputUrl) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-[#92899F] hover:text-[#FB7185] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Announcement Text Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[#F7F5FC]">
                  Announcement Message / Text
                </label>
                <span className="text-[11px] text-[#92899F]">
                  {inputText.length} characters
                </span>
              </div>
              <textarea
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the message, email body, WhatsApp forward, or notification text you received..."
                className="w-full p-3.5 glass-input rounded-xl text-xs font-medium placeholder-[#92899F] resize-none leading-relaxed"
              />
              <span className="text-[10px] text-[#92899F] mt-1 block">
                Supports WhatsApp forwards, job notices, SMS alerts, and email bodies.
              </span>
            </div>

            {/* URL Input */}
            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">
                Target Website or Application Link
              </label>
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example-careers.com/apply"
                className="w-full p-3.5 glass-input rounded-xl text-xs font-medium placeholder-[#92899F]"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-[#B7B0C7] mt-1.5">
                <Lock className="w-3 h-3 text-[#A78BFA]" />
                <span>Safe offline analysis: URLs are checked for brand spoofing and deceptive syntax without outbound network calls.</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-[#FB7185]/15 border border-[#FB7185]/35 rounded-xl text-[#FB7185] text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleVerify()}
              className="w-full py-3.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating warning indicators...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Check Now</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-[rgba(196,181,253,0.12)] text-[11px] text-[#92899F] space-y-1">
              <div className="font-semibold text-[#B7B0C7]">Detection Capabilities:</div>
              <div>• Advance fee & UPI caution money demands</div>
              <div>• Credential, OTP & bank card CVV theft forms</div>
              <div>• Lookalike government subdomains & throwaway TLDs</div>
              <div>• Sideloaded APK installation & AnyDesk requests</div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Evidence & Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isAnalyzing && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(18,16,25,0.7)] text-[#A78BFA] border border-[rgba(196,181,253,0.16)] flex items-center justify-center mx-auto text-xl font-display">
                🛡️
              </div>
              <h2 className="text-sm font-bold text-[#F7F5FC] font-display">
                Paste an announcement or select an example
              </h2>
              <p className="text-xs text-[#B7B0C7] max-w-sm mx-auto leading-relaxed">
                Provide notice text, a link, or both. The engine inspects structural indicators independently and delivers explainable findings.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3 shadow-glass">
              <div className="w-9 h-9 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-[#F7F5FC]">
                Evaluating text patterns and link structure...
              </div>
              <p className="text-xs text-[#B7B0C7] max-w-xs mx-auto">
                Checking for UPI payment demands, credential requests, disposable domains, and brand spoofing.
              </p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-5 animate-fade-in">
              {/* Primary Status Banner */}
              <div
                className={`p-6 rounded-2xl border shadow-glass backdrop-blur-xl ${
                  result.classification === 'HIGH_RISK'
                    ? 'bg-[#2A111A]/90 border-[#FB7185]/40 text-[#FFF1F2]'
                    : result.classification === 'CAUTION'
                    ? 'bg-[#2B2111]/90 border-[#FBBF24]/40 text-[#FEF3C7]'
                    : result.classification === 'LOWER_RISK'
                    ? 'bg-[#18132A]/90 border-[#7C3AED]/40 text-[#F5F3FF]'
                    : 'glass-panel text-[#F7F5FC]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {result.classification === 'HIGH_RISK' && (
                    <div className="w-10 h-10 rounded-xl bg-[#FB7185] text-white flex items-center justify-center shrink-0 shadow-md">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {result.classification === 'CAUTION' && (
                    <div className="w-10 h-10 rounded-xl bg-[#FBBF24] text-[#09090F] flex items-center justify-center shrink-0 shadow-md font-bold">
                      <HelpCircle className="w-5 h-5 text-[#09090F]" />
                    </div>
                  )}
                  {result.classification === 'LOWER_RISK' && (
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-md">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {result.classification === 'INVALID_INPUT' && (
                    <div className="w-10 h-10 rounded-xl bg-[rgba(36,28,51,0.8)] text-white flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4B5FD]">
                        Classification Result
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        Mode: {result.inputMode || 'EVALUATION'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight mb-1 font-display text-white">
                      {result.status}
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deterministic Rule-Based Risk Score Gauge */}
              <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-1">
                      Deterministic Rule-Based Risk Score
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#F7F5FC] font-display">
                      {result.ruleBasedRiskScore} <span className="text-sm text-[#92899F] font-normal">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase ${
                        result.classification === 'HIGH_RISK'
                          ? 'bg-[#FB7185]/20 text-[#FB7185] border-[#FB7185]/40'
                          : result.classification === 'CAUTION'
                          ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40'
                          : 'bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40'
                      }`}
                    >
                      {result.riskLevel || 'EVALUATED'}
                    </span>
                    <div className="text-[10px] text-[#92899F] mt-1">
                      {result.combinedIndicators?.length || 0} indicators matched
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-[rgba(18,16,25,0.8)] rounded-full overflow-hidden border border-[rgba(196,181,253,0.12)] p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.ruleBasedRiskScore >= 40
                          ? 'bg-gradient-to-r from-[#FBBF24] to-[#FB7185]'
                          : result.ruleBasedRiskScore >= 15
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#FBBF24]'
                          : 'bg-[#7C3AED]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, result.ruleBasedRiskScore))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#92899F] font-mono">
                    <span>0 (Lower Risk)</span>
                    <span>15 (Caution Threshold)</span>
                    <span>40+ (High Risk)</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#B7B0C7] bg-[rgba(18,16,25,0.5)] p-3 rounded-xl border border-[rgba(196,181,253,0.1)] leading-relaxed">
                  <strong className="text-[#F7F5FC]">Note on Scoring:</strong> This metric represents a deterministic rule-matching score accumulated from explicit danger signals (advance fee requests, OTP demands, brand impersonation). It is <span className="underline decoration-[#7C3AED]">not</span> a statistical or Bayesian probability of fraud.
                </div>
              </div>

              {/* Independent Channels: Message Analysis & URL Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Message Findings */}
                <div className="glass-panel rounded-2xl p-5 shadow-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-[#A78BFA]" />
                      <span>Message Analysis</span>
                    </div>
                    <span className="text-[10px] text-[#92899F]">
                      {result.messageAnalysis?.hasText
                        ? `${result.messageAnalysis.textLength} chars`
                        : 'No text provided'}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-[#B7B0C7]">
                    <div className="flex justify-between py-1 border-b border-[rgba(196,181,253,0.08)]">
                      <span>Message Signals:</span>
                      <span className="font-semibold text-[#F7F5FC]">
                        {result.messageAnalysis?.indicators?.length || 0} detected
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(196,181,253,0.08)]">
                      <span>Message Score:</span>
                      <span className="font-semibold text-[#F7F5FC]">
                        {result.messageAnalysis?.score || 0} pts
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Negation Disclaimers:</span>
                      <span className="font-semibold text-[#34D399]">
                        {result.messageAnalysis?.negationDisclaimers?.length > 0
                          ? `${result.messageAnalysis.negationDisclaimers.length} noted`
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* URL Findings */}
                <div className="glass-panel rounded-2xl p-5 shadow-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-[#38BDF8]" />
                      <span>URL Analysis</span>
                    </div>
                    <span className="text-[10px] text-[#92899F]">
                      {result.urlAnalysis?.hasUrl ? 'Target Analyzed' : 'No link provided'}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-[#B7B0C7]">
                    <div className="flex justify-between py-1 border-b border-[rgba(196,181,253,0.08)]">
                      <span>Host:</span>
                      <span className="font-mono text-[#F7F5FC] truncate max-w-[150px]">
                        {result.urlAnalysis?.hostname || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(196,181,253,0.08)]">
                      <span>Allowlist Status:</span>
                      <span
                        className={`font-semibold ${
                          result.urlAnalysis?.isAllowlisted
                            ? 'text-[#34D399]'
                            : result.urlAnalysis?.hasUrl
                            ? 'text-[#FBBF24]'
                            : 'text-[#92899F]'
                        }`}
                      >
                        {result.urlAnalysis?.isAllowlisted
                          ? 'Verified Official Portal'
                          : result.urlAnalysis?.hasUrl
                          ? 'Unvetted Domain'
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Reputation API:</span>
                      <span className="text-[10px] text-[#92899F] font-mono">
                        {result.urlAnalysis?.reputationServiceStatus?.includes('Unavailable')
                          ? 'Unconfigured'
                          : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Warning Signs with Monospace Evidence */}
              {result.combinedIndicators && result.combinedIndicators.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-[#FB7185] uppercase tracking-wider">
                      Matched Warning Indicators ({result.combinedIndicators.length})
                    </h2>
                    <span className="text-[10px] text-[#92899F]">Evidence Grounds</span>
                  </div>

                  <div className="space-y-3">
                    {result.combinedIndicators.map((indicator, idx) => {
                      const isCritical = indicator.severity === 'CRITICAL';
                      const isHigh = indicator.severity === 'HIGH';

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-[#FB7185]/30 bg-[rgba(26,14,24,0.6)] backdrop-blur-md space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-[#FB7185] text-xs sm:text-sm font-display block">
                                {indicator.name}
                              </span>
                              <span className="text-[10px] text-[#92899F]">
                                Category: {indicator.category || 'Opportunity Security'} • Source: {indicator.source || 'Engine'}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase shrink-0 ${
                                isCritical
                                  ? 'bg-[#FB7185] text-black font-extrabold shadow-sm'
                                  : isHigh
                                  ? 'bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/40'
                                  : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40'
                              }`}
                            >
                              {indicator.severity} ({indicator.weight} pts)
                            </span>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-0.5">
                              Why It Matters:
                            </div>
                            <p className="text-[#F7F5FC] text-xs leading-relaxed">
                              {indicator.explanation}
                            </p>
                          </div>

                          {/* Evidence Snippet */}
                          {indicator.evidenceSnippet && (
                            <div className="bg-[rgba(9,9,15,0.7)] p-2.5 rounded-lg border border-[#FB7185]/30 text-[#FB7185] font-mono text-[11px]">
                              <span className="text-[#92899F] block text-[9px] uppercase font-bold mb-0.5">
                                Matched from announcement:
                              </span>
                              "{indicator.evidenceSnippet}"
                            </div>
                          )}

                          {indicator.recommendedAction && (
                            <div className="text-[11px] text-[#C4B5FD] pt-1">
                              <strong>Recommended Action:</strong> {indicator.recommendedAction}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What Cannot Be Checked from Static Text Alone */}
              <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-3">
                <h2 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Info className="w-4 h-4 text-[#A78BFA]" />
                  <span>Limitations: What Cannot Be Verified from Static Analysis</span>
                </h2>
                <ul className="space-y-1.5 text-xs text-[#B7B0C7]">
                  {(result.unverifiedAspects || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#FBBF24] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Next Steps */}
              <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-3">
                <h2 className="text-xs font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <span>What You Can Do Next</span>
                </h2>
                <div className="space-y-2 text-xs">
                  {(result.recommendedSteps || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-[rgba(13,11,19,0.6)] backdrop-blur-md p-3 rounded-xl border border-[rgba(196,181,253,0.14)]"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-[#F7F5FC] font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Non-Guarantee Disclaimer */}
              <div className="text-[11px] text-[#B7B0C7] p-4 rounded-xl bg-[rgba(13,11,19,0.6)] backdrop-blur-md border border-[rgba(196,181,253,0.14)] leading-relaxed">
                <strong className="text-[#F7F5FC]">Important Notice:</strong> No major warning signs detected by this check does <span className="underline decoration-[#FB7185]">not</span> guarantee that an opportunity is authentic or that a destination site is safe. Fraud schemes continuously evolve. Always independently verify offers through your college Training & Placement Cell (TPO) or the organization's verified domain.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
