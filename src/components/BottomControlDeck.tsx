import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sun, 
  Timer as TimerIcon, 
  CalendarRange, 
  BookOpen, 
  FolderGit2, 
  BarChart3, 
  Hourglass,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
  Briefcase,
  Bookmark
} from 'lucide-react';
import { db } from '../services/db';
import { ScreenId } from './Navigation';
import { DailyDsaCommunicationWidget } from './DailyDsaCommunicationWidget';
import { SpringCounter } from './SpringCounter';

interface BottomControlDeckProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  className?: string;
}

const CONTROL_DOMAINS: { id: ScreenId; label: string; number: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', number: '01', icon: Sun },
  { id: 'timer', label: 'Timer', number: '02', icon: TimerIcon },
  { id: 'plan', label: 'Plan', number: '03', icon: CalendarRange },
  { id: 'learn', label: 'Curriculum', number: '04', icon: BookOpen },
  { id: 'dsa', label: 'DSA Lab', number: '05', icon: Code2 },
  { id: 'jobs', label: 'Career HQ', number: '06', icon: Briefcase },
  { id: 'vault', label: 'Vault', number: '07', icon: Bookmark },
  { id: 'projects', label: 'Projects', number: '08', icon: FolderGit2 },
  { id: 'progress', label: 'Analytics', number: '09', icon: BarChart3 },
  { id: 'wasted', label: 'Wasted Days', number: '10', icon: Hourglass },
];

export const BottomControlDeck: React.FC<BottomControlDeckProps> = ({
  activeScreen,
  onSelectScreen,
  className = '',
}) => {
  const curriculumTopics = useLiveQuery(() => db.curriculumTopics.toArray()) || [];

  let totalSub = 0;
  let doneSub = 0;
  curriculumTopics.forEach((t) => {
    totalSub += t.subtopics?.length || 0;
    doneSub += t.subtopics?.filter((s) => s.completed).length || 0;
  });
  const displayTotal = totalSub > 0 ? totalSub : 892;
  const overallPercent = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

  return (
    <footer className={`mt-14 pt-8 border-t border-[rgba(255,255,255,0.08)] space-y-6 ${className}`}>
      {/* Deck Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-pulse" />
          <h3 className="font-display font-bold text-base sm:text-lg text-[#F5F2EB] tracking-tight uppercase">
            System Features & Telemetry Deck
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#9E958E] uppercase tracking-wider">
          MACRO TRACKING & ACCOUNTABILITY HUB
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Overall Progress & Navigation Hub */}
        <div className="space-y-4">
          {/* Overall Curriculum Progress Card */}
          <div className="bg-[#080808] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_36px_rgba(0,0,0,0.9)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-display font-bold text-sm text-[#F5F2EB]">
                  Overall Curriculum Progress
                </span>
              </div>
              <span className="font-mono font-bold text-base text-[#D4AF37] tabular-nums">
                <SpringCounter value={overallPercent} suffix="%" />
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#000000] h-2 rounded-full overflow-hidden border border-[rgba(255,255,255,0.06)] shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F6E6C2] to-[#D4AF37] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                style={{ width: `${Math.max(overallPercent, 2)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-[#9E958E] tabular-nums">
                <strong className="text-[#F5F2EB]"><SpringCounter value={doneSub} /></strong> of {displayTotal} Topics Mastered
              </span>
              <button
                type="button"
                onClick={() => onSelectScreen('learn')}
                className="text-[#D4AF37] hover:text-[#F6E6C2] flex items-center gap-1.5 cursor-pointer font-bold transition-colors"
              >
                <span>View Full Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Domains Hub */}
          <div className="bg-[#080808] p-5 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_36px_rgba(0,0,0,0.9)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-xs font-mono font-bold text-[#9E958E] uppercase tracking-wider">
                Feature Jump Deck
              </span>
              <span className="text-[10px] font-mono text-[#55504A]">
                10 ACTIVE MODULES
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CONTROL_DOMAINS.map((domain) => {
                const isActive = activeScreen === domain.id;
                const Icon = domain.icon;

                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => {
                      onSelectScreen(domain.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-18 ${
                      isActive
                        ? 'bg-[rgba(212,175,55,0.12)] border-[#D4AF37]/50 shadow-[inset_0_0_10px_rgba(212,175,55,0.08)]'
                        : 'bg-[#000000] border-[rgba(255,255,255,0.06)] hover:border-[rgba(212,175,55,0.3)] hover:bg-[#0E0E0E]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6E6C2]' : 'text-[#9E958E]'}`} />
                      <span className="text-[9px] font-mono text-[#55504A] font-bold">
                        {domain.number}
                      </span>
                    </div>
                    <span className={`text-[11px] font-bold truncate ${isActive ? 'text-[#F6E6C2]' : 'text-[#F5F2EB]'}`}>
                      {domain.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Complete DSA & Communication Control Panel */}
        <div>
          <DailyDsaCommunicationWidget />
        </div>
      </div>
    </footer>
  );
};
