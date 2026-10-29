import React, { useState } from 'react';
import {
  X,
  Building,
  Calendar,
  ExternalLink,
  Bookmark,
  Bell,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  UserCheck,
  Award,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function OpportunityModal({
  opportunity,
  onClose,
  isSaved,
  savedStatus,
  onToggleSave,
  onUpdateStatus,
  onOpenReminder,
  onOpenProfile,
  onApplyNow,
}) {
  const [activeTab, setActiveTab] = useState('eligibility');

  if (!opportunity) return null;

  const eligibility = opportunity.eligibility || {};
  const evaluations = eligibility.evaluations || [];

  const matchedCount = evaluations.filter(e => e.status === 'MATCHED').length;
  const unmatchedCount = evaluations.filter(e => e.status === 'UNMATCHED').length;
  const unknownCount = evaluations.filter(e => e.status === 'UNKNOWN').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.94)] backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-modal border border-[rgba(255,255,255,0.14)] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.10)] flex items-start justify-between gap-4 bg-[rgba(18,15,26,0.65)]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <StatusBadge status={opportunity.category} type="category" />
              {opportunity.type && (
                <span className="text-xs font-semibold text-[#C4B5FD] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-lg border border-[#7C3AED]/35">
                  {opportunity.type}
                </span>
              )}
              {opportunity.isDemonstration && (
                <span className="text-[10px] font-semibold tracking-wider text-[#B7B0C7] bg-[rgba(36,28,51,0.6)] px-2.5 py-0.5 rounded-lg uppercase border border-[rgba(196,181,253,0.14)]">
                  Sample Listing
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F7F5FC] leading-snug font-display">
              {opportunity.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#B7B0C7] mt-1.5 font-medium">
              <div className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="font-semibold text-[#F7F5FC]">{opportunity.organization}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#92899F] hover:text-[#F7F5FC] hover:bg-[rgba(36,28,51,0.6)] transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-3 bg-[rgba(13,11,19,0.7)] border-b border-[rgba(196,181,253,0.12)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(opportunity._id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all duration-200 border cursor-pointer ${
                isSaved
                  ? 'bg-[#7C3AED]/25 text-[#C4B5FD] border-[#7C3AED]/40'
                  : 'glass-card border-[rgba(196,181,253,0.16)] text-[#F7F5FC] hover:bg-[rgba(36,28,51,0.6)]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save Opportunity'}</span>
            </button>

            {isSaved && (
              <select
                value={savedStatus || 'Interested'}
                onChange={(e) => onUpdateStatus(opportunity._id, e.target.value)}
                className="bg-[rgba(23,20,31,0.7)] border border-[rgba(196,181,253,0.16)] text-[#F7F5FC] text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                <option value="Interested" className="bg-[#17141F]">Status: Saved</option>
                <option value="Preparing" className="bg-[#17141F]">Status: Planning to Apply</option>
                <option value="Applied" className="bg-[#17141F]">Status: Applied</option>
                <option value="Completed" className="bg-[#17141F]">Status: Completed</option>
              </select>
            )}

            <button
              onClick={() => onOpenReminder(opportunity)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold glass-card border-[rgba(196,181,253,0.16)] text-[#F7F5FC] hover:bg-[rgba(36,28,51,0.6)] transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Set Reminder</span>
            </button>
          </div>

          {opportunity.sourceUrl && opportunity.urlVerificationStatus !== 'unavailable' ? (
            <button
              type="button"
              onClick={() => {
                if (onApplyNow) {
                  onApplyNow(opportunity);
                } else {
                  window.open(opportunity.sourceUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer ${
                opportunity.urlVerificationStatus === 'needs_review'
                  ? 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/30'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
              }`}
            >
              <span>{opportunity.urlVerificationStatus === 'needs_review' ? 'Review Official Link' : 'Apply on Official Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[11px] text-[#91899F] italic">
              Official application link pending verification
            </span>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#30283D] flex gap-6 bg-[#17141F] text-xs font-semibold text-[#B7B0C7]">
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'eligibility'
                ? 'border-[#7C3AED] text-[#C4B5FD] font-bold'
                : 'border-transparent hover:text-[#F7F5FC]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Check My Eligibility ({evaluations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'description'
                ? 'border-[#7C3AED] text-[#C4B5FD] font-bold'
                : 'border-transparent hover:text-[#F7F5FC]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full Description</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-[#7C3AED] text-[#C4B5FD] font-bold'
                : 'border-transparent hover:text-[#F7F5FC]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Required Documents ({opportunity.requiredDocuments?.length || 0})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-sm bg-[#09090F]">
          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              {/* Summary Status Box */}
              <div className="bg-[#17141F] border border-[#30283D] rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="font-bold text-[#F7F5FC] text-sm flex items-center gap-2 font-display">
                    <span>How This Matches Your Details</span>
                  </div>
                  <button
                    onClick={onOpenProfile}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] hover:underline"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Update My Details</span>
                  </button>
                </div>
                <p className="text-xs text-[#B7B0C7] mb-3.5 leading-relaxed">
                  {eligibility.overallMessage || 'Comparing listed requirements with your current profile details.'}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/35 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    {matchedCount} Matched
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/35 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FB7185]" />
                    {unmatchedCount} Don't Match
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 font-semibold">
                    <HelpCircle className="w-3.5 h-3.5 text-[#FBBF24]" />
                    {unknownCount} Needs Manual Check
                  </span>
                </div>
              </div>

              {/* Criteria List */}
              <div className="space-y-3">
                {evaluations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#30283D] bg-[#17141F] flex flex-col gap-2.5 hover:border-[#7C3AED]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-[#F7F5FC] text-xs uppercase tracking-wider">
                        {item.field}
                      </span>
                      <StatusBadge status={item.status} type="eligibility" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#09090F] p-3 rounded-xl border border-[#30283D]">
                        <span className="font-semibold text-[#8F879F] block mb-0.5">Requirement:</span>
                        <span className="text-[#F7F5FC] font-medium">{item.statedRequirement}</span>
                      </div>
                      <div className="bg-[#09090F] p-3 rounded-xl border border-[#30283D]">
                        <span className="font-semibold text-[#8F879F] block mb-0.5">Your Profile:</span>
                        <span className="text-[#F7F5FC] font-medium">{item.studentValue}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#B7B0C7] italic mt-0.5 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Assistive Disclaimer */}
              <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-xl p-4 text-xs text-[#FCD34D] leading-relaxed">
                <span className="font-bold block mb-1 text-[#FBBF24]">Important Note:</span>
                This check compares your saved profile with the stated requirements to give you a helpful guide. <strong className="text-white">Eligibility is never guaranteed.</strong> Official requirements and final decisions are determined solely by the issuing organization.
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#F7F5FC] text-sm mb-2 font-display">About This Opportunity</h3>
                <p className="text-[#EDE5FF] leading-relaxed text-xs sm:text-sm">
                  {opportunity.fullDescription}
                </p>
              </div>

              {opportunity.stipendOrAward && (
                <div className="bg-[#7C3AED]/15 border border-[#7C3AED]/35 rounded-xl p-4 flex items-center gap-3">
                  <Award className="w-6 h-6 text-[#C4B5FD] shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Stipend or Award Amount</div>
                    <div className="text-base font-bold text-[#F7F5FC] font-display">{opportunity.stipendOrAward}</div>
                  </div>
                </div>
              )}

              {opportunity.tags && opportunity.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#F7F5FC] text-xs mb-2 uppercase tracking-wider">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-[#17141F] text-[#C4B5FD] px-3 py-1 rounded-lg border border-[#30283D] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <p className="text-xs text-[#B7B0C7]">
                Make sure you have copies of these documents ready before you submit your application:
              </p>
              {opportunity.requiredDocuments && opportunity.requiredDocuments.length > 0 ? (
                <ul className="space-y-2">
                  {opportunity.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-[#17141F] p-3.5 rounded-xl border border-[#30283D] text-xs text-[#F7F5FC] font-medium">
                      <FileText className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-[#8F879F] italic p-4 bg-[#17141F] rounded-xl border border-[#30283D]">
                  No specific documents were listed in the summary. Please check the official website for instructions.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#30283D] bg-[#17141F] flex items-center justify-between">
          <div className="text-xs text-[#8F879F]">
            Listed on: {opportunity.sourceTimestamp ? new Date(opportunity.sourceTimestamp).toLocaleDateString() : 'Recent'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
