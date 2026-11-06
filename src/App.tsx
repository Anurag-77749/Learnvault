// LearnVault - Luxury Obsidian, Espresso & Liquid Champagne Spatial Dashboard
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  LayoutGrid
} from 'lucide-react';
import { ScreenId } from './components/Navigation';
import { SpatialLeftSidebar } from './components/SpatialLeftSidebar';
import { TodayScreen } from './components/TodayScreen';
import { TimerScreen } from './components/TimerScreen';
import { PlanScreen } from './components/PlanScreen';
import { LearnScreen } from './components/LearnScreen';
import { DSATrackerView } from './components/DSATrackerView';
import { JobTrackerView } from './components/JobTrackerView';
import { ResourceInboxView } from './components/ResourceInboxView';
import { ProjectsScreen } from './components/ProjectsScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { WastedDaysScreen } from './components/WastedDaysScreen';
import { CloudSyncModal } from './components/CloudSyncModal';
import { cloudSyncService, SyncState } from './services/cloudSyncService';
import { cleanupSampleProjects } from './services/projectService';
import { KineticDomainBadge } from './components/KineticDomainBadge';
import { AmbientGoldCanvas } from './components/AmbientGoldCanvas';
import { LearnVaultLogo } from './components/LearnVaultLogo';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('today');
  const [timerTopic, setTimerTopic] = useState<string | undefined>(undefined);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getState());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    cloudSyncService.init();
    cleanupSampleProjects();
    return cloudSyncService.subscribe((state) => setSyncState(state));
  }, []);

  const handleStartTimerWithTopic = (topicTitle?: string) => {
    if (topicTitle) {
      setTimerTopic(topicTitle);
    }
    setActiveScreen('timer');
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScreen = (screen: ScreenId) => {
    setActiveScreen(screen);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Day calculation for mobile header
  const currentDayNumber = React.useMemo(() => {
    const start = new Date(2026, 10, 1);
    const now = new Date();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.floor((nowMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    return Math.min(1460, Math.max(1, diffDays + 1));
  }, []);

  return (
    <div className="min-h-screen bg-[#080707] text-[#F5F2EB] flex flex-col antialiased selection:bg-[#D4AF37] selection:text-black relative font-sans overflow-x-hidden">
      {/* Global Anodized Metal Noise Overlay */}
      <div className="anodized-noise-overlay" />

      {/* Ambient Drifting Volumetric Gold Particles Canvas */}
      <AmbientGoldCanvas className="opacity-80" />

      {/* ========================================================================
          MOBILE TOP APP BAR (VISIBLE ONLY ON MOBILE < LG)
          ======================================================================== */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#080707]/90 backdrop-blur-xl border-b border-[rgba(255,240,220,0.07)] px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => handleSelectScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <LearnVaultLogo size={28} showText={false} />
          <span className="font-serif-display font-black text-lg text-[#F5F2EB] tracking-tight">
            LearnVault
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Day Badge */}
          <div className="px-2.5 py-1 rounded-full bg-[#110E0E] border border-[rgba(255,240,220,0.08)] flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#D4AF37]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>DAY {currentDayNumber}</span>
          </div>

          {/* Menu Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="w-9 h-9 rounded-lg bg-[#110E0E] border border-[rgba(255,240,220,0.08)] flex items-center justify-center text-[#F5F2EB] hover:border-[#D4AF37]/40 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </header>

      {/* ========================================================================
          MOBILE SLIDE-OUT DRAWER OVERLAY
          ======================================================================== */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide-out Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="relative w-[300px] max-w-[85vw] h-full bg-[#060505] border-r border-[rgba(255,240,220,0.08)] p-4 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,240,220,0.06)]">
                  <div className="flex items-center gap-2">
                    <LearnVaultLogo size={26} showText={false} />
                    <span className="font-serif-display font-black text-lg text-[#F5F2EB]">
                      Navigation
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 text-[#9E958E] hover:text-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
                    aria-label="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <SpatialLeftSidebar
                  activeScreen={activeScreen}
                  onSelectScreen={handleSelectScreen}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================
          MAIN SPATIAL DASHBOARD CONTAINER (DESKTOP + MOBILE)
          ======================================================================== */}
      <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 pb-24 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* DESKTOP FIXED/STICKY LEFT SIDEBAR */}
          <div className="hidden lg:block w-64 lg:sticky lg:top-6 z-20 shrink-0">
            <SpatialLeftSidebar
              activeScreen={activeScreen}
              onSelectScreen={handleSelectScreen}
            />
          </div>

          {/* MAIN WORKSPACE VIEW */}
          <main className="flex-1 min-w-0 w-full">
            {activeScreen === 'today' && (
              <TodayScreen
                onNavigateToTimer={handleStartTimerWithTopic}
                onNavigateToPlan={() => handleSelectScreen('plan')}
                onNavigateToLearn={() => handleSelectScreen('learn')}
                onNavigateToProgress={() => handleSelectScreen('progress')}
              />
            )}

            {activeScreen === 'timer' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        02 // TEMPORAL ENGINE
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      Deep Work Chronometer
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Precision Pomodoro & focus ratio accountability
                    </p>
                  </div>
                  <KineticDomainBadge screenId="timer" size={68} />
                </div>
                <TimerScreen initialTopic={timerTopic} />
              </div>
            )}

            {activeScreen === 'plan' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        03 // ARCHITECTURAL ROADMAP
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      4-Year Sprint Timeline
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      1,460-day macro curriculum milestones & targets
                    </p>
                  </div>
                  <KineticDomainBadge screenId="plan" size={68} />
                </div>
                <PlanScreen />
              </div>
            )}

            {activeScreen === 'learn' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        04 // KNOWLEDGE CURRICULUM
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      10-Track FDE Syllabus (892 Topics)
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Complete engineering syllabus hierarchy & deep mastery
                    </p>
                  </div>
                  <KineticDomainBadge screenId="learn" size={68} />
                </div>
                <LearnScreen />
              </div>
            )}

            {activeScreen === 'dsa' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        05 // ALGORITHM LABORATORY
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      DSA Problem Engine & Analytics
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      LeetCode patterns, difficulty distribution & blind 75/150 progress
                    </p>
                  </div>
                  <KineticDomainBadge screenId="dsa" size={68} />
                </div>
                <DSATrackerView />
              </div>
            )}

            {activeScreen === 'jobs' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        06 // CAREER PIPELINE
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      FDE & Tech Job Applications
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Stage-by-stage Kanban tracking, salaries & referral follow-ups
                    </p>
                  </div>
                  <KineticDomainBadge screenId="jobs" size={68} />
                </div>
                <JobTrackerView />
              </div>
            )}

            {activeScreen === 'vault' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        07 // KNOWLEDGE VAULT
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      Resource Inbox & Bookmarks
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Saved technical articles, research papers & architectural references
                    </p>
                  </div>
                  <KineticDomainBadge screenId="vault" size={68} />
                </div>
                <ResourceInboxView />
              </div>
            )}

            {activeScreen === 'projects' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        08 // ENGINEERING LAB
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      Portfolio & Production Builds
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Enterprise architecture projects, system design & GitHub repos
                    </p>
                  </div>
                  <KineticDomainBadge screenId="projects" size={68} />
                </div>
                <ProjectsScreen />
              </div>
            )}

            {activeScreen === 'progress' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        09 // TELEMETRY CORE
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      Longitudinal Analytics & Heatmaps
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Study velocity, streak momentum & cognitive performance trends
                    </p>
                  </div>
                  <KineticDomainBadge screenId="progress" size={68} />
                </div>
                <ProgressScreen />
              </div>
            )}

            {activeScreen === 'wasted' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E5A970] shadow-[0_0_8px_#E5A970] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#E5A970] font-bold">
                        10 // ACCOUNTABILITY
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display tracking-tight text-[#F5F2EB]">
                      Entropy Singularity & Wasted Days Ledger
                    </h2>
                    <p className="text-xs font-mono text-[#9E958E] uppercase">
                      Zero-compromise time audits, distraction breakdown & recovery plans
                    </p>
                  </div>
                  <KineticDomainBadge screenId="wasted" size={68} />
                </div>
                <WastedDaysScreen />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================================
          MOBILE BOTTOM FLOATING QUICK-BAR (VISIBLE ONLY ON MOBILE < LG)
          ======================================================================== */}
      <div className="lg:hidden fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <nav className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-full bg-[#110E0E]/90 backdrop-blur-2xl border border-[rgba(255,240,220,0.1)] shadow-[0_16px_32px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
          <button
            type="button"
            onClick={() => handleSelectScreen('today')}
            className={`p-2.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all ${
              activeScreen === 'today'
                ? 'bg-gradient-to-r from-[#F6E6C2] to-[#D4AF37] text-[#090808] font-bold shadow-md'
                : 'text-[#9E958E] hover:text-[#F5F2EB]'
            }`}
            aria-label="Today"
          >
            <Sun className="w-4 h-4" />
            {activeScreen === 'today' && <span className="text-[11px] font-semibold pr-1">Today</span>}
          </button>

          <button
            type="button"
            onClick={() => handleSelectScreen('timer')}
            className={`p-2.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all ${
              activeScreen === 'timer'
                ? 'bg-gradient-to-r from-[#F6E6C2] to-[#D4AF37] text-[#090808] font-bold shadow-md'
                : 'text-[#9E958E] hover:text-[#F5F2EB]'
            }`}
            aria-label="Timer"
          >
            <TimerIcon className="w-4 h-4" />
            {activeScreen === 'timer' && <span className="text-[11px] font-semibold pr-1">Timer</span>}
          </button>

          <button
            type="button"
            onClick={() => handleSelectScreen('plan')}
            className={`p-2.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all ${
              activeScreen === 'plan'
                ? 'bg-gradient-to-r from-[#F6E6C2] to-[#D4AF37] text-[#090808] font-bold shadow-md'
                : 'text-[#9E958E] hover:text-[#F5F2EB]'
            }`}
            aria-label="Plan"
          >
            <CalendarRange className="w-4 h-4" />
            {activeScreen === 'plan' && <span className="text-[11px] font-semibold pr-1">Plan</span>}
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2.5 rounded-full text-[#9E958E] hover:text-[#D4AF37] hover:bg-white/[0.04] transition-all"
            aria-label="All Navigation"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};

export default App;
