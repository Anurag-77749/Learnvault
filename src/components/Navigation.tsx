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
   TOP MINIMALIST HUD BAR (SWISS ALABASTER & BRUSHED TITANIUM)
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
    <header className="sticky top-0 z-30 w-full bg-[#F4F2EE]/90 backdrop-blur-xl border-b border-[#E6E3DC] px-4 sm:px-8 py-3 select-none">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Minimalist Geometric Logo Mark */}
        <div 
          onClick={() => onSelectScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-[#111110] flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4F00] shadow-sm" />
          </div>
          <div className="leading-tight">
            <span className="font-display font-extrabold text-sm tracking-tight text-[#111110]">
              LEARNVAULT
            </span>
            <span className="text-[10px] font-mono text-[#FF4F00] ml-1.5 font-bold">
              // OS 2.0
            </span>
          </div>
        </div>

        {/* Center: 1,460-Day Macro Progress Scrubber */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#E6E3DC] shadow-sm hover:border-[#D8D4CC] cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#111110]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00] animate-pulse" />
            <span>DAY {String(currentDayNumber).padStart(3, '0')} / 1,460</span>
          </div>

          <div className="w-24 bg-[#EFECE6] h-1.5 rounded-full overflow-hidden border border-[#E6E3DC]">
            <div 
              className="h-full bg-[#FF4F00] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-[#68645E]">
            <strong className="text-[#111110]">{doneSub}/{totalSub}</strong> TOPICS ({overallPercent}%)
          </div>
        </div>

        {/* Right: Date Badge, Sync & Hero "Start Pomodoro" Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-white border border-[#E6E3DC] hover:border-[#D8D4CC] text-[#68645E] hover:text-[#111110] transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm cursor-pointer"
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-[#68645E]" />
            <span className="hidden xl:inline text-[10px] font-bold">
              {syncState.syncId ? 'SYNC' : 'LINK'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            )}
          </button>

          {/* Date Badge */}
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-white border border-[#E6E3DC] text-[11px] font-mono font-bold text-[#111110] shadow-sm">
            {formattedDate}
          </div>

          {/* Hero Action: Start Pomodoro (International Aerospace Orange) */}
          <button
            type="button"
            onClick={onQuickFocus || (() => onSelectScreen('timer'))}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full btn-orange text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="tracking-wide uppercase font-mono text-[11px] sm:text-xs">
              Start Pomodoro
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

/* ==========================================================================
   FLOATING MACOS-STYLE GLASS DOCK (OBSIDIAN TRANSLUCENT)
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
                  ? 'bg-white text-[#111110] font-bold shadow-md'
                  : 'text-[#A39E93] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF4F00]' : 'text-current'}`} />
              <span className="hidden sm:inline font-mono tracking-tight text-[11px]">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="dock-active-dot"
                  className="w-1.5 h-1.5 rounded-full bg-[#FF4F00]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
