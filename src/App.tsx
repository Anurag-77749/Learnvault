// LearnVault - Obsidian, Espresso & Champagne Luxury Theme
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#080707] text-[#F5F2EB] flex flex-col md:flex-row antialiased selection:bg-[#D4AF37] selection:text-black relative">
      {/* Global Ultra-Subtle Anodized Metal Micro-Texture Noise Overlay */}
      <svg
        className="pointer-events-none fixed inset-0 z-50 w-full h-full opacity-[0.018]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

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
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#060505]/95 backdrop-blur-md border-b border-[rgba(255,240,220,0.06)] sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#110E0E] border border-[rgba(255,240,220,0.1)] flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
              <img src="/learnvault-logo.png" alt="LearnVault" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wide text-white leading-none block">
                Learn<span className="text-champagne">Vault</span>
              </span>
              <span className="text-[8px] font-mono text-[#9E958E] uppercase tracking-wider block font-semibold">
                Your Knowledge • Your Future
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="p-1.5 rounded-lg bg-[#110E0E] border border-[rgba(255,240,220,0.08)] text-[#D4AF37] hover:text-[#F6E6C2] flex items-center justify-center cursor-pointer relative"
              title="Cloud Sync"
            >
              <Cloud className="w-3.5 h-3.5" />
              {syncState.syncId && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}
            </button>
            <span className="px-2 py-0.5 rounded-lg bg-[#110E0E] border border-[rgba(255,240,220,0.08)] text-[#F6E6C2] font-mono font-bold flex items-center gap-1">
              🔥 {streakCount}d
            </span>
            <button
              onClick={() => setActiveScreen('wasted')}
              className="px-2 py-0.5 rounded-lg bg-[#180A0C] border border-red-500/25 text-[#fca5a5] font-mono font-bold flex items-center gap-1 cursor-pointer"
              title="Wasted Days Count"
            >
              ⏳ {wastedDaysCount}d
            </button>
            <span className="px-2 py-0.5 rounded-lg bg-[#110E0E] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] font-mono font-bold">
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
