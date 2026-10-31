import React, { useState, useEffect } from 'react';
import { dataService } from './services/dataService';
import { getSupabaseConfig } from './services/supabaseClient';
import { Track, Section, Topic, Resource, PomodoroSession } from './types';
import { Navbar, AppTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PlannerView } from './components/PlannerView';
import { TopicsView } from './components/TopicsView';
import { ImportTopicsView } from './components/ImportTopicsView';
import { CoverageReportView } from './components/CoverageReportView';
import { DailyLogView } from './components/DailyLogView';
import { PomodoroTimerView } from './components/PomodoroTimerView';
import { DSATrackerView } from './components/DSATrackerView';
import { ProjectsView } from './components/ProjectsView';
import { JobTrackerView } from './components/JobTrackerView';
import { GoalsAndBadgesView } from './components/GoalsAndBadgesView';
import { ResourceInboxView } from './components/ResourceInboxView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { TopicDetailModal } from './components/TopicDetailModal';
import { SettingsSyncModal } from './components/SettingsSyncModal';
import { NotificationService } from './services/notificationService';

export const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [activeTopicDetail, setActiveTopicDetail] = useState<Topic | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Load data from dataService
  const refreshData = () => {
    const trks = dataService.getTracks();
    const secs = dataService.getSections();
    const tops = dataService.getTopics();

    setTracks(trks);
    setSections(secs);
    setTopics(tops);

    if (!selectedTrackId && trks.length > 0) {
      setSelectedTrackId(trks[0].id);
    }
  };

  useEffect(() => {
    refreshData();
    setIsConfigured(getSupabaseConfig().isConfigured);

    // Auto weekly backup check
    dataService.checkAndCreateWeeklyBackup();

    // Check notifications
    const todayStr = new Date().toISOString().split('T')[0];
    const dueRevs = dataService.getDueRevisions().length;
    const overdueTopics = dataService.getTopics().filter(
      t => t.deadline && t.deadline < todayStr && t.status !== 'done'
    ).length;
    const hasLog = Boolean(dataService.getDailyLogByDate(todayStr));
    NotificationService.checkAndTriggerAlerts(dueRevs, overdueTopics, hasLog);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Global keyboard shortcut: Ctrl+K / Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handlers
  const handleUpdateTopic = (id: string, updates: Partial<Topic>) => {
    const updated = dataService.updateTopic(id, updates);
    if (updated && activeTopicDetail && activeTopicDetail.id === id) {
      setActiveTopicDetail(updated);
    }
    refreshData();
  };

  const handleAddTrack = (title: string, desc: string) => {
    const trk = dataService.addTrack(title, desc);
    refreshData();
    setSelectedTrackId(trk.id);
  };

  const handleAddSection = (trackId: string, title: string) => {
    dataService.addSection(trackId, title);
    refreshData();
  };

  const handleAddTopic = (data: { track_id: string; section_id: string; title: string }) => {
    dataService.addTopic(data);
    refreshData();
  };

  const handleDeleteTopic = (id: string) => {
    dataService.deleteTopic(id);
    if (activeTopicDetail?.id === id) {
      setActiveTopicDetail(null);
    }
    refreshData();
  };

  const handleDeleteSection = (id: string) => {
    dataService.deleteSection(id);
    refreshData();
  };

  const handleDeleteTrack = (id: string) => {
    dataService.deleteTrack(id);
    refreshData();
    const remaining = dataService.getTracks();
    if (remaining.length > 0) {
      setSelectedTrackId(remaining[0].id);
    }
  };

  const handleReorderSections = (orderedIds: string[]) => {
    dataService.reorderSections(orderedIds);
    refreshData();
  };

  const handleReorderTopics = (orderedIds: string[]) => {
    dataService.reorderTopics(orderedIds);
    refreshData();
  };

  const handleAddResource = (resource: Omit<Resource, 'id' | 'created_at'>) => {
    dataService.addResource(resource);
    refreshData();
    if (activeTopicDetail && activeTopicDetail.id === resource.topic_id) {
      const refreshed = dataService.getTopicById(activeTopicDetail.id);
      if (refreshed) setActiveTopicDetail(refreshed);
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    dataService.deleteResource(resourceId);
    refreshData();
    if (activeTopicDetail) {
      const refreshed = dataService.getTopicById(activeTopicDetail.id);
      if (refreshed) setActiveTopicDetail(refreshed);
    }
  };

  const handlePomodoroSessionCompleted = (session: PomodoroSession) => {
    refreshData();
  };

  // Import / Export
  const handleExportJson = () => {
    const jsonStr = dataService.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fde_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvStr = dataService.exportToCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fde_topics_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (jsonStr: string): boolean => {
    const ok = dataService.importFromJson(jsonStr);
    if (ok) refreshData();
    return ok;
  };

  const handleResetDefaults = () => {
    dataService.resetToDefaults();
    refreshData();
  };

  const handleNavigateFromSearch = (tab: string, itemId?: string) => {
    setActiveTab(tab as AppTab);
    if (tab === 'topics' && itemId) {
      const targetTopic = topics.find(t => t.id === itemId);
      if (targetTopic) {
        setSelectedTrackId(targetTopic.track_id);
        setActiveTopicDetail(targetTopic);
      }
    }
  };

  const coverageReport = dataService.getCoverageReport();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top / Mobile Navigation */}
      <Navbar
        activeTab={activeTab === 'settings' ? 'dashboard' : activeTab}
        setActiveTab={tab => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOnline={isOnline}
        isConfigured={isConfigured}
        totalTopics={topics.length}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            topics={topics}
            onOpenTimer={() => setActiveTab('timer')}
            onOpenTopic={setActiveTopicDetail}
            onOpenDailyLog={() => setActiveTab('daily')}
            onNavigateToTab={tab => setActiveTab(tab as AppTab)}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerView
            tracks={tracks}
            topics={topics}
            onOpenTopic={setActiveTopicDetail}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'topics' && (
          <TopicsView
            tracks={tracks}
            sections={sections}
            topics={topics}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            onUpdateTopic={handleUpdateTopic}
            onOpenTopicDetail={setActiveTopicDetail}
            onAddTrack={handleAddTrack}
            onAddSection={handleAddSection}
            onAddTopic={handleAddTopic}
            onDeleteTopic={handleDeleteTopic}
            onDeleteSection={handleDeleteSection}
            onDeleteTrack={handleDeleteTrack}
            onReorderSections={handleReorderSections}
            onReorderTopics={handleReorderTopics}
            onAddResource={handleAddResource}
          />
        )}

        {activeTab === 'dsa' && <DSATrackerView />}

        {activeTab === 'projects' && <ProjectsView />}

        {activeTab === 'jobs' && <JobTrackerView />}

        {activeTab === 'goals' && <GoalsAndBadgesView />}

        {activeTab === 'inbox' && <ResourceInboxView />}

        {activeTab === 'daily' && (
          <DailyLogView onOpenTimer={() => setActiveTab('timer')} />
        )}

        {activeTab === 'timer' && (
          <PomodoroTimerView
            topics={topics}
            onSessionCompleted={handlePomodoroSessionCompleted}
            onOpenDailyLog={() => setActiveTab('daily')}
          />
        )}

        {activeTab === 'coverage' && (
          <CoverageReportView report={coverageReport} />
        )}

        {activeTab === 'import' && (
          <ImportTopicsView
            onCheckDuplicates={text => dataService.parseAndCheckImports(text)}
            onExecuteImport={items => {
              const count = dataService.executeImport(items);
              refreshData();
              return count;
            }}
            onDone={() => setActiveTab('topics')}
          />
        )}
      </main>

      {/* Global Search Palette (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={handleNavigateFromSearch}
      />

      {/* Topic Detail Modal */}
      {activeTopicDetail && (
        <TopicDetailModal
          topic={activeTopicDetail}
          sectionTitle={sections.find(s => s.id === activeTopicDetail.section_id)?.title || ''}
          trackTitle={tracks.find(t => t.id === activeTopicDetail.track_id)?.title || ''}
          isOpen={true}
          onClose={() => setActiveTopicDetail(null)}
          onUpdate={handleUpdateTopic}
          onAddResource={handleAddResource}
          onDeleteResource={handleDeleteResource}
          onDeleteTopic={handleDeleteTopic}
        />
      )}

      {/* Settings & Cloud Sync Modal */}
      <SettingsSyncModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onImportJson={handleImportJson}
        onResetDefaults={handleResetDefaults}
        isOnline={isOnline}
      />
    </div>
  );
};

export default App;
