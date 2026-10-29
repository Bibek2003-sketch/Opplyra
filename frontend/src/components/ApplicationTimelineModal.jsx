import React from 'react';
import {
  X,
  Clock,
  ExternalLink,
  Building,
  Calendar,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function ApplicationTimelineModal({
  isOpen,
  onClose,
  application,
  onOpenStatusModal,
}) {
  if (!isOpen || !application) return null;

  const history = application.statusHistory || [];
  const deadlineDate = application.deadline ? new Date(application.deadline) : null;
  const applicationDate = application.applicationDate ? new Date(application.applicationDate) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-[#A78BFA] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                {application.organization}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] text-[#B7B0C7]">
                {application.opportunityType}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F7F5FC] font-display line-clamp-2">
              {application.opportunityTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#91899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* Status & Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
              <div className="text-[10px] text-[#91899F] mb-1 font-medium">Current Status</div>
              <StatusBadge status={application.status} type="pipeline" />
            </div>

            <div className="p-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
              <div className="text-[10px] text-[#91899F] mb-1 font-medium">Status Source</div>
              <StatusBadge status={application.statusSource || 'Manual Update'} type="source" />
            </div>

            <div className="p-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
              <div className="text-[10px] text-[#91899F] mb-1 font-medium">Application Deadline</div>
              <div className="text-xs font-semibold text-[#F7F5FC] truncate">
                {deadlineDate ? deadlineDate.toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
              <div className="text-[10px] text-[#91899F] mb-1 font-medium">Submitted On</div>
              <div className="text-xs font-semibold text-[#C4B5FD] truncate">
                {applicationDate ? applicationDate.toLocaleDateString() : 'Pending Submission'}
              </div>
            </div>
          </div>

          {/* External Reference & Portal Link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[rgba(124,58,237,0.08)] border border-[rgba(167,139,250,0.20)] text-xs">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <div>
                <span className="text-[#91899F]">External Reference ID: </span>
                <span className="font-semibold text-white font-mono">
                  {application.externalReference || 'Not provided'}
                </span>
              </div>
            </div>

            {application.officialApplicationUrl && !application.officialApplicationUrl.includes('/demo/') ? (
              <a
                href={application.officialApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED]/30 hover:bg-[#7C3AED]/50 text-white font-semibold text-xs border border-[#7C3AED]/40 transition-colors shrink-0"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[11px] text-[#91899F] italic">Official portal link pending verification</span>
            )}
          </div>

          {/* Notes Section if exists */}
          {application.notes && (
            <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C4B5FD] mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Student Notes</span>
              </div>
              <p className="text-[#D8D2E7] leading-relaxed">
                {application.notes}
              </p>
            </div>
          )}

          {/* Chronological Status Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Status Change History ({history.length})</span>
              </h3>
              <span className="text-[10px] text-[#91899F]">Newest first</span>
            </div>

            {history.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] text-center text-xs text-[#91899F]">
                No status history recorded yet.
              </div>
            ) : (
              <div className="relative border-l border-[rgba(255,255,255,0.12)] ml-3 pl-5 space-y-4 py-1">
                {history.map((item, index) => {
                  const date = item.timestamp ? new Date(item.timestamp) : new Date();
                  return (
                    <div key={item._id || index} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#14101F] border-2 border-[#A78BFA] group-hover:bg-[#7C3AED] transition-colors" />

                      <div className="p-3 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={item.newStatus} type="pipeline" />
                            {item.previousStatus && item.previousStatus !== item.newStatus && (
                              <span className="text-[11px] text-[#91899F]">
                                from <em>{item.previousStatus}</em>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={item.source || 'Manual Update'} type="source" />
                            <span className="text-[11px] text-[#91899F]">
                              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {item.note && (
                          <p className="text-xs text-[#D8D2E7] pt-1 border-t border-[rgba(255,255,255,0.06)] leading-relaxed">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.10)] mt-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenStatusModal) onOpenStatusModal(application);
            }}
            className="px-4 py-2 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#C4B5FD] border border-[#7C3AED]/35 text-xs font-semibold transition-colors cursor-pointer"
          >
            Update Status
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

