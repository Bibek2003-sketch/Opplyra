import React, { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { OpportunityModal } from './components/OpportunityModal';
import { ProfileModal } from './components/ProfileModal';
import { ReminderModal } from './components/ReminderModal';
import { DeadlinesSidebar } from './components/DeadlinesSidebar';

import { DashboardPage } from './pages/DashboardPage';
import { CataloguePage } from './pages/CataloguePage';
import { VerificationPage } from './pages/VerificationPage';
import { SavedTrackerPage } from './pages/SavedTrackerPage';
import { RemindersPage } from './pages/RemindersPage';

export default function App() {
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

  const handleNavigate = (tab, params = {}) => {
    setActiveTab(tab);
    if (tab === 'catalogue' && (params.category || params.search !== undefined)) {
      setCataloguePresets({
        category: params.category || 'All',
        search: params.search || '',
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOpportunity = async (opp) => {
    try {
      const res = await api.getOpportunityById(opp._id);
      setSelectedOpportunity(res.data);
      setIsOpportunityModalOpen(true);
    } catch (err) {
      setSelectedOpportunity(opp);
      setIsOpportunityModalOpen(true);
    }
  };

  const handleToggleSave = async (opportunityId) => {
    const isSaved = !!savedMap[opportunityId];
    try {
      if (isSaved) {
        await api.removeSaved(opportunityId);
        showToast('Removed from saved opportunities.', 'info');
      } else {
        await api.saveOpportunity(opportunityId, 'Interested');
        showToast('Saved to your opportunities!');
      }

      const [savedRes, sumRes] = await Promise.all([
        api.getSaved(),
        api.getDashboardSummary(),
      ]);
      setSavedItems(savedRes.data || []);
      setSummary(sumRes.data || null);

      if (selectedOpportunity && selectedOpportunity._id === opportunityId) {
        const updated = await api.getOpportunityById(opportunityId);
        setSelectedOpportunity(updated.data);
      }
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleUpdateStatus = async (opportunityId, status, notes) => {
    try {
      await api.updateSavedStatus(opportunityId, status, notes);
      showToast(`Status updated to "${status === 'Interested' ? 'Saved' : status === 'Preparing' ? 'Planning to Apply' : status}".`);

      const [savedRes, sumRes] = await Promise.all([
        api.getSaved(),
        api.getDashboardSummary(),
      ]);
      setSavedItems(savedRes.data || []);
      setSummary(sumRes.data || null);

      if (selectedOpportunity && selectedOpportunity._id === opportunityId) {
        const updated = await api.getOpportunityById(opportunityId);
        setSelectedOpportunity(updated.data);
      }
    } catch (err) {
      showToast(err.message || 'Could not update status.', 'error');
    }
  };

  const handleSaveReminder = async (opportunityId, offset) => {
    try {
      await api.createReminder(opportunityId, offset);
      showToast('Reminder saved!');
      const remRes = await api.getReminders();
      setReminders(remRes.data || []);
    } catch (err) {
      showToast(err.message || 'Could not save reminder.', 'error');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.deleteReminder(reminderId);
      showToast('Reminder removed.', 'info');
      const remRes = await api.getReminders();
      setReminders(remRes.data || []);
    } catch (err) {
      showToast(err.message || 'Could not remove reminder.', 'error');
    }
  };

  const handleSaveProfile = async (formData) => {
    try {
      const res = await api.updateProfile(formData);
      setProfile(res.data);
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
    <div className="min-h-screen app-background text-[#F7F5FC] flex flex-col lg:flex-row antialiased selection:bg-[#7C3AED] selection:text-white relative">
      {/* Premium Abstract Black & Violet Background Image */}
      <div className="app-background-image" aria-hidden="true" />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

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
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
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
          profile={profile}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              profile={profile}
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
        currentProfile={profile}
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
  );
}
