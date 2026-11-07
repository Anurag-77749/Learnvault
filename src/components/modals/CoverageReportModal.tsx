import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, BookOpen, RotateCcw } from 'lucide-react';
import { CurriculumTopic } from '../../services/db';

interface CoverageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: CurriculumTopic[];
  onResetOfficialCurriculum: () => void;
}

export const CoverageReportModal: React.FC<CoverageReportModalProps> = ({
  isOpen,
  onClose,
  topics,
  onResetOfficialCurriculum,
}) => {
  if (!isOpen) return null;

  // Group topics by Track
  const trackGroups = topics.reduce((acc, t) => {
    if (!acc[t.trackId]) {
      acc[t.trackId] = {
        trackId: t.trackId,
        trackTitle: t.trackTitle,
        topics: [],
        subtopicsCount: 0,
        completedSubtopics: 0,
      };
    }
    acc[t.trackId].topics.push(t);
    const completed = t.subtopics.filter((s) => s.completed).length;
    acc[t.trackId].subtopicsCount += t.subtopics.length;
    acc[t.trackId].completedSubtopics += completed;
    return acc;
  }, {} as Record<number, { trackId: number; trackTitle: string; topics: CurriculumTopic[]; subtopicsCount: number; completedSubtopics: number }>);

  const groupList = Object.values(trackGroups).sort((a, b) => a.trackId - b.trackId);
  const totalSubtopics = groupList.reduce((acc, g) => acc + g.subtopicsCount, 0);
  const totalCompleted = groupList.reduce((acc, g) => acc + g.completedSubtopics, 0);
  const overallPercent = totalSubtopics > 0 ? Math.round((totalCompleted / totalSubtopics) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-[#121212] border border-[#84CC16]/40 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#84CC16]/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-black border border-[#84CC16]/50 flex items-center justify-center text-[#84CC16]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                  Curriculum Coverage Report
                </h2>
                <p className="text-xs text-[#A09D95] font-sans">
                  Comprehensive 4-Year FDE Curriculum: {groupList.length} Tracks • {topics.length} Topics • {totalSubtopics} Subtopics
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#84CC16] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Progress Banner */}
          <div className="my-4 p-4 rounded-2xl bg-black border border-[#84CC16]/30 flex items-center justify-between shrink-0">
            <div>
              <span className="text-xs text-[#A09D95] uppercase font-semibold">Overall Completion</span>
              <div className="font-serif text-2xl font-bold text-[#F9F6EE] mt-0.5">
                {totalCompleted} / {totalSubtopics} <span className="text-sm font-sans text-[#84CC16]">({overallPercent}%)</span>
              </div>
            </div>
            <div className="w-32 bg-[#121212] rounded-full h-3 border border-[#84CC16]/25 overflow-hidden">
              <div
                className="bg-[#84CC16] h-full transition-all duration-500 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {groupList.map((g) => {
              const pct = g.subtopicsCount > 0 ? Math.round((g.completedSubtopics / g.subtopicsCount) * 100) : 0;
              return (
                <div
                  key={g.trackId}
                  className="p-3.5 rounded-2xl bg-black border border-[#84CC16]/20 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-serif font-bold text-sm text-[#F9F6EE] truncate">
                      {g.trackTitle}
                    </p>
                    <p className="text-[11px] text-[#A09D95] mt-0.5">
                      {g.topics.length} topics • {g.subtopicsCount} subtopics
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[#84CC16] font-bold">
                      {g.completedSubtopics}/{g.subtopicsCount}
                    </span>
                    <span className="text-[#A09D95] ml-1.5 font-medium">
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#84CC16]/20 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => {
                if (window.confirm('Reset all topics back to official Part 3 Source of Truth?')) {
                  onResetOfficialCurriculum();
                  onClose();
                }
              }}
              className="min-h-[44px] px-4 rounded-xl bg-black border border-[#84CC16]/30 hover:border-red-400 text-xs text-[#A09D95] hover:text-red-300 font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Official Curriculum</span>
            </button>

            <button
              onClick={onClose}
              className="min-h-[44px] px-6 rounded-xl bg-[#84CC16] hover:bg-[#FFD700] text-black text-xs font-bold uppercase transition-all shadow-md shadow-[#84CC16]/20"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
