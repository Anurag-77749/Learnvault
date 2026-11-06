import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  CalendarRange, 
  Plus, 
  Sparkles, 
  FastForward, 
  PauseCircle, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  X
} from 'lucide-react';
import { db, TimelineBlock } from '../services/db';
import { 
  seedTimelineIfEmpty, 
  addTimelineBlock, 
  updateTimelineBlock, 
  deleteTimelineBlock, 
  shiftRemainingPlan 
} from '../services/timelineService';

const TRACK_OPTIONS = [
  'Track 0: Introduction to FDE',
  'Track 1: Python (Main Language)',
  'Track 2: DSA (Striver A2Z + Code & Debug)',
  'Track 3: Git & GitHub',
  'Track 4: Linux Skills',
  'Track 5: Frontend Skills (React & TypeScript)',
  'Track 6: Backend Skills (Node.js & PostgreSQL)',
  'Track 7: Data Engineering Skills',
  'Track 8: AI Engineering',
  'Track 9: DevOps & Cloud Skills',
  'Track 10: Production AI Systems',
  'Track 11: Customer Delivery & Field Skills',
  'Track 12: Communication, English & ADSD',
  'Custom Topic / Track',
];

export const PlanScreen: React.FC = () => {
  useEffect(() => {
    seedTimelineIfEmpty();
  }, []);

  const timelineBlocks = useLiveQuery(() => db.timelineBlocks.toArray()) || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimelineBlock | null>(null);

  // Form State
  const [selectedTrack, setSelectedTrack] = useState(TRACK_OPTIONS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [isParallel, setIsParallel] = useState(false);
  const [status, setStatus] = useState('Upcoming');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingBlock(null);
    setSelectedTrack(TRACK_OPTIONS[0]);
    setCustomTitle('');
    setStartDate('2026-11-01');
    setEndDate('2026-11-30');
    setIsParallel(false);
    setStatus('Upcoming');
    setNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (block: TimelineBlock) => {
    setEditingBlock(block);
    if (TRACK_OPTIONS.includes(block.title)) {
      setSelectedTrack(block.title);
      setCustomTitle('');
    } else {
      setSelectedTrack('Custom Topic / Track');
      setCustomTitle(block.title);
    }
    setStartDate(block.startDate);
    setEndDate(block.endDate);
    setIsParallel(Boolean(block.isParallel));
    setStatus(block.status || 'Upcoming');
    setNotes(block.notes || '');
    setShowAddModal(true);
  };

  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = selectedTrack === 'Custom Topic / Track' ? customTitle.trim() : selectedTrack;
    if (!finalTitle) return;

    if (editingBlock && editingBlock.id) {
      await updateTimelineBlock(editingBlock.id, {
        title: finalTitle,
        startDate,
        endDate,
        isParallel,
        status,
        notes: notes.trim(),
      });
    } else {
      await addTimelineBlock({
        title: finalTitle,
        startDate,
        endDate,
        laneIndex: isParallel ? 1 : 0,
        isParallel,
        status,
        notes: notes.trim(),
      });
    }

    setShowAddModal(false);
    setEditingBlock(null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this timeline block?')) {
      await deleteTimelineBlock(id);
    }
  };

  const handleShiftPlan = async (days: number) => {
    if (confirm(`Shift all upcoming and in-progress plan blocks by +${days} days?`)) {
      await shiftRemainingPlan(days);
    }
  };

  const handleResetPreset = async () => {
    if (confirm('Reset timeline back to your starting notebook preset? Any custom blocks will be replaced.')) {
      await seedTimelineIfEmpty(true);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FF5500] font-semibold flex items-center gap-1.5 mb-1 font-sans">
            <CalendarRange className="w-3.5 h-3.5" /> 4-Year Timeline Architecture
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Plan & Parallel Tracks
          </h1>
          <p className="text-xs sm:text-sm text-[#B8B0AA] font-sans mt-0.5">
            Manual and parallel multi-lane scheduling from Nov 1, 2026 to 2030
          </p>
        </div>

        {/* Action Button: Add Block */}
        <button
          onClick={openAddModal}
          className="min-h-[44px] px-4 py-2 rounded-2xl btn-shiny-gold font-semibold text-xs flex items-center gap-2 shrink-0 shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Track / Block</span>
        </button>
      </div>

      {/* Control Bar: I'm Behind Shift & Exam Week */}
      <div className="p-4 rounded-3xl card-maroon-gold flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFA040] shrink-0" />
          <span className="text-xs text-white font-bold tracking-wide">
            Timeline Actions:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleShiftPlan(7)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-black border border-[#FF5500]/40 text-shiny-gold hover:border-[#FF5500] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Shift remaining plan by +7 days"
          >
            <FastForward className="w-3.5 h-3.5 text-[#FFA040]" />
            <span>I'm Behind (+7 Days)</span>
          </button>

          <button
            onClick={() => handleShiftPlan(14)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-black border border-[#FF5500]/40 text-white hover:text-shiny-gold hover:border-[#FF5500] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Pause plan for Exam Week (+14 days)"
          >
            <PauseCircle className="w-3.5 h-3.5 text-[#FFA040]" />
            <span>Exam Week (+14 Days)</span>
          </button>

          <button
            onClick={handleResetPreset}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#000000] border border-[#1a1a1a] text-[#B8B0AA] hover:text-shiny-gold hover:border-[#FF5500] text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Reset to notebook preset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Preset</span>
          </button>
        </div>
      </div>

      {/* Timeline Blocks List */}
      <div className="space-y-3.5">
        {timelineBlocks.length === 0 ? (
          <div className="p-10 rounded-3xl card-maroon-gold text-center space-y-3">
            <p className="text-sm text-[#B8B0AA]">No timeline blocks scheduled yet.</p>
            <button
              onClick={handleResetPreset}
              className="text-xs text-shiny-gold font-bold underline"
            >
              Load Starting Notebook Preset
            </button>
          </div>
        ) : (
          timelineBlocks.map((block) => {
            const isDone = block.status === 'Completed';

            return (
              <div
                key={block.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-[#000000] border-[#1a1a1a] opacity-80'
                    : 'card-maroon-gold shadow-md'
                }`}
              >
                {/* Left: Track Title, Dates & Parallel Lane Badge */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-sm shadow-[#FF5500] shrink-0" />
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white truncate">
                      {block.title}
                    </h3>

                    {block.isParallel && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#000000] text-shiny-gold border border-[#FF5500]/45 font-bold">
                        <Layers className="w-2.5 h-2.5" /> Parallel Lane
                      </span>
                    )}
                  </div>

                  {/* Dates & Duration */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#B8B0AA] font-sans">
                    <span className="flex items-center gap-1.5 text-shiny-gold font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#FFA040]" />
                      {block.startDate} &mdash; {block.endDate}
                    </span>

                    {block.notes && (
                      <span className="text-[#807D75] truncate max-w-sm italic">
                        &bull; {block.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill & Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={block.status || 'Upcoming'}
                    onChange={async (e) => {
                      if (block.id) {
                        await updateTimelineBlock(block.id, { status: e.target.value });
                      }
                    }}
                    style={{ colorScheme: 'dark' }} className="min-h-[42px] px-3 py-1.5 rounded-xl bg-[#0E0205] border border-[#1a1a1a] text-xs text-[#FFA040] font-semibold focus:outline-none focus:border-[#FF5500] cursor-pointer"
                  >
                    <option value="Ready to Start" className="bg-[#080808] text-white py-1.5">Ready to Start</option>
                    <option value="In Progress" className="bg-[#080808] text-white py-1.5">In Progress</option>
                    <option value="Upcoming" className="bg-[#080808] text-white py-1.5">Upcoming</option>
                    <option value="Completed" className="bg-[#080808] text-white py-1.5">Completed</option>
                    <option value="Queue" className="bg-[#080808] text-white py-1.5">Queue</option>
                  </select>

                  {/* Edit button */}
                  <button
                    onClick={() => openEditModal(block)}
                    className="min-h-[42px] min-w-[42px] rounded-xl bg-black border border-[#1a1a1a] text-[#B8B0AA] hover:text-[#FF5500] hover:border-[#FF5500] flex items-center justify-center transition-colors"
                    title="Edit block"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="min-h-[42px] min-w-[42px] rounded-xl bg-black border border-red-900/30 text-red-400 hover:text-red-300 hover:border-red-500/50 flex items-center justify-center transition-colors"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#121212] border border-[#FF5500]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#FF5500]/20">
              <h3 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                {editingBlock ? 'Edit Timeline Block' : 'Add Track / Timeline Block'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#A09D95] hover:text-[#FF5500]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-3.5">
              {/* Select Track or Custom */}
              <div>
                <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                  Track / Topic
                </label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0E0205] border border-[#FF5500]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#FF5500] cursor-pointer"
                >
                  {TRACK_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Title if selected */}
              {selectedTrack === 'Custom Topic / Track' && (
                <div>
                  <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                    Custom Title <span className="text-[#FF5500]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus, Redis Deep Dive..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#FF5500]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                </div>
              )}

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#FF5500]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#FF5500]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                </div>
              </div>

              {/* Parallel Lane Checkbox & Status */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-black border border-[#FF5500]/25">
                  <input
                    type="checkbox"
                    checked={isParallel}
                    onChange={(e) => setIsParallel(e.target.checked)}
                    className="w-4 h-4 accent-[#FF5500] rounded"
                  />
                  <span className="text-xs font-semibold text-[#F9F6EE]">
                    Run in Parallel Lane
                  </span>
                </label>

                <div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0E0205] border border-[#FF5500]/35 text-[#FFA040] text-sm font-semibold focus:outline-none focus:border-[#FF5500] cursor-pointer"
                  >
                    <option value="Ready to Start" className="bg-[#080808] text-white py-1.5">Ready to Start</option>
                    <option value="In Progress" className="bg-[#080808] text-white py-1.5">In Progress</option>
                    <option value="Upcoming" className="bg-[#080808] text-white py-1.5">Upcoming</option>
                    <option value="Completed" className="bg-[#080808] text-white py-1.5">Completed</option>
                    <option value="Queue" className="bg-[#080808] text-white py-1.5">Queue</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                  Goal Notes & Target
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 1 to 2 problems daily, Striver sheet step 3..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#FF5500]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#FF5500]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-[#A09D95] hover:text-[#F9F6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-2xl bg-[#FF5500] text-black font-semibold text-xs hover:bg-[#FFD700] transition-colors"
                >
                  {editingBlock ? 'Update Block' : 'Save Block'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};