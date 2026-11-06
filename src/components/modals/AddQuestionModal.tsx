import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { addQuestionSolved } from '../../services/dailyLogService';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [platform, setPlatform] = useState<'leetcode' | 'striver' | 'other'>('leetcode');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) return;
    setIsSubmitting(true);
    try {
      await addQuestionSolved(platform, count, difficulty);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#110E0E] border border-[rgba(255,240,220,0.08)] rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_48px_rgba(0,0,0,0.9)] relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,240,220,0.07)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0808] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="font-serif-display text-2xl font-bold text-[#F5F2EB]">
                Log Solved Questions
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#9E958E] hover:text-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Platform Selection */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Platform / Sheet
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'leetcode', label: 'LeetCode' },
                  { id: 'striver', label: 'Striver A2Z' },
                  { id: 'other', label: 'Other' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as 'leetcode' | 'striver' | 'other')}
                    className={`min-h-[44px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      platform === p.id
                        ? 'bg-gradient-to-r from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] text-[#090808] font-bold shadow-sm'
                        : 'bg-[#0A0808] text-[#9E958E] hover:text-[#F5F2EB] border border-[rgba(255,240,220,0.06)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Easy' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'hard', label: 'Hard' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as 'easy' | 'medium' | 'hard')}
                    className={`min-h-[44px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      difficulty === d.id
                        ? 'bg-[#181313] border border-[#D4AF37]/50 text-[#F6E6C2] font-bold shadow-sm'
                        : 'bg-[#0A0808] text-[#9E958E] hover:text-[#F5F2EB] border border-[rgba(255,240,220,0.06)]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Number of Problems
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`min-h-[44px] rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      count === n
                        ? 'bg-gradient-to-r from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] text-[#090808] font-bold shadow-sm'
                        : 'bg-[#0A0808] text-[#9E958E] hover:text-[#F5F2EB] border border-[rgba(255,240,220,0.06)]'
                    }`}
                  >
                    +{n}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full min-h-[44px] px-4 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] text-center font-bold font-mono focus:outline-none focus:border-[#D4AF37]/50 shadow-inner"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-lg border border-[rgba(255,240,220,0.08)] text-sm text-[#9E958E] hover:text-[#F5F2EB] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || count <= 0}
                className="flex-1 min-h-[46px] rounded-lg btn-liquid-gold text-[#090808] text-sm font-bold transition-all shadow-md disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? 'Logging...' : `Log +${count} Question${count > 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
