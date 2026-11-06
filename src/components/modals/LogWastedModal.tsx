import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { addWastedMinutes } from '../../services/dailyLogService';

interface LogWastedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASONS: { id: 'phone' | 'social media' | 'YouTube' | 'procrastination' | 'other'; label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'social media', label: 'Social Media' },
  { id: 'YouTube', label: 'YouTube' },
  { id: 'procrastination', label: 'Procrastination' },
  { id: 'other', label: 'Other' },
];

export const LogWastedModal: React.FC<LogWastedModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [minutes, setMinutes] = useState<number>(15);
  const [reason, setReason] = useState<'phone' | 'social media' | 'YouTube' | 'procrastination' | 'other'>('phone');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes <= 0) return;
    setIsSubmitting(true);
    try {
      await addWastedMinutes(minutes, reason, note.trim() || undefined);
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
                Log Wasted Time
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
            {/* Quick presets */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Duration (minutes)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[10, 15, 30, 45].map((m) => (
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
                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full min-h-[44px] px-4 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#D4AF37]/50 shadow-inner font-mono"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Primary Distraction
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      reason === r.id
                        ? 'bg-[#181313] border border-[#D4AF37]/50 text-[#F6E6C2] shadow-sm'
                        : 'bg-[#0A0808] text-[#9E958E] hover:text-[#F5F2EB] border border-[rgba(255,240,220,0.06)]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#9E958E] mb-2 uppercase tracking-wider">
                Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. YouTube algorithm rabbit hole"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[44px] px-4 rounded-lg bg-[#0A0808] border border-[rgba(255,240,220,0.08)] text-[#F5F2EB] placeholder-[#635B55] text-sm focus:outline-none focus:border-[#D4AF37]/50 shadow-inner"
              />
            </div>

            {/* Action Buttons */}
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
                {isSubmitting ? 'Logging...' : 'Save Log'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
