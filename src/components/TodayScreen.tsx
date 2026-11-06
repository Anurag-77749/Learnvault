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
  Link2, 
  FileText, 
  X,
  Play,
  ArrowRight,
  Flame,
  Activity,
  Layers,
  Sparkles
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

  const handleQuickLogSleep = async (hours: number) => {
    const bedtimeMap: Record<number, string> = { 6: '01:00', 7: '00:00', 8: '23:00' };
    await logSleep(bedtimeMap[hours] || '23:30', '07:00', 4);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const studiedMins = Math.max(dailyLog?.studyMinutes || 0, (dailyLog?.studyMinutes || 0) + activeLiveElapsedMins);
  const wastedMins = dailyLog?.wastedMinutes || 0;
  const totalTrackedMins = studiedMins + wastedMins;
  const studyRatioPercent = totalTrackedMins > 0 ? Math.round((studiedMins / totalTrackedMins) * 100) : 100;

  const nextUpInfo = {
    track: 'Track 0: Introduction',
    topic: 'FDE Glossary & Field Engineering Roles',
    desc: 'Master Delta, UAT, Last-Mile Integration, Day 2 Operations, and FDE Tiers.',
    presetDates: 'Nov 1 – Nov 3, 2026',
  };

  return (
    <div className="space-y-6 pb-28 max-w-[1500px] mx-auto select-none font-sans">
      {/* ==========================================================================
          FULL-VIEWPORT ASYMMETRIC BENTO GRID (12 COLUMNS)
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================
            COLUMN 1 (LEFT 4 COLS): THE "COMMAND & EXECUTION" STACK
            ======================================================================== */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1A. MISSION CONTROL HEADER CARD (CERAMIC WHITE) */}
          <div className="bento-ceramic p-6 space-y-4 relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FF4F00]" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#68645E] font-bold">
                  MISSION CONTROL
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111110] tracking-tight leading-tight">
                Today's Blueprint
              </h1>
              <p className="text-xs text-[#68645E] mt-1 font-sans">
                Daily execution matrix for forward deployed engineering mastery.
              </p>
            </div>

            {/* Embedded Interactive Quick-Action Dock */}
            <div className="pt-2 border-t border-[#E6E3DC]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A39E93] block mb-2 font-semibold">
                QUICK-ACTION DOCK
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSleepModal(true)}
                  className="px-3 py-1.5 rounded-full btn-tactile text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Moon className="w-3.5 h-3.5 text-[#FF4F00]" />
                  <span>+ Log Sleep</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWastedModal(true)}
                  className="px-3 py-1.5 rounded-full btn-tactile text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#68645E]" />
                  <span>+ Log Wasted</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQuestionModal(true)}
                  className="px-3 py-1.5 rounded-full btn-tactile text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
                  <span>+1 Question</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1B. ZERO-FRICTION TASK ENGINE CARD (CERAMIC WHITE) */}
          <div className="bento-ceramic p-6 space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl text-[#111110] tracking-tight">
                  Task Engine
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F7F5F0] border border-[#E6E3DC] text-[#111110]">
                  {completedCount}/{tasks.length}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase text-[#A39E93] tracking-wider font-semibold">
                AUTO-CARRYOVER ACTIVE
              </span>
            </div>

            {/* Quick Add Command Bar */}
            <form onSubmit={handleAddTask} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  ref={taskInputRef}
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Type a task and press Enter..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl input-command-bar text-xs text-[#111110] placeholder-[#A39E93] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className={`min-h-[44px] px-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    showNoteInput || newTaskNote
                      ? 'bg-[#111110] text-white border-[#111110]'
                      : 'bg-[#F7F5F0] text-[#68645E] border-[#E6E3DC] hover:text-[#111110] hover:bg-white'
                  }`}
                  title="Attach Note"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-mono">Note</span>
                </button>

                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-xl btn-orange text-xs font-bold cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Note input slide down */}
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
                      placeholder="Attach context note to directive..."
                      className="w-full px-3.5 py-2 rounded-xl input-command-bar text-xs text-[#111110] placeholder-[#A39E93] focus:outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Task Item List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-[#A39E93] text-xs font-mono border-2 border-dashed border-[#E6E3DC] rounded-xl bg-[#F7F5F0]">
                  NO ACTIVE DIRECTIVES. TYPE ABOVE TO ENGAGE.
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`group relative p-3 rounded-xl border transition-all duration-150 flex items-start gap-2.5 ${
                      task.completed
                        ? 'bg-[#FAF9F6] border-[#E6E3DC] opacity-60'
                        : 'bg-white border-[#E6E3DC] hover:border-[#D8D4CC] shadow-sm'
                    }`}
                  >
                    {/* Reorder Chevrons */}
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveTask(idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 text-[#A39E93] hover:text-[#111110] disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(idx, 'down')}
                        disabled={idx === tasks.length - 1}
                        className="p-0.5 text-[#A39E93] hover:text-[#111110] disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Circular Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task, e)}
                      className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm'
                          : 'border-[#D8D4CC] bg-white hover:border-[#FF4F00]'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    {/* Task Title & Context Note */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${task.completed ? 'line-through text-[#A39E93]' : 'text-[#111110]'}`}>
                        {task.title}
                      </p>
                      {task.note && (
                        <p className="text-[11px] text-[#68645E] truncate font-mono">
                          // {task.note}
                        </p>
                      )}
                    </div>

                    {/* Actions: Edit note + Delete */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTaskForNote(task);
                          setEditNoteText(task.note || '');
                        }}
                        className="p-1 text-[#A39E93] hover:text-[#111110] transition-colors cursor-pointer"
                        title="Edit Note"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => task.id && deleteTask(task.id)}
                        className="p-1 text-[#A39E93] hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Task"
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
                className="w-full py-2 rounded-lg text-xs font-mono text-[#A39E93] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-center"
              >
                CLEAR ALL COMPLETED ({completedCount})
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================
            COLUMN 2 (CENTER 5 COLS): HIGH-CONTRAST HERO & METRIC ORBIT
            ======================================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* 2A. HERO DUAL-DIAL CARD (HIGH-CONTRAST MATTE CARBON) */}
          <div className="bento-carbon p-6 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#A39E93] uppercase font-bold">
                // TEMPORAL MOMENTUM CORE
              </span>
              <button
                type="button"
                onClick={() => setShowStudyModal(true)}
                className="px-3 py-1 rounded-full btn-orange text-white text-[11px] font-mono font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                + LOG STUDY
              </button>
            </div>

            {/* Split Dual Gauge Stats */}
            <div className="grid grid-cols-2 gap-6 items-baseline">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A39E93] block font-semibold">
                  TIME STUDIED
                </span>
                <div className="font-mono tabular-nums font-black text-4xl sm:text-5xl text-white tracking-tight leading-none mt-2">
                  {formatMinutes(studiedMins)}
                </div>
                <span className="text-[10px] font-mono text-[#10B981] mt-2 block font-bold">
                  FOCUS RATIO: {studyRatioPercent}%
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A39E93] block font-semibold">
                  TIME WASTED
                </span>
                <div className="font-mono tabular-nums font-black text-4xl sm:text-5xl text-[#A39E93] tracking-tight leading-none mt-2">
                  {formatMinutes(wastedMins)}
                </div>
                <span className="text-[10px] font-mono text-rose-400 mt-2 block font-bold">
                  ACCOUNTABILITY
                </span>
              </div>
            </div>

            {/* Split Visual Momentum Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                <div 
                  className="h-full bg-[#FF4F00] transition-all duration-500 shadow-sm"
                  style={{ width: `${studyRatioPercent}%` }}
                />
                <div 
                  className="h-full bg-rose-500/80 transition-all duration-500"
                  style={{ width: `${100 - studyRatioPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A39E93]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF4F00]" /> Productive Flow
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Wasted Drift
                </span>
              </div>
            </div>
          </div>

          {/* 2B. 3 SUB-TILES ROW (CERAMIC WHITE) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Tile 1: Questions */}
            <div className="bento-ceramic p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono uppercase text-[#68645E] font-bold">
                  QUESTIONS
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(true)}
                  className="text-[#68645E] hover:text-[#111110] cursor-pointer"
                  title="Add Question"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="my-2">
                <span className="font-mono tabular-nums font-black text-3xl sm:text-4xl text-[#111110] tracking-tight block">
                  {dailyLog?.questionsCount || 0}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#68645E]">
                DSA / Sheets
              </span>
            </div>

            {/* Tile 2: Topics Learned */}
            <div className="bento-ceramic p-4 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-[#68645E] font-bold">
                TOPICS
              </span>
              <div className="my-2 flex items-baseline gap-1">
                <span className="font-mono tabular-nums font-black text-3xl sm:text-4xl text-[#111110] tracking-tight block">
                  {(dailyLog?.topicsLearned || []).length}
                </span>
                <span className="text-[10px] font-mono text-[#68645E]">TRACKED</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] font-bold">
                Curriculum Items
              </span>
            </div>

            {/* Tile 3: Sleep Recovery with Inline Quick Selector */}
            <div className="bento-ceramic p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono uppercase text-[#68645E] font-bold">
                  RECOVERY
                </span>
                <Moon className="w-3.5 h-3.5 text-[#FF4F00]" />
              </div>
              <div className="my-1 font-mono tabular-nums font-black text-xl text-[#111110]">
                {dailyLog?.sleepHours ? (
                  <span>{dailyLog.sleepHours}h</span>
                ) : dailyLog?.sleepWakeTime ? (
                  <span>{dailyLog.sleepWakeTime}</span>
                ) : (
                  <span className="text-sm font-medium text-[#A39E93]">—</span>
                )}
              </div>
              {/* Inline tactile selector: 6h | 7h | 8h */}
              <div className="flex items-center gap-1 pt-1">
                {[6, 7, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleQuickLogSleep(h)}
                    className="flex-1 py-0.5 rounded bg-[#F7F5F0] border border-[#E6E3DC] text-[9px] font-mono font-bold text-[#68645E] hover:text-[#111110] hover:bg-white hover:border-[#D8D4CC] transition-all cursor-pointer"
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2C. "NEXT UP IN TIMELINE" STRIP (CERAMIC WHITE) */}
          <div className="bento-ceramic p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#68645E] font-bold">
                  NEXT UP IN TIMELINE
                </span>
              </div>
              <button
                type="button"
                onClick={onNavigateToLearn}
                className="text-[11px] font-mono text-[#FF4F00] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>View Full Timeline</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E6E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#68645E] uppercase tracking-wider block">
                  {nextUpInfo.track} • {nextUpInfo.presetDates}
                </span>
                <h4 className="font-display font-extrabold text-sm text-[#111110] mt-0.5">
                  {nextUpInfo.topic}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTimer(nextUpInfo.topic)}
                className="px-4 py-2 rounded-full btn-orange text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Launch Session</span>
              </button>
            </div>

            {/* Daily Breakthrough Reflection Input */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Log a 1-sentence breakthrough or reflection today..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={() => updateDailyNote(noteText)}
                className="flex-1 min-w-0 min-h-[38px] px-3.5 rounded-xl input-command-bar text-xs text-[#111110] placeholder-[#A39E93] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => updateDailyNote(noteText)}
                className="px-3.5 min-h-[38px] rounded-xl btn-tactile text-xs font-mono font-bold cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================
            COLUMN 3 (RIGHT 3 COLS): DSA & COMMUNICATION SYNTHESIZER
            ======================================================================== */}
        <div className="lg:col-span-3 space-y-5">
          <DailyDsaCommunicationWidget />
        </div>

      </div>

      {/* ========================================================================
          MODALS & OVERLAYS
          ======================================================================== */}
      {showStudyModal && (
        <LogStudyModal isOpen={showStudyModal} onClose={() => setShowStudyModal(false)} />
      )}
      {showWastedModal && (
        <LogWastedModal isOpen={showWastedModal} onClose={() => setShowWastedModal(false)} />
      )}
      {showSleepModal && (
        <LogSleepModal isOpen={showSleepModal} onClose={() => setShowSleepModal(false)} />
      )}
      {showQuestionModal && (
        <AddQuestionModal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} />
      )}

      {/* Edit Task Note Modal */}
      <AnimatePresence>
        {editingTaskForNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bento-ceramic p-6 shadow-2xl space-y-4 font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E3DC]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF4F00]" />
                  <h3 className="font-display text-lg font-bold text-[#111110]">Task Note</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTaskForNote(null)}
                  className="text-[#A39E93] hover:text-[#111110] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-[#68645E]">
                  Task: <span className="text-[#111110] font-semibold">{editingTaskForNote.title}</span>
                </p>
                <textarea
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                  placeholder="Enter a short note..."
                  rows={3}
                  className="w-full p-3.5 rounded-xl input-command-bar text-xs text-[#111110] placeholder-[#A39E93] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {editingTaskForNote.note ? (
                  <button
                    type="button"
                    onClick={() => setEditNoteText('')}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear Note
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTaskForNote(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[#68645E] hover:text-[#111110] cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditNote}
                    className="px-4 py-2 rounded-xl btn-orange text-xs font-bold cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
