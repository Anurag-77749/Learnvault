import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Link2, 
  Video, 
  FileText, 
  BookOpen, 
  Layers, 
  X,
  Search,
  CheckCircle2
} from 'lucide-react';
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
        return <Video className="w-4 h-4 text-[#FF5500]" />;
      case 'doc':
        return <FileText className="w-4 h-4 text-[#10B981]" />;
      case 'course':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-[#9898A0]" />;
    }
  };

  return (
    <div className="space-y-6 pb-28 font-sans max-w-[1500px] mx-auto select-none">
      {/* 1. TOP VAULT COMMAND HEADER (SMOKED OBSIDIAN) */}
      <div className="smoked-glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
              KNOWLEDGE VAULT // SECOND BRAIN
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Resource Inbox & Knowledge Vault
          </h1>
          <p className="text-xs text-[#9898A0] mt-1">
            Rapidly capture articles, GitHub repos, whitepapers, and tech talks, then link them directly to syllabus topics.
          </p>
        </div>

        <div className="text-xs font-mono font-bold px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] text-white self-start md:self-auto">
          {inboxResources.length} Unsorted Links
        </div>
      </div>

      {/* 2. RAPID CAPTURE COMMAND BAR */}
      <div className="smoked-glass p-5 space-y-3">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9898A0]">
          // 5-SECOND QUICK CAPTURE ENGINE
        </h3>
        <form onSubmit={handleQuickSave} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-5">
            <input
              type="text"
              required
              placeholder="Title or topic (e.g. Raft Distributed Consensus)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="url"
              required
              placeholder="URL (https://github.com/...)"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as ResourceType)}
              className="w-full input-command-bar rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="video">Video</option>
              <option value="doc">Doc / Blog</option>
              <option value="course">Course</option>
              <option value="book">Book</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full min-h-[38px] btn-mercury rounded-xl text-xs font-black flex items-center justify-center cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. CAPTURED INBOX LIST */}
      <div className="space-y-3">
        {inboxResources.length === 0 ? (
          <div className="smoked-glass p-12 text-center text-[#9898A0] font-mono text-xs border border-dashed border-white/[0.08]">
            <CheckCircle2 className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
            <p className="text-white font-bold text-sm">Inbox Zero!</p>
            <p className="text-[11px] text-[#9898A0] mt-1">All captured engineering links have been organized into syllabus topics.</p>
          </div>
        ) : (
          inboxResources.map(res => (
            <div
              key={res.id}
              className="smoked-glass p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/[0.2] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                  {getResourceTypeIcon(res.type)}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-white">{res.title}</h4>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#9898A0] hover:text-[#FF5500] font-mono truncate block max-w-md mt-0.5 flex items-center gap-1"
                  >
                    <span>{res.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setAttachingResource(res)}
                  className="px-3.5 py-1.5 rounded-full btn-mercury text-[11px] font-mono font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Attach to Topic</span>
                </button>
                <button
                  onClick={() => handleDelete(res.id)}
                  className="p-1.5 text-[#9898A0] hover:text-rose-400 bg-white/[0.04] border border-white/[0.08] rounded-lg transition cursor-pointer"
                  title="Delete Resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. ATTACH TO TOPIC MODAL */}
      {attachingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md smoked-glass p-6 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#FF5500]" />
                <h3 className="font-display font-bold text-lg text-white">Attach to Curriculum Topic</h3>
              </div>
              <button onClick={() => setAttachingResource(null)} className="text-[#9898A0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Resource</label>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white font-medium">
                  {attachingResource.title}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Search Topics</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by topic title..."
                    value={topicSearch}
                    onChange={e => setTopicSearch(e.target.value)}
                    className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#9898A0] absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Select Topic</label>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {filteredTopics.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                        selectedTopicId === t.id
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/[0.02] text-[#9898A0] hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="truncate">{t.title}</span>
                      {selectedTopicId === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setAttachingResource(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9898A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedTopicId}
                  onClick={handleConfirmAttach}
                  className="px-5 py-2 rounded-full btn-mercury text-xs font-black shadow-md cursor-pointer disabled:opacity-30"
                >
                  Confirm Attach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
