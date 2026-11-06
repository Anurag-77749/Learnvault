import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Check, 
  Plus, 
  Clock, 
  Moon, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  FileText, 
  Play,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  TrendingUp,
  BrainCircuit
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
import { formatMinutes, updateDailyNote, logSleep } from '../services/dailyLogService';
import { triggerGoldSparkle } from '../utils/confetti';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';
import { SpringCounter } from './SpringCounter';
import { AmbientGoldCanvas } from './AmbientGoldCanvas';
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
  onNavigateToProgress,
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
    <div className="relative w-full space-y-8 select-none font-sans">
      {/* Ambient Bokeh Gold Particles in Background */}
      <AmbientGoldCanvas className="opacity-75" />

      {/* ========================================================================
          1. HEADER ROW: DAY OF 1,460 & TODAY'S MISSION
          ======================================================================== */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#E5B84B] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#E5B84B] uppercase">
              DAY {currentDayNumber} OF 1,460
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white">
            Today's Mission
          </h1>

          <p className="text-xs sm:text-sm font-sans text-[#BFA997] mt-1">
            {formattedDate}
          </p>
        </div>

        {/* LearnVault Knowledge Capsule Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1A080A]/70 border border-[#E5B84B]/30 backdrop-blur-md shadow-[0_0_20px_rgba(229,184,75,0.15)] self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#E5B84B] shadow-[0_0_8px_#E5B84B] animate-ping" />
          <span className="text-xs font-mono font-medium text-[#F9D976]">
            LearnVault: Your Knowledge. Your Progress. Your Future.
          </span>
        </div>
      </div>

      {/* ========================================================================
          2. TO-DO LIST (INTERACTIVE 3D TILT CARD WITH LIQUID GOLD CTA)
          ======================================================================== */}
      <Interactive3DTiltCard maxTilt={5} className="w-full">
        <div className="crimson-glass p-6 sm:p-7 space-y-5 rounded-2xl relative">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                To-Do List
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5B84B]/20 text-[#F9D976] border border-[#E5B84B]/40 font-mono text-xs font-bold">
                {completedCount}/{tasks.length} Done
              </span>
            </div>
            <span className="text-xs font-mono text-[#A89279] hidden sm:inline">
              Unfinished tasks automatically carry over
            </span>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleAddTask} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={taskInputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task in one tap..."
                className="w-full h-12 pl-4 pr-24 rounded-xl bg-[#140407]/80 border border-[#E5B84B]/25 text-sm text-white placeholder-[#887060] focus:outline-none focus:border-[#F9D976] focus:ring-1 focus:ring-[#F9D976]/50 transition-all font-sans"
              />

              {/* In-bar actions: + Note, Link */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    showNoteInput || newTaskNote
                      ? 'bg-[#E5B84B] text-black font-bold'
                      : 'text-[#BFA997] hover:text-white bg-white/[0.04]'
                  }`}
                  title="Attach Context Note"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="p-1.5 text-[#887060] hover:text-[#E5B84B] transition-colors cursor-pointer"
                  title="Attach Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* + Add Liquid Gold Shimmer Button */}
            <button
              type="submit"
              className="h-12 px-6 rounded-xl btn-liquid-gold text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0 shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
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
              >
                <input
                  type="text"
                  value={newTaskNote}
                  onChange={(e) => setNewTaskNote(e.target.value)}
                  placeholder="Attach reference link or context note..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#140407]/90 border border-[#E5B84B]/20 text-xs text-white placeholder-[#887060] focus:outline-none focus:border-[#F9D976]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task Items List */}
          <div className="space-y-2 pt-1">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-[#887060] border border-dashed border-[#E5B84B]/20 rounded-xl bg-[#140407]/40">
                NO ACTIVE DIRECTIVES. TYPE ABOVE TO ENGAGE.
              </div>
            ) : (
              tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`group relative p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#100305]/60 border-[#E5B84B]/10 opacity-50'
                      : 'bg-[#180509]/80 border-[#E5B84B]/20 hover:border-[#E5B84B]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Rounded Square Obsidian Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task, e)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-gradient-to-r from-[#E5B84B] to-[#F9D976] border-[#F9D976] text-black shadow-[0_0_12px_rgba(229,184,75,0.4)]'
                          : 'border-[#E5B84B]/30 bg-[#120305] hover:border-[#E5B84B]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-[#887060]' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.note && (
                        <p className="text-[11px] font-mono text-[#E5B84B]/80 truncate">
                          // {task.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Note, Up/Down, Delete */}
                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTaskForNote(task);
                        setEditNoteText(task.note || '');
                      }}
                      className="p-1 text-[#BFA997] hover:text-[#E5B84B] transition-colors cursor-pointer"
                      title="Edit Note"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveTask(idx, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 text-[#887060] hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveTask(idx, 'down')}
                      disabled={idx === tasks.length - 1}
                      className="p-0.5 text-[#887060] hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => task.id && deleteTask(task.id)}
                      className="p-1 text-[#887060] hover:text-red-400 transition-colors cursor-pointer"
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
              className="w-full py-2 text-center text-xs font-mono text-[#887060] hover:text-red-400 transition-colors cursor-pointer"
            >
              CLEAR COMPLETED DIRECTIVES ({completedCount})
            </button>
          )}
        </div>
      </Interactive3DTiltCard>

      {/* ========================================================================
          3. "TODAY SO FAR" 5-CARD BENTO GRID (WITH 3D TILT & SPRING COUNTERS)
          ======================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            Today So Far
          </h2>
          <span className="text-xs font-mono text-[#A89279] uppercase font-bold tracking-wider">
            DAILY PROGRESS TRACKER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Time Studied */}
          <Interactive3DTiltCard maxTilt={8} className="h-full">
            <div className="crimson-glass p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden border border-[#E5B84B]/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#F9D976] uppercase">
                  TIME STUDIED
                </span>
                <button
                  type="button"
                  onClick={() => setShowStudyModal(true)}
                  className="px-2 py-0.5 rounded-md bg-[#E5B84B]/20 hover:bg-[#E5B84B]/30 border border-[#E5B84B]/40 text-[10px] font-mono text-[#F9D976] cursor-pointer"
                >
                  +Log
                </button>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight leading-none">
                  <SpringCounter value={studiedMins} suffix="m" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#BFA997]">
                <Clock className="w-3 h-3 text-[#E5B84B]" />
                <span>Auto / Manual</span>
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 2: Time Wasted */}
          <Interactive3DTiltCard maxTilt={8} className="h-full">
            <div className="crimson-glass p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden border border-[#E5B84B]/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#BFA997] uppercase">
                  TIME WASTED
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#A89279] tracking-tight leading-none">
                  <SpringCounter value={wastedMins} suffix="m" />
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#887060]">
                Accountability
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 3: Questions Done */}
          <Interactive3DTiltCard maxTilt={8} className="h-full">
            <div className="crimson-glass p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden border border-[#E5B84B]/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#F9D976] uppercase">
                  QUESTIONS DONE
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#F9D976] tracking-tight leading-none">
                  <SpringCounter value={questionsCount} />
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#BFA997]">
                DSA / Sheets
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 4: Topics Learned */}
          <Interactive3DTiltCard maxTilt={8} className="h-full">
            <div className="crimson-glass p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden border border-[#E5B84B]/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#F9D976] uppercase">
                  TOPICS LEARNED
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight leading-none">
                  <SpringCounter value={topicsCount} />
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#BFA997]">
                Curriculum items
              </div>
            </div>
          </Interactive3DTiltCard>

          {/* Card 5: Sleep Last Night */}
          <Interactive3DTiltCard maxTilt={8} className="h-full">
            <div className="crimson-glass p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden border border-[#E5B84B]/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#BFA997] uppercase">
                  SLEEP LAST NIGHT
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#BFA997] tracking-tight leading-none">
                  {sleepHours > 0 ? (
                    <SpringCounter value={sleepHours} suffix="h" />
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#887060]">
                <Moon className="w-3 h-3 text-[#E5B84B]" />
                <span>{sleepHours > 0 ? 'Logged' : 'Not logged'}</span>
              </div>
            </div>
          </Interactive3DTiltCard>
        </div>
      </div>

      {/* ========================================================================
          4. "QUICK ACTIONS" ROW OF MAGNETIC HOVER BUTTONS
          ======================================================================== */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Pomodoro (Metallic Gold Gradient with Pulse Glow) */}
          <button
            type="button"
            onClick={() => onNavigateToTimer()}
            className="h-14 px-6 rounded-2xl btn-liquid-gold text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer pulse-gold shadow-xl"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Start Pomodoro</span>
          </button>

          {/* Log Wasted Time */}
          <button
            type="button"
            onClick={() => setShowWastedModal(true)}
            className="h-14 px-6 rounded-2xl btn-crimson-pill text-xs font-mono font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#E5B84B]" />
            <span>Log Wasted Time</span>
          </button>

          {/* +1 Question */}
          <button
            type="button"
            onClick={() => setShowQuestionModal(true)}
            className="h-14 px-6 rounded-2xl btn-crimson-pill text-xs font-mono font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F9D976] stroke-[2.5]" />
            <span>+1 Question</span>
          </button>

          {/* Log Sleep */}
          <button
            type="button"
            onClick={() => setShowSleepModal(true)}
            className="h-14 px-6 rounded-2xl btn-crimson-pill text-xs font-mono font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Moon className="w-4 h-4 text-[#E5B84B]" />
            <span>Log Sleep</span>
          </button>
        </div>
      </div>

      {/* ========================================================================
          5. "NEXT UP IN TIMELINE" BANNER
          ======================================================================== */}
      <div 
        onClick={onNavigateToPlan}
        className="crimson-glass p-5 rounded-2xl border border-[#E5B84B]/20 flex items-center justify-between gap-4 cursor-pointer hover:border-[#E5B84B]/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5B84B] shadow-[0_0_8px_#E5B84B] animate-pulse" />
          <div>
            <h3 className="font-display font-bold text-base text-white tracking-tight">
              Next Up in Timeline
            </h3>
            <p className="text-xs font-mono text-[#BFA997]">
              Track 0: Introduction // FDE Glossary & Field Engineering Roles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#F9D976] group-hover:translate-x-1 transition-transform">
          <span>View Full Timeline</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

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
