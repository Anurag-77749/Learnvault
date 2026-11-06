import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  FolderGit2,
  BarChart3,
  Hourglass,
  Cloud,
  Play
} from 'lucide-react';
import { db } from '../services/db';
import { cloudSyncService, SyncState } from '../services/cloudSyncService';

export type ScreenId = 'today' | 'timer' | 'plan' | 'learn' | 'projects' | 'progress' | 'wasted';

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  streakCount?: number;
  totalStudyHours?: number;
  onOpenSyncModal?: () => void;
  onQuickFocus?: () => void;
}

export const NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'timer', label: 'Timer', icon: TimerIcon },
  { id: 'plan', label: 'Plan', icon: CalendarRange },
  { id: 'learn', label: 'Curriculum', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Analytics', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', icon: Hourglass },
];

/* ==========================================================================
   TOP MINIMALIST HUD BAR (FROSTED DARK GLASS)
   ========================================================================== */
export const TopNavBar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  streakCount = 1,
  totalStudyHours = 0,
  onOpenSyncModal,
  onQuickFocus,
}) => {
  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getState());

  useEffect(() => {
    return cloudSyncService.subscribe((state) => setSyncState(state));
  }, []);

  let totalSub = 0;
  let doneSub = 0;
  curriculumTopics.forEach((t) => {
    totalSub += t.subtopics?.length || 0;
    doneSub += t.subtopics?.filter((s) => s.completed).length || 0;
  });
  const overallPercent = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

  // Day calculation (Day X of 1,460)
  const currentDayNumber = React.useMemo(() => {
    const start = new Date(2026, 10, 1);
    const now = new Date();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.floor((nowMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    return Math.min(1460, Math.max(1, diffDays + 1));
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0B0E]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3 select-none">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Minimalist Geometric Logo Mark */}
        <div 
          onClick={() => onSelectScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center p-1 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          </div>
          <div className="leading-tight">
            <span className="font-display font-extrabold text-sm tracking-tight text-[#F8FAFC]">
              LEARNVAULT
            </span>
            <span className="text-[10px] font-mono text-[#818CF8] ml-1.5 font-bold">
              // OS 2.0
            </span>
          </div>
        </div>

        {/* Center: 1,460-Day Macro Progress Scrubber */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-sm hover:border-white/20 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#F8FAFC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-pulse" />
            <span>DAY {String(currentDayNumber).padStart(3, '0')} / 1,460</span>
          </div>

          <div className="w-24 bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-slate-400">
            <strong className="text-white">{doneSub}/{totalSub}</strong> TOPICS ({overallPercent}%)
          </div>
        </div>

        {/* Right: Date Badge, Sync & Hero "Start Pomodoro" Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm cursor-pointer"
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-[#818CF8]" />
            <span className="hidden xl:inline text-[10px] font-bold">
              {syncState.syncId ? 'SYNC' : 'LINK'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            )}
          </button>

          {/* Live Date Badge */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono font-bold text-slate-300 shadow-sm">
            <span>{formattedDate}</span>
          </div>

          {/* Hero "Start Pomodoro" Button */}
          <button
            onClick={() => {
              if (onQuickFocus) onQuickFocus();
              else onSelectScreen('timer');
            }}
            className="px-4 py-2 rounded-full btn-orange text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-3 h-3 fill-current stroke-[2]" />
            <span>START POMODORO</span>
          </button>
        </div>
      </div>
    </header>
  );
};

/* ==========================================================================
   FLOATING MACOS-STYLE GLASS DOCK (BOTTOM CENTER)
   ========================================================================== */
export const FloatingDock: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav 
        className="pointer-events-auto glass-dock px-3 py-2 flex items-center gap-1.5 sm:gap-2 shadow-2xl"
        aria-label="Application Dock Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`relative px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white/15 text-white border border-white/20 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#818CF8]' : 'text-current'}`} />
              <span className="hidden md:inline font-sans">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] ml-0.5 shadow-[0_0_6px_#818CF8]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/* Backward-compatibility exports */
export const DesktopSidebar: React.FC<NavigationProps> = () => null;
export const MobileTabBar: React.FC<NavigationProps> = (props) => <FloatingDock {...props} />;
