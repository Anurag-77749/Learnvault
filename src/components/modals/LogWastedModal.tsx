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
          className="w-full max-w-md bg-[#121212] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                Log Wasted Time
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#D4AF37] rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Quick presets */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Duration (minutes)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[10, 15, 30, 45].map((m) => (
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

            {/* Reason selector */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Reason
              </label>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                      reason === r.id
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'bg-black text-[#A09D95] hover:text-[#F9F6EE] border border-[#D4AF37]/25'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-2 uppercase tracking-wider">
                Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. YouTube algorithm rabbit hole"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#D4AF37]/30 text-[#F9F6EE] placeholder-[#A09D95]/40 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Action Buttons */}
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
                {isSubmitting ? 'Logging...' : 'Save Log'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
