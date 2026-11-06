// LearnVault - Apple-Style 3D Scroll-Driven Web Application (Obsidian, Crimson Glass & Brushed Gold)
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { ScreenId, TopNavBar, FloatingDock, NAV_ITEMS } from './components/Navigation';
import { FrameSequenceHero } from './components/FrameSequenceHero';
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
      const yOffset = -80;
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

  // Active section spy on scroll with rAF throttle for maximum 120fps smoothness
  useEffect(() => {
    let ticking = false;

    const handleScrollSpy = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 260;

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
    <div className="min-h-screen bg-[#080304] text-[#FAF2E6] flex flex-col antialiased selection:bg-[#E5B84B] selection:text-black relative font-sans overflow-x-hidden">
      {/* Top Minimalist HUD Bar */}
      <TopNavBar
        activeScreen={activeScreen}
        onSelectScreen={handleScrollTo}
        streakCount={streakCount}
        totalStudyHours={totalStudyHours}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onQuickFocus={() => handleStartTimerWithTopic()}
      />

      {/* 1. 3D SCROLL HERO SECTION: 240-FRAME EXPLODED CHRONOMETER CUBE WITH GSAP SCROLLTRIGGER */}
      <FrameSequenceHero onEnterWorkspace={() => handleScrollTo('today')} />

      {/* 2. SPATIAL GLASSMORPHIC DASHBOARD WITH STICKY DOCK SIDEBAR & CONTINUOUS SECTIONS */}
      <div id="workspace-container" className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-10 relative z-10 pb-36">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR (STICKY GLASS DOCK) */}
          <div className="w-full lg:w-72 lg:sticky lg:top-20 z-20 shrink-0">
            <SpatialLeftSidebar
              activeScreen={activeScreen}
              onSelectScreen={handleScrollTo}
            />
          </div>

          {/* MAIN WORKSPACE SECTIONS */}
          <main className="flex-1 min-w-0 space-y-24">
            
            {/* SECTION 01: TODAY'S MISSION (WORKSPACE) */}
            <section id="today" className="scroll-mt-24 space-y-4">
              <TodayScreen
                onNavigateToTimer={handleStartTimerWithTopic}
                onNavigateToPlan={() => handleScrollTo('plan')}
                onNavigateToLearn={() => handleScrollTo('learn')}
                onNavigateToProgress={() => handleScrollTo('progress')}
              />
            </section>

            {/* SECTION 02: DEEP WORK FOCUS TIMER */}
            <section id="timer" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      02 // TEMPORAL ENGINE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    Deep Work Chronometer
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Precision Pomodoro & focus ratio accountability
                  </p>
                </div>
                
                {/* Kinetic 3D Chronometer Badge */}
                <KineticDomainBadge screenId="timer" size={68} />
              </div>

              <TimerScreen initialTopic={timerTopic} />
            </section>

            {/* SECTION 03: 4-YEAR SPRINT ROADMAP */}
            <section id="plan" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F9D976] shadow-[0_0_10px_#F9D976] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      03 // ARCHITECTURAL ROADMAP
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    4-Year Sprint Timeline
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    1,460-day macro curriculum milestones & targets
                  </p>
                </div>
                
                <KineticDomainBadge screenId="plan" size={68} />
              </div>

              <PlanScreen />
            </section>

            {/* SECTION 04: KNOWLEDGE CURRICULUM ATLAS */}
            <section id="learn" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      04 // KNOWLEDGE CURRICULUM
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    10-Track FDE Syllabus (892 Topics)
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Complete engineering syllabus hierarchy & deep mastery
                  </p>
                </div>
                
                <KineticDomainBadge screenId="learn" size={68} />
              </div>

              <LearnScreen />
            </section>

            {/* SECTION 05: DSA & ALGORITHMS LABORATORY */}
            <section id="dsa" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      05 // ALGORITHM LABORATORY
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    DSA Problem Engine & Analytics
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    LeetCode patterns, difficulty distribution & blind 75/150 progress
                  </p>
                </div>

                <KineticDomainBadge screenId="dsa" size={68} />
              </div>

              <DSATrackerView />
            </section>

            {/* SECTION 06: CAREER PIPELINE & OPPORTUNITIES */}
            <section id="jobs" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      06 // CAREER PIPELINE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    FDE & Tech Job Applications
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Stage-by-stage Kanban tracking, salaries & referral follow-ups
                  </p>
                </div>

                <KineticDomainBadge screenId="jobs" size={68} />
              </div>

              <JobTrackerView />
            </section>

            {/* SECTION 07: KNOWLEDGE VAULT & BOOKMARKS */}
            <section id="vault" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      07 // KNOWLEDGE VAULT
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    Resource Inbox & Bookmarks
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Saved technical articles, research papers & architectural references
                  </p>
                </div>

                <KineticDomainBadge screenId="vault" size={68} />
              </div>

              <ResourceInboxView />
            </section>

            {/* SECTION 08: PRODUCTION PROJECTS LABORATORY */}
            <section id="projects" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      08 // ENGINEERING LAB
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    Portfolio & Production Builds
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Enterprise architecture projects, system design & GitHub repos
                  </p>
                </div>

                <KineticDomainBadge screenId="projects" size={68} />
              </div>

              <ProjectsScreen />
            </section>

            {/* SECTION 09: TEMPORAL TELEMETRY & ANALYTICS */}
            <section id="progress" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                      09 // TELEMETRY CORE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    Longitudinal Analytics & Heatmaps
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Study velocity, streak momentum & cognitive performance trends
                  </p>
                </div>

                <KineticDomainBadge screenId="progress" size={68} />
              </div>

              <ProgressScreen />
            </section>

            {/* SECTION 10: ACCOUNTABILITY & ENTROPY LEDGER */}
            <section id="wasted" className="scroll-mt-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-black">
                      10 // ACCOUNTABILITY
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    Entropy Singularity & Wasted Days Ledger
                  </h2>
                  <p className="text-xs font-mono text-[#BFA997] uppercase">
                    Zero-compromise time audits, distraction breakdown & recovery plans
                  </p>
                </div>

                <KineticDomainBadge screenId="wasted" size={68} />
              </div>

              <WastedDaysScreen />
            </section>

          </main>
        </div>
      </div>

      {/* Floating Bottom Navigation Dock */}
      <FloatingDock activeScreen={activeScreen} onSelectScreen={handleScrollTo} />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};

export default App;
