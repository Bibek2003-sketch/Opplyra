import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, GraduationCap, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export function AuthModal({ isOpen = true, onClose, initialMode = 'register', onAuthSuccess, existingProfile }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState(existingProfile?.fullName || '');
  const [course, setCourse] = useState(existingProfile?.course || 'B.Tech Computer Science');
  const [academicYear, setAcademicYear] = useState(existingProfile?.academicYear || '3rd Year');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
  }, [initialMode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        await api.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          course: course.trim(),
          academicYear: academicYear,
        });

        // Registration requires separate login: Do NOT auto-authenticate or enter dashboard
        setSuccessMessage('Account created successfully. Please log in to continue.');
        setMode('login');
        setPassword('');
      } else {
        // Login mode
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter your registered email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        const res = await api.login({
          email: email.trim(),
          password,
        });

        const loggedInUser = res.data.user;
        localStorage.setItem('opplyra_auth', JSON.stringify({ isAuthenticated: true, user: loggedInUser }));
        onAuthSuccess(loggedInUser);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-[#F7F5FC]">
      <div className="bg-[rgba(14,12,21,0.96)] backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-modal border border-[rgba(255,255,255,0.14)] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.10)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/35 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F7F5FC] font-display">
                {mode === 'login' ? 'Welcome Back to Opplyra' : 'Create Your Student Account'}
              </h2>
              <p className="text-[11px] text-[#91899F]">
                {mode === 'login'
                  ? 'Sign in to access your dashboard and saved items'
                  : 'Start discovering verified opportunities and tracking deadlines'}
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

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[rgba(10,8,15,0.6)] rounded-xl border border-[rgba(255,255,255,0.10)] mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'login'
                ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                : 'text-[#B7B0C7] hover:text-[#F7F5FC]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'register'
                ? 'bg-[#7C3AED] text-white shadow-sm font-bold'
                : 'text-[#B7B0C7] hover:text-[#F7F5FC]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Success Alert Banner (e.g. after registration) */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-xl text-xs text-emerald-300 font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3 bg-[#FB7185]/15 border border-[#FB7185]/35 rounded-xl text-xs text-[#FB7185] font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-[#F7F5FC] text-xs font-medium placeholder-[#91899F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">Course / Major</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech CS"
                      className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-[#F7F5FC] text-xs font-medium placeholder-[#91899F]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2.5 glass-input rounded-xl text-[#F7F5FC] text-xs font-medium bg-[#14101F]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@student.edu"
                className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-[#F7F5FC] text-xs font-medium placeholder-[#91899F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F7F5FC] mb-1">
              {mode === 'register' ? 'Password (minimum 6 characters)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#91899F]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 glass-input rounded-xl text-[#F7F5FC] font-medium placeholder-[#91899F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#91899F] hover:text-[#F7F5FC] transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In to Dashboard' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-[#91899F] text-center mt-4">
          By continuing, you agree to Opplyra's{' '}
          <span className="text-[#C4B5FD] underline cursor-pointer" onClick={onClose}>
            terms and privacy principles
          </span>.
        </div>
      </div>
    </div>
  );
}
