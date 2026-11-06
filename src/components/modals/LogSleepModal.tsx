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
          className="w-full max-w-md bg-[#110E0E] border border-[rgba(255,240,220,0.08)] rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_48px_rgba(0,0,0,0.9)] relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,240,220,0.07)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A0808] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Moon className="w-4 h-4" />
              </div>
              <h2 className="font-serif-display text-2xl font-bold text-[#F5F2EB]">
                Log Sleep
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#9E958E] hover:text-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] text-center font-bold font-mono focus:outline-none focus:border-[#D4AF37]/50 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] text-center font-bold font-mono focus:outline-none focus:border-[#D4AF37]/50 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Calculated Hours Display */}
            <div className="p-3.5 rounded-xl bg-[#0A0808] border border-[rgba(255,240,220,0.08)] flex items-center justify-between shadow-inner">
              <span className="text-xs text-[#9E958E] uppercase tracking-wider font-semibold font-mono">
                Calculated Sleep:
              </span>
              <span className="font-mono text-2xl font-bold text-[#D4AF37] tabular-nums">
                {calculatedHours} <span className="text-sm font-sans text-[#F5F2EB]">hrs</span>
              </span>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Sleep Quality (1 - 5)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setQuality(lvl)}
                    className={`min-h-[44px] rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                      quality === lvl
                        ? 'bg-gradient-to-r from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] text-[#090808] font-bold shadow-sm'
                        : 'bg-[#0A0808] text-[#9E958E] hover:text-[#F5F2EB] border border-[rgba(255,240,220,0.06)]'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${quality >= lvl ? 'fill-current' : ''}`} />
                    <span className="text-xs mt-0.5 font-mono">{lvl}</span>
                  </button>
                ))}
              </div>
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
                disabled={isSubmitting}
                className="flex-1 min-h-[46px] rounded-lg btn-liquid-gold text-[#090808] text-sm font-bold transition-all shadow-md disabled:opacity-40 cursor-pointer"
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
