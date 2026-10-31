import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    Array<{
      id: string;
      type: 'topic' | 'section' | 'track' | 'dsa' | 'project' | 'resource';
      title: string;
      subtitle: string;
      routeTab: string;
    }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const res = dataService.globalSearch(query);
    setResults(res);
  }, [query]);

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (routeTab: string, id: string) => {
    onNavigateTab(routeTab, id);
    onClose();
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'topic':
        return '🗺️';
      case 'dsa':
        return '🧠';
      case 'project':
        return '🛠️';
      case 'resource':
        return '📥';
      default:
        return '🔍';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 p-4 flex items-center gap-3">
          <span className="text-slate-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a topic, algorithm, project, job, or resource... (Esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-base focus:outline-none placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="px-2 py-1 text-slate-500 hover:text-slate-300 text-xs font-mono bg-slate-800 rounded border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {query.trim() && results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No results found for "<span className="text-slate-300">{query}</span>"
            </div>
          ) : !query.trim() ? (
            <div className="p-6 text-center text-slate-500 text-xs space-y-1">
              <p>Type to search 408 Roadmap Topics, DSA Problems, Projects, and Inbox Resources.</p>
              <p className="text-[11px] text-slate-600 font-mono">Tip: Press ESC anytime to exit.</p>
            </div>
          ) : (
            results.map(item => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item.routeTab, item.id)}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-800/80 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition">
                    {getTypeIcon(item.type)}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate max-w-md">{item.subtitle}</p>
                  </div>
                </div>

                <span className="text-xs uppercase font-bold text-slate-500 group-hover:text-indigo-300 font-mono text-[11px] px-2 py-1 rounded bg-slate-800/60">
                  {item.routeTab} ➔
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
