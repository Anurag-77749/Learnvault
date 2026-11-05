import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Sparkles,
  ArrowRight,
  Mouse,
  Code2,
  Layers,
  Cpu,
  Database,
  Terminal,
  Binary,
  Cloud,
  Flame,
  Hourglass,
  Maximize2,
  Minimize2,
  Compass,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { ThreeGlassSphere } from './ThreeGlassSphere';
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
  const [rotationIndex, setRotationIndex] = useState(0); // 0 = Center (Home/Build), 1 = Right (Skills), -1 = Left (About)
  const [showWorkspace, setShowWorkspace] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Rotate handler
  const handleRotate = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setRotationIndex((prev) => (prev + 1) % 3);
    } else {
      setRotationIndex((prev) => (prev - 1 + 3) % 3);
    }
  }, []);

  const scrollToWorkspace = (targetScreen?: ScreenId) => {
    if (targetScreen) {
      onSelectScreen(targetScreen);
    }
    setShowWorkspace(true);
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Drag / Swipe handling
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const handleTouchStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
  };

  const handleTouchEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = clientX - dragStartX.current;
    if (diff > 50) {
      handleRotate('prev');
    } else if (diff < -50) {
      handleRotate('next');
    }
  };

  // 3 panel angles: 0 = center (0deg), 1 = right (60deg), 2 = left (-60deg)
  const angle = rotationIndex === 0 ? 0 : rotationIndex === 1 ? -60 : 60;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#F2F5FB] via-[#E6EBF6] to-[#D9E1F0] text-[#0F172A] selection:bg-[#3B82F6] selection:text-white font-sans">
      
      {/* 3D SCENE CONTAINER */}
      <section className="relative w-full min-h-screen flex flex-col justify-between items-center px-4 sm:px-8 pt-5 pb-6 overflow-hidden">
        
        {/* Floating Ambient Glass Spheres Decorators (exact to reference) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Far-left blurred glossy sphere */}
          <div className="absolute top-[28%] left-[4%] sm:left-[8%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#93C5FD] via-[#DBEAFE] to-white border border-white/90 shadow-[0_20px_50px_rgba(99,102,241,0.22)] backdrop-blur-md animate-float-1" />
          
          {/* Right mid glowing sphere */}
          <div className="absolute top-[38%] right-[3%] sm:right-[7%] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#60A5FA] via-[#C7D2FE] to-white border border-white/90 shadow-[0_15px_35px_rgba(99,102,241,0.2)] animate-float-2" />

          {/* Bottom right floating glass bead */}
          <div className="absolute bottom-[20%] right-[11%] w-10 h-10 rounded-full bg-gradient-to-br from-white via-indigo-200 to-blue-400 border border-white shadow-[0_8px_20px_rgba(99,102,241,0.18)] animate-float-1" />
        </div>

        {/* Top Suspended Acrylic Halo Ring (exact to reference) */}
        <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 w-[88%] max-w-5xl h-20 sm:h-28 rounded-[50%] border-[2px] border-indigo-200/70 shadow-[0_0_35px_rgba(99,102,241,0.28),inset_0_0_20px_rgba(147,197,253,0.3)] pointer-events-none z-10 opacity-80" />

        {/* Bottom Glowing Turntable Pedestal with Floor Reflection (exact to reference) */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl h-28 sm:h-36 rounded-[50%] bg-gradient-to-b from-white/70 via-indigo-100/30 to-transparent border-[2.5px] border-indigo-200/90 shadow-[0_30px_70px_rgba(99,102,241,0.22),inset_0_4px_16px_rgba(255,255,255,0.95)] pointer-events-none z-0">
          <div className="absolute inset-4 rounded-[50%] border border-indigo-300/50 shadow-[0_0_25px_rgba(99,102,241,0.25)]" />
        </div>

        {/* CENTER 3D CYLINDRICAL DISPLAY ROTUNDA */}
        <div 
          className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto z-20 perspective-container select-none cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => handleTouchStart(e.clientX)}
          onMouseUp={(e) => handleTouchEnd(e.clientX)}
        >
          <div 
            className="cylinder-3d relative w-full h-[580px] sm:h-[620px] flex items-center justify-center transition-transform duration-700 ease-out"
            style={{
              transform: `rotateY(${angle}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* ======================================================== */}
            {/* FACE 0: CENTER MAIN PANEL (Build. Innovate. Grow.)        */}
            {/* ======================================================== */}
            <div 
              className="absolute w-[94%] max-w-4xl h-[540px] sm:h-[580px] rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white/95 via-white/80 to-[#EDF2FC]/90 backdrop-blur-3xl border-2 border-white/90 shadow-[0_30px_80px_-15px_rgba(79,70,229,0.22),inset_0_2px_4px_rgba(255,255,255,0.95)] overflow-hidden flex flex-col justify-between p-6 sm:p-10"
              style={{
                transform: 'rotateY(0deg) translateZ(380px)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* Curved Top Glass Bar (Nova / LearnVault) */}
              <div className="w-full flex items-center justify-between pb-4 border-b border-white/80">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#0F172A]">
                    Learn<span className="text-[#3B82F6]">Vault</span>
                  </span>
                </div>

                {/* Center Nav Links */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#475569]">
                  <button onClick={() => scrollToWorkspace('today')} className="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-0.5">
                    Home
                  </button>
                  <button onClick={() => setRotationIndex(2)} className="hover:text-[#0F172A] transition-colors">
                    About
                  </button>
                  <button onClick={() => scrollToWorkspace('projects')} className="hover:text-[#0F172A] transition-colors">
                    Projects
                  </button>
                  <button onClick={() => setRotationIndex(1)} className="hover:text-[#0F172A] transition-colors">
                    Skills
                  </button>
                  <button onClick={() => scrollToWorkspace('plan')} className="hover:text-[#0F172A] transition-colors">
                    Timeline
                  </button>
                </nav>

                {/* Right Action Button */}
                <button
                  onClick={() => scrollToWorkspace('timer')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <span>Focus Timer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Body: Left Content + Right 3D Pedestal Sphere */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-2">
                {/* Left Side: Hero Typography & Buttons */}
                <div className="space-y-4 text-left">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.08] tracking-tight">
                    Build.<br />
                    Innovate.<br />
                    <span className="text-[#3B82F6] drop-shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
                      Grow.
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-[#475569] font-sans max-w-sm leading-relaxed">
                    Turning ideas into reality with cutting-edge technology. Master engineering, parallel tracks, and real-world deployment.
                  </p>

                  {/* Buttons (exact to reference) */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => scrollToWorkspace('today')}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>Explore Projects</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setRotationIndex(2)}
                      className="px-5 py-2.5 rounded-full bg-white/70 hover:bg-white text-[#1E293B] border border-white/90 text-xs font-bold shadow-sm backdrop-blur-md transition-all cursor-pointer hover:scale-105"
                    >
                      About Me
                    </button>
                  </div>
                </div>

                {/* Right Side: The 3D Glass Sphere on Pedestal Centerpiece */}
                <div className="relative w-full h-[260px] sm:h-[320px] flex items-center justify-center">
                  <ThreeGlassSphere />
                </div>
              </div>

              {/* Bottom Mouse Scroll Down Indicator */}
              <div className="w-full flex items-center justify-between pt-2 text-[11px] font-semibold text-[#64748B]">
                <button 
                  onClick={() => scrollToWorkspace('today')}
                  className="flex items-center gap-1.5 hover:text-[#3B82F6] transition-colors cursor-pointer"
                >
                  <Mouse className="w-4 h-4 text-[#3B82F6] animate-bounce" />
                  <span>Scroll Down</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">LearnVault 3D Studio</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* FACE 1: RIGHT PANEL ("My Skills / 10-Track Curriculum")  */}
            {/* ======================================================== */}
            <div 
              className="absolute w-[94%] max-w-4xl h-[540px] sm:h-[580px] rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white/95 via-white/80 to-[#EDF2FC]/90 backdrop-blur-3xl border-2 border-white/90 shadow-[0_30px_80px_-15px_rgba(79,70,229,0.22)] overflow-hidden flex flex-col justify-between p-6 sm:p-10"
              style={{
                transform: 'rotateY(60deg) translateZ(380px)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/80">
                <h2 className="font-serif text-3xl font-bold text-[#0F172A]">My Skills & Curriculum</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] font-bold">
                  Track 0 to 9
                </span>
              </div>

              {/* 6 Grid Skill Cards (exact to reference) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 my-auto">
                {[
                  { name: 'Python', role: 'Main Lang', icon: Code2, color: 'text-amber-500' },
                  { name: 'React', role: 'Frontend & UI', icon: Layers, color: 'text-sky-500' },
                  { name: 'Next.js', role: 'Full Stack', icon: Cpu, color: 'text-indigo-600' },
                  { name: 'Node.js', role: 'Microservices', icon: Terminal, color: 'text-emerald-500' },
                  { name: 'AI / ML', role: 'Gemini & Agents', icon: Binary, color: 'text-purple-500' },
                  { name: 'DSA', role: 'Striver A2Z', icon: Database, color: 'text-blue-500' },
                ].map((s) => (
                  <div
                    key={s.name}
                    onClick={() => scrollToWorkspace('learn')}
                    className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-white/90 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    <s.icon className={`w-8 h-8 ${s.color} mb-2 group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-bold text-[#0F172A]">{s.name}</span>
                    <span className="text-[10px] text-[#64748B] font-medium">{s.role}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() => scrollToWorkspace('learn')}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:brightness-110 transition-all cursor-pointer"
                >
                  View All Curriculum Tracks →
                </button>
                <button onClick={() => setRotationIndex(0)} className="text-xs text-[#64748B] hover:text-[#0F172A]">
                  Back to Center
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* FACE 2: LEFT PANEL ("About Me / Engineering Vision")    */}
            {/* ======================================================== */}
            <div 
              className="absolute w-[94%] max-w-4xl h-[540px] sm:h-[580px] rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-white/95 via-white/80 to-[#EDF2FC]/90 backdrop-blur-3xl border-2 border-white/90 shadow-[0_30px_80px_-15px_rgba(79,70,229,0.22)] overflow-hidden flex flex-col justify-between p-6 sm:p-10"
              style={{
                transform: 'rotateY(-60deg) translateZ(380px)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/80">
                <h2 className="font-serif text-3xl font-bold text-[#0F172A]">About Me</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] font-bold">
                  Forward Deployed Engineer
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 my-auto">
                <div className="space-y-3">
                  <p className="text-lg font-bold text-[#0F172A] leading-snug">
                    I'm a passionate engineer who loves building scalable solutions and exploring cutting-edge AI architectures.
                  </p>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    LearnVault is my 4-year engineered operating system: continuous parallel lane execution across DSA, Cloud, Full-Stack development, and customer-facing last-mile integration.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => scrollToWorkspace('plan')}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:brightness-110 transition-all cursor-pointer"
                    >
                      Explore 4-Year Timeline →
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-gradient-to-tr from-indigo-50 to-white border border-white/90 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-indigo-100 font-bold">
                    <span>Year 1 Target</span>
                    <span className="text-[#3B82F6]">Forward Deployed Tier 1</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Active Streak</span>
                    <span className="font-bold text-amber-600">🔥 {streakCount} Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Hours Invested</span>
                    <span className="font-bold text-[#0F172A]">{totalStudyHours} hrs</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Cloud Sync</span>
                    <span className="font-bold text-emerald-600">Active (Supabase)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button onClick={() => scrollToWorkspace('projects')} className="text-xs text-[#3B82F6] font-bold hover:underline">
                  View Portfolios & Projects →
                </button>
                <button onClick={() => setRotationIndex(0)} className="text-xs text-[#64748B] hover:text-[#0F172A]">
                  Back to Center
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROTATION CONTROLS (Exact to reference: [ ← ] ↻ Rotate to explore ↺ [ → ]) */}
        <div className="relative z-30 w-full flex items-center justify-center pt-3 pb-2">
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_10px_30px_rgba(79,70,229,0.14)]">
            {/* Prev Button */}
            <button
              onClick={() => handleRotate('prev')}
              className="w-9 h-9 rounded-full bg-white border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Rotate Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Center Hint Label */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#475569] px-2">
              <RotateCw className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="hidden sm:inline">Rotate to explore</span>
              <span className="sm:hidden">Rotate</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => handleRotate('next')}
              className="w-9 h-9 rounded-full bg-white border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Rotate Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE FULL WORKSPACE (Scroll Down Target)          */}
      {/* ======================================================== */}
      <section ref={workspaceRef} className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-indigo-100/60 space-y-8">
        
        {/* Navigation Ribbon for Workspace */}
        <div className="p-2 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/90 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today', icon: CheckCircle2 },
              { id: 'timer', label: 'Pomodoro Timer', icon: Clock },
              { id: 'plan', label: 'Timeline & Tracks', icon: Calendar },
              { id: 'learn', label: '10-Track Curriculum', icon: BookOpen },
              { id: 'projects', label: 'Projects', icon: Layers },
              { id: 'progress', label: 'Progress & Stats', icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectScreen(tab.id as ScreenId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white shadow-md shadow-blue-500/25'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
            >
              ↑ Back to 3D Cylinder
            </button>
          </div>
        </div>

        {/* Screen Content */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/95 shadow-xl p-5 sm:p-8 min-h-[500px]">
          {activeScreen === 'today' && (
            <TodayScreen
              onNavigateToTimer={onStartTimerWithTopic}
              onNavigateToPlan={() => onSelectScreen('plan')}
              onNavigateToLearn={() => onSelectScreen('learn')}
            />
          )}
          {activeScreen === 'timer' && <TimerScreen />}
          {activeScreen === 'plan' && <PlanScreen />}
          {activeScreen === 'learn' && <LearnScreen />}
          {activeScreen === 'projects' && <ProjectsScreen />}
          {activeScreen === 'progress' && <ProgressScreen />}
        </div>
      </section>
    </div>
  );
};
