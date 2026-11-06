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
    <div className="rounded-2xl crimson-glass p-4 space-y-4 border border-[#E5B84B]/20 shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5B84B]/15">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#E5B84B]" />
          <span className="font-mono font-bold text-xs tracking-wider text-[#E5B84B] uppercase">
            DSA & COMMUNICATION
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5B84B]/15 text-[#F9D976] border border-[#E5B84B]/30 font-bold uppercase">
          Daily
        </span>
      </div>

      {/* DSA Problems Today */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#D4AF37]/90 font-medium">
            &lt;/&gt; DSA Problems Today
          </span>
          <span className="text-xs font-mono text-[#BFA997]">
            Total: <strong className="text-white font-bold"><SpringCounter value={todayTotal} /></strong>
          </span>
        </div>

        {/* Stepper & Counts */}
        <div className="flex items-center gap-3">
          {/* Stepper */}
          <div className="flex items-center bg-[#150406] border border-[#E5B84B]/30 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#BFA997] hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-mono font-bold text-xs text-white">
              <SpringCounter value={diffCounts[selectedDifficulty]} />
            </span>
            <button
              type="button"
              onClick={() => handleAdjustDSA(1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#E5B84B] to-[#F9D976] text-black font-black hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Difficulty Matrix Buttons */}
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('easy');
                handleAdjustDSA(1, 'easy');
              }}
              className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-[#E5B84B]/20 border-[#E5B84B] text-[#F9D976]'
                  : 'bg-[#150406]/60 border-[#E5B84B]/15 text-[#BFA997] hover:border-[#E5B84B]/40'
              }`}
            >
              <div className="text-[9px] font-mono font-bold">Easy</div>
              <div className="text-xs font-mono font-black text-white">
                <SpringCounter value={diffCounts.easy} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('medium');
                handleAdjustDSA(1, 'medium');
              }}
              className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-[#E5B84B]/20 border-[#E5B84B] text-[#F9D976]'
                  : 'bg-[#150406]/60 border-[#E5B84B]/15 text-[#BFA997] hover:border-[#E5B84B]/40'
              }`}
            >
              <div className="text-[9px] font-mono font-bold">Med</div>
              <div className="text-xs font-mono font-black text-white">
                <SpringCounter value={diffCounts.medium} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty('hard');
                handleAdjustDSA(1, 'hard');
              }}
              className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-[#E5B84B]/20 border-[#E5B84B] text-[#F9D976]'
                  : 'bg-[#150406]/60 border-[#E5B84B]/15 text-[#BFA997] hover:border-[#E5B84B]/40'
              }`}
            >
              <div className="text-[9px] font-mono font-bold">Hard</div>
              <div className="text-xs font-mono font-black text-white">
                <SpringCounter value={diffCounts.hard} />
              </div>
            </button>
          </div>
        </div>

        {/* All-time telemetry */}
        <div className="text-[10px] font-mono text-[#A89279] flex items-center justify-between pt-1">
          <span>All-time: <strong className="text-white"><SpringCounter value={cumulativeStats.totalQuestions} /></strong></span>
          <span>E:{cumulativeStats.easy} M:{cumulativeStats.medium} H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* English Daily Check-in Toggle */}
      <div className="pt-2 border-t border-[#E5B84B]/15 space-y-2">
        <p className="text-[11px] font-sans text-[#E0D2C0] leading-snug">
          Today did you minimum speak, learn or hear high-level English?
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleCommunication(false)}
            className={`py-1.5 px-3 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isCommNotDone
                ? 'bg-[#3A0A10] border-red-500/60 text-red-200'
                : 'bg-[#150406]/80 border-[#E5B84B]/20 text-[#BFA997] hover:border-[#E5B84B]/40'
            }`}
          >
            <X className="w-3 h-3 text-red-400" />
            <span>Didn't</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleCommunication(true)}
            className={`py-1.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isCommDone
                ? 'bg-gradient-to-r from-[#E5B84B] to-[#F9D976] border-[#F9D976] text-black shadow-[0_0_15px_rgba(229,184,75,0.4)]'
                : 'bg-[#150406]/80 border-[#E5B84B]/20 text-[#F9D976] hover:border-[#E5B84B]/40'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
