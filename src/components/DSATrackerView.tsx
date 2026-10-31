import React, { useState, useEffect } from 'react';
import { DSAProblem, Topic } from '../types';
import { dataService } from '../services/dataService';

export const DSATrackerView: React.FC = () => {
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [dueRevisions, setDueRevisions] = useState<DSAProblem[]>([]);
  const [topicRevisions, setTopicRevisions] = useState<Array<{ topic: Topic; daysSince: number; recommendedInterval: number }>>([]);
  const [filterPattern, setFilterPattern] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<DSAProblem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPattern, setFormPattern] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formStatus, setFormStatus] = useState<'todo' | 'attempted' | 'solved' | 'mastered'>('todo');
  const [formTimeSpent, setFormTimeSpent] = useState<number>(0);
  const [formMistakes, setFormMistakes] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadData = () => {
    setProblems(dataService.getDSAProblems());
    setDueRevisions(dataService.getDueRevisions());
    setTopicRevisions(dataService.getDueTopicRevisions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const patterns = Array.from(new Set(problems.map(p => p.pattern).filter(Boolean)));

  const filteredProblems = problems.filter(p => {
    if (filterPattern !== 'all' && p.pattern !== filterPattern) return false;
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchPattern = p.pattern.toLowerCase().includes(q);
      const matchNotes = (p.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchPattern && !matchNotes) return false;
    }
    return true;
  });

  const handleMarkSolved = (id: string) => {
    dataService.markDSASolved(id, 20);
    loadData();
  };

  const handleCompleteRevision = (id: string) => {
    dataService.completeRevision(id);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this DSA problem from your tracker?')) {
      dataService.deleteDSAProblem(id);
      loadData();
    }
  };

  const openAddModal = () => {
    setEditingProblem(null);
    setFormTitle('');
    setFormPattern('');
    setFormLink('');
    setFormDifficulty('medium');
    setFormStatus('todo');
    setFormTimeSpent(0);
    setFormMistakes('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (problem: DSAProblem) => {
    setEditingProblem(problem);
    setFormTitle(problem.title);
    setFormPattern(problem.pattern);
    setFormLink(problem.link);
    setFormDifficulty(problem.difficulty);
    setFormStatus(problem.status);
    setFormTimeSpent(problem.time_spent_mins || 0);
    setFormMistakes(problem.mistakes || '');
    setFormNotes(problem.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingProblem) {
      dataService.updateDSAProblem(editingProblem.id, {
        title: formTitle.trim(),
        pattern: formPattern.trim(),
        link: formLink.trim(),
        difficulty: formDifficulty,
        status: formStatus,
        time_spent_mins: Number(formTimeSpent),
        mistakes: formMistakes.trim(),
        notes: formNotes.trim()
      });
    } else {
      dataService.addDSAProblem({
        title: formTitle.trim(),
        pattern: formPattern.trim() || 'General Pattern',
        link: formLink.trim() || 'https://leetcode.com/problemset/all/',
        difficulty: formDifficulty,
        status: formStatus,
        solved_date: formStatus === 'solved' ? new Date().toISOString().split('T')[0] : null,
        attempts: formStatus === 'solved' ? 1 : 0,
        time_spent_mins: Number(formTimeSpent),
        mistakes: formMistakes.trim(),
        notes: formNotes.trim(),
        next_revision_date: formStatus === 'solved' ? new Date().toISOString().split('T')[0] : null,
        revision_step: 1
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const solvedCount = problems.filter(p => p.status === 'solved' || p.status === 'mastered').length;
  const masteredCount = problems.filter(p => p.status === 'mastered').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">DSA & Spaced Repetition Queue</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Pattern-based LeetCode mastery with automated 1, 3, 7, 30-day memory retention intervals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-emerald-400">{solvedCount}</div>
            <div className="text-xs text-slate-400">Solved</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-purple-400">{masteredCount}</div>
            <div className="text-xs text-slate-400">Mastered</div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Problem
          </button>
        </div>
      </div>

      {/* Spaced Repetition Alerts Banner */}
      {dueRevisions.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-5 shadow-lg shadow-amber-900/10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <span className="text-lg animate-pulse">⏰</span>
              <span>Spaced Repetition: {dueRevisions.length} Problems Due for Review Today</span>
            </div>
            <span className="text-xs text-amber-300/80 bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-700/40">
              Retention Retention Cycle
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueRevisions.map(p => (
              <div
                key={p.id}
                className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {p.pattern}
                    </span>
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      Stage: {p.revision_step} Days
                    </span>
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-white font-medium text-sm mt-2 hover:text-amber-300 transition"
                  >
                    {p.title} ↗
                  </a>
                  {p.mistakes && (
                    <p className="text-xs text-rose-300/90 mt-1 line-clamp-2 bg-rose-950/30 p-1.5 rounded border border-rose-900/30">
                      ⚠️ Note: {p.mistakes}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">Due: {p.next_revision_date}</span>
                  <button
                    onClick={() => handleCompleteRevision(p.id)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition"
                  >
                    Mark Reviewed ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Topic Spaced-Repetition Reminders */}
      {topicRevisions.length > 0 && (
        <div className="bg-indigo-950/30 border border-indigo-700/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-2">
            <span>📚</span>
            <span>Roadmap Topics Due for Recall ({topicRevisions.length} completed topics)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicRevisions.map(item => (
              <span
                key={item.topic.id}
                className="bg-slate-900 border border-indigo-800/60 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <span>{item.topic.title}</span>
                <span className="text-indigo-400 font-mono text-[11px] bg-indigo-950 px-1.5 py-0.5 rounded">
                  {item.recommendedInterval}d interval ({item.daysSince}d ago)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search problems by name, pattern, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pattern Filter */}
          <select
            value={filterPattern}
            onChange={e => setFilterPattern(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Patterns ({problems.length})</option>
            {patterns.map(pat => (
              <option key={pat} value={pat}>
                {pat}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <span className="text-3xl block mb-2">🔍</span>
            <p>No DSA problems match the active filters.</p>
          </div>
        ) : (
          filteredProblems.map(p => {
            const isDue = p.next_revision_date && p.next_revision_date <= todayStr && p.status !== 'mastered';
            return (
              <div
                key={p.id}
                className={`bg-slate-900 border transition rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDue ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {p.pattern}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        p.difficulty === 'easy'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                          : p.difficulty === 'medium'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                      }`}
                    >
                      {p.difficulty.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border ${
                        p.status === 'mastered'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                          : p.status === 'solved'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                          : p.status === 'attempted'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.attempts > 0 && (
                      <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                        {p.attempts} attempt{p.attempts > 1 ? 's' : ''} ({p.time_spent_mins}m)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white hover:text-indigo-400 font-semibold text-base transition flex items-center gap-1.5"
                    >
                      {p.title}
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {p.mistakes && (
                    <div className="text-xs text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded-lg p-2 mt-1">
                      <span className="font-semibold text-rose-400">Mistakes & Gotchas: </span>
                      {p.mistakes}
                    </div>
                  )}

                  {p.notes && (
                    <div className="text-xs text-slate-300 bg-slate-800/40 rounded-lg p-2 mt-1">
                      <span className="font-semibold text-slate-400">Key Idea: </span>
                      {p.notes}
                    </div>
                  )}
                </div>

                {/* Actions & Spaced Repetition Info */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    {p.status === 'mastered' ? (
                      <span className="text-xs font-semibold text-purple-400 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-800">
                        ✨ Mastered
                      </span>
                    ) : p.next_revision_date ? (
                      <div className="text-xs">
                        <span className="text-slate-400">Next Rev: </span>
                        <span className={isDue ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {p.next_revision_date}
                        </span>
                        <span className="text-slate-500 ml-1">({p.revision_step}d)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Not in recall queue</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status !== 'solved' && p.status !== 'mastered' ? (
                      <button
                        onClick={() => handleMarkSolved(p.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Mark Solved ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteRevision(p.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Advance Cycle ↺
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Edit Problem"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Delete Problem"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProblem ? 'Edit DSA Problem' : 'Add DSA Problem'}
            </h2>
            <form onSubmit={handleSaveProblem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trapping Rain Water"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Algorithmic Pattern</label>
                  <input
                    type="text"
                    placeholder="e.g. Sliding Window"
                    value={formPattern}
                    onChange={e => setFormPattern(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">LeetCode / Problem URL</label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={formLink}
                  onChange={e => setFormLink(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="attempted">Attempted</option>
                    <option value="solved">Solved</option>
                    <option value="mastered">Mastered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Time Spent (mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={formTimeSpent}
                    onChange={e => setFormTimeSpent(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-rose-400 mb-1">Mistakes & Common Traps</label>
                <textarea
                  rows={2}
                  placeholder="What edge cases or logical slip-ups did you run into?"
                  value={formMistakes}
                  onChange={e => setFormMistakes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Key Insight / Solution Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optimal time/space complexity, intuition, invariant..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
