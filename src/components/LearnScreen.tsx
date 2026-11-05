import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Upload, 
  FileText, 
  Video, 
  ExternalLink, 
  Calendar, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Link2
} from 'lucide-react';
import { db, CurriculumTopic, SubtopicItem, getTodayDateString } from '../services/db';
import { 
  seedCurriculumIfEmpty, 
  toggleSubtopicCompletion, 
  updateSubtopic, 
  addSubtopic, 
  renameSubtopic, 
  deleteSubtopic, 
  reorderSubtopics,
  updateTopic,
  addResourceToTopic,
  addTopic,
  deleteTopic
} from '../services/curriculumService';
import { CoverageReportModal } from './modals/CoverageReportModal';
import { PasteImportModal } from './modals/PasteImportModal';
import { triggerGoldSparkle } from '../utils/confetti';

export const TRACK_TITLES: { [id: number]: string } = {
  0: 'Track 0: Introduction',
  1: 'Track 1: CS Basics (Languages)',
  2: 'Track 2: DSA & System Design',
  3: 'Track 3: Git & GitHub',
  4: 'Track 4: Linux Skills',
  5: 'Track 5: Frontend Skills',
  6: 'Track 6: Backend Skills',
  7: 'Track 7: Data Engineering',
  8: 'Track 8: AI Engineering',
  9: 'Track 9: DevOps & Cloud',
  10: 'Track 10: Production AI Systems',
  11: 'Track 11: Field Skills',
  12: 'Track 12: Communication, English & ADSD',
};

export const LearnScreen: React.FC = () => {
  const today = getTodayDateString();

  // Auto-seed curriculum on mount
  useEffect(() => {
    seedCurriculumIfEmpty();
  }, []);

  const allTopics = useLiveQuery(() => db.curriculumTopics.orderBy('orderIndex').toArray()) || [];

  const [selectedTrack, setSelectedTrack] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Modals state
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Resource adding state
  const [resourceTopicId, setResourceTopicId] = useState<string | null>(null);
  const [resourceSubtopicId, setResourceSubtopicId] = useState<string | null>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  // Editing state for rename
  const [editingSubtopicId, setEditingSubtopicId] = useState<string | null>(null);
  const [editingSubtopicTitle, setEditingSubtopicTitle] = useState('');

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');

  // New subtopic inline inputs per topic: { [topicId]: string }
  const [newSubtopicTexts, setNewSubtopicTexts] = useState<{ [topicId: string]: string }>({});

  // Notes editing state
  const [notesModalData, setNotesModalData] = useState<{ topicId: string; subtopicId?: string; title: string; notes: string } | null>(null);

  // Auto-expand first topic if none expanded
  useEffect(() => {
    if (allTopics.length > 0 && !expandedTopicId) {
      const firstInTrack = allTopics.find((t) => t.trackId === selectedTrack);
      if (firstInTrack) {
        setExpandedTopicId(firstInTrack.id);
      }
    }
  }, [allTopics, selectedTrack, expandedTopicId]);

  // Compute stats per track
  const trackStats = React.useMemo(() => {
    const stats: { [trackId: number]: { total: number; completed: number; percent: number } } = {};
    for (let i = 0; i <= 12; i++) {
      stats[i] = { total: 0, completed: 0, percent: 0 };
    }
    allTopics.forEach((t) => {
      const count = t.subtopics.length;
      const done = t.subtopics.filter((s) => s.completed).length;
      if (!stats[t.trackId]) {
        stats[t.trackId] = { total: 0, completed: 0, percent: 0 };
      }
      stats[t.trackId].total += count;
      stats[t.trackId].completed += done;
    });
    Object.keys(stats).forEach((k) => {
      const id = Number(k);
      const { total, completed } = stats[id];
      stats[id].percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    return stats;
  }, [allTopics]);

  // Filter topics based on search or selected track
  const filteredTopics = React.useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return allTopics.filter(
        (t) =>
          t.topicTitle.toLowerCase().includes(q) ||
          t.trackTitle.toLowerCase().includes(q) ||
          t.subtopics.some((s) => s.title.toLowerCase().includes(q))
      );
    }
    return allTopics.filter((t) => t.trackId === selectedTrack);
  }, [allTopics, selectedTrack, searchQuery]);

  const handleToggleSubtopic = async (topicId: string, sub: SubtopicItem, e: React.MouseEvent) => {
    const nextState = !sub.completed;
    if (nextState) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      triggerGoldSparkle(x, y);
    }
    await toggleSubtopicCompletion(topicId, sub.id, nextState);
  };

  const handleAddSubtopic = async (topicId: string) => {
    const text = newSubtopicTexts[topicId]?.trim();
    if (!text) return;
    await addSubtopic(topicId, text);
    setNewSubtopicTexts((prev) => ({ ...prev, [topicId]: '' }));
  };

  const handleSaveSubtopicRename = async (topicId: string, subtopicId: string) => {
    if (editingSubtopicTitle.trim()) {
      await renameSubtopic(topicId, subtopicId, editingSubtopicTitle.trim());
    }
    setEditingSubtopicId(null);
  };

  const handleSaveTopicRename = async (topicId: string) => {
    if (editingTopicTitle.trim()) {
      await updateTopic(topicId, { topicTitle: editingTopicTitle.trim() });
    }
    setEditingTopicId(null);
  };

  const handleMoveSubtopic = async (topic: CurriculumTopic, index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= topic.subtopics.length) return;
    const ids = topic.subtopics.map((s) => s.id);
    const temp = ids[index];
    ids[index] = ids[newIdx];
    ids[newIdx] = temp;
    await reorderSubtopics(topic.id, ids);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceUrl.trim() || !resourceTopicId) return;

    if (resourceSubtopicId) {
      const topic = allTopics.find((t) => t.id === resourceTopicId);
      const sub = topic?.subtopics.find((s) => s.id === resourceSubtopicId);
      if (sub) {
        const isVideo = resourceUrl.includes('youtube') || resourceUrl.includes('youtu.be') || resourceUrl.includes('vimeo') || resourceUrl.includes('loom');
        const resources = sub.resources || [];
        resources.push({
          title: resourceTitle.trim() || resourceUrl.trim(),
          url: resourceUrl.trim(),
          isVideo,
        });
        await updateSubtopic(resourceTopicId, resourceSubtopicId, { resources });
      }
    } else {
      await addResourceToTopic(resourceTopicId, resourceTitle, resourceUrl);
    }

    setResourceTopicId(null);
    setResourceSubtopicId(null);
    setResourceTitle('');
    setResourceUrl('');
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    const trackTitle = TRACK_TITLES[selectedTrack] || `Track ${selectedTrack}`;
    await addTopic(selectedTrack, trackTitle, newTopicName.trim());
    setNewTopicName('');
    setShowAddTopicModal(false);
  };

  const handleSaveNotes = async () => {
    if (!notesModalData) return;
    if (notesModalData.subtopicId) {
      await updateSubtopic(notesModalData.topicId, notesModalData.subtopicId, {
        notes: notesModalData.notes,
      });
    } else {
      await updateTopic(notesModalData.topicId, {
        notes: notesModalData.notes,
      });
    }
    setNotesModalData(null);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5 mb-1 font-sans">
            <BookOpen className="w-3.5 h-3.5" /> 4-Year Curriculum Engine
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Curriculum & Topics
          </h1>
          <p className="text-xs sm:text-sm text-[#B8B0AA] font-sans mt-0.5">
            Strict learning order from day 1 to elite Forward Deployed Engineering
          </p>
        </div>

        {/* Action Buttons: Coverage Report & Paste Import */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCoverageModal(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#160406] border border-[#360A0F] hover:border-[#D4AF37] text-shiny-gold transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Coverage Report</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#160406] border border-[#360A0F] text-white hover:border-[#D4AF37] transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
          >
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            <span>Import List</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#B8B0AA] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics, subtopics, concepts (e.g. 'Binary Search', 'Docker', 'RAG')..."
          className="w-full min-h-[46px] pl-11 pr-4 py-2.5 rounded-2xl bg-black border border-[#360A0F] text-white placeholder-[#B8B0AA]/50 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors font-sans shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#B8B0AA] hover:text-[#D4AF37] px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Track Selector Tabs (when not searching) */}
      {!searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
            {Object.entries(TRACK_TITLES).map(([idStr, title]) => {
              const trackId = Number(idStr);
              const isSelected = selectedTrack === trackId;
              const stats = trackStats[trackId] || { total: 0, completed: 0, percent: 0 };
              return (
                <button
                  key={trackId}
                  onClick={() => {
                    setSelectedTrack(trackId);
                    setExpandedTopicId(null);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'btn-shiny-gold shadow-lg shadow-[#D4AF37]/20 font-bold'
                      : 'bg-[#160406] text-[#B8B0AA] border-[#360A0F] hover:border-[#D4AF37]/60 hover:text-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-black text-[#D4AF37]' : 'bg-black/60 text-[#B8B0AA]'
                  }`}>
                    {trackId}
                  </span>
                  <span className="truncate max-w-[150px]">{title.replace(/Track \d+:\s*/, '')}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-black text-[#D4AF37]'
                  }`}>
                    {stats.percent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Track Banner */}
          <div className="p-4 rounded-3xl card-maroon-gold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-shiny-gold font-bold">Active Track</span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {TRACK_TITLES[selectedTrack]}
              </h2>
              <p className="text-xs text-[#B8B0AA] font-sans mt-0.5">
                {trackStats[selectedTrack]?.completed || 0} of {trackStats[selectedTrack]?.total || 0} subtopics mastered
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xl font-bold text-shiny-gold font-serif">
                  {trackStats[selectedTrack]?.percent || 0}%
                </span>
                <div className="w-28 bg-black rounded-full h-2.5 border border-[#D4AF37]/45 mt-1 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] h-full transition-all duration-300 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    style={{ width: `${trackStats[selectedTrack]?.percent || 0}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowAddTopicModal(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-black border border-[#D4AF37]/40 hover:border-[#D4AF37] text-shiny-gold text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Topic</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-10 rounded-3xl card-maroon-gold text-center space-y-3">
            <p className="text-sm text-[#B8B0AA]">No topics found matching your query.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-shiny-gold underline font-bold"
              >
                Reset search
              </button>
            )}
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isExpanded = expandedTopicId === topic.id;
            const completedCount = topic.subtopics.filter((s) => s.completed).length;
            const totalCount = topic.subtopics.length;
            const topicPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isFullyDone = totalCount > 0 && completedCount === totalCount;

            // Check overdue
            const isOverdue = topic.deadline && topic.deadline < today && !isFullyDone;

            const topicResources = topic.resources || [];
            const videoResources = topicResources.filter((r) => r.isVideo);

            return (
              <div
                key={topic.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'card-maroon-gold shadow-2xl'
                    : 'card-maroon hover:border-[#D4AF37]/50 shadow-md'
                }`}
              >
                {/* Topic Header Accordion Bar */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shrink-0 hover:bg-[#D4AF37]/10 transition-colors"
                      aria-label="Toggle Topic"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {editingTopicId === topic.id ? (
                          <div className="flex items-center gap-2 w-full max-w-md">
                            <input
                              type="text"
                              value={editingTopicTitle}
                              onChange={(e) => setEditingTopicTitle(e.target.value)}
                              className="w-full px-2.5 py-1 rounded-xl bg-black border border-[#D4AF37] text-sm text-[#F9F6EE] focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveTopicRename(topic.id)}
                              className="px-2 py-1 bg-[#D4AF37] text-black font-semibold text-xs rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTopicId(null)}
                              className="px-2 py-1 text-xs text-[#A09D95]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <h3
                              onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                              className="font-serif text-lg sm:text-xl font-bold text-[#F9F6EE] cursor-pointer hover:text-[#D4AF37] transition-colors"
                            >
                              {topic.topicTitle}
                            </h3>
                            <button
                              onClick={() => {
                                setEditingTopicId(topic.id);
                                setEditingTopicTitle(topic.topicTitle);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[#A09D95] hover:text-[#D4AF37] transition-opacity"
                              title="Rename topic"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Overdue badge */}
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </span>
                        )}

                        {/* Video Links Displayed Next to Topic Name */}
                        {videoResources.map((v, idx) => (
                          <a
                            key={idx}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-200 hover:text-white hover:border-red-400 text-[11px] font-medium transition-colors"
                            title={v.title}
                          >
                            <Video className="w-3 h-3 text-red-400" />
                            <span className="truncate max-w-[120px]">{v.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ))}
                      </div>

                      {/* Topic Sub-bar: stats & resources indicator */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#A09D95] font-sans">
                        <span>
                          {completedCount}/{totalCount} subtopics ({topicPercent}%)
                        </span>

                        {topic.deadline && (
                          <span className="flex items-center gap-1 text-[11px] text-[#A09D95]">
                            <Calendar className="w-3 h-3 text-[#D4AF37]" />
                            Due: {topic.deadline}
                          </span>
                        )}

                        {topicResources.length === 0 ? (
                          <span className="text-[11px] text-[#6B6860] italic">no resource yet</span>
                        ) : (
                          <span className="text-[11px] text-[#D4AF37] flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> {topicResources.length} resources
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress bar & action buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="w-24 bg-black rounded-full h-2 border border-[#D4AF37]/30 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFullyDone ? 'bg-[#39D353]' : 'bg-[#D4AF37]'
                          }`}
                          style={{ width: `${topicPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setResourceTopicId(topic.id);
                        setResourceSubtopicId(null);
                      }}
                      className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-black border border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37] text-xs font-medium transition-colors flex items-center gap-1"
                      title="Add resource to topic"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Resource</span>
                    </button>

                    <button
                      onClick={() =>
                        setNotesModalData({
                          topicId: topic.id,
                          title: topic.topicTitle,
                          notes: topic.notes || '',
                        })
                      }
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-[#D4AF37]/30 text-[#A09D95] hover:text-[#D4AF37] hover:border-[#D4AF37] flex items-center justify-center transition-colors"
                      title="Topic notes"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete topic "${topic.topicTitle}" and all its subtopics?`)) {
                          await deleteTopic(topic.id);
                        }
                      }}
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-red-900/30 text-red-400 hover:text-red-300 hover:border-red-500/50 flex items-center justify-center transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Topic Resources & Subtopics */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[#360A0F] p-4 sm:p-5 bg-[#000000] space-y-4"
                    >
                      {/* Topic Level Resources List */}
                      {topicResources.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-[#160406] border border-[#360A0F]">
                          <span className="text-[11px] font-semibold text-shiny-gold uppercase tracking-wider block mb-2">
                            Topic Resources
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {topicResources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#000000] border border-[#360A0F] hover:border-[#D4AF37] text-xs text-white hover:text-shiny-gold transition-colors"
                              >
                                {res.isVideo ? <Video className="w-3.5 h-3.5 text-red-400" /> : <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                                <span>{res.title}</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subtopics Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#B8B0AA] uppercase tracking-wider px-1">
                          <span>Subtopics ({topic.subtopics.length})</span>
                          <span>Learning Order</span>
                        </div>

                        {topic.subtopics.map((sub, sIdx) => {
                          const subOverdue = sub.deadline && sub.deadline < today && !sub.completed;

                          return (
                            <div
                              key={sub.id}
                              className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                sub.completed
                                  ? 'bg-[#000000] border-[#360A0F] opacity-85'
                                  : 'bg-[#160406] border-[#360A0F] hover:border-[#D4AF37]/50'
                              }`}
                            >
                              {/* Left: Checkbox + Title / Rename */}
                              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={(e) => handleToggleSubtopic(topic.id, sub, e)}
                                  className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                                    sub.completed
                                      ? 'btn-shiny-gold shadow-md shadow-[#D4AF37]/30'
                                      : 'bg-black border-[#360A0F] hover:border-[#D4AF37] text-transparent'
                                  }`}
                                  aria-label={sub.completed ? 'Mark subtopic incomplete' : 'Mark subtopic complete'}
                                >
                                  <Check className={`w-5 h-5 stroke-[3] ${sub.completed ? 'text-black' : 'text-transparent'}`} />
                                </button>

                                <div className="flex-1 min-w-0">
                                  {editingSubtopicId === sub.id ? (
                                    <div className="flex items-center gap-2 max-w-md">
                                      <input
                                        type="text"
                                        value={editingSubtopicTitle}
                                        onChange={(e) => setEditingSubtopicTitle(e.target.value)}
                                        className="w-full px-2 py-1 rounded-xl bg-black border border-[#D4AF37] text-xs text-[#F9F6EE] focus:outline-none"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleSaveSubtopicRename(topic.id, sub.id)}
                                        className="px-2 py-1 bg-[#D4AF37] text-black text-xs font-semibold rounded-lg"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingSubtopicId(null)}
                                        className="px-2 py-1 text-xs text-[#A09D95]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-2 group">
                                      <span
                                        className={`text-sm font-medium font-sans ${
                                          sub.completed
                                            ? 'line-through text-[#807D75]'
                                            : 'text-[#F9F6EE]'
                                        }`}
                                      >
                                        {sub.title}
                                      </span>

                                      <button
                                        onClick={() => {
                                          setEditingSubtopicId(sub.id);
                                          setEditingSubtopicTitle(sub.title);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-[#A09D95] hover:text-[#D4AF37] transition-opacity"
                                        title="Rename subtopic"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>

                                      {subOverdue && (
                                        <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-[9px] font-bold uppercase">
                                          Overdue
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Subtopic Resources & Deadlines */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#A09D95]">
                                    {sub.completedDate && (
                                      <span className="text-[#D4AF37]">Done: {sub.completedDate}</span>
                                    )}

                                    {sub.deadline && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5 text-[#D4AF37]" />
                                        Due: {sub.deadline}
                                      </span>
                                    )}

                                    {sub.resources?.map((r, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline"
                                      >
                                        {r.isVideo ? <Video className="w-2.5 h-2.5 text-red-400" /> : <Link2 className="w-2.5 h-2.5" />}
                                        <span className="truncate max-w-[100px]">{r.title}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Status selector, notes, reorder, delete */}
                              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                {/* Status dropdown */}
                                <select
                                  value={sub.status || (sub.completed ? 'done' : 'not_started')}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value as any;
                                    const isDone = newStatus === 'done';
                                    await updateSubtopic(topic.id, sub.id, {
                                      status: newStatus,
                                      completed: isDone,
                                      completedDate: isDone ? today : undefined,
                                    });
                                  }}
                                  style={{ colorScheme: 'dark' }} className="min-h-[44px] px-2.5 py-1 rounded-xl bg-[#0E0205] border border-[#D4AF37]/30 text-xs text-[#F9F6EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                                >
                                  <option value="not_started" className="bg-[#160406] text-white py-1">Not Started</option>
                                  <option value="learning" className="bg-[#160406] text-white py-1">Learning</option>
                                  <option value="done" className="bg-[#160406] text-white py-1">Done</option>
                                  <option value="revising" className="bg-[#160406] text-white py-1">Revising</option>
                                </select>

                                {/* Add resource button */}
                                <button
                                  onClick={() => {
                                    setResourceTopicId(topic.id);
                                    setResourceSubtopicId(sub.id);
                                  }}
                                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-[#D4AF37]/30 text-[#A09D95] hover:text-[#D4AF37] hover:border-[#D4AF37] flex items-center justify-center transition-colors"
                                  title="Add resource to subtopic"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Notes modal button */}
                                <button
                                  onClick={() =>
                                    setNotesModalData({
                                      topicId: topic.id,
                                      subtopicId: sub.id,
                                      title: sub.title,
                                      notes: sub.notes || '',
                                    })
                                  }
                                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-[#D4AF37]/30 text-[#A09D95] hover:text-[#D4AF37] hover:border-[#D4AF37] flex items-center justify-center transition-colors"
                                  title="Subtopic notes"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>

                                {/* Move Up */}
                                <button
                                  onClick={() => handleMoveSubtopic(topic, sIdx, 'up')}
                                  disabled={sIdx === 0}
                                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-[#D4AF37]/20 text-[#A09D95] hover:text-[#D4AF37] disabled:opacity-30 flex items-center justify-center"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>

                                {/* Move Down */}
                                <button
                                  onClick={() => handleMoveSubtopic(topic, sIdx, 'down')}
                                  disabled={sIdx === topic.subtopics.length - 1}
                                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-[#D4AF37]/20 text-[#A09D95] hover:text-[#D4AF37] disabled:opacity-30 flex items-center justify-center"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Subtopic */}
                                <button
                                  onClick={async () => {
                                    if (confirm(`Delete subtopic "${sub.title}"?`)) {
                                      await deleteSubtopic(topic.id, sub.id);
                                    }
                                  }}
                                  className="min-h-[44px] min-w-[44px] rounded-xl bg-black border border-red-900/30 text-red-400 hover:text-red-300 hover:border-red-500/50 flex items-center justify-center transition-colors"
                                  title="Delete subtopic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Inline Add Subtopic Input */}
                        <div className="pt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={newSubtopicTexts[topic.id] || ''}
                            onChange={(e) =>
                              setNewSubtopicTexts((prev) => ({
                                ...prev,
                                [topic.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubtopic(topic.id);
                            }}
                            placeholder="+ Add subtopic in learning order..."
                            className="flex-1 min-h-[44px] px-3.5 py-2 rounded-2xl bg-black border border-[#D4AF37]/30 text-[#F9F6EE] placeholder-[#6B6860] text-xs focus:outline-none focus:border-[#D4AF37] font-sans"
                          />
                          <button
                            onClick={() => handleAddSubtopic(topic.id)}
                            className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#FFD700] transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Coverage Report Modal */}
      <CoverageReportModal
        isOpen={showCoverageModal}
        onClose={() => setShowCoverageModal(false)}
        topics={allTopics}
        onResetOfficialCurriculum={async () => {
          if (confirm('Reset entire curriculum back to official Part 3 Source of Truth? Custom items will be replaced.')) {
            await seedCurriculumIfEmpty(true);
            setShowCoverageModal(false);
          }
        }}
      />

      {/* Paste Import Modal */}
      <PasteImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          // Topics refreshed automatically via useLiveQuery
        }}
      />

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#121212] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-serif text-2xl font-bold text-[#F9F6EE]">
              Add New Topic
            </h3>
            <p className="text-xs text-[#A09D95]">
              Adding to: <span className="text-[#D4AF37] font-semibold">{TRACK_TITLES[selectedTrack]}</span>
            </p>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Topic name (e.g. Distributed Consensus, Redis Internals)..."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl bg-black border border-[#D4AF37]/35 text-[#F9F6EE] placeholder-[#6B6860] text-sm focus:outline-none focus:border-[#D4AF37]"
                autoFocus
                required
              />
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-[#A09D95] hover:text-[#F9F6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-2xl bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#FFD700] transition-colors"
                >
                  Create Topic
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Resource Modal */}
      {resourceTopicId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#121212] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-serif text-2xl font-bold text-[#F9F6EE]">
              Add Resource Link
            </h3>
            <p className="text-xs text-[#A09D95]">
              Add documentation, YouTube video, tutorial, or GitHub repository.
            </p>
            <form onSubmit={handleSaveResource} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="e.g. MIT 6.006 Lecture 3, Official Docs..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#D4AF37]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A09D95] uppercase block mb-1">
                  URL <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#D4AF37]/35 text-[#F9F6EE] text-sm focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResourceTopicId(null);
                    setResourceSubtopicId(null);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-[#A09D95] hover:text-[#F9F6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-2xl bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#FFD700] transition-colors"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Notes Modal */}
      {notesModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#121212] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-semibold">Notes</span>
              <h3 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                {notesModalData.title}
              </h3>
            </div>

            <textarea
              value={notesModalData.notes}
              onChange={(e) =>
                setNotesModalData((prev) =>
                  prev ? { ...prev, notes: e.target.value } : null
                )
              }
              placeholder="Write your study notes, personal reminders, or key concepts here..."
              rows={8}
              className="w-full p-3.5 rounded-2xl bg-black border border-[#D4AF37]/35 text-[#F9F6EE] placeholder-[#6B6860] text-sm focus:outline-none focus:border-[#D4AF37] font-sans"
            />

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setNotesModalData(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-[#A09D95] hover:text-[#F9F6EE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="min-h-[44px] px-5 py-2 rounded-2xl bg-[#D4AF37] text-black font-semibold text-xs hover:bg-[#FFD700] transition-colors"
              >
                Save Notes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};