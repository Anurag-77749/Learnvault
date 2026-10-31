import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  Battery,
  Smile,
  Code2,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  TrendingUp,
  Sparkles,
  PhoneOff,
  Trash2
} from 'lucide-react';
import { DailyLog } from '../types';
import { dataService } from '../services/dataService';

interface DailyLogViewProps {
  onOpenTimer: () => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({ onOpenTimer }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Form state
  const [studyTimeMins, setStudyTimeMins] = useState<number>(0);
  const [timeWastedMins, setTimeWastedMins] = useState<number>(0);
  const [wastedReason, setWastedReason] = useState<DailyLog['wasted_reason']>('');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [energy, setEnergy] = useState<number>(3);
  const [mood, setMood] = useState<number>(3);
  const [dsaProblems, setDsaProblems] = useState<number>(0);
  const [whatLearned, setWhatLearned] = useState<string>('');
  const [tomorrowPlan, setTomorrowPlan] = useState<string>('');

  const [savedNotice, setSavedNotice] = useState(false);
  const [streakInfo, setStreakInfo] = useState(dataService.getStreak());
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>(dataService.getDailyLogs());

  // Load log for selectedDate
  useEffect(() => {
    const existing = dataService.getDailyLogByDate(selectedDate);
    if (existing) {
      setStudyTimeMins(existing.total_study_time_mins || 0);
      setTimeWastedMins(existing.time_wasted_mins || 0);
      setWastedReason(existing.wasted_reason || '');
      setSleepHours(existing.sleep_hours ?? 7.5);
      setEnergy(existing.energy ?? 3);
      setMood(existing.mood ?? 3);
      setDsaProblems(existing.dsa_problems_solved ?? 0);
      setWhatLearned(existing.what_learned || '');
      setTomorrowPlan(existing.tomorrow_plan || '');
    } else {
      // Default blank log for that date
      setStudyTimeMins(0);
      setTimeWastedMins(0);
      setWastedReason('');
      setSleepHours(7.5);
      setEnergy(3);
      setMood(3);
      setDsaProblems(0);
      setWhatLearned('');
      setTomorrowPlan('');
    }
    setStreakInfo(dataService.getStreak());
    setRecentLogs(dataService.getDailyLogs());
  }, [selectedDate]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dataService.saveDailyLog({
      date: selectedDate,
      total_study_time_mins: studyTimeMins,
      time_wasted_mins: timeWastedMins,
      wasted_reason: wastedReason,
      sleep_hours: sleepHours,
      energy,
      mood,
      dsa_problems_solved: dsaProblems,
      what_learned: whatLearned,
      tomorrow_plan: tomorrowPlan
    });

    setSavedNotice(true);
    setStreakInfo(dataService.getStreak());
    setRecentLogs(dataService.getDailyLogs());
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const curr = new Date(selectedDate + 'T00:00:00');
    curr.setDate(curr.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  const moodEmojis = [
    { level: 1, emoji: '😫', label: 'Exhausted' },
    { level: 2, emoji: '😕', label: 'Low' },
    { level: 3, emoji: '😐', label: 'Neutral' },
    { level: 4, emoji: '🙂', label: 'Good' },
    { level: 5, emoji: '🚀', label: 'Unstoppable' }
  ];

  const energyLabels = [
    { level: 1, label: 'Drained' },
    { level: 2, label: 'Low' },
    { level: 3, label: 'Steady' },
    { level: 4, label: 'High' },
    { level: 5, label: 'Peak' }
  ];

  const wasteReasons: Array<{ id: DailyLog['wasted_reason']; label: string }> = [
    { id: 'phone', label: '📱 Phone' },
    { id: 'social_media', label: '💬 Social Media' },
    { id: 'youtube', label: '▶️ YouTube' },
    { id: 'procrastination', label: '⏳ Procrastination' },
    { id: 'other', label: '❓ Other' }
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Top Banner: Streak, Today Study vs Wasted */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Daily Study & Habit Log</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Under-30-second daily reflection: track deep work, wasted minutes, sleep, and tomorrow's mission.
            </p>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2">
              <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
              <div>
                <div className="text-xs font-bold uppercase text-amber-400">Current Streak</div>
                <div className="text-lg font-black text-white">{streakInfo.currentStreak} Days</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Best Streak</div>
              <div className="text-lg font-black text-slate-300">{streakInfo.longestStreak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
        <button
          onClick={() => navigateDate('prev')}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          title="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
          />
          {selectedDate === todayStr && (
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300 border border-indigo-500/30">
              Today
            </span>
          )}
        </div>

        <button
          onClick={() => navigateDate('next')}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          title="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Main Fast-Logging Form (30-Second UX) */}
      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        {/* Metric Row 1: Study Time & Time Wasted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Study Time Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>TOTAL STUDY TIME</span>
              </label>
              <button
                type="button"
                onClick={onOpenTimer}
                className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Launch Pomodoro</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="5"
                value={studyTimeMins}
                onChange={e => setStudyTimeMins(Number(e.target.value))}
                className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400">mins ({(studyTimeMins / 60).toFixed(1)} hrs)</span>
            </div>

            {/* Quick Increment Steppers */}
            <div className="flex items-center gap-1.5 pt-1">
              {[15, 30, 45, 60].map(inc => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setStudyTimeMins(prev => prev + inc)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-slate-800"
                >
                  +{inc}m
                </button>
              ))}
              <button
                type="button"
                onClick={() => setStudyTimeMins(0)}
                className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Time Wasted & Reason Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <PhoneOff className="h-4 w-4 text-rose-400" />
              <span>TIME WASTED & REASON</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="5"
                value={timeWastedMins}
                onChange={e => setTimeWastedMins(Number(e.target.value))}
                className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400">mins ({(timeWastedMins / 60).toFixed(1)} hrs)</span>
            </div>

            {/* Wasted Reason Quick Radio Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {wasteReasons.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setWastedReason(r.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    wastedReason === r.id
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Row 2: Sleep, Energy, Mood, DSA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Sleep Hours */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>SLEEP</span>
              <span className="text-white font-bold">{sleepHours} hrs</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={e => setSleepHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>4h</span>
              <span>7.5h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Energy (1 to 5) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Battery className="h-3.5 w-3.5 text-cyan-400" />
                <span>ENERGY</span>
              </span>
              <span className="text-cyan-400 font-bold">{energyLabels[energy - 1]?.label}</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergy(lvl)}
                  className={`flex-1 rounded py-1 text-xs font-bold transition-all ${
                    energy >= lvl ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mood (1 to 5) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Smile className="h-3.5 w-3.5 text-amber-400" />
                <span>MOOD</span>
              </span>
              <span className="text-amber-400 font-bold">{moodEmojis[mood - 1]?.label}</span>
            </div>
            <div className="flex justify-between gap-1 pt-1">
              {moodEmojis.map(m => (
                <button
                  key={m.level}
                  type="button"
                  onClick={() => setMood(m.level)}
                  className={`flex-1 rounded p-1 text-base transition-all ${
                    mood === m.level ? 'bg-amber-500/20 scale-110 ring-1 ring-amber-400' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* DSA Solved */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>DSA PROBLEMS</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setDsaProblems(prev => Math.max(0, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              >
                -
              </button>
              <span className="text-xl font-bold text-white">{dsaProblems}</span>
              <button
                type="button"
                onClick={() => setDsaProblems(prev => prev + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* What I Learned */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>WHAT I LEARNED TODAY</span>
          </label>
          <textarea
            rows={3}
            placeholder="- Understood CAP theorem latency trade-offs&#10;- Implemented vector similarity search with embeddings"
            value={whatLearned}
            onChange={e => setWhatLearned(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Tomorrow's Plan */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span>TOMORROW'S PLAN</span>
          </label>
          <textarea
            rows={3}
            placeholder="- Solve 2 Tree problems on LeetCode&#10;- Build RAG chunking pipeline with LangChain"
            value={tomorrowPlan}
            onChange={e => setTomorrowPlan(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400">
            {savedNotice ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <Check className="h-4 w-4" /> Log saved successfully!
              </span>
            ) : (
              <span>Autosaves to offline database and Supabase cloud.</span>
            )}
          </div>

          <button
            type="submit"
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Save Daily Log</span>
          </button>
        </div>
      </form>

      {/* Recent Study Logs History */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recent Logs History ({recentLogs.length})
        </h3>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No past logs recorded yet. Start by saving today's log above!</p>
        ) : (
          <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
            {recentLogs.slice(0, 7).map(log => (
              <div
                key={log.date}
                onClick={() => setSelectedDate(log.date)}
                className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-800/40 rounded-lg cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{log.date}</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-semibold border border-emerald-500/20">
                    {(log.total_study_time_mins / 60).toFixed(1)}h Study
                  </span>
                  {log.time_wasted_mins > 0 && (
                    <span className="text-slate-400">
                      {log.time_wasted_mins}m Wasted ({log.wasted_reason || 'other'})
                    </span>
                  )}
                  {log.dsa_problems_solved > 0 && (
                    <span className="text-indigo-400 font-medium">
                      {log.dsa_problems_solved} DSA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span>{log.sleep_hours}h sleep</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
