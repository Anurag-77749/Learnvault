import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle,
  Hourglass,
  Edit2,
  Check,
  X,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import { db, WastedDayRecord, getTodayDateString } from '../services/db';
import { logWastedDay, deleteWastedDay, updateWastedDay } from '../services/wastedDayService';

const WASTED_REASONS = [
  { id: 'Social Media & Scrolling', label: '📱 Social Media / Reels', color: 'border-[#84CC16]/40 text-white' },
  { id: 'Gaming & Esports', label: '🎮 Gaming', color: 'border-[#84CC16]/40 text-white' },
  { id: 'YouTube & Binge Watching', label: '🎬 YouTube / Netflix Binge', color: 'border-[#84CC16]/40 text-white' },
  { id: 'Outing & Friends Hangout', label: '🍻 Outing / Friends Hangout', color: 'border-[#84CC16]/40 text-white' },
  { id: 'Procrastination & Laziness', label: '🛋️ Pure Procrastination', color: 'border-[#84CC16]/40 text-white' },
  { id: 'Burnout & Fatigue', label: '😴 Burnout / Slept All Day', color: 'border-[#84CC16]/40 text-white' },
  { id: 'Other Distraction', label: '⚡ Other Distraction', color: 'border-[#84CC16]/40 text-white' },
];

export const WastedDaysScreen: React.FC = () => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getTodayDateString(-1);
  const twoDaysAgoStr = getTodayDateString(-2);

  // Form State - MULTI-SELECT SUPPORT
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([WASTED_REASONS[0].id]);
  const [explanation, setExplanation] = useState<string>('');
  const [hoursWasted, setHoursWasted] = useState<number>(8);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [editReasons, setEditReasons] = useState<string[]>([]);
  const [editHours, setEditHours] = useState<number>(8);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Live Query for all logged wasted days - permanently ordered newest first
  const rawWastedDays = useLiveQuery(() => db.wastedDays.toArray(), []) || [];
  const wastedDays = [...rawWastedDays].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const cumulativeCount = wastedDays.length;
  const totalHoursLost = wastedDays.reduce((acc, d) => acc + (d.hoursWasted || 8), 0);

  // Calculate top pitfall reason
  const reasonCounts: { [k: string]: number } = {};
  wastedDays.forEach((d) => {
    const list = d.reasons && d.reasons.length > 0 ? d.reasons : (d.reason ? d.reason.split(', ') : []);
    list.forEach((r) => {
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    });
  });

  let topReason = 'None';
  let topReasonCount = 0;
  Object.entries(reasonCounts).forEach(([r, c]) => {
    if (c > topReasonCount) {
      topReason = r;
      topReasonCount = c;
    }
  });

  // Toggle reason for multi-selection
  const toggleReason = (reasonId: string) => {
    if (selectedReasons.includes(reasonId)) {
      if (selectedReasons.length > 1) {
        setSelectedReasons(selectedReasons.filter((r) => r !== reasonId));
      }
    } else {
      setSelectedReasons([...selectedReasons, reasonId]);
    }
  };

  const toggleEditReason = (reasonId: string) => {
    if (editReasons.includes(reasonId)) {
      if (editReasons.length > 1) {
        setEditReasons(editReasons.filter((r) => r !== reasonId));
      }
    } else {
      setEditReasons([...editReasons, reasonId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      alert('Please enter an honest explanation of what you did and why time was wasted.');
      return;
    }

    if (selectedReasons.length === 0) {
      alert('Please select at least one reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await logWastedDay({
        date: selectedDate,
        reasons: selectedReasons,
        explanation: explanation.trim(),
        hoursWasted: Number(hoursWasted) || 8,
      });

      setSuccessBanner(`✓ Wasted day (${selectedDate}) permanently saved! Cumulative count is now ${cumulativeCount + 1}.`);
      setExplanation('');
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to log wasted day.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (record: WastedDayRecord) => {
    if (!record.id) return;
    setEditingId(record.id);
    setEditExplanation(record.explanation);
    const existingReasons = record.reasons && record.reasons.length > 0 
      ? record.reasons 
      : (record.reason ? record.reason.split(', ') : [WASTED_REASONS[0].id]);
    setEditReasons(existingReasons);
    setEditHours(record.hoursWasted || 8);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editExplanation.trim()) return;
    await updateWastedDay(id, {
      explanation: editExplanation.trim(),
      reasons: editReasons,
      reason: editReasons.join(', '),
      hoursWasted: editHours,
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await deleteWastedDay(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl card-maroon-gold border border-[#1f1f1f] shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white/10">
          <Hourglass className="w-56 h-56" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#84CC16] border-2 border-black text-black text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Accountability Vault
              </span>
              <span className="text-xs text-[#B8B0AA]">Brutal Self-Honesty</span>
            </div>
            <h1 className="font-sans text-2xl md:text-3xl font-black tracking-tight text-white">
              Wasted Days <span className="text-shiny-gold">Ledger</span>
            </h1>
            <p className="text-xs md:text-sm text-[#B8B0AA] mt-1 max-w-2xl">
              Track the days you didn't study and lost to distractions. Every recorded day permanently increases your cumulative count and is permanently archived below.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-[#000000]/80 p-3 rounded-xl border border-[#1f1f1f] shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#B8B0AA] tracking-wider">Permanent Total</div>
              <div className="text-3xl font-black font-sans text-[#84CC16]">
                {cumulativeCount} <span className="text-sm font-sans font-medium text-white">{cumulativeCount === 1 ? 'day' : 'days'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-black border-2 border-[#84CC16] flex items-center justify-center text-[#84CC16] shadow-sm">
              <Hourglass className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-black border-2 border-[#84CC16] text-white text-sm shadow-xl flex items-center gap-3 shadow-xl"
          >
            <Check className="w-5 h-5 text-[#84CC16] shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cumulative Count Card */}
        <div className="p-4 rounded-xl bg-[#070707] border border-[#1f1f1f] shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-black border-2 border-[#84CC16] flex items-center justify-center text-[#84CC16] shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#B8B0AA] uppercase font-semibold">Cumulative Count</div>
            <div className="text-2xl font-bold text-white font-serif">
              {cumulativeCount} <span className="text-xs text-[#84CC16] font-sans font-bold">{cumulativeCount === 1 ? 'day lost' : 'days lost'}</span>
            </div>
          </div>
        </div>

        {/* Total Hours Lost */}
        <div className="p-4 rounded-xl bg-[#070707] border border-[#1f1f1f] shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-black border border-[#84CC16]/30 flex items-center justify-center text-shiny-gold shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#B8B0AA] uppercase font-semibold">Estimated Time Lost</div>
            <div className="text-2xl font-bold text-white font-serif">
              ~{totalHoursLost} <span className="text-xs text-[#B8B0AA] font-sans font-normal">study hours</span>
            </div>
          </div>
        </div>

        {/* Biggest Weakness */}
        <div className="p-4 rounded-xl bg-[#070707] border border-[#1f1f1f] shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-black border-2 border-white flex items-center justify-center text-white shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-[#B8B0AA] uppercase font-semibold">Top Distraction</div>
            <div className="text-base font-bold text-white truncate font-serif" title={topReason}>
              {topReasonCount > 0 ? `${topReason} (${topReasonCount})` : 'None yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Log Form Card */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#070707] border border-[#1f1f1f] shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f1f]">
          <div className="w-8 h-8 rounded-lg bg-black border border-[#84CC16]/40 flex items-center justify-center text-shiny-gold">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-sans">Log a Wasted Day</h2>
            <p className="text-xs text-[#B8B0AA]">Record what went wrong so you never repeat the same mistake.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#B8B0AA] uppercase mb-2">
              Which Day Did You Waste?
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === todayStr
                    ? 'btn-shiny-gold text-black font-bold'
                    : 'bg-[#000000] text-[#B8B0AA] border border-[#1f1f1f] hover:border-[#84CC16]'
                }`}
              >
                Today ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === yesterdayStr
                    ? 'btn-shiny-gold text-black font-bold'
                    : 'bg-[#000000] text-[#B8B0AA] border border-[#1f1f1f] hover:border-[#84CC16]'
                }`}
              >
                Yesterday ({yesterdayStr})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(twoDaysAgoStr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === twoDaysAgoStr
                    ? 'btn-shiny-gold text-black font-bold'
                    : 'bg-[#000000] text-[#B8B0AA] border border-[#1f1f1f] hover:border-[#84CC16]'
                }`}
              >
                2 Days Ago ({twoDaysAgoStr})
              </button>

              <div className="flex items-center gap-1.5 ml-auto">
                <Calendar className="w-3.5 h-3.5 text-[#B8B0AA]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#000000] border border-[#1f1f1f] text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>
          </div>

          {/* Primary Reason / Distraction Chips (MULTIPLE SELECTION SUPPORT) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#B8B0AA] uppercase">
                What Caused It? <span className="text-shiny-gold normal-case font-normal">(Select multiple reasons)</span>
              </label>
              <span className="text-[11px] text-[#A3E635] font-semibold">
                {selectedReasons.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {WASTED_REASONS.map((r) => {
                const isSelected = selectedReasons.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleReason(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#84CC16] border-2 border-black text-black font-black shadow-[2px_2px_0px_#000000]'
                        : 'bg-[#000000] border-[#1f1f1f] text-[#B8B0AA] hover:text-white hover:border-[#2a2a2a]'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#B8B0AA] mt-1.5">
              Click any chip to add or remove it from your selection.
            </p>
          </div>

          {/* Explanation Textarea (Why, What did I do) */}
          <div>
            <label className="block text-xs font-semibold text-[#B8B0AA] uppercase mb-1.5">
              Why? What did you do? <span className="text-[#84CC16]">*</span>
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Be brutally honest with yourself: e.g. I opened Instagram reels after lunch, scrolled for 3 hours, started playing games with friends, and skipped DSA entirely..."
              rows={3}
              required
              className="w-full bg-[#000000] border border-[#1f1f1f] rounded-xl p-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all resize-y"
            />
          </div>

          {/* Estimated Hours & Submit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#B8B0AA]">Estimated Time Lost:</span>
              <div className="flex gap-1.5">
                {[4, 6, 8, 10, 12].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHoursWasted(h)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      hoursWasted === h
                        ? 'bg-black border border-[#84CC16] text-shiny-gold'
                        : 'bg-[#000000] border border-[#1f1f1f] text-[#B8B0AA]'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !explanation.trim() || selectedReasons.length === 0}
              className="px-5 py-2.5 rounded-xl btn-shiny-gold text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              <Hourglass className="w-4 h-4 text-black" />
              <span>Record Wasted Day (+1 to Count)</span>
            </button>
          </div>
        </form>
      </div>

      {/* History / Timeline of Wasted Days (PERMANENT LOG DISPLAY AT DOWN) */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#070707] border border-[#1f1f1f] shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f1f1f]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white font-sans">Logged Wasted Days History</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#84CC16] border-2 border-black text-black text-xs font-bold">
                {wastedDays.length} {wastedDays.length === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
            <p className="text-xs text-[#B8B0AA] mt-0.5">
              Permanently archived records of days you didn't study. Every entry stays here permanently for accountability.
            </p>
          </div>
        </div>

        {wastedDays.length === 0 ? (
          <div className="py-12 text-center text-[#B8B0AA] bg-[#000000]/60 rounded-xl border border-[#1f1f1f]/50">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-black border border-[#84CC16]/30 flex items-center justify-center text-shiny-gold">
              <Check className="w-7 h-7" />
            </div>
            <p className="text-white font-medium text-sm">No Wasted Days Recorded Yet!</p>
            <p className="text-xs text-[#B8B0AA] mt-1 max-w-md mx-auto">
              If you didn't study yesterday or today, fill out the form above and click "Record Wasted Day". It will be permanently archived right here.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {wastedDays.map((record, index) => {
              const isEditing = editingId === record.id;
              const isConfirmingDelete = deleteConfirmId === record.id;
              
              // Extract list of reasons
              const reasonsList = record.reasons && record.reasons.length > 0
                ? record.reasons
                : (record.reason ? record.reason.split(', ') : ['Distraction']);

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-xl border-2 border-black dark:border-[#333333] bg-white text-black dark:bg-[#000000] dark:text-white hover:border-[#84CC16] transition-all space-y-3 shadow-[3px_3px_0px_#000000] dark:shadow-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md border-2 border-black dark:border-[#333333] bg-white dark:bg-black text-black dark:text-[#84CC16] text-xs font-mono font-bold">
                        #{wastedDays.length - index}
                      </span>
                      <span className="font-sans font-black text-black dark:text-white text-sm">
                        {record.date}
                      </span>
                      {record.hoursWasted && (
                        <span className="px-2 py-0.5 rounded-full border-2 border-black dark:border-[#84CC16]/30 bg-white dark:bg-black text-black dark:text-[#84CC16] text-xs font-bold">
                          ~{record.hoursWasted}h lost
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => handleStartEdit(record)}
                            className="p-1.5 rounded-lg border-2 border-black dark:border-[#333333] bg-white text-black dark:bg-[#080808] dark:text-white hover:bg-[#84CC16] hover:text-black dark:hover:border-[#84CC16] dark:hover:text-[#84CC16] transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(record.id || null)}
                            className="p-1.5 rounded-lg border-2 border-black dark:border-[#333333] bg-white text-black dark:bg-[#080808] dark:text-white hover:bg-black hover:text-white dark:hover:border-white transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Multiple Reasons Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {reasonsList.map((r, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2.5 py-0.5 rounded-full border-2 border-black dark:border-[#84CC16]/60 bg-white dark:bg-black text-black dark:text-[#84CC16] text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span className="text-[#84CC16]">•</span>
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>

                  {/* Editing Mode */}
                  {isEditing ? (
                    <div className="pt-2 space-y-2.5 border-t border-[#1f1f1f]">
                      <div>
                        <span className="text-[11px] text-[#B8B0AA] block mb-1">Update reasons (multi-select):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {WASTED_REASONS.map((r) => {
                            const isSel = editReasons.includes(r.id);
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => toggleEditReason(r.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                                  isSel
                                    ? 'bg-[#84CC16] border-2 border-black text-black font-bold'
                                    : 'bg-black border-[#1f1f1f] text-[#B8B0AA]'
                                }`}
                              >
                                {isSel ? '✓ ' : ''}{r.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <textarea
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        rows={2}
                        className="w-full bg-black border border-[#1f1f1f] rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#84CC16]"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded text-xs text-[#B8B0AA] hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => record.id && handleSaveEdit(record.id)}
                          className="px-3 py-1 rounded text-xs btn-shiny-gold text-black font-bold cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Honest Explanation */
                    <p className="text-xs font-bold p-3.5 rounded-xl border-2 border-black dark:border-white bg-white text-black dark:bg-black dark:text-white font-sans leading-relaxed shadow-[2px_2px_0px_#000000] dark:shadow-none">
                      "{record.explanation}"
                    </p>
                  )}

                  {/* Delete Confirmation Warning */}
                  {isConfirmingDelete && (
                    <div className="p-2.5 rounded-lg bg-black border-2 border-white text-xs text-white flex items-center justify-between gap-3 shadow-lg">
                      <span>Are you sure you want to remove this record?</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-black text-[#B8B0AA] hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => record.id && handleDelete(record.id)}
                          className="px-2.5 py-1 rounded bg-white text-black font-black border-2 border-black hover:bg-[#84CC16] cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
