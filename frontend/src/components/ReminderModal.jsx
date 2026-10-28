import React, { useState } from 'react';
import { X, Bell, Calendar } from 'lucide-react';

export function ReminderModal({ isOpen, onClose, opportunity, onSaveReminder }) {
  if (!isOpen || !opportunity) return null;

  const [offset, setOffset] = useState('1_day_before');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveReminder(opportunity._id, offset);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deadlineDate = new Date(opportunity.deadline);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.94)] backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#F7F5FC] text-sm sm:text-base font-display">Set a Deadline Reminder</h2>
              <p className="text-xs text-[#B7B0C7]">Choose when you want to be reminded</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#92899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(36,28,51,0.6)] transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[rgba(13,11,19,0.6)] backdrop-blur-md p-4 rounded-xl border border-[rgba(196,181,253,0.14)] mb-4 text-xs">
          <span className="font-bold text-[#F7F5FC] block line-clamp-1 mb-1 font-display">
            {opportunity.title}
          </span>
          <div className="flex items-center gap-1.5 text-[#B7B0C7] text-[11px] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Deadline: {deadlineDate.toLocaleDateString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#F7F5FC] mb-2">When should we remind you?</label>
            <div className="space-y-2">
              {[
                { value: '7_days_before', label: '7 days before deadline', desc: 'Good for gathering certificates and recommendation letters' },
                { value: '1_day_before', label: '1 day before deadline', desc: 'Final check to review and submit your form' },
                { value: '1_hour_before', label: '1 hour before deadline', desc: 'Last chance before the portal closes' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    offset === opt.value
                      ? 'border-[#7C3AED] bg-[rgba(124,58,237,0.18)] text-[#F7F5FC] shadow-sm'
                      : 'glass-card border-[rgba(196,181,253,0.14)] hover:bg-[rgba(36,28,51,0.6)] text-[#B7B0C7]'
                  }`}
                >
                  <input
                    type="radio"
                    name="offset"
                    value={opt.value}
                    checked={offset === opt.value}
                    onChange={(e) => setOffset(e.target.value)}
                    className="mt-0.5 text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#F7F5FC]">{opt.label}</div>
                    <div className="text-[11px] text-[#B7B0C7]">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[rgba(196,181,253,0.14)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[rgba(196,181,253,0.18)] rounded-xl text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[rgba(36,28,51,0.6)] font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Scheduling...' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
