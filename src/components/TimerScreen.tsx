import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings2, 
  CheckCircle2, 
  Sparkles,
  Timer as TimerIcon,
  Clock,
  AlertTriangle
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
  const [settings, setSettings] = useState<TimerSettings>(loadTimerSettings());
  const [state, setState] = useState<StoredTimerState>(getInitialTimerState(settings));
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sessionFinishedToast, setSessionFinishedToast] = useState<string | null>(null);

  const creditedFocusMinsRef = useRef<number>(0);
  const creditedStopwatchMinsRef = useRef<number>(0);
  const creditedWastedMinsRef = useRef<number>(0);

  useEffect(() => {
    if (initialTopic) {
      setState((prev) => ({ ...prev, selectedTopic: initialTopic }));
    }
  }, [initialTopic]);

  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Pomodoro Active Tick
      if (state.isRunning && state.targetEndTime) {
        const diff = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
        
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
          const finishedMode = state.mode;
          const durationMins = Math.floor(state.durationSeconds / 60);

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
    <div className="space-y-6 pb-28 max-w-3xl mx-auto font-sans select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {sessionFinishedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl smoked-glass border border-[#10B981]/40 text-[#10B981] text-xs font-mono font-bold shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <span>{sessionFinishedToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Title & Settings */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
              FLOW STATE PROTOCOL // TIME ENGINE
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            Deep Work Focus Studio
          </h1>
          <p className="text-xs text-[#9898A0] mt-0.5">
            Hardware-accurate study timers with automatic curriculum attribution.
          </p>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="px-3.5 py-2 rounded-xl btn-tactile text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#FF5500]" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Mode Navigation Tabs (Smoked Obsidian Pill Bar) */}
      <div className="flex items-center p-1.5 rounded-full smoked-glass shadow-md">
        <button
          onClick={() => setState((prev) => ({ ...prev, tab: 'pomodoro' }))}
          className={`flex-1 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            state.tab === 'pomodoro'
              ? 'bg-gradient-to-b from-white to-[#E0E0E6] text-black shadow-md font-black'
              : 'text-[#9898A0] hover:text-white'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setState((prev) => ({ ...prev, tab: 'stopwatch' }))}
          className={`flex-1 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            state.tab === 'stopwatch'
              ? 'bg-gradient-to-b from-white to-[#E0E0E6] text-black shadow-md font-black'
              : 'text-[#9898A0] hover:text-white'
          }`}
        >
          Stopwatch
        </button>
        <button
          onClick={() => setState((prev) => ({ ...prev, tab: 'wasted' }))}
          className={`flex-1 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            state.tab === 'wasted'
              ? 'bg-gradient-to-b from-white to-[#E0E0E6] text-black shadow-md font-black'
              : 'text-[#9898A0] hover:text-white'
          }`}
        >
          Wasted Time
        </button>
      </div>

      {/* TAB 1: POMODORO TIMER */}
      {state.tab === 'pomodoro' && (
        <div className="p-6 sm:p-8 rounded-3xl smoked-glass shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Sub-modes */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => handleSwitchMode('pomodoro')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                state.mode === 'pomodoro'
                  ? 'btn-mercury text-black font-black'
                  : 'btn-tactile text-[#9898A0]'
              }`}
            >
              Focus ({settings.focusDurationMins}m)
            </button>
            <button
              onClick={() => handleSwitchMode('shortBreak')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                state.mode === 'shortBreak'
                  ? 'btn-mercury text-black font-black'
                  : 'btn-tactile text-[#9898A0]'
              }`}
            >
              Short Break ({settings.shortBreakMins}m)
            </button>
            <button
              onClick={() => handleSwitchMode('longBreak')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                state.mode === 'longBreak'
                  ? 'btn-mercury text-black font-black'
                  : 'btn-tactile text-[#9898A0]'
              }`}
            >
              Long Break ({settings.longBreakMins}m)
            </button>
          </div>

          {/* Topic Selector */}
          <div className="w-full max-w-sm mb-6">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9898A0] font-bold mb-1.5 text-center">
              Active Focus Topic
            </label>
            <select
              value={state.selectedTopic}
              onChange={(e) => setState((prev) => ({ ...prev, selectedTopic: e.target.value }))}
              className="w-full min-h-[42px] px-3.5 rounded-xl input-command-bar text-xs text-white focus:outline-none text-center font-medium shadow-inner cursor-pointer"
            >
              {TOPIC_PRESETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Ring & High-Contrast Digits */}
          <div className="relative my-4 flex items-center justify-center">
            <motion.div
              animate={
                state.isRunning
                  ? { scale: [1, 1.015, 1] }
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
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="#FF5500"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-linear shadow-[0_0_15px_rgba(255,85,0,0.5)]"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono tabular-nums text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {formatTime(state.remainingSeconds)}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF5500] font-bold mt-2">
                  Round {state.roundCount} of {settings.longBreakInterval}
                </span>
                <span className="text-[10px] font-mono text-[#9898A0] mt-0.5">
                  {state.mode === 'pomodoro' ? 'Deep Work Focus' : 'Recovery Interval'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleResetPomodoro}
              className="w-12 h-12 rounded-full btn-tactile flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4 text-[#9898A0] hover:text-white" />
            </button>

            {state.isRunning ? (
              <button
                onClick={handlePausePomodoro}
                className="px-8 py-3 rounded-full btn-tactile font-mono font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Pause className="w-4 h-4 fill-current text-white" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartPomodoro}
                className="px-8 py-3 rounded-full btn-mercury font-mono font-black text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xl"
              >
                <Play className="w-4 h-4 fill-current text-black" />
                <span>Start</span>
              </button>
            )}

            <button
              onClick={handleSkipPomodoro}
              className="w-12 h-12 rounded-full btn-tactile flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              title="Skip"
            >
              <SkipForward className="w-4 h-4 text-[#9898A0] hover:text-white" />
            </button>
          </div>

          <p className="text-[10px] font-mono text-[#9898A0] mt-6 text-center">
            Timestamp-locked: runs accurately even if phone locks or browser closes.
          </p>
        </div>
      )}

      {/* TAB 2: PLAIN STOPWATCH */}
      {state.tab === 'stopwatch' && (
        <div className="p-6 sm:p-8 rounded-3xl smoked-glass shadow-2xl flex flex-col items-center">
          <div className="w-full max-w-sm mb-6">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9898A0] font-bold mb-1.5 text-center">
              Active Topic
            </label>
            <select
              value={state.selectedTopic}
              onChange={(e) => setState((prev) => ({ ...prev, selectedTopic: e.target.value }))}
              className="w-full min-h-[42px] px-3.5 rounded-xl input-command-bar text-xs text-white focus:outline-none text-center font-medium shadow-inner cursor-pointer"
            >
              {TOPIC_PRESETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="my-8 text-center">
            <span className="font-mono tabular-nums text-6xl sm:text-7xl font-black tracking-tight text-white">
              {formatStopwatch(state.stopwatchAccruedSeconds)}
            </span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-bold mt-3">
              Unbounded Study Stopwatch
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {state.stopwatchRunning ? (
              <button
                onClick={handlePauseStopwatch}
                className="flex-1 py-3 rounded-full btn-tactile font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Pause className="w-4 h-4 fill-current text-white" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartStopwatch}
                className="flex-1 py-3 rounded-full btn-mercury font-mono font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <Play className="w-4 h-4 fill-current text-black" />
                <span>{state.stopwatchAccruedSeconds > 0 ? 'Resume' : 'Start'}</span>
              </button>
            )}

            <button
              onClick={handleSaveAndResetStopwatch}
              disabled={state.stopwatchAccruedSeconds < 60}
              className="flex-1 py-3 rounded-full btn-tactile font-mono font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Log & Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: WASTED TIME STOPWATCH */}
      {state.tab === 'wasted' && (
        <div className="p-6 sm:p-8 rounded-3xl smoked-glass shadow-2xl flex flex-col items-center">
          <div className="w-full max-w-sm mb-6">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9898A0] font-bold mb-2 text-center">
              Distraction Category
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {WASTED_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setState((prev) => ({ ...prev, wastedReason: r.id }))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    state.wastedReason === r.id
                      ? 'btn-mercury text-black font-black'
                      : 'btn-tactile text-[#9898A0]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-8 text-center">
            <span className="font-mono tabular-nums text-6xl sm:text-7xl font-black tracking-tight text-rose-400">
              {formatStopwatch(state.wastedAccruedSeconds)}
            </span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold mt-3">
              Distraction Drift Counter ({state.wastedReason})
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {state.wastedRunning ? (
              <button
                onClick={handlePauseWasted}
                className="flex-1 py-3 rounded-full btn-tactile font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current text-white" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartWasted}
                className="flex-1 py-3 rounded-full btn-mercury font-mono font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <Play className="w-4 h-4 fill-current text-black" />
                <span>{state.wastedAccruedSeconds > 0 ? 'Resume' : 'Start'}</span>
              </button>
            )}

            <button
              onClick={handleSaveAndResetWasted}
              disabled={state.wastedAccruedSeconds < 60}
              className="flex-1 py-3 rounded-full btn-tactile font-mono font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-all cursor-pointer shadow-sm text-rose-400"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Log Wasted & Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <TimerSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentSettings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
        />
      )}
    </div>
  );
};
