import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrbitalLogo } from '../../components/OrbitalLogo';
import { AuthService, TeacherService, api } from '../../api/client';
import { translations, Language } from '../../i18n/translations';
import {
  Users,
  AlertTriangle,
  FileCheck,
  PlusCircle,
  TrendingDown,
  Layers,
  CheckCircle,
  Globe,
  LogOut,
  Sparkles,
  UserPlus,
  Search,
  Copy,
  RotateCcw,
  Trash2,
  Check,
  School,
  KeyRound,
  X,
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'analytics' | 'roster'>('analytics');

  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [digest, setDigest] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Student Modal State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newRollNo, setNewRollNo] = useState<number>(51);
  const [newLangPref, setNewLangPref] = useState('en');
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [createdStudentSuccess, setCreatedStudentSuccess] = useState<any | null>(null);

  // Copy feedback state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const loadSectionData = async (secId: string) => {
    try {
      const [rankingRes, flagsRes, digestRes, studentsRes] = await Promise.all([
        TeacherService.getWeakRanking(secId).catch(() => ({ ranking: [] })),
        TeacherService.getFlags(secId).catch(() => []),
        TeacherService.getLatestDigest(secId).catch(() => null),
        TeacherService.getStudents(secId).catch(() => []),
      ]);

      setRanking(rankingRes.ranking || []);
      setFlags(flagsRes || []);
      setDigest(digestRes);
      setStudents(studentsRes || []);

      // Auto-calculate next available roll number
      if (Array.isArray(studentsRes) && studentsRes.length > 0) {
        const maxRoll = Math.max(...studentsRes.map((s: any) => s.roll_no || 0));
        setNewRollNo(maxRoll + 1);
      }
    } catch (err) {
      console.error('Failed to load section data:', err);
    }
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const secList = await TeacherService.getSections().catch(() => []);
        setSections(secList);

        const secId = secList[0]?.id || '';
        if (secId) {
          setSelectedSectionId(secId);
          await loadSectionData(secId);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const handleSectionChange = async (newSecId: string) => {
    setSelectedSectionId(newSecId);
    setLoading(true);
    await loadSectionData(newSecId);
    setLoading(false);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !newFullName.trim()) return;
    setAddStudentLoading(true);
    setAddStudentError(null);

    try {
      const created = await TeacherService.addStudent(selectedSectionId, {
        roll_no: Number(newRollNo),
        full_name: newFullName.trim(),
        language_pref: newLangPref,
      });

      setStudents((prev) => [...prev, created].sort((a, b) => a.roll_no - b.roll_no));
      setCreatedStudentSuccess(created);
      setNewFullName('');
      setNewRollNo((prev) => prev + 1);
    } catch (err: any) {
      setAddStudentError(err.response?.data?.message || 'Failed to add student to class.');
    } finally {
      setAddStudentLoading(false);
    }
  };

  const handleResetPin = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Reset 4-digit PIN for ${studentName}? They will be able to create a new PIN on next sign in.`)) {
      return;
    }
    try {
      await TeacherService.resetStudentPin(studentId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, pin_set: false } : s))
      );
      alert(`PIN for ${studentName} has been reset successfully!`);
    } catch (err) {
      alert('Failed to reset student PIN.');
    }
  };

  const handleDeactivateStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this active section?`)) {
      return;
    }
    try {
      await TeacherService.deactivateStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      alert('Failed to deactivate student.');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleResolveFlag = async () => {
    if (!resolvingFlagId || !resolutionNote.trim()) return;
    try {
      await TeacherService.resolveFlag(resolvingFlagId, resolutionNote);
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

  const activeSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_no?.toString().includes(studentSearch) ||
      s.class_code?.includes(studentSearch)
  );

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
              onChange={(e) => handleSectionChange(e.target.value)}
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
            <h1 className="text-base font-bold text-white">
              Class {activeSection?.class_no || 8}{activeSection?.label || 'A'} Academic Operations
            </h1>
            <p className="text-xs text-slate-400">CBSE Mathematics • Ananya Sharma • {students.length} Enrolled</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setActiveTab('roster');
                setIsAddStudentOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
            >
              <UserPlus className="w-4 h-4" /> Add Student to Class
            </button>
            <button
              onClick={() => navigate('/teacher/tasks/create')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" /> Publish Homework
            </button>
            <button
              onClick={() => navigate('/teacher/slip-tests/upload')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" /> Upload Slip-Test
            </button>
          </div>
        </div>

        {/* Console Tab Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" /> Diagnostics & Heatmap
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'roster'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
            }`}
          >
            <Users className="w-4 h-4" /> Enrolled Students & Roster ({students.length})
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <>
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

            {/* Diagnostic Heatmap */}
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

            {/* Ranking & Flags Queue */}
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
                          className="self-end px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                        >
                          Resolve & Clear Flag
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-6 text-center">All learning flags addressed. Great job!</div>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : (
          /* SECTION: Enrolled Students & Roster Management */
          <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Class {activeSection?.class_no}{activeSection?.label} Student Roster
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage student enrollment, 6-digit login codes, and PIN resets
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by name or roll..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
                  />
                </div>

                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Student
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3 font-mono font-semibold text-center w-14">Roll</th>
                    <th className="py-3 px-4 font-semibold">Student Full Name</th>
                    <th className="py-3 px-4 font-semibold font-mono">6-Digit Code</th>
                    <th className="py-3 px-4 font-semibold">Language</th>
                    <th className="py-3 px-4 font-semibold">PIN Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-850/40 transition">
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                          #{s.roll_no}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {s.full_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-300">
                          <span className="flex items-center gap-1.5 font-bold tracking-wider">
                            {s.class_code}
                            <button
                              onClick={() => handleCopyCode(s.class_code)}
                              title="Copy student code"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            >
                              {copiedCode === s.class_code ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        </td>
                        <td className="py-3 px-4 uppercase text-[11px] text-slate-400">
                          {s.language_pref || 'en'}
                        </td>
                        <td className="py-3 px-4">
                          {s.pin_set ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" /> Configured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                              <KeyRound className="w-3 h-3" /> First Setup Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResetPin(s.id, s.full_name)}
                              title="Reset PIN"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" /> Reset PIN
                            </button>
                            <button
                              onClick={() => handleDeactivateStudent(s.id, s.full_name)}
                              title="Deactivate Student"
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No students matching "{studentSearch}". Click "Add Student" above to enroll a new student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: Add Student to Class */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" /> Add Student to Class {activeSection?.class_no}{activeSection?.label}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enrolls student & creates unique 6-digit class code</p>
              </div>
              <button
                onClick={() => {
                  setIsAddStudentOpen(false);
                  setCreatedStudentSuccess(null);
                  setAddStudentError(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addStudentError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300">
                {addStudentError}
              </div>
            )}

            {createdStudentSuccess ? (
              <div className="flex flex-col gap-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Student Enrolled Successfully!</h4>
                  <p className="text-xs text-slate-300">
                    Share these sign-in details with <span className="font-bold text-white">{createdStudentSuccess.full_name}</span> or their parents:
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>School Code:</span>
                    <span className="font-bold text-white">DEMO01</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>6-Digit Student Code:</span>
                    <span className="font-bold text-cyan-300 text-sm tracking-wider">{createdStudentSuccess.class_code}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Roll Number:</span>
                    <span className="font-bold text-white">#{createdStudentSuccess.roll_no}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Initial PIN:</span>
                    <span className="font-bold text-amber-300">Student will create on 1st login</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCreatedStudentSuccess(null);
                      setAddStudentError(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                  >
                    Add Another Student
                  </button>
                  <button
                    onClick={() => {
                      setIsAddStudentOpen(false);
                      setCreatedStudentSuccess(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Done & View Roster
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Kavya Deshmukh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number (1-99)</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={newRollNo}
                      onChange={(e) => setNewRollNo(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Language</label>
                    <select
                      value={newLangPref}
                      onChange={(e) => setNewLangPref(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (hi)</option>
                      <option value="te">Telugu (te)</option>
                    </select>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[11px] text-slate-500">Auto-Generated Student Code:</div>
                    <div className="font-mono font-bold text-cyan-300 text-sm tracking-widest mt-0.5">
                      {String(activeSection?.class_no || 8).padStart(2, '0')}
                      {String(activeSection?.section_digit || 1).padStart(2, '0')}
                      {String(newRollNo || 1).padStart(2, '0')}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                    CC S RR format
                  </span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addStudentLoading || !newFullName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {addStudentLoading ? 'Adding...' : 'Add Student'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Flag Clinical Resolution Modal */}
      {resolvingFlagId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Resolve Pedagogical Flag
            </h3>
            <p className="text-xs text-slate-400">
              Provide clinical notes detailing how this concept misconception was addressed in class.
            </p>

            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Reviewed equation transposition signs on blackboard during morning period..."
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setResolvingFlagId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveFlag}
                disabled={!resolutionNote.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
