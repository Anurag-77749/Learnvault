// LearnVault - Apple-Style Continuous Scrollytelling Workspace
import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  Code2, 
  Briefcase, 
  Bookmark, 
  FolderGit2, 
  BarChart3, 
  Hourglass 
} from 'lucide-react';

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

  // Active section spy on scroll
  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 200;

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
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col antialiased selection:bg-[#FF5500] selection:text-white relative font-sans overflow-x-hidden">
      {/* Top Minimalist HUD Bar */}
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
      <main className="w-full max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-24 relative z-10 pb-32">
        
        {/* SECTION 01: TODAY'S BLUEPRINT */}
        <section id="today" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                01 // MISSION CONTROL
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              DAILY BLUEPRINT & TASK MATRIX
            </span>
          </div>

          <TodayScreen
            onNavigateToTimer={handleStartTimerWithTopic}
            onNavigateToPlan={() => handleScrollTo('plan')}
            onNavigateToLearn={() => handleScrollTo('learn')}
          />
        </section>

        {/* SECTION 02: DEEP WORK FOCUS TIMER */}
        <section id="timer" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                02 // FLOW STATE STUDIO
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              HARDWARE-ACCURATE POMODORO ENGINE
            </span>
          </div>

          <TimerScreen initialTopic={timerTopic} />
        </section>

        {/* SECTION 03: 4-YEAR SPRINT ROADMAP */}
        <section id="plan" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                03 // ARCHITECTURAL ROADMAP
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              4-YEAR GANTT SPRINT TIMELINE
            </span>
          </div>

          <PlanScreen />
        </section>

        {/* SECTION 04: KNOWLEDGE CURRICULUM ATLAS */}
        <section id="learn" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                04 // KNOWLEDGE CURRICULUM
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              10-TRACK FDE SYLLABUS ATLAS (892 TOPICS)
            </span>
          </div>

          <LearnScreen />
        </section>

        {/* SECTION 05: DSA & ALGORITHMS LABORATORY */}
        <section id="dsa" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                05 // ALGORITHM LABORATORY
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              SPACED RETENTION & LEETCODE MATRIX
            </span>
          </div>

          <DSATrackerView />
        </section>

        {/* SECTION 06: FORWARD DEPLOYED CAREER HQ */}
        <section id="jobs" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                06 // CAREER HQ
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              APPLICATIONS & TECHNICAL INTERVIEWS
            </span>
          </div>

          <JobTrackerView />
        </section>

        {/* SECTION 07: KNOWLEDGE VAULT & INBOX */}
        <section id="vault" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                07 // KNOWLEDGE VAULT
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              RAPID CAPTURE & TOPIC LINKING
            </span>
          </div>

          <ResourceInboxView />
        </section>

        {/* SECTION 08: SHIPPED SYSTEMS & PROJECTS */}
        <section id="projects" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                08 // ENGINEERING SYSTEMS
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              ARCHITECTURE & PRODUCTION PORTFOLIOS
            </span>
          </div>

          <ProjectsScreen />
        </section>

        {/* SECTION 09: PERFORMANCE TELEMETRY & ANALYTICS */}
        <section id="progress" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                09 // PERFORMANCE TELEMETRY
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              MASTERY VELOCITY & FOCUS RATIOS
            </span>
          </div>

          <ProgressScreen />
        </section>

        {/* SECTION 10: ACCOUNTABILITY AUDIT */}
        <section id="wasted" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
                10 // ACCOUNTABILITY PROTOCOL
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
              DRIFT & RECOVERY AUDITING
            </span>
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
