import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Star } from 'lucide-react';
import { logSleep, calculateSleepHours } from '../../services/dailyLogService';

interface LogSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBedtime?: string;
  initialWakeTime?: string;
  initialQuality?: number;
  onSuccess?: () => void;
}

export const LogSleepModal: React.FC<LogSleepModalProps> = ({
  isOpen,
  onClose,
  initialBedtime = '23:30',
  initialWakeTime = '07:00',
  initialQuality = 4,
  onSuccess,
}) => {
  const [bedtime, setBedtime] = useState(initialBedtime);
  const [wakeTime, setWakeTime] = useState(initialWakeTime);
  const [quality, setQuality] = useState<number>(initialQuality);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedHours = useMemo(() => {
    return calculateSleepHours(bedtime, wakeTime);
  }, [bedtime, wakeTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logSleep(bedtime, wakeTime, quality);
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
          className="w-full max-w-md bg-[#121212] border border-[#FF5500]/40 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#FF5500]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#FF5500]/50 flex items-center justify-center text-[#FF5500]">
                <Moon className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                Log Sleep
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#FF5500] rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl bg-black border border-[#FF5500]/30 text-[#F9F6EE] text-center font-bold focus:outline-none focus:border-[#FF5500]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl bg-black border border-[#FF5500]/30 text-[#F9F6EE] text-center font-bold focus:outline-none focus:border-[#FF5500]"
                  required
                />
              </div>
            </div>

            {/* Calculated Hours Display */}
            <div className="p-3.5 rounded-2xl bg-black border border-[#FF5500]/30 flex items-center justify-between">
              <span className="text-xs text-[#A09D95] uppercase tracking-wider font-semibold">
                Calculated Sleep:
              </span>
              <span className="font-serif text-2xl font-bold text-[#FF5500]">
                {calculatedHours} <span className="text-sm font-sans text-[#F9F6EE]">hrs</span>
              </span>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Sleep Quality (1 - 5)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setQuality(lvl)}
                    className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all ${
                      quality === lvl
                        ? 'bg-[#FF5500] text-black font-bold shadow-md'
                        : 'bg-black text-[#A09D95] hover:text-[#F9F6EE] border border-[#FF5500]/25'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${quality >= lvl ? 'fill-current' : ''}`} />
                    <span className="text-xs mt-0.5">{lvl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-xl border border-[#FF5500]/30 text-sm text-[#A09D95] hover:text-[#F9F6EE] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[46px] rounded-xl bg-[#FF5500] hover:bg-[#FFD700] text-black text-sm font-bold transition-all shadow-md shadow-[#FF5500]/20 disabled:opacity-40"
              >
                {isSubmitting ? 'Saving...' : 'Save Sleep'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
