import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building,
  Calendar,
  Award,
  Sparkles,
  Camera,
  Trash2,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Edit3,
  X,
  Plus,
  Compass,
  Briefcase,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../api/client';

export function ProfilePage({ profile, onUpdateProfile, onLogout, showToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    university: '',
    course: '',
    specialization: '',
    academicYear: '3rd Year',
    semester: 'Semester 6',
    graduationYear: '2026',
    cgpa: 8.2,
    avatarUrl: '',
    preferredCategories: ['Scholarships', 'Internships'],
    preferredIndustries: ['Technology & Software'],
    careerInterests: ['Full Stack Engineering', 'Machine Learning'],
    skills: ['JavaScript', 'Python', 'React', 'Problem Solving'],
    preferredLocations: ['Remote', 'Bengaluru'],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newInterestInput, setNewInterestInput] = useState('');

  // Password Change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Sync profile data from props or fetch freshly
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
        university: profile.university || 'Indian Institute of Technology / State University',
        course: profile.course || 'B.Tech Computer Science',
        specialization: profile.specialization || '',
        academicYear: profile.academicYear || '3rd Year',
        semester: profile.semester || 'Semester 6',
        graduationYear: profile.graduationYear || '2026',
        cgpa: profile.cgpa ?? 8.2,
        avatarUrl: profile.avatarUrl || '',
        preferredCategories: profile.preferredCategories || ['Scholarships', 'Internships'],
        preferredIndustries: profile.preferredIndustries || ['Technology & Software'],
        careerInterests: profile.careerInterests || ['Full Stack Engineering', 'Machine Learning'],
        skills: profile.skills || ['JavaScript', 'Python', 'React', 'Problem Solving'],
        preferredLocations: profile.preferredLocations || ['Remote', 'Bengaluru'],
      }));
    }
  }, [profile]);

  // Compute actual Profile Completion percentage from populated fields
  const computeCompletion = () => {
    const fields = [
      { name: 'Full Name', val: formData.fullName },
      { name: 'Email Address', val: formData.email },
      { name: 'Phone Number', val: formData.phone },
      { name: 'City / Location', val: formData.city },
      { name: 'University / College', val: formData.university },
      { name: 'Course / Degree', val: formData.course },
      { name: 'Academic Year', val: formData.academicYear },
      { name: 'Specialization', val: formData.specialization },
      { name: 'Graduation Year', val: formData.graduationYear },
      { name: 'CGPA', val: formData.cgpa },
      { name: 'Categories', val: formData.preferredCategories?.length > 0 },
      { name: 'Skills', val: formData.skills?.length > 0 },
      { name: 'Profile Photo', val: formData.avatarUrl },
    ];

    const filledCount = fields.filter((f) => Boolean(f.val)).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    const missing = fields.find((f) => !f.val);
    const tip = missing ? `Add your ${missing.name.toLowerCase()} to boost completion` : 'Profile complete!';

    return { percentage, tip };
  };

  const { percentage: completionPercentage, tip: nextTip } = computeCompletion();

  // Handle Form Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle multi-select tags
  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  // Add custom skill or interest
  const addTag = (field, value, clearFn) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: Array.from(new Set([...(prev[field] || []), value.trim()])),
    }));
    clearFn('');
  };

  const removeTag = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((x) => x !== item),
    }));
  };

  // Submit Profile Form
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await api.updateProfile(formData);
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      if (onUpdateProfile) onUpdateProfile(res.data);
      if (showToast) showToast('Profile changes saved successfully.');
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Photo Upload Handlers
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setStatusMessage({
        type: 'error',
        text: 'Unsupported file type. Please upload a PNG, JPEG, or WebP image.',
      });
      return;
    }

    // Client-side file size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'Image size exceeds 2MB. Please select a smaller photo.',
      });
      return;
    }

    setIsUploadingPhoto(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const res = await api.uploadAvatar({
          image: base64,
          mimeType: file.type,
        });

        const newAvatarUrl = res.data.avatarUrl;
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
        if (onUpdateProfile) {
          onUpdateProfile({ ...profile, avatarUrl: newAvatarUrl });
        }
        setStatusMessage({ type: 'success', text: 'Profile photo updated!' });
        if (showToast) showToast('Profile photo updated.');
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message || 'Could not upload photo.' });
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: 'Failed to read image file.' });
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    setStatusMessage(null);
    try {
      await api.removeAvatar();
      setFormData((prev) => ({ ...prev, avatarUrl: '' }));
      if (onUpdateProfile) {
        onUpdateProfile({ ...profile, avatarUrl: '' });
      }
      setStatusMessage({ type: 'success', text: 'Profile photo removed.' });
      if (showToast) showToast('Profile photo removed.');
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not remove photo.' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(passwordData);
      setPasswordSuccess('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
      if (showToast) showToast('Password updated successfully.');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Generated initials fallback
  const initials = (formData.fullName || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="space-y-8 pb-16 text-[#F7F5FC] max-w-6xl mx-auto">
      {/* ======================================================== */}
      {/* 1. PROFILE HEADER & PHOTO MANAGEMENT                     */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 shadow-sm">
        {/* Subtle ambient violet & blue glow behind header */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7C3AED]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar with Upload Control */}
            <div className="relative group shrink-0 self-start sm:self-auto">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#7C3AED]/40 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED]/30 via-[#15121C] to-[#38BDF8]/20 border-2 border-[#7C3AED]/30 flex items-center justify-center font-display font-black text-2xl sm:text-3xl text-[#F7F5FC] shadow-sm">
                  {initials}
                </div>
              )}

              {/* Photo Actions Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs transition-transform hover:scale-105 cursor-pointer"
                  title="Upload New Photo"
                  aria-label="Upload New Photo"
                  disabled={isUploadingPhoto}
                >
                  <Camera className="w-4 h-4" />
                </button>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 rounded-xl bg-[#FB7185]/80 hover:bg-[#FB7185] text-white shadow-xs transition-transform hover:scale-105 cursor-pointer"
                    title="Remove Photo"
                    aria-label="Remove Photo"
                    disabled={isUploadingPhoto}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Name, University, Verified Badge */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#F7F5FC] font-display tracking-tight truncate">
                  {formData.fullName || 'Student'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Student</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#B7B0C7] flex items-center gap-1.5 font-medium truncate">
                <Mail className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                <span>{formData.email || 'student@college.edu'}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#91899F] pt-0.5">
                <span className="flex items-center gap-1 text-[#F7F5FC]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#B69AFF]" />
                  <span>{formData.course}</span>
                </span>
                <span>•</span>
                <span>{formData.academicYear}</span>
                {formData.university && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[240px]">{formData.university}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action & Status */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                isEditing
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.16]'
                  : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>

            {/* Profile Completion Indicator */}
            <div className="w-full sm:w-56 p-3 rounded-xl bg-[rgba(14,12,19,0.55)] border border-white/[0.08] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-[#B7B0C7]">Profile Completion</span>
                <span className="font-bold text-[#38BDF8] font-display">{completionPercentage}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-[#91899F] truncate">{nextTip}</p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300'
                : 'bg-[#FB7185]/15 border border-[#FB7185]/35 text-[#FB7185]'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. EDITABLE PROFILE SECTIONS                             */}
      {/* ======================================================== */}
      <form onSubmit={handleSubmitProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section A: Personal & Contact Details */}
          <div className="rounded-2xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <div className="w-6 h-6 rounded-md bg-[#38BDF8]/15 border border-[#38BDF8]/25 text-[#38BDF8] flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#F7F5FC] font-display">Personal Details</h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                  Full Name <span className="text-[#FB7185]">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                  Email Address <span className="text-[#91899F] font-normal">(Account identifier)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#91899F] font-medium opacity-75 cursor-not-allowed bg-white/[0.02]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-400">
                    Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                    Phone Number <span className="text-[#91899F] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                    City & State <span className="text-[#91899F] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.city ? `${formData.city}, ${formData.state || 'India'}` : formData.state || ''}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      handleChange('city', parts[0]?.trim() || '');
                      if (parts[1]) handleChange('state', parts[1]?.trim() || '');
                    }}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Academic Details */}
          <div className="rounded-2xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <div className="w-6 h-6 rounded-md bg-[#B69AFF]/15 border border-[#B69AFF]/25 text-[#B69AFF] flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#F7F5FC] font-display">Academic Details</h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                  College / University <span className="text-[#FB7185]">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  placeholder="e.g. Indian Institute of Science"
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                    Degree / Course <span className="text-[#FB7185]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                    Specialization <span className="text-[#91899F] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">Academic Year</label>
                  <select
                    disabled={!isEditing}
                    value={formData.academicYear}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    className="w-full px-2.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium bg-[#14101F] disabled:opacity-75 disabled:bg-white/[0.02]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduates">Graduates</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">Graduation</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.graduationYear}
                    onChange={(e) => handleChange('graduationYear', e.target.value)}
                    placeholder="2026"
                    className="w-full px-2.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">CGPA (0-10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    disabled={!isEditing}
                    value={formData.cgpa}
                    onChange={(e) => handleChange('cgpa', e.target.value)}
                    className="w-full px-2.5 py-2.5 glass-input rounded-xl text-xs text-[#F7F5FC] font-medium disabled:opacity-75 disabled:bg-white/[0.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Opportunity Preferences & Skills */}
        <div className="rounded-2xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
            <div className="w-6 h-6 rounded-md bg-[#34D399]/15 border border-[#34D399]/25 text-[#34D399] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F7F5FC] font-display">Opportunity Preferences</h2>
              <p className="text-[11px] text-[#91899F]">
                Used to personalize your recommended opportunities and deadline highlights.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Preferred Categories */}
            <div>
              <label className="block text-xs font-semibold text-[#B7B0C7] mb-2">
                Preferred Opportunity Sectors
              </label>
              <div className="flex flex-wrap gap-2">
                {['Scholarships', 'Internships', 'Competitive Examinations', 'Jobs & Training'].map((cat) => {
                  const isSelected = formData.preferredCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleArrayItem('preferredCategories', cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#7C3AED]/25 text-white border-[#7C3AED]/60 shadow-xs'
                          : 'bg-white/[0.02] text-[#91899F] border-white/[0.08] hover:text-[#F7F5FC]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills Tags */}
            <div>
              <label className="block text-xs font-semibold text-[#B7B0C7] mb-2">
                Technical & Academic Skills <span className="text-[#91899F] font-normal">(Optional)</span>
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.10] text-xs font-medium text-[#F7F5FC]"
                  >
                    <span>{skill}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag('skills', skill)}
                        className="text-[#91899F] hover:text-[#FB7185] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('skills', newSkillInput, setNewSkillInput);
                        }
                      }}
                      placeholder="Add skill (e.g. Node.js)..."
                      className="px-3 py-1 rounded-xl glass-input text-xs text-[#F7F5FC] placeholder-[#91899F] w-44"
                    />
                    <button
                      type="button"
                      onClick={() => addTag('skills', newSkillInput, setNewSkillInput)}
                      className="p-1 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block text-xs font-semibold text-[#B7B0C7] mb-2">
                Preferred Opportunity Locations
              </label>
              <div className="flex flex-wrap gap-2">
                {['Remote', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune'].map((loc) => {
                  const isSelected = formData.preferredLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleArrayItem('preferredLocations', loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40 shadow-xs'
                          : 'bg-white/[0.02] text-[#91899F] border-white/[0.08] hover:text-[#F7F5FC]'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Floating Action Bar when Editing */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-white/[0.12] hover:bg-white/[0.06] text-xs font-semibold text-[#B7B0C7] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* ======================================================== */}
      {/* 3. ACCOUNT & SECURITY SECTION                            */}
      {/* ======================================================== */}
      <section className="rounded-2xl bg-[rgba(21,18,28,0.50)] backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FB7185]/15 border border-[#FB7185]/25 text-[#FB7185] flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F7F5FC] font-display">Account & Security</h2>
              <p className="text-[11px] text-[#91899F]">
                Manage your credentials and authenticated session.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <h3 className="text-xs font-bold text-[#F7F5FC] uppercase tracking-wider">
              Change Account Password
            </h3>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-[#FB7185]/15 border border-[#FB7185]/35 text-xs text-[#FB7185] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2 glass-input rounded-xl text-xs text-[#F7F5FC]"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#91899F] hover:text-[#F7F5FC] transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40 cursor-pointer"
                  title={showPasswords.current ? 'Hide current password' : 'Show current password'}
                  aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                  New Password (min 6)
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2 glass-input rounded-xl text-xs text-[#F7F5FC]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('new')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#91899F] hover:text-[#F7F5FC] transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40 cursor-pointer"
                    title={showPasswords.new ? 'Hide new password' : 'Show new password'}
                    aria-label={showPasswords.new ? 'Hide new password' : 'Show new password'}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B7B0C7] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2 glass-input rounded-xl text-xs text-[#F7F5FC]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('confirm')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#91899F] hover:text-[#F7F5FC] transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40 cursor-pointer"
                    title={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
                    aria-label={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="py-2 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition-colors cursor-pointer border border-white/[0.10]"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Session & Logout Section */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#F7F5FC] uppercase tracking-wider mb-2">
                Session Management
              </h3>
              <p className="text-xs text-[#B7B0C7] leading-relaxed mb-4">
                You are currently signed in as <strong className="text-white">{formData.email}</strong>.
                Logging out will clear your session on this browser.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#FB7185]/25 bg-[#FB7185]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#F7F5FC]">Sign out of your account</div>
                <div className="text-[11px] text-[#91899F]">Clears authentication state securely</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="py-2 px-4 rounded-xl bg-[#FB7185]/20 hover:bg-[#FB7185]/35 text-[#FB7185] border border-[#FB7185]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

