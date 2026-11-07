// LearnVault - Neo-Brutalist Dull Matte Lime Workspace (v1.0.7)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud, Sun, Moon } from 'lucide-react';
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

  // Light / Dark mode state persisted in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('learnvault-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark-mode');
    }
    localStorage.setItem('learnvault-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#F4F4F0] text-[#000000]' : 'bg-[#000000] text-[#EDEDED]'} flex flex-col antialiased selection:bg-[#84CC16] selection:text-black transition-colors duration-200`}>
      {/* Top Header: Neo-Brutalist Top Navigation Bar */}
      <header className={`flex items-center justify-between px-3 sm:px-6 py-2.5 ${isLight ? 'bg-white border-b-2 border-black shadow-[0_3px_0px_rgba(0,0,0,0.06)]' : 'bg-[#000000] border-b-2 border-[#202020]'} sticky top-0 z-30 gap-2 sm:gap-4 select-none transition-colors`}>
        {/* Left: Brutalist Brand Mark */}
        <div 
          onClick={() => {
            setActiveScreen('today');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          title="Go to Today"
        >
          <div className={`w-8 h-8 rounded-md ${isLight ? 'bg-white border-2 border-black shadow-[2px_2px_0px_#84CC16]' : 'bg-[#000000] border-2 border-[#84CC16] shadow-[2px_2px_0px_rgba(132,204,22,0.4)]'} flex items-center justify-center p-0.5 overflow-hidden shrink-0`}>
            <img src="/learnvault-logo.png" alt="LearnVault" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-black' : 'text-white'} leading-none block font-display`}>
              Learn<span className="text-[#84CC16]">Vault</span>
            </span>
            <span className="text-[8px] sm:text-[9px] text-[#84CC16] uppercase tracking-wider block font-bold font-mono">
              [SYSTEM: MASTER]
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

        {/* Right: Cloud Sync, Theme Toggle & Quick Metrics */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0 font-mono">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1 sm:p-1.5 px-2 sm:px-2.5 rounded-md border-2 ${isLight ? 'bg-white border-black shadow-[2px_2px_0px_#000000] text-black' : 'bg-[#080808] border-[#333333] shadow-[2px_2px_0px_#000000] hover:border-[#84CC16] text-white'} flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Light/Dark Theme"
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#84CC16]" />
                <span className="hidden md:inline text-[11px] font-bold">DARK</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#84CC16]" />
                <span className="hidden md:inline text-[11px] font-bold">LIGHT</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            className={`p-1 sm:p-1.5 px-2 sm:px-2.5 rounded-md border-2 ${isLight ? 'bg-white border-black shadow-[2px_2px_0px_#000000]' : 'bg-[#080808] border-[#333333] shadow-[2px_2px_0px_#000000] hover:border-[#84CC16]'} text-[#84CC16] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]`}
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className={`hidden md:inline text-[11px] font-bold ${isLight ? 'text-black' : 'text-white'}`}>
              {syncState.syncId ? 'SYNCED' : 'SYNC'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] shadow-[0_0_6px_#84CC16]" />
            )}
          </button>

          <span className={`px-2 sm:px-2.5 py-1 rounded-md border-2 ${isLight ? 'bg-white border-black shadow-[2px_2px_0px_#000000]' : 'bg-[#080808] border-[#333333] shadow-[2px_2px_0px_#000000]'} text-[#84CC16] font-bold flex items-center gap-1`}>
            🔥 {streakCount}d
          </span>

          <button
            onClick={() => {
              setActiveScreen('wasted');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-2 sm:px-2.5 py-1 rounded-md border-2 ${isLight ? 'bg-rose-50 border-black shadow-[2px_2px_0px_#000000] text-rose-700' : 'bg-[#150507] border-red-900/60 shadow-[2px_2px_0px_#000000] text-rose-400'} font-bold flex items-center gap-1 cursor-pointer transition-all`}
            title="Wasted Days Count"
          >
            ⏳ {wastedDaysCount}d
          </button>

          <span className={`px-2 sm:px-2.5 py-1 rounded-md border-2 ${isLight ? 'bg-white border-black shadow-[2px_2px_0px_#000000] text-black' : 'bg-[#080808] border-[#333333] shadow-[2px_2px_0px_#000000] text-white'} font-bold`}>
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
