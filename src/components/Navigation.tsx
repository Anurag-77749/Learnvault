import React from 'react';
import { motion } from 'framer-motion';
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
 * Renders the navigation features directly inside the top header space.
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 relative ${
              isActive
                ? 'btn-shiny-gold text-black font-bold shadow-md shadow-[#D4AF37]/30 scale-[1.02]'
                : 'text-[#B8B0AA] hover:text-white hover:bg-[#160406] border border-transparent hover:border-[#360A0F]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black stroke-[2.5]' : 'text-[#D4AF37]'}`} />
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
