import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Check, 
  X, 
  Plus, 
  Minus,
  MessageSquare,
  Code2
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

  const handleAdjustDSA = async (delta: number, diff = selectedDifficulty) => {
    await updateDSAQuestions(delta, diff, 'leetcode', today);
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
    <div className="space-y-4">
      {/* 1. DSA GRINDING SYNTHESIZER CARD (FROSTED GLASS) */}
      <div className="bento-ceramic p-5 space-y-4 relative overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white flex items-center justify-center">
              <Code2 className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white tracking-tight">
                DSA Synthesizer
              </h3>
              <p className="text-[10px] font-mono text-slate-400">LeetCode / Problems</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            ALL-TIME: <strong className="text-white">{cumulativeStats.totalQuestions}</strong>
          </span>
        </div>

        {/* Big Number & Master Stepper */}
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              PROBLEMS SOLVED TODAY
            </span>
            <div className="font-mono tabular-nums font-black text-5xl text-white tracking-tight leading-none mt-1">
              {todayTotal}
            </div>
          </div>

          {/* Stepper (- / +) */}
          <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all cursor-pointer"
              title="Decrease problem count"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-white tabular-nums">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              type="button"
              onClick={() => handleAdjustDSA(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer shadow-sm shadow-indigo-500/30"
              title="Increase problem count"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* 3-Segment Difficulty Matrix */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            DIFFICULTY MATRIX (TAP TO +1)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* EASY */}
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('easy');
                handleAdjustDSA(1, 'easy');
              }}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-emerald-500/30'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-emerald-400 block">EASY</span>
              <span className="font-mono tabular-nums font-bold text-lg text-white">
                {diffCounts.easy || 0}
              </span>
            </button>

            {/* MEDIUM */}
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('medium');
                handleAdjustDSA(1, 'medium');
              }}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-indigo-500/15 border-indigo-500/40 shadow-sm'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/30'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-indigo-400 block">MED</span>
              <span className="font-mono tabular-nums font-bold text-lg text-white">
                {diffCounts.medium || 0}
              </span>
            </button>

            {/* HARD */}
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('hard');
                handleAdjustDSA(1, 'hard');
              }}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-rose-500/15 border-rose-500/40 shadow-sm'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-rose-500/30'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-rose-400 block">HARD</span>
              <span className="font-mono tabular-nums font-bold text-lg text-white">
                {diffCounts.hard || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HIGH-LEVEL ENGLISH & COMMUNICATION CHECK-IN CARD */}
      <div className="bento-ceramic p-5 space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-white flex items-center justify-center border border-white/[0.08]">
              <MessageSquare className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white tracking-tight">
                English Check-In
              </h3>
              <p className="text-[10px] font-mono text-slate-400">Habit Stamp Protocol</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-400">
            🔥 {cumulativeStats.commDays}D STREAK
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-snug">
          Did you <strong className="text-white">speak, learn, or hear high-level English</strong> today?
        </p>

        {/* Two Satisfying Tactile Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isCommDone
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 scale-[1.02]'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:border-emerald-500/40 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>YES — LOGGED</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isCommNotDone
                ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-md scale-[1.02]'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:border-white/20'
            }`}
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
            <span>NOT YET</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 text-center pt-1">
          {isCommDone ? (
            <span className="text-emerald-400 font-bold">✓ VERIFIED FOR TODAY</span>
          ) : isCommNotDone ? (
            <span className="text-rose-400 font-bold">✕ PENDING COMPLETION</span>
          ) : (
            <span>TAP TO RECORD DAILY STATUS</span>
          )}
        </div>
      </div>
    </div>
  );
};
