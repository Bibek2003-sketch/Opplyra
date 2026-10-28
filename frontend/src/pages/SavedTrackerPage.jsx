import React, { useState } from 'react';
import {
  BookmarkCheck,
  Building,
  Calendar,
  ExternalLink,
  Trash2,
  Bell,
  Clock,
  FileEdit,
  Save
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export function SavedTrackerPage({
  savedItems,
  onUpdateStatus,
  onRemoveSaved,
  onOpenReminder,
  onSelectOpportunity,
  onNavigate
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const statusOptions = [
    { id: 'All', label: 'All' },
    { id: 'Interested', label: 'Saved' },
    { id: 'Preparing', label: 'Planning to Apply' },
    { id: 'Applied', label: 'Applied' },
    { id: 'Completed', label: 'Completed' },
  ];

  const filteredItems = savedItems.filter((item) => {
    if (selectedStatusFilter === 'All') return true;
    return item.status.toLowerCase() === selectedStatusFilter.toLowerCase();
  });

  const handleStartEditNotes = (item) => {
    setEditingNotesId(item.opportunityId || item._id);
    setTempNotes(item.notes || '');
  };

  const handleSaveNotes = async (opportunityId, currentStatus) => {
    await onUpdateStatus(opportunityId, currentStatus, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6 pb-12 text-[#F7F5FC]">
      {/* Header Bar */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F7F5FC] font-display">
            My Applications ({savedItems.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#B7B0C7] mt-0.5">
            Organize and track the opportunities you want to apply for
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {statusOptions.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatusFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                selectedStatusFilter === st.id
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm font-bold'
                  : 'glass-card border-[rgba(196,181,253,0.16)] text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[rgba(36,28,51,0.6)]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(18,16,25,0.7)] text-[#A78BFA] border border-[rgba(196,181,253,0.16)] flex items-center justify-center mx-auto text-xl">
            🔖
          </div>
          <h2 className="text-sm font-bold text-[#F7F5FC] font-display">
            {selectedStatusFilter === 'All'
              ? "You haven't saved any opportunities yet"
              : `No opportunities marked as "${statusOptions.find(s => s.id === selectedStatusFilter)?.label || selectedStatusFilter}"`}
          </h2>
          <p className="text-xs text-[#B7B0C7]">
            {selectedStatusFilter === 'All'
              ? "You haven't saved any opportunities yet. Browse the catalogue to find opportunities worth exploring."
              : "Change your filter to view other saved items, or explore the catalogue."}
          </p>
          <button
            onClick={() => onNavigate('catalogue')}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Find Opportunities
          </button>
        </div>
      )}

      {/* Saved Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item) => {
          const opp = item.opportunity;
          if (!opp) return null;

          const oppId = item.opportunityId || item._id;
          const deadlineDate = new Date(opp.deadline);
          const diffDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isUrgent = diffDays > 0 && diffDays <= 4;
          const isEditing = editingNotesId === oppId;

          return (
            <div
              key={item._id}
              className="glass-card glass-card-interactive rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Category + Date + Delete */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={opp.category} type="category" />
                    <span className="text-[10px] text-[#92899F] font-medium">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveSaved(oppId)}
                    className="p-1.5 rounded-lg text-[#92899F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors cursor-pointer"
                    title="Remove from saved"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Organization & Title */}
                <div className="text-xs text-[#B7B0C7] font-medium mb-1 truncate flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>{opp.organization}</span>
                </div>

                <h2
                  onClick={() => onSelectOpportunity(opp)}
                  className="text-base font-bold text-[#F7F5FC] hover:text-[#C4B5FD] cursor-pointer transition-colors leading-snug mb-3 font-display"
                >
                  {opp.title}
                </h2>

                {/* Status Switcher & Deadline */}
                <div className="bg-[rgba(13,11,19,0.6)] p-3 rounded-xl border border-[rgba(196,181,253,0.14)] flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F7F5FC] text-[11px]">Application Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(oppId, e.target.value, item.notes)}
                      className="bg-[rgba(9,9,15,0.8)] border border-[rgba(196,181,253,0.18)] rounded-lg px-2 py-1 font-bold text-[#F7F5FC] text-xs focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                    >
                      <option value="Interested" className="bg-[#17141F]">Saved</option>
                      <option value="Preparing" className="bg-[#17141F]">Planning to Apply</option>
                      <option value="Applied" className="bg-[#17141F]">Applied</option>
                      <option value="Completed" className="bg-[#17141F]">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-[#FBBF24]' : 'text-[#92899F]'}`} />
                    <span className={isUrgent ? 'font-bold text-[#FCD34D]' : 'text-[#B7B0C7]'}>
                      {diffDays < 0 ? 'Closed' : `${diffDays} days left`}
                    </span>
                  </div>
                </div>

                {/* Personal Notes Section */}
                <div className="mb-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#A78BFA] mb-1">
                    <span>Your Notes:</span>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditNotes(item)}
                        className="text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>{item.notes ? 'Edit' : 'Add Note'}</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Write reminders for yourself (e.g. ask for recommendation letter, submit before Friday)..."
                        className="w-full p-2.5 glass-input rounded-xl text-xs font-medium resize-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-[#92899F] hover:text-[#F7F5FC] rounded-lg text-[11px] font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(oppId, item.status)}
                          className="px-3 py-1 bg-[#7C3AED] text-white rounded-lg font-semibold text-[11px] hover:bg-[#6D28D9] flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#EDE5FF] text-xs italic bg-[rgba(13,11,19,0.6)] p-3 rounded-xl border border-dashed border-[rgba(196,181,253,0.16)] leading-relaxed">
                      {item.notes || 'No notes added yet. Click "Add Note" to write reminders for yourself.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[rgba(196,181,253,0.14)] flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onOpenReminder(opp)}
                  className="flex items-center gap-1.5 text-[#B7B0C7] hover:text-[#F7F5FC] font-semibold px-2 py-1.5 rounded-xl hover:bg-[#1E1929] transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Set Reminder</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectOpportunity(opp)}
                    className="font-semibold text-[#A78BFA] hover:underline text-xs"
                  >
                    View Details
                  </button>
                  {opp.sourceUrl && (
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-[#8F879F] hover:text-[#F7F5FC] hover:bg-[#1E1929]"
                      title="Open Official Website"
                      aria-label="Open Official Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
