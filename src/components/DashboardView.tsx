import React, { useState } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  PhoneOff,
  Code2,
  Copy,
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Topic, DailyLog } from '../types';
import { dataService } from '../services/dataService';

interface DashboardViewProps {
  topics: Topic[];
  onOpenTimer: () => void;
  onOpenTopic: (topic: Topic) => void;
  onOpenDailyLog: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  topics,
  onOpenTimer,
  onOpenTopic,
  onOpenDailyLog,
  onNavigateToTab
}) => {
  const [reviewDays, setReviewDays] = useState<7 | 30>(7);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [copiedReview, setCopiedReview] = useState(false);

  const streak = dataService.getStreak();
  const nextUp = dataService.getNextUpTopics(5);
  const chartData = dataService.getChartData30Days();
  const heatmapData = dataService.getYearlyHeatmapData();
  const review = dataService.getReviewSummary(reviewDays);
  const coverage = dataService.getCoverageReport();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dataService.getDailyLogByDate(todayStr);

  const totalStudyMins = topics.reduce((acc, t) => acc + (t.time_spent_mins || 0), 0);
  const totalCompletedTopics = topics.filter(t => t.status === 'done').length;

  const copyReviewSummary = () => {
    let text = `# 🎯 ${reviewDays}-Day Learning Review\n\n`;
    text += `- **Total Study Time:** ${review.totalStudyHours} hours\n`;
    text += `- **Time Wasted:** ${review.totalWastedHours} hours\n`;
    text += `- **DSA Problems Solved:** ${review.dsaSolved}\n`;
    text += `- **Topics Mastered:** ${review.topicsCompleted}\n`;
    text += `- **Average Sleep:** ${review.avgSleepHours} hrs/night\n\n`;
    if (reviewNotes.trim()) {
      text += `### Reflection Notes:\n${reviewNotes}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2000);
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-800/60';
    if (count < 60) return 'bg-indigo-900 border-indigo-700';
    if (count < 120) return 'bg-indigo-700 border-indigo-500';
    if (count < 240) return 'bg-indigo-500 border-indigo-400';
    return 'bg-emerald-400 border-emerald-300';
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                FDE Journey 2026–2030
              </span>
              <span className="text-xs text-slate-400 font-medium">Day-by-Day Execution</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              Command Dashboard
            </h2>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Track daily momentum, parallel DSA + systems progress, yearly habit heatmaps, and weekly reviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTimer}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <Play className="h-4 w-4" />
              <span>Launch Focus Timer</span>
            </button>
            <button
              onClick={onOpenDailyLog}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>Log Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {/* Streak */}
        <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>STREAK</span>
            <Flame className="h-4 w-4 animate-pulse" />
          </div>
          <div className="mt-1 text-2xl font-black text-white">{streak.currentStreak} Days</div>
          <div className="text-[11px] text-slate-400">Best: {streak.longestStreak} days</div>
        </div>

        {/* Today's Study Time */}
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>TODAY'S STUDY</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {todayLog ? (todayLog.total_study_time_mins / 60).toFixed(1) : 0}h
          </div>
          <div className="text-[11px] text-slate-400">
            {todayLog?.dsa_problems_solved || 0} DSA solved today
          </div>
        </div>

        {/* Total Mastered Topics */}
        <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
            <span>TOPICS DONE</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {totalCompletedTopics} / {topics.length}
          </div>
          <div className="text-[11px] text-indigo-300">
            {((totalCompletedTopics / (topics.length || 1)) * 100).toFixed(1)}% complete
          </div>
        </div>

        {/* Total Time Logged */}
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
            <span>TOTAL TIME</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {(totalStudyMins / 60).toFixed(0)}h
          </div>
          <div className="text-[11px] text-slate-400">{topics.length} total roadmap targets</div>
        </div>

        {/* Sleep Quality */}
        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
            <span>AVG SLEEP (7D)</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-white">{review.avgSleepHours} hrs</div>
          <div className="text-[11px] text-slate-400">Restored & ready</div>
        </div>
      </div>

      {/* Row 2: Today's Tasks & "Next Up" List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Up Topics Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Next Up & Priority Tasks ({nextUp.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('topics')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Roadmaps</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {nextUp.map(t => {
              const isOverdue =
                t.deadline &&
                t.deadline < todayStr &&
                t.status !== 'done';

              return (
                <div
                  key={t.id}
                  onClick={() => onOpenTopic(t)}
                  className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        t.status === 'in_progress' ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{t.title}</span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="h-2.5 w-2.5" /> Overdue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="uppercase text-[10px] font-semibold text-indigo-400">
                          {t.difficulty}
                        </span>
                        {t.deadline && <span>Due: {t.deadline}</span>}
                        {t.time_spent_mins > 0 && <span>· {t.time_spent_mins}m logged</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onOpenTimer();
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-indigo-400 hover:bg-slate-700"
                      title="Start Pomodoro on this topic"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-Track Progress Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Per-Track Progress</h3>
            <button
              onClick={() => onNavigateToTab('coverage')}
              className="text-xs text-indigo-400 hover:underline"
            >
              Report
            </button>
          </div>

          <div className="space-y-3.5">
            {coverage.tracks.map(trk => {
              const trackTopics = topics.filter(t => t.track_id === trk.trackId);
              const doneCount = trackTopics.filter(t => t.status === 'done').length;
              const percent = Math.round((doneCount / (trackTopics.length || 1)) * 100);

              return (
                <div key={trk.trackId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {trk.trackTitle}
                    </span>
                    <span className="font-bold text-indigo-300">
                      {doneCount}/{trackTopics.length} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: 30-Day Study vs Wasted Time Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              30-Day Trend: Study Hours vs Wasted Time
            </h3>
            <p className="text-xs text-slate-400">
              Visual balance of focused deep work against distraction leaks over the past month.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Study Hours
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Wasted Hours
            </span>
          </div>
        </div>

        {/* Responsive Recharts Bar Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="studyHours" name="Study (hrs)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wastedHours" name="Wasted (hrs)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Yearly Activity Heatmap */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Yearly Activity Heatmap (365 Days)
            </h3>
            <p className="text-xs text-slate-400">
              Consistent daily practice. Every square reflects your committed study sprints.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-800" />
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-900" />
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-700" />
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid (Scrollable on small screens) */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-[720px]">
            {/* Split 365 days into 52 columns of 7 days */}
            {Array.from({ length: 52 }).map((_, weekIdx) => {
              const weekDays = heatmapData.slice(weekIdx * 7, weekIdx * 7 + 7);
              return (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {weekDays.map(day => (
                    <div
                      key={day.date}
                      className={`h-3 w-3 rounded-sm border ${getHeatmapColor(day.count)} cursor-pointer transition-transform hover:scale-125`}
                      title={`${day.date}: ${day.studyHours}h studied`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 5: Weekly & Monthly Review */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Periodic Review & Auto-Summary</h3>
          </div>

          {/* 7 Days vs 30 Days Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setReviewDays(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reviewDays === 7 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setReviewDays(30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reviewDays === 30 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Past 30 Days
            </button>
          </div>
        </div>

        {/* Review Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Study Time</span>
            <div className="text-xl font-black text-emerald-400">{review.totalStudyHours}h</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Time Wasted</span>
            <div className="text-xl font-black text-rose-400">{review.totalWastedHours}h</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">DSA Solved</span>
            <div className="text-xl font-black text-indigo-400">{review.dsaSolved} Problems</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Topics Completed</span>
            <div className="text-xl font-black text-cyan-400">{review.topicsCompleted} Targets</div>
          </div>
        </div>

        {/* Reflection Prompts Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Self-Reflection & Next Cycle Action Items:
          </label>
          <textarea
            rows={3}
            placeholder="- What was your biggest breakthrough in system design / DSA?&#10;- Which habits drained your focus this week?&#10;- Top 3 topics to conquer next..."
            value={reviewNotes}
            onChange={e => setReviewNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={copyReviewSummary}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Copy className="h-4 w-4" />
            <span>{copiedReview ? 'Copied Review to Clipboard!' : 'Copy Review Summary'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
