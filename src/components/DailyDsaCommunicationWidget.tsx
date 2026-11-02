import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Code2, 
  MessageSquare, 
  Check, 
  X, 
  Plus, 
  Minus, 
  Sparkles,
  Flame,
  ChevronRight
} from 'lucide-react';
import { db, getTodayDateString } from '../services/db';
import { updateDSAQuestions, setCommunicationPracticed } from '../services/dailyLogService';
import { triggerGoldSparkle } from '../utils/confetti';

interface DailyDsaCommunicationWidgetProps {
  compact?: boolean;
}

export const DailyDsaCommunicationWidget: React.FC<DailyDsaCommunicationWidgetProps> = ({
  compact = false,
}) => {
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
  const [commNote, setCommNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const diffCounts = todayLog?.questionsDifficulty || { easy: 0, medium: 0, hard: 0 };
  const todayTotal = todayLog?.questionsCount || 0;
  const isCommDone = Boolean(todayLog?.communicationPracticed);

  const handleAdjustDSA = async (delta: number) => {
    await updateDSAQuestions(delta, selectedDifficulty, 'leetcode', today);
    if (delta > 0) {
      triggerGoldSparkle(0.15, 0.6);
    }
  };

  const handleToggleCommunication = async (practiced: boolean) => {
    await setCommunicationPracticed(practiced, commNote || undefined, today);
    if (practiced) {
      triggerGoldSparkle(0.15, 0.75);
    }
  };

  return (
    <div className="rounded-2xl card-maroon-gold p-3.5 space-y-3.5 shadow-md text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#360A0F]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-shiny-gold">
          <Code2 className="w-3.5 h-3.5 text-[#FFDF73]" />
          <span className="uppercase tracking-wider">DSA & Communication</span>
        </div>
        <span className="text-[10px] text-shiny-gold font-semibold px-2 py-0.5 rounded-full bg-[#000000] border border-[#D4AF37]/30">Daily</span>
      </div>

      {/* 1. Daily DSA Problems Counter with Difficulty Choice */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white font-medium flex items-center gap-1">
            <span className="font-mono text-shiny-gold">&lt;/&gt;</span> DSA Problems Today
          </span>
          <span className="text-[11px] text-shiny-gold font-bold">
            Total: {todayTotal}
          </span>
        </div>

        {/* Counter and Difficulty Selector */}
        <div className="flex items-center gap-2">
          {/* Minus & Plus Counter */}
          <div className="flex items-center bg-[#000000] border border-[#D4AF37]/40 rounded-xl p-0.5">
            <button
              onClick={() => handleAdjustDSA(-1)}
              disabled={diffCounts[selectedDifficulty] <= 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#B8B0AA] hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Decrease question"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-shiny-gold font-mono">
              {diffCounts[selectedDifficulty]}
            </span>
            <button
              onClick={() => handleAdjustDSA(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-black bg-[#D4AF37] hover:bg-[#FFDF73] transition-colors"
              aria-label="Increase question"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Difficulty Buttons: Easy, Medium, Hard */}
          <div className="flex-1 grid grid-cols-3 gap-1">
            <button
              onClick={() => setSelectedDifficulty('easy')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold transition-all border text-center ${
                selectedDifficulty === 'easy'
                  ? 'bg-[#004D20] text-[#73FF9D] border-[#009940] shadow-sm font-bold'
                  : 'bg-[#000000] text-[#B8B0AA] border-[#360A0F] hover:border-[#D4AF37]/50'
              }`}
            >
              Easy
              <span className="block text-[9px] opacity-80">{diffCounts.easy || 0}</span>
            </button>

            <button
              onClick={() => setSelectedDifficulty('medium')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold transition-all border text-center ${
                selectedDifficulty === 'medium'
                  ? 'btn-shiny-gold text-black shadow-sm font-bold'
                  : 'bg-[#000000] text-[#B8B0AA] border-[#360A0F] hover:border-[#D4AF37]/50'
              }`}
            >
              Med
              <span className="block text-[9px] opacity-80">{diffCounts.medium || 0}</span>
            </button>

            <button
              onClick={() => setSelectedDifficulty('hard')}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold transition-all border text-center ${
                selectedDifficulty === 'hard'
                  ? 'bg-[#33040B] text-[#FFA8B5] border-red-500/60 shadow-sm font-bold'
                  : 'bg-[#000000] text-[#B8B0AA] border-[#360A0F] hover:border-[#D4AF37]/50'
              }`}
            >
              Hard
              <span className="block text-[9px] opacity-80">{diffCounts.hard || 0}</span>
            </button>
          </div>
        </div>

        {/* All-time cumulative mini-summary */}
        <div className="text-[10px] text-[#B8B0AA] flex items-center justify-between pt-0.5 px-0.5">
          <span>All-time: <strong className="text-white">{cumulativeStats.totalQuestions}</strong></span>
          <span className="text-shiny-gold font-semibold">E:{cumulativeStats.easy} M:{cumulativeStats.medium} H:{cumulativeStats.hard}</span>
        </div>
      </div>

      {/* 2. Communication & High-Level English Practice */}
      <div className="pt-2 border-t border-[#360A0F] space-y-2">
        <div className="flex items-start gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#FFDF73] shrink-0 mt-0.5" />
          <p className="text-[11px] text-white leading-snug">
            Today did you minimum <span className="text-shiny-gold font-bold">speak, learn or hear high-level English</span>?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleToggleCommunication(true)}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
              isCommDone
                ? 'btn-shiny-gold text-black font-bold shadow-md shadow-[#D4AF37]/35'
                : 'bg-[#000000] text-[#B8B0AA] border-[#360A0F] hover:border-[#D4AF37] hover:text-shiny-gold'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Yes, Done</span>
          </button>

          <button
            onClick={() => handleToggleCommunication(false)}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
              !isCommDone
                ? 'bg-[#000000] text-[#B8B0AA] border-[#360A0F]'
                : 'bg-[#000000] text-[#6B5A60] border-transparent hover:text-[#B8B0AA]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Not Yet</span>
          </button>
        </div>

        {/* Optional note prompt */}
        {isCommDone && (
          <div className="text-[10px] text-shiny-gold font-medium flex items-center justify-between px-1">
            <span>✨ English practiced today</span>
            <span>All-time: {cumulativeStats.commDays} days</span>
          </div>
        )}
      </div>
    </div>
  );
};
