import { getSupabaseClient } from './supabaseClient';
import { db } from './db';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncState {
  syncId: string | null;
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
}

type SyncListener = (state: SyncState) => void;

class CloudSyncService {
  private syncId: string | null = null;
  private status: SyncStatus = 'idle';
  private lastSyncedAt: Date | null = null;
  private errorMessage: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private debounceTimer: any = null;
  private initialized = false;
  private isApplyingRemote = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('learnvault_sync_id');
      if (savedId) {
        this.syncId = savedId.trim().toLowerCase();
      }
      const savedTime = localStorage.getItem('learnvault_last_sync_time');
      if (savedTime) {
        this.lastSyncedAt = new Date(savedTime);
      }
    }
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      const syncTables = [db.tasks, db.dailyLogs, db.wastedDays, db.pomodoroSessions];
      syncTables.forEach((table) => {
        table.hook('creating', () => {
          if (!this.isApplyingRemote) this.triggerAutoSync();
        });
        table.hook('updating', () => {
          if (!this.isApplyingRemote) this.triggerAutoSync();
        });
        table.hook('deleting', () => {
          if (!this.isApplyingRemote) this.triggerAutoSync();
        });
      });
    } catch (e) {
      console.warn('Could not attach Dexie sync hooks:', e);
    }

    // Pull changes when tab or mobile window regains focus
    window.addEventListener('focus', () => {
      if (this.syncId) {
        this.pullFromCloud();
      }
    });

    // Auto pull on app launch
    if (this.syncId) {
      this.pullFromCloud();
    }
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
    const cleaned = rawId.trim().toLowerCase();
    if (!cleaned) {
      return { success: false, message: 'Please enter a valid Sync ID.' };
    }

    this.syncId = cleaned;
    if (typeof window !== 'undefined') {
      localStorage.setItem('learnvault_sync_id', cleaned);
    }

    return await this.syncNow();
  }

  public disconnect() {
    this.syncId = null;
    this.status = 'idle';
    this.errorMessage = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('learnvault_sync_id');
      localStorage.removeItem('learnvault_last_sync_time');
    }
    this.notify();
  }

  public async syncNow(): Promise<{ success: boolean; message?: string }> {
    if (!this.syncId) {
      return { success: false, message: 'Not connected to a sync ID.' };
    }

    this.status = 'syncing';
    this.errorMessage = null;
    this.notify();

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('learnvault_sync')
        .select('*')
        .eq('sync_id', this.syncId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Cloud data exists: apply to Dexie
        this.isApplyingRemote = true;
        try {
          await db.transaction('rw', [db.tasks, db.dailyLogs, db.wastedDays, db.pomodoroSessions], async () => {
            if (Array.isArray(data.tasks)) {
              await db.tasks.clear();
              if (data.tasks.length > 0) await db.tasks.bulkPut(data.tasks);
            }
            if (Array.isArray(data.daily_logs)) {
              await db.dailyLogs.clear();
              if (data.daily_logs.length > 0) await db.dailyLogs.bulkPut(data.daily_logs);
            }
            if (Array.isArray(data.wasted_days)) {
              await db.wastedDays.clear();
              if (data.wasted_days.length > 0) await db.wastedDays.bulkPut(data.wasted_days);
            }
            if (Array.isArray(data.pomodoro_sessions)) {
              await db.pomodoroSessions.clear();
              if (data.pomodoro_sessions.length > 0) await db.pomodoroSessions.bulkPut(data.pomodoro_sessions);
            }
          });
        } finally {
          this.isApplyingRemote = false;
        }
      } else {
        // Initial copy up to cloud
        await this.pushToCloud();
      }

      this.status = 'synced';
      this.lastSyncedAt = new Date();
      if (typeof window !== 'undefined') {
        localStorage.setItem('learnvault_last_sync_time', this.lastSyncedAt.toISOString());
      }
      this.notify();
      return { success: true };
    } catch (err: any) {
      console.error('Cloud Sync error:', err);
      this.status = 'error';
      this.errorMessage = err.message || 'Sync failed';
      this.notify();
      return { success: false, message: this.errorMessage || 'Sync failed' };
    }
  }

  public async pullFromCloud(): Promise<boolean> {
    if (!this.syncId) return false;

    this.status = 'syncing';
    this.notify();

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('learnvault_sync')
        .select('*')
        .eq('sync_id', this.syncId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        this.isApplyingRemote = true;
        try {
          await db.transaction('rw', [db.tasks, db.dailyLogs, db.wastedDays, db.pomodoroSessions], async () => {
            if (Array.isArray(data.tasks) && data.tasks.length > 0) {
              await db.tasks.clear();
              await db.tasks.bulkPut(data.tasks);
            }
            if (Array.isArray(data.daily_logs) && data.daily_logs.length > 0) {
              await db.dailyLogs.clear();
              await db.dailyLogs.bulkPut(data.daily_logs);
            }
            if (Array.isArray(data.wasted_days) && data.wasted_days.length > 0) {
              await db.wastedDays.clear();
              await db.wastedDays.bulkPut(data.wasted_days);
            }
            if (Array.isArray(data.pomodoro_sessions) && data.pomodoro_sessions.length > 0) {
              await db.pomodoroSessions.clear();
              await db.pomodoroSessions.bulkPut(data.pomodoro_sessions);
            }
          });
        } finally {
          this.isApplyingRemote = false;
        }
      }

      this.status = 'synced';
      this.lastSyncedAt = new Date();
      this.notify();
      return true;
    } catch (e: any) {
      console.warn('Auto pull failed:', e);
      this.status = 'error';
      this.errorMessage = e.message;
      this.notify();
      return false;
    }
  }

  public async pushToCloud(): Promise<boolean> {
    if (!this.syncId) return false;

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
      console.error('Push to cloud failed:', e);
      this.status = 'error';
      this.errorMessage = e.message;
      this.notify();
      return false;
    }
  }

  public triggerAutoSync() {
    if (!this.syncId || this.isApplyingRemote) return;

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
