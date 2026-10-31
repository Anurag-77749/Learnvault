import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Video,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  FileQuestion,
  BookOpen
} from 'lucide-react';
import { Track, Section, Topic, TopicStatus, TopicDifficulty, Resource } from '../types';

interface TopicsViewProps {
  tracks: Track[];
  sections: Section[];
  topics: Topic[];
  selectedTrackId: string;
  onSelectTrack: (id: string) => void;
  onUpdateTopic: (id: string, updates: Partial<Topic>) => void;
  onOpenTopicDetail: (topic: Topic) => void;
  onAddTrack: (title: string, desc: string) => void;
  onAddSection: (trackId: string, title: string) => void;
  onAddTopic: (data: { track_id: string; section_id: string; title: string }) => void;
  onDeleteTopic: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDeleteTrack: (id: string) => void;
  onReorderSections: (ids: string[]) => void;
  onReorderTopics: (ids: string[]) => void;
  onAddResource: (resource: Omit<Resource, 'id' | 'created_at'>) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  tracks,
  sections,
  topics,
  selectedTrackId,
  onSelectTrack,
  onUpdateTopic,
  onOpenTopicDetail,
  onAddTrack,
  onAddSection,
  onAddTopic,
  onDeleteTopic,
  onDeleteSection,
  onDeleteTrack,
  onReorderSections,
  onReorderTopics,
  onAddResource
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TopicStatus | 'overdue'>('all');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Quick Add Modal States
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddTopicModal, setShowAddTopicModal] = useState<string | null>(null); // sectionId
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Quick resource add inline
  const [quickResourceTopicId, setQuickResourceTopicId] = useState<string | null>(null);
  const [quickResTitle, setQuickResTitle] = useState('');
  const [quickResUrl, setQuickResUrl] = useState('');

  const activeTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];
  const activeSections = useMemo(() => {
    return sections
      .filter(s => s.track_id === (activeTrack ? activeTrack.id : ''))
      .sort((a, b) => a.order_index - b.order_index);
  }, [sections, activeTrack]);

  // Filter topics
  const today = new Date().toISOString().split('T')[0];

  const getFilteredTopicsForSection = (sectionId: string) => {
    let list = topics.filter(t => t.section_id === sectionId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
    }

    if (statusFilter === 'overdue') {
      list = list.filter(t => t.deadline && t.deadline < today && t.status !== 'done');
    } else if (statusFilter !== 'all') {
      list = list.filter(t => t.status === statusFilter);
    }

    return list.sort((a, b) => a.order_index - b.order_index);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const cycleStatus = (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    const cycleMap: Record<TopicStatus, TopicStatus> = {
      not_started: 'in_progress',
      in_progress: 'done',
      done: 'revising',
      revising: 'not_started'
    };
    const nextStatus = cycleMap[topic.status];
    const updates: Partial<Topic> = { status: nextStatus };
    if (nextStatus === 'done' && !topic.actual_completed_date) {
      updates.actual_completed_date = today;
    }
    onUpdateTopic(topic.id, updates);
  };

  const handleQuickAddResource = (e: React.FormEvent, topicId: string) => {
    e.preventDefault();
    if (!quickResTitle.trim() || !quickResUrl.trim()) return;

    onAddResource({
      topic_id: topicId,
      title: quickResTitle.trim(),
      url: quickResUrl.trim(),
      type: quickResUrl.includes('youtube.com') || quickResUrl.includes('youtu.be') ? 'video' : 'doc'
    });

    setQuickResourceTopicId(null);
    setQuickResTitle('');
    setQuickResUrl('');
  };

  const moveTopic = (sectionId: string, topicId: string, direction: 'up' | 'down') => {
    const secTopics = topics.filter(t => t.section_id === sectionId).sort((a, b) => a.order_index - b.order_index);
    const index = secTopics.findIndex(t => t.id === topicId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === secTopics.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = secTopics[index];
    secTopics[index] = secTopics[targetIndex];
    secTopics[targetIndex] = temp;

    onReorderTopics(secTopics.map(t => t.id));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const list = [...activeSections];
    const index = list.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    onReorderSections(list.map(s => s.id));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Track Selection Horizontal Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Roadmap Tracks ({tracks.length})
          </h2>
          <button
            onClick={() => {
              const name = prompt('Enter new Track title:');
              if (name) {
                const desc = prompt('Enter Track description:') || '';
                onAddTrack(name, desc);
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Track</span>
          </button>
        </div>

        {/* Scrollable Track Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tracks.map(track => {
            const trackTopicCount = topics.filter(t => t.track_id === track.id).length;
            const trackCompleted = topics.filter(t => t.track_id === track.id && t.status === 'done').length;
            const isSelected = track.id === activeTrack?.id;

            return (
              <button
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                    : 'border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{track.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {trackCompleted}/{trackTopicCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Track Banner */}
      {activeTrack && (
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white sm:text-xl">{activeTrack.title}</h3>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                  {activeSections.length} Sections
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">{activeTrack.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddSectionModal(true)}
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics, keywords, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none min-h-[44px]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all min-h-[38px] ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all min-h-[38px] ${
              statusFilter === 'not_started'
                ? 'bg-slate-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            ⚪ Not Started
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all min-h-[38px] ${
              statusFilter === 'in_progress'
                ? 'bg-amber-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-amber-400 hover:text-amber-300'
            }`}
          >
            🟡 In Progress
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all min-h-[38px] ${
              statusFilter === 'done'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            🟢 Done
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all min-h-[38px] ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-rose-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Overdue</span>
          </button>
        </div>
      </div>

      {/* Sections & Topics Accordion List */}
      <div className="space-y-4">
        {activeSections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
            <p className="text-sm">No sections found in this track.</p>
            <button
              onClick={() => setShowAddSectionModal(true)}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Create Section</span>
            </button>
          </div>
        ) : (
          activeSections.map(section => {
            const sectionTopics = getFilteredTopicsForSection(section.id);
            const allSecTopics = topics.filter(t => t.section_id === section.id);
            const completedCount = allSecTopics.filter(t => t.status === 'done').length;
            const isCollapsed = collapsedSections[section.id];

            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 transition-all hover:border-slate-700/80"
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex cursor-pointer items-center justify-between bg-slate-950/60 p-4 transition-colors hover:bg-slate-950"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-white"
                      title={isCollapsed ? 'Expand section' : 'Collapse section'}
                    >
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white sm:text-base">{section.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {completedCount} of {allSecTopics.length} completed
                      </p>
                    </div>
                  </div>

                  {/* Section Controls */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      className="p-1 text-slate-500 hover:text-slate-200"
                      title="Move section up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      className="p-1 text-slate-500 hover:text-slate-200"
                      title="Move section down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setShowAddTopicModal(section.id)}
                      className="flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-800"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Add Topic</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete section "${section.title}" and its topics?`)) {
                          onDeleteSection(section.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                      title="Delete section"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Topics Container */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-800/50 p-2 sm:p-3">
                    {sectionTopics.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500">
                        No topics match the current filter.
                      </div>
                    ) : (
                      sectionTopics.map(topic => {
                        const isOverdue =
                          topic.deadline &&
                          topic.deadline < today &&
                          topic.status !== 'done';

                        const videoResources = (topic.resources || []).filter(r => r.type === 'video');
                        const hasResources = (topic.resources || []).length > 0;

                        return (
                          <div
                            key={topic.id}
                            onClick={() => onOpenTopicDetail(topic)}
                            className="group flex flex-col gap-2 rounded-xl p-3 transition-colors hover:bg-slate-800/40 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                          >
                            {/* Left: Status cycle button + Topic title + Video shortcuts */}
                            <div className="flex items-start gap-3 sm:items-center">
                              {/* Status Badge (Tap to cycle) */}
                              <button
                                type="button"
                                onClick={e => cycleStatus(e, topic)}
                                className={`mt-0.5 sm:mt-0 flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                                  topic.status === 'done'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : topic.status === 'in_progress'
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : topic.status === 'revising'
                                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                                title="Click to cycle status"
                              >
                                {topic.status === 'done' && '🟢 Done'}
                                {topic.status === 'in_progress' && '🟡 In Progress'}
                                {topic.status === 'revising' && '🟣 Revising'}
                                {topic.status === 'not_started' && '⚪ Not Started'}
                              </button>

                              {/* Title & Attached Video Link */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-sm font-medium ${topic.status === 'done' ? 'text-slate-400 line-through' : 'text-white'}`}>
                                  {topic.title}
                                </span>

                                {/* Overdue Alert Flag */}
                                {isOverdue && (
                                  <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Overdue</span>
                                  </span>
                                )}

                                {/* Attached Video Badges with title and link shown beside topic name */}
                                {videoResources.map(vid => (
                                  <a
                                    key={vid.id}
                                    href={vid.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300 border border-rose-500/20 hover:bg-rose-500/20"
                                    title={`Watch Video: ${vid.title}`}
                                  >
                                    <Video className="h-3 w-3 text-rose-400" />
                                    <span className="max-w-[120px] truncate sm:max-w-[180px]">{vid.title}</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                  </a>
                                ))}

                                {/* If topic has NO resource yet: show 'no resource yet' and let me add one */}
                                {!hasResources && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setQuickResourceTopicId(topic.id);
                                    }}
                                    className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700/60 hover:text-indigo-300 hover:border-indigo-500/30"
                                    title="Add learning resource"
                                  >
                                    <BookOpen className="h-2.5 w-2.5" />
                                    <span>no resource yet</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Right: Metadata Pills & Action Controls */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0">
                              <div className="flex items-center gap-2">
                                {/* Difficulty */}
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                    topic.difficulty === 'hard'
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      : topic.difficulty === 'easy'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}
                                >
                                  {topic.difficulty}
                                </span>

                                {/* Confidence Stars */}
                                <div className="hidden sm:flex items-center text-amber-400" title={`Confidence: ${topic.confidence}/5`}>
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  <span className="text-[11px] font-semibold ml-0.5">{topic.confidence}</span>
                                </div>

                                {/* Time Spent */}
                                {topic.time_spent_mins > 0 && (
                                  <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                                    <Clock className="h-3 w-3 text-slate-500" />
                                    <span>{topic.time_spent_mins}m</span>
                                  </span>
                                )}

                                {/* Subtasks badge */}
                                {topic.subtasks && topic.subtasks.length > 0 && (
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                                    {topic.subtasks.filter(s => s.completed).length}/{topic.subtasks.length}
                                  </span>
                                )}
                              </div>

                              {/* Topic reorder up/down */}
                              <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => moveTopic(section.id, topic.id, 'up')}
                                  className="p-1 text-slate-500 hover:text-slate-200"
                                  title="Move up"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveTopic(section.id, topic.id, 'down')}
                                  className="p-1 text-slate-500 hover:text-slate-200"
                                  title="Move down"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenTopicDetail(topic)}
                                  className="p-1 text-indigo-400 hover:text-indigo-300"
                                  title="Edit topic details"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Resource Inline Modal */}
      {quickResourceTopicId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Learning Resource</h3>
            <p className="mt-1 text-xs text-slate-400">
              Attach a documentation link, YouTube video tutorial, or book to this topic.
            </p>
            <form onSubmit={e => handleQuickAddResource(e, quickResourceTopicId)} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g. Official Documentation / Video Breakdown"
                  value={quickResTitle}
                  onChange={e => setQuickResTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={quickResUrl}
                  onChange={e => setQuickResUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickResourceTopicId(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create New Section</h3>
            <p className="mt-1 text-xs text-slate-400">
              Add a section to Track: <span className="font-semibold text-indigo-400">{activeTrack?.title}</span>
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newSectionTitle.trim() && activeTrack) {
                  onAddSection(activeTrack.id, newSectionTitle.trim());
                  setNewSectionTitle('');
                  setShowAddSectionModal(false);
                }
              }}
              className="mt-4 space-y-3"
            >
              <input
                type="text"
                placeholder="Section title (e.g. Distributed Consensus)"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Topic</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newTopicTitle.trim() && activeTrack && showAddTopicModal) {
                  onAddTopic({
                    track_id: activeTrack.id,
                    section_id: showAddTopicModal,
                    title: newTopicTitle.trim()
                  });
                  setNewTopicTitle('');
                  setShowAddTopicModal(null);
                }
              }}
              className="mt-4 space-y-3"
            >
              <input
                type="text"
                placeholder="Topic name (e.g. Raft Consensus Algorithm)"
                value={newTopicTitle}
                onChange={e => setNewTopicTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
