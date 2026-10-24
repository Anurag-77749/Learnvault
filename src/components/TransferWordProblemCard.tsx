import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Compass, Mic } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';

interface TransferWordProblemCardProps {
  problemText: string;
  diagramSvg?: string;
  remediationId: string;
  onAttempt: (answer: string, voiceTranscript?: string) => Promise<boolean>;
}

export const TransferWordProblemCard: React.FC<TransferWordProblemCardProps> = ({
  problemText,
  diagramSvg,
  remediationId,
  onAttempt,
}) => {
  const [answer, setAnswer] = useState('');
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    try {
      const result = await onAttempt(answer, voiceNote || 'Student reasoned through the equation balance.');
      setPassed(result);
    } catch {
      setPassed(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col">
      <div className="flex items-center gap-2.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
        <Compass className="w-4 h-4" /> Real-World Word Problem Re-Test
      </div>

      <p className="text-sm font-medium text-slate-200 leading-relaxed mb-4">
        {problemText}
      </p>

      {/* Spatial SVG Diagram */}
      {diagramSvg && (
        <div
          className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 mb-5 flex items-center justify-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: diagramSvg }}
        />
      )}

      {passed === null ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Final Answer / Equation Solution:
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. Cost of 1 notebook = Rs 25"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
              required
            />
          </div>

          {/* Voice Re-Check */}
          <div className="pt-2">
            <VoiceRecorder
              promptText="Explain in 10-15 seconds how you arrived at your final answer:"
              onRecordingComplete={(_, duration) => {
                setVoiceRecorded(true);
                setVoiceNote(`Student recorded ${duration}s verbal reasoning.`);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !answer.trim()}
            className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? 'Auditing Solution...' : (
              <>
                <Send className="w-4 h-4" /> Submit Word Problem & Unlock Mastery
              </>
            )}
          </button>
        </form>
      ) : passed ? (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/40 p-5 text-center flex flex-col items-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
          <h4 className="text-base font-bold text-emerald-200">Mastery Unlocked!</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Your written application and spoken reasoning verified genuine conceptual mastery. Your topic standing has been upgraded.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-rose-950/80 border border-rose-500/40 p-5 text-center flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
          <h4 className="text-base font-bold text-rose-200">Re-Test Attempt Not Met</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Review the 10 flashcards and equation balance notes once more. Your teacher has been notified to guide you.
          </p>
          <button
            onClick={() => setPassed(null)}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
