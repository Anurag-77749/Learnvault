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
  Sparkles
} from 'lucide-react';
import { db } from '../services/db';
import { cloudSyncService, SyncState } from '../services/cloudSyncService';
import { LearnVaultLogo } from './LearnVaultLogo';

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
  { id: 'learn', label: 'Curriculum', shortLabel: 'Learn', icon: BookOpen },
  { id: 'dsa', label: 'DSA Lab', shortLabel: 'DSA', icon: Code2 },
  { id: 'jobs', label: 'Career HQ', shortLabel: 'Jobs', icon: Briefcase },
  { id: 'vault', label: 'Vault', shortLabel: 'Vault', icon: Bookmark },
  { id: 'projects', label: 'Projects', shortLabel: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Analytics', shortLabel: 'Stats', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', shortLabel: 'Wasted', icon: Hourglass },
];

/* ==========================================================================
   TOP MINIMALIST HUD BAR (OBSIDIAN VOID & BRUSHED METALLIC GOLD)
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
  const displayTotal = totalSub > 0 ? totalSub : 892;
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
    <header className="sticky top-0 z-40 w-full bg-[#080304]/90 backdrop-blur-2xl border-b border-[#E5B84B]/20 transition-colors duration-300 px-3 sm:px-6 py-2.5 select-none">
      <div className="max-w-[1560px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Minimalist Hardware Mark & Active Domain Pill */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            title="Scroll to Chronometer Hero"
          >
            <LearnVaultLogo size={28} showText={true} badge="// VAULT 2.0" />
          </div>

          {/* Active Domain Indicator Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180509]/80 border border-[#E5B84B]/25 text-[10px] font-mono uppercase text-[#F9D976]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B84B] animate-pulse" />
            <span className="text-white font-bold">{currentNav?.label || 'Cover'}</span>
          </div>
        </div>

        {/* Center: High-Density Macro Progress Scrubber */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#140407]/90 border border-[#E5B84B]/25 shadow-inner hover:border-[#E5B84B]/50 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#F9D976]">
            <Sparkles className="w-3 h-3 text-[#E5B84B] animate-pulse" />
            <span>DAY {String(currentDayNumber).padStart(3, '0')} / 1,460</span>
          </div>

          <div className="w-24 bg-[#080304] h-1.5 rounded-full overflow-hidden border border-[#E5B84B]/20">
            <div 
              className="h-full bg-gradient-to-r from-[#E5B84B] to-[#F9D976] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(229,184,75,0.4)]"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>

          <div className="text-[10px] font-mono text-[#BFA997]">
            <strong className="text-white">{doneSub}/{displayTotal}</strong> TOPICS ({overallPercent}%)
          </div>
        </div>

        {/* Right: Cloud Sync, Date Badge & Start Focus */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[#140407]/80 border border-[#E5B84B]/25 hover:border-[#E5B84B]/50 text-[#BFA997] hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono shadow-sm cursor-pointer"
            title="Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-[#E5B84B]" />
            <span className="hidden xl:inline text-[9px] font-bold">
              {syncState.syncId ? 'SYNCED' : 'BACKUP'}
            </span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B84B] shadow-[0_0_6px_#E5B84B]" />
            )}
          </button>

          {/* Date Badge */}
          <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-[#140407]/80 border border-[#E5B84B]/20 text-[10px] font-mono font-bold text-[#F9D976] shadow-sm">
            {formattedDate}
          </div>

          {/* Hero Action: Start Pomodoro (Liquid Gold Shimmer Trigger) */}
          <button
            type="button"
            onClick={onQuickFocus || (() => onSelectScreen('timer'))}
            className="px-4 py-1.5 rounded-full btn-liquid-gold text-xs font-black flex items-center gap-2 cursor-pointer shadow-md pulse-gold"
          >
            <Play className="w-3 h-3 fill-current text-black" />
            <span className="tracking-wide uppercase font-mono text-[11px] text-black">
              Start Focus
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

/* ==========================================================================
   FLOATING MACOS-STYLE GLASS DOCK (CRIMSON GLASS & LIQUID GOLD INDICATORS)
   ========================================================================== */
export const FloatingDock: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-2 sm:px-4">
      <nav className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 max-w-full overflow-x-auto no-scrollbar rounded-full bg-[#180509]/90 backdrop-blur-2xl border border-[#E5B84B]/30 shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(229,184,75,0.15)]">
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
                  ? 'btn-liquid-gold text-black font-black shadow-md'
                  : 'text-[#BFA997] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-current'}`} />
              <span className="hidden md:inline font-mono tracking-tight text-[10px] uppercase font-bold">{item.shortLabel}</span>
              {isActive && (
                <motion.span
                  layoutId="dock-active-dot"
                  className="w-1 h-1 rounded-full bg-black shadow-sm"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
