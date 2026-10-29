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
import { ApplyConfirmationModal } from './components/ApplyConfirmationModal';
import { ApplicationStatusModal } from './components/ApplicationStatusModal';
import { ApplicationTimelineModal } from './components/ApplicationTimelineModal';
import { NotificationPreferencesModal } from './components/NotificationPreferencesModal';
import { PortalLinkErrorModal } from './components/PortalLinkErrorModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CataloguePage } from './pages/CataloguePage';
import { VerificationPage } from './pages/VerificationPage';
import { SavedTrackerPage } from './pages/SavedTrackerPage';
import { RemindersPage } from './pages/RemindersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  // View State: 'landing' (Public Vercel-inspired page at /) | 'app' (Authenticated dashboard at /app or /profile)
  const initialView = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('opplyra_auth') : null;
    if ((path === '/app' || hash === '#app' || path === '/profile' || hash === '#profile') && storedAuth) {
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
  const initialTab = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (path === '/profile' || hash === '#profile') {
      return 'profile';
    }
    return 'dashboard';
  };
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeadlinesOpen, setIsDeadlinesOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });
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

  // Application Tracking System States
  const [applications, setApplications] = useState([]);
  const [applicationSummary, setApplicationSummary] = useState(null);
  const [confirmationTargetApp, setConfirmationTargetApp] = useState(null);
  const [statusTargetApp, setStatusTargetApp] = useState(null);
  const [timelineTargetApp, setTimelineTargetApp] = useState(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [portalErrorState, setPortalErrorState] = useState({
    isOpen: false,
    errorType: 'unknown',
    opportunityTitle: '',
    organization: '',
    targetUrl: '',
    officialHomepageUrl: '',
    opportunityId: null,
    applicationId: null,
  });

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
      const storedAuth = localStorage.getItem('opplyra_auth');
      if (path === '/profile' || hash === '#profile') {
        if (storedAuth) {
          setView('app');
          setActiveTab('profile');
        } else {
          setView('landing');
        }
      } else if (path === '/app' || hash === '#app') {
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
    const targetUrl = tab === 'profile' ? '/profile' : '/app';
    try {
      window.history.pushState(null, '', targetUrl);
    } catch {
      window.location.hash = tab === 'profile' ? '#profile' : '#app';
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
      const [oppsRes, sumRes, savedRes, remRes, profRes, appsRes, appSumRes, unreadRes] = await Promise.all([
        api.getOpportunities(),
        api.getDashboardSummary(),
        api.getSaved(),
        api.getReminders(),
        api.getProfile(),
        api.getApplications(),
        api.getApplicationSummary(),
        api.getUnreadNotificationCount().catch(() => ({ count: 0 })),
      ]);

      setOpportunities(oppsRes.data || []);
      setSummary(sumRes.data || null);
      setSavedItems(savedRes.data || []);
      setReminders(remRes.data || []);
      setProfile(profRes.data || null);
      setApplications(appsRes.data || []);
      setApplicationSummary(appSumRes.data || null);
      if (unreadRes && typeof unreadRes.count === 'number') {
        setUnreadNotificationsCount(unreadRes.count);
      }
    } catch (err) {
      console.error('Initial load failure:', err);
      setError('Could not connect to the server. Retrying...');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const res = await api.getUnreadNotificationCount();
      if (res && typeof res.count === 'number') {
        setUnreadNotificationsCount(res.count);
      }
    } catch (err) {
      console.warn('Could not load unread notifications count:', err);
    }
  };

  const handleNavigateNotification = (notif) => {
    refreshUnreadCount();
    if (!notif) return;
    if (notif.applicationId) {
      setActiveTab('tracker');
      const app = applications.find((a) => a._id === notif.applicationId);
      if (app) setTimelineTargetApp(app);
    } else if (notif.opportunityId) {
      const opp = opportunities.find((o) => o._id === notif.opportunityId);
      if (opp) setSelectedOpportunity(opp);
      setActiveTab('catalogue');
    } else if (notif.destinationRoute) {
      if (notif.destinationRoute.includes('tracker')) setActiveTab('tracker');
      else if (notif.destinationRoute.includes('catalogue')) setActiveTab('catalogue');
      else if (notif.destinationRoute.includes('reminders')) setActiveTab('reminders');
      else if (notif.destinationRoute.includes('notifications')) setActiveTab('notifications');
      else setActiveTab('dashboard');
    } else {
      setActiveTab('tracker');
    }
  };

  const refreshApplications = async () => {
    try {
      const [appsRes, appSumRes] = await Promise.all([
        api.getApplications(),
        api.getApplicationSummary(),
      ]);
      setApplications(appsRes.data || []);
      setApplicationSummary(appSumRes.data || null);
      refreshUnreadCount();
    } catch (err) {
      console.warn('Could not refresh applications:', err);
    }
  };

  const handleApplyNow = async (opp) => {
    if (!opp) return;

    const url = opp.sourceUrl;

    // Check if missing or invalid protocol
    if (!url || !/^https?:\/\//i.test(url)) {
      setPortalErrorState({
        isOpen: true,
        errorType: 'invalid_url',
        opportunityTitle: opp.title,
        organization: opp.organization,
        targetUrl: url || '',
        officialHomepageUrl: opp.officialHomepageUrl || null,
        opportunityId: opp._id,
      });
      return;
    }

    // Check if unverified or demo link
    if (
      opp.urlVerificationStatus === 'needs_review' ||
      opp.urlVerificationStatus === 'unavailable' ||
      url.includes('/demo/') ||
      url.includes('-demo')
    ) {
      setPortalErrorState({
        isOpen: true,
        errorType: 'unverified',
        opportunityTitle: opp.title,
        organization: opp.organization,
        targetUrl: url,
        officialHomepageUrl: opp.officialHomepageUrl || null,
        opportunityId: opp._id,
      });
      return;
    }

    // 1. Open verified portal safely in a new browser tab
    window.open(url, '_blank', 'noopener,noreferrer');

    // 2. Initialize tracking record as Application Started (NOT Applied)
    try {
      const res = await api.createApplication({
        opportunityId: opp._id,
        opportunityTitle: opp.title,
        organization: opp.organization,
        opportunityType: opp.category,
        officialApplicationUrl: url,
        officialHomepageUrl: opp.officialHomepageUrl || null,
        urlVerificationStatus: opp.urlVerificationStatus || 'verified',
        status: 'Application Started',
        deadline: opp.deadline,
        statusSource: 'Manual Update',
        notes: 'Opened official application portal from Opplyra.',
      });

      const trackedApp = res.data;
      await refreshApplications();

      // 3. Prompt user with "Did you submit your application?" modal
      setConfirmationTargetApp(trackedApp);
      showToast('Opened official portal in a new tab. Confirm your submission when done!');
    } catch (err) {
      showToast(err.message || 'Could not start tracking.', 'error');
    }
  };

  const handleConfirmSubmission = async ({ externalReference, note }) => {
    if (!confirmationTargetApp) return;
    try {
      const appId = confirmationTargetApp._id;
      await api.updateApplicationStatus(appId, {
        status: 'Applied',
        source: 'User Confirmed',
        note: note || 'Student confirmed application submission on official portal.',
        externalReference,
      });
      await refreshApplications();
      setConfirmationTargetApp(null);
      showToast('Submission confirmed! Your application status is now "Applied".');
    } catch (err) {
      showToast(err.message || 'Could not confirm submission.', 'error');
    }
  };

  const handleSaveStatus = async (appId, payload) => {
    try {
      await api.updateApplicationStatus(appId, payload);
      await refreshApplications();
      showToast(`Application status updated to "${payload.status}".`);
    } catch (err) {
      showToast(err.message || 'Could not update status.', 'error');
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      await api.deleteApplication(appId);
      await refreshApplications();
      showToast('Application removed from tracking.');
    } catch (err) {
      showToast(err.message || 'Could not remove application.', 'error');
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
    const targetUrl = tab === 'profile' ? '/profile' : '/app';
    try {
      window.history.pushState(null, '', targetUrl);
    } catch {
      window.location.hash = tab === 'profile' ? '#profile' : '#app';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = async (formDataOrUpdated) => {
    // If it's already an updated profile object returned by API:
    if (formDataOrUpdated && formDataOrUpdated._id) {
      setProfile(formDataOrUpdated);
      setCurrentUser(formDataOrUpdated);
      try {
        const stored = localStorage.getItem('opplyra_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.user = formDataOrUpdated;
          localStorage.setItem('opplyra_auth', JSON.stringify(parsed));
        }
      } catch (e) {}
      return;
    }

    try {
      const res = await api.updateProfile(formDataOrUpdated);
      setProfile(res.data);
      setCurrentUser(res.data);
      try {
        const stored = localStorage.getItem('opplyra_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.user = res.data;
          localStorage.setItem('opplyra_auth', JSON.stringify(parsed));
        }
      } catch (e) {}
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
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
          existingProfile={profile}
        />
      )}

      {/* Global Legal Modal */}
      {legalModalState.isOpen && (
        <LegalModal
          isOpen={legalModalState.isOpen}
          onClose={() => setLegalModalState({ ...legalModalState, isOpen: false })}
          type={legalModalState.type}
        />
      )}

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
              handleNavigate(tab);
              setIsSidebarOpen(false);
            }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onMouseEnter={handleOpenSidebar}
            onMouseLeave={handleCloseSidebar}
            profile={currentUser || profile}
            onOpenProfile={() => {
              handleNavigate('profile');
              setIsSidebarOpen(false);
            }}
            onNavigateToLanding={navigateToLanding}
            onLogout={handleLogout}
            unreadNotificationsCount={unreadNotificationsCount}
          />

          {/* Main Content Area */}
          <div className={`flex-1 ${isDeadlinesOpen ? 'xl:pr-80' : 'xl:pr-0'} flex flex-col min-h-screen relative z-10 transition-all duration-300 ease-in-out`}>
            <Navbar
              onToggleSidebar={handleToggleSidebar}
              onOpenSidebar={handleOpenSidebar}
              onCloseSidebar={handleCloseSidebar}
              onToggleDeadlines={() => setIsDeadlinesOpen(!isDeadlinesOpen)}
              isDeadlinesOpen={isDeadlinesOpen}
              deadlinesCount={upcomingDeadlinesCount}
              activeTab={activeTab}
              onOpenProfile={() => handleNavigate('profile')}
              onOpenVerification={() => handleNavigate('verification')}
              profile={currentUser || profile}
              unreadNotificationsCount={unreadNotificationsCount}
              onOpenNotificationPreferences={() => setIsPreferencesModalOpen(true)}
              onViewAllNotifications={() => handleNavigate('notifications')}
              onNavigateToApplication={handleNavigateNotification}
              onNotificationChanged={refreshUnreadCount}
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
                  onApplyNow={handleApplyNow}
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
                  onApplyNow={handleApplyNow}
                />
              )}

              {activeTab === 'verification' && <VerificationPage />}

              {activeTab === 'tracker' && (
                <SavedTrackerPage
                  applications={applications}
                  summary={applicationSummary}
                  onUpdateStatus={(app) => setStatusTargetApp(app)}
                  onConfirmSubmission={(app) => setConfirmationTargetApp(app)}
                  onDeleteApplication={handleDeleteApplication}
                  onOpenReminder={(opp) => setReminderTargetOpp(opp)}
                  onSelectOpportunity={(app) => setTimelineTargetApp(app)}
                  onNavigate={handleNavigate}
                  onOpenPreferences={() => setIsPreferencesModalOpen(true)}
                  onRefresh={refreshApplications}
                  onOpenPortalError={(errorData) => setPortalErrorState({ isOpen: true, ...errorData })}
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

              {activeTab === 'notifications' && (
                <NotificationsPage
                  onOpenPreferences={() => setIsPreferencesModalOpen(true)}
                  onNavigateToApplication={handleNavigateNotification}
                  onNotificationChanged={refreshUnreadCount}
                />
              )}

              {activeTab === 'profile' && (
                <ProfilePage
                  profile={currentUser || profile}
                  onUpdateProfile={handleSaveProfile}
                  onLogout={handleLogout}
                  showToast={showToast}
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
                setIsOpportunityModalOpen(false);
                handleNavigate('profile');
              }}
              onApplyNow={handleApplyNow}
            />
          )}

          {/* Profile Modal */}
          {isProfileModalOpen && (
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              currentProfile={currentUser || profile}
              onSave={handleSaveProfile}
            />
          )}

          {/* Reminder Config Modal */}
          {!!reminderTargetOpp && (
            <ReminderModal
              isOpen={!!reminderTargetOpp}
              opportunity={reminderTargetOpp}
              onClose={() => setReminderTargetOpp(null)}
              onSaveReminder={handleSaveReminder}
            />
          )}

          {/* Application Submission Confirmation Modal ("Did you submit your application?") */}
          {confirmationTargetApp && (
            <ApplyConfirmationModal
              isOpen={!!confirmationTargetApp}
              onClose={() => setConfirmationTargetApp(null)}
              application={confirmationTargetApp}
              opportunity={confirmationTargetApp}
              onConfirmApplied={handleConfirmSubmission}
              onKeepStarted={() => setConfirmationTargetApp(null)}
            />
          )}

          {/* Application Status Update Modal */}
          {statusTargetApp && (
            <ApplicationStatusModal
              isOpen={!!statusTargetApp}
              onClose={() => setStatusTargetApp(null)}
              application={statusTargetApp}
              onSaveStatus={(appId, payload) => handleSaveStatus(appId, payload)}
            />
          )}

          {/* Application Full Status History & Timeline Modal */}
          {timelineTargetApp && (
            <ApplicationTimelineModal
              isOpen={!!timelineTargetApp}
              onClose={() => setTimelineTargetApp(null)}
              application={timelineTargetApp}
              onOpenStatusModal={(app) => {
                setTimelineTargetApp(null);
                setStatusTargetApp(app);
              }}
            />
          )}

          {/* Student Notification & Email Reminder Preferences Modal */}
          {isPreferencesModalOpen && (
            <NotificationPreferencesModal
              isOpen={isPreferencesModalOpen}
              onClose={() => setIsPreferencesModalOpen(false)}
              onSaveSuccess={() => showToast('Notification preferences saved!')}
            />
          )}

          {/* Portal Link Error & Broken Link Reporting Modal */}
          {portalErrorState.isOpen && (
            <PortalLinkErrorModal
              isOpen={portalErrorState.isOpen}
              onClose={() => setPortalErrorState((prev) => ({ ...prev, isOpen: false }))}
              errorType={portalErrorState.errorType}
              opportunityTitle={portalErrorState.opportunityTitle}
              organization={portalErrorState.organization}
              targetUrl={portalErrorState.targetUrl}
              officialHomepageUrl={portalErrorState.officialHomepageUrl}
              opportunityId={portalErrorState.opportunityId}
              applicationId={portalErrorState.applicationId}
              onViewDetails={() => {
                setPortalErrorState((prev) => ({ ...prev, isOpen: false }));
                if (portalErrorState.opportunityId) {
                  const opp = opportunities.find((o) => o._id === portalErrorState.opportunityId);
                  if (opp) handleSelectOpportunity(opp);
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
