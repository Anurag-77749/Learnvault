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
  Play, 
  Code2, 
  Briefcase, 
  Bookmark,
  Palette
} from 'lucide-react';
import { db } from '../services/db';
import { cloudSyncService, SyncState } from '../services/cloudSyncService';
import { LearnVaultLogo } from './LearnVaultLogo';
import { useTheme } from '../context/ThemeContext';

export type ScreenId = 
  | 'today' 
  | 'timer' 
  | 'plan' 
  | 'learn' 
  | 'dsa' 
  | 'jobs' 
  | 'vault' 
  | 'projects' 
  | 'progress' 
  | 'wasted';

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  streakCount?: number;
  totalStudyHours?: number;
  onOpenSyncModal?: () => void;
  onQuickFocus?: () => void;
}

export const NAV_ITEMS: { id: ScreenId; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', shortLabel: 'Today', icon: Sun },
  { id: 'timer', label: 'Timer', shortLabel: 'Timer', icon: TimerIcon },
  { id: 'plan', label: 'Plan', shortLabel: 'Plan', icon: CalendarRange },
  { id: 'learn', label: 'Curriculum', shortLabel: 'Curriculum', icon: BookOpen },
  { id: 'dsa', label: 'DSA Lab', shortLabel: 'DSA', icon: Code2 },
  { id: 'jobs', label: 'Career HQ', shortLabel: 'Jobs', icon: Briefcase },
  { id: 'vault', label: 'Vault', shortLabel: 'Vault', icon: Bookmark },
  { id: 'projects', label: 'Projects', shortLabel: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Analytics', shortLabel: 'Stats', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', shortLabel: 'Wasted', icon: Hourglass },
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
  const { theme, cycleTheme, themeConfig } = useTheme();
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

  const currentNav = NAV_ITEMS.find((item) => item.id === activeScreen);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080A]/85 backdrop-blur-2xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5 select-none">
      <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Minimalist Hardware Mark & Active Domain Pill */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            title="Scroll to Coverpage"
          >
            <LearnVaultLogo size={28} showText={true} badge="// OS 2.0" />
          </div>

          {/* Active Domain Indicator Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono uppercase text-[#9898A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span className="text-white font-bold">{currentNav?.label || 'Cover'}</span>
          </div>
        </div>

        {/* Center: High-Density Macro Progress Scrubber */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#121216]/80 border border-white/[0.09] shadow-inner hover:border-white/20 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#F5F5F7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
            <span>DAY {String(currentDayNumber).padStart(3, '0')} / 1,460</span>
          </div>

          <div className="w-20 bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
            <div 
              className="h-full bg-gradient-to-r from-white to-[#FF5500] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-[#9898A0]">
            <strong className="text-white">{doneSub}/{totalSub}</strong> TOPICS ({overallPercent}%)
          </div>
        </div>

        {/* Right: Theme Switcher, Cloud Sync, Date Badge & Start Focus */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Aesthetic Color Theme Cycler */}
          <button
            onClick={cycleTheme}
            className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] flex items-center gap-1.5 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm"
            title={`Current Theme: ${themeConfig.name}. Click to switch theme.`}
          >
            <span 
              className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
              style={{ backgroundColor: themeConfig.accentColor, color: themeConfig.accentColor }} 
            />
            <span className="hidden sm:inline uppercase text-white tracking-wider">
              {themeConfig.name}
            </span>
          </button>

          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[#121216] border border-white/[0.09] hover:border-white/25 text-[#9898A0] hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm cursor-pointer"
            title="Cloud Sync"
          >
            <Cloud className="w-3 h-3 text-[#9898A0]" />
            <span className="hidden xl:inline text-[9px] font-bold">
              {syncState.syncId ? 'SYNC' : 'LINK'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            )}
          </button>

          {/* Date Badge */}
          <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-[#121216] border border-white/[0.09] text-[10px] font-mono font-bold text-[#F5F5F7] shadow-sm">
            {formattedDate}
          </div>

          {/* Hero Action: Start Pomodoro (Liquid Mercury / Platinum Trigger) */}
          <button
            type="button"
            onClick={onQuickFocus || (() => onSelectScreen('timer'))}
            className="px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full btn-mercury text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-3 h-3 fill-current text-[#050507]" />
            <span className="tracking-wide uppercase font-mono text-[10px] sm:text-[11px] text-[#050507]">
              Start Focus
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

/* ==========================================================================
   FLOATING MACOS-STYLE GLASS DOCK (SMOKED OBSIDIAN CAPSULE - CONTINUOUS SCROLL)
   ========================================================================== */
export const FloatingDock: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-2 sm:px-4">
      <nav className="glass-dock pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 max-w-full overflow-x-auto no-scrollbar shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              title={item.label}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-b from-white to-[#E0E0E6] text-[#050507] font-black shadow-md'
                  : 'text-[#9898A0] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF5500]' : 'text-current'}`} />
              <span className="hidden md:inline font-mono tracking-tight text-[10px] uppercase font-bold">{item.shortLabel}</span>
              {isActive && (
                <motion.span
                  layoutId="dock-active-dot"
                  className="w-1 h-1 rounded-full bg-[#FF5500] shadow-[0_0_4px_#FF5500]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
