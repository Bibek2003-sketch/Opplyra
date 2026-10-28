import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#A78BFA] shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#17141F] border border-[#30283D] px-4 py-3 rounded-2xl shadow-modal transition-all animate-bounce-short text-[#F7F5FC]">
      {icons[toast.type] || icons.info}
      <div className="text-xs font-semibold text-[#F7F5FC]">{toast.message}</div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-[#8F879F] hover:text-[#F7F5FC] hover:bg-[#1E1929] transition-colors ml-2"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
