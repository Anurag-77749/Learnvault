import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  RotateCcw,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Layers,
  Code2,
  CheckCircle2,
  CalendarDays,
  ListTree,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Track, Topic, PlannerSettings } from '../types';
import { dataService } from '../services/dataService';

interface PlannerViewProps {
  tracks: Track[];
  topics: Topic[];
  onOpenTopic: (topic: Topic) => void;
  onRefreshData: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tracks,
  topics,
  onOpenTopic,
  onRefreshData
}) => {
  const currentSettings = dataService.getPlannerSettings();

  const [startDate, setStartDate] = useState(currentSettings.startDate || new Date().toISOString().split('T')[0]);
  const [hoursPerDay, setHoursPerDay] = useState(currentSettings.hoursPerDay || 3);
  const [selectedTrackId, setSelectedTrackId] = useState(currentSettings.activeMainTrackId || tracks[0]?.id || '');
  const [examMode, setExamMode] = useState(currentSettings.examMode || false);
  const [examStartDate, setExamStartDate] = useState(currentSettings.examStartDate || '');
  const [examEndDate, setExamEndDate] = useState(currentSettings.examEndDate || '');

  const [scheduleView, setScheduleView] = useState<'timeline' | 'calendar'>('timeline');
  const [notification, setNotification] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTopics = topics.filter(
    t => t.deadline && t.deadline < todayStr && t.status !== 'done'
  );

  const activeTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  const activeTrackTopics = topics
    .filter(t => t.track_id === activeTrack?.id)
    .sort((a, b) => a.order_index - b.order_index);

  const handleSaveSettings = () => {
    dataService.savePlannerSettings({
      startDate,
      hoursPerDay,
      activeMainTrackId: selectedTrackId,
      examMode,
      examStartDate: examStartDate || null,
      examEndDate: examEndDate || null
    });
  };

  const handleAutoFill = () => {
    handleSaveSettings();
    const count = dataService.autoFillDeadlines({
      trackId: selectedTrackId,
      startDate,
      hoursPerDay
    });
    onRefreshData();
    setNotification(`Successfully scheduled deadlines for ${count} topics!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOneTapReschedule = () => {
    handleSaveSettings();
    const count = dataService.oneTapReschedule(selectedTrackId);
    onRefreshData();
    setNotification(`Rescheduled ${count} overdue topics forward from today!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                4-Year Roadmap Engine
              </span>
              <span className="text-xs text-slate-400">Targeting FDE 2026–2030</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Study Planner & Parallel Schedule</h2>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Auto-fill sequential deadlines, execute one-tap reschedules when falling behind, and balance daily DSA with your primary engineering track.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Form Toggle */}
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setScheduleView('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scheduleView === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListTree className="h-3.5 w-3.5" />
                <span>Timeline View</span>
              </button>
              <button
                onClick={() => setScheduleView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scheduleView === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Calendar View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Overdue Warning & One-Tap Reschedule Banner */}
      {overdueTopics.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {overdueTopics.length} Overdue Topics Detected
              </h4>
              <p className="text-xs text-rose-300/80">
                You've fallen behind on planned deadlines. Use One-Tap Reschedule to recalibrate future dates without losing any progress!
              </p>
            </div>
          </div>

          <button
            onClick={handleOneTapReschedule}
            className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>One-Tap Reschedule All</span>
          </button>
        </div>
      )}

      {/* Planner Parameters & Exam Mode Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Auto-Fill Controls */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Auto-Fill Deadline Generator
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">START DATE</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">STUDY TARGET (HOURS/DAY)</label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={hoursPerDay}
                onChange={e => setHoursPerDay(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">TARGET MAIN TRACK</label>
              <select
                value={selectedTrackId}
                onChange={e => setSelectedTrackId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
              >
                {tracks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Allocates 2h for easy topics, 4h for medium, and 8h for hard system patterns.
            </span>
            <button
              onClick={handleAutoFill}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Auto-Fill Deadlines Now</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: College Exam Mode */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                College Exam Mode
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={examMode}
                onChange={e => {
                  setExamMode(e.target.checked);
                  dataService.savePlannerSettings({ examMode: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="text-xs text-slate-400">
            Freezes or shifts main roadmap deadlines during college midterms/finals so you maintain high grades without overdue penalties!
          </p>

          {examMode && (
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Exam Start Date</label>
                <input
                  type="date"
                  value={examStartDate}
                  onChange={e => setExamStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Exam End Date</label>
                <input
                  type="date"
                  value={examEndDate}
                  onChange={e => setExamEndDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parallel Schedule View Header: DSA Daily + One Main Track */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-base font-bold text-white">Parallel Schedule View</h3>
            </div>
            <p className="text-xs text-slate-400">
              Parallel formula: <strong className="text-emerald-400">Daily DSA</strong> (1–2 problems every single day) + <strong className="text-indigo-400">{activeTrack?.title}</strong> (main track focus).
            </p>
          </div>
        </div>

        {/* Parallel View 1: Timeline Form */}
        {scheduleView === 'timeline' && (
          <div className="space-y-3 pt-2">
            {activeTrackTopics.slice(0, 15).map((topic, idx) => {
              const isOverdue =
                topic.deadline &&
                topic.deadline < todayStr &&
                topic.status !== 'done';

              return (
                <div
                  key={topic.id}
                  onClick={() => onOpenTopic(topic)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 cursor-pointer transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{topic.title}</span>
                        {isOverdue && (
                          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                            Overdue
                          </span>
                        )}
                        {topic.status === 'done' && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            Done
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="uppercase text-[10px] font-semibold text-indigo-400">
                          {topic.difficulty}
                        </span>
                        {topic.planned_start && topic.deadline && (
                          <span>
                            Window: {topic.planned_start} → <strong>{topic.deadline}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-indigo-300 border border-indigo-500/20">
                      + 2 DSA Problems Scheduled
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Parallel View 2: Calendar Form (30-day scheduled grid) */}
        {scheduleView === 'calendar' && (
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, dayIdx) => {
                const date = new Date();
                date.setDate(date.getDate() + dayIdx);
                const dStr = date.toISOString().split('T')[0];
                const dayTopics = topics.filter(t => t.deadline === dStr);
                const isToday = dStr === todayStr;

                return (
                  <div
                    key={dStr}
                    className={`rounded-xl border p-2.5 min-h-[105px] flex flex-col justify-between ${
                      isToday
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={isToday ? 'text-indigo-400' : 'text-slate-400'}>
                          {date.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })}
                        </span>
                        {isToday && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        )}
                      </div>

                      {/* Daily DSA Pill */}
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-500/20">
                        <Code2 className="h-2.5 w-2.5" />
                        <span>Daily DSA</span>
                      </div>

                      {/* Scheduled Topics */}
                      <div className="mt-1 space-y-1">
                        {dayTopics.slice(0, 2).map(top => (
                          <div
                            key={top.id}
                            onClick={() => onOpenTopic(top)}
                            className="truncate text-[10px] text-slate-300 hover:text-white cursor-pointer bg-slate-900 px-1 py-0.5 rounded border border-slate-800"
                            title={top.title}
                          >
                            {top.title}
                          </div>
                        ))}
                      </div>
                    </div>

                    {dayTopics.length > 2 && (
                      <span className="text-[9px] text-slate-500">+{dayTopics.length - 2} more</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
