import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Check, 
  Plus, 
  Clock, 
  Moon, 
  Terminal, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Link2, 
  FileText, 
  X,
  Play,
  ArrowRight,
  ShieldAlert,
  Target
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
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const nextUpInfo = {
    track: 'TRACK 00: FDE GLOSSARY',
    topic: 'Delta, UAT, Last-Mile Integration & Day 2 Ops',
    presetDates: 'NOV 01 – NOV 03, 2026',
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-3 max-w-[1500px] mx-auto font-mono pb-20 md:pb-6 text-xs">
      {/* ==========================================================================
          TOP HUD TELEMETRY HEADER
          ========================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/40 text-[#00FF9D] font-bold text-[11px] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,157,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
            MISSION DAY {currentDayNumber} / 1,460
          </span>
          <span className="text-[#5A7E8D] text-[11px] font-bold">
            [{formattedToday}]
          </span>
        </div>

        <div className="text-[11px] text-[#5A7E8D] hidden sm:flex items-center gap-1.5">
          <span className="text-[#00F0FF]">&gt;&gt;</span>
          <span>DIRECTIVE: "YOUR KNOWLEDGE. YOUR PROGRESS. YOUR FUTURE."</span>
        </div>
      </div>

      {/* ==========================================================================
          HIGH-DENSITY BENTO GRID: NO-SCROLL COMMAND HUD
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ========================================================================
            LEFT COLUMN (7 COLS): TASK EXECUTION MATRIX
            ======================================================================== */}
        <section className="lg:col-span-7 rounded-lg hud-panel hud-corner p-3.5 space-y-3">
          {/* Matrix Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#00F0FF]/15">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00F0FF]" />
              <h2 className="text-xs font-bold text-white tracking-wider uppercase">
                TASK EXECUTION MATRIX
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#04080A] text-[#00FF9D] font-bold border border-[#00FF9D]/30">
                {completedCount}/{tasks.length} DONE [{progressPercent}%]
              </span>
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={() => clearCompletedTasks()}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#FF2A55]/15 border border-[#FF2A55]/30 text-[#FF2A55] hover:bg-[#FF2A55]/30 transition-colors cursor-pointer"
                  title="Purge completed tasks"
                >
                  [PURGE DONE]
                </button>
              )}
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="w-full bg-[#04080A] h-1.5 rounded overflow-hidden border border-[#00F0FF]/15">
            <div 
              className="h-full bg-gradient-to-r from-[#00FF9D] to-[#00F0FF] rounded transition-all duration-300 shadow-[0_0_8px_rgba(0,255,157,0.4)]"
              style={{ width: `${Math.max(progressPercent, tasks.length > 0 ? 3 : 0)}%` }}
            />
          </div>

          {/* Terminal Command Input */}
          <form onSubmit={handleAddTask} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 min-w-0 relative flex items-center">
                <span className="absolute left-2.5 text-[#00F0FF] pointer-events-none">&gt;</span>
                <input
                  ref={taskInputRef}
                  type="text"
                  placeholder="Enter directive / goal..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full min-h-[38px] pl-6 pr-12 rounded input-command-bar text-xs placeholder-[#486877] focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center absolute right-2 text-[10px] text-[#5A7E8D] bg-[#09151B] border border-[#00F0FF]/20 px-1 rounded pointer-events-none">
                  ↵
                </kbd>
              </div>

              {/* Note Toggle */}
              <button
                type="button"
                onClick={() => setShowNoteInput(!showNoteInput)}
                className={`min-h-[38px] px-2.5 rounded border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showNoteInput || newTaskNote
                    ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                    : 'bg-[#060D10] border-[#00F0FF]/20 text-[#6B8E9E] hover:text-white'
                }`}
                title="Add task note"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{newTaskNote ? '+NOTE*' : '+NOTE'}</span>
              </button>

              {/* Link Topic */}
              <button
                type="button"
                onClick={() => setShowTopicLink(!showTopicLink)}
                className={`min-h-[38px] px-2.5 rounded border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showTopicLink || selectedSubtopic
                    ? 'bg-[#00FF9D]/20 border-[#00FF9D] text-[#00FF9D]'
                    : 'bg-[#060D10] border-[#00F0FF]/20 text-[#6B8E9E] hover:text-white'
                }`}
                title="Link curriculum topic"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>

              {/* Add Button */}
              <button
                type="submit"
                className="min-h-[38px] px-3.5 rounded btn-cyber-primary text-xs font-black cursor-pointer shrink-0"
              >
                [+ADD]
              </button>
            </div>

            {/* Note Sub-input */}
            <AnimatePresence>
              {showNoteInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#00F0FF] font-bold shrink-0">// NOTE:</span>
                    <input
                      type="text"
                      placeholder="e.g. solve #121 on Striver sheet, revise edge cases..."
                      value={newTaskNote}
                      onChange={(e) => setNewTaskNote(e.target.value)}
                      className="flex-1 min-w-0 min-h-[32px] px-2 rounded input-command-bar text-[11px] focus:outline-none"
                      autoFocus
                    />
                    {newTaskNote && (
                      <button
                        type="button"
                        onClick={() => setNewTaskNote('')}
                        className="text-[10px] text-[#FF2A55] hover:underline px-1"
                      >
                        [CLR]
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Topic Link Sub-input */}
            <AnimatePresence>
              {showTopicLink && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#00FF9D] font-bold shrink-0">// TOPIC:</span>
                    <input
                      type="text"
                      placeholder="e.g. Python Variables, DSA Binary Search, FDE Glossary"
                      value={selectedSubtopic}
                      onChange={(e) => setSelectedSubtopic(e.target.value)}
                      className="flex-1 min-w-0 min-h-[32px] px-2 rounded input-command-bar text-[11px] text-[#00FF9D] focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* High-Density Task Items Queue */}
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-[#486877] text-xs border border-dashed border-[#00F0FF]/20 rounded bg-[#04080A]">
                <span>// QUEUE EMPTY. INPUT NEW DIRECTIVE ABOVE.</span>
              </div>
            ) : (
              tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between gap-2 p-2 rounded border transition-all ${
                    task.completed
                      ? 'bg-[#04080A]/60 border-[#00F0FF]/10 text-[#486877]'
                      : 'bg-[#060D10] border-[#00F0FF]/20 hover:border-[#00F0FF]/50 text-[#D4ECF4]'
                  }`}
                >
                  {/* Left: Terminal Checkbox & Directive Title */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={(e) => handleToggleTask(task, e)}
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs transition-all shrink-0 cursor-pointer ${
                        task.completed
                          ? 'bg-[#00FF9D] text-[#030708] shadow-[0_0_6px_rgba(0,255,157,0.4)]'
                          : 'border border-[#00F0FF]/40 hover:border-[#00FF9D] text-transparent'
                      }`}
                      aria-label={task.completed ? 'Mark pending' : 'Mark complete'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[12px] font-bold truncate ${task.completed ? 'line-through text-[#486877]' : 'text-white'}`}>
                          {task.title}
                        </span>
                        {task.subtopicTitle && (
                          <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-1 py-0.2 rounded border border-[#00F0FF]/20 shrink-0">
                            #{task.subtopicTitle}
                          </span>
                        )}
                      </div>

                      {/* Attached Note Preview */}
                      {task.note && task.note.trim() && (
                        <div className="text-[10px] text-[#84A5B5] bg-[#04080A] px-2 py-0.5 rounded border border-[#00F0FF]/10 truncate">
                          // {task.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTaskForNote(task);
                        setEditNoteText(task.note || '');
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                        task.note
                          ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                          : 'border-transparent text-[#486877] hover:text-[#D4ECF4]'
                      }`}
                      title="Edit note"
                    >
                      <FileText className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleMoveTask(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-[#486877] hover:text-[#00F0FF] disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleMoveTask(idx, 'down')}
                      disabled={idx === tasks.length - 1}
                      className="p-1 rounded text-[#486877] hover:text-[#00F0FF] disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteTask(task);
                      }}
                      className="p-1 rounded text-[#486877] hover:text-[#FF2A55] cursor-pointer"
                      title="Delete directive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ========================================================================
            RIGHT COLUMN (5 COLS): TELEMETRY GAUGES + DSA + QUICK ACTIONS
            ======================================================================== */}
        <div className="lg:col-span-5 space-y-3">
          {/* TILE 1: 4-CELL TELEMETRY INSTRUMENT CLUSTER */}
          <section className="rounded-lg hud-panel hud-corner p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#00F0FF]/15">
              <span className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#00FF9D]" />
                TELEMETRY CLUSTER [TODAY]
              </span>
              <span className="text-[9px] text-[#5A7E8D]">SYS_OK</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Studied */}
              <div 
                onClick={() => setShowStudyModal(true)}
                className="p-2.5 rounded bg-[#04080A] border border-[#00F0FF]/25 hover:border-[#00F0FF] cursor-pointer transition-all"
                title="Click to log study minutes"
              >
                <div className="flex items-center justify-between text-[10px] text-[#5A7E8D]">
                  <span>TIME_STUDIED</span>
                  <span className="text-[9px] text-[#00FF9D] font-bold px-1 bg-[#00FF9D]/10 rounded border border-[#00FF9D]/30">
                    +LOG
                  </span>
                </div>
                <div className="my-1">
                  <span className="text-2xl font-black text-[#00F0FF] tracking-tight block">
                    {formatMinutes(Math.max(dailyLog?.studyMinutes || 0, (dailyLog?.studyMinutes || 0) + activeLiveElapsedMins))}
                  </span>
                </div>
                <span className="text-[9px] text-[#486877] flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#00F0FF]" /> AUTO / MANUAL
                </span>
              </div>

              {/* Wasted */}
              <div 
                onClick={() => setShowWastedModal(true)}
                className="p-2.5 rounded bg-[#04080A] border border-[#FF2A55]/30 hover:border-[#FF2A55] cursor-pointer transition-all"
                title="Click to log wasted time"
              >
                <div className="flex items-center justify-between text-[10px] text-[#5A7E8D]">
                  <span>TIME_WASTED</span>
                  <span className="text-[9px] text-[#FF2A55] font-bold px-1 bg-[#FF2A55]/10 rounded border border-[#FF2A55]/30">
                    LOG
                  </span>
                </div>
                <div className="my-1">
                  <span className="text-2xl font-black text-[#FF2A55] tracking-tight block">
                    {formatMinutes(dailyLog?.wastedMinutes || 0)}
                  </span>
                </div>
                <span className="text-[9px] text-[#FF2A55]/70 flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" /> ACCOUNTABILITY
                </span>
              </div>

              {/* Questions */}
              <div 
                onClick={() => setShowQuestionModal(true)}
                className="p-2.5 rounded bg-[#04080A] border border-[#00FF9D]/25 hover:border-[#00FF9D] cursor-pointer transition-all"
              >
                <div className="text-[10px] text-[#5A7E8D]">QUESTIONS_DONE</div>
                <div className="my-1">
                  <span className="text-2xl font-black text-[#00FF9D] tracking-tight block">
                    {dailyLog?.questionsCount || 0}
                  </span>
                </div>
                <span className="text-[9px] text-[#486877]">DSA / SHEETS</span>
              </div>

              {/* Sleep */}
              <div 
                onClick={() => setShowSleepModal(true)}
                className="p-2.5 rounded bg-[#04080A] border border-[#00F0FF]/25 hover:border-[#00F0FF] cursor-pointer transition-all"
              >
                <div className="text-[10px] text-[#5A7E8D]">SLEEP_TELEMETRY</div>
                <div className="my-1">
                  <span className="text-2xl font-black text-white tracking-tight block">
                    {dailyLog?.sleepHours ? `${dailyLog.sleepHours}H` : '—'}
                  </span>
                </div>
                <span className="text-[9px] text-[#486877] flex items-center gap-1">
                  <Moon className="w-2.5 h-2.5 text-[#00F0FF]" />
                  {dailyLog?.sleepQuality ? `QUALITY: ${dailyLog.sleepQuality}/5` : 'AWAITING LOG'}
                </span>
              </div>
            </div>
          </section>

          {/* TILE 2: DSA & COMMUNICATION PROTOCOL */}
          <DailyDsaCommunicationWidget />

          {/* TILE 3: QUICK ACTION COMMANDS & PROTOCOL TRIGGER */}
          <section className="rounded-lg hud-panel hud-corner p-3 space-y-2">
            <span className="text-[10px] font-bold text-[#5A7E8D] uppercase tracking-wider block">
              // QUICK COMMAND EXECUTION
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onNavigateToTimer()}
                className="col-span-2 min-h-[38px] rounded btn-cyber-primary text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current stroke-[2]" />
                <span>START POMODORO TIMER</span>
              </button>

              <button
                onClick={() => setShowWastedModal(true)}
                className="min-h-[32px] rounded btn-cyber-ghost text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-[#FF2A55]" />
                <span>LOG WASTED</span>
              </button>

              <button
                onClick={() => setShowQuestionModal(true)}
                className="min-h-[32px] rounded btn-cyber-ghost text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#00FF9D] stroke-[3]" />
                <span>+1 QUESTION</span>
              </button>

              <button
                onClick={() => setShowSleepModal(true)}
                className="min-h-[32px] rounded btn-cyber-ghost text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Moon className="w-3 h-3 text-[#00F0FF]" />
                <span>LOG SLEEP</span>
              </button>

              <button
                onClick={() => setShowStudyModal(true)}
                className="min-h-[32px] rounded btn-cyber-ghost text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-[#00FF9D]" />
                <span>LOG STUDY</span>
              </button>
            </div>
          </section>

          {/* TILE 4: NEXT UP IN TIMELINE & ONE-LINE REFLECTION */}
          <section className="rounded-lg hud-panel hud-corner p-3 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#00F0FF]/15">
              <span className="text-[10px] font-bold text-[#00F0FF]">
                // NEXT PROTOCOL [{nextUpInfo.track}]
              </span>
              <button
                onClick={onNavigateToPlan}
                className="text-[10px] text-[#00FF9D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                PLAN <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="p-2 rounded bg-[#04080A] border border-[#00F0FF]/15 space-y-1.5">
              <span className="text-white font-bold text-xs block leading-tight">
                {nextUpInfo.topic}
              </span>
              <button
                onClick={() => onNavigateToTimer(nextUpInfo.topic)}
                className="w-full py-1.5 rounded btn-cyber-ghost hover:border-[#00FF9D] text-[10px] font-bold text-[#00FF9D] flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>EXECUTE FOCUS SESSION</span>
              </button>
            </div>

            {/* Daily Reflection Input */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-[#5A7E8D] block mb-1">
                // DAILY BREAKTHROUGH LOG:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Record single-line breakthrough..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={() => updateDailyNote(noteText)}
                  className="flex-1 min-w-0 min-h-[32px] px-2 rounded input-command-bar text-[11px] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateDailyNote(noteText)}
                  className="min-h-[32px] px-2.5 rounded btn-cyber-primary text-[10px] font-bold cursor-pointer shrink-0"
                >
                  SAVE
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Edit Task Note Modal */}
      <AnimatePresence>
        {editingTaskForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#080E11] border border-[#00F0FF] rounded-lg p-4 shadow-[0_0_30px_rgba(0,240,255,0.25)] space-y-3 font-mono"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#00F0FF]/20">
                <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00FF9D]" />
                  // DIRECTIVE NOTE ATTACHMENT
                </span>
                <button
                  onClick={() => setEditingTaskForNote(null)}
                  className="text-[#5A7E8D] hover:text-[#00F0FF] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#5A7E8D]">
                  TARGET: <span className="text-white font-bold">{editingTaskForNote.title}</span>
                </p>
                <textarea
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                  placeholder="Enter directive note..."
                  rows={3}
                  className="w-full p-2 rounded input-command-bar text-xs focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {editNoteText && (
                  <button
                    type="button"
                    onClick={() => setEditNoteText('')}
                    className="text-[10px] text-[#FF2A55] hover:underline cursor-pointer"
                  >
                    [CLEAR]
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingTaskForNote(null)}
                    className="px-3 py-1 rounded text-xs text-[#5A7E8D] hover:text-white cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditNote}
                    className="px-3.5 py-1 rounded btn-cyber-primary text-xs font-bold cursor-pointer"
                  >
                    SAVE NOTE
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
