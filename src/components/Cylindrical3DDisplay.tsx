import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Compass,
  User,
  ExternalLink
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
  // 0 = Center (Home: Build. Innovate. Grow.), 1 = Right (My Skills), 2 = Left (About Me)
  const [rotationIndex, setRotationIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Exact 3D Geometry to PREVENT any panel overlap/slicing:
  // For 3 faces with 60deg separation, Chord = 2 * R * sin(30deg) = R.
  // Setting R > W ensures panels NEVER collide or slice into each other!
  const panelW = isMobile ? Math.min(windowWidth - 36, 340) : 680;
  const panelH = isMobile ? 500 : 470;
  const radius = isMobile ? 360 : 660; // 660px radius > 680px width * sin(30) = clean, gap-spaced 3D cylinder!
  const cameraZ = isMobile ? -180 : -280; // Push back to view the full rotunda diorama

  const handleRotate = useCallback((dir: 'next' | 'prev') => {
    if (dir === 'next') {
      setRotationIndex((prev) => (prev + 1) % 3);
    } else {
      setRotationIndex((prev) => (prev - 1 + 3) % 3);
    }
  }, []);

  const scrollToWorkspace = (targetScreen?: ScreenId) => {
    if (targetScreen) {
      onSelectScreen(targetScreen);
    }
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Cylinder rotation angle:
  // index 0 -> 0deg
  // index 1 (Skills) -> -60deg (brings right panel to center)
  // index 2 (About) -> 60deg (brings left panel to center)
  const cylinderAngle = rotationIndex === 0 ? 0 : rotationIndex === 1 ? -60 : 60;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#F2F5FB] via-[#E6EBF6] to-[#DCE3F2] text-[#0F172A] selection:bg-[#3B82F6] selection:text-white font-sans">
      
      {/* 3D DIORAMA SCENE */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-between items-center px-4 sm:px-8 pt-6 pb-6 overflow-hidden">
        
        {/* Floating Ambient Glass Spheres Decorators (exact to reference) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Far-left blurred glossy sphere */}
          <div className="absolute top-[26%] left-[3%] sm:left-[7%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#93C5FD] via-[#DBEAFE] to-white border border-white/90 shadow-[0_20px_50px_rgba(99,102,241,0.22)] backdrop-blur-md animate-float-1" />
          
          {/* Right mid glowing sphere */}
          <div className="absolute top-[34%] right-[3%] sm:right-[6%] w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-[#60A5FA] via-[#C7D2FE] to-white border border-white/90 shadow-[0_15px_35px_rgba(99,102,241,0.2)] animate-float-2" />

          {/* Bottom right floating glass bead */}
          <div className="absolute bottom-[22%] right-[10%] w-10 h-10 rounded-full bg-gradient-to-br from-white via-indigo-200 to-blue-400 border border-white shadow-[0_8px_20px_rgba(99,102,241,0.18)] animate-float-1" />
        </div>

        {/* Top Suspended Acrylic Halo Ring (exact to reference) */}
        <div 
          className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 rounded-[50%] border-[2px] border-indigo-200/70 shadow-[0_0_35px_rgba(99,102,241,0.28),inset_0_0_20px_rgba(147,197,253,0.3)] pointer-events-none z-10 opacity-75"
          style={{ width: isMobile ? 360 : 780, height: isMobile ? 50 : 80 }}
        />

        {/* Bottom Glowing Turntable Pedestal with Floor Reflection (exact to reference) */}
        <div 
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-white/70 via-indigo-100/30 to-transparent border-[2.5px] border-indigo-200/80 shadow-[0_30px_70px_rgba(99,102,241,0.22),inset_0_4px_16px_rgba(255,255,255,0.95)] pointer-events-none z-0"
          style={{ width: isMobile ? 400 : 880, height: isMobile ? 70 : 110 }}
        >
          <div className="absolute inset-3 sm:inset-4 rounded-[50%] border border-indigo-300/50 shadow-[0_0_25px_rgba(99,102,241,0.25)]" />
        </div>

        {/* 3D CYLINDRICAL DISPLAY CONTAINER */}
        <div 
          className="relative w-full flex-1 flex items-center justify-center my-auto z-20 select-none"
          style={{
            perspective: isMobile ? '1000px' : '1400px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* THE ROTATING 3D CAROUSEL */}
          <div 
            className="cylinder-3d relative flex items-center justify-center transition-transform duration-700 ease-out"
            style={{
              width: panelW,
              height: panelH,
              transform: `translateZ(${cameraZ}px) rotateY(${cylinderAngle}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* ======================================================== */}
            {/* PANEL 0: CENTER HERO (Build. Innovate. Grow.)             */}
            {/* ======================================================== */}
            <div 
              onClick={() => {
                if (rotationIndex !== 0) setRotationIndex(0);
              }}
              className={`absolute top-0 left-0 rounded-[32px] sm:rounded-[38px] bg-gradient-to-br from-white/95 via-white/85 to-[#EEF2FC]/90 backdrop-blur-3xl border-2 border-white/95 transition-all duration-500 overflow-hidden flex flex-col justify-between p-5 sm:p-8 cursor-pointer ${
                rotationIndex === 0
                  ? 'shadow-[0_25px_65px_-12px_rgba(79,70,229,0.22),inset_0_2px_4px_rgba(255,255,255,1)] opacity-100 z-30'
                  : 'shadow-lg opacity-60 hover:opacity-85 z-10'
              }`}
              style={{
                width: panelW,
                height: panelH,
                transform: `rotateY(0deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* Curved Top Glass Bar (Nova / LearnVault) */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-white/80">
                {/* Brand */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                    Nova
                  </span>
                </div>

                {/* Center Nav Links (exact to reference) */}
                <nav className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs font-semibold text-[#475569]">
                  <button onClick={() => setRotationIndex(0)} className="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-0.5">
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
                    Contact
                  </button>
                </nav>

                {/* Right Action Button */}
                <button
                  onClick={() => scrollToWorkspace('timer')}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <span>Let's Talk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Main Body: Left Content + Right 3D Pedestal Sphere */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
                {/* Left Side: Hero Typography & Buttons */}
                <div className="space-y-3 sm:space-y-4 text-left">
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] leading-[1.08] tracking-tight">
                    Build.<br />
                    Innovate.<br />
                    <span className="text-[#3B82F6] drop-shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
                      Grow.
                    </span>
                  </h1>

                  <p className="text-xs text-[#475569] font-sans max-w-xs leading-relaxed">
                    Turning ideas into reality with cutting-edge technology.
                  </p>

                  {/* Buttons (exact to reference) */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => scrollToWorkspace('today')}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>Explore Projects</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setRotationIndex(2)}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/70 hover:bg-white text-[#1E293B] border border-white/90 text-xs font-bold shadow-sm backdrop-blur-md transition-all cursor-pointer hover:scale-105"
                    >
                      About Me
                    </button>
                  </div>
                </div>

                {/* Right Side: The 3D Glass Sphere on Pedestal Centerpiece */}
                <div className="relative w-full h-[180px] sm:h-[240px] flex items-center justify-center">
                  <ThreeGlassSphere />
                </div>
              </div>

              {/* Bottom Mouse Scroll Down Indicator */}
              <div className="w-full flex items-center justify-between pt-1 text-[11px] font-semibold text-[#64748B]">
                <button 
                  onClick={() => scrollToWorkspace('today')}
                  className="flex items-center gap-1.5 hover:text-[#3B82F6] transition-colors cursor-pointer"
                >
                  <Mouse className="w-3.5 h-3.5 text-[#3B82F6] animate-bounce" />
                  <span>Scroll Down</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">LearnVault 3D</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PANEL 1: RIGHT ("My Skills")                              */}
            {/* ======================================================== */}
            <div 
              onClick={() => {
                if (rotationIndex !== 1) setRotationIndex(1);
              }}
              className={`absolute top-0 left-0 rounded-[32px] sm:rounded-[38px] bg-gradient-to-br from-white/95 via-white/85 to-[#EEF2FC]/90 backdrop-blur-3xl border-2 border-white/95 transition-all duration-500 overflow-hidden flex flex-col justify-between p-5 sm:p-8 cursor-pointer ${
                rotationIndex === 1
                  ? 'shadow-[0_25px_65px_-12px_rgba(79,70,229,0.22),inset_0_2px_4px_rgba(255,255,255,1)] opacity-100 z-30'
                  : 'shadow-lg opacity-60 hover:opacity-85 z-10'
              }`}
              style={{
                width: panelW,
                height: panelH,
                transform: `rotateY(60deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/80">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">My Skills</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] font-bold">
                  Track 0 to 9
                </span>
              </div>

              {/* 6 Grid Skill Cards (exact to reference) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
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
                    className="p-3 sm:p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-white/90 hover:border-indigo-200 shadow-sm transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    <s.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${s.color} mb-1.5 group-hover:scale-110 transition-transform`} />
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A]">{s.name}</span>
                    <span className="text-[9px] text-[#64748B] font-medium">{s.role}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => scrollToWorkspace('learn')}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:brightness-110 transition-all cursor-pointer"
                >
                  View All Skills →
                </button>
                <button onClick={() => setRotationIndex(0)} className="text-xs text-[#64748B] hover:text-[#0F172A]">
                  Back to Center
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PANEL 2: LEFT ("About Me")                                */}
            {/* ======================================================== */}
            <div 
              onClick={() => {
                if (rotationIndex !== 2) setRotationIndex(2);
              }}
              className={`absolute top-0 left-0 rounded-[32px] sm:rounded-[38px] bg-gradient-to-br from-white/95 via-white/85 to-[#EEF2FC]/90 backdrop-blur-3xl border-2 border-white/95 transition-all duration-500 overflow-hidden flex flex-col justify-between p-5 sm:p-8 cursor-pointer ${
                rotationIndex === 2
                  ? 'shadow-[0_25px_65px_-12px_rgba(79,70,229,0.22),inset_0_2px_4px_rgba(255,255,255,1)] opacity-100 z-30'
                  : 'shadow-lg opacity-60 hover:opacity-85 z-10'
              }`}
              style={{
                width: panelW,
                height: panelH,
                transform: `rotateY(-60deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/80">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">About Me</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] font-bold">
                  Forward Deployed Engineer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-auto">
                <div className="space-y-2.5">
                  <p className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug">
                    I'm a passionate developer who loves building scalable solutions and exploring cutting-edge AI architectures.
                  </p>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    LearnVault is my engineered 4-year curriculum: continuous parallel execution across DSA, Cloud, and Full-Stack systems.
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={() => scrollToWorkspace('plan')}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:brightness-110 transition-all cursor-pointer"
                    >
                      Know More →
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-50 to-white border border-white/90 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100 font-bold">
                    <span>Year 1 Target</span>
                    <span className="text-[#3B82F6]">FDE Tier 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Active Streak</span>
                    <span className="font-bold text-amber-600">🔥 {streakCount} Days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Invested Hours</span>
                    <span className="font-bold text-[#0F172A]">{totalStudyHours} hrs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Cloud Sync</span>
                    <span className="font-bold text-emerald-600">Active (Supabase)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => scrollToWorkspace('projects')} className="text-xs text-[#3B82F6] font-bold hover:underline">
                  View Portfolios →
                </button>
                <button onClick={() => setRotationIndex(0)} className="text-xs text-[#64748B] hover:text-[#0F172A]">
                  Back to Center
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROTATION CONTROLS (Exact to reference: [ ← ] ↻ Rotate to explore ↺ [ → ]) */}
        <div className="relative z-30 w-full flex items-center justify-center pt-2 pb-2">
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_10px_30px_rgba(79,70,229,0.12)]">
            {/* Prev Button */}
            <button
              onClick={() => handleRotate('prev')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Rotate Left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Center Hint Label (exact to reference) */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] px-2">
              <RotateCw className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Rotate to explore</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => handleRotate('next')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-indigo-100 hover:border-indigo-300 text-[#4F46E5] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Rotate Right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE FULL WORKSPACE (Scroll Down Target)          */}
      {/* ======================================================== */}
      <section ref={workspaceRef} className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 border-t border-indigo-100/60 space-y-6">
        
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

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
          >
            ↑ Back to 3D Cylinder
          </button>
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
