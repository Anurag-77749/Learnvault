import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ListTodo
} from 'lucide-react';
import { Topic, Resource, Subtask, TopicStatus, TopicDifficulty, ResourceType } from '../types';

interface TopicDetailModalProps {
  topic: Topic;
  sectionTitle: string;
  trackTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Topic>) => void;
  onAddResource: (resource: Omit<Resource, 'id' | 'created_at'>) => void;
  onDeleteResource: (resourceId: string) => void;
  onDeleteTopic: (id: string) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  sectionTitle,
  trackTitle,
  isOpen,
  onClose,
  onUpdate,
  onAddResource,
  onDeleteResource,
  onDeleteTopic
}) => {
  if (!isOpen) return null;

  // Local state for edits
  const [status, setStatus] = useState<TopicStatus>(topic.status);
  const [plannedStart, setPlannedStart] = useState<string>(topic.planned_start || '');
  const [deadline, setDeadline] = useState<string>(topic.deadline || '');
  const [actualCompletedDate, setActualCompletedDate] = useState<string>(topic.actual_completed_date || '');
  const [difficulty, setDifficulty] = useState<TopicDifficulty>(topic.difficulty);
  const [confidence, setConfidence] = useState<number>(topic.confidence || 1);
  const [timeSpent, setTimeSpent] = useState<number>(topic.time_spent_mins || 0);
  const [notes, setNotes] = useState<string>(topic.notes || '');

  // Subtasks
  const [subtasks, setSubtasks] = useState<Subtask[]>(topic.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Resources
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState<ResourceType>('doc');
  const [showAddResource, setShowAddResource] = useState(false);

  // Overdue check
  const isOverdue =
    deadline &&
    new Date(deadline) < new Date(new Date().setHours(0, 0, 0, 0)) &&
    status !== 'done';

  const handleSave = () => {
    onUpdate(topic.id, {
      status,
      planned_start: plannedStart || null,
      deadline: deadline || null,
      actual_completed_date: actualCompletedDate || null,
      difficulty,
      confidence,
      time_spent_mins: timeSpent,
      notes,
      subtasks
    });
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const item: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updated = [...subtasks, item];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    onUpdate(topic.id, { subtasks: updated });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map(s => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
    setSubtasks(updated);
    onUpdate(topic.id, { subtasks: updated });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = subtasks.filter(s => s.id !== subtaskId);
    setSubtasks(updated);
    onUpdate(topic.id, { subtasks: updated });
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResUrl.trim()) return;

    onAddResource({
      topic_id: topic.id,
      title: newResTitle.trim(),
      url: newResUrl.trim(),
      type: newResType
    });

    setNewResTitle('');
    setNewResUrl('');
    setShowAddResource(false);
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-rose-400" />;
      case 'course':
        return <GraduationCap className="h-4 w-4 text-purple-400" />;
      case 'book':
        return <BookOpen className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6 overflow-y-auto">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-4 sm:p-6">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-indigo-400 font-semibold">{trackTitle}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{sectionTitle}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{topic.title}</h2>

            {/* Overdue alert banner */}
            {isOverdue && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>OVERDUE (Target deadline was {deadline})</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/60 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {/* Top Grid: Status, Difficulty, Confidence, Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {/* Status */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <label className="text-xs font-semibold text-slate-400">STATUS</label>
              <select
                value={status}
                onChange={e => {
                  const val = e.target.value as TopicStatus;
                  setStatus(val);
                  if (val === 'done' && !actualCompletedDate) {
                    setActualCompletedDate(new Date().toISOString().split('T')[0]);
                  }
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="not_started">⚪ Not Started</option>
                <option value="in_progress">🟡 In Progress</option>
                <option value="done">🟢 Done</option>
                <option value="revising">🟣 Revising</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <label className="text-xs font-semibold text-slate-400">DIFFICULTY</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as TopicDifficulty)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>

            {/* Confidence 1-5 */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <label className="text-xs font-semibold text-slate-400">CONFIDENCE (1–5)</label>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className="p-1 text-slate-600 transition-colors hover:text-amber-400 focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= confidence ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Time Spent */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <label className="text-xs font-semibold text-slate-400">TIME SPENT</label>
              <div className="mt-1.5 flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={timeSpent}
                  onChange={e => setTimeSpent(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">min ({(timeSpent / 60).toFixed(1)}h)</span>
                <button
                  type="button"
                  onClick={() => setTimeSpent(prev => prev + 30)}
                  className="rounded bg-indigo-600/30 px-2 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/50"
                  title="Add 30 minutes"
                >
                  +30m
                </button>
              </div>
            </div>
          </div>

          {/* Schedule & Deadlines Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>PLANNED START</span>
              </label>
              <input
                type="date"
                value={plannedStart}
                onChange={e => setPlannedStart(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>TARGET DEADLINE</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none ${
                  isOverdue
                    ? 'border-rose-500 bg-rose-950/30 focus:border-rose-400'
                    : 'border-slate-700 bg-slate-950 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>ACTUAL COMPLETED</span>
              </label>
              <input
                type="date"
                value={actualCompletedDate}
                onChange={e => setActualCompletedDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Subtask Checklist</h3>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                  {subtasks.filter(s => s.completed).length}/{subtasks.length}
                </span>
              </div>
            </div>

            {/* Subtask items list */}
            <div className="mt-3 space-y-2">
              {subtasks.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2 transition-colors hover:border-slate-700"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleSubtask(item.id)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={item.completed ? 'text-slate-500 line-through' : 'text-slate-200'}>
                      {item.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new subtask form */}
            <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Add next action / subtask..."
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Multiple Resources Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Learning Resources</h3>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                  {topic.resources?.length || 0}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddResource(!showAddResource)}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Resource</span>
              </button>
            </div>

            {/* Add resource form toggle */}
            {showAddResource && (
              <form onSubmit={handleCreateResource} className="mt-3 rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Resource Title (e.g. Official Docs)"
                    value={newResTitle}
                    onChange={e => setNewResTitle(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newResUrl}
                    onChange={e => setNewResUrl(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={newResType}
                    onChange={e => setNewResType(e.target.value as ResourceType)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="doc">📄 Documentation</option>
                    <option value="video">🎥 Video Tutorial</option>
                    <option value="course">🎓 Course</option>
                    <option value="book">📚 Book</option>
                    <option value="other">🔗 Other Link</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="rounded-lg px-3 py-1 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Save Resource
                  </button>
                </div>
              </form>
            )}

            {/* Resource list */}
            {(!topic.resources || topic.resources.length === 0) ? (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-3 text-xs text-slate-500">
                <span>No resources attached yet.</span>
                <button
                  type="button"
                  onClick={() => setShowAddResource(true)}
                  className="text-indigo-400 hover:underline"
                >
                  + Add the first resource
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {topic.resources.map(res => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getResourceIcon(res.type)}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate font-medium text-indigo-300 hover:underline hover:text-indigo-200"
                      >
                        {res.title}
                      </a>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                        {res.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onDeleteResource(res.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Markdown Notes Editor */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>STUDY NOTES (MARKDOWN)</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record architectural insights, trade-offs, code patterns, and interview takeaways..."
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 font-mono placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 p-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete topic "${topic.title}"?`)) {
                onDeleteTopic(topic.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Topic</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
