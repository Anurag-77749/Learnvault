// LearnVault - Precision Obsidian & Liquid Champagne Workspace
import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  FolderGit2, 
  BarChart3, 
  Hourglass,
  Cloud,
  Play,
  Code2
} from 'lucide-react';
import { ScreenId } from './components/Navigation';
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
import { SpatialLeftSidebar } from './components/SpatialLeftSidebar';

const TOP_NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'timer', label: 'Timer', icon: TimerIcon },
  { id: 'plan', label: 'Plan', icon: CalendarRange },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'dsa', label: 'DSA', icon: Code2 },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', icon: Hourglass },
];

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

  const handleStartTimerWithTopic = (topicTitle?: string) => {
    if (topicTitle) {
      setTimerTopic(topicTitle);
    }
    setActiveScreen('timer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScreen = (screen: ScreenId) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Day calculation for header
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
      {/* Global Anodized Metal Noise Texture */}
      <div className="anodized-noise-overlay" />

      {/* Ambient Drifting Volumetric Gold Particles Canvas */}
      <AmbientGoldCanvas className="opacity-75" />

      {/* ========================================================================
          MOBILE TOP NAVIGATION HUD BAR (TOUCH-FRIENDLY, HIDDEN ON DESKTOP)
          ======================================================================== */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#080707]/90 backdrop-blur-xl border-b border-[rgba(255,240,220,0.07)] px-3 sm:px-6 py-2.5 select-none transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Mark */}
          <div 
            onClick={() => handleSelectScreen('today')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <LearnVaultLogo size={26} showText={false} />
            <span className="font-display font-black text-base text-[#F5F2EB] tracking-tight group-hover:text-[#F6E6C2] transition-colors leading-none">
              LearnVault
            </span>
          </div>

          {/* Navigation Tabs Pills (Scrollable on Mobile) */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-[#110E0E] border border-[rgba(255,240,220,0.07)] shadow-inner overflow-x-auto no-scrollbar max-w-[50vw] sm:max-w-none">
            {TOP_NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectScreen(item.id)}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'liquid-gold-pill text-[#000000] shadow-sm font-bold'
                      : 'text-[#9E958E] hover:text-[#F5F2EB] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Day Badge & Cloud Sync */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Day Badge */}
            <div className="px-2 py-0.5 rounded-full bg-[#110E0E] border border-[rgba(255,240,220,0.07)] flex items-center gap-1 text-[10px] font-mono font-bold text-[#D4AF37]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>D{currentDayNumber}</span>
            </div>

            {/* Cloud Sync Status */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="p-1.5 rounded-full bg-[#110E0E] border border-[rgba(255,240,220,0.07)] hover:border-[#D4AF37]/50 text-[#9E958E] hover:text-[#F5F2EB] transition-all flex items-center gap-1 cursor-pointer"
              title="Cloud Sync"
            >
              <Cloud className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================
          WORKSPACE CONTAINER: SLEEK LEFT SIDEBAR (DESKTOP) + EXPANSIVE WORKSPACE
          ======================================================================== */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 relative z-10 flex flex-col lg:flex-row gap-6 items-start">
        {/* Sleek Recessed Left Sidebar (Desktop Only) */}
        <SpatialLeftSidebar
          activeScreen={activeScreen}
          onSelectScreen={handleSelectScreen}
          className="hidden lg:block sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar shrink-0"
        />

        {/* Main Workspace (Full Width on Mobile, Side by Side on Desktop) */}
        <main className="flex-1 min-w-0 w-full">
          {/* Top Status Bar on Desktop */}
          <div className="hidden lg:flex items-center justify-between pb-4 border-b border-[rgba(255,240,220,0.07)] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
                PRECISION WORKSPACE // DAY {currentDayNumber} OF 1,460
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="px-3 py-1 rounded-full bg-[#110E0E] border border-[rgba(255,240,220,0.07)] hover:border-[#D4AF37]/50 text-[#9E958E] hover:text-[#F5F2EB] transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                title="Cloud Sync"
              >
                <Cloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[10px] font-bold">
                  {syncState.syncId ? 'CLOUD SYNCED' : 'BACKUP CLOUD'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleStartTimerWithTopic()}
                className="px-3.5 py-1.5 rounded-full btn-liquid-gold text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Play className="w-3 h-3 fill-current text-black" />
                <span className="font-mono text-[11px] text-black">Start Focus</span>
              </button>
            </div>
          </div>

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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      02 // TEMPORAL ENGINE
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      03 // ARCHITECTURAL ROADMAP
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      04 // KNOWLEDGE CURRICULUM
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      05 // ALGORITHM LABORATORY
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      06 // CAREER PIPELINE
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      07 // KNOWLEDGE VAULT
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      08 // ENGINEERING LAB
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                      09 // TELEMETRY CORE
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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
              <div className="p-5 rounded-xl bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E5A970] shadow-[0_0_8px_#E5A970] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#E5A970] font-bold">
                      10 // ACCOUNTABILITY
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-[#F5F2EB]">
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

        {/* Minimalist Clean Footer */}
        <footer className="mt-16 py-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#55504A]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>LearnVault // 1,460-Day Forward Deployed Engineering Mastery</span>
          </div>
          <span>Precision Engineered Focus & Accountability</span>
        </footer>
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
