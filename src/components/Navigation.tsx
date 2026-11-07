import React from 'react';
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  FolderGit2,
  BarChart3,
  Hourglass
} from 'lucide-react';

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
 * TopNavPills:
 * Neo-Brutalist navigation tabs with Dull Matte Lime accents, hard borders & offset shadows.
 */
export const TopNavPills: React.FC<{
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}> = ({
  activeScreen,
  onSelectScreen,
}) => {
  return (
    <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1 px-1" aria-label="Top Navigation">
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border-2 ${
              isActive
                ? 'bg-[#84CC16] text-black border-black shadow-[2px_2px_0px_#000000] scale-[1.02]'
                : 'text-[#9E9E9E] hover:text-white dark:hover:text-white light:text-black border-transparent hover:border-[#333333] hover:bg-[#111111]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black stroke-[3]' : 'text-[#84CC16]'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// Compatibility exports
export const DesktopSidebar = () => null;
export const MobileTabBar = () => null;
export const BottomNavigationBar = () => null;
export const BottomFeaturesSection = () => null;
