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
   TOP MINIMALIST HUD BAR (SMOKED OBSIDIAN & POLISHED MERCURY)
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
    <header className="sticky top-0 z-30 w-full bg-[#08080A]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-8 py-3 select-none">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Minimalist Hardware Mark */}
        <div 
          onClick={() => onSelectScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-[#141418] border border-white/[0.12] flex items-center justify-center p-1 shadow-inner group-hover:border-white/30 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.6)]" />
          </div>
          <div className="leading-tight">
            <span className="font-display font-black text-sm tracking-tight text-[#F5F5F7]">
              LEARNVAULT
            </span>
            <span className="text-[10px] font-mono text-[#9898A0] ml-1.5 font-bold tracking-wider">
              // FIELD 01
            </span>
          </div>
        </div>

        {/* Center: 1,460-Day Macro Progress Scrubber */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#121216]/80 border border-white/[0.09] shadow-inner hover:border-white/20 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#F5F5F7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
            <span>DAY {String(currentDayNumber).padStart(3, '0')} / 1,460</span>
          </div>

          <div className="w-24 bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
            <div 
              className="h-full bg-gradient-to-r from-white to-[#FF5500] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-[#9898A0]">
            <strong className="text-white">{doneSub}/{totalSub}</strong> TOPICS ({overallPercent}%)
          </div>
        </div>

        {/* Right: Date Badge, Sync & Hero "Start Pomodoro" Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-[#121216] border border-white/[0.09] hover:border-white/25 text-[#9898A0] hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm cursor-pointer"
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-[#9898A0]" />
            <span className="hidden xl:inline text-[10px] font-bold">
              {syncState.syncId ? 'SYNC' : 'LINK'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            )}
          </button>

          {/* Date Badge */}
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-[#121216] border border-white/[0.09] text-[11px] font-mono font-bold text-[#F5F5F7] shadow-sm">
            {formattedDate}
          </div>

          {/* Hero Action: Start Pomodoro (Liquid Mercury / Platinum Trigger) */}
          <button
            type="button"
            onClick={onQuickFocus || (() => onSelectScreen('timer'))}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full btn-mercury text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="tracking-wide uppercase font-mono text-[11px] sm:text-xs text-[#050507]">
              Start Pomodoro
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

/* ==========================================================================
   FLOATING MACOS-STYLE GLASS DOCK (SMOKED OBSIDIAN CAPSULE)
   ========================================================================== */
export const FloatingDock: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
      <nav className="glass-dock pointer-events-auto flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`relative px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-white to-[#E0E0E6] text-[#050507] font-black shadow-md'
                  : 'text-[#9898A0] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF5500]' : 'text-current'}`} />
              <span className="hidden sm:inline font-mono tracking-tight text-[11px]">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="dock-active-dot"
                  className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shadow-[0_0_6px_#FF5500]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
