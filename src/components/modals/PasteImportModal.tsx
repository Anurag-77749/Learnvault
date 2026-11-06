import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { importFromPastedList } from '../../services/curriculumService';

interface PasteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PasteImportModal: React.FC<PasteImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsImporting(true);
    setResult(null);

    try {
      const res = await importFromPastedList(text);
      setResult(res);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-[#121212] border border-[#00F0FF]/40 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#00F0FF]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black border border-[#00F0FF]/50 flex items-center justify-center text-[#00F0FF]">
                <Upload className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#F9F6EE]">
                Paste List to Import
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A09D95] hover:text-[#00F0FF] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleImport} className="mt-5 space-y-4">
            <p className="text-xs text-[#A09D95]">
              Paste items in this format (one per line):<br />
              <code className="text-[#00F0FF] font-mono bg-black px-2 py-0.5 rounded border border-[#00F0FF]/30 block mt-1">
                Track | Topic | Subtopic | URL (optional)
              </code>
            </p>

            <textarea
              rows={8}
              placeholder={`TRACK 1: PYTHON | Python Basics | Variables & Types | https://docs.python.org/3/tutorial/\nTRACK 2: DSA | Binary Search | Rotated Sorted Array | https://leetcode.com/problems/search-in-rotated-sorted-array/`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-black border border-[#00F0FF]/30 text-xs sm:text-sm text-[#F9F6EE] font-mono focus:outline-none focus:border-[#00F0FF]"
            />

            {result && (
              <div className="p-3 rounded-xl bg-black border border-[#00F0FF]/30 text-xs flex items-center justify-between">
                <span className="text-[#39D353] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Imported {result.added} items
                </span>
                <span className="text-[#A09D95]">
                  Skipped / duplicate: {result.skipped}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-xl border border-[#00F0FF]/30 text-sm text-[#A09D95] hover:text-[#F9F6EE] font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isImporting || !text.trim()}
                className="flex-1 min-h-[46px] rounded-xl bg-[#00F0FF] hover:bg-[#FFD700] text-black text-sm font-bold uppercase transition-all shadow-md shadow-[#00F0FF]/20 disabled:opacity-40"
              >
                {isImporting ? 'Processing...' : 'Run Import'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
