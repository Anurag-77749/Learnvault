import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Code2, 
  MessageSquare, 
  Check, 
  X, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import { db, getTodayDateString } from '../services/db';
import { updateDSAQuestions, setCommunicationPracticed } from '../services/dailyLogService';
import { triggerGoldSparkle } from '../utils/confetti';

interface DailyDsaCommunicationWidgetProps {
  compact?: boolean;
}

export const DailyDsaCommunicationWidget: React.FC<DailyDsaCommunicationWidgetProps> = () => {
  const today = getTodayDateString();

  const todayLog = useLiveQuery(() => db.dailyLogs.get(today), [today]);
  const allLogs = useLiveQuery(() => db.dailyLogs.toArray()) || [];

  // Compute cumulative stats
  const cumulativeStats = React.useMemo(() => {
    let totalQuestions = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;
    let commDays = 0;

    allLogs.forEach((log) => {
      const qCount = log.questionsCount || 0;
      totalQuestions += qCount;
      if (log.questionsDifficulty) {
        easy += log.questionsDifficulty.easy || 0;
        medium += log.questionsDifficulty.medium || 0;
        hard += log.questionsDifficulty.hard || 0;
      }
      if (log.communicationPracticed) {
        commDays += 1;
      }
    });

    return { totalQuestions, easy, medium, hard, commDays };
  }, [allLogs]);

  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const diffCounts = todayLog?.questionsDifficulty || { easy: 0, medium: 0, hard: 0 };
  const todayTotal = todayLog?.questionsCount || 0;
  const commStatus = todayLog?.communicationPracticed;
  const isCommDone = commStatus === true;
  const isCommNotDone = commStatus === false;

  const handleAdjustDSA = async (delta: number) => {
    await updateDSAQuestions(delta, selectedDifficulty, 'leetcode', today);
    if (delta > 0) {
      triggerGoldSparkle(0.15, 0.6);
    }
  };

  const handleToggleCommunication = async (practiced: boolean) => {
    const nextVal = commStatus === practiced ? undefined : practiced;
    await setCommunicationPracticed(nextVal, undefined, today);
    if (nextVal === true) {
      triggerGoldSparkle(0.15, 0.75);
    }
  };

  return (
    <div className="rounded-3xl card-glass p-4 sm:p-5 space-y-4 text-left font-sans shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
              DSA & Communication
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Daily Target Control</span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
          DAILY
        </span>
      </div>

      {/* 1. Daily DSA Problems Counter with Difficulty Choice */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold flex items-center gap-1.5 text-xs">
            <span className="font-mono text-indigo-600 font-bold">&lt;/&gt;</span> LeetCode / Problems
          </span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
            Today: {todayTotal}
          </span>
        </div>

        {/* Counter and Difficulty Segmented Control */}
        <div className="flex items-center gap-2">
          {/* Stepper (- 0 +) */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer"
              aria-label="Decrease question"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900 font-mono tabular-nums">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              onClick={() => handleAdjustDSA(1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm shadow-blue-500/25"
              aria-label="Increase question"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Segmented Pill Toggles: Easy | Med | Hard */}
          <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('easy')}
              className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all text-center cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Easy
              <span className="block text-[9px] font-mono opacity-90">{diffCounts.easy || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('medium')}
              className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all text-center cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Med
              <span className="block text-[9px] font-mono opacity-90">{diffCounts.medium || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('hard')}
              className={`py-1.5 rounded-xl text-[11px] font-semibold transition-all text-center cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-rose-500 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Hard
              <span className="block text-[9px] font-mono opacity-90">{diffCounts.hard || 0}</span>
            </button>
          </div>
        </div>

        {/* All-time cumulative mini-summary */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 px-1 font-mono">
          <span>All-time: <strong className="text-slate-800">{cumulativeStats.totalQuestions}</strong></span>
          <span className="text-indigo-600 font-semibold">E:{cumulativeStats.easy} M:{cumulativeStats.medium} H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* 2. Communication & High-Level English Practice */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-slate-700 leading-snug">
            Today did you <span className="font-bold text-slate-900">speak, hear or practice high-level English</span>?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isCommDone
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/25 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm'
            }`}
            title={isCommDone ? 'Click to uncheck' : 'Mark English practiced today'}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yes, Done</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isCommNotDone
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 shadow-sm'
            }`}
            title={isCommNotDone ? 'Click to uncheck' : "Mark didn't complete today"}
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Didn't Complete</span>
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-[11px] font-mono flex items-center justify-between px-1">
          {isCommDone ? (
            <span className="text-emerald-600 flex items-center gap-1 font-sans font-medium">✨ Practice logged</span>
          ) : isCommNotDone ? (
            <span className="text-rose-600 flex items-center gap-1 font-sans font-medium">✕ Not completed</span>
          ) : (
            <span className="text-slate-400 font-sans">Tap to record status</span>
          )}
          <span className="text-slate-500">Streak: {cumulativeStats.commDays}d</span>
        </div>
      </div>
    </div>
  );
};
