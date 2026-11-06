import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Terminal, 
  Check, 
  X, 
  Plus, 
  Minus,
  Radio
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
    <div className="rounded-lg hud-panel hud-corner p-3.5 space-y-3 font-mono text-left">
      {/* Unit Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#00F0FF]/15">
        <div className="flex items-center gap-1.5 text-xs text-[#00F0FF] font-bold">
          <Terminal className="w-3.5 h-3.5 text-[#00FF9D]" />
          <span>DSA & COMM PROTOCOL</span>
        </div>
        <span className="text-[10px] text-[#00FF9D] font-bold px-1.5 py-0.2 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/30">
          DAILY
        </span>
      </div>

      {/* 1. Daily DSA Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#84A5B5] flex items-center gap-1">
            <span className="text-[#00F0FF]">&gt;</span> PROBLEMS TODAY
          </span>
          <span className="text-xs font-bold text-[#00FF9D] bg-[#04080A] px-2 py-0.5 rounded border border-[#00FF9D]/30">
            TOTAL: {todayTotal}
          </span>
        </div>

        {/* Counter and Segmented Difficulty Control */}
        <div className="flex items-center gap-2">
          {/* Stepper */}
          <div className="flex items-center bg-[#04080A] border border-[#00F0FF]/25 rounded p-0.5">
            <button
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-7 h-7 rounded flex items-center justify-center text-[#5A7E8D] hover:text-[#00F0FF] hover:bg-[#09151B] disabled:opacity-20 transition-all cursor-pointer"
              aria-label="Decrease question"
            >
              <Minus className="w-3 h-3 stroke-[3]" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-[#00F0FF] font-mono tabular-nums">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              onClick={() => handleAdjustDSA(1)}
              className="w-7 h-7 rounded flex items-center justify-center text-[#030708] bg-[#00FF9D] hover:bg-[#00F0FF] transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,157,0.4)]"
              aria-label="Increase question"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>

          {/* Difficulty Pills: EASY | MED | HARD */}
          <div className="flex-1 grid grid-cols-3 gap-1 bg-[#04080A] p-0.5 rounded border border-[#00F0FF]/15">
            <button
              type="button"
              onClick={() => setSelectedDifficulty('easy')}
              className={`py-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-[#00FF9D] text-[#030708] shadow-[0_0_6px_rgba(0,255,157,0.4)]'
                  : 'text-[#5A7E8D] hover:text-[#D4ECF4]'
              }`}
            >
              EASY
              <span className="block text-[9px] opacity-80">{diffCounts.easy || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('medium')}
              className={`py-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-[#00F0FF] text-[#030708] shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                  : 'text-[#5A7E8D] hover:text-[#D4ECF4]'
              }`}
            >
              MED
              <span className="block text-[9px] opacity-80">{diffCounts.medium || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty('hard')}
              className={`py-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-[#FF2A55] text-white shadow-[0_0_6px_rgba(255,42,85,0.4)]'
                  : 'text-[#5A7E8D] hover:text-[#D4ECF4]'
              }`}
            >
              HARD
              <span className="block text-[9px] opacity-80">{diffCounts.hard || 0}</span>
            </button>
          </div>
        </div>

        {/* All-time cumulative mini-summary */}
        <div className="text-[10px] text-[#5A7E8D] flex items-center justify-between pt-0.5 px-0.5">
          <span>ALL-TIME: <strong className="text-white">{cumulativeStats.totalQuestions}</strong></span>
          <span className="text-[#00F0FF]">E:{cumulativeStats.easy} M:{cumulativeStats.medium} H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* 2. English High-Level Communication */}
      <div className="pt-2.5 border-t border-[#00F0FF]/15 space-y-2">
        <div className="flex items-start gap-1.5 text-xs text-[#84A5B5] leading-snug">
          <Radio className="w-3.5 h-3.5 text-[#00F0FF] shrink-0 mt-0.5" />
          <span>TODAY: High-level English speech / listening practiced?</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isCommDone
                ? 'bg-[#00FF9D] text-[#030708] border-[#00FF9D] shadow-[0_0_8px_rgba(0,255,157,0.35)]'
                : 'bg-[#04080A] text-[#84A5B5] border-[#00F0FF]/20 hover:border-[#00FF9D] hover:text-[#00FF9D]'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>[✓] VERIFIED</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isCommNotDone
                ? 'bg-[#FF2A55]/20 border-[#FF2A55] text-[#FF2A55] shadow-[0_0_8px_rgba(255,42,85,0.3)]'
                : 'bg-[#04080A] text-[#84A5B5] border-[#00F0FF]/20 hover:border-[#FF2A55] hover:text-[#FF2A55]'
            }`}
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
            <span>[✕] MISSED</span>
          </button>
        </div>

        {/* Status Line */}
        <div className="text-[10px] flex items-center justify-between px-0.5">
          {isCommDone ? (
            <span className="text-[#00FF9D]">STATUS: LOGGED [PASS]</span>
          ) : isCommNotDone ? (
            <span className="text-[#FF2A55]">STATUS: NOT LOGGED [FAIL]</span>
          ) : (
            <span className="text-[#486877]">AWAITING LOG...</span>
          )}
          <span className="text-[#5A7E8D]">STREAK: {cumulativeStats.commDays}D</span>
        </div>
      </div>
    </div>
  );
};
