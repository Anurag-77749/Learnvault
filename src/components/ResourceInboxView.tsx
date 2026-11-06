import React, { useState, useEffect } from 'react';
import { Resource, ResourceType, Track, Section, Topic } from '../types';
import { dataService } from '../services/dataService';

export const ResourceInboxView: React.FC = () => {
  const [inboxResources, setInboxResources] = useState<Resource[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Quick save inputs
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<ResourceType>('video');

  // Attach modal
  const [attachingResource, setAttachingResource] = useState<Resource | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState('');

  const loadData = () => {
    setInboxResources(dataService.getInboxResources());
    setTracks(dataService.getTracks());
    setSections(dataService.getSections());
    setTopics(dataService.getTopics());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    dataService.addToInbox({
      title: newTitle.trim(),
      url: newUrl.trim(),
      type: newType
    });

    setNewTitle('');
    setNewUrl('');
    loadData();
  };

  const handleDelete = (id: string) => {
    dataService.deleteInboxResource(id);
    loadData();
  };

  const handleConfirmAttach = () => {
    if (!attachingResource || !selectedTopicId) return;
    dataService.attachInboxResourceToTopic(attachingResource.id, selectedTopicId);
    setAttachingResource(null);
    setSelectedTopicId('');
    loadData();
  };

  const filteredTopics = topicSearch
    ? topics.filter(t => t.title.toLowerCase().includes(topicSearch.toLowerCase()))
    : topics.slice(0, 40);

  const getResourceTypeIcon = (t: ResourceType) => {
    switch (t) {
      case 'video':
        return '📹';
      case 'doc':
        return '📄';
      case 'course':
        return '🎓';
      case 'book':
        return '📖';
      default:
        return '🔗';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📥</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Resource Inbox</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Rapidly capture articles, GitHub repos, talks, and docs on your phone or laptop, then link them to roadmap topics when ready.
          </p>
        </div>
        <div className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800/60 self-start sm:self-auto">
          {inboxResources.length} Unsorted Links
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          ⚡ 5-Second Quick Capture
        </h3>
        <form onSubmit={handleQuickSave} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              placeholder="Title or topic (e.g. Raft Consensus Lecture)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="url"
              required
              placeholder="URL (https://...)"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as ResourceType)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="video">📹 Video</option>
              <option value="doc">📄 Doc / Blog</option>
              <option value="course">🎓 Course</option>
              <option value="book">📖 Book</option>
              <option value="other">🔗 Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl py-2.5 transition shadow-lg shadow-indigo-600/20"
            >
              + Save Link
            </button>
          </div>
        </form>
      </div>

      {/* Inbox List */}
      <div className="space-y-3">
        {inboxResources.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <span className="text-3xl block mb-2">🎉</span>
            <p className="text-base text-slate-300 font-medium">Inbox zero!</p>
            <p className="text-xs text-slate-500 mt-1">All captured links have been attached to roadmap topics.</p>
          </div>
        ) : (
          inboxResources.map(res => (
            <div
              key={res.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                  {getResourceTypeIcon(res.type)}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white">{res.title}</h4>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition truncate max-w-md block mt-0.5"
                  >
                    {res.url} ↗
                  </a>
                  {res.created_at && (
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Saved {res.created_at.split('T')[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    setAttachingResource(res);
                    setSelectedTopicId(topics[0]?.id || '');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Attach to Topic ➔
                </button>
                <button
                  onClick={() => handleDelete(res.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attach Modal */}
      {attachingResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-2">Attach Resource to Roadmap Topic</h2>
            <p className="text-xs text-slate-400 mb-4 truncate">
              {attachingResource.title} ({attachingResource.url})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Search Topics (408 Total Roadmap Topics)
                </label>
                <input
                  type="text"
                  placeholder="Filter by keyword (e.g. pgvector, Raft, Docker...)"
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Roadmap Topic</label>
                <select
                  size={8}
                  value={selectedTopicId}
                  onChange={e => setSelectedTopicId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {filteredTopics.map(t => {
                    const sec = sections.find(s => s.id === t.section_id)?.title || '';
                    return (
                      <option key={t.id} value={t.id} className="p-1">
                        [{sec}] {t.title}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAttachingResource(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAttach}
                  disabled={!selectedTopicId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Confirm Attach ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
