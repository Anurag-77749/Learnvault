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
      {/* 1. DSA GRINDING SYNTHESIZER CARD */}
      <div className="bento-ceramic p-5 space-y-4 relative overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E3DC]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#111110] text-white flex items-center justify-center">
              <Code2 className="w-4 h-4 text-[#FF4F00]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#111110] tracking-tight">
                DSA SYNTHESIZER
              </h3>
              <p className="text-[10px] font-mono text-[#A39E93]">LEETCODE / PROBLEMS</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#68645E]">
            ALL-TIME: <strong className="text-[#111110]">{cumulativeStats.totalQuestions}</strong>
          </span>
        </div>

        {/* Big Number & Master Stepper */}
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A39E93] block">
              PROBLEMS SOLVED TODAY
            </span>
            <div className="font-display font-black text-6xl text-[#111110] tracking-tighter leading-none mt-1">
              {todayTotal}
            </div>
          </div>

          {/* Stepper (- / +) */}
          <div className="flex items-center bg-[#F7F5F0] border border-[#E6E3DC] rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#68645E] hover:text-[#111110] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
              title="Decrease problem count"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-[#111110] tabular-nums">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              type="button"
              onClick={() => handleAdjustDSA(1)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white bg-[#FF4F00] hover:bg-[#FF621E] active:scale-95 transition-all cursor-pointer shadow-sm shadow-[#FF4F00]/30"
              title="Increase problem count"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* 3-Segment Difficulty Matrix: Click directly to increment! */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A39E93] block">
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
                  ? 'bg-emerald-50 border-[#10B981] shadow-sm'
                  : 'bg-[#F7F5F0] border-[#E6E3DC] hover:border-[#10B981]'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-[#10B981] block">EASY</span>
              <span className="font-display font-extrabold text-xl text-[#111110]">
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
                  ? 'bg-amber-50 border-[#FF4F00] shadow-sm'
                  : 'bg-[#F7F5F0] border-[#E6E3DC] hover:border-[#FF4F00]'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-[#FF4F00] block">MED</span>
              <span className="font-display font-extrabold text-xl text-[#111110]">
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
                  ? 'bg-rose-50 border-rose-500 shadow-sm'
                  : 'bg-[#F7F5F0] border-[#E6E3DC] hover:border-rose-500'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-rose-600 block">HARD</span>
              <span className="font-display font-extrabold text-xl text-[#111110]">
                {diffCounts.hard || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HIGH-LEVEL ENGLISH & COMMUNICATION CHECK-IN CARD */}
      <div className="bento-ceramic p-5 space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E3DC]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F7F5F0] text-[#111110] flex items-center justify-center border border-[#E6E3DC]">
              <MessageSquare className="w-4 h-4 text-[#FF4F00]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-[#111110] tracking-tight">
                ENGLISH CHECK-IN
              </h3>
              <p className="text-[10px] font-mono text-[#A39E93]">HABIT STAMP PROTOCOL</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#10B981]">
            🔥 {cumulativeStats.commDays}D STREAK
          </span>
        </div>

        <p className="text-xs text-[#68645E] leading-snug font-sans">
          Did you <strong className="text-[#111110]">speak, learn, or hear high-level English</strong> today?
        </p>

        {/* Two Satisfying Tactile Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-3 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isCommDone
                ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/25 scale-[1.02]'
                : 'bg-[#F7F5F0] text-[#111110] border-[#E6E3DC] hover:border-[#10B981]'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>YES — LOGGED</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-3 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isCommNotDone
                ? 'bg-[#111110] text-[#FF4F00] border-[#111110] shadow-md scale-[1.02]'
                : 'bg-[#F7F5F0] text-[#68645E] border-[#E6E3DC] hover:border-[#111110]'
            }`}
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>NOT YET</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#A39E93] text-center pt-1">
          {isCommDone ? (
            <span className="text-[#10B981] font-bold">✓ VERIFIED FOR TODAY</span>
          ) : isCommNotDone ? (
            <span className="text-rose-500 font-bold">✕ PENDING COMPLETION</span>
          ) : (
            <span>TAP TO RECORD DAILY STATUS</span>
          )}
        </div>
      </div>
    </div>
  );
};
