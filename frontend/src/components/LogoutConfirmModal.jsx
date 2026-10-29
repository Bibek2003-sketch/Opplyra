import React, { useEffect } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.fullName || user?.email || 'Student';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-xl text-[#91899F] hover:text-[#F7F5FC] hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Cancel"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#FB7185]" />
          </div>
          <div className="pr-6">
            <span className="text-[11px] font-bold text-[#FB7185] uppercase tracking-wider block mb-1">
              Warning
            </span>
            <h2
              id="logout-modal-title"
              className="text-lg sm:text-xl font-bold text-[#F7F5FC] font-display leading-snug"
            >
              Are you sure you want to log out?
            </h2>
          </div>
        </div>

        {/* Modal Description */}
        <div className="space-y-3 mb-6">
          <p className="text-xs sm:text-sm text-[#B7B0C7] leading-relaxed">
            You are currently signed in as <strong className="text-white font-semibold">{displayName}</strong>.
          </p>
          <p className="text-xs text-[#91899F] leading-relaxed bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
            Logging out will end your authenticated session on this browser. You will need to log in again to manage your application tracking records, notifications, and profile details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#B7B0C7] hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FB7185] hover:bg-[#E11D48] text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(251,113,133,0.3)] hover:shadow-[0_0_24px_rgba(251,113,133,0.45)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

