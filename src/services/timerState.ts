import { db, getTodayDateString, PomodoroSessionRecord } from './db';
import { addStudyMinutes, addWastedMinutes } from './dailyLogService';
import { playChimeSound, triggerVibration } from '../utils/sound';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
export type AppTimerTab = 'pomodoro' | 'stopwatch' | 'wasted';

export interface TimerSettings {
  focusDurationMins: number; // default 25
  shortBreakMins: number;    // default 5
  longBreakMins: number;     // default 15
  longBreakInterval: number; // default 4 rounds
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDurationMins: 25,
  shortBreakMins: 5,
  longBreakMins: 15,
  longBreakInterval: 4,
};

const TIMER_STORAGE_KEY = 'fde_timer_state_v1';
const TIMER_SETTINGS_KEY = 'fde_timer_settings_v1';

export interface StoredTimerState {
  tab: AppTimerTab;
  mode: TimerMode;
  isRunning: boolean;
  selectedTopic: string;
  roundCount: number; // 1, 2, 3, 4
  durationSeconds: number;
  remainingSeconds: number;
  targetEndTime: number | null; // Date.now() + remainingSeconds * 1000
  // Stopwatch states
  stopwatchRunning: boolean;
  stopwatchStartTimestamp: number | null;
  stopwatchAccruedSeconds: number;
  // Wasted stopwatch states
  wastedRunning: boolean;
  wastedStartTimestamp: number | null;
  wastedAccruedSeconds: number;
  wastedReason: 'phone' | 'social media' | 'YouTube' | 'procrastination' | 'other';
}

export function loadTimerSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem(TIMER_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_TIMER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load timer settings:', e);
  }
  return DEFAULT_TIMER_SETTINGS;
}

export function saveTimerSettings(settings: TimerSettings) {
  try {
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save timer settings:', e);
  }
}

export function getInitialTimerState(settings: TimerSettings): StoredTimerState {
  try {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) {
      const parsed: StoredTimerState = JSON.parse(saved);
      const now = Date.now();

      // Recalculate pomodoro if running
      if (parsed.isRunning && parsed.targetEndTime) {
        const remaining = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000));
        parsed.remainingSeconds = remaining;
      }

      // Recalculate stopwatch if running
      if (parsed.stopwatchRunning && parsed.stopwatchStartTimestamp) {
        const diff = Math.floor((now - parsed.stopwatchStartTimestamp) / 1000);
        parsed.stopwatchAccruedSeconds += Math.max(0, diff);
        parsed.stopwatchStartTimestamp = now;
      }

      // Recalculate wasted stopwatch if running
      if (parsed.wastedRunning && parsed.wastedStartTimestamp) {
        const diff = Math.floor((now - parsed.wastedStartTimestamp) / 1000);
        parsed.wastedAccruedSeconds += Math.max(0, diff);
        parsed.wastedStartTimestamp = now;
      }

      return parsed;
    }
  } catch (e) {
    console.warn('Failed reading timer state:', e);
  }

  return {
    tab: 'pomodoro',
    mode: 'pomodoro',
    isRunning: false,
    selectedTopic: 'General FDE Study',
    roundCount: 1,
    durationSeconds: settings.focusDurationMins * 60,
    remainingSeconds: settings.focusDurationMins * 60,
    targetEndTime: null,
    stopwatchRunning: false,
    stopwatchStartTimestamp: null,
    stopwatchAccruedSeconds: 0,
    wastedRunning: false,
    wastedStartTimestamp: null,
    wastedAccruedSeconds: 0,
    wastedReason: 'procrastination',
  };
}

export function saveTimerState(state: StoredTimerState) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed saving timer state:', e);
  }
}

// Log a finished Pomodoro focus session
export async function completePomodoroSession(
  durationMins: number,
  topicTitle: string,
  mode: TimerMode,
  alreadyCreditedMins = 0
) {
  playChimeSound();
  triggerVibration([200, 100, 200, 100, 300]);

  if (mode === 'pomodoro' && durationMins > 0) {
    const today = getTodayDateString();
    await db.pomodoroSessions.add({
      date: today,
      durationMinutes: durationMins,
      mode: 'pomodoro',
      topicTitle,
      timestamp: Date.now(),
    });
    const remainingToCredit = Math.max(0, durationMins - alreadyCreditedMins);
    if (remainingToCredit > 0) {
      await addStudyMinutes(remainingToCredit, topicTitle);
    }
  }
}
