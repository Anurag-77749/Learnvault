import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  CalendarCheck,
  Clock,
  FileUp,
  BarChart3,
  Database,
  Code2,
  FolderGit2,
  Briefcase,
  Target,
  Inbox,
  Search,
  MoreHorizontal,
  X
} from 'lucide-react';

export type AppTab =
  | 'dashboard'
  | 'planner'
  | 'topics'
  | 'dsa'
  | 'projects'
  | 'jobs'
  | 'goals'
  | 'inbox'
  | 'daily'
  | 'timer'
  | 'import'
  | 'coverage'
  | 'settings';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isOnline: boolean;
  isConfigured: boolean;
  totalTopics: number;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  isConfigured,
  totalTopics,
  onOpenSearch
}) => {
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const handleNav = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileMoreOpen(false);
  };

  return (
    <>
      {/* Desktop Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-3 md:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                FDE Learning Hub
              </h1>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                2026–2030
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xl:block">
              Forward Deployed Engineer 4-Year Curriculum & Tracking
            </p>
          </div>
        </div>

        {/* Global Search Trigger (Desktop + Mobile) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 text-xs transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search topics, DSA, projects...</span>
            <kbd className="hidden sm:inline bg-slate-800 text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
              Ctrl+K
            </kbd>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleNav('dashboard')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNav('planner')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Planner</span>
            </button>

            <button
              onClick={() => handleNav('topics')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'topics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Topics ({totalTopics})</span>
            </button>

            <button
              onClick={() => handleNav('dsa')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dsa'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>DSA</span>
            </button>

            <button
              onClick={() => handleNav('projects')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => handleNav('jobs')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Jobs</span>
            </button>

            <button
              onClick={() => handleNav('goals')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'goals'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Goals</span>
            </button>

            <button
              onClick={() => handleNav('inbox')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'inbox'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>Inbox</span>
            </button>

            <button
              onClick={() => handleNav('daily')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'daily'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Daily</span>
            </button>

            <button
              onClick={() => handleNav('timer')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'timer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timer</span>
            </button>

            <button
              onClick={() => handleNav('coverage')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'coverage'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Coverage</span>
            </button>

            <button
              onClick={() => handleNav('import')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'import'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>
          </nav>

          {/* Right Status / Sync button */}
          <button
            onClick={() => handleNav('settings')}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800"
            title={isConfigured ? 'Connected to Supabase Cloud' : 'Running in Local-first offline mode'}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                !isOnline
                  ? 'bg-amber-400 ring-2 ring-amber-400/30'
                  : isConfigured
                  ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                  : 'bg-cyan-400 ring-2 ring-cyan-400/30'
              }`}
            />
            <span className="hidden sm:inline">
              {!isOnline ? 'Offline' : isConfigured ? 'Supabase' : 'Local'}
            </span>
            <Database className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (min touch target >= 44px) */}
      <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-800 bg-slate-950/95 px-1 backdrop-blur-md lg:hidden">
        <button
          onClick={() => handleNav('dashboard')}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNav('topics')}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'topics' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Topics</span>
        </button>

        <button
          onClick={() => handleNav('dsa')}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'dsa' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>DSA</span>
        </button>

        <button
          onClick={() => handleNav('daily')}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'daily' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>Daily</span>
        </button>

        <button
          onClick={() => handleNav('timer')}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'timer' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Timer</span>
        </button>

        <button
          onClick={() => setIsMobileMoreOpen(true)}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-semibold transition-colors ${
            isMobileMoreOpen ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer Modal */}
      {isMobileMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end lg:hidden">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Full Platform Features</h3>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleNav('planner')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'planner'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <CalendarDays className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Planner</div>
                  <div className="text-[10px] text-slate-400">Exam mode & auto-fill</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('projects')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'projects'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <FolderGit2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Projects</div>
                  <div className="text-[10px] text-slate-400">Portfolio & README checklist</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('jobs')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'jobs'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <Briefcase className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Job Tracker</div>
                  <div className="text-[10px] text-slate-400">Interview questions & mocks</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('goals')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'goals'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <Target className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Goals & Badges</div>
                  <div className="text-[10px] text-slate-400">No zero days + Stats</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('inbox')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'inbox'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <Inbox className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Resource Inbox</div>
                  <div className="text-[10px] text-slate-400">Quick link capture</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('coverage')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'coverage'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Coverage Report</div>
                  <div className="text-[10px] text-slate-400">408 Roadmap topics audit</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('import')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'import'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <FileUp className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Import Topics</div>
                  <div className="text-[10px] text-slate-400">CSV & text batch import</div>
                </div>
              </button>

              <button
                onClick={() => handleNav('settings')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition ${
                  activeTab === 'settings'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                <Database className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-xs">Backup & Cloud</div>
                  <div className="text-[10px] text-slate-400">Supabase & JSON export</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
