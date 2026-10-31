import React, { useState } from 'react';
import { FileUp, CheckCircle, AlertCircle, Upload, ArrowRight, RefreshCw, Copy } from 'lucide-react';
import { DuplicateDetectionResult } from '../services/dataService';

interface ImportTopicsViewProps {
  onCheckDuplicates: (text: string) => DuplicateDetectionResult;
  onExecuteImport: (items: Array<{ trackTitle: string; sectionTitle: string; topicTitle: string; url?: string }>) => number;
  onDone: () => void;
}

export const ImportTopicsView: React.FC<ImportTopicsViewProps> = ({
  onCheckDuplicates,
  onExecuteImport,
  onDone
}) => {
  const [rawText, setRawText] = useState('');
  const [detectionResult, setDetectionResult] = useState<DuplicateDetectionResult | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const sampleTemplate = `# Format: Track | Section | Topic | optional URL
FDE Roadmap | Customer Delivery & Field Skills | Client Stakeholder Alignment | https://hbr.org
AI Engineer | Advanced Fine-Tuning | Direct Preference Optimization (DPO) | https://arxiv.org
Software Design & Architecture | Clean Code Principles | Boy Scout Rule | https://clean-code.com
System Design | High Availability | Geo-DNS Failover Strategies | https://cloudflare.com`;

  const handleAnalyze = (textToAnalyze: string) => {
    const res = onCheckDuplicates(textToAnalyze);
    setDetectionResult(res);
    setImportedCount(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setRawText(content);
      handleAnalyze(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!detectionResult || detectionResult.newTopics.length === 0) return;
    const count = onExecuteImport(detectionResult.newTopics);
    setImportedCount(count);
    setDetectionResult(null);
    setRawText('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">Import Topics & Duplicate Detection</h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              Paste or upload text/CSV list. Format: <code className="text-indigo-300 font-mono">Track | Section | Topic | optional URL</code>
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importedCount !== null && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span>Successfully imported <strong>{importedCount}</strong> new topics into your tracker!</span>
          </div>
          <button
            onClick={onDone}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            <span>View Topics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input Form & File Upload Area */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Paste Topic List (Pipe, Comma, or Tab separated)
          </label>
          <button
            type="button"
            onClick={() => {
              setRawText(sampleTemplate);
              handleAnalyze(sampleTemplate);
            }}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            <Copy className="h-3 w-3" />
            <span>Paste Sample Template</span>
          </button>
        </div>

        <textarea
          rows={8}
          placeholder={`Track | Section | Topic | optional resource URL\nAI Engineer | RAG | Advanced Query Expansion | https://langchain.com\n...`}
          value={rawText}
          onChange={e => {
            setRawText(e.target.value);
            handleAnalyze(e.target.value);
          }}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
        />

        {/* Upload file button & Live check trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-300 cursor-pointer hover:border-slate-500 hover:bg-slate-900 min-h-[44px]">
            <Upload className="h-4 w-4 text-indigo-400" />
            <span>Upload CSV or TXT File</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => handleAnalyze(rawText)}
            disabled={!rawText.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 min-h-[44px]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Re-scan Duplicates</span>
          </button>
        </div>
      </div>

      {/* Live Duplicate Detection & Validation Breakdown */}
      {detectionResult && (
        <div className="space-y-4">
          {/* Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Ready to Import
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  {detectionResult.newTopics.length} new
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                These topics do not exist yet and will be added under their tracks and sections.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Duplicates Detected
                </span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                  {detectionResult.duplicateTopics.length} duplicate
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Existing topics found. These will be automatically skipped to prevent duplicate records.
              </p>
            </div>
          </div>

          {/* New Topics Preview Table */}
          {detectionResult.newTopics.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="border-b border-slate-800 bg-slate-950/60 px-4 py-3">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  New Topics Preview ({detectionResult.newTopics.length})
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                {detectionResult.newTopics.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-semibold text-indigo-400 border border-indigo-500/20">
                        {item.trackTitle}
                      </span>
                      <span className="text-slate-400">{item.sectionTitle}</span>
                      <span className="font-semibold text-white">{item.topicTitle}</span>
                    </div>
                    {item.url && (
                      <span className="text-[11px] text-cyan-400 truncate max-w-[120px] sm:max-w-[200px]">
                        {item.url}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicates Preview Table */}
          {detectionResult.duplicateTopics.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900 overflow-hidden">
              <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                  Detected Duplicates (Will Be Skipped)
                </h3>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800">
                {detectionResult.duplicateTopics.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{item.trackTitle} &gt; {item.sectionTitle} &gt; <strong className="text-slate-300">{item.topicTitle}</strong></span>
                    </div>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                      Already in DB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleImport}
              disabled={detectionResult.newTopics.length === 0}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Import {detectionResult.newTopics.length} New Topics Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
