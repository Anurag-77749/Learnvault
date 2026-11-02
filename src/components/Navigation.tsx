import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  FolderGit2,
  BarChart3,
  Hourglass,
  Crown,
  Code2,
  Target
} from 'lucide-react';
import { db } from '../services/db';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';

export type ScreenId = 'today' | 'timer' | 'plan' | 'learn' | 'projects' | 'progress' | 'wasted';

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  streakCount?: number;
  totalStudyHours?: number;
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
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-[#000000] border-r border-[#360A0F] p-4 select-none overflow-y-auto scrollbar-thin scrollbar-thumb-[#360A0F] shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-3 border-b border-[#360A0F]">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#D4AF37]/50 flex items-center justify-center p-0.5 shadow-md shadow-[#D4AF37]/20 overflow-hidden shrink-0">
            <img 
              src="/learnvault-logo.png" 
              alt="LearnVault Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-bold tracking-wide text-white leading-none">
              Learn<span className="text-shiny-gold">Vault</span>
            </h1>
            <p className="text-[8.5px] font-sans text-[#B8B0AA] mt-1 tracking-wider uppercase font-semibold truncate" title="Your Knowledge. Your Progress. Your Future.">
              Your Knowledge. Your Progress.
            </p>
          </div>
        </div>

        {/* Overall Progress Quick Tracker */}
        <div 
          onClick={() => onSelectScreen('progress')}
          className="p-3 rounded-2xl bg-[#160406] border border-[#360A0F] hover:border-[#D4AF37]/60 cursor-pointer transition-all mb-3.5 group shadow-sm"
          title="Click to view full Overall Progress Tracker"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#B8B0AA] font-semibold text-[11px] group-hover:text-white transition-colors flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
              Overall Progress
            </span>
            <span className="text-shiny-gold font-bold text-xs">{overallPercent}%</span>
          </div>
          <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-[#360A0F]">
            <div 
              className="bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] h-full rounded-full transition-all duration-500 shadow-sm shadow-[#D4AF37]/30"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#B8B0AA]/80 mt-1.5 font-sans">
            <span>{doneSub}/{totalSub} Topics</span>
            <span className="text-shiny-gold group-hover:underline font-semibold">View Tracker →</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                  isActive
                    ? 'btn-shiny-gold text-black font-bold shadow-lg shadow-[#D4AF37]/30'
                    : 'text-[#B8B0AA] hover:text-white hover:bg-[#160406] border border-transparent hover:border-[#360A0F]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.5]' : 'text-[#D4AF37]'}`} />
                <span className="tracking-wide">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill-modern"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-black"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Left-Side Bar: Daily Communication and DSA */}
      <div className="my-4">
        <DailyDsaCommunicationWidget />
      </div>

      {/* Royal Bottom Status Card */}
      <div className="p-3.5 rounded-2xl card-maroon-gold mt-auto shadow-lg">
        <div className="flex items-center justify-between text-xs text-[#B8B0AA] mb-1.5 font-sans">
          <span>Target: Forward Deployed</span>
          <span className="text-shiny-gold font-bold">Year 1</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-[#360A0F] text-xs">
          <span className="text-[#B8B0AA]">Daily Streak</span>
          <span className="text-white font-bold flex items-center gap-1">
            <span className="text-[#D4AF37]">🔥</span> <span className="text-shiny-gold">{streakCount}</span> {streakCount === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[#B8B0AA]">Total Studied</span>
          <span className="text-shiny-gold font-bold text-sm">{totalStudyHours}h</span>
        </div>
        <button
          onClick={() => onSelectScreen('wasted')}
          className="w-full flex items-center justify-between pt-1.5 mt-1 border-t border-[#4A101D] text-xs hover:opacity-85 transition-opacity cursor-pointer text-left"
        >
          <span className="text-[#B8B0AA] flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-red-400" /> Wasted Days
          </span>
          <span className="text-red-400 font-bold flex items-center gap-1">
            <span>{wastedDaysCount}</span> {wastedDaysCount === 1 ? 'day' : 'days'}
          </span>
        </button>
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-[#360A0F] px-1 py-1 safe-area-pb"
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
              className={`flex-1 min-h-[48px] rounded-xl flex flex-col items-center justify-center py-1 transition-colors relative ${
                isActive ? 'text-[#FFDF73]' : 'text-[#B8B0AA] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFDF73]' : 'text-[#B8B0AA]'}`} />
                {isActive && (
                  <motion.div
                    layoutId="active-dot-modern"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-[#FFDF73] font-bold' : 'text-[#B8B0AA]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
