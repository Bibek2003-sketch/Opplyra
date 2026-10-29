import React, { useState, useEffect } from 'react';
import { X, User, Check } from 'lucide-react';

export function ProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  const [formData, setFormData] = useState({
    fullName: currentProfile?.fullName || 'Priya Sharma',
    course: currentProfile?.course || 'B.Tech Computer Science',
    academicYear: currentProfile?.academicYear || '3rd Year',
    cgpa: currentProfile?.cgpa || 8.2,
    location: currentProfile?.location || 'Karnataka, India',
    category: currentProfile?.category || 'General',
    gender: currentProfile?.gender || 'Female',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        fullName: currentProfile.fullName || '',
        course: currentProfile.course || '',
        academicYear: currentProfile.academicYear || '3rd Year',
        cgpa: currentProfile.cgpa || 8.0,
        location: currentProfile.location || '',
        category: currentProfile.category || 'General',
        gender: currentProfile.gender || 'Female',
      });
    }
  }, [currentProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.94)] backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] flex items-center justify-center font-bold border border-[#7C3AED]/35 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#F7F5FC] text-base font-display">Your Student Profile</h2>
              <p className="text-xs text-[#B7B0C7]">These details help Opplyra match you with relevant opportunities</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#92899F] hover:text-[#F7F5FC] rounded-xl hover:bg-[rgba(36,28,51,0.6)] transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#F7F5FC] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium placeholder-[#92899F]"
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">Degree or Course</label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium placeholder-[#92899F]"
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">Current Year of Study</label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium cursor-pointer"
              >
                <option value="1st Year" className="bg-[#17141F]">1st Year</option>
                <option value="2nd Year" className="bg-[#17141F]">2nd Year</option>
                <option value="3rd Year" className="bg-[#17141F]">3rd Year</option>
                <option value="4th Year" className="bg-[#17141F]">4th Year</option>
                <option value="Graduates" className="bg-[#17141F]">Recent Graduate</option>
                <option value="Postgraduate" className="bg-[#17141F]">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium cursor-pointer"
              >
                <option value="General" className="bg-[#17141F]">General</option>
                <option value="OBC" className="bg-[#17141F]">OBC</option>
                <option value="SC" className="bg-[#17141F]">SC</option>
                <option value="ST" className="bg-[#17141F]">ST</option>
                <option value="EWS" className="bg-[#17141F]">EWS</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#F7F5FC] mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium cursor-pointer"
              >
                <option value="Female" className="bg-[#17141F]">Female</option>
                <option value="Male" className="bg-[#17141F]">Male</option>
                <option value="Non-Binary" className="bg-[#17141F]">Non-Binary</option>
                <option value="Prefer not to say" className="bg-[#17141F]">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#F7F5FC] mb-1.5">Location or State</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium placeholder-[#92899F]"
              placeholder="e.g. Karnataka, India"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[rgba(196,181,253,0.14)]">
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
              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
