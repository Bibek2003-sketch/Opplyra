import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileSearch,
  Lock,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';

export function VerificationPage() {
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const samples = [
    {
      label: 'Example 1: Suspicious Railway Notice',
      badge: 'Upfront UPI fee & guaranteed selection',
      type: 'scam',
      url: 'http://railway-jobs-apply.xyz',
      text: 'DIRECT JOINING IN INDIAN RAILWAYS! 100% selection guaranteed without exam or interview. Selected candidates must pay a refundable security deposit of Rs. 2,500 via Google Pay / UPI to HR Ramesh (+919876543210) before midnight or seat will be cancelled and offered to waitlist candidates.'
    },
    {
      label: 'Example 2: Fake Work-From-Home Job',
      badge: 'Gmail address & Telegram group link',
      type: 'scam',
      url: 'https://careers-google-verify.blogspot.com',
      text: 'Urgent hiring for Google Data Entry & AI Work from Home. Earn Rs. 4,500 daily without skills. Send your resume to recruiter.google.hiring2026@gmail.com and join our official Telegram group to apply. Only 3 seats left hurry!'
    },
    {
      label: 'Example 3: Real Official Notice (ISRO)',
      badge: 'Official government education domain',
      type: 'clean',
      url: 'https://www.isro.gov.in/careers',
      text: 'Indian Space Research Organisation invites online applications for Graduate Apprentice Trainees under the Apprentices Act. Eligible engineering graduates can review qualifications and submit details on the official NATS portal. Selection is strictly based on aggregate marks in degree.'
    }
  ];

  const handleRunSample = (sample) => {
    setInputText(sample.text);
    setInputUrl(sample.url);
    handleVerify(sample.text, sample.url);
  };

  const handleVerify = async (textToUse = inputText, urlToUse = inputUrl) => {
    if (!textToUse.trim() && !urlToUse.trim()) {
      setError('Please paste announcement text or enter a website link to check.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await api.verifyAnnouncement({
        text: textToUse.trim(),
        url: urlToUse.trim(),
      });
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Could not complete the check. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-[#F7F5FC]">
      {/* Intro Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-glass relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/15 text-[#C4B5FD] text-xs font-semibold border border-[#7C3AED]/30">
            <ShieldAlert className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Scam and Safety Check</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F5FC] tracking-tight font-display">
            Check an Announcement Before You Trust It
          </h1>

          <p className="text-xs sm:text-sm text-[#B7B0C7] leading-relaxed">
            Paste a scholarship notice, job offer, recruitment message, or website link. Opplyra will check for common warning signs and explain what you should review.
          </p>
        </div>

        {/* Example Test Cases */}
        <div className="mt-6 pt-6 border-t border-[rgba(196,181,253,0.14)] relative z-10">
          <div className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-3">
            Try an Example:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunSample(s)}
                className="text-left p-4 rounded-xl glass-card glass-card-interactive transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                    s.type === 'scam'
                      ? 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/35'
                      : 'bg-[#34D399]/15 text-[#6EE7B7] border-[#34D399]/35'
                  }`}>
                    {s.badge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#92899F] group-hover:text-[#A78BFA] transition-colors" />
                </div>
                <div className="text-xs font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] font-display transition-colors">
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form vs Results Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-glass space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
            <FileSearch className="w-4 h-4 text-[#A78BFA]" />
            <span>Check an Announcement</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Announcement Text Input */}
            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">
                Announcement Text
              </label>
              <textarea
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the message, email text, or WhatsApp forward you want to check..."
                className="w-full p-3.5 glass-input rounded-xl text-xs font-medium placeholder-[#92899F] resize-none leading-relaxed"
              />
              <span className="text-[11px] text-[#92899F] mt-1 block">
                {inputText.length} characters (at least 25 characters needed)
              </span>
            </div>

            {/* URL Input */}
            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">
                Website or Application Link
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
                <span>Links are checked safely for suspicious domain extensions and spoofing</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-[#FB7185]/15 border border-[#FB7185]/35 rounded-xl text-[#FB7185] font-semibold">
                {error}
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
                  <span>Checking for warning signs...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Check Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Structured Evidence Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !isAnalyzing && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(18,16,25,0.7)] text-[#A78BFA] border border-[rgba(196,181,253,0.16)] flex items-center justify-center mx-auto text-xl font-display">
                🛡️
              </div>
              <h2 className="text-sm font-bold text-[#F7F5FC] font-display">Paste an announcement to get started</h2>
              <p className="text-xs text-[#B7B0C7] max-w-sm mx-auto leading-relaxed">
                Paste notice text or a website link on the left, or click one of the examples above to see how this check works.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3 shadow-glass">
              <div className="w-9 h-9 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-[#F7F5FC]">Checking for warning signs...</div>
              <p className="text-xs text-[#B7B0C7]">Looking for payment requests, fake website links, and high-pressure language</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-5 animate-fade-in">
              {/* Primary Status Banner */}
              <div
                className={`p-6 rounded-2xl border shadow-glass backdrop-blur-xl ${
                  result.classification === 'WARNING_INDICATORS_DETECTED'
                    ? 'bg-[#2A111A]/80 border-[#FB7185]/40 text-[#FFF1F2]'
                    : result.classification === 'NO_INDICATORS_DETECTED'
                    ? 'bg-[#0E241B]/80 border-[#34D399]/40 text-[#F0FDF4]'
                    : 'glass-panel text-[#F7F5FC]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {result.classification === 'WARNING_INDICATORS_DETECTED' && (
                    <div className="w-10 h-10 rounded-xl bg-[#FB7185] text-white flex items-center justify-center shrink-0 shadow-md">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {result.classification === 'NO_INDICATORS_DETECTED' && (
                    <div className="w-10 h-10 rounded-xl bg-[#34D399] text-[#09090F] flex items-center justify-center shrink-0 shadow-md font-bold">
                      <ShieldCheck className="w-5 h-5 text-[#09090F]" />
                    </div>
                  )}
                  {result.classification === 'INCONCLUSIVE' && (
                    <div className="w-10 h-10 rounded-xl bg-[rgba(36,28,51,0.8)] text-white flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80 text-[#C4B5FD]">
                      What We Found
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

              {/* Warning Signs */}
              {result.indicatorsDetected && result.indicatorsDetected.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-[#FB7185] uppercase tracking-wider">
                      Warning Signs ({result.indicatorsDetected.length})
                    </h2>
                    <span className="text-[10px] text-[#92899F]">Evidence Analysis</span>
                  </div>

                  <div className="space-y-3">
                    {result.indicatorsDetected.map((indicator, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-[#FB7185]/30 bg-[rgba(26,14,24,0.6)] backdrop-blur-md space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-[#FB7185] text-xs sm:text-sm font-display">
                            {indicator.name}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/40">
                            {indicator.severity === 'HIGH' ? 'Major Red Flag' : 'Suspicious Flag'}
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
                            <span className="text-[#92899F] block text-[9px] uppercase font-bold mb-0.5">Matched from the notice:</span>
                            "{indicator.evidenceSnippet}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What Remains Unknown */}
              <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-3">
                <h2 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Info className="w-4 h-4 text-[#A78BFA]" />
                  <span>What We Cannot Check from Text Alone</span>
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

              {/* What You Can Do Next */}
              <div className="glass-panel rounded-2xl p-6 shadow-glass space-y-3">
                <h2 className="text-xs font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <span>What You Can Do Next</span>
                </h2>
                <div className="space-y-2 text-xs">
                  {(result.recommendedSteps || []).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-[rgba(13,11,19,0.6)] backdrop-blur-md p-3 rounded-xl border border-[rgba(196,181,253,0.14)]">
                      <span className="w-5 h-5 rounded-md bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-[#F7F5FC] font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-[#B7B0C7] p-4 rounded-xl bg-[rgba(13,11,19,0.6)] backdrop-blur-md border border-[rgba(196,181,253,0.14)] leading-relaxed">
                <strong className="text-[#F7F5FC]">Important Notice:</strong> This tool looks for common signs of fraud (such as requests for payment via UPI, spoofed government links, or personal email addresses). No common signs were detected does not guarantee the offer is genuine. Always confirm details on the official organization's website.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
