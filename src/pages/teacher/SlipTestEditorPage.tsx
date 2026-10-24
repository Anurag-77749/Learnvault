import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  ArrowLeft,
  FileCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
} from 'lucide-react';

export const SlipTestEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<any[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [title, setTitle] = useState('Unit Slip Test 1: Algebraic Expressions');

  // Slip test state
  const [slipTestId, setSlipTestId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    api.get('/teacher/sections')
      .then((res) => {
        setSections(res.data);
        if (res.data[0]) setSectionId(res.data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleUploadAndExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(`/teacher/sections/${sectionId}/slip-tests`, {
        title,
        question_paper_path: 'tasks/DEMO01/slip_test_qp.pdf',
        answer_sheet_paths: ['tasks/DEMO01/sheets_batch.pdf'],
      });

      setSlipTestId(res.data.id);
      setResults(res.data.results || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to extract slip-test.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (resultId: string, val: string) => {
    const num = parseFloat(val);
    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, marks: isNaN(num) ? 0 : num } : r))
    );
  };

  const handleSaveEdits = async () => {
    if (!slipTestId) return;
    setSaving(true);
    try {
      await api.patch(`/teacher/slip-tests/${slipTestId}/results`, {
        results: results.map((r) => ({ result_id: r.id, marks: r.marks })),
      });
      alert('OCR mark adjustments saved successfully!');
    } catch (err: any) {
      alert('Failed to save adjustments.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!slipTestId) return;
    setApproving(true);
    try {
      await api.post(`/teacher/slip-tests/${slipTestId}/approve`);
      alert('Slip test approved! Topic mastery synchronized across all students.');
      navigate('/teacher/dashboard');
    } catch (err: any) {
      alert('Failed to approve slip test.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
        <span className="text-xs font-mono font-bold text-cyan-400">Slip-Test Red-Pen OCR</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-6 flex flex-col gap-6">
        {!slipTestId ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h1 className="text-base font-bold text-white mb-1">Upload Paper Slip-Test</h1>
            <p className="text-xs text-slate-400 mb-6">
              Upload the question paper sheet and red-pen graded student papers to extract topic-wise scores.
            </p>

            <form onSubmit={handleUploadAndExtract} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        Class {s.class_no}{s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Slip-Test Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                  <FileCheck className="w-8 h-8 text-cyan-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">Question Paper (PDF / Image)</span>
                  <span className="text-[10px] text-slate-500 mt-1">question_paper_01.pdf attached</span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                  <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">Red-Pen Graded Sheets (Batch)</span>
                  <span className="text-[10px] text-slate-500 mt-1">50 Student Sheets Attached</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? 'Running OCR Extraction...' : 'Extract Red-Pen Marks with OCR'}
              </button>
            </form>
          </div>
        ) : (
          /* OCR REVIEW & EDIT TABLE */
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Review & Edit OCR Extracted Marks</h2>
                <p className="text-xs text-slate-400">Verify red-pen marks before synchronizing topic mastery</p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleSaveEdits}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Adjustments'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
                >
                  <Check className="w-4 h-4" />
                  {approving ? 'Synchronizing...' : 'Approve & Sync Mastery'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Student Roll</th>
                    <th className="py-2.5 px-3">Curriculum Topic</th>
                    <th className="py-2.5 px-3">OCR Confidence</th>
                    <th className="py-2.5 px-3">Marks Obtained</th>
                    <th className="py-2.5 px-3">Max Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {results.slice(0, 15).map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-850/50 transition">
                      <td className="py-2 px-3 font-mono text-cyan-300 font-bold">Roll #{i + 1}</td>
                      <td className="py-2 px-3 text-slate-200">Linear Equations in One Variable</td>
                      <td className="py-2 px-3 font-mono text-emerald-400">
                        {Math.round((r.confidence || 0.95) * 100)}% Match
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.5"
                          value={r.marks}
                          onChange={(e) => handleMarksChange(r.id, e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white text-center focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400">{r.max_marks || 10.0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
