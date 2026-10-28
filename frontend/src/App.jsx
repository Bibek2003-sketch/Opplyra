import React, { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { OpportunityModal } from './components/OpportunityModal';
import { ProfileModal } from './components/ProfileModal';
import { ReminderModal } from './components/ReminderModal';
import { DeadlinesSidebar } from './components/DeadlinesSidebar';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CataloguePage } from './pages/CataloguePage';
import { VerificationPage } from './pages/VerificationPage';
import { SavedTrackerPage } from './pages/SavedTrackerPage';
import { RemindersPage } from './pages/RemindersPage';

export default function App() {
  // View State: 'landing' (Public Vercel-inspired page at /) | 'app' (Authenticated dashboard at /app)
  const initialView = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const storedAuth = localStorage.getItem('opplyra_auth');
    if ((path === '/app' || hash === '#app') && storedAuth) {
      return 'app';
    }
    return 'landing';
  };

  const [view, setView] = useState(initialView);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('opplyra_auth');
    if (!stored) return false;
    try {
      return JSON.parse(stored).isAuthenticated === true;
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('opplyra_auth');
    if (!stored) return null;
    try {
      return JSON.parse(stored).user || null;
    } catch {
      return null;
    }
  });

  // Auth & Legal Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register');
  const [legalModalState, setLegalModalState] = useState({ isOpen: false, type: 'privacy' });

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeadlinesOpen, setIsDeadlinesOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-open on navbar logo hover with graceful debounce
  const sidebarCloseTimer = useRef(null);

  const handleOpenSidebar = () => {
    if (sidebarCloseTimer.current) clearTimeout(sidebarCloseTimer.current);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    if (sidebarCloseTimer.current) clearTimeout(sidebarCloseTimer.current);
    sidebarCloseTimer.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 280);
  };

  const handleToggleSidebar = () => {
    if (sidebarCloseTimer.current) clearTimeout(sidebarCloseTimer.current);
    setIsSidebarOpen((prev) => !prev);
  };

  // Data States
  const [summary, setSummary] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation Filter Presets
  const [cataloguePresets, setCataloguePresets] = useState({ category: 'All', search: '' });

  // Modal States
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [reminderTargetOpp, setReminderTargetOpp] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Synchronize browser history / back-forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/app' || hash === '#app') {
        setView('app');
      } else {
        setView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToLanding = () => {
    setView('landing');
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToApp = (tab = 'dashboard', presets = null) => {
    if (tab) setActiveTab(tab);
    if (presets) setCataloguePresets(presets);
    setView('app');
    try {
      window.history.pushState(null, '', '/app');
    } catch {
      window.location.hash = '#app';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    navigateToApp('dashboard');
    showToast(`Welcome to Opplyra, ${userData.fullName.split(' ')[0]}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('opplyra_auth');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigateToLanding();
    showToast('You have been logged out.');
  };

  const handleOpenLegal = (type = 'privacy') => {
    setLegalModalState({ isOpen: true, type });
  };

  // Initial Data Fetch
  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [oppsRes, sumRes, savedRes, remRes, profRes] = await Promise.all([
        api.getOpportunities(),
        api.getDashboardSummary(),
        api.getSaved(),
        api.getReminders(),
        api.getProfile(),
      ]);

      setOpportunities(oppsRes.data || []);
      setSummary(sumRes.data || null);
      setSavedItems(savedRes.data || []);
      setReminders(remRes.data || []);
      setProfile(profRes.data || null);
    } catch (err) {
      console.error('Initial load failure:', err);
      setError('Could not connect to the server. Retrying...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const savedMap = savedItems.reduce((acc, item) => {
    const oppId = item.opportunityId?._id || item.opportunityId || item._id;
    acc[oppId] = item;
    return acc;
  }, {});

  const handleToggleSave = async (opportunityId) => {
    const existing = savedMap[opportunityId];
    try {
      if (existing) {
        await api.removeSaved(opportunityId);
        setSavedItems((prev) =>
          prev.filter((item) => (item.opportunityId?._id || item.opportunityId || item._id) !== opportunityId)
        );
        showToast('Opportunity removed from saved list.');
      } else {
        const res = await api.saveOpportunity(opportunityId, 'Interested');
        setSavedItems((prev) => [...prev, res.data]);
        showToast('Opportunity saved! Check "My Applications" to track it.');
      }
    } catch (err) {
      showToast(err.message || 'Could not update saved status.', 'error');
    }
  };

  const handleUpdateStatus = async (opportunityId, newStatus, notes) => {
    try {
      const res = await api.updateSavedStatus(opportunityId, newStatus, notes);
      setSavedItems((prev) =>
        prev.map((item) =>
          (item.opportunityId?._id || item.opportunityId || item._id) === opportunityId ? res.data : item
        )
      );
      showToast(`Application marked as "${newStatus}"`);
    } catch (err) {
      showToast(err.message || 'Could not update status.', 'error');
    }
  };

  const handleSaveReminder = async (opportunityId, offset) => {
    try {
      const res = await api.createReminder(opportunityId, offset);
      setReminders((prev) => [...prev, res.data]);
      showToast('Reminder scheduled!');
      setReminderTargetOpp(null);
    } catch (err) {
      showToast(err.message || 'Could not save reminder.', 'error');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.deleteReminder(reminderId);
      setReminders((prev) => prev.filter((r) => r._id !== reminderId));
      showToast('Reminder removed.');
    } catch (err) {
      showToast(err.message || 'Could not remove reminder.', 'error');
    }
  };

  const handleSelectOpportunity = async (opp) => {
    setSelectedOpportunity(opp);
    setIsOpportunityModalOpen(true);
    try {
      const res = await api.getOpportunityById(opp._id);
      setSelectedOpportunity(res.data);
    } catch (err) {
      console.warn('Could not refresh full opportunity details:', err.message);
    }
  };

  const handleNavigate = (tab, presets = null) => {
    setActiveTab(tab);
    if (presets) {
      setCataloguePresets(presets);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = async (formData) => {
    try {
      const res = await api.updateProfile(formData);
      setProfile(res.data);
      setCurrentUser(res.data);
      showToast('Profile updated!');

      if (selectedOpportunity) {
        const updated = await api.getOpportunityById(selectedOpportunity._id);
        setSelectedOpportunity(updated.data);
      }
    } catch (err) {
      showToast(err.message || 'Could not save profile.', 'error');
    }
  };

  const upcomingDeadlinesCount = opportunities.filter(
    (opp) => new Date(opp.deadline) >= new Date()
  ).length;

  return (
    <div className="min-h-screen app-background text-[#F7F5FC] antialiased selection:bg-[#7C3AED] selection:text-white relative">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
        existingProfile={profile}
      />

      {/* Global Legal Modal */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState({ ...legalModalState, isOpen: false })}
        type={legalModalState.type}
      />

      {/* ======================================================== */}
      {/* VIEW SWITCHER: LANDING PAGE vs AUTHENTICATED DASHBOARD    */}
      {/* ======================================================== */}
      {view === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onNavigateToCategory={(catId) => {
            navigateToApp('catalogue', { category: catId, search: '' });
          }}
          onOpenDashboard={() => navigateToApp('dashboard')}
          isAuthenticated={isAuthenticated}
          user={currentUser || profile}
          onLogout={handleLogout}
          onOpenLegal={handleOpenLegal}
        />
      ) : (
        /* Authenticated Main Application View */
        <div className="min-h-screen text-[#F7F5FC] flex flex-col lg:flex-row relative">
          {/* Premium Abstract Black & Violet Background Image */}
          <div className="app-background-image" aria-hidden="true" />

          {/* Navigation Sidebar (Hover-triggered via Navbar Logo, Drawer-style) */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onMouseEnter={handleOpenSidebar}
            onMouseLeave={handleCloseSidebar}
            profile={currentUser || profile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateToLanding={navigateToLanding}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <div className="flex-1 xl:pr-80 flex flex-col min-h-screen relative z-10">
            <Navbar
              onToggleSidebar={handleToggleSidebar}
              onOpenSidebar={handleOpenSidebar}
              onCloseSidebar={handleCloseSidebar}
              onToggleDeadlines={() => setIsDeadlinesOpen(!isDeadlinesOpen)}
              deadlinesCount={upcomingDeadlinesCount}
              activeTab={activeTab}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenVerification={() => handleNavigate('verification')}
              profile={currentUser || profile}
            />

            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'dashboard' && (
                <DashboardPage
                  summary={summary}
                  profile={currentUser || profile}
                  onNavigate={handleNavigate}
                  onSelectOpportunity={handleSelectOpportunity}
                  savedMap={savedMap}
                  onToggleSave={handleToggleSave}
                  onOpenReminder={(opp) => setReminderTargetOpp(opp)}
                />
              )}

              {activeTab === 'catalogue' && (
                <CataloguePage
                  initialCategory={cataloguePresets.category}
                  initialSearch={cataloguePresets.search}
                  opportunities={opportunities}
                  isLoading={isLoading}
                  error={error}
                  onRefresh={loadInitialData}
                  onSelectOpportunity={handleSelectOpportunity}
                  savedMap={savedMap}
                  onToggleSave={handleToggleSave}
                  onOpenReminder={(opp) => setReminderTargetOpp(opp)}
                />
              )}

              {activeTab === 'verification' && <VerificationPage />}

              {activeTab === 'tracker' && (
                <SavedTrackerPage
                  savedItems={savedItems}
                  onUpdateStatus={handleUpdateStatus}
                  onRemoveSaved={handleToggleSave}
                  onOpenReminder={(opp) => setReminderTargetOpp(opp)}
                  onSelectOpportunity={handleSelectOpportunity}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersPage
                  reminders={reminders}
                  onDeleteReminder={handleDeleteReminder}
                  onSelectOpportunity={handleSelectOpportunity}
                  onNavigate={handleNavigate}
                />
              )}
            </main>
          </div>

          {/* Persistent / Responsive Right Deadlines Sidebar */}
          <DeadlinesSidebar
            isOpen={isDeadlinesOpen}
            onClose={() => setIsDeadlinesOpen(false)}
            opportunities={opportunities}
            savedItems={savedItems}
            onSelectOpportunity={handleSelectOpportunity}
            onOpenReminder={(opp) => setReminderTargetOpp(opp)}
            onNavigate={handleNavigate}
          />

          {/* Detail / Eligibility Modal */}
          {isOpportunityModalOpen && selectedOpportunity && (
            <OpportunityModal
              opportunity={selectedOpportunity}
              onClose={() => {
                setIsOpportunityModalOpen(false);
                setSelectedOpportunity(null);
              }}
              isSaved={!!savedMap[selectedOpportunity._id]}
              savedStatus={savedMap[selectedOpportunity._id]?.status}
              onToggleSave={handleToggleSave}
              onUpdateStatus={handleUpdateStatus}
              onOpenReminder={(opp) => {
                setIsOpportunityModalOpen(false);
                setReminderTargetOpp(opp);
              }}
              onOpenProfile={() => {
                setIsProfileModalOpen(true);
              }}
            />
          )}

          {/* Profile Modal */}
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentProfile={currentUser || profile}
            onSave={handleSaveProfile}
          />

          {/* Reminder Config Modal */}
          <ReminderModal
            isOpen={!!reminderTargetOpp}
            opportunity={reminderTargetOpp}
            onClose={() => setReminderTargetOpp(null)}
            onSaveReminder={handleSaveReminder}
          />
        </div>
      )}
    </div>
  );
}
