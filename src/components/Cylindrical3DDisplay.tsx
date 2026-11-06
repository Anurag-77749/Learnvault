import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Sun,
  Timer as TimerIcon,
  CalendarRange,
  BookOpen,
  FolderGit2,
  BarChart3,
  Hourglass,
  Code2,
  Briefcase,
  Bookmark,
  Sparkles,
  MousePointer
} from 'lucide-react';
import { ScreenId, NAV_ITEMS } from './Navigation';
import { TodayScreen } from './TodayScreen';
import { TimerScreen } from './TimerScreen';
import { PlanScreen } from './PlanScreen';
import { LearnScreen } from './LearnScreen';
import { DSATrackerView } from './DSATrackerView';
import { JobTrackerView } from './JobTrackerView';
import { ResourceInboxView } from './ResourceInboxView';
import { ProjectsScreen } from './ProjectsScreen';
import { ProgressScreen } from './ProgressScreen';
import { WastedDaysScreen } from './WastedDaysScreen';
import { ThreeGlassSphere } from './ThreeGlassSphere';

interface Cylindrical3DDisplayProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onStartTimerWithTopic: (topicTitle?: string) => void;
  onExit3D?: () => void;
}

export const Cylindrical3DDisplay: React.FC<Cylindrical3DDisplayProps> = ({
  activeScreen,
  onSelectScreen,
  onStartTimerWithTopic,
  onExit3D,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const panelCount = NAV_ITEMS.length; // 10
  const anglePerPanel = 360 / panelCount; // 36 deg

  const panelWidth = isMobile ? Math.min(windowWidth - 32, 360) : isTablet ? 720 : 920;
  const panelHeight = isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 190px)';
  const radius = Math.round((panelWidth / 2) / Math.tan(Math.PI / panelCount)) + (isMobile ? 20 : 40);

  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((p) => p.id === activeScreen));
  const [rotationAngle, setRotationAngle] = useState(-activeIndex * anglePerPanel);

  useEffect(() => {
    setRotationAngle(-activeIndex * anglePerPanel);
  }, [activeIndex, anglePerPanel]);

  const handleRotateToIndex = useCallback((index: number) => {
    const safeIndex = ((index % panelCount) + panelCount) % panelCount;
    onSelectScreen(NAV_ITEMS[safeIndex].id);
    setRotationAngle(-safeIndex * anglePerPanel);
  }, [onSelectScreen, panelCount, anglePerPanel]);

  const handlePrev = () => handleRotateToIndex(activeIndex - 1);
  const handleNext = () => handleRotateToIndex(activeIndex + 1);

  // Drag interaction
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
    const sensitivity = isMobile ? 0.35 : 0.22;
    setRotationAngle(dragStartAngle.current + deltaX * sensitivity);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const snapFace = Math.round(-rotationAngle / anglePerPanel);
    const normalizedIndex = ((snapFace % panelCount) + panelCount) % panelCount;
    handleRotateToIndex(normalizedIndex);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col justify-between select-none bg-[#050505] text-[#F5F5F7]">
      {/* 1. TOP 3D CONTROLS BAR */}
      <div className="relative z-30 px-4 sm:px-8 py-2 flex items-center justify-between border-b border-white/[0.08] bg-[#0A0A0C]/70 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500] animate-pulse" />
          <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">
            3D SPATIAL ROTUNDA // 360° WORKSPACE
          </span>
          <span className="hidden sm:inline text-[10px] font-mono text-[#9898A0]">
            (DRAG TO SPIN • {activeIndex + 1} / {panelCount})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFocused(!isFocused)}
            className="px-3 py-1 rounded-full btn-tactile text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            title={isFocused ? 'Exit Focus View' : 'Focus Active Domain'}
          >
            {isFocused ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFocused ? 'Unfocus' : 'Focus'}</span>
          </button>

          {onExit3D && (
            <button
              onClick={onExit3D}
              className="px-3 py-1 rounded-full btn-mercury text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>2D Grid</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 3D CYLINDRICAL STAGE */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden py-4"
        style={{ perspective: isFocused ? '1000px' : isMobile ? '1200px' : '1800px' }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {/* Floating 3D Three.js Centerpiece Core */}
        {!isFocused && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70 z-0">
            <ThreeGlassSphere size={isMobile ? 260 : 380} />
          </div>
        )}

        {/* The 3D Rotating Cylinder */}
        <div
          className="relative transition-transform duration-500 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFocused 
              ? 'translateZ(200px)' 
              : `translateZ(-${radius}px) rotateY(${rotationAngle}deg)`,
          }}
        >
          {NAV_ITEMS.map((item, idx) => {
            const isCurrent = activeIndex === idx;
            const panelAngle = idx * anglePerPanel;

            // In focus mode, only show the active card
            if (isFocused && !isCurrent) return null;

            return (
              <div
                key={item.id}
                onClick={() => !isCurrent && handleRotateToIndex(idx)}
                style={{
                  position: 'absolute',
                  width: `${panelWidth}px`,
                  height: panelHeight,
                  left: `-${panelWidth / 2}px`,
                  top: `-${isMobile ? 280 : 360}px`,
                  transform: isFocused 
                    ? 'none' 
                    : `rotateY(${panelAngle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                  isCurrent 
                    ? 'opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(255,85,0,0.15)] ring-1 ring-white/20' 
                    : 'opacity-40 hover:opacity-75 cursor-pointer blur-[0.5px] hover:blur-none'
                }`}
              >
                {/* Panel Card Shell */}
                <div className="w-full h-full smoked-glass overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                  {/* Panel Header Banner */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08] sticky top-0 bg-[#121216]/90 backdrop-blur-md z-20 -mx-2 px-2 -mt-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                        <item.icon className="w-3.5 h-3.5 text-[#FF5500]" />
                      </div>
                      <span className="font-display font-extrabold text-sm text-white tracking-tight">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">
                        PANEL 0{idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                      )}
                    </div>
                  </div>

                  {/* Panel Body Routing */}
                  <div className="pb-16">
                    {item.id === 'today' && (
                      <TodayScreen
                        onNavigateToTimer={onStartTimerWithTopic}
                        onNavigateToPlan={() => handleRotateToIndex(NAV_ITEMS.findIndex(p => p.id === 'plan'))}
                        onNavigateToLearn={() => handleRotateToIndex(NAV_ITEMS.findIndex(p => p.id === 'learn'))}
                      />
                    )}
                    {item.id === 'timer' && <TimerScreen />}
                    {item.id === 'learn' && <LearnScreen />}
                    {item.id === 'dsa' && <DSATrackerView />}
                    {item.id === 'jobs' && <JobTrackerView />}
                    {item.id === 'vault' && <ResourceInboxView />}
                    {item.id === 'plan' && <PlanScreen />}
                    {item.id === 'projects' && <ProjectsScreen />}
                    {item.id === 'progress' && <ProgressScreen />}
                    {item.id === 'wasted' && <WastedDaysScreen />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM ROTUNDA NAVIGATION ARROWS & INDICATORS */}
      <div className="relative z-30 px-4 py-3 flex items-center justify-center gap-4 bg-[#08080A]/80 backdrop-blur-xl border-t border-white/[0.08]">
        <button
          onClick={handlePrev}
          className="p-2 rounded-full btn-tactile hover:text-white transition cursor-pointer"
          title="Previous Domain"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 10-Dot Rotunda Tracker */}
        <div className="flex items-center gap-1.5">
          {NAV_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleRotateToIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 h-2 bg-gradient-to-r from-white to-[#FF5500] shadow-[0_0_8px_#FF5500]'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
              title={item.label}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-full btn-tactile hover:text-white transition cursor-pointer"
          title="Next Domain"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
