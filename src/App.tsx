// LearnVault - Black & Gold Theme (v1.0.2)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud } from 'lucide-react';
import { db } from './services/db';
import { ScreenId, DesktopSidebar, MobileTabBar } from './components/Navigation';
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

  // Compute live stats for sidebar
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];
  const totalStudyMinutes = allLogs.reduce((acc, l) => acc + (l.studyMinutes || 0), 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  
  const streakCount = Math.max(1, allLogs.filter((l) => (l.studyMinutes || 0) > 0 || (l.questionsCount || 0) > 0).length);
  const wastedDaysCount = useLiveQuery(() => db.wastedDays.count()) || 0;

  const handleStartTimerWithTopic = (topicTitle?: string) => {
    if (topicTitle) {
      setTimerTopic(topicTitle);
    }
    setActiveScreen('timer');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Laptop / Desktop Left Sidebar */}
      <DesktopSidebar
        activeScreen={activeScreen}
        onSelectScreen={(screen) => {
          setActiveScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        streakCount={streakCount}
        totalStudyHours={totalStudyHours}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#030303] border-b border-[#4A101D] sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#D4AF37]/50 flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
              <img src="/learnvault-logo.png" alt="LearnVault" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide text-white leading-none block">
                Learn<span className="text-shiny-gold">Vault</span>
              </span>
              <span className="text-[8px] font-sans text-shiny-gold uppercase tracking-wider block font-semibold">
                Your Knowledge • Your Progress
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="p-1 rounded-full bg-[#24060D] border border-[#4A101D] text-shiny-gold flex items-center justify-center cursor-pointer relative"
              title="Cloud Sync"
            >
              <Cloud className="w-3.5 h-3.5" />
              {syncState.syncId && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
            <span className="px-2 py-0.5 rounded-full bg-[#24060D] border border-[#4A101D] text-shiny-gold font-bold flex items-center gap-1">
              🔥 {streakCount}d
            </span>
            <button
              onClick={() => setActiveScreen('wasted')}
              className="px-2 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 text-red-300 font-bold flex items-center gap-1 cursor-pointer"
              title="Wasted Days Count"
            >
              ⏳ {wastedDaysCount}d
            </button>
            <span className="px-2 py-0.5 rounded-full bg-black border border-[#D4AF37]/40 text-white font-bold">
              {totalStudyHours}h
            </span>
          </div>
        </header>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 md:py-8 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeScreen === 'today' && (
              <motion.div
                key="today"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <TimerScreen initialTopic={timerTopic} />
              </motion.div>
            )}

            {activeScreen === 'plan' && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <PlanScreen />
              </motion.div>
            )}

            {activeScreen === 'learn' && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <LearnScreen />
              </motion.div>
            )}

            {activeScreen === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <ProjectsScreen />
              </motion.div>
            )}

            {activeScreen === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <ProgressScreen />
              </motion.div>
            )}

            {activeScreen === 'wasted' && (
              <motion.div
                key="wasted"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <WastedDaysScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
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
