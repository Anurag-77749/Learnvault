import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Check, 
  Plus, 
  Clock, 
  Moon, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Link2, 
  BookMarked, 
  FileText, 
  X,
  Code2,
  Cpu,
  Layers,
  Database,
  Terminal,
  BrainCircuit,
  Flame,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { db, getTodayDateString, TaskItem } from '../services/db';
import { 
  addTask, 
  toggleTaskComplete, 
  deleteTask, 
  reorderTasks, 
  carryOverUnfinishedTasks, 
  updateTaskNote, 
  clearCompletedTasks 
} from '../services/taskService';
import { formatMinutes, updateDailyNote } from '../services/dailyLogService';
import { triggerGoldSparkle } from '../utils/confetti';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';
import { LogWastedModal } from './modals/LogWastedModal';
import { LogSleepModal } from './modals/LogSleepModal';
import { AddQuestionModal } from './modals/AddQuestionModal';
import { LogStudyModal } from './modals/LogStudyModal';

interface TodayScreenProps {
  onNavigateToTimer: (topicTitle?: string) => void;
  onNavigateToPlan: () => void;
  onNavigateToLearn: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onNavigateToTimer,
  onNavigateToPlan,
  onNavigateToLearn,
}) => {
  const today = getTodayDateString();

  useEffect(() => {
    carryOverUnfinishedTasks(today);
  }, [today]);

  const tasks = useLiveQuery(
    async () => {
      const all = await db.tasks.toArray();
      return all
        .filter((t) => !t.completed || t.date === today)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    [today]
  ) || [];

  const dailyLog = useLiveQuery(
    () => db.dailyLogs.get(today),
    [today]
  );

  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showWastedModal, setShowWastedModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showTopicLink, setShowTopicLink] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Editing existing task note
  const [editingTaskForNote, setEditingTaskForNote] = useState<TaskItem | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const [noteText, setNoteText] = useState(dailyLog?.oneLineNote || '');
  useEffect(() => {
    if (dailyLog?.oneLineNote !== undefined) {
      setNoteText(dailyLog.oneLineNote);
    }
  }, [dailyLog?.oneLineNote]);

  // Live timer tracking
  const [activeLiveElapsedMins, setActiveLiveElapsedMins] = useState(0);
  useEffect(() => {
    const checkTimerLive = () => {
      try {
        const saved = localStorage.getItem('fde_tracker_timer_state_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.isRunning && parsed.mode === 'pomodoro' && parsed.targetEndTime) {
            const now = Date.now();
            const remaining = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000));
            const elapsed = Math.max(0, (parsed.durationSeconds || 1500) - remaining);
            setActiveLiveElapsedMins(Math.floor(elapsed / 60));
            return;
          }
        }
      } catch {}
      setActiveLiveElapsedMins(0);
    };

    checkTimerLive();
    const interval = setInterval(checkTimerLive, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = newTaskTitle.trim() || newTaskNote.trim();
    if (!finalTitle) {
      taskInputRef.current?.focus();
      return;
    }
    const finalNote = newTaskTitle.trim() && newTaskNote.trim() ? newTaskNote.trim() : undefined;
    await addTask(
      finalTitle,
      undefined,
      selectedSubtopic ? `sub-${Date.now()}` : undefined,
      selectedSubtopic || undefined,
      finalNote
    );
    setNewTaskTitle('');
    setNewTaskNote('');
    setSelectedSubtopic('');
    setShowTopicLink(false);
    setShowNoteInput(false);
  };

  const handleSaveEditNote = async () => {
    if (editingTaskForNote && editingTaskForNote.id) {
      await updateTaskNote(editingTaskForNote.id, editNoteText.trim() || undefined);
      setEditingTaskForNote(null);
    }
  };

  const handleToggleTask = async (task: TaskItem, e: React.MouseEvent) => {
    const nextState = !task.completed;
    if (nextState) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      triggerGoldSparkle(x, y);
    }
    if (task.id) {
      await toggleTaskComplete(task.id, nextState);
    }
  };

  const handleMoveTask = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const ids = reordered.map((t) => t.id!).filter(Boolean);
    await reorderTasks(ids);
  };

  // Day calculation
  const currentDayNumber = React.useMemo(() => {
    const start = new Date(2026, 10, 1);
    const now = new Date();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.floor((nowMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    return Math.min(1460, Math.max(1, diffDays + 1));
  }, []);

  const formattedToday = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextUpInfo = {
    track: 'Track 0: Introduction',
    topic: 'FDE Glossary & Field Engineering Roles',
    desc: 'Master Delta, UAT, Last-Mile Integration, Day 2 Operations, and FDE Tiers.',
    presetDates: 'Nov 1 – Nov 3, 2026',
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Skills showcase data matching reference image
  const skillCards = [
    { title: 'Python', role: 'Main Lang', icon: Terminal, color: 'from-amber-500 to-yellow-600', bg: 'bg-amber-50 text-amber-600' },
    { title: 'React', role: 'Frontend & UI', icon: Layers, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50 text-cyan-600' },
    { title: 'Next.js', role: 'Full Stack', icon: Cpu, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 text-indigo-600' },
    { title: 'Node.js', role: 'Microservices', icon: Code2, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'AI / ML', role: 'Gemini & Agents', icon: BrainCircuit, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50 text-pink-600' },
    { title: 'DSA', role: 'Striver A2Z', icon: Database, color: 'from-blue-600 to-indigo-700', bg: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-8 pb-28 md:pb-16 max-w-7xl mx-auto">
      {/* ==========================================================================
          1. HERO SHOWCASE WITH 3D GLASS ORBIT INSTALLATION (NOVA MOTIF)
          ========================================================================== */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[32px] card-glass p-6 sm:p-10 border border-white/90 shadow-[0_20px_50px_rgba(37,99,235,0.08)]"
      >
        {/* Soft background ambient glow spots */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/25 to-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-pink-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTA Hero */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 font-mono text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                DAY {currentDayNumber} OF 1,460
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {formattedToday}
              </span>
            </div>

            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Build. <br />
                Innovate. <br />
                <span className="text-nova-gradient">Grow.</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-xl font-normal leading-relaxed">
                Turning ideas into high-impact engineering reality with continuous daily focus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToTimer()}
                className="px-6 py-3 rounded-full btn-nova-primary text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-transform"
              >
                <span>Start Pomodoro</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={onNavigateToPlan}
                className="px-5 py-3 rounded-full btn-nova-glass text-sm font-semibold cursor-pointer hover:border-blue-400 transition-colors"
              >
                View Timeline
              </button>
            </div>
          </div>

          {/* Right 3D Glass Rings & Glowing Blue Orb Installation */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center animate-float">
              {/* Outer Glowing Orbit Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-indigo-200/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-spin-orbit" style={{ transformStyle: 'preserve-3d' }} />

              {/* Tilted Glass Ring */}
              <div 
                className="absolute w-60 h-60 rounded-full border-4 border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] backdrop-blur-sm"
                style={{ transform: 'rotateX(65deg) rotateY(20deg)' }}
              />

              {/* Second Opposing Glass Ring */}
              <div 
                className="absolute w-52 h-52 rounded-full border-3 border-blue-200/70 shadow-[0_10px_25px_rgba(37,99,235,0.1)]"
                style={{ transform: 'rotateX(-55deg) rotateY(-25deg)' }}
              />

              {/* Central Glowing 3D Orb */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 shadow-[0_20px_50px_rgba(37,99,235,0.45),inset_-6px_-6px_12px_rgba(0,0,0,0.35),inset_6px_6px_12px_rgba(255,255,255,0.7)] relative overflow-hidden flex items-center justify-center">
                {/* Gloss reflection highlight */}
                <div className="absolute top-2 left-4 w-12 h-7 bg-white/60 rounded-full blur-[1px] rotate-[-25deg]" />
                <Sparkles className="w-8 h-8 text-white/80 animate-pulse" />
              </div>

              {/* Floating Mini Satellite Orbs */}
              <div className="absolute top-4 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-300 to-blue-500 shadow-md shadow-blue-400/30" />
              <div className="absolute bottom-6 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-sky-200 to-indigo-400 shadow-sm" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ==========================================================================
          2. TWO-COLUMN LAYOUT: MAIN COMMAND CENTER + TACTICAL CONTROLS
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols): To-Do List + My Skills Showcase */}
        <div className="lg:col-span-7 space-y-8">
          {/* 2A. TO-DO HUB */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl card-glass p-6 sm:p-7 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                  To-Do Command Hub
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-priority tasks for today's engineering sprint
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {completedCount}/{tasks.length} Done ({progressPercent}%)
                </span>
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => clearCompletedTasks()}
                    className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium transition-colors cursor-pointer"
                  >
                    Clear Done
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(progressPercent, tasks.length > 0 ? 4 : 0)}%` }}
              />
            </div>

            {/* Floating Command Bar Input Form */}
            <form onSubmit={handleAddTask} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 relative flex items-center">
                  <input
                    ref={taskInputRef}
                    type="text"
                    placeholder="Add a new task in one tap..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full min-h-[46px] px-4 pr-14 rounded-2xl input-command-bar text-sm placeholder-slate-400 focus:outline-none"
                  />
                  <kbd className="hidden sm:inline-flex items-center absolute right-3.5 text-[11px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg pointer-events-none">
                    ↵ Enter
                  </kbd>
                </div>

                {/* Note Toggle */}
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  title="Add short note (optional)"
                  className={`min-h-[46px] px-3.5 rounded-2xl border flex items-center justify-center gap-1.5 transition-all text-xs font-semibold shrink-0 cursor-pointer ${
                    showNoteInput || newTaskNote
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">{newTaskNote ? 'Note Added' : '+ Note'}</span>
                </button>

                {/* Link Topic */}
                <button
                  type="button"
                  onClick={() => setShowTopicLink(!showTopicLink)}
                  title="Link to topic/curriculum"
                  className={`min-h-[46px] w-[46px] rounded-2xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    showTopicLink || selectedSubtopic
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-blue-600" />
                </button>

                {/* Add Button */}
                <button
                  type="submit"
                  className="min-h-[46px] px-5 rounded-2xl btn-nova-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add</span>
                </button>
              </div>

              {/* Optional Short Note Input */}
              <AnimatePresence>
                {showNoteInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-xs text-indigo-700 font-bold flex items-center gap-1 shrink-0">
                        <FileText className="w-3.5 h-3.5" /> Note:
                      </span>
                      <input
                        type="text"
                        placeholder="Short note (e.g. solve #121 on Striver sheet, revise edge cases)..."
                        value={newTaskNote}
                        onChange={(e) => setNewTaskNote(e.target.value)}
                        className="flex-1 min-w-0 min-h-[38px] px-3.5 rounded-xl input-command-bar text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        autoFocus
                      />
                      {newTaskNote && (
                        <button
                          type="button"
                          onClick={() => setNewTaskNote('')}
                          className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Optional Topic Link Input */}
              <AnimatePresence>
                {showTopicLink && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-semibold shrink-0">Link topic:</span>
                      <input
                        type="text"
                        placeholder="e.g. Python Variables, DSA Binary Search, FDE Glossary"
                        value={selectedSubtopic}
                        onChange={(e) => setSelectedSubtopic(e.target.value)}
                        className="flex-1 min-w-0 min-h-[38px] px-3.5 rounded-xl input-command-bar text-xs text-blue-700 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Task Items List */}
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-sans border-2 border-dashed border-slate-200/80 rounded-2xl bg-white/40">
                  <p className="font-medium">No tasks yet today. Add your first goal above!</p>
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                      task.completed
                        ? 'bg-slate-50/80 border-slate-200/60 text-slate-400'
                        : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md text-slate-900'
                    }`}
                  >
                    {/* Left: Custom Checkbox & Title */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={(e) => handleToggleTask(task, e)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 cursor-pointer ${
                          task.completed
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                            : 'border-2 border-slate-300 hover:border-blue-500 bg-white text-transparent'
                        }`}
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <Check className={`w-4 h-4 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <p className={`text-sm font-semibold break-words leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                        {task.subtopicTitle && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-mono font-medium">
                            <BookMarked className="w-3.5 h-3.5 shrink-0" />
                            {task.subtopicTitle}
                          </span>
                        )}

                        {/* Note Display */}
                        {task.note && task.note.trim() && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 max-w-full">
                            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed font-sans break-words">{task.note}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0 pl-[40px] sm:pl-0 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTaskForNote(task);
                          setEditNoteText(task.note || '');
                        }}
                        className={`min-h-[32px] px-2.5 rounded-xl border flex items-center gap-1 transition-colors text-xs cursor-pointer ${
                          task.note
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                        title={task.note ? 'Edit note' : 'Add note'}
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[11px] sm:hidden">{task.note ? 'Edit Note' : '+ Note'}</span>
                      </button>

                      <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
                        <button
                          onClick={() => handleMoveTask(idx, 'up')}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition-colors cursor-pointer"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveTask(idx, 'down')}
                          disabled={idx === tasks.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition-colors cursor-pointer"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteTask(task);
                        }}
                        className="min-h-[32px] px-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] sm:hidden ml-1 font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* 2B. MY SKILLS & CURRICULUM SHOWCASE (EXACTLY AS IN REFERENCE IMAGE) */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl card-glass p-6 sm:p-7 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                  My Skills & Curriculum
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core competencies and structured learning tracks
                </p>
              </div>
              <button
                onClick={onNavigateToLearn}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Tracks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
              {skillCards.map((skill) => {
                const Icon = skill.icon;
                return (
                  <div
                    key={skill.title}
                    onClick={() => onNavigateToTimer(skill.title)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                    title={`Click to focus on ${skill.title}`}
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform" style={{ backgroundColor: 'transparent' }}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${skill.bg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {skill.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {skill.role}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-blue-600 font-semibold">
                      <span>Focus Session</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* Right Column (5 Cols): Daily Tactical Panel + Today So Far Bento + Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3A. DAILY DSA & COMMUNICATION CONTROL PANEL */}
          <DailyDsaCommunicationWidget />

          {/* 3B. TODAY SO FAR (PRECISION GAUGES) */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl card-glass p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Today So Far
              </h3>
              <span className="text-[11px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                DAILY METRICS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Studied */}
              <div 
                onClick={() => setShowStudyModal(true)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                title="Click to log study time"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Time Studied
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                    +Log
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-mono text-3xl font-black text-slate-900 block">
                    {formatMinutes(Math.max(dailyLog?.studyMinutes || 0, (dailyLog?.studyMinutes || 0) + activeLiveElapsedMins))}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" /> Auto / Manual
                </span>
              </div>

              {/* Wasted */}
              <div 
                onClick={() => setShowWastedModal(true)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                title="Click to log wasted time"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Time Wasted
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                    Log
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-mono text-3xl font-black text-slate-900 block">
                    {formatMinutes(dailyLog?.wastedMinutes || 0)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Accountability
                </span>
              </div>

              {/* Questions */}
              <div 
                onClick={() => setShowQuestionModal(true)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Questions Done
                </span>
                <div className="my-2">
                  <span className="font-mono text-3xl font-black text-indigo-600 block">
                    {dailyLog?.questionsCount || 0}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  DSA / Sheets
                </span>
              </div>

              {/* Sleep */}
              <div 
                onClick={() => setShowSleepModal(true)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sleep
                </span>
                <div className="my-2">
                  <span className="font-mono text-3xl font-black text-purple-600 block">
                    {dailyLog?.sleepHours ? `${dailyLog.sleepHours}h` : '—'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Moon className="w-3 h-3 text-purple-600" />
                  {dailyLog?.sleepQuality ? `Quality: ${dailyLog.sleepQuality}/5` : 'Log sleep'}
                </span>
              </div>
            </div>
          </motion.section>

          {/* 3C. QUICK ACTIONS PANEL */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl card-glass p-5 space-y-3"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowWastedModal(true)}
                className="min-h-[44px] px-3.5 rounded-2xl btn-nova-glass text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Log Wasted</span>
              </button>

              <button
                onClick={() => setShowQuestionModal(true)}
                className="min-h-[44px] px-3.5 rounded-2xl btn-nova-glass text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                <span>+1 Question</span>
              </button>

              <button
                onClick={() => setShowSleepModal(true)}
                className="min-h-[44px] px-3.5 rounded-2xl btn-nova-glass text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Moon className="w-3.5 h-3.5 text-purple-600" />
                <span>Log Sleep</span>
              </button>

              <button
                onClick={() => setShowStudyModal(true)}
                className="min-h-[44px] px-3.5 rounded-2xl btn-nova-glass text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log Study</span>
              </button>
            </div>
          </motion.section>

          {/* 3D. NEXT UP & REFLECTION */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl card-glass p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                Next Up in Timeline
              </span>
              <button
                onClick={onNavigateToPlan}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                Full Plan <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">
                {nextUpInfo.track}
              </span>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">
                {nextUpInfo.topic}
              </h4>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {nextUpInfo.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigateToTimer(nextUpInfo.topic)}
                  className="w-full py-2.5 rounded-xl btn-nova-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Start Focus Session</span>
                </button>
              </div>
            </div>

            {/* Reflection Note */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                One-Line Daily Reflection
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="What was your biggest breakthrough today?"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={() => updateDailyNote(noteText)}
                  className="flex-1 min-w-0 min-h-[42px] px-3.5 rounded-xl input-command-bar text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateDailyNote(noteText)}
                  className="min-h-[42px] px-4 rounded-xl btn-nova-primary text-xs font-bold cursor-pointer shrink-0"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Edit Task Note Modal */}
      <AnimatePresence>
        {editingTaskForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-display text-lg font-bold text-slate-900">Task Note</h3>
                </div>
                <button
                  onClick={() => setEditingTaskForNote(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-sans">
                  Task: <span className="text-slate-900 font-semibold">{editingTaskForNote.title}</span>
                </p>
                <textarea
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                  placeholder="Enter a short note (or leave empty to remove note)..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl input-command-bar text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {editNoteText && (
                  <button
                    type="button"
                    onClick={() => setEditNoteText('')}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear Note
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingTaskForNote(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditNote}
                    className="px-5 py-2 rounded-xl btn-nova-primary text-xs font-bold cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <LogStudyModal
        isOpen={showStudyModal}
        onClose={() => setShowStudyModal(false)}
      />
      <LogWastedModal
        isOpen={showWastedModal}
        onClose={() => setShowWastedModal(false)}
      />
      <LogSleepModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        initialBedtime={dailyLog?.sleepBedtime || '23:30'}
        initialWakeTime={dailyLog?.sleepWakeTime || '07:00'}
        initialQuality={dailyLog?.sleepQuality || 4}
      />
      <AddQuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
      />
    </div>
  );
};
