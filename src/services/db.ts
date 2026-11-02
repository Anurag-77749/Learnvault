import Dexie, { Table } from 'dexie';

export interface SubtopicItem {
  id: string;
  title: string;
  completed: boolean;
  status: 'not_started' | 'learning' | 'done' | 'revising';
  deadline?: string;
  completedDate?: string;
  resources: { title: string; url: string; isVideo?: boolean }[];
  notes?: string;
  orderIndex: number;
}

export interface CurriculumTopic {
  id: string;
  trackId: number;
  trackTitle: string;
  topicTitle: string;
  orderIndex: number;
  deadline?: string;
  completedDate?: string;
  resources?: { title: string; url: string; isVideo?: boolean }[];
  notes?: string;
  subtopics: SubtopicItem[];
}

export interface TaskItem {
  id?: number;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  order: number;
  topicId?: string;
  subtopicId?: string;
  subtopicTitle?: string;
  note?: string;
  createdAt: number;
  completedAt?: number;
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD (PK)
  studyMinutes: number;
  wastedMinutes: number;
  questionsCount: number;
  questionsPlatforms: {
    leetcode: number;
    striver: number;
    other: number;
  };
  questionsDifficulty?: {
    easy: number;
    medium: number;
    hard: number;
  };
  communicationPracticed?: boolean;
  communicationNote?: string;
  topicsLearned: string[];
  sleepBedtime?: string;
  sleepWakeTime?: string;
  sleepHours?: number;
  sleepQuality?: number; // 1 to 5
  oneLineNote?: string;
  updatedAt: number;
}

export interface PomodoroSessionRecord {
  id?: number;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';
  topicId?: string;
  topicTitle?: string;
  timestamp: number;
}

export interface WastedTimeRecord {
  id?: number;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  reason: 'phone' | 'social media' | 'YouTube' | 'procrastination' | 'other';
  note?: string;
  timestamp: number;
}

export interface WastedDayRecord {
  id?: number;
  date: string; // YYYY-MM-DD
  reason: string;
  reasons?: string[];
  explanation: string;
  hoursWasted?: number;
  createdAt: number;
}

export interface TimelineBlock {
  id?: number;
  trackId?: number;
  topicId?: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  laneIndex: number;
  color?: string;
  isParallel?: boolean;
  status?: string;
  notes?: string;
}

export interface ProjectItem {
  id?: number;
  name: string;
  category?: string;
  aboutReadme: string;
  githubUrl: string;
  liveDemoUrl?: string;
  status: 'In Progress' | 'Completed' | 'MVP Ready' | 'Ideation';
  startDate: string;
  completedDate?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export class FDEDatabase extends Dexie {
  tasks!: Table<TaskItem, number>;
  dailyLogs!: Table<DailyLogEntry, string>;
  pomodoroSessions!: Table<PomodoroSessionRecord, number>;
  wastedTimeLogs!: Table<WastedTimeRecord, number>;
  curriculumTopics!: Table<CurriculumTopic, string>;
  timelineBlocks!: Table<TimelineBlock, number>;
  projects!: Table<ProjectItem, number>;
  wastedDays!: Table<WastedDayRecord, number>;

  constructor() {
    super('fde_tracker_db');
    this.version(1).stores({
      tasks: '++id, date, completed, order, subtopicId, createdAt',
      dailyLogs: 'date, updatedAt',
      pomodoroSessions: '++id, date, timestamp, topicId',
      wastedTimeLogs: '++id, date, timestamp, reason',
      curriculumTopics: 'id, trackId, orderIndex',
      timelineBlocks: '++id, trackId, startDate, endDate, laneIndex',
      projects: '++id, status, category, createdAt',
    });
    this.version(2).stores({
      projects: '++id, status, category, createdAt',
    });
    this.version(3).stores({
      wastedDays: '++id, date, reason, createdAt',
    });
  }
}

export const db = new FDEDatabase();

// Format local date YYYY-MM-DD
export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get or initialize today's daily log
export async function getOrCreateDailyLog(dateStr: string = getTodayDateString()): Promise<DailyLogEntry> {
  let log = await db.dailyLogs.get(dateStr);
  if (!log) {
    log = {
      date: dateStr,
      studyMinutes: 0,
      wastedMinutes: 0,
      questionsCount: 0,
      questionsPlatforms: { leetcode: 0, striver: 0, other: 0 },
      topicsLearned: [],
      updatedAt: Date.now(),
    };
    await db.dailyLogs.put(log);
  }
  return log;
}
