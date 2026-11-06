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
    <aside className={`w-full lg:w-64 shrink-0 space-y-4 ${className}`}>
      {/* Brand Header */}
      <div 
        onClick={() => onSelectScreen('today')}
        className="flex items-center gap-3 p-1 cursor-pointer group"
      >
        <LearnVaultLogo size={34} showText={false} />
        <div>
          <h2 className="font-serif-display font-black text-xl text-white tracking-tight leading-tight group-hover:text-[#F9D976] transition-colors">
            LearnVault
          </h2>
          <p className="text-[9px] font-mono tracking-widest text-[#E5B84B] uppercase font-bold">
            YOUR KNOWLEDGE. YOUR PROGRESS.
          </p>
        </div>
      </div>

      {/* Overall Progress Widget */}
      <div className="crimson-glass p-4 rounded-2xl border border-[#E5B84B]/20 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[#D4AF37]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B84B] animate-pulse" />
            <span className="font-bold">Overall Progress</span>
          </div>
          <span className="font-mono font-bold text-white text-xs">
            <SpringCounter value={overallPercent} suffix="%" />
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#120305] h-1.5 rounded-full overflow-hidden border border-[#E5B84B]/20">
          <div
            className="h-full bg-gradient-to-r from-[#E5B84B] to-[#F9D976] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(229,184,75,0.4)]"
            style={{ width: `${Math.max(overallPercent, 2)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
          <span className="text-[#A89279]">
            <SpringCounter value={doneSub} />/{displayTotal} Topics
          </span>
          <button
            type="button"
            onClick={() => onSelectScreen('learn')}
            className="text-[#F9D976] hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            <span>View Tracker</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Navigation Pills Stack */}
      <nav className="space-y-1.5">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          if (isActive) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className="w-full py-2.5 px-4 rounded-xl btn-liquid-gold text-xs font-black flex items-center justify-between cursor-pointer shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-black" />
                  <span className="tracking-wide uppercase font-bold text-black">{item.label}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-black shadow-sm" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-mono text-[#BFA997] hover:text-white hover:bg-[#1A060A]/80 border border-transparent hover:border-[#E5B84B]/20 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#887060]" />
                <span className="font-medium tracking-wide">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom DSA & Communication Widget */}
      <div className="pt-2">
        <DailyDsaCommunicationWidget />
      </div>
    </aside>
  );
};
