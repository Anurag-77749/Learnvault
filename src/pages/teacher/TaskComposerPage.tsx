import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const TaskComposerPage: React.FC = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<any[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [title, setTitle] = useState('Homework 3: Linear Equations Practice');
  const [subject, setSubject] = useState('Mathematics');
  const [dueAt, setDueAt] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // 5 to 10 questions enforced
  const [questions, setQuestions] = useState<string[]>([
    'Solve for x: 2x + 7 = 19',
    'Solve for y: 4(y - 3) = 28',
    'Solve: 5x/3 - 4 = 6',
    'Find the root: 9x - 12 = 3(2x + 2)',
    'Solve for z: (z + 2)/5 = (z - 1)/4',
  ]);

  const [loading, setLoading] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [taggedResults, setTaggedResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/teacher/sections')
      .then((res) => {
        setSections(res.data);
        if (res.data[0]) setSectionId(res.data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleAddQuestion = () => {
    if (questions.length < 10) {
      setQuestions([...questions, '']);
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length > 5) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  const handleQuestionChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx] = val;
    setQuestions(updated);
  };

  const handleSuggestTopics = async () => {
    setTagging(true);
    // Simulate / call Flash AI tagging
    setTimeout(() => {
      setTaggedResults(
        questions.map((q, i) => ({
          position: i + 1,
          topic_name: 'Linear Equations in One Variable',
          confidence: 0.96,
        }))
      );
      setTagging(false);
    }, 600);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length < 5 || questions.length > 10) {
      setError('Homework must contain between 5 and 10 questions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = questions.map((q, i) => ({
        position: i + 1,
        question_text: q,
      }));

      // 1. Create Task
      const taskRes = await api.post('/teacher/tasks', {
        section_id: sectionId,
        subject,
        title,
        due_at: new Date(dueAt).toISOString(),
        items,
      });

      const taskId = taskRes.data.id;

      // 2. Publish Task
      await api.post(`/teacher/tasks/${taskId}/publish`);

      alert('Task published successfully to student rosters!');
      navigate('/teacher/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Return
        </button>
        <span className="text-xs font-mono font-bold text-indigo-400">Task Composer (5-10 Items)</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 flex flex-col gap-6">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
          <h1 className="text-base font-bold text-white mb-1">Create Daily Homework Task</h1>
          <p className="text-xs text-slate-400 mb-6">
            Enter 5 to 10 question items. Flash model will tag curriculum topics.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Section</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Class {s.class_no}{s.label} ({s.section_digit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Questions Composer (5 to 10 items) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  Question Items ({questions.length} / 10 allowed)
                </label>
                <button
                  type="button"
                  onClick={handleSuggestTopics}
                  disabled={tagging}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {tagging ? 'Tagging with Flash...' : 'Auto-Tag Topics with Flash AI'}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-850">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                        placeholder={`Question ${idx + 1} statement...`}
                        className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-medium"
                        required
                      />
                      {questions.length > 5 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {taggedResults[idx] && (
                      <div className="ml-9 flex items-center gap-2 text-[10px] text-cyan-400 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Curriculum Tag: {taggedResults[idx].topic_name}</span>
                        <span className="text-slate-500">({Math.round(taggedResults[idx].confidence * 100)}% conf)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {questions.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Add Next Question Item
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Publishing Homework...' : 'Publish Homework Task'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
