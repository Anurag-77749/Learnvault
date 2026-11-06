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
  X
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

  // Live timer tracking for immediate real-time reflection
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

  // Dynamically calculate Day X of 1,460 starting from Nov 1, 2026
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

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Top Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2"
      >
        <div>
          {/* DAY X OF 1,460 Badge with Pulsing Gold Dot */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#110E0E] border border-[rgba(255,240,220,0.08)] text-[11px] font-mono text-[#E5A970] shadow-sm mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A970] animate-pulse" />
            <span>DAY {currentDayNumber} OF 1,460</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2EB] tracking-tight">
            Today's Mission
          </h1>
          <p className="text-xs sm:text-sm text-[#9E958E] font-sans mt-0.5">
            {formattedToday}
          </p>
        </div>

        {/* Right-Side Quote Capsule */}
        <div className="text-xs text-[#9E958E] bg-[#110E0E]/90 backdrop-blur-md border border-[rgba(255,240,220,0.08)] px-3.5 py-1.5 rounded-full flex items-center gap-2 self-start sm:self-auto font-sans shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5A970]" />
          <span>LearnVault: Your Knowledge. Your Progress. Your Future.</span>
        </div>
      </motion.div>

      {/* 1. TO-DO LIST (AT THE VERY TOP) */}
      <motion.section 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl card-obsidian shadow-xl relative overflow-hidden space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F2EB]">
              To-Do List
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#070606] text-[#E5A970] font-mono font-semibold border border-[rgba(255,240,220,0.08)] whitespace-nowrap">
              {completedCount}/{tasks.length} Done
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => clearCompletedTasks()}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#200A0E] border border-red-500/30 text-[#fca5a5] hover:bg-red-950/70 transition-colors cursor-pointer whitespace-nowrap"
                title="Clear completed tasks"
              >
                Clear Done
              </button>
            )}
          </div>
          <span className="text-xs text-[#9E958E] hidden sm:inline">
            Unfinished tasks automatically carry over
          </span>
        </div>

        {/* Raycast/Linear-Style Command Bar Input Form */}
        <form onSubmit={handleAddTask} className="space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex-1 min-w-0 relative flex items-center">
              <input
                ref={taskInputRef}
                type="text"
                placeholder="Add a new task in one tap..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full min-h-[42px] sm:min-h-[44px] px-3.5 sm:px-4 pr-14 rounded-xl input-command-bar text-xs sm:text-sm placeholder-[#9E958E]/50 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center absolute right-3 text-[10px] font-mono text-[#635B55] bg-[#141010] border border-[rgba(255,240,220,0.06)] px-1.5 py-0.5 rounded pointer-events-none">
                ↵
              </kbd>
            </div>

            {/* Note Toggle Button */}
            <button
              type="button"
              onClick={() => setShowNoteInput(!showNoteInput)}
              title="Add short note (optional)"
              className={`min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-medium shrink-0 cursor-pointer ${
                showNoteInput || newTaskNote
                  ? 'bg-[#181313] border-[rgba(212,175,55,0.45)] text-[#F6E6C2] shadow-sm'
                  : 'bg-[#0B0909] border-[rgba(255,240,220,0.07)] text-[#9E958E] hover:text-[#F5F2EB]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#E5A970]" />
              <span className="hidden md:inline">{newTaskNote ? 'Note Added' : '+ Note'}</span>
            </button>

            {/* Link Topic Button */}
            <button
              type="button"
              onClick={() => setShowTopicLink(!showTopicLink)}
              title="Link to topic/curriculum"
              className={`min-h-[42px] w-[38px] sm:min-h-[44px] sm:w-[42px] rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                showTopicLink || selectedSubtopic
                  ? 'bg-[#181313] border-[rgba(212,175,55,0.45)] text-[#E5A970]'
                  : 'bg-[#0B0909] border-[rgba(255,240,220,0.07)] text-[#9E958E] hover:text-[#F5F2EB]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>

            {/* Chamfered Champagne Gold Add Button */}
            <button
              type="submit"
              className="min-h-[42px] sm:min-h-[44px] px-3.5 sm:px-4 rounded-xl btn-champagne text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Add task"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add</span>
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
                  <span className="text-xs text-[#E5A970] font-medium flex items-center gap-1 shrink-0">
                    <FileText className="w-3.5 h-3.5" /> Note:
                  </span>
                  <input
                    type="text"
                    placeholder="Short note (e.g. solve #121 on Striver sheet, revise edge cases)..."
                    value={newTaskNote}
                    onChange={(e) => setNewTaskNote(e.target.value)}
                    className="flex-1 min-w-0 min-h-[36px] px-3 rounded-lg input-command-bar text-xs text-[#F5F2EB] placeholder-[#9E958E]/40 focus:outline-none"
                    autoFocus
                  />
                  {newTaskNote && (
                    <button
                      type="button"
                      onClick={() => setNewTaskNote('')}
                      className="text-xs text-[#9E958E] hover:text-[#E5A970] px-2 py-1 shrink-0"
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
                  <span className="text-xs text-[#9E958E] shrink-0">Link topic:</span>
                  <input
                    type="text"
                    placeholder="e.g. Python Variables, DSA Binary Search, FDE Glossary"
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    className="flex-1 min-w-0 min-h-[36px] px-3 rounded-lg input-command-bar text-xs text-[#F6E6C2] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Task Items List */}
        <div className="space-y-1.5">
          {tasks.length === 0 ? (
            <div className="text-center py-7 text-[#9E958E] text-xs font-sans border border-dashed border-[rgba(255,240,220,0.08)] rounded-xl bg-[#090808]">
              <p>No tasks yet today. Add your first goal above!</p>
            </div>
          ) : (
            tasks.map((task, idx) => (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-[#0A0808] border-[rgba(255,240,220,0.04)] text-[#635B55]'
                    : 'bg-[#0C0A0A] border-[rgba(255,240,220,0.06)] hover:border-[rgba(255,240,220,0.12)] hover:bg-[#141010] text-[#F5F2EB]'
                }`}
              >
                {/* Left/Top: Custom Rounded-Square Checkbox & Title */}
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleToggleTask(task, e)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 cursor-pointer ${
                      task.completed
                        ? 'bg-gradient-to-br from-[#F6E6C2] to-[#D4AF37] text-[#090808] shadow-sm'
                        : 'border border-[rgba(255,240,220,0.18)] hover:border-[#D4AF37]/60 bg-[#070606] text-transparent'
                    }`}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={`text-xs sm:text-[13px] font-medium break-words leading-snug ${task.completed ? 'line-through text-[#635B55]' : 'text-[#F5F2EB]'}`}>
                      {task.title}
                    </p>
                    {task.subtopicTitle && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#E5A970] font-mono break-all">
                        <BookMarked className="w-3 h-3 shrink-0" />
                        {task.subtopicTitle}
                      </span>
                    )}

                    {/* Short Note Display */}
                    {task.note && task.note.trim() && (
                      <div className="flex items-start gap-1.5 text-[11px] text-[#9E958E] bg-[#080707] px-2.5 py-1 rounded-lg border border-[rgba(255,240,220,0.05)] max-w-full">
                        <FileText className="w-3 h-3 text-[#E5A970] shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-sans break-words">{task.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right/Bottom Action Bar */}
                <div className="flex items-center justify-end gap-1 shrink-0 pt-1.5 sm:pt-0 border-t border-[rgba(255,240,220,0.04)] sm:border-t-0 pl-[34px] sm:pl-0 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingTaskForNote(task);
                      setEditNoteText(task.note || '');
                    }}
                    className={`min-h-[30px] px-2 rounded-lg border flex items-center gap-1 transition-colors text-[11px] cursor-pointer ${
                      task.note
                        ? 'bg-[#181313] border-[rgba(212,175,55,0.3)] text-[#F6E6C2]'
                        : 'border-transparent text-[#9E958E] hover:text-[#F5F2EB] hover:bg-white/5'
                    }`}
                    title={task.note ? 'Edit note' : 'Add note'}
                  >
                    <FileText className="w-3 h-3 text-[#E5A970]" />
                    <span className="sm:hidden">{task.note ? 'Edit' : '+ Note'}</span>
                  </button>

                  <div className="flex items-center bg-[#070606] rounded-md border border-[rgba(255,240,220,0.06)] p-0.5">
                    <button
                      onClick={() => handleMoveTask(idx, 'up')}
                      disabled={idx === 0}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#9E958E] hover:text-[#F5F2EB] hover:bg-white/5 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveTask(idx, 'down')}
                      disabled={idx === tasks.length - 1}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#9E958E] hover:text-[#F5F2EB] hover:bg-white/5 disabled:opacity-20 transition-colors cursor-pointer"
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
                    className="min-h-[30px] px-2 rounded-lg text-[#9E958E] hover:text-[#fca5a5] hover:bg-red-950/40 transition-colors cursor-pointer flex items-center justify-center"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:hidden ml-1">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Task Note Modal */}
        <AnimatePresence>
          {editingTaskForNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#110E0E] border border-[rgba(255,240,220,0.1)] rounded-2xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,240,220,0.06)]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#E5A970]" />
                    <h3 className="font-serif text-lg font-bold text-[#F5F2EB]">Task Note</h3>
                  </div>
                  <button
                    onClick={() => setEditingTaskForNote(null)}
                    className="text-[#9E958E] hover:text-[#F5F2EB] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-[#9E958E] font-sans">
                    Task: <span className="text-[#F5F2EB] font-medium">{editingTaskForNote.title}</span>
                  </p>
                  <textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    placeholder="Enter a short note (or leave empty to remove note)..."
                    rows={3}
                    className="w-full p-3 rounded-xl input-command-bar text-xs text-[#F5F2EB] placeholder-[#9E958E]/40 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {editNoteText && (
                    <button
                      type="button"
                      onClick={() => setEditNoteText('')}
                      className="text-xs text-[#fca5a5] hover:underline font-medium cursor-pointer"
                    >
                      Clear Note
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setEditingTaskForNote(null)}
                      className="px-3.5 py-1.5 rounded-lg text-xs text-[#9E958E] hover:text-[#F5F2EB] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditNote}
                      className="px-4 py-1.5 rounded-lg btn-champagne text-xs font-bold cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Mobile Inline Quick DSA & Communication Widget */}
      <div className="md:hidden">
        <DailyDsaCommunicationWidget />
      </div>

      {/* 2. TODAY SO FAR - 5-CARD PRECISION GAUGE BENTO ROW */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#F5F2EB]">
            Today So Far
          </h2>
          <span className="text-[10px] font-mono text-[#E5A970] font-semibold uppercase tracking-wider">
            Daily Progress Tracker
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Card 1: Studied */}
          <div 
            onClick={() => setShowStudyModal(true)}
            className="p-3.5 rounded-xl card-obsidian card-obsidian-hover flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            title="Click to manually log study time"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#9E958E] font-medium">
                Time Studied
              </span>
              <span className="text-[9px] font-mono text-[#E5A970] font-bold px-1.5 py-0.5 rounded bg-[#070606] border border-[rgba(229,169,112,0.25)] group-hover:border-[#E5A970]">
                +Log
              </span>
            </div>
            <div className="my-2.5">
              <span className="font-mono tabular-nums text-3xl font-bold text-champagne block leading-none">
                {formatMinutes(Math.max(dailyLog?.studyMinutes || 0, (dailyLog?.studyMinutes || 0) + activeLiveElapsedMins))}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#9E958E] mb-2 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#E5A970]" /> Auto / Manual
              </span>
            </div>
            {/* Micro 2px Progress Bar */}
            <div className="h-[2px] w-full rounded-full bg-[#0A0808] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#E5A970] to-[#D4AF37] rounded-full"
                style={{ width: `${Math.min(100, Math.max(8, ((dailyLog?.studyMinutes || 0) / 240) * 100))}%` }}
              />
            </div>
          </div>

          {/* Card 2: Wasted */}
          <div className="p-3.5 rounded-xl card-obsidian card-obsidian-hover flex flex-col justify-between relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#9E958E] font-medium">
              Time Wasted
            </span>
            <div className="my-2.5">
              <span className="font-mono tabular-nums text-3xl font-bold text-[#9E958E] block leading-none">
                {formatMinutes(dailyLog?.wastedMinutes || 0)}
              </span>
            </div>
            <div className="text-[10px] text-[#635B55] mb-2 font-mono">
              Accountability
            </div>
            {/* Micro 2px Indicator */}
            <div className="h-[2px] w-full rounded-full bg-[#0A0808] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-950 to-red-500/60 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, ((dailyLog?.wastedMinutes || 0) / 120) * 100))}%` }}
              />
            </div>
          </div>

          {/* Card 3: Questions Done */}
          <div className="p-3.5 rounded-xl card-obsidian card-obsidian-hover flex flex-col justify-between relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#9E958E] font-medium">
              Questions Done
            </span>
            <div className="my-2.5">
              <span className="font-mono tabular-nums text-3xl font-bold text-champagne block leading-none">
                {dailyLog?.questionsCount || 0}
              </span>
            </div>
            <div className="text-[10px] text-[#9E958E] mb-2 font-mono">
              DSA / Sheets
            </div>
            {/* Micro 2px Indicator */}
            <div className="h-[2px] w-full rounded-full bg-[#0A0808] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#E5A970] to-[#D4AF37] rounded-full"
                style={{ width: `${Math.min(100, Math.max(6, ((dailyLog?.questionsCount || 0) / 5) * 100))}%` }}
              />
            </div>
          </div>

          {/* Card 4: Topics Learned */}
          <div className="p-3.5 rounded-xl card-obsidian card-obsidian-hover flex flex-col justify-between relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#9E958E] font-medium">
              Topics Learned
            </span>
            <div className="my-2.5">
              <span className="font-mono tabular-nums text-3xl font-bold text-[#F5F2EB] block leading-none">
                {(dailyLog?.topicsLearned || []).length}
              </span>
            </div>
            <div className="text-[10px] text-[#635B55] mb-2 font-mono">
              Curriculum items
            </div>
            {/* Micro 2px Indicator */}
            <div className="h-[2px] w-full rounded-full bg-[#0A0808] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#9E958E] to-[#F5F2EB] rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, ((dailyLog?.topicsLearned || []).length / 3) * 100))}%` }}
              />
            </div>
          </div>

          {/* Card 5: Sleep */}
          <div className="p-3.5 rounded-xl card-obsidian card-obsidian-hover flex flex-col justify-between col-span-2 sm:col-span-1 relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#9E958E] font-medium">
              Sleep Last Night
            </span>
            <div className="my-2.5">
              <span className="font-mono tabular-nums text-3xl font-bold text-champagne block leading-none">
                {dailyLog?.sleepHours ? `${dailyLog.sleepHours}h` : '—'}
              </span>
            </div>
            <div className="text-[10px] text-[#9E958E] flex items-center gap-1 mb-2 font-mono">
              <Moon className="w-3 h-3 text-[#E5A970]" />
              {dailyLog?.sleepQuality ? `Quality: ${dailyLog.sleepQuality}/5` : 'Not logged'}
            </div>
            {/* Micro 2px Indicator */}
            <div className="h-[2px] w-full rounded-full bg-[#0A0808] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F6E6C2] rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, ((dailyLog?.sleepHours || 0) / 8) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. QUICK ACTION BUTTONS */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2.5"
      >
        <h2 className="font-serif text-2xl font-bold text-[#F5F2EB]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Hero Action: Start Pomodoro */}
          <button
            onClick={() => onNavigateToTimer()}
            className="min-h-[44px] px-4 rounded-xl btn-champagne text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Start Pomodoro</span>
          </button>

          {/* Secondary Actions: Dark Anodized Glass Pills */}
          <button
            onClick={() => setShowWastedModal(true)}
            className="min-h-[44px] px-4 rounded-xl btn-anodized text-xs font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-[#E5A970]" />
            <span>Log Wasted Time</span>
          </button>

          <button
            onClick={() => setShowQuestionModal(true)}
            className="min-h-[44px] px-4 rounded-xl btn-anodized text-xs font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5A970] stroke-[2.5]" />
            <span>+1 Question</span>
          </button>

          <button
            onClick={() => setShowSleepModal(true)}
            className="min-h-[44px] px-4 rounded-xl btn-anodized text-xs font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Moon className="w-3.5 h-3.5 text-[#E5A970]" />
            <span>Log Sleep</span>
          </button>
        </div>
      </motion.section>

      {/* 4. "NEXT UP" SECTION (FROM PLAN) */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl card-obsidian shadow-xl relative overflow-hidden space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E5A970] shadow-sm shadow-[#E5A970]" />
            <h2 className="font-serif text-2xl font-bold text-[#F5F2EB]">
              Next Up in Timeline
            </h2>
          </div>
          <button
            onClick={onNavigateToPlan}
            className="text-xs text-[#E5A970] hover:text-[#F6E6C2] flex items-center gap-1 font-semibold min-h-[40px] px-2 cursor-pointer transition-colors"
          >
            View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#090808] border border-[rgba(255,240,220,0.06)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#E5A970] font-semibold">
              {nextUpInfo.track}
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#110E0E] text-[#9E958E] border border-[rgba(255,240,220,0.06)] self-start sm:self-auto">
              {nextUpInfo.presetDates}
            </span>
          </div>

          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F2EB] mb-1">
              {nextUpInfo.topic}
            </h3>
            <p className="text-xs sm:text-sm text-[#9E958E] font-sans leading-relaxed">
              {nextUpInfo.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onNavigateToTimer(nextUpInfo.topic)}
              className="min-h-[40px] px-4 rounded-lg btn-champagne text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              Start Focus Session
            </button>
            <button
              onClick={onNavigateToLearn}
              className="min-h-[40px] px-4 rounded-lg btn-anodized text-xs font-medium cursor-pointer"
            >
              Open in Learn Curriculum
            </button>
          </div>
        </div>
      </motion.section>

      {/* 5. Daily Reflection Note */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl card-obsidian shadow-lg space-y-2.5"
      >
        <label className="block text-[11px] font-mono font-semibold text-[#9E958E] uppercase tracking-wider">
          One-Line Reflection For Today
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. Mastered Delta vs UAT; completed 2 two-pointer questions."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => updateDailyNote(noteText)}
            className="flex-1 min-w-0 min-h-[42px] px-4 rounded-xl input-command-bar text-xs sm:text-sm placeholder-[#9E958E]/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => updateDailyNote(noteText)}
            className="min-h-[42px] px-4 sm:px-5 rounded-xl btn-champagne text-xs font-bold cursor-pointer shrink-0"
          >
            Save Note
          </button>
        </div>
      </motion.section>

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
