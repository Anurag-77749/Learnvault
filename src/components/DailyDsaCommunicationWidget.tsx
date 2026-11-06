import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Code2, 
  MessageSquare, 
  Check, 
  X, 
  Plus, 
  Minus
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
    // If clicking the already selected choice, toggle back to undefined
    const nextVal = commStatus === practiced ? undefined : practiced;
    await setCommunicationPracticed(nextVal, undefined, today);
    if (nextVal === true) {
      triggerGoldSparkle(0.15, 0.75);
    }
  };

  return (
    <div className="rounded-xl card-obsidian p-3 space-y-3 text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,240,220,0.06)]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F5F2EB]">
          <Code2 className="w-3.5 h-3.5 text-[#E5A970]" />
          <span className="uppercase tracking-wider">DSA & Communication</span>
        </div>
        <span className="text-[9px] font-mono font-medium text-[#E5A970] px-1.5 py-0.5 rounded-full bg-[#181313] border border-[rgba(229,169,112,0.25)]">
          DAILY
        </span>
      </div>

      {/* 1. Daily DSA Problems Counter with Difficulty Choice */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#9E958E] font-medium flex items-center gap-1 text-[11px]">
            <span className="font-mono text-[#E5A970]">&lt;/&gt;</span> DSA Today
          </span>
          <span className="text-[11px] font-mono font-bold text-champagne">
            Total: {todayTotal}
          </span>
        </div>

        {/* Counter and Difficulty Segmented Control */}
        <div className="flex items-center gap-1.5">
          {/* Stepper (- 0 +) */}
          <div className="flex items-center bg-[#070606] border border-[rgba(255,240,220,0.08)] rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#9E958E] hover:text-[#F5F2EB] hover:bg-white/5 disabled:opacity-20 transition-all cursor-pointer"
              aria-label="Decrease question"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-[#F5F2EB] font-mono tabular-nums">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              onClick={() => handleAdjustDSA(1)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#090808] bg-gradient-to-br from-[#F6E6C2] to-[#D4AF37] hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm"
              aria-label="Increase question"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Segmented Pill Toggles: Easy | Med | Hard */}
          <div className="flex-1 grid grid-cols-3 gap-1 bg-[#070606] p-0.5 rounded-lg border border-[rgba(255,240,220,0.06)]">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('easy')}
              className={`py-1 rounded-md text-[10px] font-medium transition-all text-center cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-[#0E2016] text-[#6ee7b7] border border-[#059669]/40 shadow-sm font-semibold'
                  : 'text-[#9E958E] hover:text-[#F5F2EB]'
              }`}
            >
              Easy
              <span className="block text-[9px] font-mono opacity-80">{diffCounts.easy || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('medium')}
              className={`py-1 rounded-md text-[10px] font-medium transition-all text-center cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-[rgba(212,175,55,0.12)] text-[#F6E6C2] border border-[rgba(212,175,55,0.35)] shadow-sm font-semibold'
                  : 'text-[#9E958E] hover:text-[#F5F2EB]'
              }`}
            >
              Med
              <span className="block text-[9px] font-mono opacity-80">{diffCounts.medium || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('hard')}
              className={`py-1 rounded-md text-[10px] font-medium transition-all text-center cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-[#220B10] text-[#fca5a5] border border-red-500/35 shadow-sm font-semibold'
                  : 'text-[#9E958E] hover:text-[#F5F2EB]'
              }`}
            >
              Hard
              <span className="block text-[9px] font-mono opacity-80">{diffCounts.hard || 0}</span>
            </button>
          </div>
        </div>

        {/* All-time cumulative mini-summary */}
        <div className="text-[10px] text-[#9E958E] flex items-center justify-between pt-0.5 px-0.5 font-mono">
          <span>All-time: <strong className="text-[#F5F2EB]">{cumulativeStats.totalQuestions}</strong></span>
          <span className="text-[#E5A970]">E:{cumulativeStats.easy} M:{cumulativeStats.medium} H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* 2. Communication & High-Level English Practice */}
      <div className="pt-2 border-t border-[rgba(255,240,220,0.06)] space-y-2">
        <div className="flex items-start gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#E5A970] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#F5F2EB] leading-snug">
            Today did you <span className="text-[#F6E6C2] font-semibold">speak, learn or hear high-level English</span>?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isCommDone
                ? 'btn-champagne text-[#090808] font-bold shadow-sm'
                : 'bg-[#0B0909] text-[#9E958E] border-[rgba(255,240,220,0.07)] hover:border-[rgba(212,175,55,0.4)] hover:text-[#F5F2EB]'
            }`}
            title={isCommDone ? 'Click to uncheck' : 'Mark English practiced today'}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yes, Done</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isCommNotDone
                ? 'bg-[#200A0E] border-red-500/40 text-[#fca5a5] font-semibold shadow-sm'
                : 'bg-[#0B0909] text-[#9E958E] border-[rgba(255,240,220,0.07)] hover:border-red-500/30 hover:text-[#fca5a5]'
            }`}
            title={isCommNotDone ? 'Click to uncheck' : "Mark didn't complete today"}
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Didn't Complete</span>
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-[10px] font-mono flex items-center justify-between px-0.5 min-h-[16px]">
          {isCommDone ? (
            <span className="text-champagne flex items-center gap-1 font-sans">✨ English practiced</span>
          ) : isCommNotDone ? (
            <span className="text-red-400/90 flex items-center gap-1 font-sans">✕ Not practiced</span>
          ) : (
            <span className="text-[#635B55] font-sans">Tap to record</span>
          )}
          <span className="text-[#9E958E]">All-time: {cumulativeStats.commDays}d</span>
        </div>
      </div>
    </div>
  );
};
