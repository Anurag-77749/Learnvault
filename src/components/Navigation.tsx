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

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen) => void;
  streakCount?: number;
  totalStudyHours?: number;
  onOpenSyncModal?: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'timer', label: 'Timer', icon: TimerIcon },
  { id: 'plan', label: 'Plan', icon: CalendarRange },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', icon: Hourglass },
];

export const DesktopSidebar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  streakCount = 1,
  totalStudyHours = 0,
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
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#060505] border-r border-[rgba(255,240,220,0.06)] p-3.5 select-none overflow-y-auto scrollbar-thin scrollbar-thumb-[#221C1C] shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2.5 mb-3 border-b border-[rgba(255,240,220,0.06)]">
          <div className="w-9 h-9 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.12)] flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
            <img 
              src="/learnvault-logo.png" 
              alt="LearnVault Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-bold tracking-tight text-[#F5F2EB] leading-none">
              Learn<span className="text-champagne font-bold">Vault</span>
            </h1>
            <p className="text-[9px] font-mono text-[#9E958E] mt-1 tracking-wider uppercase font-medium truncate" title="Your Knowledge. Your Progress. Your Future.">
              Your Knowledge • Your Future
            </p>
          </div>
        </div>

        {/* Overall Progress Quick Tracker */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="p-3 rounded-xl bg-[#110E0E] border border-[rgba(255,240,220,0.07)] hover:border-[rgba(212,175,55,0.35)] hover:bg-[#151111] cursor-pointer transition-all mb-3 group shadow-sm"
          title="Click to view full Overall Progress Tracker"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#9E958E] font-medium text-[11px] group-hover:text-[#F5F2EB] transition-colors flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#E5A970]" />
              Overall Progress
            </span>
            <span className="text-champagne font-mono font-bold text-xs">{overallPercent}%</span>
          </div>
          <div className="w-full bg-[#0A0808] h-1.5 rounded-full overflow-hidden border border-[rgba(255,240,220,0.06)]">
            <div 
              className="bg-gradient-to-r from-[#E5A970] via-[#D4AF37] to-[#F6E6C2] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#9E958E] mt-1.5 font-mono">
            <span>{doneSub}/{totalSub} Topics</span>
            <span className="text-[#E5A970] group-hover:underline font-medium font-sans">View Tracker →</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`w-full min-h-[40px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 relative cursor-pointer ${
                  isActive
                    ? 'nav-pill-active font-semibold shadow-sm'
                    : 'text-[#9E958E] hover:text-[#F5F2EB] hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F6E6C2]' : 'text-[#9E958E]'}`} />
                <span className="tracking-wide text-[13px]">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E5A970]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Left-Side Bar: Daily Communication and DSA */}
      <div className="my-3.5">
        <DailyDsaCommunicationWidget />
      </div>

      {/* Royal Bottom Status Card & Cloud Sync */}
      <div className="mt-auto space-y-2">
        {/* Cloud Sync Button */}
        <button
          onClick={onOpenSyncModal}
          className="w-full p-2.5 rounded-xl border border-[rgba(255,240,220,0.07)] bg-[#0C0A0A] hover:border-[rgba(212,175,55,0.35)] hover:bg-[#120F0F] flex items-center justify-between text-xs transition-all group cursor-pointer shadow-sm"
          title="Connect or manage cloud sync across devices"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                syncState.syncId
                  ? syncState.status === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'bg-[#635B55]'
              }`}
            />
            <span className="text-[#9E958E] group-hover:text-[#F5F2EB] font-medium text-[11px] truncate">
              {syncState.syncId ? `Sync: ${syncState.syncId}` : 'Cloud Sync (Link Devices)'}
            </span>
          </div>
          <Cloud className="w-3.5 h-3.5 text-[#E5A970] group-hover:scale-110 transition-transform shrink-0" />
        </button>

        {/* Stats Summary */}
        <div className="p-3 rounded-xl card-obsidian shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#9E958E]">
            <span>Target: Forward Deployed</span>
            <span className="text-champagne font-mono font-bold">Year 1</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-[rgba(255,240,220,0.06)] text-xs">
            <span className="text-[#9E958E]">Daily Streak</span>
            <span className="text-[#F5F2EB] font-bold flex items-center gap-1 font-mono">
              <span className="text-[#E5A970]">🔥</span> <span className="text-champagne">{streakCount}</span> {streakCount === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#9E958E]">Total Studied</span>
            <span className="text-champagne font-mono font-bold text-sm">{totalStudyHours}h</span>
          </div>
          <button
            onClick={() => onSelectScreen('wasted')}
            className="w-full flex items-center justify-between pt-1.5 mt-1 border-t border-[rgba(255,240,220,0.06)] text-xs hover:opacity-85 transition-opacity cursor-pointer text-left"
          >
            <span className="text-[#9E958E] flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-red-400" /> Wasted Days
            </span>
            <span className="text-[#fca5a5] font-mono font-bold flex items-center gap-1">
              <span>{wastedDaysCount}</span> {wastedDaysCount === 1 ? 'day' : 'days'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export const MobileTabBar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060505]/95 backdrop-blur-lg border-t border-[rgba(255,240,220,0.07)] px-1 py-1 safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`flex-1 min-h-[48px] rounded-xl flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isActive ? 'text-[#F6E6C2]' : 'text-[#9E958E] hover:text-[#F5F2EB]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F6E6C2]' : 'text-[#9E958E]'}`} />
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-dot"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#E5A970]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-[#F6E6C2] font-semibold' : 'text-[#9E958E]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
