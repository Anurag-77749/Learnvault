// LearnVault - Precision Obsidian & Gold Workspace (v1.0.4)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud } from 'lucide-react';
import { db } from './services/db';
import { ScreenId, TopNavPills } from './components/Navigation';
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

  // Compute live stats for quick metrics
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Top Header with Navigation Features in the Center Space */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-[#000000]/98 backdrop-blur-md border-b border-[#141414] sticky top-0 z-30 gap-2 sm:gap-4 select-none">
        {/* Left: Brand Mark */}
        <div 
          onClick={() => {
            setActiveScreen('today');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          title="Go to Today"
        >
          <div className="w-8 h-8 rounded-xl bg-[#000000] border border-[#D4AF37]/50 flex items-center justify-center p-0.5 shadow-md shadow-[#D4AF37]/20 overflow-hidden shrink-0">
            <img src="/learnvault-logo.png" alt="LearnVault" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-none block group-hover:text-shiny-gold transition-colors font-display">
              Learn<span className="text-shiny-gold">Vault</span>
            </span>
            <span className="text-[8px] sm:text-[9px] text-[#D4AF37] uppercase tracking-wider block font-semibold">
              YOUR KNOWLEDGE • YOUR PROGRESS
            </span>
          </div>
        </div>

        {/* Center: Navigation Features placed directly in top space */}
        <div className="flex-1 flex justify-center min-w-0">
          <TopNavPills 
            activeScreen={activeScreen}
            onSelectScreen={(screen) => {
              setActiveScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        {/* Right: Cloud Sync & Quick Metrics */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="p-1 sm:p-1.5 px-2 sm:px-2.5 rounded-full bg-[#080808] border border-[#1a1a1a] hover:border-[#D4AF37]/60 text-shiny-gold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-medium text-[#B8B0AA]">
              {syncState.syncId ? 'Synced' : 'Sync'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            )}
          </button>
          <span className="px-2 sm:px-2.5 py-1 rounded-full bg-[#080808] border border-[#1a1a1a] text-shiny-gold font-bold flex items-center gap-1">
            🔥 {streakCount}d
          </span>
          <button
            onClick={() => {
              setActiveScreen('wasted');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-2 sm:px-2.5 py-1 rounded-full bg-[#150507] border border-red-900/50 text-red-300 font-bold flex items-center gap-1 cursor-pointer hover:bg-red-950/80 transition-colors"
            title="Wasted Days Count"
          >
            ⏳ {wastedDaysCount}d
          </button>
          <span className="px-2 sm:px-2.5 py-1 rounded-full bg-[#080808] border border-[#D4AF37]/40 text-white font-bold">
            {totalStudyHours}h
          </span>
        </div>
      </header>

      {/* Main Content Area */}
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
                onNavigateToPlan={() => {
                  setActiveScreen('plan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToLearn={() => {
                  setActiveScreen('learn');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};

export default App;
