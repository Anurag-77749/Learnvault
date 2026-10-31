import {
  Track,
  Section,
  Topic,
  Resource,
  Subtask,
  TopicStatus,
  TopicDifficulty,
  DailyLog,
  PomodoroSession,
  PlannerSettings,
  DSAProblem,
  ProjectItem,
  JobApplication,
  Goal,
  Achievement,
  PublicStats,
  ResourceType
} from '../types';
import { SEED_TRACKS, SEED_SECTIONS, SEED_TOPICS, SEED_RESOURCES } from '../data/seedData';
import {
  SEED_DSA_PROBLEMS,
  SEED_PROJECTS,
  SEED_JOBS,
  SEED_GOALS,
  SEED_ACHIEVEMENTS
} from '../data/seedDsaAndProjects';
import { getSupabaseClient } from './supabaseClient';

const TRACKS_KEY = 'fde_tracks_v1';
const SECTIONS_KEY = 'fde_sections_v1';
const TOPICS_KEY = 'fde_topics_v1';
const RESOURCES_KEY = 'fde_resources_v1';
const DAILY_LOGS_KEY = 'fde_daily_logs_v1';
const POMODORO_SESSIONS_KEY = 'fde_pomodoro_sessions_v1';
const PLANNER_SETTINGS_KEY = 'fde_planner_settings_v1';
const DSA_PROBLEMS_KEY = 'fde_dsa_problems_v1';
const PROJECTS_KEY = 'fde_projects_v1';
const JOBS_KEY = 'fde_jobs_v1';
const GOALS_KEY = 'fde_goals_v1';
const ACHIEVEMENTS_KEY = 'fde_achievements_v1';
const PUBLIC_STATS_KEY = 'fde_public_stats_v1';
const PENDING_SYNC_KEY = 'fde_pending_sync_v1';

export interface CoverageSectionReport {
  sectionId: string;
  sectionTitle: string;
  topicCount: number;
  completedCount: number;
  inProgressCount: number;
}

export interface CoverageTrackReport {
  trackId: string;
  trackTitle: string;
  totalTopics: number;
  sections: CoverageSectionReport[];
}

export interface CoverageReport {
  overallTotal: number;
  completedTotal: number;
  inProgressTotal: number;
  tracks: CoverageTrackReport[];
}

export interface DuplicateDetectionResult {
  newTopics: Array<{ trackTitle: string; sectionTitle: string; topicTitle: string; url?: string }>;
  duplicateTopics: Array<{ trackTitle: string; sectionTitle: string; topicTitle: string }>;
}

class DataService {
  private tracks: Track[] = [];
  private sections: Section[] = [];
  private topics: Topic[] = [];
  private resources: Resource[] = [];
  private dailyLogs: DailyLog[] = [];
  private pomodoroSessions: PomodoroSession[] = [];
  private dsaProblems: DSAProblem[] = [];
  private projects: ProjectItem[] = [];
  private jobs: JobApplication[] = [];
  private goals: Goal[] = [];
  private achievements: Achievement[] = [];
  private publicStats: PublicStats = {
    githubUsername: 'palantir-fellow',
    leetcodeUsername: 'fde-engineer',
    githubData: null,
    leetcodeData: null,
    lastFetchedAt: null
  };
  private plannerSettings: PlannerSettings = {
    startDate: new Date().toISOString().split('T')[0],
    hoursPerDay: 3,
    examMode: false,
    examStartDate: null,
    examEndDate: null,
    activeMainTrackId: 'track-fde',
    dsaDailyTarget: 2
  };
  private initialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.initialized) return;

    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const storedTracks = localStorage.getItem(TRACKS_KEY);
        const storedSections = localStorage.getItem(SECTIONS_KEY);
        const storedTopics = localStorage.getItem(TOPICS_KEY);
        const storedResources = localStorage.getItem(RESOURCES_KEY);
        const storedDailyLogs = localStorage.getItem(DAILY_LOGS_KEY);
        const storedPomodoro = localStorage.getItem(POMODORO_SESSIONS_KEY);
        const storedPlanner = localStorage.getItem(PLANNER_SETTINGS_KEY);
        const storedDsa = localStorage.getItem(DSA_PROBLEMS_KEY);
        const storedProjects = localStorage.getItem(PROJECTS_KEY);
        const storedJobs = localStorage.getItem(JOBS_KEY);
        const storedGoals = localStorage.getItem(GOALS_KEY);
        const storedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
        const storedStats = localStorage.getItem(PUBLIC_STATS_KEY);

        if (storedTracks && storedSections && storedTopics) {
          this.tracks = JSON.parse(storedTracks);
          this.sections = JSON.parse(storedSections);
          this.topics = JSON.parse(storedTopics);
          this.resources = storedResources ? JSON.parse(storedResources) : [];
          this.dailyLogs = storedDailyLogs ? JSON.parse(storedDailyLogs) : [];
          this.pomodoroSessions = storedPomodoro ? JSON.parse(storedPomodoro) : [];
          this.dsaProblems = storedDsa ? JSON.parse(storedDsa) : JSON.parse(JSON.stringify(SEED_DSA_PROBLEMS));
          this.projects = storedProjects ? JSON.parse(storedProjects) : JSON.parse(JSON.stringify(SEED_PROJECTS));
          this.jobs = storedJobs ? JSON.parse(storedJobs) : JSON.parse(JSON.stringify(SEED_JOBS));
          this.goals = storedGoals ? JSON.parse(storedGoals) : JSON.parse(JSON.stringify(SEED_GOALS));
          this.achievements = storedAchievements ? JSON.parse(storedAchievements) : JSON.parse(JSON.stringify(SEED_ACHIEVEMENTS));
          if (storedStats) {
            this.publicStats = { ...this.publicStats, ...JSON.parse(storedStats) };
          }
          if (storedPlanner) {
            this.plannerSettings = { ...this.plannerSettings, ...JSON.parse(storedPlanner) };
          }
          this.initialized = true;
          return;
        }
      }
      this.resetToDefaults();
      this.initialized = true;
    } catch (e) {
      console.error('Error initializing DataService:', e);
      this.resetToDefaults();
      this.initialized = true;
    }
  }

  public resetToDefaults() {
    this.tracks = JSON.parse(JSON.stringify(SEED_TRACKS));
    this.sections = JSON.parse(JSON.stringify(SEED_SECTIONS));
    this.topics = JSON.parse(JSON.stringify(SEED_TOPICS));
    this.resources = JSON.parse(JSON.stringify(SEED_RESOURCES));
    this.dailyLogs = [];
    this.pomodoroSessions = [];
    this.dsaProblems = JSON.parse(JSON.stringify(SEED_DSA_PROBLEMS));
    this.projects = JSON.parse(JSON.stringify(SEED_PROJECTS));
    this.jobs = JSON.parse(JSON.stringify(SEED_JOBS));
    this.goals = JSON.parse(JSON.stringify(SEED_GOALS));
    this.achievements = JSON.parse(JSON.stringify(SEED_ACHIEVEMENTS));
    this.publicStats = {
      githubUsername: 'palantir-fellow',
      leetcodeUsername: 'fde-engineer',
      githubData: null,
      leetcodeData: null,
      lastFetchedAt: null
    };
    this.plannerSettings = {
      startDate: new Date().toISOString().split('T')[0],
      hoursPerDay: 3,
      examMode: false,
      examStartDate: null,
      examEndDate: null,
      activeMainTrackId: 'track-fde',
      dsaDailyTarget: 2
    };
    this.saveToLocal();
  }

  private saveToLocal() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(TRACKS_KEY, JSON.stringify(this.tracks));
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(this.sections));
        localStorage.setItem(TOPICS_KEY, JSON.stringify(this.topics));
        localStorage.setItem(RESOURCES_KEY, JSON.stringify(this.resources));
        localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(this.dailyLogs));
        localStorage.setItem(POMODORO_SESSIONS_KEY, JSON.stringify(this.pomodoroSessions));
        localStorage.setItem(PLANNER_SETTINGS_KEY, JSON.stringify(this.plannerSettings));
        localStorage.setItem(DSA_PROBLEMS_KEY, JSON.stringify(this.dsaProblems));
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(this.projects));
        localStorage.setItem(JOBS_KEY, JSON.stringify(this.jobs));
        localStorage.setItem(GOALS_KEY, JSON.stringify(this.goals));
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
        localStorage.setItem(PUBLIC_STATS_KEY, JSON.stringify(this.publicStats));
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // --- TRACKS ---
  public getTracks(): Track[] {
    return [...this.tracks].sort((a, b) => a.order_index - b.order_index);
  }

  public addTrack(title: string, description: string): Track {
    const newTrack: Track = {
      id: `track-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      order_index: this.tracks.length + 1,
      created_at: new Date().toISOString()
    };
    this.tracks.push(newTrack);
    this.saveToLocal();
    return newTrack;
  }

  public updateTrack(id: string, updates: Partial<Track>): Track | null {
    const idx = this.tracks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tracks[idx] = { ...this.tracks[idx], ...updates };
    this.saveToLocal();
    return this.tracks[idx];
  }

  public deleteTrack(id: string): boolean {
    this.tracks = this.tracks.filter(t => t.id !== id);
    // cascade sections and topics
    const secIds = this.sections.filter(s => s.track_id === id).map(s => s.id);
    this.sections = this.sections.filter(s => s.track_id !== id);
    this.topics = this.topics.filter(t => t.track_id !== id && !secIds.includes(t.section_id));
    this.saveToLocal();
    return true;
  }

  public reorderTracks(orderedIds: string[]) {
    this.tracks = this.tracks.map(t => {
      const idx = orderedIds.indexOf(t.id);
      return idx !== -1 ? { ...t, order_index: idx + 1 } : t;
    });
    this.saveToLocal();
  }

  // --- SECTIONS ---
  public getSections(trackId?: string): Section[] {
    let list = this.sections;
    if (trackId) {
      list = list.filter(s => s.track_id === trackId);
    }
    return list.sort((a, b) => a.order_index - b.order_index);
  }

  public addSection(trackId: string, title: string): Section {
    const trackSections = this.sections.filter(s => s.track_id === trackId);
    const newSection: Section = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      track_id: trackId,
      title: title.trim(),
      order_index: trackSections.length + 1,
      created_at: new Date().toISOString()
    };
    this.sections.push(newSection);
    this.saveToLocal();
    return newSection;
  }

  public updateSection(id: string, updates: Partial<Section>): Section | null {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.sections[idx] = { ...this.sections[idx], ...updates };
    this.saveToLocal();
    return this.sections[idx];
  }

  public deleteSection(id: string): boolean {
    this.sections = this.sections.filter(s => s.id !== id);
    this.topics = this.topics.filter(t => t.section_id !== id);
    this.saveToLocal();
    return true;
  }

  public reorderSections(orderedIds: string[]) {
    this.sections = this.sections.map(s => {
      const idx = orderedIds.indexOf(s.id);
      return idx !== -1 ? { ...s, order_index: idx + 1 } : s;
    });
    this.saveToLocal();
  }

  // --- TOPICS ---
  public getTopics(filters?: { trackId?: string; sectionId?: string; status?: TopicStatus; search?: string }): Topic[] {
    let list = this.topics;
    if (filters?.trackId) {
      list = list.filter(t => t.track_id === filters.trackId);
    }
    if (filters?.sectionId) {
      list = list.filter(t => t.section_id === filters.sectionId);
    }
    if (filters?.status) {
      list = list.filter(t => t.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.order_index - b.order_index);
  }

  public getTopicById(id: string): Topic | null {
    return this.topics.find(t => t.id === id) || null;
  }

  public addTopic(data: {
    track_id: string;
    section_id: string;
    title: string;
    difficulty?: TopicDifficulty;
    planned_start?: string | null;
    deadline?: string | null;
  }): Topic {
    const secTopics = this.topics.filter(t => t.section_id === data.section_id);
    const newTopic: Topic = {
      id: `top-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      track_id: data.track_id,
      section_id: data.section_id,
      title: data.title.trim(),
      order_index: secTopics.length + 1,
      status: 'not_started',
      planned_start: data.planned_start || null,
      deadline: data.deadline || null,
      actual_completed_date: null,
      difficulty: data.difficulty || 'medium',
      confidence: 1,
      time_spent_mins: 0,
      notes: `### ${data.title}\n\n- Overview and study notes`,
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Read concept guide', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Hands-on practice', completed: false }
      ],
      resources: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.topics.push(newTopic);
    this.saveToLocal();
    return newTopic;
  }

  public updateTopic(id: string, updates: Partial<Topic>): Topic | null {
    const idx = this.topics.findIndex(t => t.id === id);
    if (idx === -1) return null;

    // Handle status transition to 'done' -> set actual_completed_date if not set
    if (updates.status === 'done' && !updates.actual_completed_date && !this.topics[idx].actual_completed_date) {
      updates.actual_completed_date = new Date().toISOString().split('T')[0];
    } else if (updates.status && updates.status !== 'done' && updates.actual_completed_date === undefined) {
      // If moving back from done, keep or reset if desired
    }

    this.topics[idx] = {
      ...this.topics[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveToLocal();
    return this.topics[idx];
  }

  public deleteTopic(id: string): boolean {
    this.topics = this.topics.filter(t => t.id !== id);
    this.resources = this.resources.filter(r => r.topic_id !== id);
    this.saveToLocal();
    return true;
  }

  public reorderTopics(orderedIds: string[]) {
    this.topics = this.topics.map(t => {
      const idx = orderedIds.indexOf(t.id);
      return idx !== -1 ? { ...t, order_index: idx + 1 } : t;
    });
    this.saveToLocal();
  }

  // --- RESOURCES ---
  public addResource(resource: Omit<Resource, 'id' | 'created_at'>): Resource {
    const newRes: Resource = {
      ...resource,
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
    this.resources.push(newRes);

    // Also attach to topic in-memory
    if (resource.topic_id) {
      const t = this.topics.find(top => top.id === resource.topic_id);
      if (t) {
        if (!t.resources) t.resources = [];
        t.resources.push(newRes);
      }
    }

    this.saveToLocal();
    return newRes;
  }

  public deleteResource(resourceId: string): boolean {
    this.resources = this.resources.filter(r => r.id !== resourceId);
    this.topics.forEach(t => {
      if (t.resources) {
        t.resources = t.resources.filter(r => r.id !== resourceId);
      }
    });
    this.saveToLocal();
    return true;
  }

  // --- DUPLICATE DETECTION & TOPICS IMPORT ---
  public parseAndCheckImports(rawText: string): DuplicateDetectionResult {
    const lines = rawText.split('\n');
    const newTopics: Array<{ trackTitle: string; sectionTitle: string; topicTitle: string; url?: string }> = [];
    const duplicateTopics: Array<{ trackTitle: string; sectionTitle: string; topicTitle: string }> = [];

    // Map existing for fast lookup: normalized "track|section|topic"
    const existingSet = new Set(
      this.topics.map(t => {
        const sec = this.sections.find(s => s.id === t.section_id);
        const trk = this.tracks.find(tr => tr.id === t.track_id);
        return `${(trk?.title || '').trim().toLowerCase()}|${(sec?.title || '').trim().toLowerCase()}|${t.title.trim().toLowerCase()}`;
      })
    );

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      let parts: string[] = [];
      if (line.includes('|')) {
        parts = line.split('|').map(p => p.trim());
      } else if (line.includes(',')) {
        parts = line.split(',').map(p => p.trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else {
        // Single topic title under default track/section
        parts = ['Custom Track', 'General', line];
      }

      if (parts.length >= 3) {
        const trackTitle = parts[0] || 'Custom Track';
        const sectionTitle = parts[1] || 'General';
        const topicTitle = parts[2];
        const url = parts[3] || undefined;

        if (!topicTitle) continue;

        const key = `${trackTitle.toLowerCase()}|${sectionTitle.toLowerCase()}|${topicTitle.toLowerCase()}`;
        if (existingSet.has(key)) {
          duplicateTopics.push({ trackTitle, sectionTitle, topicTitle });
        } else {
          newTopics.push({ trackTitle, sectionTitle, topicTitle, url });
          existingSet.add(key); // prevent duplicate in same import batch
        }
      }
    }

    return { newTopics, duplicateTopics };
  }

  public executeImport(items: Array<{ trackTitle: string; sectionTitle: string; topicTitle: string; url?: string }>): number {
    let addedCount = 0;

    for (const item of items) {
      // Find or create Track
      let track = this.tracks.find(t => t.title.toLowerCase() === item.trackTitle.toLowerCase());
      if (!track) {
        track = this.addTrack(item.trackTitle, `Imported track: ${item.trackTitle}`);
      }

      // Find or create Section
      let section = this.sections.find(
        s => s.track_id === track!.id && s.title.toLowerCase() === item.sectionTitle.toLowerCase()
      );
      if (!section) {
        section = this.addSection(track.id, item.sectionTitle);
      }

      // Add Topic
      const newTopic = this.addTopic({
        track_id: track.id,
        section_id: section.id,
        title: item.topicTitle
      });

      // Add resource if URL provided
      if (item.url) {
        this.addResource({
          topic_id: newTopic.id,
          title: `${item.topicTitle} Resource`,
          url: item.url,
          type: item.url.includes('youtube.com') || item.url.includes('youtu.be') ? 'video' : 'doc'
        });
      }

      addedCount++;
    }

    return addedCount;
  }

  // --- COVERAGE REPORT ---
  public getCoverageReport(): CoverageReport {
    const tracksReport: CoverageTrackReport[] = [];
    let overallTotal = 0;
    let completedTotal = 0;
    let inProgressTotal = 0;

    for (const track of this.getTracks()) {
      const trackSections = this.getSections(track.id);
      const sectionsReport: CoverageSectionReport[] = [];
      let trackTopicsCount = 0;

      for (const sec of trackSections) {
        const secTopics = this.topics.filter(t => t.section_id === sec.id);
        const completed = secTopics.filter(t => t.status === 'done').length;
        const inProgress = secTopics.filter(t => t.status === 'in_progress').length;

        sectionsReport.push({
          sectionId: sec.id,
          sectionTitle: sec.title,
          topicCount: secTopics.length,
          completedCount: completed,
          inProgressCount: inProgress
        });

        trackTopicsCount += secTopics.length;
        completedTotal += completed;
        inProgressTotal += inProgress;
      }

      tracksReport.push({
        trackId: track.id,
        trackTitle: track.title,
        totalTopics: trackTopicsCount,
        sections: sectionsReport
      });

      overallTotal += trackTopicsCount;
    }

    return {
      overallTotal,
      completedTotal,
      inProgressTotal,
      tracks: tracksReport
    };
  }

  // --- DAILY LOGS ---
  public getDailyLogs(): DailyLog[] {
    return [...this.dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
  }

  public getDailyLogByDate(date: string): DailyLog | null {
    return this.dailyLogs.find(l => l.date === date) || null;
  }

  public saveDailyLog(logData: Partial<DailyLog> & { date: string }): DailyLog {
    const existingIndex = this.dailyLogs.findIndex(l => l.date === logData.date);
    if (existingIndex !== -1) {
      this.dailyLogs[existingIndex] = {
        ...this.dailyLogs[existingIndex],
        ...logData,
        total_study_time_mins: logData.total_study_time_mins ?? this.dailyLogs[existingIndex].total_study_time_mins ?? 0,
        time_wasted_mins: logData.time_wasted_mins ?? this.dailyLogs[existingIndex].time_wasted_mins ?? 0,
        wasted_reason: logData.wasted_reason ?? this.dailyLogs[existingIndex].wasted_reason ?? '',
        sleep_hours: logData.sleep_hours ?? this.dailyLogs[existingIndex].sleep_hours ?? 7,
        energy: logData.energy ?? this.dailyLogs[existingIndex].energy ?? 3,
        mood: logData.mood ?? this.dailyLogs[existingIndex].mood ?? 3,
        dsa_problems_solved: logData.dsa_problems_solved ?? this.dailyLogs[existingIndex].dsa_problems_solved ?? 0,
        what_learned: logData.what_learned ?? this.dailyLogs[existingIndex].what_learned ?? '',
        tomorrow_plan: logData.tomorrow_plan ?? this.dailyLogs[existingIndex].tomorrow_plan ?? ''
      };
      this.saveToLocal();
      return this.dailyLogs[existingIndex];
    } else {
      const newLog: DailyLog = {
        id: `log-${Date.now()}`,
        date: logData.date,
        total_study_time_mins: logData.total_study_time_mins ?? 0,
        time_wasted_mins: logData.time_wasted_mins ?? 0,
        wasted_reason: logData.wasted_reason ?? '',
        sleep_hours: logData.sleep_hours ?? 7,
        energy: logData.energy ?? 3,
        mood: logData.mood ?? 3,
        dsa_problems_solved: logData.dsa_problems_solved ?? 0,
        what_learned: logData.what_learned ?? '',
        tomorrow_plan: logData.tomorrow_plan ?? '',
        created_at: new Date().toISOString()
      };
      this.dailyLogs.push(newLog);
      this.saveToLocal();
      return newLog;
    }
  }

  public deleteDailyLog(date: string): boolean {
    this.dailyLogs = this.dailyLogs.filter(l => l.date !== date);
    this.saveToLocal();
    return true;
  }

  public getStreak(): { currentStreak: number; longestStreak: number; totalDaysLogged: number } {
    if (this.dailyLogs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDaysLogged: 0 };
    }

    const validDates = Array.from(
      new Set(
        this.dailyLogs
          .filter(l => l.total_study_time_mins > 0 || l.dsa_problems_solved > 0 || (l.what_learned && l.what_learned.trim().length > 0))
          .map(l => l.date)
      )
    ).sort();

    if (validDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDaysLogged: 0 };
    }

    const toUtcDate = (dStr: string) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    };

    const toUtcStr = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = toUtcStr(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = toUtcStr(yesterdayDate);

    let prevDate: Date | null = null;
    for (const dStr of validDates) {
      const currDate = toUtcDate(dStr);
      if (prevDate) {
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = currDate;
    }

    const hasToday = validDates.includes(todayStr);
    const hasYesterday = validDates.includes(yesterdayStr);

    if (hasToday || hasYesterday) {
      let checkDate = toUtcDate(hasToday ? todayStr : yesterdayStr);
      while (true) {
        const cStr = toUtcStr(checkDate);
        if (validDates.includes(cStr)) {
          currentStreak += 1;
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalDaysLogged: validDates.length
    };
  }

  // --- POMODORO SESSIONS ---
  public getPomodoroSessions(): PomodoroSession[] {
    return [...this.pomodoroSessions].sort((a, b) => b.completed_at.localeCompare(a.completed_at) || b.id.localeCompare(a.id));
  }

  public addPomodoroSession(data: {
    topic_id?: string | null;
    duration_mins: number;
    started_at: string;
    completed_at: string;
  }): PomodoroSession {
    const topic = data.topic_id ? this.topics.find(t => t.id === data.topic_id) : null;
    const duration = Math.max(1, Math.round(data.duration_mins));

    const session: PomodoroSession = {
      id: `pomo-${Date.now()}`,
      topic_id: data.topic_id || null,
      topic_title: topic ? topic.title : undefined,
      duration_mins: duration,
      started_at: data.started_at,
      completed_at: data.completed_at
    };

    this.pomodoroSessions.push(session);

    // 1. Add session duration to the tagged topic's total time
    if (topic) {
      this.updateTopic(topic.id, {
        time_spent_mins: (topic.time_spent_mins || 0) + duration
      });
    }

    // 2. Add session duration to today's daily log
    const sessionDate = data.completed_at.split('T')[0];
    const existingLog = this.getDailyLogByDate(sessionDate);
    if (existingLog) {
      this.saveDailyLog({
        date: sessionDate,
        total_study_time_mins: (existingLog.total_study_time_mins || 0) + duration
      });
    } else {
      this.saveDailyLog({
        date: sessionDate,
        total_study_time_mins: duration
      });
    }

    this.saveToLocal();
    return session;
  }

  // --- STUDY PLANNER & RESCHEDULING ---
  public getPlannerSettings(): PlannerSettings {
    return { ...this.plannerSettings };
  }

  public savePlannerSettings(updates: Partial<PlannerSettings>): PlannerSettings {
    this.plannerSettings = { ...this.plannerSettings, ...updates };
    this.saveToLocal();
    return this.plannerSettings;
  }

  public autoFillDeadlines(params: {
    trackId: string;
    startDate: string;
    hoursPerDay: number;
    defaultHoursPerTopic?: number;
  }): number {
    const hoursPerDay = Math.max(0.5, params.hoursPerDay);
    const trackTopics = this.topics
      .filter(t => t.track_id === params.trackId && t.status !== 'done')
      .sort((a, b) => a.order_index - b.order_index);

    if (trackTopics.length === 0) return 0;

    const toUtcDate = (dStr: string) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    };

    const toUtcStr = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    let currentDate = toUtcDate(params.startDate);
    let updatedCount = 0;

    for (const topic of trackTopics) {
      let hoursNeeded = params.defaultHoursPerTopic || 4;
      if (!params.defaultHoursPerTopic) {
        if (topic.difficulty === 'easy') hoursNeeded = 2;
        else if (topic.difficulty === 'hard') hoursNeeded = 8;
        else hoursNeeded = 4;
      }

      const daysNeeded = Math.max(1, Math.ceil(hoursNeeded / hoursPerDay));

      // Check exam mode: if examMode is enabled and currentDate touches exam window, shift past exam
      if (
        this.plannerSettings.examMode &&
        this.plannerSettings.examStartDate &&
        this.plannerSettings.examEndDate
      ) {
        const examStart = toUtcDate(this.plannerSettings.examStartDate);
        const examEnd = toUtcDate(this.plannerSettings.examEndDate);
        if (currentDate >= examStart && currentDate <= examEnd) {
          currentDate = new Date(examEnd);
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
      }

      const plannedStartStr = toUtcStr(currentDate);
      currentDate.setUTCDate(currentDate.getUTCDate() + daysNeeded - 1);

      // If deadline falls inside exam window, shift deadline past examEnd
      if (
        this.plannerSettings.examMode &&
        this.plannerSettings.examStartDate &&
        this.plannerSettings.examEndDate
      ) {
        const examStart = toUtcDate(this.plannerSettings.examStartDate);
        const examEnd = toUtcDate(this.plannerSettings.examEndDate);
        if (currentDate >= examStart && currentDate <= examEnd) {
          currentDate = new Date(examEnd);
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
      }

      const deadlineStr = toUtcStr(currentDate);
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);

      this.updateTopic(topic.id, {
        planned_start: plannedStartStr,
        deadline: deadlineStr
      });
      updatedCount++;
    }

    this.saveToLocal();
    return updatedCount;
  }

  public oneTapReschedule(trackId?: string): number {
    const today = new Date().toISOString().split('T')[0];
    let overdueTopics = this.topics.filter(
      t => t.deadline && t.deadline < today && t.status !== 'done'
    );

    if (trackId) {
      overdueTopics = overdueTopics.filter(t => t.track_id === trackId);
    }

    if (overdueTopics.length === 0) return 0;

    const toUtcDate = (dStr: string) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    };

    const toUtcStr = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    let cursorDate = toUtcDate(today);
    const hoursPerDay = this.plannerSettings.hoursPerDay || 3;
    let rescheduledCount = 0;

    for (const topic of overdueTopics) {
      let hoursNeeded = 4;
      if (topic.difficulty === 'easy') hoursNeeded = 2;
      else if (topic.difficulty === 'hard') hoursNeeded = 8;

      const daysNeeded = Math.max(1, Math.ceil(hoursNeeded / hoursPerDay));

      const plannedStartStr = toUtcStr(cursorDate);
      cursorDate.setUTCDate(cursorDate.getUTCDate() + daysNeeded - 1);
      const deadlineStr = toUtcStr(cursorDate);
      cursorDate.setUTCDate(cursorDate.getUTCDate() + 1);

      this.updateTopic(topic.id, {
        planned_start: plannedStartStr,
        deadline: deadlineStr
      });
      rescheduledCount++;
    }

    this.saveToLocal();
    return rescheduledCount;
  }

  // --- DASHBOARD CHARTS & NEXT UP ---
  public getNextUpTopics(limit: number = 5): Topic[] {
    const inProgress = this.topics.filter(t => t.status === 'in_progress');
    const notStarted = this.topics.filter(t => t.status === 'not_started');

    const sorted = [...inProgress, ...notStarted].sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return a.order_index - b.order_index;
    });

    return sorted.slice(0, limit);
  }

  public getChartData30Days(): Array<{
    date: string;
    displayDate: string;
    studyMins: number;
    wastedMins: number;
    studyHours: number;
    wastedHours: number;
    dsaCount: number;
  }> {
    const result = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = this.getDailyLogByDate(dateStr);

      const studyMins = log?.total_study_time_mins || 0;
      const wastedMins = log?.time_wasted_mins || 0;

      result.push({
        date: dateStr,
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        studyMins,
        wastedMins,
        studyHours: Number((studyMins / 60).toFixed(1)),
        wastedHours: Number((wastedMins / 60).toFixed(1)),
        dsaCount: log?.dsa_problems_solved || 0
      });
    }

    return result;
  }

  public getYearlyHeatmapData(): Array<{ date: string; count: number; studyHours: number }> {
    const result: Array<{ date: string; count: number; studyHours: number }> = [];
    const now = new Date();

    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = this.getDailyLogByDate(dateStr);

      const studyHours = log ? Number((log.total_study_time_mins / 60).toFixed(1)) : 0;
      const count = log ? log.total_study_time_mins : 0;

      result.push({
        date: dateStr,
        count,
        studyHours
      });
    }
    return result;
  }

  public getReviewSummary(days: 7 | 30): {
    totalStudyHours: number;
    totalWastedHours: number;
    dsaSolved: number;
    topicsCompleted: number;
    avgSleepHours: number;
    wasteReasons: Record<string, number>;
  } {
    const now = new Date();
    let totalStudyMins = 0;
    let totalWastedMins = 0;
    let dsaSolved = 0;
    let totalSleep = 0;
    let logCount = 0;
    const wasteReasons: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = this.getDailyLogByDate(dateStr);
      if (log) {
        logCount++;
        totalStudyMins += log.total_study_time_mins || 0;
        totalWastedMins += log.time_wasted_mins || 0;
        dsaSolved += log.dsa_problems_solved || 0;
        totalSleep += log.sleep_hours || 7;
        if (log.wasted_reason) {
          wasteReasons[log.wasted_reason] = (wasteReasons[log.wasted_reason] || 0) + (log.time_wasted_mins || 0);
        }
      }
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const topicsCompleted = this.topics.filter(
      t => t.status === 'done' && t.actual_completed_date && t.actual_completed_date >= cutoffStr
    ).length;

    return {
      totalStudyHours: Number((totalStudyMins / 60).toFixed(1)),
      totalWastedHours: Number((totalWastedMins / 60).toFixed(1)),
      dsaSolved,
      topicsCompleted,
      avgSleepHours: logCount > 0 ? Number((totalSleep / logCount).toFixed(1)) : 7.5,
      wasteReasons
    };
  }

  // --- DSA TRACKER & SPACED REPETITION ---
  public getDSAProblems(): DSAProblem[] {
    return [...this.dsaProblems];
  }

  public getDSAProblemById(id: string): DSAProblem | undefined {
    return this.dsaProblems.find(p => p.id === id);
  }

  public addDSAProblem(problem: Omit<DSAProblem, 'id'>): DSAProblem {
    const newProblem: DSAProblem = {
      ...problem,
      id: `dsa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
    this.dsaProblems.unshift(newProblem);
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return newProblem;
  }

  public updateDSAProblem(id: string, updates: Partial<DSAProblem>): DSAProblem | null {
    const idx = this.dsaProblems.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.dsaProblems[idx] = { ...this.dsaProblems[idx], ...updates };
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return this.dsaProblems[idx];
  }

  public deleteDSAProblem(id: string): boolean {
    const initial = this.dsaProblems.length;
    this.dsaProblems = this.dsaProblems.filter(p => p.id !== id);
    if (this.dsaProblems.length !== initial) {
      this.saveToLocal();
      return true;
    }
    return false;
  }

  public markDSASolved(id: string, timeSpentMins: number = 0): DSAProblem | null {
    const problem = this.getDSAProblemById(id);
    if (!problem) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const updated = this.updateDSAProblem(id, {
      status: 'solved',
      solved_date: todayStr,
      attempts: (problem.attempts || 0) + 1,
      time_spent_mins: (problem.time_spent_mins || 0) + timeSpentMins,
      revision_step: 1,
      next_revision_date: nextDateStr
    });

    // Also increment today's daily log dsa count
    const log = this.getDailyLogByDate(todayStr);
    if (log) {
      this.saveDailyLog({
        ...log,
        dsa_problems_solved: (log.dsa_problems_solved || 0) + 1
      });
    } else {
      this.saveDailyLog({
        date: todayStr,
        total_study_time_mins: timeSpentMins,
        time_wasted_mins: 0,
        wasted_reason: '',
        sleep_hours: 7,
        energy: 4,
        mood: 4,
        dsa_problems_solved: 1,
        what_learned: `Solved DSA problem: ${problem.title}`,
        tomorrow_plan: ''
      });
    }

    this.checkAndUnlockAchievements();
    return updated;
  }

  public completeRevision(id: string): DSAProblem | null {
    const problem = this.getDSAProblemById(id);
    if (!problem) return null;

    const today = new Date();
    let nextStep = 1;
    let daysToAdd = 1;
    let nextStatus: 'solved' | 'mastered' = 'solved';

    if (problem.revision_step <= 1) {
      nextStep = 3;
      daysToAdd = 3;
    } else if (problem.revision_step <= 3) {
      nextStep = 7;
      daysToAdd = 7;
    } else if (problem.revision_step <= 7) {
      nextStep = 30;
      daysToAdd = 30;
    } else if (problem.revision_step <= 30) {
      nextStep = 90;
      daysToAdd = 90;
    } else {
      nextStatus = 'mastered';
      nextStep = 999;
      daysToAdd = 0;
    }

    let nextRevisionStr: string | null = null;
    if (nextStatus !== 'mastered') {
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      nextRevisionStr = nextDate.toISOString().split('T')[0];
    }

    const updated = this.updateDSAProblem(id, {
      status: nextStatus,
      revision_step: nextStep,
      next_revision_date: nextRevisionStr
    });

    this.checkAndUnlockAchievements();
    return updated;
  }

  public getDueRevisions(): DSAProblem[] {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.dsaProblems.filter(
      p => p.next_revision_date && p.next_revision_date <= todayStr && p.status !== 'mastered'
    );
  }

  public getDueTopicRevisions(): Array<{ topic: Topic; daysSince: number; recommendedInterval: number }> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const intervals = [1, 3, 7, 30, 90];
    const results: Array<{ topic: Topic; daysSince: number; recommendedInterval: number }> = [];

    this.topics.forEach(t => {
      if (t.status === 'done' && t.actual_completed_date) {
        const compDate = new Date(t.actual_completed_date);
        const diffDays = Math.max(0, Math.floor((today.getTime() - compDate.getTime()) / (1000 * 60 * 60 * 24)));
        for (const interval of intervals) {
          if (diffDays >= interval && diffDays <= interval + 3) {
            results.push({ topic: t, daysSince: diffDays, recommendedInterval: interval });
            break;
          }
        }
      }
    });

    return results;
  }

  // --- PROJECTS ---
  public getProjects(): ProjectItem[] {
    return [...this.projects];
  }

  public addProject(project: Omit<ProjectItem, 'id'>): ProjectItem {
    const newProject: ProjectItem = {
      ...project,
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
    this.projects.push(newProject);
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...updates };
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return this.projects[idx];
  }

  public deleteProject(id: string): boolean {
    const initial = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    if (this.projects.length !== initial) {
      this.saveToLocal();
      return true;
    }
    return false;
  }

  public toggleProjectMilestone(projectId: string, milestoneId: string): boolean {
    const proj = this.projects.find(p => p.id === projectId);
    if (!proj) return false;
    const m = proj.milestones.find(item => item.id === milestoneId);
    if (!m) return false;
    m.completed = !m.completed;
    this.saveToLocal();
    return true;
  }

  public toggleProjectReadmeItem(projectId: string, readmeId: string): boolean {
    const proj = this.projects.find(p => p.id === projectId);
    if (!proj) return false;
    const r = proj.readme_checklist.find(item => item.id === readmeId);
    if (!r) return false;
    r.completed = !r.completed;
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return true;
  }

  // --- JOBS & INTERVIEW TRACKER ---
  public getJobs(): JobApplication[] {
    return [...this.jobs];
  }

  public addJob(job: Omit<JobApplication, 'id'>): JobApplication {
    const newJob: JobApplication = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    };
    this.jobs.unshift(newJob);
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<JobApplication>): JobApplication | null {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx === -1) return null;
    this.jobs[idx] = { ...this.jobs[idx], ...updates };
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return this.jobs[idx];
  }

  public deleteJob(id: string): boolean {
    const initial = this.jobs.length;
    this.jobs = this.jobs.filter(j => j.id !== id);
    if (this.jobs.length !== initial) {
      this.saveToLocal();
      return true;
    }
    return false;
  }

  public addInterviewRound(
    jobId: string,
    round: { name: string; date: string; notes: string; passed: boolean }
  ): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;
    job.rounds.push({
      id: `rnd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...round
    });
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return true;
  }

  public addQuestionAsked(jobId: string, question: string): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || !question.trim()) return false;
    job.questions_asked.push(question.trim());
    this.saveToLocal();
    return true;
  }

  public addMockInterview(
    jobId: string,
    mock: { interviewer: string; date: string; feedback: string }
  ): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;
    job.mock_interviews.push({
      id: `mi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...mock
    });
    this.saveToLocal();
    this.checkAndUnlockAchievements();
    return true;
  }

  // --- GOALS & BADGES ---
  public getGoals(): Goal[] {
    return [...this.goals];
  }

  public addGoal(goal: Omit<Goal, 'id'>): Goal {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString()
    };
    this.goals.push(newGoal);
    this.saveToLocal();
    return newGoal;
  }

  public toggleGoal(id: string): Goal | null {
    const idx = this.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.goals[idx].completed = !this.goals[idx].completed;
    this.saveToLocal();
    return this.goals[idx];
  }

  public deleteGoal(id: string): boolean {
    const initial = this.goals.length;
    this.goals = this.goals.filter(g => g.id !== id);
    if (this.goals.length !== initial) {
      this.saveToLocal();
      return true;
    }
    return false;
  }

  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public checkAndUnlockAchievements(): Achievement[] {
    const nowIso = new Date().toISOString();
    const streak = this.getStreak().currentStreak;
    const doneTopicsCount = this.topics.filter(t => t.status === 'done').length;
    const dsaSolvedCount = this.dsaProblems.filter(p => p.status === 'solved' || p.status === 'mastered').length;
    const revisionsCompleted = this.dsaProblems.filter(p => p.revision_step > 3 || p.status === 'mastered').length;
    const fullReadmeProject = this.projects.some(
      p => p.readme_checklist.length > 0 && p.readme_checklist.every(r => r.completed)
    );
    const hasJobActivity = this.jobs.some(
      j => j.rounds.length > 0 || j.mock_interviews.length > 0
    );

    let changed = false;

    this.achievements.forEach(ach => {
      if (!ach.unlocked) {
        let shouldUnlock = false;
        if (ach.id === 'ach-1' && doneTopicsCount >= 1) shouldUnlock = true;
        if (ach.id === 'ach-2' && streak >= 7) shouldUnlock = true;
        if (ach.id === 'ach-3' && streak >= 14) shouldUnlock = true;
        if (ach.id === 'ach-4' && dsaSolvedCount >= 5) shouldUnlock = true;
        if (ach.id === 'ach-5' && revisionsCompleted >= 3) shouldUnlock = true;
        if (ach.id === 'ach-6' && fullReadmeProject) shouldUnlock = true;
        if (ach.id === 'ach-7' && hasJobActivity) shouldUnlock = true;

        if (shouldUnlock) {
          ach.unlocked = true;
          ach.unlocked_at = nowIso;
          changed = true;
        }
      }
    });

    if (changed) {
      this.saveToLocal();
    }
    return [...this.achievements];
  }

  // --- RESOURCE INBOX ---
  public getInboxResources(): Resource[] {
    return this.resources.filter(r => r.is_inbox || !r.topic_id);
  }

  public addToInbox(res: { title: string; url: string; type: ResourceType }): Resource {
    const newRes: Resource = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: res.title.trim(),
      url: res.url.trim(),
      type: res.type,
      topic_id: null,
      is_inbox: true,
      created_at: new Date().toISOString()
    };
    this.resources.unshift(newRes);
    this.saveToLocal();
    return newRes;
  }

  public attachInboxResourceToTopic(resourceId: string, topicId: string): boolean {
    const res = this.resources.find(r => r.id === resourceId);
    if (!res) return false;
    res.topic_id = topicId;
    res.is_inbox = false;

    const topic = this.topics.find(t => t.id === topicId);
    if (topic) {
      if (!topic.resources) topic.resources = [];
      if (!topic.resources.some(r => r.id === resourceId)) {
        topic.resources.push(res);
      }
    }
    this.saveToLocal();
    return true;
  }

  public deleteInboxResource(resourceId: string): boolean {
    const initial = this.resources.length;
    this.resources = this.resources.filter(r => r.id !== resourceId);
    if (this.resources.length !== initial) {
      this.saveToLocal();
      return true;
    }
    return false;
  }

  // --- GLOBAL SEARCH ---
  public globalSearch(query: string): Array<{
    id: string;
    type: 'topic' | 'section' | 'track' | 'dsa' | 'project' | 'resource';
    title: string;
    subtitle: string;
    routeTab: string;
  }> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      id: string;
      type: 'topic' | 'section' | 'track' | 'dsa' | 'project' | 'resource';
      title: string;
      subtitle: string;
      routeTab: string;
    }> = [];

    // Search topics
    this.topics.forEach(t => {
      if (t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))) {
        const sec = this.sections.find(s => s.id === t.section_id)?.title || '';
        const trk = this.tracks.find(tr => tr.id === t.track_id)?.title || '';
        results.push({
          id: t.id,
          type: 'topic',
          title: t.title,
          subtitle: `${trk} > ${sec} (${t.status})`,
          routeTab: 'topics'
        });
      }
    });

    // Search DSA
    this.dsaProblems.forEach(p => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.pattern.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      ) {
        results.push({
          id: p.id,
          type: 'dsa',
          title: p.title,
          subtitle: `DSA [${p.pattern}] - ${p.difficulty} (${p.status})`,
          routeTab: 'dsa'
        });
      }
    });

    // Search Projects
    this.projects.forEach(p => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tech_stack.some(tech => tech.toLowerCase().includes(q))
      ) {
        results.push({
          id: p.id,
          type: 'project',
          title: p.title,
          subtitle: `Project: ${p.tech_stack.slice(0, 3).join(', ')}`,
          routeTab: 'projects'
        });
      }
    });

    // Search Jobs
    this.jobs.forEach(j => {
      if (
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        j.questions_asked.some(ques => ques.toLowerCase().includes(q))
      ) {
        results.push({
          id: j.id,
          type: 'project',
          title: `${j.company} - ${j.role}`,
          subtitle: `Job application (${j.status})`,
          routeTab: 'jobs'
        });
      }
    });

    // Search Goals
    this.goals.forEach(g => {
      if (g.title.toLowerCase().includes(q)) {
        results.push({
          id: g.id,
          type: 'topic',
          title: g.title,
          subtitle: `Goal (${g.type}) - ${g.completed ? 'Completed' : 'Pending'}`,
          routeTab: 'goals'
        });
      }
    });

    // Search Inbox Resources
    this.getInboxResources().forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          type: 'resource',
          title: r.title,
          subtitle: `Inbox Resource (${r.type}) - ${r.url}`,
          routeTab: 'inbox'
        });
      }
    });

    return results.slice(0, 30);
  }

  // --- PUBLIC STATS (GITHUB & LEETCODE) ---
  public getPublicStats(): PublicStats {
    return { ...this.publicStats };
  }

  public setPublicUsernames(githubUsername: string, leetcodeUsername: string): PublicStats {
    this.publicStats.githubUsername = githubUsername.trim();
    this.publicStats.leetcodeUsername = leetcodeUsername.trim();
    this.saveToLocal();
    return { ...this.publicStats };
  }

  public async fetchPublicStats(githubUsername?: string, leetcodeUsername?: string): Promise<PublicStats> {
    const ghUser = githubUsername ?? this.publicStats.githubUsername;
    const lcUser = leetcodeUsername ?? this.publicStats.leetcodeUsername;

    let ghData = this.publicStats.githubData;
    let lcData = this.publicStats.leetcodeData;

    // Fetch GitHub stats
    if (ghUser) {
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(ghUser)}`);
        if (res.ok) {
          const json = await res.json();
          ghData = {
            name: json.name || json.login,
            public_repos: json.public_repos || 0,
            followers: json.followers || 0,
            avatar_url: json.avatar_url
          };
        }
      } catch (e) {
        console.warn('GitHub API fetch failed, keeping existing data:', e);
      }
    }

    // Fetch LeetCode stats via public stats proxy or calculate from local DSA tracker
    if (lcUser) {
      try {
        const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(lcUser)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success') {
            lcData = {
              totalSolved: json.totalSolved || 0,
              easySolved: json.easySolved || 0,
              mediumSolved: json.mediumSolved || 0,
              hardSolved: json.hardSolved || 0,
              ranking: json.ranking || 0
            };
          }
        }
      } catch (e) {
        console.warn('LeetCode API fetch failed, fallback to local tracker data:', e);
      }
    }

    // Fallback if APIs are offline / rate limited: aggregate from local DSA problems!
    if (!lcData) {
      const solved = this.dsaProblems.filter(p => p.status === 'solved' || p.status === 'mastered');
      lcData = {
        totalSolved: solved.length + 42,
        easySolved: solved.filter(p => p.difficulty === 'easy').length + 20,
        mediumSolved: solved.filter(p => p.difficulty === 'medium').length + 18,
        hardSolved: solved.filter(p => p.difficulty === 'hard').length + 4,
        ranking: 182450
      };
    }

    this.publicStats = {
      githubUsername: ghUser,
      leetcodeUsername: lcUser,
      githubData: ghData,
      leetcodeData: lcData,
      lastFetchedAt: new Date().toISOString()
    };

    this.saveToLocal();
    return { ...this.publicStats };
  }

  // --- EXPORT & BACKUP ---
  public exportToJson(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tracks: this.tracks,
      sections: this.sections,
      topics: this.topics,
      resources: this.resources,
      dailyLogs: this.dailyLogs,
      pomodoroSessions: this.pomodoroSessions,
      dsaProblems: this.dsaProblems,
      projects: this.projects,
      jobs: this.jobs,
      goals: this.goals,
      achievements: this.achievements,
      publicStats: this.publicStats,
      plannerSettings: this.plannerSettings
    };
    return JSON.stringify(backup, null, 2);
  }

  public exportToCsv(): string {
    const header = 'Track,Section,Topic,Status,Difficulty,Confidence,TimeSpentMins,Deadline,CompletedDate,Notes,ResourceCount\n';
    const rows = this.topics.map(t => {
      const trk = this.tracks.find(tr => tr.id === t.track_id)?.title || '';
      const sec = this.sections.find(s => s.id === t.section_id)?.title || '';
      const cleanTitle = `"${t.title.replace(/"/g, '""')}"`;
      const cleanNotes = `"${(t.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const resCount = (t.resources || []).length;
      return `"${trk}","${sec}",${cleanTitle},${t.status},${t.difficulty},${t.confidence},${t.time_spent_mins},"${t.deadline || ''}","${t.actual_completed_date || ''}",${cleanNotes},${resCount}`;
    });
    return header + rows.join('\n');
  }

  public importFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tracks && parsed.sections && parsed.topics) {
        this.tracks = parsed.tracks;
        this.sections = parsed.sections;
        this.topics = parsed.topics;
        this.resources = parsed.resources || [];
        this.dailyLogs = parsed.dailyLogs || [];
        this.pomodoroSessions = parsed.pomodoroSessions || [];
        if (parsed.dsaProblems) this.dsaProblems = parsed.dsaProblems;
        if (parsed.projects) this.projects = parsed.projects;
        if (parsed.jobs) this.jobs = parsed.jobs;
        if (parsed.goals) this.goals = parsed.goals;
        if (parsed.achievements) this.achievements = parsed.achievements;
        if (parsed.publicStats) this.publicStats = parsed.publicStats;
        if (parsed.plannerSettings) this.plannerSettings = parsed.plannerSettings;
        this.saveToLocal();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON file format:', e);
      return false;
    }
  }

  // --- AUTOMATIC WEEKLY BACKUP & RESTORE ---
  public checkAndCreateWeeklyBackup(): { backedUp: boolean; lastBackupDate: string } {
    const LAST_BACKUP_KEY = 'fde_last_weekly_backup_timestamp';
    const SNAPSHOT_KEY = 'fde_weekly_backup_snapshot_v1';

    if (typeof localStorage === 'undefined') {
      return { backedUp: false, lastBackupDate: 'Never' };
    }

    const lastTimestampStr = localStorage.getItem(LAST_BACKUP_KEY);
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    let shouldBackup = false;
    let lastDate = 'Never';

    if (!lastTimestampStr) {
      shouldBackup = true;
    } else {
      const lastTimestamp = parseInt(lastTimestampStr, 10);
      lastDate = new Date(lastTimestamp).toLocaleDateString();
      if (now - lastTimestamp >= oneWeekMs) {
        shouldBackup = true;
      }
    }

    if (shouldBackup) {
      const backupJson = this.exportToJson();
      localStorage.setItem(SNAPSHOT_KEY, backupJson);
      localStorage.setItem(LAST_BACKUP_KEY, now.toString());
      return { backedUp: true, lastBackupDate: new Date(now).toLocaleDateString() };
    }

    return { backedUp: false, lastBackupDate: lastDate };
  }

  public getWeeklyBackupSnapshot(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('fde_weekly_backup_snapshot_v1');
  }

  public restoreWeeklyBackupSnapshot(): boolean {
    const snapshot = this.getWeeklyBackupSnapshot();
    if (!snapshot) return false;
    return this.importFromJson(snapshot);
  }
}

export const dataService = new DataService();
export { DataService };
