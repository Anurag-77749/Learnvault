import { db, getTodayDateString, getOrCreateDailyLog, DailyLogEntry } from './db';

// Calculate sleep duration in hours from bedtime and wake time (HH:MM)
export function calculateSleepHours(bedtime: string, wakeTime: string): number {
  if (!bedtime || !wakeTime) return 0;
  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);

  let bedMinutes = bH * 60 + bM;
  let wakeMinutes = wH * 60 + wM;

  if (wakeMinutes < bedMinutes) {
    // Crosses midnight
    wakeMinutes += 24 * 60;
  }

  const diffHours = (wakeMinutes - bedMinutes) / 60;
  return Math.round(diffHours * 10) / 10;
}

// Add study minutes to today's log
export async function addStudyMinutes(minutes: number, topicTitle?: string) {
  const today = getTodayDateString();
  const log = await getOrCreateDailyLog(today);
  const updatedStudy = (log.studyMinutes || 0) + minutes;
  
  const topics = [...(log.topicsLearned || [])];
  if (topicTitle && !topics.includes(topicTitle)) {
    topics.push(topicTitle);
  }

  await db.dailyLogs.update(today, {
    studyMinutes: updatedStudy,
    topicsLearned: topics,
    updatedAt: Date.now(),
  });
}

// Add wasted minutes
export async function addWastedMinutes(
  minutes: number,
  reason: 'phone' | 'social media' | 'YouTube' | 'procrastination' | 'other',
  note?: string
) {
  const today = getTodayDateString();
  const log = await getOrCreateDailyLog(today);
  
  // 1. Record in wastedTimeLogs table
  await db.wastedTimeLogs.add({
    date: today,
    durationMinutes: minutes,
    reason,
    note,
    timestamp: Date.now(),
  });

  // 2. Update dailyLog
  await db.dailyLogs.update(today, {
    wastedMinutes: (log.wastedMinutes || 0) + minutes,
    updatedAt: Date.now(),
  });
}

// Add or update DSA questions with difficulty (easy, medium, hard)
export async function updateDSAQuestions(
  delta: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  platform: 'leetcode' | 'striver' | 'other' = 'leetcode',
  dateStr: string = getTodayDateString()
) {
  const log = await getOrCreateDailyLog(dateStr);
  const diffs = log.questionsDifficulty || { easy: 0, medium: 0, hard: 0 };
  const platforms = log.questionsPlatforms || { leetcode: 0, striver: 0, other: 0 };

  const currentDiffCount = diffs[difficulty] || 0;
  const newDiffCount = Math.max(0, currentDiffCount + delta);
  const actualDelta = newDiffCount - currentDiffCount;

  diffs[difficulty] = newDiffCount;
  platforms[platform] = Math.max(0, (platforms[platform] || 0) + actualDelta);

  const newTotal = (diffs.easy || 0) + (diffs.medium || 0) + (diffs.hard || 0);

  await db.dailyLogs.update(dateStr, {
    questionsCount: newTotal,
    questionsDifficulty: diffs,
    questionsPlatforms: platforms,
    updatedAt: Date.now(),
  });
}

// Log Communication / High-Level English Practice
export async function setCommunicationPracticed(
  practiced: boolean,
  note?: string,
  dateStr: string = getTodayDateString()
) {
  await getOrCreateDailyLog(dateStr);
  await db.dailyLogs.update(dateStr, {
    communicationPracticed: practiced,
    communicationNote: note,
    updatedAt: Date.now(),
  });
}

// Add question (generic)
export async function addQuestionSolved(
  platform: 'leetcode' | 'striver' | 'other' = 'leetcode',
  count = 1,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
  await updateDSAQuestions(count, difficulty, platform);
}

// Log sleep
export async function logSleep(bedtime: string, wakeTime: string, quality: number) {
  const today = getTodayDateString();
  await getOrCreateDailyLog(today);
  const hours = calculateSleepHours(bedtime, wakeTime);

  await db.dailyLogs.update(today, {
    sleepBedtime: bedtime,
    sleepWakeTime: wakeTime,
    sleepHours: hours,
    sleepQuality: quality,
    updatedAt: Date.now(),
  });
}

// Update one-line daily note
export async function updateDailyNote(note: string) {
  const today = getTodayDateString();
  await getOrCreateDailyLog(today);
  await db.dailyLogs.update(today, {
    oneLineNote: note,
    updatedAt: Date.now(),
  });
}

// Format minutes into clean human string (e.g. "2h 15m" or "45m")
export function formatMinutes(mins: number): string {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
