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
  Target,
  Cloud
} from 'lucide-react';
import { db } from '../services/db';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';
import { cloudSyncService, SyncState } from '../services/cloudSyncService';

export type ScreenId = 'today' | 'timer' | 'plan' | 'learn' | 'projects' | 'progress' | 'wasted';

export interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  streakCount?: number;
  totalStudyHours?: number;
  onOpenSyncModal?: () => void;
}

export const NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'timer', label: 'Timer', icon: TimerIcon },
  { id: 'plan', label: 'Plan', icon: CalendarRange },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', icon: Hourglass },
];

/**
 * BottomFeaturesSection:
 * Positions all former left-sidebar features (Overall Progress, Daily DSA & Communication, Stats, Cloud Sync)
 * elegantly at the bottom of the page in a clean responsive grid.
 */
export const BottomFeaturesSection: React.FC<{
  onSelectScreen: (screen: ScreenId) => void;
  streakCount: number;
  totalStudyHours: number;
  onOpenSyncModal: () => void;
}> = ({
  onSelectScreen,
  streakCount,
  totalStudyHours,
  onOpenSyncModal,
}) => {
  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];
  const wastedDaysCount = useLiveQuery(() => db.wastedDays.count()) || 0;
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

  return (
    <section className="mt-12 pt-8 border-t border-[#360A0F] space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            Control Hub & Progress
          </h3>
          <p className="text-xs text-[#B8B0AA] mt-0.5">
            Core tracking, DSA practice and accountability
          </p>
        </div>
        <span className="text-[11px] text-shiny-gold font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#160406] border border-[#360A0F]">
          LearnVault Hub
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Overall Progress Tracker */}
        <div 
          onClick={() => {
            onSelectScreen('progress');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="p-4 rounded-2xl bg-[#160406] border border-[#360A0F] hover:border-[#D4AF37]/60 cursor-pointer transition-all group shadow-sm flex flex-col justify-between"
          title="Click to view full Overall Progress Tracker"
        >
          <div>
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="text-[#B8B0AA] font-semibold text-xs group-hover:text-white transition-colors flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#D4AF37]" />
                Overall Progress
              </span>
              <span className="text-shiny-gold font-bold text-sm">{overallPercent}%</span>
            </div>
            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-[#360A0F]">
              <div 
                className="bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] h-full rounded-full transition-all duration-500 shadow-sm shadow-[#D4AF37]/30"
                style={{ width: `${Math.max(overallPercent, 2)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#B8B0AA]/90 mt-3">
              <span>{doneSub}/{totalSub} Topics Completed</span>
              <span className="text-shiny-gold group-hover:underline font-semibold">View Full Tracker →</span>
            </div>
          </div>
        </div>

        {/* 2. Daily Communication & DSA Widget */}
        <div className="flex flex-col justify-between">
          <DailyDsaCommunicationWidget />
        </div>

        {/* 3. Stats Summary & Cloud Sync */}
        <div className="space-y-2 flex flex-col justify-between">
          <div className="p-4 rounded-2xl card-maroon-gold shadow-lg flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#B8B0AA] mb-2 font-sans">
              <span>Target: Forward Deployed</span>
              <span className="text-shiny-gold font-bold">Year 1</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#360A0F] text-xs">
              <span className="text-[#B8B0AA]">Daily Streak</span>
              <span className="text-white font-bold flex items-center gap-1">
                <span className="text-[#D4AF37]">🔥</span> <span className="text-shiny-gold">{streakCount}</span> {streakCount === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 text-xs">
              <span className="text-[#B8B0AA]">Total Studied</span>
              <span className="text-shiny-gold font-bold text-sm">{totalStudyHours}h</span>
            </div>
            <button
              onClick={() => {
                onSelectScreen('wasted');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-between pt-2 mt-1.5 border-t border-[#4A101D] text-xs hover:opacity-85 transition-opacity cursor-pointer text-left"
            >
              <span className="text-[#B8B0AA] flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-red-400" /> Wasted Days
              </span>
              <span className="text-red-400 font-bold flex items-center gap-1">
                <span>{wastedDaysCount}</span> {wastedDaysCount === 1 ? 'day' : 'days'}
              </span>
            </button>
          </div>

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenSyncModal}
            className="w-full p-2.5 rounded-xl border border-[#360A0F] bg-[#120306] hover:border-[#D4AF37]/60 flex items-center justify-between text-xs transition-colors group cursor-pointer shadow-sm"
            title="Connect or manage cloud sync across devices"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  syncState.syncId
                    ? syncState.status === 'syncing'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-[#B8B0AA] group-hover:text-white font-medium text-[11px] truncate">
                {syncState.syncId ? `Sync: ${syncState.syncId}` : 'Cloud Sync (Link Phone)'}
              </span>
            </div>
            <Cloud className="w-4 h-4 text-shiny-gold group-hover:scale-110 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * BottomNavigationBar:
 * High-performance, persistent bottom bar for all devices (desktop and mobile).
 */
export const BottomNavigationBar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#000000]/95 backdrop-blur-md border-t border-[#360A0F] px-2 py-2 safe-area-pb select-none"
      aria-label="Navigation"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectScreen(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 min-h-[46px] sm:min-h-[48px] px-1.5 sm:px-3 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative cursor-pointer ${
                isActive
                  ? 'btn-shiny-gold text-black font-bold shadow-md shadow-[#D4AF37]/30 scale-[1.02]'
                  : 'text-[#B8B0AA] hover:text-white hover:bg-[#160406]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-black stroke-[2.5]' : 'text-[#D4AF37]'}`} />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active-dot"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-black hidden sm:block"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] sm:text-xs mt-0.5 tracking-tight ${isActive ? 'text-black font-bold' : 'text-[#B8B0AA] font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Aliases for compatibility
export const DesktopSidebar = BottomNavigationBar;
export const MobileTabBar = BottomNavigationBar;
