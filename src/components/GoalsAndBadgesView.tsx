import React, { useState, useEffect } from 'react';
import { Goal, Achievement, PublicStats } from '../types';
import { dataService } from '../services/dataService';

export const GoalsAndBadgesView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStats>(dataService.getPublicStats());
  const [streakInfo, setStreakInfo] = useState<{ currentStreak: number; longestStreak: number; totalDaysLogged: number }>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0
  });

  const [filterGoalType, setFilterGoalType] = useState<string>('all');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'yearly' | 'semester' | 'weekly'>('weekly');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState(new Date().toISOString().split('T')[0]);

  // Public stats editing
  const [ghUser, setGhUser] = useState(publicStats.githubUsername);
  const [lcUser, setLcUser] = useState(publicStats.leetcodeUsername);
  const [isFetchingStats, setIsFetchingStats] = useState(false);

  const loadData = () => {
    setGoals(dataService.getGoals());
    setAchievements(dataService.checkAndUnlockAchievements());
    setStreakInfo(dataService.getStreak());
    const stats = dataService.getPublicStats();
    setPublicStats(stats);
    setGhUser(stats.githubUsername);
    setLcUser(stats.leetcodeUsername);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleGoal = (id: string) => {
    dataService.toggleGoal(id);
    loadData();
  };

  const handleDeleteGoal = (id: string) => {
    dataService.deleteGoal(id);
    loadData();
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    dataService.addGoal({
      title: newGoalTitle.trim(),
      type: newGoalType,
      target_date: newGoalTargetDate,
      completed: false
    });

    setIsGoalModalOpen(false);
    setNewGoalTitle('');
    loadData();
  };

  const handleSyncPublicStats = async () => {
    setIsFetchingStats(true);
    try {
      dataService.setPublicUsernames(ghUser, lcUser);
      const updated = await dataService.fetchPublicStats(ghUser, lcUser);
      setPublicStats(updated);
    } finally {
      setIsFetchingStats(false);
    }
  };

  const filteredGoals = filterGoalType === 'all' ? goals : goals.filter(g => g.type === filterGoalType);
  const unlockedBadgesCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 pb-20">
      {/* "No Zero Days" Streak Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-700/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">⚡</span>
              <h1 className="text-2xl font-black text-white tracking-tight">"No Zero Days" Minimum Discipline</h1>
            </div>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Even on your hardest, busiest college days, spend at least 20 minutes: solve 1 LeetCode problem or read 1 System Design section. Momentum never resets.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-900/90 border border-amber-500/40 px-5 py-3 rounded-2xl text-center shadow-lg">
              <div className="text-3xl font-black text-amber-400">{streakInfo.currentStreak} 🔥</div>
              <div className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Current Streak</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-700 px-5 py-3 rounded-2xl text-center shadow-lg">
              <div className="text-3xl font-black text-indigo-400">{streakInfo.longestStreak} ⚡</div>
              <div className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Longest Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Stats Integration Widget (GitHub & LeetCode) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🌐</span>
              <span>Public Profile & Integrations (LeetCode + GitHub)</span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Sync live stats from public developer APIs to track verified coding progress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncPublicStats}
              disabled={isFetchingStats}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-xl transition text-xs shadow-lg shadow-indigo-600/20"
            >
              {isFetchingStats ? 'Syncing...' : 'Sync Live Stats ↻'}
            </button>
          </div>
        </div>

        {/* Usernames inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Username</label>
            <input
              type="text"
              value={ghUser}
              onChange={e => setGhUser(e.target.value)}
              placeholder="e.g. torvalds"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">LeetCode Username</label>
            <input
              type="text"
              value={lcUser}
              onChange={e => setLcUser(e.target.value)}
              placeholder="e.g. neetcode"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Stats Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* GitHub Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-slate-700">
              🐙
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 font-mono">GitHub: @{ghUser || 'not set'}</div>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <span className="text-lg font-bold text-white">{publicStats.githubData?.public_repos ?? 14}</span>
                  <span className="text-[11px] text-slate-400 ml-1">repos</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-white">{publicStats.githubData?.followers ?? 32}</span>
                  <span className="text-[11px] text-slate-400 ml-1">followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* LeetCode Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950/40 flex items-center justify-center text-2xl font-bold text-amber-400 border border-amber-800/40">
              💻
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 font-mono">LeetCode: @{lcUser || 'not set'}</div>
              <div className="flex items-center gap-3 mt-1">
                <div>
                  <span className="text-lg font-bold text-emerald-400">{publicStats.leetcodeData?.totalSolved ?? 48}</span>
                  <span className="text-[11px] text-slate-400 ml-1">solved</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-emerald-400">{publicStats.leetcodeData?.easySolved ?? 22}E</span> /{' '}
                  <span className="text-amber-400">{publicStats.leetcodeData?.mediumSolved ?? 21}M</span> /{' '}
                  <span className="text-rose-400">{publicStats.leetcodeData?.hardSolved ?? 5}H</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🎯</span>
              <span>4-Year Roadmap Goals (Nov 2026 – 2030)</span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Yearly milestones, semester targets, and weekly sprint objectives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700/60">
              {['all', 'yearly', 'semester', 'weekly'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterGoalType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    filterGoalType === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-xl transition text-xs shadow-lg shadow-indigo-600/20"
            >
              + Add Goal
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredGoals.map(goal => (
            <div
              key={goal.id}
              className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleToggleGoal(goal.id)}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span
                    className={`text-sm font-medium ${
                      goal.completed ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {goal.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        goal.type === 'yearly'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                          : goal.type === 'semester'
                          ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                      }`}
                    >
                      {goal.type}
                    </span>
                    <span className="text-xs text-slate-400">Target: {goal.target_date}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Achievements & Badges Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🏆</span>
              <span>Subtle Achievements & Milestones</span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Automatically unlocked as you complete topics, build streaks, and conquer DSA problems.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
            {unlockedBadgesCount} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`rounded-2xl p-4 border transition flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-950/30'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                {ach.badge}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                  {ach.unlocked && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      UNLOCKED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{ach.description}</p>
                {ach.unlocked && ach.unlocked_at && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-2">
                    Unlocked: {ach.unlocked_at.split('T')[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Roadmap Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Graph & DP patterns"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select
                    value={newGoalType}
                    onChange={e => setNewGoalType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="semester">Semester</option>
                    <option value="yearly">Yearly (Nov 2026-2030)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newGoalTargetDate}
                    onChange={e => setNewGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
