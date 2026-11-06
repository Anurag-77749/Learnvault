import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Terminal, 
  Clock, 
  Calendar, 
  BookOpen, 
  GitBranch,
  Activity,
  AlertTriangle,
  Cloud,
  Play
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

export const NAV_ITEMS: { id: ScreenId; label: string; code: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'TODAY', code: '01', icon: Terminal },
  { id: 'timer', label: 'TIMER', code: '02', icon: Clock },
  { id: 'plan', label: 'PLAN', code: '03', icon: Calendar },
  { id: 'learn', label: 'CURRICULUM', code: '04', icon: BookOpen },
  { id: 'projects', label: 'PROJECTS', code: '05', icon: GitBranch },
  { id: 'progress', label: 'ANALYTICS', code: '06', icon: Activity },
  { id: 'wasted', label: 'WASTED', code: '07', icon: AlertTriangle },
];

/* ==========================================================================
   TERMINAL HUD TOP BAR (CYBERPUNK HIGH-DENSITY NAVIGATION)
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
    <header className="sticky top-0 z-40 w-full bg-[#050A0D]/95 backdrop-blur-md border-b border-[#00F0FF]/20 px-3 sm:px-6 py-2 select-none">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-3">
        {/* Brand Terminal Identification */}
        <div 
          onClick={() => onSelectScreen('today')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded bg-[#09151B] border border-[#00FF9D]/60 flex items-center justify-center p-1 shadow-[0_0_10px_rgba(0,255,157,0.25)]">
            <Terminal className="w-4 h-4 text-[#00FF9D]" />
          </div>
          <div className="font-mono">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-black tracking-wider text-white">LEARN<span className="text-[#00F0FF]">VAULT</span></span>
              <span className="text-[10px] text-[#00FF9D] font-bold animate-pulse">//SYS_ONLINE</span>
            </div>
            <p className="text-[9px] text-[#5A7E8D] tracking-widest uppercase mt-0.5 hidden sm:block">
              FDE PROTOCOL [1,460D]
            </p>
          </div>
        </div>

        {/* Center: Monospace Segmented HUD Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#04080A] p-1 rounded border border-[#00F0FF]/15">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`relative px-3 py-1.5 rounded text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'nav-tab-active font-bold text-[#00F0FF]'
                    : 'text-[#6B8E9E] hover:text-[#D4ECF4] hover:bg-[#0A161D]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00F0FF]' : 'text-[#486877]'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] shadow-[0_0_6px_#00FF9D]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Telemetry Telemetry Status Chips */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          {/* Cloud Sync */}
          <button
            onClick={onOpenSyncModal}
            className="px-2.5 py-1 rounded bg-[#071116] border border-[#00F0FF]/25 hover:border-[#00F0FF] text-[10px] text-[#6B8E9E] hover:text-[#00F0FF] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Link Devices via Cloud Sync"
          >
            <Cloud className="w-3 h-3 text-[#00F0FF]" />
            <span className="hidden xl:inline">{syncState.syncId ? 'SYNC:OK' : 'SYNC:LINK'}</span>
            {syncState.syncId && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] shadow-[0_0_4px_#00FF9D]" />
            )}
          </button>

          {/* Daily Streak */}
          <div className="px-2 py-1 rounded bg-[#0E160D] border border-[#00FF9D]/30 text-[#00FF9D] text-[11px] font-bold flex items-center gap-1">
            <span>🔥</span>
            <span>{streakCount}D</span>
          </div>

          {/* Total Study Hours */}
          <div className="px-2 py-1 rounded bg-[#09151C] border border-[#00F0FF]/30 text-[#00F0FF] text-[11px] font-bold">
            <span>{totalStudyHours}H</span>
          </div>

          {/* Quick Action Button: EXEC FOCUS */}
          <button
            onClick={() => {
              if (onQuickFocus) onQuickFocus();
              else onSelectScreen('timer');
            }}
            className="px-3 py-1 rounded btn-cyber-primary text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-3 h-3 fill-current stroke-[2]" />
            <span>FOCUS</span>
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
}) => {
  return (
    <aside className="hidden" aria-hidden="true">
      {/* Handled by high-density Bento Grid HUD */}
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#04080A]/95 backdrop-blur-md border-t border-[#00F0FF]/25 px-1 py-1 safe-area-pb font-mono"
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
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 transition-all relative cursor-pointer ${
                isActive ? 'text-[#00F0FF] font-bold' : 'text-[#486877] hover:text-[#D4ECF4]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00F0FF]' : 'text-[#486877]'}`} />
              <span className={`text-[9px] mt-0.5 tracking-wider ${isActive ? 'text-[#00F0FF]' : 'text-[#486877]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
