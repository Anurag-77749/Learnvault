import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  TimerMode, 
  TimerSettings, 
  StoredTimerState, 
  loadTimerSettings, 
  getInitialTimerState, 
  saveTimerState, 
  completePomodoroSession 
} from '../services/timerState';
import { addStudyMinutes, addWastedMinutes } from '../services/dailyLogService';
import { TimerSettingsModal } from './modals/TimerSettingsModal';

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
  'General FDE Focus',
];

const WASTED_REASONS: { id: 'phone' | 'social media' | 'YouTube' | 'procrastination' | 'other'; label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'social media', label: 'Social Media' },
  { id: 'YouTube', label: 'YouTube' },
  { id: 'procrastination', label: 'Procrastination' },
  { id: 'other', label: 'Other' },
];

interface TimerScreenProps {
  initialTopic?: string;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({ initialTopic }) => {
  const [settings, setSettings] = useState<TimerSettings>(loadTimerSettings);
  const [state, setState] = useState<StoredTimerState>(() => {
    const s = getInitialTimerState(settings);
    if (initialTopic) {
      s.selectedTopic = initialTopic;
    }
    return s;
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sessionFinishedToast, setSessionFinishedToast] = useState<string | null>(null);

  const creditedFocusMinsRef = React.useRef<number>(0);
  const creditedStopwatchMinsRef = React.useRef<number>(0);
  const creditedWastedMinsRef = React.useRef<number>(0);

  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const reloaded = getInitialTimerState(settings);
        setState((prev) => ({
          ...prev,
          remainingSeconds: reloaded.remainingSeconds,
          stopwatchAccruedSeconds: reloaded.stopwatchAccruedSeconds,
          wastedAccruedSeconds: reloaded.wastedAccruedSeconds,
        }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Pomodoro countdown
      if (state.isRunning && state.targetEndTime) {
        const diff = Math.max(0, Math.round((state.targetEndTime - now) / 1000));

        // Auto-accumulate study minutes as timer counts down
        if (state.mode === 'pomodoro') {
          const elapsedSecs = state.durationSeconds - diff;
          const elapsedMins = Math.floor(elapsedSecs / 60);
          if (elapsedMins > creditedFocusMinsRef.current) {
            const delta = elapsedMins - creditedFocusMinsRef.current;
            addStudyMinutes(delta, state.selectedTopic);
            creditedFocusMinsRef.current = elapsedMins;
          }
        }
        
        if (diff <= 0) {
          const durationMins = Math.round(state.durationSeconds / 60);
          const finishedMode = state.mode;
          completePomodoroSession(durationMins, state.selectedTopic, finishedMode, creditedFocusMinsRef.current);
          creditedFocusMinsRef.current = 0;

          let nextMode: TimerMode = 'pomodoro';
          let nextRound = state.roundCount;

          if (finishedMode === 'pomodoro') {
            if (state.roundCount >= settings.longBreakInterval) {
              nextMode = 'longBreak';
              nextRound = 1;
            } else {
              nextMode = 'shortBreak';
              nextRound = state.roundCount + 1;
            }
          } else {
            nextMode = 'pomodoro';
          }

          const nextDurationMins =
            nextMode === 'pomodoro'
              ? settings.focusDurationMins
              : nextMode === 'shortBreak'
              ? settings.shortBreakMins
              : settings.longBreakMins;

          setSessionFinishedToast(
            finishedMode === 'pomodoro'
              ? `Session Complete! Logged ${durationMins}m of focused study.`
              : 'Break Complete! Ready for the next focus round.'
          );
          setTimeout(() => setSessionFinishedToast(null), 5000);

          setState((prev) => ({
            ...prev,
            mode: nextMode,
            roundCount: nextRound,
            isRunning: false,
            durationSeconds: nextDurationMins * 60,
            remainingSeconds: nextDurationMins * 60,
            targetEndTime: null,
          }));
        } else {
          setState((prev) => ({ ...prev, remainingSeconds: diff }));
        }
      }

      // Plain Stopwatch
      if (state.stopwatchRunning && state.stopwatchStartTimestamp) {
        const diff = Math.floor((now - state.stopwatchStartTimestamp) / 1000);
        const totalAccrued = state.stopwatchAccruedSeconds + Math.max(0, diff);
        const accruedMins = Math.floor(totalAccrued / 60);
        if (accruedMins > creditedStopwatchMinsRef.current) {
          const delta = accruedMins - creditedStopwatchMinsRef.current;
          addStudyMinutes(delta, state.selectedTopic);
          creditedStopwatchMinsRef.current = accruedMins;
        }

        setState((prev) => ({
          ...prev,
          stopwatchAccruedSeconds: totalAccrued,
          stopwatchStartTimestamp: now,
        }));
      }

      // Wasted Stopwatch
      if (state.wastedRunning && state.wastedStartTimestamp) {
        const diff = Math.floor((now - state.wastedStartTimestamp) / 1000);
        const totalAccrued = state.wastedAccruedSeconds + Math.max(0, diff);
        const accruedMins = Math.floor(totalAccrued / 60);
        if (accruedMins > creditedWastedMinsRef.current) {
          const delta = accruedMins - creditedWastedMinsRef.current;
          addWastedMinutes(delta, state.wastedReason);
          creditedWastedMinsRef.current = accruedMins;
        }

        setState((prev) => ({
          ...prev,
          wastedAccruedSeconds: totalAccrued,
          wastedStartTimestamp: now,
        }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [state, settings]);

  const handleStartPomodoro = () => {
    const target = Date.now() + state.remainingSeconds * 1000;
    setState((prev) => ({
      ...prev,
      isRunning: true,
      targetEndTime: target,
    }));
  };

  const handlePausePomodoro = async () => {
    if (state.mode === 'pomodoro') {
      const elapsedSecs = state.durationSeconds - state.remainingSeconds;
      const elapsedMins = Math.floor(elapsedSecs / 60);
      if (elapsedMins > creditedFocusMinsRef.current) {
        const delta = elapsedMins - creditedFocusMinsRef.current;
        await addStudyMinutes(delta, state.selectedTopic);
        creditedFocusMinsRef.current = elapsedMins;
      }
    }
    setState((prev) => ({
      ...prev,
      isRunning: false,
      targetEndTime: null,
    }));
  };

  const handleResetPomodoro = async () => {
    if (state.mode === 'pomodoro') {
      const elapsedSecs = state.durationSeconds - state.remainingSeconds;
      const elapsedMins = Math.floor(elapsedSecs / 60);
      if (elapsedMins > creditedFocusMinsRef.current) {
        const delta = elapsedMins - creditedFocusMinsRef.current;
        await addStudyMinutes(delta, state.selectedTopic);
      }
    }
    creditedFocusMinsRef.current = 0;

    const mins =
      state.mode === 'pomodoro'
        ? settings.focusDurationMins
        : state.mode === 'shortBreak'
        ? settings.shortBreakMins
        : settings.longBreakMins;

    setState((prev) => ({
      ...prev,
      isRunning: false,
      durationSeconds: mins * 60,
      remainingSeconds: mins * 60,
      targetEndTime: null,
    }));
  };

  const handleSkipPomodoro = () => {
    let nextMode: TimerMode = 'pomodoro';
    let nextRound = state.roundCount;

    if (state.mode === 'pomodoro') {
      if (state.roundCount >= settings.longBreakInterval) {
        nextMode = 'longBreak';
        nextRound = 1;
      } else {
        nextMode = 'shortBreak';
        nextRound = state.roundCount + 1;
      }
    } else {
      nextMode = 'pomodoro';
    }

    const nextDurationMins =
      nextMode === 'pomodoro'
        ? settings.focusDurationMins
        : nextMode === 'shortBreak'
        ? settings.shortBreakMins
        : settings.longBreakMins;

    setState((prev) => ({
      ...prev,
      mode: nextMode,
      roundCount: nextRound,
      isRunning: false,
      durationSeconds: nextDurationMins * 60,
      remainingSeconds: nextDurationMins * 60,
      targetEndTime: null,
    }));
  };

  const handleSwitchMode = (mode: TimerMode) => {
    const mins =
      mode === 'pomodoro'
        ? settings.focusDurationMins
        : mode === 'shortBreak'
        ? settings.shortBreakMins
        : settings.longBreakMins;

    setState((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      durationSeconds: mins * 60,
      remainingSeconds: mins * 60,
      targetEndTime: null,
    }));
  };

  const handleStartStopwatch = () => {
    setState((prev) => ({
      ...prev,
      stopwatchRunning: true,
      stopwatchStartTimestamp: Date.now(),
    }));
  };

  const handlePauseStopwatch = () => {
    setState((prev) => ({
      ...prev,
      stopwatchRunning: false,
      stopwatchStartTimestamp: null,
    }));
  };

  const handleSaveAndResetStopwatch = async () => {
    const totalMins = Math.floor(state.stopwatchAccruedSeconds / 60);
    const uncredited = Math.max(0, totalMins - creditedStopwatchMinsRef.current);
    if (uncredited > 0) {
      await addStudyMinutes(uncredited, state.selectedTopic);
    }
    creditedStopwatchMinsRef.current = 0;
    setSessionFinishedToast(`Logged ${totalMins}m study time from stopwatch.`);
    setTimeout(() => setSessionFinishedToast(null), 4000);
    setState((prev) => ({
      ...prev,
      stopwatchRunning: false,
      stopwatchStartTimestamp: null,
      stopwatchAccruedSeconds: 0,
    }));
  };

  const handleStartWasted = () => {
    setState((prev) => ({
      ...prev,
      wastedRunning: true,
      wastedStartTimestamp: Date.now(),
    }));
  };

  const handlePauseWasted = () => {
    setState((prev) => ({
      ...prev,
      wastedRunning: false,
      wastedStartTimestamp: null,
    }));
  };

  const handleSaveAndResetWasted = async () => {
    const totalMins = Math.floor(state.wastedAccruedSeconds / 60);
    const uncredited = Math.max(0, totalMins - creditedWastedMinsRef.current);
    if (uncredited > 0) {
      await addWastedMinutes(uncredited, state.wastedReason);
    }
    creditedWastedMinsRef.current = 0;
    setSessionFinishedToast(`Recorded ${totalMins}m on ${state.wastedReason}.`);
    setTimeout(() => setSessionFinishedToast(null), 4000);
    setState((prev) => ({
      ...prev,
      wastedRunning: false,
      wastedStartTimestamp: null,
      wastedAccruedSeconds: 0,
    }));
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatStopwatch = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = state.durationSeconds > 0 ? state.remainingSeconds / state.durationSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-2xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {sessionFinishedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl bg-[#121212] border border-[#D4AF37] text-[#D4AF37] text-sm font-semibold shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>{sessionFinishedToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Title & Settings */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Focus Timer
          </h1>
          <p className="text-xs text-[#B8B0AA] mt-0.5 font-sans">
            Deep work tracking with automatic topic attribution
          </p>
        </div>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#080808] hover:bg-[#25070B] border border-[#1a1a1a] hover:border-[#D4AF37] text-shiny-gold text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Settings2 className="w-4 h-4 text-[#D4AF37]" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center p-1.5 rounded-2xl card-maroon border border-[#D4AF37]/40 shadow-md">
        <button
          onClick={() => setState((prev) => ({ ...prev, tab: 'pomodoro' }))}
          className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            state.tab === 'pomodoro'
              ? 'btn-shiny-gold shadow-lg shadow-[#D4AF37]/25'
              : 'text-[#B8B0AA] hover:text-white'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setState((prev) => ({ ...prev, tab: 'stopwatch' }))}
          className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            state.tab === 'stopwatch'
              ? 'btn-shiny-gold shadow-lg shadow-[#D4AF37]/25'
              : 'text-[#B8B0AA] hover:text-white'
          }`}
        >
          Stopwatch
        </button>
        <button
          onClick={() => setState((prev) => ({ ...prev, tab: 'wasted' }))}
          className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            state.tab === 'wasted'
              ? 'btn-shiny-gold shadow-lg shadow-[#D4AF37]/25'
              : 'text-[#B8B0AA] hover:text-white'
          }`}
        >
          Wasted Time
        </button>
      </div>

      {/* TAB 1: POMODORO TIMER */}
      {state.tab === 'pomodoro' && (
        <div className="p-6 sm:p-8 rounded-3xl card-maroon-gold shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Sub-modes */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => handleSwitchMode('pomodoro')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                state.mode === 'pomodoro'
                  ? 'btn-shiny-gold'
                  : 'bg-[#000000] text-[#B8B0AA] border border-[#1a1a1a] hover:border-[#D4AF37]'
              }`}
            >
              Focus ({settings.focusDurationMins}m)
            </button>
            <button
              onClick={() => handleSwitchMode('shortBreak')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                state.mode === 'shortBreak'
                  ? 'btn-shiny-gold'
                  : 'bg-[#000000] text-[#B8B0AA] border border-[#1a1a1a] hover:border-[#D4AF37]'
              }`}
            >
              Short Break ({settings.shortBreakMins}m)
            </button>
            <button
              onClick={() => handleSwitchMode('longBreak')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                state.mode === 'longBreak'
                  ? 'btn-shiny-gold'
                  : 'bg-[#000000] text-[#B8B0AA] border border-[#1a1a1a] hover:border-[#D4AF37]'
              }`}
            >
              Long Break ({settings.longBreakMins}m)
            </button>
          </div>

          {/* Topic Selector */}
          <div className="w-full max-w-sm mb-6">
            <label className="block text-xs font-bold text-shiny-gold uppercase tracking-wider mb-1.5 text-center">
              Active Focus Topic
            </label>
            <select
              value={state.selectedTopic}
              onChange={(e) => setState((prev) => ({ ...prev, selectedTopic: e.target.value }))}
              style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3 rounded-xl bg-[#0E0205] border border-[#D4AF37]/40 text-xs sm:text-sm text-[#FFDF73] focus:outline-none focus:border-[#D4AF37] text-center font-medium shadow-inner cursor-pointer"
            >
              {TOPIC_PRESETS.map((t) => (
                <option key={t} value={t} className="bg-[#080808] text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Gently Pulsing Ring & Large Serif Digital Clock */}
          <div className="relative my-4 flex items-center justify-center">
            <motion.div
              animate={
                state.isRunning
                  ? { scale: [1, 1.02, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center"
            >
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="#24070B"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="#D4AF37"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-linear shadow-lg"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-white tabular-nums">
                  {formatTime(state.remainingSeconds)}
                </span>
                <span className="text-xs uppercase tracking-widest text-shiny-gold font-semibold mt-2">
                  Round {state.roundCount} of {settings.longBreakInterval}
                </span>
                <span className="text-[11px] text-[#B8B0AA] mt-0.5">
                  {state.mode === 'pomodoro' ? 'Deep Work Focus' : 'Recovery Interval'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleResetPomodoro}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-black hover:bg-[#080808] border border-[#1a1a1a] hover:border-[#D4AF37] text-[#B8B0AA] hover:text-[#D4AF37] flex items-center justify-center transition-colors shadow-sm"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {state.isRunning ? (
              <button
                onClick={handlePausePomodoro}
                className="min-h-[52px] px-8 rounded-2xl bg-black hover:bg-[#080808] border-2 border-[#D4AF37] text-shiny-gold font-bold text-sm tracking-wider uppercase flex items-center gap-2 transition-all shadow-md shadow-[#D4AF37]/15"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartPomodoro}
                className="min-h-[52px] px-8 rounded-2xl btn-shiny-gold font-bold text-sm tracking-wider uppercase flex items-center gap-2 transition-all shadow-lg"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start</span>
              </button>
            )}

            <button
              onClick={handleSkipPomodoro}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-black hover:bg-[#080808] border border-[#1a1a1a] hover:border-[#D4AF37] text-[#B8B0AA] hover:text-[#D4AF37] flex items-center justify-center transition-colors shadow-sm"
              title="Skip"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-[#B8B0AA]/70 mt-6 text-center">
            Timestamp-locked: runs accurately if phone is locked or browser is closed.
          </p>
        </div>
      )}

      {/* TAB 2: PLAIN STOPWATCH */}
      {state.tab === 'stopwatch' && (
        <div className="p-6 sm:p-8 rounded-3xl card-maroon-gold shadow-2xl flex flex-col items-center">
          <div className="w-full max-w-sm mb-6">
            <label className="block text-xs font-bold text-shiny-gold uppercase tracking-wider mb-1.5 text-center">
              Active Topic
            </label>
            <select
              value={state.selectedTopic}
              onChange={(e) => setState((prev) => ({ ...prev, selectedTopic: e.target.value }))}
              style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3 rounded-xl bg-[#0E0205] border border-[#D4AF37]/40 text-xs sm:text-sm text-[#FFDF73] focus:outline-none focus:border-[#D4AF37] text-center font-medium shadow-inner cursor-pointer"
            >
              {TOPIC_PRESETS.map((t) => (
                <option key={t} value={t} className="bg-[#080808] text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="my-8 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-shiny-gold tabular-nums">
              {formatStopwatch(state.stopwatchAccruedSeconds)}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#FFDF73] font-bold mt-3">
              Unbounded Study Timer
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {state.stopwatchRunning ? (
              <button
                onClick={handlePauseStopwatch}
                className="flex-1 min-h-[48px] rounded-xl bg-black border-2 border-[#D4AF37] text-shiny-gold font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartStopwatch}
                className="flex-1 min-h-[48px] rounded-xl btn-shiny-gold font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{state.stopwatchAccruedSeconds > 0 ? 'Resume' : 'Start'}</span>
              </button>
            )}

            <button
              onClick={handleSaveAndResetStopwatch}
              disabled={state.stopwatchAccruedSeconds < 60}
              className="flex-1 min-h-[48px] rounded-xl card-maroon border-gold-shine hover:border-[#D4AF37] text-shiny-gold font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Study & Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: WASTED TIME STOPWATCH */}
      {state.tab === 'wasted' && (
        <div className="p-6 sm:p-8 rounded-3xl card-maroon-gold shadow-2xl flex flex-col items-center">
          <div className="w-full max-w-sm mb-6">
            <label className="block text-xs font-bold text-shiny-gold uppercase tracking-wider mb-2 text-center">
              Distraction Category
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {WASTED_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setState((prev) => ({ ...prev, wastedReason: r.id }))}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                    state.wastedReason === r.id
                      ? 'btn-shiny-gold shadow-sm font-bold'
                      : 'bg-[#000000] text-[#B8B0AA] border border-[#1a1a1a] hover:border-[#D4AF37]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-8 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-[#B8B0AA] tabular-nums">
              {formatStopwatch(state.wastedAccruedSeconds)}
            </span>
            <p className="text-xs uppercase tracking-widest text-shiny-gold font-bold mt-3">
              Distraction Counter ({state.wastedReason})
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {state.wastedRunning ? (
              <button
                onClick={handlePauseWasted}
                className="flex-1 min-h-[48px] rounded-xl bg-black border-2 border-[#D4AF37] text-shiny-gold font-bold text-sm flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartWasted}
                className="flex-1 min-h-[48px] rounded-xl btn-shiny-gold font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{state.wastedAccruedSeconds > 0 ? 'Resume' : 'Start'}</span>
              </button>
            )}

            <button
              onClick={handleSaveAndResetWasted}
              disabled={state.wastedAccruedSeconds < 60}
              className="flex-1 min-h-[48px] rounded-xl card-maroon border-gold-shine hover:border-[#D4AF37] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>Record & Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <TimerSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentSettings={settings}
        onSave={(updated) => {
          setSettings(updated);
          const durationMins =
            state.mode === 'pomodoro'
              ? updated.focusDurationMins
              : state.mode === 'shortBreak'
              ? updated.shortBreakMins
              : updated.longBreakMins;

          setState((prev) => ({
            ...prev,
            durationSeconds: durationMins * 60,
            remainingSeconds: durationMins * 60,
            targetEndTime: null,
            isRunning: false,
          }));
        }}
      />
    </div>
  );
};
