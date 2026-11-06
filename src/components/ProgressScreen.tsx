import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  BarChart3, 
  Code2, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Flame,
  Award,
  BookOpen,
  FolderGit2,
  Target,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { db, getTodayDateString } from '../services/db';
import { ActivityHeatmap } from './ActivityHeatmap';
import { TRACK_TITLES } from './LearnScreen';

export const ProgressScreen: React.FC = () => {
  const today = getTodayDateString();
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];
  const todayLog = useLiveQuery(() => db.dailyLogs.get(today), [today]);
  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];
  const projects = useLiveQuery(() => db.projects.toArray()) || [];
  const [showAllTracks, setShowAllTracks] = useState(false);

  // Compute all cumulative metrics
  const telemetry = React.useMemo(() => {
    let totalStudyMins = 0;
    let totalWastedMins = 0;
    let totalDSA = 0;
    let easyDSA = 0;
    let medDSA = 0;
    let hardDSA = 0;
    let leetcodeCount = 0;
    let striverCount = 0;
    let otherCount = 0;
    let commDays = 0;

    allLogs.forEach((log) => {
      totalStudyMins += log.studyMinutes || 0;
      totalWastedMins += log.wastedMinutes || 0;
      totalDSA += log.questionsCount || 0;

      if (log.questionsDifficulty) {
        easyDSA += log.questionsDifficulty.easy || 0;
        medDSA += log.questionsDifficulty.medium || 0;
        hardDSA += log.questionsDifficulty.hard || 0;
      }

      if (log.questionsPlatforms) {
        leetcodeCount += log.questionsPlatforms.leetcode || 0;
        striverCount += log.questionsPlatforms.striver || 0;
        otherCount += log.questionsPlatforms.other || 0;
      }

      if (log.communicationPracticed) {
        commDays += 1;
      }
    });

    const totalStudyHours = Math.round((totalStudyMins / 60) * 10) / 10;
    const totalWastedHours = Math.round((totalWastedMins / 60) * 10) / 10;
    const activeDaysCount = allLogs.filter((l) => (l.studyMinutes || 0) > 0 || (l.questionsCount || 0) > 0).length;

    // Difficulty percentages
    const easyPct = totalDSA > 0 ? Math.round((easyDSA / totalDSA) * 100) : 0;
    const medPct = totalDSA > 0 ? Math.round((medDSA / totalDSA) * 100) : 0;
    const hardPct = totalDSA > 0 ? Math.round((hardDSA / totalDSA) * 100) : 0;

    return {
      totalStudyHours,
      totalWastedHours,
      totalDSA,
      easyDSA,
      medDSA,
      hardDSA,
      easyPct,
      medPct,
      hardPct,
      leetcodeCount,
      striverCount,
      otherCount,
      commDays,
      activeDaysCount,
    };
  }, [allLogs]);

  // Overall Curriculum Mastery calculation
  const curriculumStats = React.useMemo(() => {
    let totalSubtopics = 0;
    let completedSubtopics = 0;
    const trackBreakdown: { [trackId: number]: { total: number; completed: number; percent: number } } = {};

    curriculumTopics.forEach((t) => {
      const subCount = t.subtopics?.length || 0;
      const doneCount = t.subtopics?.filter((s) => s.completed).length || 0;
      totalSubtopics += subCount;
      completedSubtopics += doneCount;

      if (!trackBreakdown[t.trackId]) {
        trackBreakdown[t.trackId] = { total: 0, completed: 0, percent: 0 };
      }
      trackBreakdown[t.trackId].total += subCount;
      trackBreakdown[t.trackId].completed += doneCount;
    });

    Object.keys(trackBreakdown).forEach((k) => {
      const id = Number(k);
      const item = trackBreakdown[id];
      item.percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
    });

    const curriculumPercent = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

    return {
      totalSubtopics,
      completedSubtopics,
      curriculumPercent,
      trackBreakdown,
    };
  }, [curriculumTopics]);

  // Projects stats (milestone: 20 projects)
  const projectStats = React.useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === 'Completed' || p.status === 'MVP Ready').length;
    const targetProjects = 20;
    const projectPercent = Math.min(100, Math.round((completedProjects / targetProjects) * 100));
    return { totalProjects, completedProjects, targetProjects, projectPercent };
  }, [projects]);

  // DSA milestone: 500 questions
  const dsaTarget = 500;
  const dsaPercent = Math.min(100, Math.round((telemetry.totalDSA / dsaTarget) * 100));

  // Study hours milestone: 2,000 hrs over 4 years (~500 hrs/year)
  const studyTarget = 2000;
  const studyPercent = Math.min(100, Math.round((telemetry.totalStudyHours / studyTarget) * 100));

  // LearnVault Master Composite Score (Weighted 35% Curriculum, 25% DSA, 20% Projects, 20% Study)
  const masterScore = Math.round(
    curriculumStats.curriculumPercent * 0.35 +
    dsaPercent * 0.25 +
    projectStats.projectPercent * 0.20 +
    studyPercent * 0.20
  );

  // Level badge determination
  const getRankBadge = (score: number) => {
    if (score >= 80) return { title: 'Forward Deployed Engineer', level: 'Level 5 (Mastery)', color: 'text-shiny-gold' };
    if (score >= 55) return { title: 'Senior Systems Engineer', level: 'Level 4 (Advanced)', color: 'text-[#7DF9FF]' };
    if (score >= 30) return { title: 'Systems Developer', level: 'Level 3 (Intermediate)', color: 'text-white' };
    if (score >= 15) return { title: 'Apprentice Architect', level: 'Level 2 (Foundation)', color: 'text-[#B8B0AA]' };
    return { title: 'Novice Engineer', level: 'Level 1 (Kickoff)', color: 'text-[#00F0FF]' };
  };

  const rank = getRankBadge(masterScore);

  // Days in journey since Nov 1, 2026
  const journeyDays = React.useMemo(() => {
    const start = new Date(2026, 10, 1);
    const now = new Date();
    const diff = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return Math.min(1461, diff);
  }, []);

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="pt-2">
        <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold flex items-center gap-1.5 mb-1 font-sans">
          <BarChart3 className="w-3.5 h-3.5" /> Telemetry & 4-Year Totals
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Progress & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#B8B0AA] font-sans mt-0.5">
          Overall 4-year journey progress, cumulative DSA mastery, high-level English telemetry, and heatmap consistency
        </p>
      </div>

      {/* 0. MASTER OVERALL PROGRESS TRACKER (LEARNVAULT COMPOSITE SCORE) */}
      <section className="p-6 sm:p-8 rounded-3xl card-maroon-gold shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/5 blur-3xl rounded-full pointer-events-none" />

        {/* Master Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1a1a1a] relative">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-black border border-[#00F0FF]/60 p-1 flex items-center justify-center shadow-lg shadow-[#00F0FF]/25 shrink-0 overflow-hidden">
              <img src="/learnvault-logo.png" alt="LearnVault Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7DF9FF] bg-[#000000] px-2.5 py-0.5 rounded-full border border-[#00F0FF]/40 shadow-sm">
                  Master Telemetry
                </span>
                <span className="text-[10px] font-semibold text-[#B8B0AA] tracking-wide">
                  Day {journeyDays} of 1,461 (Year 1: 2026–2027)
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                Overall Progress Tracker
              </h2>
              <p className="text-xs text-[#00F0FF] font-sans font-medium tracking-wider uppercase mt-0.5">
                Your Knowledge. Your Progress. Your Future.
              </p>
            </div>
          </div>

          {/* Master Progress Radial / Stat */}
          <div className="flex items-center gap-4 bg-black/80 px-5 py-3 rounded-2xl border border-[#00F0FF]/40 shadow-inner self-start md:self-auto">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-shiny-gold">
                  {masterScore}%
                </span>
                <span className="text-xs text-[#B8B0AA] font-sans">Journey</span>
              </div>
              <span className={`text-[11px] font-bold block ${rank.color}`}>
                {rank.level}
              </span>
            </div>
            <div className="border-l border-[#1a1a1a] pl-4 space-y-0.5">
              <span className="text-[10px] text-[#B8B0AA] uppercase font-semibold block">Current Rank</span>
              <span className="text-xs font-bold text-white block">{rank.title}</span>
              <span className="text-[10px] text-shiny-gold block">Forward Deployed Target</span>
            </div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[#B8B0AA] font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#7DF9FF]" />
              4-Year Composite Mastery (Curriculum + DSA + Projects + Study)
            </span>
            <span className="font-bold text-shiny-gold">{masterScore}% / 100%</span>
          </div>
          <div className="w-full bg-black h-3.5 rounded-full overflow-hidden border border-[#1a1a1a] p-0.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#8B0000] via-[#00F0FF] to-[#7DF9FF] h-full rounded-full transition-all duration-700 shadow-md shadow-[#00F0FF]/30"
              style={{ width: `${Math.max(masterScore, 1)}%` }}
            />
          </div>
        </div>

        {/* 4 Core Progress Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Pillar 1: Curriculum */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#1a1a1a] hover:border-[#00F0FF]/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7DF9FF] uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#7DF9FF]" />
                Curriculum
              </span>
              <span className="text-xs font-bold text-white">{curriculumStats.curriculumPercent}%</span>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-white">
                {curriculumStats.completedSubtopics} <span className="text-xs font-sans text-[#B8B0AA]">/ {curriculumStats.totalSubtopics} topics</span>
              </div>
              <p className="text-[11px] text-shiny-gold mt-0.5 truncate">Angela Yu + 12 Core Tracks</p>
            </div>
            <div className="w-full bg-[#080808] h-1.5 rounded-full overflow-hidden border border-[#1a1a1a]">
              <div className="bg-[#00F0FF] h-full transition-all duration-500" style={{ width: `${curriculumStats.curriculumPercent}%` }} />
            </div>
          </div>

          {/* Pillar 2: DSA */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#1a1a1a] hover:border-[#00F0FF]/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7DF9FF] uppercase tracking-wide flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#7DF9FF]" />
                DSA Mastery
              </span>
              <span className="text-xs font-bold text-white">{dsaPercent}%</span>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-shiny-gold">
                {telemetry.totalDSA} <span className="text-xs font-sans text-[#B8B0AA]">/ 500 solved</span>
              </div>
              <p className="text-[11px] text-[#B8B0AA] mt-0.5">
                E: {telemetry.easyDSA} | M: {telemetry.medDSA} | H: {telemetry.hardDSA}
              </p>
            </div>
            <div className="w-full bg-[#080808] h-1.5 rounded-full overflow-hidden border border-[#1a1a1a]">
              <div className="bg-[#7DF9FF] h-full transition-all duration-500" style={{ width: `${dsaPercent}%` }} />
            </div>
          </div>

          {/* Pillar 3: Projects */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#1a1a1a] hover:border-[#00F0FF]/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7DF9FF] uppercase tracking-wide flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#7DF9FF]" />
                Projects
              </span>
              <span className="text-xs font-bold text-white">{projectStats.projectPercent}%</span>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-white">
                {projectStats.completedProjects} <span className="text-xs font-sans text-[#B8B0AA]">/ 20 shipped</span>
              </div>
              <p className="text-[11px] text-shiny-gold mt-0.5 truncate">{projectStats.totalProjects} in active portfolio</p>
            </div>
            <div className="w-full bg-[#080808] h-1.5 rounded-full overflow-hidden border border-[#1a1a1a]">
              <div className="bg-[#00F0FF] h-full transition-all duration-500" style={{ width: `${projectStats.projectPercent}%` }} />
            </div>
          </div>

          {/* Pillar 4: Study Consistency */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#1a1a1a] hover:border-[#00F0FF]/50 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7DF9FF] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7DF9FF]" />
                Study Hours
              </span>
              <span className="text-xs font-bold text-white">{studyPercent}%</span>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-shiny-gold">
                {telemetry.totalStudyHours} <span className="text-xs font-sans text-[#B8B0AA]">/ 2,000h</span>
              </div>
              <p className="text-[11px] text-[#B8B0AA] mt-0.5">
                Active: {telemetry.activeDaysCount} days ({telemetry.commDays} English)
              </p>
            </div>
            <div className="w-full bg-[#080808] h-1.5 rounded-full overflow-hidden border border-[#1a1a1a]">
              <div className="bg-[#7DF9FF] h-full transition-all duration-500" style={{ width: `${studyPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Track-by-Track Progress Matrix */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00F0FF]" />
              <h3 className="font-serif text-lg font-bold text-white">Curriculum Track Breakdown</h3>
            </div>
            <button
              onClick={() => setShowAllTracks((prev) => !prev)}
              className="text-xs text-shiny-gold hover:underline font-semibold"
            >
              {showAllTracks ? 'Show Featured Tracks' : 'View All 13 Tracks'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Object.entries(TRACK_TITLES)
              .filter(([idStr]) => {
                if (showAllTracks) return true;
                const id = Number(idStr);
                // Feature Tracks 1 (Python), 2 (DSA), 12 (Communication), 5 (Frontend), 6 (Backend), 8 (AI)
                return [1, 2, 5, 6, 8, 12].includes(id);
              })
              .map(([idStr, title]) => {
                const trackId = Number(idStr);
                const stats = curriculumStats.trackBreakdown[trackId] || { total: 0, completed: 0, percent: 0 };
                return (
                  <div 
                    key={trackId}
                    className="p-3 rounded-xl bg-black/60 border border-[#1a1a1a] hover:border-[#00F0FF]/50 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-shiny-gold font-bold uppercase block">
                          Track {trackId}
                        </span>
                        <h4 className="text-xs font-semibold text-white truncate" title={title}>
                          {title.replace(/Track \d+:\s*/, '')}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-shiny-gold bg-[#080808] px-2 py-0.5 rounded border border-[#1a1a1a] shrink-0">
                        {stats.percent}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#B8B0AA]">
                        <span>{stats.completed} of {stats.total} subtopics</span>
                        <span>{stats.total - stats.completed} remaining</span>
                      </div>
                      <div className="w-full bg-[#080808] h-1.5 rounded-full overflow-hidden border border-[#1a1a1a]">
                        <div 
                          className="bg-gradient-to-r from-[#00F0FF] to-[#7DF9FF] h-full transition-all duration-500" 
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 1. DEDICATED DSA PROGRESS CARD */}
      <section className="p-5 sm:p-6 rounded-3xl card-maroon-gold shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black border-2 border-[#00F0FF] flex items-center justify-center text-shiny-gold shadow-md shadow-[#00F0FF]/20">
              <Code2 className="w-5 h-5 text-[#7DF9FF]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                DSA Progress
              </h2>
              <p className="text-xs text-[#B8B0AA] font-sans">
                Cumulative questions solved with Easy, Medium & Hard difficulty breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-black border border-[#00F0FF]/40 text-shiny-gold font-bold flex items-center gap-1.5 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-[#7DF9FF]" />
              Today: {todayLog?.questionsCount || 0} Solved
            </span>
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Solved */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#00F0FF]/40 shadow-inner">
            <span className="text-[11px] font-bold text-[#7DF9FF] uppercase">
              Total Solved
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-shiny-gold mt-1">
              {telemetry.totalDSA}
            </div>
            <span className="text-[11px] text-[#B8B0AA] mt-1 block">Cumulative Problems</span>
          </div>

          {/* Easy */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#006D32]/50 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#39D353] uppercase">
                Easy
              </span>
              <span className="text-xs font-bold text-[#39D353]">{telemetry.easyPct}%</span>
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#39D353] mt-1">
              {telemetry.easyDSA}
            </div>
            <span className="text-[11px] text-[#B8B0AA] mt-1 block">Fundamentals & Basics</span>
          </div>

          {/* Medium */}
          <div className="p-4 rounded-2xl bg-black/80 border border-[#00F0FF]/50 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFD700] uppercase">
                Medium
              </span>
              <span className="text-xs font-bold text-[#FFD700]">{telemetry.medPct}%</span>
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-shiny-gold mt-1">
              {telemetry.medDSA}
            </div>
            <span className="text-[11px] text-[#B8B0AA] mt-1 block">Core Patterns & SDE</span>
          </div>

          {/* Hard */}
          <div className="p-4 rounded-2xl bg-black/80 border border-red-900/50 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-400 uppercase">
                Hard
              </span>
              <span className="text-xs font-bold text-red-400">{telemetry.hardPct}%</span>
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-red-400 mt-1">
              {telemetry.hardDSA}
            </div>
            <span className="text-[11px] text-[#B8B0AA] mt-1 block">Advanced Optimization</span>
          </div>
        </div>

        {/* Visual Stacked Difficulty Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-[#B8B0AA]">
            <span>Difficulty Distribution</span>
            <span className="text-shiny-gold font-bold">{telemetry.totalDSA} total problems</span>
          </div>
          <div className="w-full h-3 bg-black rounded-full overflow-hidden flex border border-[#00F0FF]/40 shadow-inner">
            {telemetry.totalDSA > 0 ? (
              <>
                <div style={{ width: `${telemetry.easyPct}%` }} className="bg-[#26A641] h-full" title={`Easy: ${telemetry.easyDSA}`} />
                <div style={{ width: `${telemetry.medPct}%` }} className="bg-[#00F0FF] h-full shadow-[0_0_8px_rgba(0, 240, 255,0.6)]" title={`Medium: ${telemetry.medDSA}`} />
                <div style={{ width: `${telemetry.hardPct}%` }} className="bg-[#E53E3E] h-full" title={`Hard: ${telemetry.hardDSA}`} />
              </>
            ) : (
              <div className="w-full bg-[#080808] h-full" />
            )}
          </div>
        </div>

        {/* Platforms Attribution */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-black/80 border border-[#00F0FF]/25 flex items-center justify-between text-xs">
            <span className="text-[#B8B0AA]">LeetCode Practice:</span>
            <span className="font-bold text-white">{telemetry.leetcodeCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-black/80 border border-[#00F0FF]/35 flex items-center justify-between text-xs">
            <span className="text-[#B8B0AA]">Striver A2Z Sheet:</span>
            <span className="font-bold text-shiny-gold">{telemetry.striverCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-black/80 border border-[#00F0FF]/25 flex items-center justify-between text-xs">
            <span className="text-[#B8B0AA]">Code & Debug / Other:</span>
            <span className="font-bold text-white">{telemetry.otherCount}</span>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED COMMUNICATION & ENGLISH TELEMETRY CARD */}
      <section className="p-5 sm:p-6 rounded-3xl card-maroon-gold shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black border-2 border-[#00F0FF] flex items-center justify-center text-shiny-gold shadow-md shadow-[#00F0FF]/20">
              <MessageSquare className="w-5 h-5 text-[#7DF9FF]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                Communication & High-Level English
              </h2>
              <p className="text-xs text-[#B8B0AA] font-sans">
                Field engineer communication telemetry: spoken, learned, or heard high-level English
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {todayLog?.communicationPracticed ? (
              <span className="text-xs px-3 py-1.5 rounded-xl btn-shiny-gold font-bold flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                Completed Today
              </span>
            ) : (
              <span className="text-xs px-3 py-1.5 rounded-xl bg-black border border-[#00F0FF]/35 text-[#B8B0AA] font-semibold">
                Pending Today
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-black/80 border border-[#00F0FF]/35">
            <span className="text-[11px] font-bold text-[#7DF9FF] uppercase">
              Total Days Practiced
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-shiny-gold mt-1">
              {telemetry.commDays} <span className="text-sm font-sans text-white">days</span>
            </div>
            <span className="text-[11px] text-[#B8B0AA] mt-1 block">Active immersion</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/80 border border-[#00F0FF]/35">
            <span className="text-[11px] font-bold text-[#7DF9FF] uppercase">
              Consistency Rate
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              {telemetry.activeDaysCount > 0 ? Math.round((telemetry.commDays / telemetry.activeDaysCount) * 100) : 0}%
            </div>
            <span className="text-[11px] text-shiny-gold mt-1 block">Of study days</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/80 border border-[#00F0FF]/35">
            <span className="text-[11px] font-bold text-[#7DF9FF] uppercase">
              FDE Focus
            </span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
              Executive Presence
            </div>
            <span className="text-[11px] text-[#B8B0AA] mt-1 block">Verbal clarity & listening</span>
          </div>
        </div>
      </section>

      {/* 3. STUDY HOURS & TOTALS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] uppercase tracking-wider text-[#7DF9FF] font-bold">
            Total Hours Studied
          </span>
          <div className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-white">
            {telemetry.totalStudyHours} <span className="text-sm font-sans text-shiny-gold">hrs</span>
          </div>
          <span className="text-[11px] text-shiny-gold mt-1 block font-semibold">Since Nov 1, 2026</span>
        </div>

        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] uppercase tracking-wider text-[#7DF9FF] font-bold">
            Active Days
          </span>
          <div className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-shiny-gold">
            {telemetry.activeDaysCount} <span className="text-sm font-sans text-white">days</span>
          </div>
          <span className="text-[11px] text-[#B8B0AA] mt-1 block">Telemetry Logged</span>
        </div>

        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] uppercase tracking-wider text-[#B8B0AA] font-semibold">
            Wasted Recorded
          </span>
          <div className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-[#B8B0AA]">
            {telemetry.totalWastedHours} <span className="text-sm font-sans text-[#B8B0AA]">hrs</span>
          </div>
          <span className="text-[11px] text-[#B8B0AA] mt-1 block">Accountability</span>
        </div>

        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] uppercase tracking-wider text-[#7DF9FF] font-bold">
            Current Streak
          </span>
          <div className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-shiny-gold">
            {telemetry.activeDaysCount > 0 ? 1 : 0} <span className="text-sm font-sans text-white">day</span>
          </div>
          <span className="text-[11px] text-shiny-gold mt-1 block font-semibold">Consecutive Days</span>
        </div>
      </div>

      {/* 4. ACTIVITY HEATMAP (GREEN BOXES 365 DAYS STARTING NOV 1, 2026 EMPTY) */}
      <ActivityHeatmap />
    </div>
  );
};