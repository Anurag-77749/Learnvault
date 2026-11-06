import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Check, 
  X, 
  Plus, 
  Minus,
  Code2
} from 'lucide-react';
import { db, getTodayDateString } from '../services/db';
import { updateDSAQuestions, setCommunicationPracticed } from '../services/dailyLogService';
import { triggerGoldSparkle } from '../utils/confetti';
import { SpringCounter } from './SpringCounter';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';

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
    <Interactive3DTiltCard maxTilt={3} glowColor="rgba(212, 175, 55, 0.12)" className="w-full">
      <div className="p-5 space-y-4">
        {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-mono font-bold text-xs tracking-wider text-[#D4AF37] uppercase">
            DSA & COMMUNICATION
          </span>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#000000] text-[#9E958E] border border-[rgba(255,255,255,0.08)] font-bold uppercase tracking-wider">
          Daily
        </span>
      </div>

      {/* DSA Problems Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]/90 font-medium">
            &lt;/&gt; Problems Today
          </span>
          <span className="text-xs font-mono text-[#9E958E]">
            Total: <strong className="text-[#F5F2EB] font-bold"><SpringCounter value={todayTotal} /></strong>
          </span>
        </div>

        {/* Stepper & Segmented Pills */}
        <div className="flex items-center gap-2">
          {/* Tactile Stepper */}
          <div className="flex items-center bg-[#000000] border border-[rgba(255,255,255,0.08)] rounded-lg p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#9E958E] hover:text-[#F5F2EB] disabled:opacity-20 hover:bg-white/[0.04] transition-all cursor-pointer"
              title="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-mono font-bold text-xs text-[#F5F2EB] tabular-nums">
              <SpringCounter value={diffCounts[selectedDifficulty]} />
            </span>
            <button
              type="button"
              onClick={() => handleAdjustDSA(1)}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-gradient-to-br from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] text-[#000000] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Increase"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Segmented Difficulty Matrix */}
          <div className="flex-1 grid grid-cols-3 gap-1 bg-[#000000] p-0.5 rounded-lg border border-[rgba(255,255,255,0.06)] shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('easy');
                handleAdjustDSA(1, 'easy');
              }}
              className={`py-1.5 px-1 rounded-md text-center transition-all cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-[#121212] border border-[#D4AF37]/50 text-[#F6E6C2] shadow-sm'
                  : 'text-[#9E958E] hover:text-[#F5F2EB] border border-transparent hover:bg-white/[0.02]'
              }`}
            >
              <div className="text-[9px] font-mono uppercase font-bold tracking-tight">Easy</div>
              <div className="text-xs font-mono font-bold text-[#F5F2EB] tabular-nums">
                <SpringCounter value={diffCounts.easy} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('medium');
                handleAdjustDSA(1, 'medium');
              }}
              className={`py-1.5 px-1 rounded-md text-center transition-all cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-[#121212] border border-[#D4AF37]/50 text-[#F6E6C2] shadow-sm'
                  : 'text-[#9E958E] hover:text-[#F5F2EB] border border-transparent hover:bg-white/[0.02]'
              }`}
            >
              <div className="text-[9px] font-mono uppercase font-bold tracking-tight">Med</div>
              <div className="text-xs font-mono font-bold text-[#F5F2EB] tabular-nums">
                <SpringCounter value={diffCounts.medium} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('hard');
                handleAdjustDSA(1, 'hard');
              }}
              className={`py-1.5 px-1 rounded-md text-center transition-all cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-[#121212] border border-[#D4AF37]/50 text-[#F6E6C2] shadow-sm'
                  : 'text-[#9E958E] hover:text-[#F5F2EB] border border-transparent hover:bg-white/[0.02]'
              }`}
            >
              <div className="text-[9px] font-mono uppercase font-bold tracking-tight">Hard</div>
              <div className="text-xs font-mono font-bold text-[#F5F2EB] tabular-nums">
                <SpringCounter value={diffCounts.hard} />
              </div>
            </button>
          </div>
        </div>

        {/* All-time telemetry */}
        <div className="text-[10px] font-mono text-[#55504A] flex items-center justify-between pt-1">
          <span>All-time: <strong className="text-[#9E958E]"><SpringCounter value={cumulativeStats.totalQuestions} /></strong></span>
          <span>E:{cumulativeStats.easy} M:{cumulativeStats.medium} H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* English Daily Check-in Toggle */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-2">
        <p className="text-[11px] font-sans text-[#9E958E] leading-snug">
          Today did you minimum speak, learn or hear high-level English?
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isCommNotDone
                ? 'bg-[#180A0C] border-[#E5A970]/50 text-[#E5A970] shadow-sm'
                : 'bg-[#000000] border-[rgba(255,255,255,0.06)] text-[#9E958E] hover:text-[#F5F2EB] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <X className="w-3.5 h-3.5 text-[#E5A970]" />
            <span>Didn't</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isCommDone
                ? 'bg-gradient-to-r from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] border-transparent text-[#000000] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                : 'bg-[#000000] border-[rgba(255,255,255,0.06)] text-[#D4AF37] hover:border-[#D4AF37]/40'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Done</span>
          </button>
        </div>
      </div>
      </div>
    </Interactive3DTiltCard>
  );
};
