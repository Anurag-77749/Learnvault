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
          className="w-full max-w-md bg-[#121212] border border-[#D97736]/40 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#D97736]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#D97736]/50 flex items-center justify-center text-[#D97736]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                Log Solved Questions
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#D97736] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
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
                    className={`min-h-[44px] rounded-xl text-xs font-semibold transition-all ${
                      platform === p.id
                        ? 'bg-[#D97736] text-black shadow-md shadow-[#D97736]/20'
                        : 'bg-black text-[#A09D95] hover:text-[#F9F6EE] border border-[#D97736]/25'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection: Easy, Medium, Hard */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Easy', color: 'text-[#39D353]' },
                  { id: 'medium', label: 'Medium', color: 'text-[#FFD700]' },
                  { id: 'hard', label: 'Hard', color: 'text-red-400' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id as 'easy' | 'medium' | 'hard')}
                    className={`min-h-[44px] rounded-xl text-xs font-semibold transition-all ${
                      difficulty === d.id
                        ? 'bg-[#D97736] text-black shadow-md shadow-[#D97736]/20 font-bold'
                        : `bg-black ${d.color} hover:text-[#F9F6EE] border border-[#D97736]/25`
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Number of Problems
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`min-h-[44px] rounded-xl text-sm font-semibold transition-all ${
                      count === n
                        ? 'bg-[#D97736] text-black shadow-md'
                        : 'bg-black text-[#A09D95] hover:text-[#F9F6EE] border border-[#D97736]/25'
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
                className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#D97736]/30 text-[#F9F6EE] text-center font-bold focus:outline-none focus:border-[#D97736]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-xl border border-[#D97736]/30 text-sm text-[#A09D95] hover:text-[#F9F6EE] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || count <= 0}
                className="flex-1 min-h-[46px] rounded-xl bg-[#D97736] hover:bg-[#FFD700] text-black text-sm font-bold transition-all shadow-md shadow-[#D97736]/20 disabled:opacity-40"
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
