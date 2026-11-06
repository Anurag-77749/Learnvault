// LearnVault - Precision Obsidian & Champagne Luxury Workspace (v1.0.5)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud, Flame, Hourglass, Clock } from 'lucide-react';
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

  // Compute live stats for quick telemetry
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
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] flex flex-col antialiased selection:bg-[#D8B76E] selection:text-black">
      {/* Top Navigation Bar: Minimalist Luxury Studio Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#000000]/95 backdrop-blur-md border-b border-white/[0.07] sticky top-0 z-30 gap-2 sm:gap-4 select-none">
        {/* Left: Brand Identity */}
        <div 
          onClick={() => {
            setActiveScreen('today');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          title="LearnVault Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#080808] border border-white/10 flex items-center justify-center p-1 shadow-sm overflow-hidden shrink-0 group-hover:border-[#D8B76E]/50 transition-colors">
            <img src="/learnvault-logo.png" alt="LearnVault" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-[#D8B76E] transition-colors">
                LearnVault
              </span>
            </div>
            <span className="text-[8px] text-[#8A8A8A] uppercase tracking-widest block font-medium mt-0.5">
              YOUR KNOWLEDGE · YOUR PROGRESS
            </span>
          </div>
        </div>

        {/* Center: Top Navigation Pills */}
        <div className="flex-1 flex justify-center min-w-0">
          <TopNavPills 
            activeScreen={activeScreen}
            onSelectScreen={(screen) => {
              setActiveScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        {/* Right: Telemetry & Cloud Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="h-8 px-2.5 rounded-lg bg-[#080808] border border-white/[0.08] hover:border-white/20 text-[#A3A3A3] hover:text-white flex items-center gap-1.5 cursor-pointer transition-all text-xs"
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-medium">
              {syncState.syncId ? 'Synced' : 'Sync'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            )}
          </button>

          <div className="h-8 px-2.5 rounded-lg bg-[#080808] border border-white/[0.08] text-[#D8B76E] font-medium flex items-center gap-1.5 tabular-nums text-xs">
            <Flame className="w-3.5 h-3.5 text-[#D8B76E]" />
            <span>{streakCount}d</span>
          </div>

          <button
            onClick={() => {
              setActiveScreen('wasted');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="h-8 px-2.5 rounded-lg bg-[#120507] border border-red-500/20 text-red-300 hover:border-red-500/40 font-medium flex items-center gap-1.5 cursor-pointer transition-all tabular-nums text-xs"
            title="Wasted Days Count"
          >
            <Hourglass className="w-3.5 h-3.5 text-red-400" />
            <span>{wastedDaysCount}d</span>
          </button>

          <div className="h-8 px-2.5 rounded-lg bg-[#080808] border border-white/[0.08] text-white font-medium flex items-center gap-1 tabular-nums text-xs">
            <Clock className="w-3 h-3 text-[#8A8A8A]" />
            <span>{totalStudyHours}h</span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeScreen === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
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
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              <TimerScreen initialTopic={timerTopic} />
            </motion.div>
          )}

          {activeScreen === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              <PlanScreen />
            </motion.div>
          )}

          {activeScreen === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              <LearnScreen />
            </motion.div>
          )}

          {activeScreen === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              <ProjectsScreen />
            </motion.div>
          )}

          {activeScreen === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              <ProgressScreen />
            </motion.div>
          )}

          {activeScreen === 'wasted' && (
            <motion.div
              key="wasted"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
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
