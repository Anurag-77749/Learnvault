import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Check, RefreshCw, X, Smartphone, Laptop, AlertCircle, Unlink } from 'lucide-react';
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
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-2xl border border-[rgba(255,240,220,0.08)] bg-[#110E0E] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_24px_48px_rgba(0,0,0,0.9)] text-[#F5F2EB] max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(255,240,220,0.07)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A0808] border border-[#D4AF37]/40 text-[#D4AF37]">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#F5F2EB]">Cross-Device Cloud Sync</h3>
              <p className="text-xs text-[#9E958E]">Sync tasks, streak, timers & wasted days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9E958E] hover:text-[#F5F2EB] hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="my-5 rounded-xl border border-[rgba(255,240,220,0.07)] bg-[#0A0808] p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  syncState.syncId
                    ? syncState.status === 'syncing'
                      ? 'bg-[#D4AF37] animate-pulse'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : 'bg-[#635B55]'
                }`}
              />
              <span className="text-sm font-medium text-[#F5F2EB]">
                {syncState.syncId ? (
                  <>
                    Connected as <span className="font-bold text-[#D4AF37] font-mono">{syncState.syncId}</span>
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
                className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#181313] px-2.5 py-1 text-xs font-semibold text-[#F6E6C2] hover:bg-[#201818] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
            )}
          </div>

          {syncState.lastSyncedAt && (
            <p className="mt-2 text-[11px] font-mono text-[#9E958E]">
              Last synced: {syncState.lastSyncedAt.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Form / Connect Box */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#9E958E] mb-1.5">
              Your Personal Sync ID (or Email)
            </label>
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="e.g. anurag or your email"
              className="w-full rounded-xl border border-[rgba(255,240,220,0.08)] bg-[#0A0808] px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder-[#635B55] focus:border-[#D4AF37]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30 shadow-inner font-mono"
            />
            <p className="mt-1.5 text-[11px] text-[#9E958E]">
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
              className="flex-1 rounded-xl btn-liquid-gold py-2.5 text-xs font-bold uppercase tracking-wider text-[#090808] shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Syncing...' : syncState.syncId ? 'Update & Sync' : 'Connect & Sync'}
            </button>

            {syncState.syncId && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2.5 text-xs font-bold text-red-300 hover:bg-red-900/50 transition-colors cursor-pointer"
                title="Disconnect"
              >
                <Unlink className="h-3.5 w-3.5" />
                Disconnect
              </button>
            )}
          </div>
        </form>

        {/* How It Works Diagram */}
        <div className="mt-6 border-t border-[rgba(255,240,220,0.07)] pt-4">
          <div className="flex items-center justify-around text-center text-xs text-[#9E958E]">
            <div className="flex flex-col items-center gap-1">
              <Laptop className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] font-mono">Laptop</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#D4AF37]">
                <span>⟷</span>
                <Cloud className="h-4 w-4 text-[#D4AF37]" />
                <span>⟷</span>
              </div>
              <span className="text-[9px] text-[#635B55] font-mono">Instant Sync</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Smartphone className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] font-mono">Mobile</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
