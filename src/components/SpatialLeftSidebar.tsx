import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  FolderGit2, 
  BarChart3, 
  Hourglass,
  ArrowRight
} from 'lucide-react';
import { db } from '../services/db';
import { ScreenId } from './Navigation';
import { LearnVaultLogo } from './LearnVaultLogo';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';
import { SpringCounter } from './SpringCounter';

interface SpatialLeftSidebarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  className?: string;
}

const SIDEBAR_NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'timer', label: 'Timer', icon: TimerIcon },
  { id: 'plan', label: 'Plan', icon: CalendarRange },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', icon: Hourglass },
];

export const SpatialLeftSidebar: React.FC<SpatialLeftSidebarProps> = ({
  activeScreen,
  onSelectScreen,
  className = '',
}) => {
  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];

  let totalSub = 0;
  let doneSub = 0;
  curriculumTopics.forEach((t) => {
    totalSub += t.subtopics?.length || 0;
    doneSub += t.subtopics?.filter((s) => s.completed).length || 0;
  });
  // Default to 892 topics if syllabus not fully initialized
  const displayTotal = totalSub > 0 ? totalSub : 892;
  const overallPercent = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

  return (
    <aside className={`w-full lg:w-64 shrink-0 space-y-3.5 bg-[#060505] p-3.5 rounded-2xl border border-[rgba(255,240,220,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_16px_36px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}>
      {/* Brand Header */}
      <div 
        onClick={() => onSelectScreen('today')}
        className="flex items-center gap-3 p-1 cursor-pointer group"
      >
        <LearnVaultLogo size={32} showText={false} />
        <div>
          <h2 className="font-serif-display font-black text-xl text-[#F5F2EB] tracking-tight leading-tight group-hover:text-[#F6E6C2] transition-colors">
            LearnVault
          </h2>
          <p className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
            YOUR KNOWLEDGE. YOUR PROGRESS.
          </p>
        </div>
      </div>

      {/* Overall Progress Widget */}
      <div className="bg-[#0E0C0C] p-3.5 rounded-xl border border-[rgba(255,240,220,0.07)] space-y-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[#D4AF37]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A970] animate-pulse" />
            <span className="font-bold text-[11px] uppercase tracking-wide">Overall Progress</span>
          </div>
          <span className="font-mono font-bold text-[#F5F2EB] text-xs tabular-nums">
            <SpringCounter value={overallPercent} suffix="%" />
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#070606] h-1.5 rounded-full overflow-hidden border border-[rgba(255,240,220,0.06)]">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F6E6C2] to-[#D4AF37] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.35)]"
            style={{ width: `${Math.max(overallPercent, 2)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
          <span className="text-[#9E958E] tabular-nums">
            <SpringCounter value={doneSub} />/{displayTotal} Topics
          </span>
          <button
            type="button"
            onClick={() => onSelectScreen('learn')}
            className="text-[#D4AF37] hover:text-[#F6E6C2] flex items-center gap-1 cursor-pointer font-bold transition-colors"
          >
            <span>View Tracker</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Navigation Pills Stack */}
      <nav className="space-y-1">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          if (isActive) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className="relative w-full py-2.5 px-3.5 rounded-lg bg-[rgba(212,175,55,0.09)] border border-[#D4AF37]/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_12px_rgba(212,175,55,0.06)] flex items-center justify-between cursor-pointer transition-all overflow-hidden"
              >
                {/* 2px vertical champagne gold indicator bar on left edge */}
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r-full bg-gradient-to-b from-[#F6E6C2] to-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                
                <div className="flex items-center gap-3 pl-1">
                  <Icon className="w-4 h-4 text-[#F6E6C2]" />
                  <span className="text-xs font-semibold tracking-wide text-[#F6E6C2]">{item.label}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A970] shadow-[0_0_6px_rgba(229,169,112,0.8)]" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className="w-full py-2.5 px-3.5 rounded-lg text-xs font-sans text-[#9E958E] hover:text-[#F5F2EB] hover:bg-[#120F0F] border border-transparent hover:border-[rgba(255,240,220,0.08)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#635B55] group-hover:text-[#9E958E] transition-colors" />
                <span className="font-medium tracking-wide">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom DSA & Communication Widget */}
      <div className="pt-1">
        <DailyDsaCommunicationWidget />
      </div>
    </aside>
  );
};
