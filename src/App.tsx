// LearnVault - Apple-Style Continuous Scrollytelling Workspace (Ultra-Smooth 120 FPS Architecture)
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { ScreenId, TopNavBar, FloatingDock, NAV_ITEMS } from './components/Navigation';
import { AppleScrollShowcase } from './components/AppleScrollShowcase';
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

  // Smooth scroll to target section
  const handleScrollTo = (id: ScreenId) => {
    setActiveScreen(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -72;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleStartTimerWithTopic = (topicTitle?: string) => {
    if (topicTitle) {
      setTimerTopic(topicTitle);
    }
    handleScrollTo('timer');
  };

  // Active section spy on scroll with rAF throttle for maximum smoothness
  useEffect(() => {
    let ticking = false;

    const handleScrollSpy = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 220;

          for (const item of NAV_ITEMS) {
            const el = document.getElementById(item.id);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPosition >= top && scrollPosition < top + height) {
                setActiveScreen(item.id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex flex-col antialiased selection:bg-[var(--accent-primary)] selection:text-black relative font-sans overflow-x-hidden transition-colors duration-300">
      {/* Top Minimalist HUD Bar with Theme Switcher */}
      <TopNavBar
        activeScreen={activeScreen}
        onSelectScreen={handleScrollTo}
        streakCount={streakCount}
        totalStudyHours={totalStudyHours}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onQuickFocus={() => handleStartTimerWithTopic()}
      />

      {/* 1. COVERPAGE: APPLE-STYLE 3D SCROLL-DRIVEN REVEAL */}
      <AppleScrollShowcase onEnterWorkspace={() => handleScrollTo('today')} />

      {/* 2. CONTINUOUS SCROLL WORKSPACE SECTIONS */}
      <main className="w-full max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-24 relative z-10 pb-36">
        
        {/* SECTION 01: TODAY'S BLUEPRINT */}
        <section id="today" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)] font-black">
                  01 // MISSION CONTROL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Today's Execution Blueprint
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Daily momentum telemetry & forward-deployed engineering matrix
              </p>
            </div>
            
            {/* Kinetic 3D Gyroscope Badge */}
            <KineticDomainBadge screenId="today" size={68} />
          </div>

          <TodayScreen
            onNavigateToTimer={handleStartTimerWithTopic}
            onNavigateToPlan={() => handleScrollTo('plan')}
            onNavigateToLearn={() => handleScrollTo('learn')}
          />
        </section>

        {/* SECTION 02: DEEP WORK FOCUS TIMER */}
        <section id="timer" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)] font-black">
                  02 // TEMPORAL ENGINE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Deep Work Chronometer
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Precision Pomodoro & focus ratio accountability
              </p>
            </div>
            
            {/* Kinetic 3D Chronometer Badge */}
            <KineticDomainBadge screenId="timer" size={68} />
          </div>

          <TimerScreen initialTopic={timerTopic} />
        </section>

        {/* SECTION 03: 4-YEAR SPRINT ROADMAP */}
        <section id="plan" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-secondary)] shadow-[0_0_10px_var(--accent-secondary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-secondary)] font-black">
                  03 // ARCHITECTURAL ROADMAP
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                4-Year Sprint Timeline
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                1,460-day macro curriculum milestones & targets
              </p>
            </div>
            
            {/* Kinetic 3D Timeline Pillars Badge */}
            <KineticDomainBadge screenId="plan" size={68} />
          </div>

          <PlanScreen />
        </section>

        {/* SECTION 04: KNOWLEDGE CURRICULUM ATLAS */}
        <section id="learn" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)] font-black">
                  04 // KNOWLEDGE CURRICULUM
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                10-Track FDE Syllabus (892 Topics)
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Complete engineering syllabus hierarchy & deep mastery
              </p>
            </div>
            
            {/* Kinetic 3D Constellation Badge */}
            <KineticDomainBadge screenId="learn" size={68} />
          </div>

          <LearnScreen />
        </section>

        {/* SECTION 05: DSA & ALGORITHMS LABORATORY */}
        <section id="dsa" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-secondary)] shadow-[0_0_10px_var(--accent-secondary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-secondary)] font-black">
                  05 // ALGORITHM LABORATORY
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Spaced Retention & LeetCode Matrix
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Data structures, algorithmic patterns & revision intervals
              </p>
            </div>
            
            {/* Kinetic 3D Algorithm Lattice Badge */}
            <KineticDomainBadge screenId="dsa" size={68} />
          </div>

          <DSATrackerView />
        </section>

        {/* SECTION 06: FORWARD DEPLOYED CAREER HQ */}
        <section id="jobs" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-secondary)] shadow-[0_0_10px_var(--accent-secondary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-secondary)] font-black">
                  06 // CAREER RADAR HQ
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Technical Interview & Job Pipeline
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Applications, compensation benchmarks & interview stages
              </p>
            </div>
            
            {/* Kinetic 3D Radar Globe Badge */}
            <KineticDomainBadge screenId="jobs" size={68} />
          </div>

          <JobTrackerView />
        </section>

        {/* SECTION 07: KNOWLEDGE VAULT & INBOX */}
        <section id="vault" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-black">
                  07 // KNOWLEDGE VAULT
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Memory Crystal & Rapid Capture
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Resource bookmarks, technical whitepapers & quick inbox
              </p>
            </div>
            
            {/* Kinetic 3D Memory Crystal Badge */}
            <KineticDomainBadge screenId="vault" size={68} />
          </div>

          <ResourceInboxView />
        </section>

        {/* SECTION 08: SHIPPED SYSTEMS & PROJECTS */}
        <section id="projects" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#38BDF8] font-black">
                  08 // ARCHITECTURE STACK
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Production Systems & Engineering Portfolios
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Distributed systems, repositories, architecture diagrams & deployments
              </p>
            </div>
            
            {/* Kinetic 3D Slabs Badge */}
            <KineticDomainBadge screenId="projects" size={68} />
          </div>

          <ProjectsScreen />
        </section>

        {/* SECTION 09: PERFORMANCE TELEMETRY & ANALYTICS */}
        <section id="progress" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-secondary)] shadow-[0_0_10px_var(--accent-secondary)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-secondary)] font-black">
                  09 // PERFORMANCE MATRIX
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Master Composite Score & Telemetry
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Curriculum velocity, focus ratio consistency & heatmaps
              </p>
            </div>
            
            {/* Kinetic 3D Bar Matrix Badge */}
            <KineticDomainBadge screenId="progress" size={68} />
          </div>

          <ProgressScreen />
        </section>

        {/* SECTION 10: ACCOUNTABILITY AUDIT */}
        <section id="wasted" className="scroll-mt-20 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl smoked-glass border border-white/[0.09] flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-black">
                  10 // ENTROPY PROTOCOL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
                Temporal Drift & Accountability Audit
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                Distraction root-cause analysis & instant recovery logging
              </p>
            </div>
            
            {/* Kinetic 3D Hourglass Badge */}
            <KineticDomainBadge screenId="wasted" size={68} />
          </div>

          <WastedDaysScreen />
        </section>

      </main>

      {/* Floating macOS-Style Smoked Obsidian Glass Dock */}
      <FloatingDock
        activeScreen={activeScreen}
        onSelectScreen={handleScrollTo}
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
