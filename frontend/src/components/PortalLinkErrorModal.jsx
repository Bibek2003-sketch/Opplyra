import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Home,
  RefreshCw,
  Flag,
  X,
  ShieldAlert,
  Lock,
  Globe,
  CheckCircle,
} from 'lucide-react';
import { api } from '../api/client';

export function PortalLinkErrorModal({
  isOpen,
  onClose,
  errorType = 'unknown', // 'invalid_url' | 'not_found' | 'unavailable' | 'access_restricted' | 'unverified' | 'unknown'
  opportunityTitle,
  organization,
  targetUrl,
  officialHomepageUrl,
  opportunityId,
  applicationId,
  onViewDetails,
}) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (!isOpen) return null;

  const errorConfigs = {
    invalid_url: {
      title: 'Invalid application link',
      message:
        'The application link for this opportunity is missing or invalid. We are reviewing the link. Please try again later.',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15 border-rose-500/25',
      allowTryAgain: false,
    },
    not_found: {
      title: 'Page not found',
      message:
        "The official website returned a 'Page Not Found' response. The application link may have changed or expired. You can visit the organization's official website to look for the current application page.",
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/25',
      allowTryAgain: true,
    },
    unavailable: {
      title: 'Website temporarily unavailable',
      message:
        'The official website is not responding right now. This may be a temporary problem with the external website or your network. Please try again later.',
      icon: Globe,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/25',
      allowTryAgain: true,
    },
    access_restricted: {
      title: 'Access restricted',
      message:
        'This website may require you to sign in or may restrict access. Open the official website directly in your browser and follow its instructions to continue.',
      icon: Lock,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/25',
      allowTryAgain: true,
    },
    unverified: {
      title: 'Unverified link',
      message:
        "We haven't verified this application link yet, so we cannot safely direct you to it. Please use the organization's official website until the link has been checked.",
      icon: ShieldAlert,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/25',
      allowTryAgain: false,
    },
    unknown: {
      title: 'Website verification issue',
      message:
        "We couldn't confirm that the application website is available. Your Opplyra application record has not been deleted or changed. Please try again later.",
      icon: AlertTriangle,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/15 border-violet-500/25',
      allowTryAgain: true,
    },
  };

  const currentConfig = errorConfigs[errorType] || errorConfigs.unknown;
  const IconComponent = currentConfig.icon;

  const handleTryAgain = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  const handleVisitHomepage = () => {
    if (officialHomepageUrl) {
      window.open(officialHomepageUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      if (opportunityId) {
        await api.reportOpportunityLink(opportunityId, {
          reason: errorType === 'not_found' ? 'page_not_found' : (errorType === 'access_restricted' ? 'login_blocked' : 'unreachable'),
          comments,
        });
      } else if (applicationId) {
        await api.reportApplicationLink(applicationId, {
          reason: errorType === 'not_found' ? 'page_not_found' : 'unreachable',
          comments,
        });
      }
      setReportSubmitted(true);
    } catch (err) {
      console.error('Failed to report broken link:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-error-title"
        className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[rgba(255,255,255,0.10)] mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${currentConfig.iconBg} ${currentConfig.iconColor}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="portal-error-title"
                className="text-base font-bold text-[#F7F5FC] font-display"
              >
                {currentConfig.title}
              </h2>
              <p className="text-xs text-[#91899F] truncate max-w-xs sm:max-w-sm">
                {organization || opportunityTitle || 'External Official Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#91899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
            <p className="text-sm text-[#E5E7EB] leading-relaxed">
              {currentConfig.message}
            </p>

            {targetUrl && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#91899F] truncate font-mono">
                  {targetUrl}
                </span>
              </div>
            )}
          </div>

          {/* Reporting Section */}
          {isReporting ? (
            reportSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs">
                  Thank you for reporting. Our verification team has flagged this link for review.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 pt-1">
                <div className="text-xs font-semibold text-white">
                  Report Broken or Outdated Link
                </div>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Optional details (e.g. Page returns error 404, or new link is available)..."
                  rows={2}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-xl p-2.5 text-xs text-white placeholder-[#71697F] focus:outline-none focus:border-[#A78BFA] transition-all"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReporting(false)}
                    className="px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.10)] text-[#B7B0C7] hover:text-white transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingReport ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Flag className="w-3.5 h-3.5" />
                        <span>Send Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : null}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            {/* Try Again */}
            {currentConfig.allowTryAgain && targetUrl && (
              <button
                type="button"
                onClick={handleTryAgain}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-[rgba(124,58,237,0.22)] hover:bg-[rgba(124,58,237,0.35)] text-white font-semibold border border-[rgba(167,139,250,0.30)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C4B5FD]" />
                <span>Try Again</span>
              </button>
            )}

            {/* Visit Official Homepage */}
            {officialHomepageUrl && (
              <button
                type="button"
                onClick={handleVisitHomepage}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.10)] text-white font-semibold border border-[rgba(255,255,255,0.12)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Visit Homepage</span>
              </button>
            )}

            {/* Report Broken Link Toggle */}
            {!isReporting && (
              <button
                type="button"
                onClick={() => setIsReporting(true)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(239,68,68,0.15)] text-[#B7B0C7] hover:text-red-200 border border-[rgba(255,255,255,0.08)] hover:border-red-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Report broken or outdated application link"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400" />
                <span>Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

