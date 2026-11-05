import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  RotateCw,
  Sun,
  Timer as TimerIcon,
  CalendarRange,
  BookOpen,
  FolderGit2,
  BarChart3,
  Sparkles,
  Cloud,
  Flame,
  Hourglass,
  SlidersHorizontal
} from 'lucide-react';
import { ScreenId } from './Navigation';
import { TodayScreen } from './TodayScreen';
import { TimerScreen } from './TimerScreen';
import { PlanScreen } from './PlanScreen';
import { LearnScreen } from './LearnScreen';
import { ProjectsScreen } from './ProjectsScreen';
import { ProgressScreen } from './ProgressScreen';
import { SyncState } from '../services/cloudSyncService';

interface Cylindrical3DDisplayProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  streakCount: number;
  totalStudyHours: number;
  wastedDaysCount: number;
  syncState: SyncState;
  onOpenSyncModal: () => void;
  onStartTimerWithTopic: (topicTitle?: string) => void;
}

interface PanelDef {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
}

const PANELS: PanelDef[] = [
  { id: 'today', label: 'Today', icon: Sun, tagline: "Today's Mission & Goals" },
  { id: 'timer', label: 'Timer', icon: TimerIcon, tagline: 'Focus Session & Pomodoro' },
  { id: 'plan', label: 'Plan', icon: CalendarRange, tagline: '4-Year Timeline Architecture' },
  { id: 'learn', label: 'Learn', icon: BookOpen, tagline: 'FDE 10-Track Curriculum' },
  { id: 'projects', label: 'Projects', icon: FolderGit2, tagline: 'Engineering Portfolios' },
  { id: 'progress', label: 'Progress', icon: BarChart3, tagline: 'Analytics & Mastery' },
];

export const Cylindrical3DDisplay: React.FC<Cylindrical3DDisplayProps> = ({
  activeScreen,
  onSelectScreen,
  streakCount,
  totalStudyHours,
  wastedDaysCount,
  syncState,
  onOpenSyncModal,
  onStartTimerWithTopic,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Compute 3D geometry
  const panelWidth = isMobile ? Math.min(windowWidth - 32, 360) : isTablet ? 680 : 860;
  const panelHeight = isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 210px)';
  const radius = Math.round((panelWidth / 2) / Math.tan(Math.PI / 6)) + (isMobile ? 18 : 35);

  const activeIndex = Math.max(0, PANELS.findIndex((p) => p.id === activeScreen));
  const [rotationAngle, setRotationAngle] = useState(-activeIndex * 60);

  // Keep rotation synchronized when activeScreen changes externally
  useEffect(() => {
    setRotationAngle(-activeIndex * 60);
  }, [activeIndex]);

  // Rotate helper
  const handleRotateToIndex = useCallback((index: number) => {
    const safeIndex = ((index % 6) + 6) % 6;
    onSelectScreen(PANELS[safeIndex].id);
    setRotationAngle(-safeIndex * 60);
  }, [onSelectScreen]);

  const handlePrev = () => handleRotateToIndex(activeIndex - 1);
  const handleNext = () => handleRotateToIndex(activeIndex + 1);

  // Drag / Swipe handling
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);

  const handleDragStart = (clientX: number) => {
    if (isFocused) return;
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartAngle.current = rotationAngle;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || isFocused) return;
    const deltaX = clientX - dragStartX.current;
    // Map pixels to rotation degrees
    const sensitivity = isMobile ? 0.35 : 0.22;
    setRotationAngle(dragStartAngle.current + deltaX * sensitivity);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest 60-degree face
    const snapFace = Math.round(-rotationAngle / 60);
    const normalizedIndex = ((snapFace % 6) + 6) % 6;
    handleRotateToIndex(normalizedIndex);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-[#F8FAFC] via-[#EDF2FB] to-[#DFE7F6] text-[#0F172A]">
      
      {/* 1. FLOATING 3D GLASS HEADER (Identical to reference Nova bar) */}
      <header className="relative z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-xl bg-white/70 border-b border-white/80 shadow-[0_4px_25px_rgba(79,70,229,0.06)]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] p-0.5 shadow-md shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-[#0F172A] leading-none">
                Learn<span className="text-[#3B82F6]">Vault</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5]">
                3D Studio
              </span>
            </div>
            <p className="text-[9px] font-sans text-[#64748B] font-semibold tracking-wider uppercase mt-0.5 hidden sm:block">
              Your Knowledge • Your Progress
            </p>
          </div>
        </div>

        {/* Center Screen Navigator Pills */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/80 border border-white/90 shadow-sm backdrop-blur-md">
          {PANELS.map((panel, idx) => {
            const Icon = panel.icon;
            const isActive = activeScreen === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => handleRotateToIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{panel.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Stats & View Modes */}
        <div className="flex items-center gap-2 text-xs">
          {/* Cloud Sync */}
          <button
            onClick={onOpenSyncModal}
            className="p-1.5 rounded-xl bg-white/90 border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center cursor-pointer shadow-sm relative transition-all"
            title="Cloud Sync"
          >
            <Cloud className="w-4 h-4" />
            {syncState.syncId && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            )}
          </button>

          {/* Streak */}
          <div className="px-2.5 py-1 rounded-xl bg-white/90 border border-amber-200 text-amber-700 font-bold flex items-center gap-1 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{streakCount}d</span>
          </div>

          {/* Hours */}
          <div className="px-2.5 py-1 rounded-xl bg-white/90 border border-indigo-100 text-[#0F172A] font-bold shadow-sm hidden sm:block">
            <span>{totalStudyHours}h</span>
          </div>

          {/* Wasted Days Button */}
          <button
            onClick={() => onSelectScreen('wasted')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm ${
              activeScreen === 'wasted'
                ? 'bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-white/90 border border-rose-200 text-rose-600 hover:bg-rose-50'
            }`}
            title="Wasted Days"
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>{wastedDaysCount}d</span>
          </button>

          {/* Focus / Expand View Switcher */}
          <button
            onClick={() => setIsFocused(!isFocused)}
            className={`p-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold cursor-pointer transition-all shadow-sm ${
              isFocused
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white border-transparent shadow-blue-500/20'
                : 'bg-white/90 border-indigo-100 text-[#475569] hover:text-[#0F172A]'
            }`}
            title={isFocused ? 'Switch to 3D Cylinder View' : 'Focus Full Screen'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isFocused ? '3D View' : 'Focus'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3D CYLINDER STAGE */}
      <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden py-3 sm:py-6">
        
        {/* 3D Floating Glass Spheres Decorators */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-left ambient sphere */}
          <div 
            className="absolute top-12 left-[6%] sm:left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-white/90 via-indigo-100/60 to-blue-200/40 border border-white/80 shadow-[0_15px_35px_rgba(99,102,241,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] backdrop-blur-md animate-float-1" 
          />
          {/* Right mid sphere */}
          <div 
            className="absolute top-[35%] right-[5%] sm:right-[9%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-white/90 via-purple-100/60 to-indigo-200/40 border border-white/80 shadow-[0_20px_45px_rgba(99,102,241,0.22),inset_0_2px_4px_rgba(255,255,255,0.9)] backdrop-blur-md animate-float-2" 
          />
          {/* Bottom-left small sphere */}
          <div 
            className="absolute bottom-20 left-[14%] w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white/90 via-sky-100/70 to-blue-300/40 border border-white/90 shadow-[0_10px_25px_rgba(99,102,241,0.18)] backdrop-blur-sm animate-float-2" 
          />
          {/* Bottom-right tiny glossy sphere */}
          <div 
            className="absolute bottom-28 right-[18%] w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-white via-indigo-200/50 to-blue-300/40 border border-white/90 shadow-[0_8px_20px_rgba(99,102,241,0.15)] animate-float-1" 
          />
        </div>

        {/* Top Suspended Luminous Halo Ring */}
        <div 
          className="absolute top-1 sm:top-4 left-1/2 -translate-x-1/2 w-[85%] max-w-4xl h-14 sm:h-20 rounded-[50%] border-2 border-indigo-300/40 shadow-[0_0_35px_rgba(99,102,241,0.28),inset_0_0_20px_rgba(99,102,241,0.15)] pointer-events-none z-10 opacity-75"
        />

        {/* Bottom Luminous Turntable Pedestal Base */}
        <div 
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-24 sm:h-36 rounded-[50%] bg-gradient-to-b from-white/80 via-indigo-100/30 to-transparent border-2 border-indigo-200/60 shadow-[0_25px_60px_rgba(79,70,229,0.2),inset_0_4px_12px_rgba(255,255,255,0.9)] pointer-events-none z-0"
        >
          {/* Inner concentric glowing ring */}
          <div className="absolute inset-3 sm:inset-5 rounded-[50%] border border-indigo-300/50 shadow-[0_0_25px_rgba(99,102,241,0.3)]" />
        </div>

        {/* 3D Perspective Canvas Container */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing perspective-container"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {/* THE 3D ROTATING CYLINDER */}
          <div
            className={`cylinder-3d relative flex items-center justify-center ${isFocused ? 'transition-none' : ''}`}
            style={{
              width: panelWidth,
              height: panelHeight,
              transform: isFocused 
                ? 'none' 
                : `rotateY(${rotationAngle}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {PANELS.map((panel, idx) => {
              const panelAngle = idx * 60;
              const isCurrent = activeIndex === idx;

              // If focused mode, only show the current active screen
              if (isFocused && !isCurrent) return null;

              return (
                <div
                  key={panel.id}
                  onClick={() => {
                    if (!isCurrent) handleRotateToIndex(idx);
                  }}
                  className={`absolute top-0 left-0 w-full h-full rounded-[32px] sm:rounded-[36px] transition-all duration-500 overflow-hidden ${
                    isFocused
                      ? 'static w-full max-w-5xl shadow-2xl bg-white/95 border-2 border-white'
                      : isCurrent
                      ? 'shadow-[0_25px_65px_-12px_rgba(79,70,229,0.22),0_4px_16px_rgba(0,0,0,0.04)] bg-white/90 backdrop-blur-2xl border-2 border-white/95'
                      : 'shadow-lg bg-white/60 backdrop-blur-md border border-white/70 opacity-60 hover:opacity-80 cursor-pointer'
                  }`}
                  style={{
                    transform: isFocused
                      ? 'none'
                      : `rotateY(${panelAngle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: isFocused ? 'visible' : 'hidden',
                    WebkitBackfaceVisibility: isFocused ? 'visible' : 'hidden',
                  }}
                >
                  {/* Glass Panel Header Pill */}
                  <div className="sticky top-0 z-30 px-5 sm:px-8 py-3.5 bg-white/80 backdrop-blur-xl border-b border-white/90 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] text-white flex items-center justify-center shadow-sm">
                        <panel.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0F172A] leading-tight">
                          {panel.label}
                        </h2>
                        <span className="text-[10px] text-[#64748B] font-medium hidden sm:inline">
                          {panel.tagline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5]">
                        Page {idx + 1} of 6
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFocused(!isFocused);
                        }}
                        className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-white/80 transition-colors"
                        title={isFocused ? 'Return to 3D cylinder' : 'Maximize panel'}
                      >
                        {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Panel Scrollable Content Body */}
                  <div className="p-4 sm:p-7 overflow-y-auto h-[calc(100%-60px)] scrollbar-thin scrollbar-thumb-indigo-200 hover:scrollbar-thumb-indigo-400">
                    {panel.id === 'today' && (
                      <TodayScreen
                        onNavigateToTimer={onStartTimerWithTopic}
                        onNavigateToPlan={() => handleRotateToIndex(2)}
                        onNavigateToLearn={() => handleRotateToIndex(3)}
                      />
                    )}
                    {panel.id === 'timer' && <TimerScreen />}
                    {panel.id === 'plan' && <PlanScreen />}
                    {panel.id === 'learn' && <LearnScreen />}
                    {panel.id === 'projects' && <ProjectsScreen />}
                    {panel.id === 'progress' && <ProgressScreen />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 3. BOTTOM ROTATION CONTROLS (Identical to reference: [ ← ] ↻ Rotate to explore ↺ [ → ]) */}
      <footer className="relative z-40 w-full pb-4 sm:pb-6 pt-2 flex items-center justify-center px-4">
        <div className="flex items-center gap-2.5 sm:gap-4 px-4 sm:px-6 py-2 rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_10px_30px_rgba(79,70,229,0.12)]">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-white border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Previous page (turn left)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Center Hint Label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] px-2">
            <RotateCw className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="hidden sm:inline">Rotate or swipe to explore</span>
            <span className="sm:hidden">Rotate</span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-white border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Next page (turn right)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
