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
  private initialized = false;
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('learnvault_sync_id');
      this.syncId = (savedId || DEFAULT_SYNC_ID).trim().toLowerCase();
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

    // Pull from cloud on startup
    setTimeout(() => {
      this.pullFromCloud();
    }, 500);

    // Pull when window gains focus or tab becomes visible (e.g. returning to app on phone/laptop)
    window.addEventListener('focus', () => {
      this.pullFromCloud();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pullFromCloud();
      }
    });
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
    return await this.syncNow();
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

  public async syncNow(): Promise<{ success: boolean; message?: string }> {
    const pulled = await this.pullFromCloud();
    if (pulled) {
      await this.pushToCloud();
      return { success: true };
    }
    return { success: false, message: this.errorMessage || 'Sync failed' };
  }

  /**
   * Safe pull: reads cloud state and updates local Dexie WITHOUT wiping tables.
   */
  public async pullFromCloud(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.status = 'syncing';
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

      if (!cloudRow) {
        // Initial setup: push local data to cloud
        this.isSyncing = false;
        return await this.pushToCloud();
      }

      // Safe update of Tasks
      if (Array.isArray(cloudRow.tasks)) {
        const localTasks = await db.tasks.toArray();
        const cloudTaskMap = new Map<number, TaskItem>();
        cloudRow.tasks.forEach((t: TaskItem) => {
          if (t.id) cloudTaskMap.set(t.id, t);
        });

        // Delete local tasks that don't exist in cloud only if cloud has valid data
        for (const lt of localTasks) {
          if (lt.id && !cloudTaskMap.has(lt.id)) {
            await db.tasks.delete(lt.id);
          }
        }

        // Put cloud tasks
        if (cloudRow.tasks.length > 0) {
          await db.tasks.bulkPut(cloudRow.tasks);
        }
      }

      // Safe update of Daily Logs
      if (Array.isArray(cloudRow.daily_logs) && cloudRow.daily_logs.length > 0) {
        await db.dailyLogs.bulkPut(cloudRow.daily_logs);
      }

      // Safe update of Wasted Days
      if (Array.isArray(cloudRow.wasted_days) && cloudRow.wasted_days.length > 0) {
        await db.wastedDays.bulkPut(cloudRow.wasted_days);
      }

      // Safe update of Pomodoro Sessions
      if (Array.isArray(cloudRow.pomodoro_sessions) && cloudRow.pomodoro_sessions.length > 0) {
        await db.pomodoroSessions.bulkPut(cloudRow.pomodoro_sessions);
      }

      this.status = 'synced';
      this.lastSyncedAt = new Date();
      if (typeof window !== 'undefined') {
        localStorage.setItem('learnvault_last_sync_time', this.lastSyncedAt.toISOString());
      }
      this.notify();
      return true;
    } catch (err: any) {
      console.warn('Pull from cloud notice:', err.message);
      this.status = 'error';
      this.errorMessage = err.message || 'Sync failed';
      this.notify();
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Safe push: reads local Dexie and uploads to Supabase.
   * NEVER touches local Dexie data.
   */
  public async pushToCloud(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.status = 'syncing';
    this.notify();

    try {
      const [tasks, dailyLogs, wastedDays, pomodoroSessions] = await Promise.all([
        db.tasks.toArray(),
        db.dailyLogs.toArray(),
        db.wastedDays.toArray(),
        db.pomodoroSessions.toArray(),
      ]);

      const client = getSupabaseClient();
      const { error } = await client.from('learnvault_sync').upsert({
        sync_id: this.syncId,
        tasks,
        daily_logs: dailyLogs,
        wasted_days: wastedDays,
        pomodoro_sessions: pomodoroSessions,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      this.status = 'synced';
      this.lastSyncedAt = new Date();
      if (typeof window !== 'undefined') {
        localStorage.setItem('learnvault_last_sync_time', this.lastSyncedAt.toISOString());
      }
      this.notify();
      return true;
    } catch (e: any) {
      console.warn('Push to cloud notice:', e.message);
      this.status = 'error';
      this.errorMessage = e.message;
      this.notify();
      return false;
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
      this.pushToCloud();
    }, 1500);
  }
}

export const cloudSyncService = new CloudSyncService();
