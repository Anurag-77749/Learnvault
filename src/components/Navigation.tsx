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
  Cloud,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { db } from '../services/db';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';
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
   TOP FLOATING GLASS NAVBAR (NOVA SIGNATURE HEADER)
   ========================================================================== */
export const TopNavBar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  streakCount = 1,
  totalStudyHours = 0,
  onOpenSyncModal,
  onQuickFocus,
}) => {
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getState());

  useEffect(() => {
    return cloudSyncService.subscribe((state) => setSyncState(state));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 select-none backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div 
          onClick={() => onSelectScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform overflow-hidden">
            <img 
              src="/learnvault-logo.png" 
              alt="LearnVault" 
              className="w-full h-full object-contain filter brightness-110"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-blue-600 font-bold text-sm">✦</span>
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                Learn<span className="text-nova-gradient font-black">Vault</span>
              </span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:block">
              Build • Innovate • Grow
            </p>
          </div>
        </div>

        {/* Center: Frosted Glass Pill Capsule Nav (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-capsule"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md shadow-blue-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Status Pills & Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cloud Sync Button */}
          <button
            onClick={onOpenSyncModal}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 hover:border-blue-400 text-xs text-slate-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Link Devices via Cloud Sync"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline font-medium text-[11px]">
              {syncState.syncId ? 'Synced' : 'Link Phone'}
            </span>
            {syncState.syncId && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Daily Streak Badge */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 font-mono text-xs font-bold shadow-sm">
            <span>🔥</span>
            <span>{streakCount}d</span>
          </div>

          {/* Hours Badge */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 font-mono text-xs font-bold shadow-sm">
            <span>{totalStudyHours}h</span>
          </div>

          {/* Hero Action Button: "Start Focus →" */}
          <button
            onClick={() => {
              if (onQuickFocus) onQuickFocus();
              else onSelectScreen('timer');
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full btn-nova-primary text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <span>Start Focus</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};

/* Compatibility sidebar export */
export const DesktopSidebar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  streakCount = 1,
  totalStudyHours = 0,
  onOpenSyncModal,
}) => {
  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];
  const wastedDaysCount = useLiveQuery(() => db.wastedDays.count()) || 0;

  let totalSub = 0;
  let doneSub = 0;
  curriculumTopics.forEach((t) => {
    totalSub += t.subtopics?.length || 0;
    doneSub += t.subtopics?.filter((s) => s.completed).length || 0;
  });
  const overallPercent = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

  return (
    <aside className="hidden xl:flex flex-col w-64 p-4 select-none shrink-0 space-y-4">
      {/* Quick Tracker Card */}
      <div 
        onClick={() => onSelectScreen('progress')}
        className="p-4 rounded-3xl card-glass cursor-pointer group shadow-sm hover:scale-[1.01]"
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            Curriculum Progress
          </span>
          <span className="font-mono font-bold text-indigo-600 text-sm">{overallPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(overallPercent, 2)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
          <span>{doneSub}/{totalSub} Topics</span>
          <span className="text-blue-600 font-sans font-semibold group-hover:underline">View →</span>
        </div>
      </div>

      {/* Daily Communication and DSA in sidebar */}
      <DailyDsaCommunicationWidget />
    </aside>
  );
};

/* Mobile Bottom Tab Bar */
export const MobileTabBar: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <nav 
      className="lg:hidden fixed bottom-3 left-4 right-4 z-40 bg-white/85 backdrop-blur-xl border border-white/90 rounded-full px-2 py-1 shadow-[0_10px_35px_rgba(0,0,0,0.12)] safe-area-pb"
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
              className={`flex-1 min-h-[46px] rounded-full flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer ${
                isActive ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-dot"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[9px] mt-0.5 ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
