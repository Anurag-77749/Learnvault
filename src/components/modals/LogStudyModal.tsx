import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
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
          className="w-full max-w-md bg-[#110E0E] border border-[rgba(255,240,220,0.08)] rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_48px_rgba(0,0,0,0.9)] relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,240,220,0.07)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0808] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-serif-display text-2xl font-bold text-[#F5F2EB]">
                Manual Study Log
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
            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Study Duration (Minutes)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={`min-h-[44px] rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      minutes === m
                        ? 'bg-gradient-to-r from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] text-[#090808] font-bold shadow-sm'
                        : 'bg-[#0A0808] text-[#9E958E] hover:text-[#F5F2EB] border border-[rgba(255,240,220,0.06)]'
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
                className="w-full min-h-[44px] px-4 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]/50 text-center font-bold font-mono shadow-inner"
              />
            </div>

            {/* Topic selector */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Attributed Curriculum Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full min-h-[44px] px-3 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-xs sm:text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]/50 cursor-pointer shadow-inner"
              >
                {TOPIC_PRESETS.map((t) => (
                  <option key={t} value={t} className="bg-[#110E0E] text-[#F5F2EB]">
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
                className="flex-1 min-h-[46px] rounded-lg border border-[rgba(255,240,220,0.08)] text-sm text-[#9E958E] hover:text-[#F5F2EB] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || minutes <= 0}
                className="flex-1 min-h-[46px] rounded-lg btn-liquid-gold text-[#090808] text-sm font-bold transition-all shadow-md disabled:opacity-40 cursor-pointer"
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
