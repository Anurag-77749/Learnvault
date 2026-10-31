import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Tag,
  Clock,
  Coffee,
  Flame,
  Volume2,
  VolumeX,
  History,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Topic, PomodoroSession } from '../types';
import { dataService } from '../services/dataService';

interface PomodoroTimerViewProps {
  topics: Topic[];
  onSessionCompleted?: (session: PomodoroSession) => void;
  onOpenDailyLog: () => void;
}

export const PomodoroTimerView: React.FC<PomodoroTimerViewProps> = ({
  topics,
  onSessionCompleted,
  onOpenDailyLog
}) => {
  // Timer Modes: 'pomodoro' | 'stopwatch'
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [presetMins, setPresetMins] = useState<number>(25);

  // Time in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tagging
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  // Recent Sessions
  const [recentSessions, setRecentSessions] = useState<PomodoroSession[]>(dataService.getPomodoroSessions());

  // Web Audio chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime unsupported:', e);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
      }

      interval = setInterval(() => {
        if (timerMode === 'pomodoro') {
          setSecondsRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval!);
              setIsRunning(false);
              playChime();
              handleCompleteSession();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode]);

  const handleStartPause = () => {
    if (!isRunning && !sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      setSecondsRemaining(presetMins * 60);
    } else {
      setStopwatchSeconds(0);
    }
    setSessionStartTime(null);
  };

  const selectPreset = (mins: number) => {
    setPresetMins(mins);
    setSecondsRemaining(mins * 60);
    setIsRunning(false);
    setSessionStartTime(null);
  };

  const handleCompleteSession = () => {
    const started = sessionStartTime || new Date().toISOString();
    const completed = new Date().toISOString();

    let durationMins = 0;
    if (timerMode === 'pomodoro') {
      const elapsedSeconds = presetMins * 60 - secondsRemaining;
      durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    } else {
      durationMins = Math.max(1, Math.round(stopwatchSeconds / 60));
    }

    const session = dataService.addPomodoroSession({
      topic_id: selectedTopicId || null,
      duration_mins: durationMins,
      started_at: started,
      completed_at: completed
    });

    setRecentSessions(dataService.getPomodoroSessions());
    if (onSessionCompleted) onSessionCompleted(session);

    handleReset();
    playChime();
  };

  // Time formatters
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentDisplayTime =
    timerMode === 'pomodoro' ? formatTime(secondsRemaining) : formatTime(stopwatchSeconds);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Focus Timer & Stopwatch</h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Each session automatically tags to your selected topic and syncs to today's daily log.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
              <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Clock Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-center space-y-6 shadow-xl">
        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => {
              setTimerMode('pomodoro');
              setIsRunning(false);
              setSecondsRemaining(presetMins * 60);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              timerMode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Pomodoro (Countdown)</span>
          </button>

          <button
            onClick={() => {
              setTimerMode('stopwatch');
              setIsRunning(false);
              setStopwatchSeconds(0);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              timerMode === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Stopwatch (Count up)</span>
          </button>
        </div>

        {/* Pomodoro Presets */}
        {timerMode === 'pomodoro' && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '25m Focus', mins: 25 },
              { label: '50m Deep Work', mins: 50 },
              { label: '5m Short Break', mins: 5 },
              { label: '15m Long Break', mins: 15 }
            ].map(p => (
              <button
                key={p.mins}
                onClick={() => selectPreset(p.mins)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  presetMins === p.mins
                    ? 'border border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Tag Topic Dropdown Selector */}
        <div className="max-w-md mx-auto text-left">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
            <Tag className="h-3.5 w-3.5 text-indigo-400" />
            <span>TAG SESSION TO TOPIC</span>
          </label>
          <select
            value={selectedTopicId}
            onChange={e => setSelectedTopicId(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">-- No Specific Topic (General Deep Work) --</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.time_spent_mins}m logged)
              </option>
            ))}
          </select>

          {selectedTopic && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Current total on this topic: <strong>{selectedTopic.time_spent_mins}m</strong></span>
              <span className="text-emerald-400 font-semibold">{selectedTopic.status}</span>
            </div>
          )}
        </div>

        {/* Big Digital Clock Display */}
        <div className="py-2">
          <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_35px_rgba(99,102,241,0.25)]">
            {currentDisplayTime}
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-400">
            {isRunning ? (
              <span className="text-emerald-400 animate-pulse">● Session Active</span>
            ) : (
              <span>Session Paused</span>
            )}
          </p>
        </div>

        {/* Main Timer Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Reset timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={handleStartPause}
            className={`flex min-h-[48px] items-center gap-2 rounded-2xl px-8 py-3 text-base font-bold text-white shadow-xl transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleCompleteSession}
            disabled={
              timerMode === 'pomodoro'
                ? secondsRemaining === presetMins * 60
                : stopwatchSeconds === 0
            }
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-40 transition-all"
            title="Log session time immediately"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Finish & Log</span>
          </button>
        </div>
      </div>

      {/* Recent Pomodoro Sessions History */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Timer Sessions ({recentSessions.length})
            </h3>
          </div>
          <button
            onClick={onOpenDailyLog}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View in Daily Log</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            No completed sessions recorded yet. Start a timer and log your first focus sprint!
          </p>
        ) : (
          <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto">
            {recentSessions.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5 px-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 border border-indigo-500/20">
                    {s.duration_mins}m
                  </span>
                  <span className="font-semibold text-white">
                    {s.topic_title || 'General Focus Session'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {new Date(s.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
