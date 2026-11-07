import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Check, 
  Target, 
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

  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];
  let totalSub = 0;
  let doneSub = 0;
  curriculumTopics.forEach((t) => {
    totalSub += t.subtopics?.length || 0;
    doneSub += t.subtopics?.filter((s) => s.completed).length || 0;
  });
  const overallPercent = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;


  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Top Mission Header */}
      <motion.div 
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b-2 border-black/10 dark:border-white/10"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono">
            <span className="text-[11px] font-black uppercase text-black bg-[#84CC16] border-2 border-black px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_#000000]">
              DAY {currentDayNumber} OF 1,460
            </span>
            <span className="text-xs text-gray-500 font-bold">•</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{formattedToday}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight font-display">
            Today's Mission
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="px-3 py-1 rounded-md border-2 border-black bg-white dark:bg-[#080808] dark:border-white/20 font-bold shadow-[2px_2px_0px_#84CC16]">
            TRACK 0: FORWARD DEPLOYED
          </span>
        </div>
      </motion.div>

      
      {/* Neo-Brutalist 2-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Main Focus: Tasks, Telemetry Bento, Quick Actions) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* 1. TO-DO LIST (AT THE VERY TOP) */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3.5 sm:p-6 rounded-3xl card-maroon shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
              To-Do List
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-[#84CC16] font-semibold border border-[#84CC16]/35 whitespace-nowrap">
              {completedCount}/{tasks.length} Done
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => clearCompletedTasks()}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer whitespace-nowrap"
                title="Clear completed tasks"
              >
                Clear Done
              </button>
            )}
          </div>
          <span className="text-xs text-[#B8B0AA] hidden sm:inline">
            Unfinished tasks automatically carry over
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddTask} className="mb-4 space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              ref={taskInputRef}
              type="text"
              placeholder="Add a new task in one tap..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-0 min-h-[44px] sm:min-h-[46px] px-3 sm:px-4 rounded-xl bg-[#000000] border border-[#1a1a1a] focus:border-[#84CC16] text-white placeholder-[#B8B0AA]/50 text-xs sm:text-sm focus:outline-none transition-colors"
            />

            {/* Note Toggle Button */}
            <button
              type="button"
              onClick={() => setShowNoteInput(!showNoteInput)}
              title="Add short note (optional)"
              className={`min-h-[44px] sm:min-h-[46px] px-2.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors text-xs font-semibold shrink-0 cursor-pointer ${
                showNoteInput || newTaskNote
                  ? 'bg-[#080808] border-[#84CC16] text-shiny-gold shadow-sm'
                  : 'bg-[#000000] border-[#1a1a1a] text-[#B8B0AA] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#84CC16]" />
              <span className="hidden md:inline">{newTaskNote ? 'Note Added' : '+ Note'}</span>
            </button>

            {/* Link Topic Button */}
            <button
              type="button"
              onClick={() => setShowTopicLink(!showTopicLink)}
              title="Link to topic/curriculum"
              className={`min-h-[44px] w-[40px] sm:min-h-[46px] sm:w-[46px] rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                showTopicLink || selectedSubtopic
                  ? 'bg-[#080808] border-[#84CC16] text-[#84CC16]'
                  : 'bg-[#000000] border-[#1a1a1a] text-[#B8B0AA] hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
            </button>

            {/* Add Button */}
            <button
              type="submit"
              className="min-h-[44px] sm:min-h-[46px] px-3.5 sm:px-5 rounded-xl btn-shiny-gold text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#84CC16]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              title="Add task"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
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
                  <span className="text-xs text-[#84CC16] font-semibold flex items-center gap-1 shrink-0">
                    <FileText className="w-3.5 h-3.5" /> Note:
                  </span>
                  <input
                    type="text"
                    placeholder="Short note (e.g. solve #121 on Striver sheet, revise edge cases, 20+ questions)..."
                    value={newTaskNote}
                    onChange={(e) => setNewTaskNote(e.target.value)}
                    className="flex-1 min-w-0 min-h-[38px] px-3.5 rounded-lg bg-black border border-[#84CC16]/35 text-xs text-white placeholder-[#B8B0AA]/40 focus:outline-none focus:border-[#84CC16]"
                    autoFocus
                  />
                  {newTaskNote && (
                    <button
                      type="button"
                      onClick={() => setNewTaskNote('')}
                      className="text-xs text-[#B8B0AA] hover:text-[#84CC16] px-2 py-1 shrink-0"
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
                  <span className="text-xs text-[#A09D95] shrink-0">Link topic:</span>
                  <input
                    type="text"
                    placeholder="e.g. Python Variables, DSA Binary Search, FDE Glossary"
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    className="flex-1 min-w-0 min-h-[38px] px-3 rounded-lg bg-black border border-[#84CC16]/30 text-xs text-[#84CC16] focus:outline-none focus:border-[#84CC16]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Task Items List */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-[#A09D95] text-sm font-sans border border-dashed border-[#84CC16]/20 rounded-2xl bg-black/40">
              <p>No tasks yet today. Add your first goal above!</p>
            </div>
          ) : (
            tasks.map((task, idx) => (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-black/40 border-[#84CC16]/15 text-[#A09D95]'
                    : 'bg-black border-[#84CC16]/30 text-[#F9F6EE] hover:border-[#84CC16]/60'
                }`}
              >
                {/* Left/Top: Checkbox & Title + Short Note */}
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleToggleTask(task, e)}
                    className={`min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] rounded-xl flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 cursor-pointer ${
                      task.completed
                        ? 'bg-[#84CC16] text-black shadow-sm'
                        : 'border-2 border-[#84CC16]/40 hover:border-[#84CC16] bg-transparent text-transparent'
                    }`}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={`text-sm font-medium break-words ${task.completed ? 'line-through text-[#A09D95]' : 'text-[#F9F6EE]'}`}>
                      {task.title}
                    </p>
                    {task.subtopicTitle && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#84CC16] font-semibold break-all">
                        <BookMarked className="w-3 h-3 shrink-0" />
                        {task.subtopicTitle}
                      </span>
                    )}

                    {/* Short Note: DISPLAY CLEARLY IF PRESENT */}
                    {task.note && task.note.trim() && (
                      <div className="flex items-start gap-2 text-xs text-[#E5E0DC] bg-[#080808] px-3 py-1.5 rounded-xl border border-[#1a1a1a] max-w-full">
                        <FileText className="w-3.5 h-3.5 text-shiny-gold shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-sans break-words">{task.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right/Bottom Action Bar: Note Edit, Reorder & Delete */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 pl-[48px] sm:pl-0">
                  <button
                    onClick={() => {
                      setEditingTaskForNote(task);
                      setEditNoteText(task.note || '');
                    }}
                    className={`min-h-[34px] px-2 rounded-lg border flex items-center gap-1 transition-colors text-xs cursor-pointer ${
                      task.note
                        ? 'bg-[#080808] border-[#84CC16]/40 text-shiny-gold hover:text-[#A3E635]'
                        : 'border-transparent text-[#B8B0AA]/60 hover:text-white hover:bg-white/5'
                    }`}
                    title={task.note ? 'Edit note' : 'Add note'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[11px] sm:hidden">{task.note ? 'Edit Note' : '+ Note'}</span>
                  </button>

                  <div className="flex items-center bg-[#080808]/60 sm:bg-transparent rounded-lg border border-[#1a1a1a]/60 sm:border-0 p-0.5 sm:p-0">
                    <button
                      onClick={() => handleMoveTask(idx, 'up')}
                      disabled={idx === 0}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-[#A09D95] hover:text-[#84CC16] hover:bg-white/5 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveTask(idx, 'down')}
                      disabled={idx === tasks.length - 1}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-[#A09D95] hover:text-[#84CC16] hover:bg-white/5 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteTask(task);
                    }}
                    className="min-h-[34px] px-2.5 rounded-lg bg-red-950/20 sm:bg-transparent border border-red-500/20 sm:border-transparent flex items-center justify-center text-red-300 hover:text-red-200 hover:bg-red-950/60 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] sm:hidden font-medium ml-1">Delete</span>
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
                className="w-full max-w-md bg-[#080808] border border-[#84CC16]/40 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-shiny-gold" />
                    <h3 className="font-serif text-lg font-bold text-white">Task Note</h3>
                  </div>
                  <button
                    onClick={() => setEditingTaskForNote(null)}
                    className="text-[#B8B0AA] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-[#B8B0AA] font-sans">
                    Task: <span className="text-white font-medium">{editingTaskForNote.title}</span>
                  </p>
                  <textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    placeholder="Enter a short note (or leave empty to remove note)..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-black border border-[#1a1a1a] focus:border-[#84CC16] text-xs text-white placeholder-[#B8B0AA]/40 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {editNoteText && (
                    <button
                      type="button"
                      onClick={() => setEditNoteText('')}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Clear Note
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setEditingTaskForNote(null)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-[#B8B0AA] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditNote}
                      className="px-4 py-1.5 rounded-xl btn-shiny-gold text-xs font-bold"
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
          {/* 2. TODAY SO FAR CARDS */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-white">
            Today So Far
          </h2>
          <span className="text-xs text-shiny-gold font-semibold uppercase tracking-wider">
            Daily Progress Tracker
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Studied */}
          <div 
            onClick={() => setShowStudyModal(true)}
            className="p-4 rounded-2xl card-maroon-gold hover:scale-[1.02] flex flex-col justify-between cursor-pointer transition-all"
            title="Click to manually log study time"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#A3E635] font-bold">
                Time Studied
              </span>
              <span className="text-[10px] text-shiny-gold font-bold px-1.5 py-0.5 rounded bg-black/60 border border-[#84CC16]/40 hover:underline">
                +Log
              </span>
            </div>
            <div className="mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {formatMinutes(Math.max(dailyLog?.studyMinutes || 0, (dailyLog?.studyMinutes || 0) + activeLiveElapsedMins))}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-shiny-gold font-medium">
              <Clock className="w-3.5 h-3.5 text-[#A3E635]" /> Auto / Manual
            </div>
          </div>

          {/* Wasted */}
          <div className="p-4 rounded-2xl card-maroon-gold flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#B8B0AA] font-semibold">
              Time Wasted
            </span>
            <div className="mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B8B0AA]">
                {formatMinutes(dailyLog?.wastedMinutes || 0)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#B8B0AA]/80">
              Accountability
            </div>
          </div>

          {/* Questions */}
          <div className="p-4 rounded-2xl card-maroon-gold hover:scale-[1.02] flex flex-col justify-between transition-all">
            <span className="text-[11px] uppercase tracking-wider text-[#A3E635] font-bold">
              Questions Done
            </span>
            <div className="mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-shiny-gold">
                {dailyLog?.questionsCount || 0}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#A3E635]/80 font-medium">
              DSA / Sheets
            </div>
          </div>

          {/* Topics learned */}
          <div className="p-4 rounded-2xl card-maroon-gold flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#B8B0AA] font-semibold">
              Topics Learned
            </span>
            <div className="mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {(dailyLog?.topicsLearned || []).length}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#B8B0AA]">
              Curriculum items
            </div>
          </div>

          {/* Sleep */}
          <div className="p-4 rounded-2xl card-maroon-gold flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] uppercase tracking-wider text-[#A3E635] font-bold">
              Sleep Last Night
            </span>
            <div className="mt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-shiny-gold">
                {dailyLog?.sleepHours ? `${dailyLog.sleepHours}h` : '—'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#B8B0AA] flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-[#A3E635]" />
              {dailyLog?.sleepQuality ? `Quality: ${dailyLog.sleepQuality}/5` : 'Not logged'}
            </div>
          </div>
        </div>
      </motion.section>
          {/* 3. QUICK ACTION BUTTONS */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h2 className="font-serif text-2xl font-bold text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateToTimer()}
            className="min-h-[48px] px-4 rounded-2xl btn-shiny-gold text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xl"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Start Pomodoro</span>
          </button>

          <button
            onClick={() => setShowWastedModal(true)}
            className="min-h-[48px] px-4 rounded-2xl card-maroon border-gold-shine hover:border-[#84CC16] text-white hover:text-shiny-gold text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Clock className="w-4 h-4 text-[#A3E635]" />
            <span>Log Wasted Time</span>
          </button>

          <button
            onClick={() => setShowQuestionModal(true)}
            className="min-h-[48px] px-4 rounded-2xl card-maroon border-gold-shine hover:border-[#84CC16] text-white hover:text-shiny-gold text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#A3E635] stroke-[2.5]" />
            <span>+1 Question</span>
          </button>

          <button
            onClick={() => setShowSleepModal(true)}
            className="min-h-[48px] px-4 rounded-2xl card-maroon border-gold-shine hover:border-[#84CC16] text-white hover:text-shiny-gold text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Moon className="w-4 h-4 text-[#A3E635]" />
            <span>Log Sleep</span>
          </button>
        </div>
      </motion.section>
        </div>

        {/* Right Column (Tracking: DSA & Communication, Overall Progress, Timeline, Notes) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Daily DSA & Communication */}
      <div>
        <DailyDsaCommunicationWidget />
      </div>
          
        {/* Overall Curriculum Progress Card */}
        <div 
          onClick={onNavigateToPlan}
          className="p-4 rounded-lg card-maroon-gold cursor-pointer transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          title="View Roadmap & Plan"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5 text-black dark:text-white uppercase font-mono">
              <Target className="w-4 h-4 text-[#84CC16]" />
              Overall Progress
            </span>
            <span className="text-[#84CC16] font-black text-sm tabular-nums">{overallPercent}%</span>
          </div>
          <div className="w-full bg-black h-3 rounded-md overflow-hidden border-2 border-black">
            <div 
              className="bg-[#84CC16] h-full transition-all duration-500"
              style={{ width: `${Math.max(overallPercent, 2)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-[#A3A3A3] mt-2.5 font-mono font-bold">
            <span>{doneSub}/{totalSub} TOPICS COMPLETED</span>
            <span className="text-[#84CC16] hover:underline flex items-center gap-1">VIEW ROADMAP &rarr;</span>
          </div>
        </div>

          {/* 4. "NEXT UP" SECTION (FROM PLAN) */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl card-maroon-gold shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] shadow-md shadow-[#84CC16]" />
            <h2 className="font-serif text-2xl font-bold text-white">
              Next Up in Timeline
            </h2>
          </div>
          <button
            onClick={onNavigateToPlan}
            className="text-xs text-shiny-gold hover:underline flex items-center gap-1 font-bold min-h-[44px] px-2"
          >
            View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#000000] border border-[#1a1a1a]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-shiny-gold font-bold">
              {nextUpInfo.track}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#080808] text-[#A3E635] border border-[#1a1a1a] font-semibold self-start sm:self-auto">
              {nextUpInfo.presetDates}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
            {nextUpInfo.topic}
          </h3>
          <p className="text-xs sm:text-sm text-[#B8B0AA] font-sans mb-4 leading-relaxed">
            {nextUpInfo.desc}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTimer(nextUpInfo.topic)}
              className="min-h-[44px] px-4 rounded-xl btn-shiny-gold text-xs font-bold flex items-center gap-2 transition-transform shadow-md"
            >
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              Start Focus Session
            </button>
            <button
              onClick={onNavigateToLearn}
              className="min-h-[44px] px-4 rounded-xl bg-[#000000] hover:bg-[#080808] text-[#B8B0AA] hover:text-shiny-gold border border-[#1a1a1a] hover:border-[#84CC16] text-xs font-medium transition-colors"
            >
              Open in Learn Curriculum
            </button>
          </div>
        </div>
      </motion.section>
          {/* Daily Reflection Note */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl card-maroon-gold"
      >
        <label className="block text-xs font-bold text-shiny-gold mb-2 uppercase tracking-wider">
          One-Line Reflection For Today
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. Mastered Delta vs UAT; completed 2 two-pointer questions."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => updateDailyNote(noteText)}
            className="flex-1 min-w-0 min-h-[44px] px-4 rounded-xl bg-black border border-[#84CC16]/35 text-sm text-white placeholder-[#B8B0AA]/50 focus:outline-none focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]"
          />
          <button
            type="button"
            onClick={() => updateDailyNote(noteText)}
            className="min-h-[44px] px-5 rounded-xl btn-shiny-gold text-xs font-bold transition-all shadow-md"
          >
            Save Note
          </button>
        </div>
      </motion.section>
        </div>
      </div>

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
