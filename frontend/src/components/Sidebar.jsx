import React from 'react';
import {
  LayoutDashboard,
  Search,
  ShieldAlert,
  BookmarkCheck,
  BellRing,
  ChevronRight,
  X,
  Home,
  LogOut
} from 'lucide-react';

export function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  profile,
  onOpenProfile,
  onNavigateToLanding,
  onLogout
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalogue', label: 'Find Opportunities', icon: Search },
    { id: 'verification', label: 'Check for Scams', icon: ShieldAlert },
    { id: 'tracker', label: 'My Applications', icon: BookmarkCheck },
    { id: 'reminders', label: 'Deadlines & Reminders', icon: BellRing },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[rgba(13,11,19,0.85)] backdrop-blur-2xl text-[#F7F5FC] flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[rgba(255,255,255,0.12)] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header & Navigation */}
        <div>
          <div className="p-4 border-b border-[rgba(255,255,255,0.10)] bg-[rgba(14,12,21,0.55)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 px-2 py-1 select-none">
              <img
                src="/brand-mark.png"
                alt="Opplyra Emblem"
                className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]"
              />
              <span className="font-display font-black text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E8FF] to-[#C4B5FD]">
                Opplyra
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#92899F] hover:text-[#F7F5FC] hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer"
              title="Close navigation"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5 mt-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#92899F]">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'sidebar-item-active text-[#F7F5FC] font-bold'
                      : 'text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[rgba(22,18,31,0.6)] border border-transparent hover:border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#A78BFA]' : 'text-[#92899F]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Student Profile & Auth Controls (Glass Surface) */}
        <div className="p-3.5 border-t border-[rgba(255,255,255,0.10)] bg-[rgba(14,12,21,0.55)] space-y-2">
          <div
            onClick={onOpenProfile}
            className="group glass-card glass-card-interactive rounded-2xl p-3 cursor-pointer transition-all duration-200 border border-[rgba(255,255,255,0.12)] shadow-glass"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40 flex items-center justify-center font-bold text-xs shrink-0 font-display">
                  {profile?.fullName ? profile.fullName.charAt(0) : 'P'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#F7F5FC] group-hover:text-[#C4B5FD] transition-colors truncate">
                    {profile?.fullName || 'My Profile'}
                  </div>
                  <div className="text-[11px] text-[#B7B0C7] truncate font-medium">
                    {profile?.course || 'Set up your details'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#92899F] group-hover:text-[#A78BFA] transition-colors shrink-0" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-xs">
            <button
              onClick={() => {
                if (onClose) onClose();
                if (onNavigateToLanding) onNavigateToLanding();
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.03)] text-[#B7B0C7] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Visit Public Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Public Home</span>
            </button>

            <button
              onClick={() => {
                if (onClose) onClose();
                if (onLogout) onLogout();
              }}
              className="py-1.5 px-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] hover:border-[#FB7185]/40 bg-[rgba(255,255,255,0.03)] text-[#91899F] hover:text-[#FB7185] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
