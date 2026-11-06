// LearnVault - Spatial Glassmorphic Dashboard (Obsidian, Crimson Glass & Brushed Gold)
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
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

  return (
    <div className="min-h-screen bg-[#080203] text-[#FAF2E6] flex flex-col antialiased selection:bg-[#E5B84B] selection:text-black relative font-sans overflow-x-hidden">
      {/* Ambient Drifting Volumetric Gold Particles Canvas */}
      <AmbientGoldCanvas className="opacity-80" />

      {/* Main Spatial Dashboard Container */}
      <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR (EXACT MATCH TO USER SPEC) */}
          <div className="w-full lg:w-64 lg:sticky lg:top-6 z-20 shrink-0">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        02 // TEMPORAL ENGINE
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      Deep Work Chronometer
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F9D976] shadow-[0_0_10px_#F9D976] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        03 // ARCHITECTURAL ROADMAP
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      4-Year Sprint Timeline
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        04 // KNOWLEDGE CURRICULUM
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      10-Track FDE Syllabus (892 Topics)
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        05 // ALGORITHM LABORATORY
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      DSA Problem Engine & Analytics
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        06 // CAREER PIPELINE
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      FDE & Tech Job Applications
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        07 // KNOWLEDGE VAULT
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      Resource Inbox & Bookmarks
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        08 // ENGINEERING LAB
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      Portfolio & Production Builds
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_10px_#E5B84B] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#F9D976] font-black">
                        09 // TELEMETRY CORE
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      Longitudinal Analytics & Heatmaps
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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
                <div className="p-5 rounded-2xl crimson-glass border border-[#E5B84B]/20 flex items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-black">
                        10 // ACCOUNTABILITY
                      </span>
                    </div>
                    <h2 className="text-2xl font-black font-display tracking-tight text-white">
                      Entropy Singularity & Wasted Days Ledger
                    </h2>
                    <p className="text-xs font-mono text-[#BFA997] uppercase">
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

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};

export default App;
