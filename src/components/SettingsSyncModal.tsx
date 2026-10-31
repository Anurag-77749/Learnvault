import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Shield,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Key,
  Globe,
  Bell,
  Clock,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { getSupabaseConfig, setCustomSupabaseCredentials, getSupabaseClient } from '../services/supabaseClient';
import { dataService } from '../services/dataService';
import { NotificationService } from '../services/notificationService';

interface SettingsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: (jsonString: string) => boolean;
  onResetDefaults: () => void;
  isOnline: boolean;
}

export const SettingsSyncModal: React.FC<SettingsSyncModalProps> = ({
  isOpen,
  onClose,
  onExportJson,
  onExportCsv,
  onImportJson,
  onResetDefaults,
  isOnline
}) => {
  if (!isOpen) return null;

  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Backup info
  const [backupInfo, setBackupInfo] = useState<{ backedUp: boolean; lastBackupDate: string }>({
    backedUp: false,
    lastBackupDate: 'Never'
  });

  // Notifications
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Supabase Auth
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check weekly backup
    const bInfo = dataService.checkAndCreateWeeklyBackup();
    setBackupInfo(bInfo);

    // Check notifications
    setNotifPermission(NotificationService.getPermission());

    // Check Supabase session
    const client = getSupabaseClient();
    if (client) {
      client.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      });
    }
  }, [isOpen]);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSupabaseCredentials(url, anonKey);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleToggleNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setNotifPermission(NotificationService.getPermission());
    if (granted) {
      NotificationService.sendNotification('Notifications Enabled!', {
        body: 'You will receive subtle reminders for daily study logs, revisions, and planner deadlines.'
      });
    }
  };

  const handleOneTapWeeklyRestore = () => {
    if (window.confirm('Restore your data from the most recent automatic weekly snapshot?')) {
      const ok = dataService.restoreWeeklyBackupSnapshot();
      if (ok) {
        setRestoreStatus('Weekly snapshot restored successfully!');
      } else {
        setRestoreStatus('No weekly snapshot found to restore.');
      }
      setTimeout(() => setRestoreStatus(null), 3000);
    }
  };

  const handleCreateInstantSnapshot = () => {
    const res = dataService.checkAndCreateWeeklyBackup();
    setBackupInfo({ backedUp: true, lastBackupDate: new Date().toLocaleDateString() });
    setRestoreStatus('Fresh backup snapshot created in local storage!');
    setTimeout(() => setRestoreStatus(null), 3000);
  };

  const handleAuthSignIn = async (isSignUp = false) => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthError('Please save Supabase URL and Anon Key first.');
      return;
    }
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please provide both email and password.');
      return;
    }

    setIsSigningIn(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email: authEmail.trim(),
          password: authPassword.trim()
        });
        if (error) throw error;
        if (data.user?.email) setUserEmail(data.user.email);
        setRestoreStatus('Account created! Signed in to Supabase.');
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword.trim()
        });
        if (error) throw error;
        if (data.user?.email) setUserEmail(data.user.email);
        setRestoreStatus('Signed in to Supabase Cloud.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSigningIn(false);
      setTimeout(() => setRestoreStatus(null), 3000);
    }
  };

  const handleAuthSignOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
      setUserEmail(null);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const success = onImportJson(content);
      if (success) {
        setRestoreStatus('Backup restored successfully!');
      } else {
        setRestoreStatus('Failed to restore. Please ensure the file is a valid JSON backup.');
      }
      setTimeout(() => setRestoreStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6 overflow-y-auto">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">Cloud Sync & Data Backup</h2>
              <p className="text-xs text-slate-400">
                Supabase backend, automatic weekly backups, notifications, and JSON/CSV restore.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {/* Network & Storage Status Banner */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  !isOnline
                    ? 'bg-amber-400 ring-4 ring-amber-400/20'
                    : currentConfig.isConfigured
                    ? 'bg-emerald-400 ring-4 ring-emerald-400/20'
                    : 'bg-cyan-400 ring-4 ring-cyan-400/20'
                }`}
              />
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {!isOnline
                    ? 'Offline Mode Active'
                    : currentConfig.isConfigured
                    ? userEmail
                      ? `Connected to Supabase (${userEmail})`
                      : 'Connected to Supabase Project'
                    : 'Local-First Storage Active'}
                </h4>
                <p className="text-xs text-slate-400">
                  {!isOnline
                    ? 'Changes cached locally and will auto-sync when network returns.'
                    : currentConfig.isConfigured
                    ? 'PostgreSQL tables with Row Level Security (RLS) active.'
                    : 'All 408 topics & progress saved locally in browser. Enter Supabase keys below to sync.'}
                </p>
              </div>
            </div>
          </div>

          {/* Automatic Weekly Backup & 1-Tap Restore */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Automatic Weekly Backup Engine</h3>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                Last Backup: {backupInfo.lastBackupDate}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              The engine automatically creates a versioned snapshot every 7 days so you never lose progress.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleCreateInstantSnapshot}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Create Instant Snapshot 📸
              </button>
              <button
                type="button"
                onClick={handleOneTapWeeklyRestore}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                1-Tap Restore Weekly Snapshot ↺
              </button>
            </div>
            {restoreStatus && (
              <p className="text-xs font-semibold text-emerald-400">{restoreStatus}</p>
            )}
          </div>

          {/* Web Notifications Settings */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Browser Notifications (Daily Log & Deadlines)</h4>
                <p className="text-[11px] text-slate-400">
                  Receive alerts for due spaced-repetition revisions and evening streak reminders.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                notifPermission === 'granted'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {notifPermission === 'granted' ? 'Enabled ✓' : 'Enable Notifications'}
            </button>
          </div>

          {/* Supabase Authentication Box */}
          {currentConfig.isConfigured && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Supabase Cloud Authentication</h3>
                </div>
                {userEmail && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Logged In
                  </span>
                )}
              </div>

              {userEmail ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-300">
                    Signed in as <span className="font-bold text-white">{userEmail}</span>
                  </div>
                  <button
                    onClick={handleAuthSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {authError && <p className="text-xs text-rose-400">{authError}</p>}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      disabled={isSigningIn}
                      onClick={() => handleAuthSignIn(false)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                    >
                      {isSigningIn ? 'Signing in...' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      disabled={isSigningIn}
                      onClick={() => handleAuthSignIn(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supabase Configuration Form */}
          <form onSubmit={handleSaveCredentials} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Supabase Cloud Project Settings</h3>
              </div>
              {savedFeedback && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Saved!
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Project URL</label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Anon Public API Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save Supabase Credentials
              </button>
            </div>
          </form>

          {/* Backup & Restore Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Backup & Export</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onExportJson}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 min-h-[44px]"
              >
                <Download className="h-4 w-4 text-cyan-400" />
                <span>Export Full JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={onExportCsv}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 min-h-[44px]"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Export Topics (CSV)</span>
              </button>
            </div>

            {/* Restore from JSON */}
            <div className="pt-2">
              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-3 text-xs font-medium text-slate-300 cursor-pointer hover:border-slate-500 hover:bg-slate-900 min-h-[44px]">
                <Upload className="h-4 w-4 text-amber-400" />
                <span>Restore from JSON Backup File</span>
                <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset to Original Seed Roadmaps */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-300 uppercase">Reset to Factory Seeds</h4>
              <p className="text-xs text-slate-400">
                Restore all original 408 roadmap topics and reset all statuses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all tracks, sections and topics to initial roadmap seed?')) {
                  onResetDefaults();
                  alert('Roadmap reset to initial seed data!');
                }
              }}
              className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 bg-slate-950/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
