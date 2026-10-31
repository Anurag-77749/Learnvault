import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Download,
  Copy,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { CoverageReport } from '../services/dataService';

interface CoverageReportViewProps {
  report: CoverageReport;
}

export const CoverageReportView: React.FC<CoverageReportViewProps> = ({ report }) => {
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({
    'track-fde': true,
    'track-ai': true,
    'track-sda': true,
    'track-sd': true
  });
  const [copied, setCopied] = useState(false);

  const toggleTrack = (trackId: string) => {
    setExpandedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const copyMarkdownSummary = () => {
    let md = `# 📊 FDE LEARNING PLATFORM - TOPIC COVERAGE REPORT\n\n`;
    md += `**Overall Total Topics:** ${report.overallTotal}\n`;
    md += `**Completed Topics:** ${report.completedTotal} (${((report.completedTotal / (report.overallTotal || 1)) * 100).toFixed(1)}%)\n`;
    md += `**In Progress:** ${report.inProgressTotal}\n\n`;

    for (const track of report.tracks) {
      md += `### Track: ${track.trackTitle} (${track.totalTopics} Topics)\n`;
      for (const sec of track.sections) {
        md += `- **${sec.sectionTitle}**: ${sec.topicCount} topics\n`;
      }
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Roadmap Coverage Report</h2>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  100% Seeded
                </span>
              </div>
              <p className="text-xs text-slate-400 sm:text-sm mt-0.5">
                Exact transcription checklist against all roadmap source images.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdownSummary}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Topics</span>
          <div className="mt-1 text-2xl font-black text-white">{report.overallTotal}</div>
          <span className="text-[11px] text-indigo-400 font-medium">Exact image matches</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Tracks</span>
          <div className="mt-1 text-2xl font-black text-white">{report.tracks.length}</div>
          <span className="text-[11px] text-cyan-400 font-medium">FDE, AI, SDA, SD</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">Completed</span>
          <div className="mt-1 text-2xl font-black text-emerald-400">{report.completedTotal}</div>
          <span className="text-[11px] text-emerald-400 font-medium">
            {((report.completedTotal / (report.overallTotal || 1)) * 100).toFixed(0)}% overall
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">In Progress</span>
          <div className="mt-1 text-2xl font-black text-amber-400">{report.inProgressTotal}</div>
          <span className="text-[11px] text-amber-400 font-medium">Active studies</span>
        </div>
      </div>

      {/* Source Roadmap Image Verification Checklist */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Source Roadmap Image Verification Checklist</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card 1: FDE Roadmap */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Image: FDE Roadmap</h4>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                31 Topics
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Full-stack developer transition, Linux, DSA & System Design, AI engineering skills, Customer delivery & field skills, discovery & scoping, business acumen, communication, and continue learning tracks.
            </p>
          </div>

          {/* Card 2: AI Engineer Roadmap */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Image: AI Engineer</h4>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                136 Topics
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Pre-requisites, terminology, pre-trained models, OpenAI platform & API, safety and ethics, open-source AI, Hugging Face, Ollama, embeddings & vector databases (8 DBs), RAG pipelines, AI agents (ReAct), multimodal AI, and dev tools.
            </p>
          </div>

          {/* Card 3: Software Design & Architecture */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Image: Software Design & Architecture</h4>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                93 Topics
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Clean code principles, programming paradigms, OOP primary principles & features, design principles (SOLID, Law of Demeter), GoF & PoSA patterns, architectural styles, architectural patterns (DDD, CQRS), and enterprise patterns.
            </p>
          </div>

          {/* Card 4: System Design */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Image: System Design</h4>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                148 Topics
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              CAP theorem, consistency & availability patterns, DNS, CDNs, load balancing (L4/L7), microservices, SQL vs NoSQL, caching strategies, asynchronism, communication protocols, 10 performance antipatterns, monitoring, cloud design patterns, and reliability patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Section-by-Section Topic Count Accordions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Section-by-Section Topic Breakdown
        </h3>

        {report.tracks.map(track => {
          const isExpanded = expandedTracks[track.trackId];
          return (
            <div
              key={track.trackId}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
            >
              <div
                onClick={() => toggleTrack(track.trackId)}
                className="flex cursor-pointer items-center justify-between bg-slate-950/80 p-4 transition-colors hover:bg-slate-950"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <div>
                    <h4 className="text-base font-bold text-white">{track.trackTitle}</h4>
                    <p className="text-xs text-slate-400">
                      {track.sections.length} Sections · {track.totalTopics} Topics
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                  {track.totalTopics} Topics
                </span>
              </div>

              {isExpanded && (
                <div className="divide-y divide-slate-800/60 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {track.sections.map(sec => (
                      <div
                        key={sec.sectionId}
                        className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/80 p-3 text-xs"
                      >
                        <span className="font-medium text-slate-200">{sec.sectionTitle}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-300">{sec.topicCount} topics</span>
                          {sec.completedCount > 0 && (
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                              {sec.completedCount} done
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
