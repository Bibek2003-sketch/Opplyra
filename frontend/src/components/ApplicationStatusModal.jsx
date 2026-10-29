import React, { useState } from 'react';
import { X, Sliders, FileText, Hash, AlertTriangle, Check } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const STATUS_CHOICES = [
  { value: 'Interested', label: 'Interested', desc: 'Saved for later consideration' },
  { value: 'Application Started', label: 'Application Started', desc: 'Portal opened or form in progress' },
  { value: 'Applied', label: 'Applied', desc: 'Application submitted on official portal' },
  { value: 'Under Review', label: 'Under Review', desc: 'Being evaluated by organization committee' },
  { value: 'Shortlisted', label: 'Shortlisted', desc: 'Passed initial screening or interview round' },
  { value: 'Selected / Awarded', label: 'Selected / Awarded', desc: 'Offer received or scholarship granted' },
  { value: 'Rejected', label: 'Rejected', desc: 'Application not moving forward' },
  { value: 'Action Required', label: 'Action Required', desc: 'Additional documents or response needed' },
  { value: 'Withdrawn', label: 'Withdrawn', desc: 'Decided not to proceed' },
  { value: 'Deadline Passed', label: 'Deadline Passed', desc: 'Application window expired' },
];

export function ApplicationStatusModal({
  isOpen,
  onClose,
  application,
  onSaveStatus,
}) {
  const [selectedStatus, setSelectedStatus] = useState(application?.status || 'Applied');
  const [note, setNote] = useState('');
  const [externalReference, setExternalReference] = useState(application?.externalReference || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveStatus(application._id, {
        status: selectedStatus,
        source: 'Manual Update',
        note: note.trim(),
        externalReference: externalReference.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F7F5FC] font-display">
                Update Application Status
              </h2>
              <p className="text-xs text-[#91899F] truncate max-w-xs sm:max-w-sm mt-0.5">
                {application.opportunityTitle}
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

        {/* Current Status Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] mb-4 text-xs">
          <span className="text-[#B7B0C7]">Current Status:</span>
          <StatusBadge status={application.status} type="pipeline" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-2">
              Select New Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {STATUS_CHOICES.map((choice) => {
                const isSelected = selectedStatus === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => setSelectedStatus(choice.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#7C3AED]/25 border-[#A78BFA] text-white shadow-sm ring-1 ring-[#A78BFA]/50'
                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#B7B0C7] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <span className="font-semibold text-xs text-[#F7F5FC]">
                        {choice.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C4B5FD]" />}
                    </div>
                    <span className="text-[10px] text-[#91899F] line-clamp-1">
                      {choice.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">
              Status Note <span className="text-[#91899F] font-normal">(Recorded in Timeline History)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-[#91899F]" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Cleared online aptitude round; technical interview on Nov 4"
                className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium placeholder-[#91899F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">
              External Reference / ID <span className="text-[#91899F] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
              <input
                type="text"
                value={externalReference}
                onChange={(e) => setExternalReference(e.target.value)}
                placeholder="e.g. Candidate Ref: CR-2026-09"
                className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium placeholder-[#91899F]"
              />
            </div>
          </div>

          {/* User-Reported Transparency Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#FDE68A] flex items-start gap-2 leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>Personal Tracking Disclosure:</strong> This update is labelled as <em>User Reported</em> in your tracking history. Opplyra does not claim this status is officially verified by the issuing organization.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-white/20 text-[#B7B0C7] hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Save Status Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

