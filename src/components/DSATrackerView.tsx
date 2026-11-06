import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Search, 
  X,
  AlertCircle,
  Flame,
  Layers
} from 'lucide-react';
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
    <div className="space-y-6 pb-28 font-sans max-w-[1500px] mx-auto select-none">
      {/* 1. HERO COMMAND HEADER (SMOKED OBSIDIAN) */}
      <div className="smoked-glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
              ALGORITHM ARENA // SPACED RECALL
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            DSA Problem Laboratory
          </h1>
          <p className="text-xs text-[#9898A0] mt-1">
            Pattern-based LeetCode mastery with automated 1, 3, 7, 30-day spaced retention cycles.
          </p>
        </div>

        {/* Telemetry Stats + Add Action */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.09] text-center min-w-[72px]">
            <div className="font-mono tabular-nums font-black text-xl text-[#10B981]">{solvedCount}</div>
            <div className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">Solved</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.09] text-center min-w-[72px]">
            <div className="font-mono tabular-nums font-black text-xl text-white">{masteredCount}</div>
            <div className="text-[10px] font-mono text-[#9898A0] uppercase font-bold">Mastered</div>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-full btn-mercury text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="font-mono uppercase text-[11px]">Add Problem</span>
          </button>
        </div>
      </div>

      {/* 2. SPACED REPETITION ALERTS (IF ANY DUE) */}
      {dueRevisions.length > 0 && (
        <div className="smoked-glass p-5 border border-[#FF5500]/30 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-[#FF5500] font-bold text-xs font-mono uppercase tracking-wider">
              <Flame className="w-4 h-4 animate-pulse" />
              <span>SPACED REPETITION QUEUE: {dueRevisions.length} PROBLEMS DUE TODAY</span>
            </div>
            <span className="text-[10px] font-mono text-[#9898A0]">
              MEMORY RETENTION INTERVAL ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueRevisions.map(p => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col justify-between gap-3 hover:border-white/[0.2] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.1]">
                      {p.pattern}
                    </span>
                    <span className="text-[10px] font-mono text-[#FF5500] font-bold">
                      STAGE: {p.revision_step}
                    </span>
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-white font-bold text-sm mt-2 hover:text-[#FF5500] transition flex items-center gap-1.5"
                  >
                    <span>{p.title}</span>
                    <ExternalLink className="w-3 h-3 text-[#9898A0]" />
                  </a>
                  {p.mistakes && (
                    <p className="text-[11px] text-rose-300 mt-1 line-clamp-2 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30 font-mono">
                      // {p.mistakes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#9898A0]">Due: {p.next_revision_date}</span>
                  <button
                    onClick={() => handleCompleteRevision(p.id)}
                    className="px-3 py-1 rounded-full btn-mercury text-[10px] font-mono font-black flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Review Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ROADMAP TOPIC RETENTION CHIPS */}
      {topicRevisions.length > 0 && (
        <div className="smoked-glass p-4">
          <div className="flex items-center gap-2 text-[#9898A0] font-mono font-bold text-xs mb-2">
            <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>ROADMAP TOPICS DUE FOR RECALL ({topicRevisions.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicRevisions.map(item => (
              <span
                key={item.topic.id}
                className="bg-white/[0.03] border border-white/[0.08] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <span className="font-semibold">{item.topic.title}</span>
                <span className="text-[#9898A0] font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded">
                  {item.recommendedInterval}d cycle ({item.daysSince}d ago)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. FILTER & COMMAND SEARCH BAR (ZERO-MESS SWISS ARCHITECTURE) */}
      <div className="smoked-glass p-3.5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search problems by title, algorithmic pattern, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full input-command-bar rounded-xl px-4 py-2 text-xs text-white placeholder-[#9898A0] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-[#9898A0] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pattern Filter */}
          <select
            value={filterPattern}
            onChange={e => setFilterPattern(e.target.value)}
            className="input-command-bar text-xs rounded-xl px-3 py-2 text-white focus:outline-none"
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
            className="input-command-bar text-xs rounded-xl px-3 py-2 text-white focus:outline-none"
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
            className="input-command-bar text-xs rounded-xl px-3 py-2 text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* 5. PROBLEMS TELEMETRY TABLE / CARDS */}
      <div className="space-y-2.5">
        {filteredProblems.length === 0 ? (
          <div className="smoked-glass p-12 text-center text-[#9898A0] font-mono text-xs border border-dashed border-white/[0.08]">
            NO MATCHING ALGORITHMS FOUND IN REPO.
          </div>
        ) : (
          filteredProblems.map(p => {
            const isDue = p.next_revision_date && p.next_revision_date <= todayStr && p.status !== 'mastered';
            return (
              <div
                key={p.id}
                className={`smoked-glass p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isDue ? 'border-[#FF5500]/40 shadow-[0_0_15px_rgba(255,85,0,0.1)]' : ''
                }`}
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.1]">
                      {p.pattern}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        p.difficulty === 'easy'
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          : p.difficulty === 'medium'
                          ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {p.difficulty.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        p.status === 'mastered'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : p.status === 'solved'
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          : 'bg-white/[0.04] text-[#9898A0] border-white/[0.08]'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>

                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white font-bold text-base hover:text-[#FF5500] transition flex items-center gap-1.5"
                  >
                    <span>{p.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9898A0]" />
                  </a>

                  {p.mistakes && (
                    <p className="text-xs text-rose-300 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30 font-mono">
                      Mistake / Key Catch: {p.mistakes}
                    </p>
                  )}
                  {p.notes && (
                    <p className="text-xs text-[#9898A0] font-mono">
                      // {p.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {p.status !== 'solved' && p.status !== 'mastered' && (
                    <button
                      onClick={() => handleMarkSolved(p.id)}
                      className="px-3 py-1.5 rounded-full btn-mercury text-[11px] font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Solved</span>
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-lg text-[#9898A0] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                    title="Edit Problem"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg text-[#9898A0] hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer"
                    title="Delete Problem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. MODAL FOR ADD / EDIT PROBLEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg smoked-glass p-6 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#FF5500]" />
                <h3 className="font-display font-bold text-lg text-white">
                  {editingProblem ? 'Edit DSA Problem' : 'Add DSA Problem'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9898A0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Trapping Rain Water"
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Pattern</label>
                  <input
                    type="text"
                    value={formPattern}
                    onChange={e => setFormPattern(e.target.value)}
                    placeholder="e.g. Two Pointers"
                    className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as any)}
                    className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Problem URL</label>
                <input
                  type="url"
                  value={formLink}
                  onChange={e => setFormLink(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Key Mistake / Edge Case Catch</label>
                <input
                  type="text"
                  value={formMistakes}
                  onChange={e => setFormMistakes(e.target.value)}
                  placeholder="What tripped you up on first pass?"
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Context Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Optimal time/space complexity notes..."
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9898A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full btn-mercury text-xs font-black shadow-md cursor-pointer"
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
