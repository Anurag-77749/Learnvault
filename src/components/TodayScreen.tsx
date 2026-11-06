import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Clock, 
  Moon, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  FileText, 
  ArrowRight,
  Link as LinkIcon,
  CornerDownLeft
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
import { triggerGoldSparkle } from '../utils/confetti';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';
import { SpringCounter } from './SpringCounter';
import { ChronometerCubeShowcase } from './ChronometerCubeShowcase';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';
import { LogWastedModal } from './modals/LogWastedModal';
import { LogSleepModal } from './modals/LogSleepModal';
import { AddQuestionModal } from './modals/AddQuestionModal';
import { LogStudyModal } from './modals/LogStudyModal';

interface TodayScreenProps {
  onNavigateToTimer: (topicTitle?: string) => void;
  onNavigateToPlan: () => void;
  onNavigateToLearn: () => void;
  onNavigateToProgress?: () => void;
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
      // Ensure at least one sample directive if empty
      if (all.length === 0) {
        return [
          {
            id: 1,
            title: 'touch typing',
            completed: false,
            date: today,
            order: 0,
            createdAt: Date.now(),
          } as TaskItem,
        ];
      }
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
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Editing existing task note
  const [editingTaskForNote, setEditingTaskForNote] = useState<TaskItem | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

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
      undefined,
      undefined,
      finalNote
    );
    setNewTaskTitle('');
    setNewTaskNote('');
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

  const completedCount = tasks.filter((t) => t.completed).length;

  const studiedMins = Math.max(dailyLog?.studyMinutes || 0, (dailyLog?.studyMinutes || 0) + activeLiveElapsedMins);
  const wastedMins = dailyLog?.wastedMinutes || 0;
  const questionsCount = dailyLog?.questionsCount || 0;
  const topicsCount = (dailyLog?.topicsLearned || []).length;
  const sleepHours = dailyLog?.sleepHours || 0;

  // Day calculation (Day X of 1,460)
  const currentDayNumber = React.useMemo(() => {
    const start = new Date(2026, 10, 1);
    const now = new Date();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.floor((nowMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    return Math.min(1460, Math.max(1, diffDays + 1));
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative w-full space-y-6 select-none font-sans">
      {/* ========================================================================
          1. HEADER ROW: DAY OF 1,460 & TODAY'S MISSION
          ======================================================================== */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* DAY 7 OF 1,460 Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#080808] border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5A970] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
              DAY {currentDayNumber} OF 1,460
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-[#F5F2EB]">
            Today's Mission
          </h1>

          <p className="text-xs sm:text-sm font-sans text-[#9E958E] mt-1">
            {formattedDate}
          </p>
        </div>

        {/* LearnVault Knowledge Capsule Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#080808]/90 border border-[rgba(255,255,255,0.08)] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.8)] self-start md:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
          <span className="text-xs font-mono font-medium text-[#F6E6C2] tracking-tight">
            LearnVault: Your Knowledge. Your Progress. Your Future.
          </span>
        </div>
      </div>

      {/* ========================================================================
          1.5. PRECISION 3D CHRONOMETER CUBE SHOWCASE (ASSEMBLED ↔ EXPLODED)
          ======================================================================== */}
      <ChronometerCubeShowcase 
        currentDay={currentDayNumber}
        totalDays={1460}
        topicsLearned={topicsCount}
        totalTopics={892}
      />

      {/* ========================================================================
          2. TO-DO LIST (INTERACTIVE 3D TILT CARD WITH COMMAND BAR & CUSTOM CHECKBOX)
          ======================================================================== */}
      <Interactive3DTiltCard maxTilt={3} glowColor="rgba(246, 230, 194, 0.12)" className="w-full">
        <div className="p-5 sm:p-7 space-y-5 relative">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F5F2EB] tracking-tight">
                To-Do List
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#000000] text-[#D4AF37] border border-[#D4AF37]/30 font-mono text-xs font-bold tabular-nums">
                {completedCount}/{tasks.length} Done
              </span>
            </div>
            <span className="text-xs font-mono text-[#55504A] hidden sm:inline">
              Unfinished tasks automatically carry over
            </span>
          </div>

          {/* Raycast / Linear Style Command Input Bar */}
          <form onSubmit={handleAddTask} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={taskInputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task in one tap..."
                className="w-full h-11 sm:h-12 pl-4 pr-32 rounded-lg bg-[#000000] border border-[rgba(255,255,255,0.08)] text-sm text-[#F5F2EB] placeholder-[#55504A] focus:outline-none focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/40 shadow-inner transition-all font-sans"
              />

              {/* In-bar actions: + Note, Link, Shortcut Hint */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    showNoteInput || newTaskNote
                      ? 'bg-[#D4AF37] text-[#000000] font-bold'
                      : 'text-[#9E958E] hover:text-[#F5F2EB] bg-white/[0.04]'
                  }`}
                  title="Attach Context Note"
                >
                  <FileText className="w-3 h-3" />
                  <span>+ Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="p-1 text-[#55504A] hover:text-[#D4AF37] transition-colors cursor-pointer hidden sm:flex"
                  title="Attach Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>

                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-[#55504A] bg-white/[0.03] border border-white/[0.06] rounded">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </kbd>
              </div>
            </div>

            {/* + Add Chamfered Champagne Gold Button */}
            <button
              type="submit"
              className="h-11 sm:h-12 px-6 rounded-lg btn-liquid-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add</span>
            </button>
          </form>

          {/* Slide-out note attachment input */}
          <AnimatePresence>
            {showNoteInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  value={newTaskNote}
                  onChange={(e) => setNewTaskNote(e.target.value)}
                  placeholder="Attach reference link or context note..."
                  className="w-full px-4 py-2.5 rounded-lg bg-[#000000] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F2EB] placeholder-[#55504A] focus:outline-none focus:border-[#D4AF37]/50 shadow-inner font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task Items List */}
          <div className="space-y-1.5 pt-1">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-[#55504A] border border-dashed border-[rgba(255,255,255,0.08)] rounded-lg bg-[#000000]/40">
                NO ACTIVE DIRECTIVES. TYPE ABOVE TO ENGAGE.
              </div>
            ) : (
              tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`group relative p-3 rounded-lg border transition-all duration-200 flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#000000]/70 border-[rgba(255,255,255,0.04)] opacity-50'
                      : 'bg-[#050505] border-[rgba(255,255,255,0.08)] hover:bg-[#0C0C0C] hover:border-[rgba(212,175,55,0.25)] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Custom Rounded-Square Checkbox with Animated SVG Checkmark */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task, e)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-gradient-to-br from-[#F6E6C2] via-[#D4AF37] to-[#AA8222] border-transparent text-[#000000] shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                          : 'border-[rgba(255,255,255,0.15)] bg-[#000000] hover:border-[#D4AF37]/60'
                      }`}
                      aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed && (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <motion.path
                            d="M20 6L9 17l-5-5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                          />
                        </svg>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-[#55504A]' : 'text-[#F5F2EB]'}`}>
                        {task.title}
                      </p>
                      {task.note && (
                        <p className="text-[11px] font-mono text-[#D4AF37]/80 truncate">
                          // {task.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Note, Up/Down, Delete (Fade in smoothly on hover) */}
                  <div className="flex items-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTaskForNote(task);
                        setEditNoteText(task.note || '');
                      }}
                      className="p-1 text-[#9E958E] hover:text-[#D4AF37] transition-colors cursor-pointer"
                      title="Edit Note"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveTask(idx, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 text-[#55504A] hover:text-[#F5F2EB] disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveTask(idx, 'down')}
                      disabled={idx === tasks.length - 1}
                      className="p-0.5 text-[#55504A] hover:text-[#F5F2EB] disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => task.id && deleteTask(task.id)}
                      className="p-1 text-[#55504A] hover:text-[#E5A970] transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => clearCompletedTasks()}
              className="w-full py-1.5 text-center text-[11px] font-mono text-[#55504A] hover:text-[#E5A970] transition-colors cursor-pointer uppercase tracking-wider"
            >
              CLEAR COMPLETED DIRECTIVES ({completedCount})
            </button>
          )}
        </div>
      </Interactive3DTiltCard>

      {/* ========================================================================
          3. "TODAY SO FAR" 5-CARD BENTO GRID (PRECISION INSTRUMENT GAUGES)
          ======================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F5F2EB] tracking-tight">
            Today So Far
          </h2>
          <span className="text-[10px] font-mono text-[#9E958E] uppercase font-bold tracking-widest">
            DAILY PROGRESS TRACKER
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Time Studied */}
          <Interactive3DTiltCard maxTilt={5} glowColor="rgba(246, 230, 194, 0.15)" className="h-full">
            <div className="p-4 sm:p-5 flex flex-col justify-between h-40 sm:h-44 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-[0.08em] text-[#9E958E] uppercase">
                  TIME STUDIED
                </span>
                <button
                  type="button"
                  onClick={() => setShowStudyModal(true)}
                  className="px-2 py-0.5 rounded bg-[rgba(212,175,55,0.12)] hover:bg-[rgba(212,175,55,0.22)] border border-[#D4AF37]/35 text-[9px] font-mono font-bold text-[#F6E6C2] cursor-pointer transition-colors"
                >
                  +Log
                </button>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-metric-champagne tracking-tight leading-none tabular-nums">
                  <SpringCounter value={studiedMins} suffix="m" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9E958E]">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  <span>Auto / Manual</span>
                </div>
                {/* Thin 2px progress bar toward 4h goal */}
                <div className="w-full bg-[#000000] h-[2px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F6E6C2] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, (studiedMins / 240) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 2: Time Wasted */}
          <Interactive3DTiltCard maxTilt={5} glowColor="rgba(229, 169, 112, 0.15)" className="h-full">
            <div className="p-4 sm:p-5 flex flex-col justify-between h-40 sm:h-44 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-[0.08em] text-[#9E958E] uppercase">
                  TIME WASTED
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-[#9E958E] tracking-tight leading-none tabular-nums">
                  <SpringCounter value={wastedMins} suffix="m" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#55504A]">
                  Accountability
                </div>
                {/* Thin 2px progress bar */}
                <div className="w-full bg-[#000000] h-[2px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E5A970]/80 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, (wastedMins / 120) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 3: Questions Done */}
          <Interactive3DTiltCard maxTilt={5} glowColor="rgba(246, 230, 194, 0.15)" className="h-full">
            <div className="p-4 sm:p-5 flex flex-col justify-between h-40 sm:h-44 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-[0.08em] text-[#9E958E] uppercase">
                  QUESTIONS DONE
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-metric-champagne tracking-tight leading-none tabular-nums">
                  <SpringCounter value={questionsCount} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#9E958E]">
                  DSA / Sheets
                </div>
                {/* Thin 2px progress bar toward 5 questions */}
                <div className="w-full bg-[#000000] h-[2px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F6E6C2] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, (questionsCount / 5) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 4: Topics Learned */}
          <Interactive3DTiltCard maxTilt={5} glowColor="rgba(246, 230, 194, 0.15)" className="h-full">
            <div className="p-4 sm:p-5 flex flex-col justify-between h-40 sm:h-44 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-[0.08em] text-[#9E958E] uppercase">
                  TOPICS LEARNED
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-[#F5F2EB] tracking-tight leading-none tabular-nums">
                  <SpringCounter value={topicsCount} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#9E958E]">
                  Curriculum items
                </div>
                {/* Thin 2px progress bar */}
                <div className="w-full bg-[#000000] h-[2px] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F6E6C2] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, (topicsCount / 3) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 5: Sleep Last Night */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Interactive3DTiltCard maxTilt={5} glowColor="rgba(246, 230, 194, 0.12)" className="h-full">
              <div className="p-4 sm:p-5 flex flex-col justify-between h-40 sm:h-44 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-[0.08em] text-[#9E958E] uppercase">
                    SLEEP LAST NIGHT
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-[#9E958E] tracking-tight leading-none tabular-nums">
                    {sleepHours > 0 ? (
                      <SpringCounter value={sleepHours} suffix="h" />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#55504A]">
                    <Moon className="w-3 h-3 text-[#D4AF37]" />
                    <span>{sleepHours > 0 ? 'Logged' : 'Not logged'}</span>
                  </div>
                  {/* Thin 2px progress bar */}
                  <div className="w-full bg-[#000000] h-[2px] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#D4AF37]/60 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, (sleepHours / 8) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </Interactive3DTiltCard>
          </div>
        </div>
      </div>

      {/* ========================================================================
          4. "QUICK ACTIONS" ROW
          ======================================================================== */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F5F2EB] tracking-tight">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Start Pomodoro (Metallic Champagne Gradient Hero Action) */}
          <button
            type="button"
            onClick={() => onNavigateToTimer()}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-lg btn-liquid-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer pulse-gold shadow-lg"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">Start Pomodoro</span>
          </button>

          {/* Log Wasted Time */}
          <button
            type="button"
            onClick={() => setShowWastedModal(true)}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-lg btn-crimson-pill text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="truncate">Log Wasted</span>
          </button>

          {/* +1 Question */}
          <button
            type="button"
            onClick={() => setShowQuestionModal(true)}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-lg btn-crimson-pill text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37] stroke-[2.5]" />
            <span className="truncate">+1 Question</span>
          </button>

          {/* Log Sleep */}
          <button
            type="button"
            onClick={() => setShowSleepModal(true)}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-lg btn-crimson-pill text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="truncate">Log Sleep</span>
          </button>
        </div>
      </div>

      {/* ========================================================================
          4.5. DAILY DSA & COMMUNICATION RAPID INSTRUMENT
          ======================================================================== */}
      <div className="w-full">
        <DailyDsaCommunicationWidget />
      </div>

      {/* ========================================================================
          5. "NEXT UP IN TIMELINE" BANNER (INTERACTIVE 3D TILT WITH SPOTLIGHT)
          ======================================================================== */}
      <Interactive3DTiltCard maxTilt={3} glowColor="rgba(246, 230, 194, 0.12)" className="w-full">
        <div 
          onClick={onNavigateToPlan}
          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37] animate-pulse" />
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#F5F2EB] tracking-tight">
                Next Up in Timeline
              </h3>
              <p className="text-xs font-mono text-[#9E958E]">
                Track 0: Introduction // FDE Glossary & Field Engineering Roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform shrink-0">
            <span className="hidden sm:inline">View Full Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Interactive3DTiltCard>

      {/* Modals */}
      <LogWastedModal
        isOpen={showWastedModal}
        onClose={() => setShowWastedModal(false)}
      />
      <LogSleepModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
      />
      <AddQuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
      />
      <LogStudyModal
        isOpen={showStudyModal}
        onClose={() => setShowStudyModal(false)}
      />
    </div>
  );
};
