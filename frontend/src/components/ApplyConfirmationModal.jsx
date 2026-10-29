import React, { useState } from 'react';
import { X, CheckCircle, ExternalLink, Hash, FileText, ArrowRight, Clock } from 'lucide-react';

export function ApplyConfirmationModal({
  isOpen,
  onClose,
  application,
  opportunity,
  onConfirmApplied,
  onKeepStarted,
}) {
  const [externalReference, setExternalReference] = useState(application?.externalReference || '');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const title = application?.opportunityTitle || opportunity?.title || 'Application';
  const org = application?.organization || opportunity?.organization || 'Official Portal';
  const url = application?.officialApplicationUrl || opportunity?.sourceUrl || '';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmApplied({
        externalReference: externalReference.trim(),
        note: note.trim() || 'Student confirmed submission on official portal.',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotYet = () => {
    if (onKeepStarted) onKeepStarted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F7F5FC] font-display">
                Did you submit your application?
              </h2>
              <p className="text-xs text-[#91899F] mt-0.5">
                Confirm your submission to update your Opplyra tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#91899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opportunity Card Snapshot */}
        <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] mb-5 space-y-1.5">
          <div className="text-[11px] font-semibold text-[#A78BFA] uppercase tracking-wider">
            {org}
          </div>
          <h3 className="text-sm font-bold text-[#F7F5FC] line-clamp-1">
            {title}
          </h3>
          {url && (
            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#B7B0C7]">
              <ExternalLink className="w-3.5 h-3.5 text-[#A78BFA]" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C4B5FD] hover:underline truncate"
              >
                {url}
              </a>
            </div>
          )}
        </div>

        {/* Notice of external submission */}
        <div className="p-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-xs text-[#DDD6FE] mb-4 leading-relaxed">
          <strong>Application Workflow:</strong> Opplyra does not submit external forms on your behalf. Submitting takes place directly on the organization's official website. Confirming below will transition this application status to <span className="font-semibold text-white">Applied</span> in your private dashboard.
        </div>

        <div className="space-y-3.5 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">
              External Reference / Application ID <span className="text-[#91899F] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
              <input
                type="text"
                value={externalReference}
                onChange={(e) => setExternalReference(e.target.value)}
                placeholder="e.g. APP-2026-8910 or Roll No."
                className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium placeholder-[#91899F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">
              Submission Notes <span className="text-[#91899F] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-[#91899F]" />
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Uploaded bonafide certificate and recommendation letters"
                className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium placeholder-[#91899F] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleNotYet}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-white/20 text-[#B7B0C7] hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
          >
            Not Yet (Keep in Progress)
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Yes, I Submitted</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

