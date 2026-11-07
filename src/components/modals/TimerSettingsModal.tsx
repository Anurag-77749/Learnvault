import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2 } from 'lucide-react';
import { TimerSettings, saveTimerSettings } from '../../services/timerState';

interface TimerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: TimerSettings;
  onSave: (newSettings: TimerSettings) => void;
}

export const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [focusDuration, setFocusDuration] = useState(currentSettings.focusDurationMins);
  const [shortBreak, setShortBreak] = useState(currentSettings.shortBreakMins);
  const [longBreak, setLongBreak] = useState(currentSettings.longBreakMins);
  const [longInterval, setLongInterval] = useState(currentSettings.longBreakInterval);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TimerSettings = {
      focusDurationMins: Math.max(1, focusDuration),
      shortBreakMins: Math.max(1, shortBreak),
      longBreakMins: Math.max(1, longBreak),
      longBreakInterval: Math.max(1, longInterval),
    };
    saveTimerSettings(updated);
    onSave(updated);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#121212] border border-[#84CC16]/40 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#84CC16]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#84CC16]/50 flex items-center justify-center text-[#84CC16]">
                <Settings2 className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                Timer Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#84CC16] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-1.5 uppercase tracking-wider">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(parseInt(e.target.value) || 1)}
                className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#84CC16]/30 text-[#F9F6EE] font-bold focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A09D95] mb-1.5 uppercase tracking-wider">
                  Short Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreak}
                  onChange={(e) => setShortBreak(parseInt(e.target.value) || 1)}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#84CC16]/30 text-[#F9F6EE] font-bold focus:outline-none focus:border-[#84CC16]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A09D95] mb-1.5 uppercase tracking-wider">
                  Long Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={longBreak}
                  onChange={(e) => setLongBreak(parseInt(e.target.value) || 1)}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#84CC16]/30 text-[#F9F6EE] font-bold focus:outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A09D95] mb-1.5 uppercase tracking-wider">
                Long Break Every (rounds)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={longInterval}
                onChange={(e) => setLongInterval(parseInt(e.target.value) || 1)}
                className="w-full min-h-[44px] px-4 rounded-xl bg-black border border-[#84CC16]/30 text-[#F9F6EE] font-bold focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-xl border border-[#84CC16]/30 text-sm text-[#A09D95] hover:text-[#F9F6EE] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[46px] rounded-xl bg-[#84CC16] hover:bg-[#FFD700] text-black text-sm font-bold transition-all shadow-md shadow-[#84CC16]/20"
              >
                Save Settings
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
