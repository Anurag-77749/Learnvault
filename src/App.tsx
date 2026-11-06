// LearnVault - Smoked Obsidian & Polished Mercury Workspace
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { ScreenId, TopNavBar, FloatingDock } from './components/Navigation';
import { TodayScreen } from './components/TodayScreen';
import { TimerScreen } from './components/TimerScreen';
import { PlanScreen } from './components/PlanScreen';
import { LearnScreen } from './components/LearnScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { WastedDaysScreen } from './components/WastedDaysScreen';
import { CloudSyncModal } from './components/CloudSyncModal';
import { cloudSyncService, SyncState } from './services/cloudSyncService';
import { cleanupSampleProjects } from './services/projectService';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('today');
  const [timerTopic, setTimerTopic] = useState<string | undefined>(undefined);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getState());

  useEffect(() => {
    cloudSyncService.init();
    cleanupSampleProjects();
    return cloudSyncService.subscribe((state) => setSyncState(state));
  }, []);

  // Compute live stats
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];
  const totalStudyMinutes = allLogs.reduce((acc, l) => acc + (l.studyMinutes || 0), 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  
  const streakCount = Math.max(1, allLogs.filter((l) => (l.studyMinutes || 0) > 0 || (l.questionsCount || 0) > 0).length);

  const handleStartTimerWithTopic = (topicTitle?: string) => {
    if (topicTitle) {
      setTimerTopic(topicTitle);
    }
    setActiveScreen('timer');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col antialiased selection:bg-[#FF5500] selection:text-white relative font-sans overflow-x-hidden">
      {/* Top Minimalist HUD Bar */}
      <TopNavBar
        activeScreen={activeScreen}
        onSelectScreen={(screen) => {
          setActiveScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        streakCount={streakCount}
        totalStudyHours={totalStudyHours}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onQuickFocus={() => handleStartTimerWithTopic()}
      />

      {/* Main Asymmetric Bento Grid Viewport */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 max-w-[1500px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeScreen === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <TodayScreen
                onNavigateToTimer={handleStartTimerWithTopic}
                onNavigateToPlan={() => setActiveScreen('plan')}
                onNavigateToLearn={() => setActiveScreen('learn')}
              />
            </motion.div>
          )}

          {activeScreen === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <TimerScreen initialTopic={timerTopic} />
            </motion.div>
          )}

          {activeScreen === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <PlanScreen />
            </motion.div>
          )}

          {activeScreen === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <LearnScreen />
            </motion.div>
          )}

          {activeScreen === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectsScreen />
            </motion.div>
          )}

          {activeScreen === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProgressScreen />
            </motion.div>
          )}

          {activeScreen === 'wasted' && (
            <motion.div
              key="wasted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <WastedDaysScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating macOS-Style Glass Dock (Bottom Center) */}
      <FloatingDock
        activeScreen={activeScreen}
        onSelectScreen={(screen) => {
          setActiveScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};

export default App;
