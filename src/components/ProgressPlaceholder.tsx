import React from 'react';
import { BarChart3, Clock, Sparkles } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { ActivityHeatmap } from './ActivityHeatmap';

export const ProgressPlaceholder: React.FC = () => {
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];
  
  const totalStudyMinutes = allLogs.reduce((acc, l) => acc + (l.studyMinutes || 0), 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const totalWastedMinutes = allLogs.reduce((acc, l) => acc + (l.wastedMinutes || 0), 0);
  const totalQuestions = allLogs.reduce((acc, l) => acc + (l.questionsCount || 0), 0);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      <div className="pt-2">
        <span className="text-xs uppercase tracking-widest text-[#FF5500] font-semibold flex items-center gap-1.5 mb-1 font-sans">
          <BarChart3 className="w-3.5 h-3.5" /> Analytics & 4-Year Totals
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F9F6EE]">
          Progress & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#A09D95] font-sans mt-0.5">
          Longitudinal telemetry across your 4-year journey (Stages 3 & 4 full charts activation)
        </p>
      </div>

      {/* Totals Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5500]/30 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#A09D95] font-semibold">
            Total Hours Studied
          </span>
          <div className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#F9F6EE]">
            {totalStudyHours} <span className="text-sm font-sans text-[#FF5500]">hrs</span>
          </div>
          <span className="text-[11px] text-[#FF5500] mt-1 block">Since Day 1</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5500]/30 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#A09D95] font-semibold">
            Questions Solved
          </span>
          <div className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#FF5500]">
            {totalQuestions}
          </div>
          <span className="text-[11px] text-[#A09D95] mt-1 block">DSA Problems</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5500]/30 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#A09D95] font-semibold">
            Wasted Recorded
          </span>
          <div className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#A09D95]">
            {Math.round(totalWastedMinutes / 60)} <span className="text-sm font-sans text-[#A09D95]">hrs</span>
          </div>
          <span className="text-[11px] text-[#A09D95] mt-1 block">Accountability</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#FF5500]/30 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-[#A09D95] font-semibold">
            Current Streak
          </span>
          <div className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#FF5500]">
            {allLogs.filter(l => (l.studyMinutes || 0) > 0 || (l.questionsCount || 0) > 0).length > 0 ? 1 : 0} <span className="text-sm font-sans text-[#F9F6EE]">day</span>
          </div>
          <span className="text-[11px] text-[#FF5500] mt-1 block">Active Telemetry</span>
        </div>
      </div>

      {/* Real Live 365-Day Activity Heatmap */}
      <ActivityHeatmap />
    </div>
  );
};
