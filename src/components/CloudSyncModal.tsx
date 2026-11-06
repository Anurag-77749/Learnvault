import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Check, RefreshCw, X, Shield, Smartphone, Laptop, AlertCircle, Unlink } from 'lucide-react';
import { cloudSyncService, SyncState } from '../services/cloudSyncService';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getState());
  const [inputId, setInputId] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = cloudSyncService.subscribe((state) => {
      setSyncState(state);
      if (state.syncId && !inputId) {
        setInputId(state.syncId);
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a Sync ID or your name/email.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    const result = await cloudSyncService.connectSync(inputId);
    setIsLoading(false);

    if (result.success) {
      setStatusMsg({ type: 'success', text: 'Connected and synced successfully with cloud!' });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Connection failed' });
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const result = await cloudSyncService.syncNow();
    setIsLoading(false);
    if (result.success) {
      setStatusMsg({ type: 'success', text: 'All tasks and records synced!' });
      setTimeout(() => setStatusMsg(null), 2500);
    } else {
      setStatusMsg({ type: 'error', text: result.message || 'Sync failed' });
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from cloud sync? Your local data will remain saved on this device.')) {
      cloudSyncService.disconnect();
      setInputId('');
      setStatusMsg({ type: 'success', text: 'Disconnected from cloud sync.' });
      setTimeout(() => setStatusMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-2xl border border-[#1f1f1f] bg-[#0E0205] p-6 shadow-2xl text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f1f1f]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#070707] border border-[#D97736]/40 text-shiny-gold">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-shiny-gold">Cross-Device Cloud Sync</h3>
              <p className="text-xs text-[#E6C687]/70">Sync tasks, streak, timers & wasted days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#070707] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="my-5 rounded-xl border border-[#1f1f1f] bg-[#1A040A] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-3 w-3 rounded-full ${
                  syncState.syncId
                    ? syncState.status === 'syncing'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-sm font-medium text-white">
                {syncState.syncId ? (
                  <>
                    Connected as <span className="font-bold text-shiny-gold">{syncState.syncId}</span>
                  </>
                ) : (
                  'Not Connected (Local Mode Only)'
                )}
              </span>
            </div>
            {syncState.syncId && (
              <button
                onClick={handleManualSync}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-[#D97736]/30 bg-[#070707] px-2.5 py-1 text-xs font-semibold text-shiny-gold hover:bg-[#380A15] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
            )}
          </div>

          {syncState.lastSyncedAt && (
            <p className="mt-2 text-[11px] text-[#E6C687]/60">
              Last synced: {syncState.lastSyncedAt.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Form / Connect Box */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#E6C687] mb-1.5">
              Your Personal Sync ID (or Email)
            </label>
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="e.g. anurag or your email"
              className="w-full rounded-xl border border-[#1f1f1f] bg-[#000000] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#D97736] focus:outline-none focus:ring-1 focus:ring-[#D97736]"
            />
            <p className="mt-1.5 text-[11px] text-[#E6C687]/70">
              💡 Use this <strong>exact same Sync ID</strong> on both your Laptop and Mobile phone to link them!
            </p>
          </div>

          {statusMsg && (
            <div
              className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/60 border border-red-500/40 text-red-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#D97736] to-[#AA771C] py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Syncing...' : syncState.syncId ? 'Update & Sync' : 'Connect & Sync'}
            </button>

            {syncState.syncId && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-3.5 py-2.5 text-xs font-bold text-red-300 hover:bg-red-900/60 transition-colors"
                title="Disconnect"
              >
                <Unlink className="h-3.5 w-3.5" />
                Disconnect
              </button>
            )}
          </div>
        </form>

        {/* How It Works Diagram */}
        <div className="mt-6 border-t border-[#1f1f1f]/60 pt-4">
          <div className="flex items-center justify-around text-center text-xs text-[#E6C687]/80">
            <div className="flex flex-col items-center gap-1">
              <Laptop className="h-5 w-5 text-shiny-gold" />
              <span className="text-[10px]">Laptop</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span>⟷</span>
                <Cloud className="h-4 w-4 text-shiny-gold" />
                <span>⟷</span>
              </div>
              <span className="text-[9px] text-[#E6C687]/50">Instant Sync</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Smartphone className="h-5 w-5 text-shiny-gold" />
              <span className="text-[10px]">Mobile</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
