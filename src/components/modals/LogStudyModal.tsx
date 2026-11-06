import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock } from 'lucide-react';
import { addStudyMinutes } from '../../services/dailyLogService';

interface LogStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TOPIC_PRESETS = [
  'Track 0: Introduction / FDE Glossary',
  'Track 1: Python (Main Language)',
  'Track 2: DSA & System Design',
  'Track 3: Git & GitHub',
  'Track 4: Linux Skills & Shell',
  'Track 5: Frontend Skills (React)',
  'Track 6: Backend & PostgreSQL',
  'Track 7: Data Engineering (Spark/Airflow)',
  'Track 8: AI Engineering & LLMs',
  'General Study',
];

export const LogStudyModal: React.FC<LogStudyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [minutes, setMinutes] = useState<number>(30);
  const [topic, setTopic] = useState<string>(TOPIC_PRESETS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) return;
    setIsSubmitting(true);
    try {
      await addStudyMinutes(minutes, topic);
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
          className="w-full max-w-md bg-[#121212] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                Manual Study Log
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#D4AF37] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Study Duration (Minutes)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={`min-h-[44px] rounded-xl text-sm font-semibold transition-all ${
                      minutes === m
                        ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
                        : 'bg-black text-[#A09D95] hover:text-[#F9F6EE] border border-[#D4AF37]/25'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="720"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#D4AF37]/30 text-[#F9F6EE] focus:outline-none focus:border-[#D4AF37] text-center font-bold"
              />
            </div>

            {/* Topic selector */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Attributed Curriculum Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3 rounded-xl bg-[#0E0205] border border-[#D4AF37]/30 text-xs sm:text-sm text-[#F9F6EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                {TOPIC_PRESETS.map((t) => (
                  <option key={t} value={t} className="bg-[#121212] text-[#F9F6EE]">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-xl border border-[#D4AF37]/30 text-sm text-[#A09D95] hover:text-[#F9F6EE] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || minutes <= 0}
                className="flex-1 min-h-[46px] rounded-xl bg-[#D4AF37] hover:bg-[#FFD700] text-black text-sm font-bold transition-all shadow-md shadow-[#D4AF37]/20 disabled:opacity-40"
              >
                {isSubmitting ? 'Logging...' : `Log ${minutes}m Study`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
