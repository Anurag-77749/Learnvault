import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentService } from '../api/client';
import { FlashcardsCarousel, Flashcard } from '../components/FlashcardsCarousel';
import { TransferWordProblemCard } from '../components/TransferWordProblemCard';
import { ArrowLeft, Volume2, BookOpen, Layers, Compass, Play, Pause } from 'lucide-react';

export const RemediationPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'cards' | 'notes' | 'problem'>('cards');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // 10 Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { question: 'What operation balances addition across equality?', answer: 'Subtraction', concept_hint: 'Inverse operation' },
    { question: 'If 3x = 18, what is x?', answer: 'x = 6', concept_hint: 'Divide both sides by 3' },
    { question: 'When transposing a positive term from LHS to RHS, its sign becomes?', answer: 'Negative (-)', concept_hint: 'Sign flips across =' },
    { question: 'What is the highest exponent of variable in linear equations?', answer: '1 (degree 1)', concept_hint: 'Linear power' },
    { question: 'Solve for x: x - 7 = 10', answer: 'x = 17', concept_hint: 'Add 7 to both sides' },
    { question: 'If 2x + 4 = 14, what is the value of 2x?', answer: '2x = 10', concept_hint: 'Subtract 4 from 14' },
    { question: 'Can an equation have fractions as coefficients?', answer: 'Yes, multiply by LCM to clear', concept_hint: 'Fractional coefficients' },
    { question: 'What is a constant in an expression?', answer: 'A fixed number without variables', concept_hint: 'Numbers like 5, -8' },
    { question: 'Solve for y: y / 5 = 4', answer: 'y = 20', concept_hint: 'Multiply both sides by 5' },
    { question: 'How do you check if your root is correct?', answer: 'Substitute root back into original LHS = RHS', concept_hint: 'Verification step' },
  ]);

  const [voiceScript, setVoiceScript] = useState(
    "Hello! Let's master linear equations today. Remember that whatever operation you apply to the left-hand side must be mirrored on the right-hand side to keep the equation balanced."
  );

  const [wordProblem, setWordProblem] = useState({
    problem_text:
      'A local shopkeeper in Hyderabad sells 3 identical notebooks and has Rs 25 left from a Rs 100 note. Set up the equation and determine the cost of one notebook.',
    diagram_svg:
      "<svg width='320' height='90' xmlns='http://www.w3.org/2000/svg'><rect width='300' height='75' fill='#1e293b' rx='12' stroke='#4f46e5'/><text x='20' y='45' font-family='sans-serif' font-size='13' fill='#e2e8f0'>3 Notebooks (3x) + Rs 25 = Rs 100</text></svg>",
  });

  const toggleSpeechSynth = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingVoice) {
        window.speechSynthesis.cancel();
        setIsPlayingVoice(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(voiceScript);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingVoice(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingVoice(true);
      }
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  const handleWordProblemAttempt = async (answer: string, voiceTranscript?: string) => {
    try {
      await StudentService.attemptWordProblem(topicId || 'mock-rem', answer, voiceTranscript);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <span className="text-xs font-mono font-bold text-amber-400">Re-Teach Module</span>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 flex flex-col gap-5">
        {/* Voice Teacher Audio Script Player */}
        <div className="rounded-2xl bg-indigo-950/50 border border-indigo-500/30 p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSpeechSynth}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              {isPlayingVoice ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <div>
              <h3 className="text-xs font-bold text-white">Teacher Voice Re-Teach</h3>
              <p className="text-[11px] text-indigo-300">Listen to spoken conceptual guide</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">1:15 Voice</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'cards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 10 Flashcards
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'notes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Revision Notes
          </button>
          <button
            onClick={() => setActiveTab('problem')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'problem' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Word Re-Test
          </button>
        </div>

        {/* TAB 1: 10 Flashcards */}
        {activeTab === 'cards' && (
          <div className="py-2">
            <FlashcardsCarousel
              flashcards={flashcards}
              onComplete={() => setActiveTab('problem')}
            />
          </div>
        )}

        {/* TAB 2: Revision Notes */}
        {activeTab === 'notes' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 leading-relaxed text-xs text-slate-300 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white">Curriculum Revision: Linear Equations</h3>
            <p>
              An algebraic equation is an equality involving variables. It has an equality sign (<code className="text-cyan-400 font-mono">=</code>).
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-300">
              LHS (Left Hand Side) = RHS (Right Hand Side)
            </div>
            <h4 className="text-xs font-bold text-slate-200 mt-2">Golden Transposition Rules:</h4>
            <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-400">
              <li>Adding a number to LHS means subtracting from RHS when transposed.</li>
              <li>Multiplying LHS means dividing RHS when transposed.</li>
              <li>Always group variables on one side and constants on the other side.</li>
            </ul>
          </div>
        )}

        {/* TAB 3: Transfer Word Problem Re-Test */}
        {activeTab === 'problem' && (
          <TransferWordProblemCard
            problemText={wordProblem.problem_text}
            diagramSvg={wordProblem.diagram_svg}
            remediationId={topicId || 'mock-id'}
            onAttempt={handleWordProblemAttempt}
          />
        )}
      </main>
    </div>
  );
};
