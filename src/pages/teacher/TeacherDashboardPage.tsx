import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrbitalLogo } from '../../components/OrbitalLogo';
import { AuthService, api } from '../../api/client';
import { translations, Language } from '../../i18n/translations';
import {
  Users,
  AlertTriangle,
  FileCheck,
  Send,
  PlusCircle,
  TrendingDown,
  Layers,
  CheckCircle,
  Globe,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Clinical resolution modal
  const [resolvingFlagId, setResolvingFlagId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Sample Heatmap Grid Data
  const topicsList = ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Square Roots'];
  const sampleStudents = [
    { name: 'Rahul Sharma', roll: 1, scores: ['strong', 'average', 'strong', 'strong'] },
    { name: 'Priya Patel', roll: 2, scores: ['average', 'weak', 'average', 'strong'] },
    { name: 'Aarav Reddy', roll: 3, scores: ['weak', 'weak', 'average', 'weak'] },
    { name: 'Sneha Verma', roll: 4, scores: ['strong', 'strong', 'strong', 'strong'] },
    { name: 'Vikram Singh', roll: 5, scores: ['weak', 'weak', 'weak', 'average'] },
  ];

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const sectionsRes = await api.get('/teacher/sections').catch(() => ({ data: [] }));
        const secList = sectionsRes.data;
        setSections(secList);

        const secId = secList[0]?.id || 'mock-section-id';
        setSelectedSectionId(secId);

        if (secList.length > 0) {
          const [rankingRes, flagsRes, digestRes] = await Promise.all([
            api.get(`/teacher/sections/${secId}/analytics/weak-ranking`).catch(() => ({ data: { ranking: [] } })),
            api.get(`/teacher/sections/${secId}/flags`).catch(() => ({ data: [] })),
            api.get(`/teacher/sections/${secId}/digests/latest`).catch(() => ({ data: null })),
          ]);

          setRanking(rankingRes.data.ranking || []);
          setFlags(flagsRes.data || []);
          setDigest(digestRes.data);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const handleResolveFlag = async () => {
    if (!resolvingFlagId || !resolutionNote.trim()) return;
    try {
      await api.post(`/teacher/flags/${resolvingFlagId}/resolve`, {
        resolution_note: resolutionNote,
      });
      setFlags((prev) => prev.filter((f) => f.id !== resolvingFlagId));
      setResolvingFlagId(null);
      setResolutionNote('');
    } catch (err) {
      alert('Failed to resolve flag.');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/teacher/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Console Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <OrbitalLogo size={36} showText={true} />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Section:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300 focus:outline-none"
            >
              {sections.length > 0 ? (
                sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Class {s.class_no}{s.label} ({s.section_digit})
                  </option>
                ))
              ) : (
                <option value="mock">Class 8A (Mathematics)</option>
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Trilingual Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(['en', 'hi', 'te'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded-lg uppercase transition ${
                  lang === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-6 flex flex-col gap-6">
        {/* Quick Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div>
            <h1 className="text-base font-bold text-white">Class 8A Academic Operations</h1>
            <p className="text-xs text-slate-400">CBSE Mathematics • Ananya Sharma</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/teacher/tasks/create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" /> Publish Homework (5-10 Items)
            </button>
            <button
              onClick={() => navigate('/teacher/slip-tests/upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" /> Upload Paper Slip-Test
            </button>
          </div>
        </div>

        {/* Evening Digest & Majority-Reteach Alert Card */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> Daily Evening Digest
            </div>
            <span className="text-xs font-mono text-slate-400">
              {digest?.digest_date || new Date().toISOString().split('T')[0]}
            </span>
          </div>

          {/* Reteach Banner */}
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Majority-Reteach Alert:</span> 56.0% of students struggled with Linear Transpositions today.
              </div>
            </div>
            <button
              onClick={() => navigate('/teacher/tasks/create')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
            >
              Schedule Reteach
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs mt-1">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400">Homework Submissions</div>
              <div className="text-lg font-bold font-mono text-white mt-1">94% (47/50)</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400">Class Average Mastery</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-1">76.4%</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400">Active Deficit Flags</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">{flags.length || 3} Students</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Class Diagnostic Heatmap */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Class Diagnostic Heatmap (Class 8A)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Line-by-line step audits & voice concept fusion</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-3 h-3 rounded bg-emerald-500" /> Strong (&gt;=80%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <div className="w-3 h-3 rounded bg-amber-500" /> Average (50-79%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <div className="w-3 h-3 rounded bg-rose-500" /> Weak (&lt;50%)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Student Name</th>
                  <th className="py-2.5 px-2 font-mono">Roll</th>
                  {topicsList.map((t) => (
                    <th key={t} className="py-2.5 px-3 font-semibold text-center">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {sampleStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-200">{s.name}</td>
                    <td className="py-2.5 px-2 font-mono text-slate-400">{s.roll}</td>
                    {s.scores.map((tier, i) => (
                      <td key={i} className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block w-8 h-8 rounded-xl font-bold font-mono text-[11px] leading-8 ${
                            tier === 'strong'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tier === 'weak'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {tier === 'strong' ? '88%' : tier === 'weak' ? '42%' : '68%'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: Multi-Topic Weak-Student Ranking & Actionable Triage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Multi-Topic Weak Ranking */}
          <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-rose-400" /> Multi-Topic Weak Student Ranking
              </h2>
              <p className="text-xs text-slate-400 mb-4">Ranked by count of curriculum deficit topics</p>

              <div className="flex flex-col gap-2.5">
                {ranking.length > 0 ? (
                  ranking.slice(0, 5).map((r, i) => (
                    <div
                      key={r.student_id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-rose-950 text-rose-300 font-mono font-bold text-xs flex items-center justify-center border border-rose-500/30">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{r.student_name}</div>
                          <div className="text-[11px] text-slate-400">Roll #{r.roll_no}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-400">
                          {r.weak_topics_count} Weak Topics
                        </span>
                        <div className="text-[10px] text-slate-500">{r.unresolved_flags_count} Unresolved Flags</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">No multi-topic weak students detected.</div>
                )}
              </div>
            </div>
          </section>

          {/* Actionable Flags Queue */}
          <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Actionable Learning Flags Queue
            </h2>
            <p className="text-xs text-slate-400 mb-4">Illusions of competence & persistent errors</p>

            <div className="flex flex-col gap-3">
              {flags.length > 0 ? (
                flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{flag.student_name || 'Student Deficit'}</div>
                        <div className="text-[11px] text-cyan-300 font-medium">Topic: {flag.topic_name || 'Linear Equations'}</div>
                      </div>
                      {flag.evidence?.illusion_flag && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Illusion of Competence
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      {flag.evidence?.reasoning || 'Written steps accurate, but spoken verbal reasoning lacked conceptual grounding.'}
                    </p>

                    <button
                      onClick={() => setResolvingFlagId(flag.id)}
                      className="self-end px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                    >
                      Resolve with Clinical Note
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">All student deficit flags currently resolved.</div>
              )}
            </div>
          </section>
        </div>

        {/* Clinical Resolution Modal */}
        {resolvingFlagId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-2">Record Clinical Resolution Note</h3>
              <p className="text-xs text-slate-400 mb-4">
                Document teacher intervention (e.g. 1-on-1 tutoring, concept re-explanation, targeted remedial worksheet).
              </p>

              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Conducted 10-minute whiteboarding session focusing on equation balancing operations."
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 mb-4 font-medium"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setResolvingFlagId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveFlag}
                  disabled={!resolutionNote.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
