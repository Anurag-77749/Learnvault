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
 * Executive navigation pills with Dull Orange accent and Light/Dark mode support.
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 relative ${
              isActive
                ? 'btn-shiny-gold text-white font-semibold shadow-sm'
                : 'text-[#8A8A8A] hover:text-[#0A0A0A] hover:bg-black/5 dark:hover:text-white dark:hover:bg-[#0c0c0c] border border-transparent hover:border-gray-300 dark:hover:border-[#222222]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white stroke-[2.2]' : 'text-[#D97736]'}`} />
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
