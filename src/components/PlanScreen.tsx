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
          <span className="text-xs uppercase tracking-widest text-[#84CC16] font-semibold flex items-center gap-1.5 mb-1 font-sans">
            <CalendarRange className="w-3.5 h-3.5" /> 4-Year Timeline Architecture
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-white">
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
          <Sparkles className="w-4 h-4 text-[#A3E635] shrink-0" />
          <span className="text-xs text-white font-bold tracking-wide">
            Timeline Actions:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleShiftPlan(7)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-black dark:bg-[#0a0a0a] dark:text-[#84CC16] dark:border-[#333333] hover:bg-[#84CC16] hover:text-black dark:hover:border-[#84CC16] text-xs font-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000]"
            title="Shift remaining plan by +7 days"
          >
            <FastForward className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>I'm Behind (+7 Days)</span>
          </button>

          <button
            onClick={() => handleShiftPlan(14)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-black dark:bg-[#0a0a0a] dark:text-white dark:border-[#333333] hover:bg-[#84CC16] hover:text-black dark:hover:border-[#84CC16] dark:hover:text-[#84CC16] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000]"
            title="Pause plan for Exam Week (+14 days)"
          >
            <PauseCircle className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Exam Week (+14 Days)</span>
          </button>

          <button
            onClick={handleResetPreset}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-black dark:bg-[#0a0a0a] dark:text-white dark:border-[#333333] hover:bg-black hover:text-white dark:hover:border-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000]"
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
                    <span className="w-2 h-2 rounded-full bg-[#84CC16] shadow-sm shadow-[#84CC16] shrink-0" />
                    <h3 className="font-sans text-lg sm:text-xl font-black text-white truncate">
                      {block.title}
                    </h3>

                    {block.isParallel && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#000000] text-shiny-gold border border-[#84CC16]/45 font-bold">
                        <Layers className="w-2.5 h-2.5" /> Parallel Lane
                      </span>
                    )}
                  </div>

                  {/* Dates & Duration */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#B8B0AA] font-sans">
                    <span className="flex items-center gap-1.5 text-shiny-gold font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#A3E635]" />
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
                    className="min-h-[42px] px-3 py-1.5 rounded-xl border-2 border-black bg-white text-black dark:bg-[#080808] dark:text-white dark:border-[#333333] text-xs font-bold focus:outline-none focus:border-[#84CC16] cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    <option value="Ready to Start">Ready to Start</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Queue">Queue</option>
                  </select>

                  {/* Edit button */}
                  <button
                    onClick={() => openEditModal(block)}
                    className="min-h-[42px] min-w-[42px] rounded-xl border-2 border-black bg-white text-black dark:bg-[#080808] dark:text-white dark:border-[#333333] hover:bg-[#84CC16] hover:text-black dark:hover:border-[#84CC16] dark:hover:text-[#84CC16] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#000000]"
                    title="Edit block"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="min-h-[42px] min-w-[42px] rounded-xl border-2 border-black bg-white text-black dark:bg-[#080808] dark:text-white dark:border-[#333333] hover:bg-black hover:text-white dark:hover:border-white dark:hover:text-white flex items-center justify-center transition-colors shadow-[2px_2px_0px_#000000]"
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
            className="w-full max-w-lg bg-[#121212] border border-[#84CC16]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#84CC16]/20">
              <h3 className="font-sans text-2xl font-black text-[#F9F6EE]">
                {editingBlock ? 'Edit Timeline Block' : 'Add Track / Timeline Block'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#A09D95] hover:text-[#84CC16]"
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
                  style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#080808] border border-[#84CC16]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#84CC16] cursor-pointer"
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
                    Custom Title <span className="text-[#84CC16]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus, Redis Deep Dive..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#84CC16]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#84CC16]"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#84CC16]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#84CC16]"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#84CC16]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#84CC16]"
                    required
                  />
                </div>
              </div>

              {/* Parallel Lane Checkbox & Status */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-black border border-[#84CC16]/25">
                  <input
                    type="checkbox"
                    checked={isParallel}
                    onChange={(e) => setIsParallel(e.target.checked)}
                    className="w-4 h-4 accent-[#84CC16] rounded"
                  />
                  <span className="text-xs font-semibold text-[#F9F6EE]">
                    Run in Parallel Lane
                  </span>
                </label>

                <div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#080808] border border-[#84CC16]/35 text-[#A3E635] text-sm font-semibold focus:outline-none focus:border-[#84CC16] cursor-pointer"
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
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#84CC16]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#84CC16]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#84CC16]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-[#A09D95] hover:text-[#F9F6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-2xl bg-[#84CC16] text-black font-semibold text-xs hover:bg-white transition-colors"
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