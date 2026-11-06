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
  const [commNote] = useState('');

  const diffCounts = todayLog?.questionsDifficulty || { easy: 0, medium: 0, hard: 0 };
  const todayTotal = todayLog?.questionsCount || 0;
  const commStatus = todayLog?.communicationPracticed;
  const isCommDone = commStatus === true;
  const isCommNotDone = commStatus === false;

  const handleAdjustDSA = async (delta: number) => {
    await updateDSAQuestions(delta, selectedDifficulty, 'leetcode', today);
    if (delta > 0) {
      triggerGoldSparkle(0.12, 0.6);
    }
  };

  const handleToggleCommunication = async (practiced: boolean) => {
    const nextVal = commStatus === practiced ? undefined : practiced;
    await setCommunicationPracticed(nextVal, commNote || undefined, today);
    if (nextVal === true) {
      triggerGoldSparkle(0.12, 0.7);
    }
  };

  return (
    <div className="rounded-2xl bg-[#080808] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)] p-4 space-y-4 text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Code2 className="w-3.5 h-3.5 text-[#D8B76E]" />
          <span className="tracking-wide">DSA & Communication Practice</span>
        </div>
        <span className="text-[10px] text-[#A3A3A3] font-medium px-2 py-0.5 rounded-md bg-[#121212] border border-white/[0.08]">
          Daily Hub
        </span>
      </div>

      {/* 1. Daily DSA Problems Counter with Difficulty Choice */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A3A3A3] font-medium flex items-center gap-1.5">
            <span>Solved Today</span>
          </span>
          <span className="text-xs text-[#D8B76E] font-semibold tabular-nums">
            Total: {todayTotal}
          </span>
        </div>

        {/* Counter and Difficulty Selector */}
        <div className="flex items-center gap-2">
          {/* Minus & Plus Counter */}
          <div className="flex items-center bg-[#000000] border border-white/10 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
              aria-label="Decrease question"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              onClick={() => handleAdjustDSA(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center btn-gold-luxury transition-all cursor-pointer shadow-sm"
              aria-label="Increase question"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Difficulty Buttons: Easy, Medium, Hard */}
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('easy')}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-medium transition-all border text-center cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-[#000000] text-[#737373] border-white/[0.07] hover:text-[#D4D4D4] hover:border-white/20'
              }`}
            >
              Easy
              <span className="block text-[10px] opacity-80 tabular-nums">{diffCounts.easy || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('medium')}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-medium transition-all border text-center cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-[#D8B76E]/15 text-[#D8B76E] border-[#D8B76E]/40 shadow-sm'
                  : 'bg-[#000000] text-[#737373] border-white/[0.07] hover:text-[#D4D4D4] hover:border-white/20'
              }`}
            >
              Med
              <span className="block text-[10px] opacity-80 tabular-nums">{diffCounts.medium || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('hard')}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-medium transition-all border text-center cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-[#000000] text-[#737373] border-white/[0.07] hover:text-[#D4D4D4] hover:border-white/20'
              }`}
            >
              Hard
              <span className="block text-[10px] opacity-80 tabular-nums">{diffCounts.hard || 0}</span>
            </button>
          </div>
        </div>

        {/* All-time cumulative mini-summary */}
        <div className="text-[11px] text-[#737373] flex items-center justify-between pt-0.5 px-1 tabular-nums">
          <span>All-time: <strong className="text-white font-medium">{cumulativeStats.totalQuestions}</strong> questions</span>
          <span className="text-[#A3A3A3]">E:{cumulativeStats.easy} · M:{cumulativeStats.medium} · H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* 2. Communication & High-Level English Practice */}
      <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-[#D8B76E]" />
          <p className="text-xs text-[#A3A3A3]">
            Did you practice, speak or listen to high-level English today?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all border cursor-pointer ${
              isCommDone
                ? 'btn-gold-luxury shadow-sm'
                : 'bg-[#000000] text-[#737373] border-white/[0.08] hover:text-white hover:border-white/20'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Spoke English</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all border cursor-pointer ${
              isCommNotDone
                ? 'bg-red-950/40 border-red-500/40 text-red-300 font-semibold shadow-sm'
                : 'bg-[#000000] text-[#737373] border-white/[0.08] hover:text-red-300 hover:border-red-500/20'
            }`}
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Did Not Practice</span>
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-[11px] flex items-center justify-between px-1 text-[#737373] min-h-[16px]">
          {isCommDone ? (
            <span className="text-[#D8B76E] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8B76E]" />
              English practiced today
            </span>
          ) : isCommNotDone ? (
            <span className="text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Not completed today
            </span>
          ) : (
            <span>Tap to record today's practice</span>
          )}
          <span className="tabular-nums">Total: {cumulativeStats.commDays}d</span>
        </div>
      </div>
    </div>
  );
};
