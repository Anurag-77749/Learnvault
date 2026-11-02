import { getSupabaseClient } from './supabaseClient';
import { db, TaskItem, DailyLogEntry, WastedDayRecord, PomodoroSessionRecord } from './db';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const DEFAULT_SYNC_ID = 'anurag';

export interface SyncState {
  syncId: string;
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
}

type SyncListener = (state: SyncState) => void;

class CloudSyncService {
  private syncId: string = DEFAULT_SYNC_ID;
  private status: SyncStatus = 'idle';
  private lastSyncedAt: Date | null = null;
  private errorMessage: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private debounceTimer: any = null;
  private pollInterval: any = null;
  private initialized = false;
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('learnvault_sync_id');
      this.syncId = (savedId || DEFAULT_SYNC_ID).trim().toLowerCase();
      // Ensure it is saved
      localStorage.setItem('learnvault_sync_id', this.syncId);

      const savedTime = localStorage.getItem('learnvault_last_sync_time');
      if (savedTime) {
        this.lastSyncedAt = new Date(savedTime);
      }
    }
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Attach Dexie hooks to automatically push changes when user modifies data
    try {
      const syncTables = [db.tasks, db.dailyLogs, db.wastedDays, db.pomodoroSessions];
      syncTables.forEach((table) => {
        table.hook('creating', () => {
          if (!this.isSyncing) this.triggerAutoSync();
        });
        table.hook('updating', () => {
          if (!this.isSyncing) this.triggerAutoSync();
        });
        table.hook('deleting', () => {
          if (!this.isSyncing) this.triggerAutoSync();
        });
      });
    } catch (e) {
      console.warn('Could not attach Dexie sync hooks:', e);
    }

    // Auto pull when tab becomes visible or gains focus (e.g. returning to app on phone)
    window.addEventListener('focus', () => {
      this.fullSync();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.fullSync();
      }
    });

    // Background poll every 12 seconds so changes appear across devices without page reload
    this.pollInterval = setInterval(() => {
      if (!this.isSyncing) {
        this.fullSync();
      }
    }, 12000);

    // Initial sync right after startup
    setTimeout(() => {
      this.fullSync();
    }, 500);
  }

  public getState(): SyncState {
    return {
      syncId: this.syncId,
      status: this.status,
      lastSyncedAt: this.lastSyncedAt,
      errorMessage: this.errorMessage,
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public async connectSync(rawId: string): Promise<{ success: boolean; message?: string }> {
    const cleaned = (rawId || DEFAULT_SYNC_ID).trim().toLowerCase();
    this.syncId = cleaned;
    if (typeof window !== 'undefined') {
      localStorage.setItem('learnvault_sync_id', cleaned);
    }
    return await this.fullSync();
  }

  public disconnect() {
    this.syncId = DEFAULT_SYNC_ID;
    this.status = 'idle';
    this.errorMessage = null;
    if (typeof window !== 'undefined') {
      localStorage.setItem('learnvault_sync_id', DEFAULT_SYNC_ID);
    }
    this.notify();
  }

  public syncNow(): Promise<{ success: boolean; message?: string }> {
    return this.fullSync();
  }

  /**
   * Bi-directional intelligent merge:
   * Merges local Dexie data with Supabase Cloud data.
   * Ensures nothing is lost, and updates both Local and Cloud.
   */
  public async fullSync(): Promise<{ success: boolean; message?: string }> {
    if (this.isSyncing) return { success: true };
    this.isSyncing = true;
    this.status = 'syncing';
    this.errorMessage = null;
    this.notify();

    try {
      const client = getSupabaseClient();
      const { data: cloudRow, error } = await client
        .from('learnvault_sync')
        .select('*')
        .eq('sync_id', this.syncId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      // Read current local data
      const [localTasks, localDailyLogs, localWastedDays, localPomodoro] = await Promise.all([
        db.tasks.toArray(),
        db.dailyLogs.toArray(),
        db.wastedDays.toArray(),
        db.pomodoroSessions.toArray(),
      ]);

      if (!cloudRow) {
        // No cloud record yet: upload local data
        await client.from('learnvault_sync').upsert({
          sync_id: this.syncId,
          tasks: localTasks,
          daily_logs: localDailyLogs,
          wasted_days: localWastedDays,
          pomodoro_sessions: localPomodoro,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Merge Tasks
        const taskMap = new Map<string, TaskItem>();
        localTasks.forEach((t) => taskMap.set(t.title.trim().toLowerCase(), t));
        if (Array.isArray(cloudRow.tasks)) {
          cloudRow.tasks.forEach((ct: TaskItem) => {
            const key = ct.title.trim().toLowerCase();
            if (taskMap.has(key)) {
              const existing = taskMap.get(key)!;
              taskMap.set(key, {
                ...existing,
                ...ct,
                completed: existing.completed || ct.completed,
                completedAt: existing.completedAt || ct.completedAt,
              });
            } else {
              taskMap.set(key, ct);
            }
          });
        }
        const mergedTasks = Array.from(taskMap.values());

        // Merge Daily Logs
        const logMap = new Map<string, DailyLogEntry>();
        localDailyLogs.forEach((l) => logMap.set(l.date, l));
        if (Array.isArray(cloudRow.daily_logs)) {
          cloudRow.daily_logs.forEach((cl: DailyLogEntry) => {
            if (logMap.has(cl.date)) {
              const el = logMap.get(cl.date)!;
              logMap.set(cl.date, {
                ...el,
                ...cl,
                studyMinutes: Math.max(el.studyMinutes || 0, cl.studyMinutes || 0),
                wastedMinutes: Math.max(el.wastedMinutes || 0, cl.wastedMinutes || 0),
                questionsCount: Math.max(el.questionsCount || 0, cl.questionsCount || 0),
                topicsLearned: Array.from(new Set([...(el.topicsLearned || []), ...(cl.topicsLearned || [])])),
              });
            } else {
              logMap.set(cl.date, cl);
            }
          });
        }
        const mergedDailyLogs = Array.from(logMap.values());

        // Merge Wasted Days
        const wastedMap = new Map<string, WastedDayRecord>();
        localWastedDays.forEach((w) => wastedMap.set(`${w.date}-${w.reason || ''}`, w));
        if (Array.isArray(cloudRow.wasted_days)) {
          cloudRow.wasted_days.forEach((cw: WastedDayRecord) => {
            const key = `${cw.date}-${cw.reason || ''}`;
            wastedMap.set(key, { ...(wastedMap.get(key) || {}), ...cw });
          });
        }
        const mergedWastedDays = Array.from(wastedMap.values());

        // Merge Pomodoro Sessions
        const pomodoroMap = new Map<string, PomodoroSessionRecord>();
        localPomodoro.forEach((p) => pomodoroMap.set(`${p.date}-${p.timestamp}`, p));
        if (Array.isArray(cloudRow.pomodoro_sessions)) {
          cloudRow.pomodoro_sessions.forEach((cp: PomodoroSessionRecord) => {
            const key = `${cp.date}-${cp.timestamp}`;
            pomodoroMap.set(key, cp);
          });
        }
        const mergedPomodoro = Array.from(pomodoroMap.values());

        // Apply merged data to Local Dexie
        await db.transaction('rw', [db.tasks, db.dailyLogs, db.wastedDays, db.pomodoroSessions], async () => {
          await db.tasks.clear();
          if (mergedTasks.length > 0) await db.tasks.bulkPut(mergedTasks);

          await db.dailyLogs.clear();
          if (mergedDailyLogs.length > 0) await db.dailyLogs.bulkPut(mergedDailyLogs);

          await db.wastedDays.clear();
          if (mergedWastedDays.length > 0) await db.wastedDays.bulkPut(mergedWastedDays);

          await db.pomodoroSessions.clear();
          if (mergedPomodoro.length > 0) await db.pomodoroSessions.bulkPut(mergedPomodoro);
        });

        // Push merged state back to Supabase
        await client.from('learnvault_sync').upsert({
          sync_id: this.syncId,
          tasks: mergedTasks,
          daily_logs: mergedDailyLogs,
          wasted_days: mergedWastedDays,
          pomodoro_sessions: mergedPomodoro,
          updated_at: new Date().toISOString(),
        });
      }

      this.status = 'synced';
      this.lastSyncedAt = new Date();
      if (typeof window !== 'undefined') {
        localStorage.setItem('learnvault_last_sync_time', this.lastSyncedAt.toISOString());
      }
      this.notify();
      return { success: true };
    } catch (err: any) {
      console.warn('Sync notice:', err.message);
      this.status = 'error';
      this.errorMessage = err.message || 'Sync failed';
      this.notify();
      return { success: false, message: this.errorMessage || 'Sync failed' };
    } finally {
      this.isSyncing = false;
    }
  }

  public triggerAutoSync() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.status = 'syncing';
    this.notify();

    this.debounceTimer = setTimeout(() => {
      this.fullSync();
    }, 1200);
  }
}

export const cloudSyncService = new CloudSyncService();
