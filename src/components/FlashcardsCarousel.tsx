import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCw, Sparkles, HelpCircle } from 'lucide-react';

export interface Flashcard {
  question: string;
  answer: string;
  concept_hint?: string;
}

interface FlashcardsCarouselProps {
  flashcards: Flashcard[];
  onComplete?: () => void;
}

export const FlashcardsCarousel: React.FC<FlashcardsCarouselProps> = ({ flashcards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, 'got_it' | 'review'>>({});

  const card = flashcards[currentIndex] || { question: '', answer: '' };
  const total = flashcards.length;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRate = (rating: 'got_it' | 'review') => {
    setRatings((prev) => ({ ...prev, [currentIndex]: rating }));
    handleNext();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none">
      {/* Top Progress Indicator */}
      <div className="w-full flex items-center justify-between px-2 mb-3 text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Sparkles className="w-4 h-4" /> Exactly 10 Remedial Cards
        </span>
        <span className="font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-200">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-6 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full aspect-[4/3] cursor-pointer perspective"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
        >
          {/* FRONT FACE (Question) */}
          <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-7 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
              <span className="uppercase tracking-widest text-[10px] font-bold text-cyan-400">Question</span>
              <span className="flex items-center gap-1 text-slate-400">
                <RotateCw className="w-3.5 h-3.5" /> Tap to Flip
              </span>
            </div>

            <div className="my-auto text-center px-2">
              <h3 className="text-lg font-semibold text-slate-100 leading-snug">
                {card.question}
              </h3>
            </div>

            <div className="text-center text-xs text-slate-500 font-medium">
              Formulate your answer before checking the back
            </div>
          </div>

          {/* BACK FACE (Answer + Hint) */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border border-cyan-500/30 p-7 flex flex-col justify-between shadow-2xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="uppercase tracking-widest text-[10px] font-bold text-emerald-400">Key Concept</span>
              <span className="flex items-center gap-1 text-slate-400">
                <RotateCw className="w-3.5 h-3.5" /> Tap to Flip
              </span>
            </div>

            <div className="my-auto text-center px-2">
              <div className="text-xl font-bold text-cyan-200 leading-snug">
                {card.answer}
              </div>

              {card.concept_hint && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{card.concept_hint}</span>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-emerald-400/80 font-medium">
              Self-Rate to solidify memory
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation & Self-Assessment Controls */}
      <div className="w-full flex items-center justify-between gap-3 mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex gap-2">
          <button
            onClick={() => handleRate('review')}
            className="flex-1 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" /> Review Again
          </button>
          <button
            onClick={() => handleRate('got_it')}
            className="flex-1 py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Got It!
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
