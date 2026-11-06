import React, { useState, useEffect } from 'react';
import { JobApplication } from '../types';
import { dataService } from '../services/dataService';

export const JobTrackerView: React.FC = () => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Job form
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected'>('applied');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [resumeVersion, setResumeVersion] = useState('v1.0-fde.pdf');

  // Active expanded cards
  const [activeRoundJobId, setActiveRoundJobId] = useState<string | null>(null);
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDate, setNewRoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRoundNotes, setNewRoundNotes] = useState('');

  // Active question input per job
  const [newQuestions, setNewQuestions] = useState<{ [jobId: string]: string }>({});

  // Active mock interview input
  const [activeMockJobId, setActiveMockJobId] = useState<string | null>(null);
  const [mockInterviewer, setMockInterviewer] = useState('');
  const [mockDate, setMockDate] = useState(new Date().toISOString().split('T')[0]);
  const [mockFeedback, setMockFeedback] = useState('');

  const loadJobs = () => {
    setJobs(dataService.getJobs());
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    dataService.addJob({
      company: company.trim(),
      role: role.trim(),
      status,
      applied_date: appliedDate,
      resume_version: resumeVersion.trim(),
      rounds: [],
      questions_asked: [],
      mock_interviews: []
    });

    setIsModalOpen(false);
    setCompany('');
    setRole('');
    loadJobs();
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Delete this job application?')) {
      dataService.deleteJob(id);
      loadJobs();
    }
  };

  const handleUpdateStatus = (id: string, newStatus: any) => {
    dataService.updateJob(id, { status: newStatus });
    loadJobs();
  };

  const handleAddRound = (jobId: string) => {
    if (!newRoundName.trim()) return;
    dataService.addInterviewRound(jobId, {
      name: newRoundName.trim(),
      date: newRoundDate,
      notes: newRoundNotes.trim(),
      passed: false
    });
    setNewRoundName('');
    setNewRoundNotes('');
    setActiveRoundJobId(null);
    loadJobs();
  };

  const handleAddQuestion = (jobId: string) => {
    const q = newQuestions[jobId];
    if (!q || !q.trim()) return;
    dataService.addQuestionAsked(jobId, q.trim());
    setNewQuestions({ ...newQuestions, [jobId]: '' });
    loadJobs();
  };

  const handleAddMock = (jobId: string) => {
    if (!mockInterviewer.trim()) return;
    dataService.addMockInterview(jobId, {
      interviewer: mockInterviewer.trim(),
      date: mockDate,
      feedback: mockFeedback.trim()
    });
    setMockInterviewer('');
    setMockFeedback('');
    setActiveMockJobId(null);
    loadJobs();
  };

  const filteredJobs = filterStatus === 'all' ? jobs : jobs.filter(j => j.status === filterStatus);

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'offer':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
      case 'interviewing':
        return 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40';
      case 'applied':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/40';
      case 'wishlist':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'rejected':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💼</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Interview & Application Tracker</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Track Forward Deployed Engineer & Solutions Engineering pipelines, real interview questions, and mock feedback.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Application
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'wishlist', 'applied', 'interviewing', 'offer', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st} ({st === 'all' ? jobs.length : jobs.filter(j => j.status === st).length})
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <span className="text-3xl block mb-2">📋</span>
            <p>No job applications found in this category.</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-white">{job.company}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300 font-medium text-sm">{job.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Applied: {job.applied_date}</span>
                    <span>•</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">
                      {job.resume_version}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={job.status}
                    onChange={e => handleUpdateStatus(job.id, e.target.value)}
                    className={`text-xs font-bold uppercase rounded-xl px-3 py-1.5 border focus:outline-none ${getStatusColor(
                      job.status
                    )}`}
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Delete Application"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Rounds Timeline */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span>⏱️</span>
                    <span>Interview Rounds ({job.rounds.length})</span>
                  </div>
                  <button
                    onClick={() => setActiveRoundJobId(activeRoundJobId === job.id ? null : job.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {activeRoundJobId === job.id ? 'Cancel' : '+ Add Round'}
                  </button>
                </div>

                {activeRoundJobId === job.id && (
                  <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 mb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Round Name (e.g. System Decomp)"
                        value={newRoundName}
                        onChange={e => setNewRoundName(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                      />
                      <input
                        type="date"
                        value={newRoundDate}
                        onChange={e => setNewRoundDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Notes or areas evaluated..."
                      value={newRoundNotes}
                      onChange={e => setNewRoundNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleAddRound(job.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Save Round
                      </button>
                    </div>
                  </div>
                )}

                {job.rounds.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No interview rounds recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {job.rounds.map((rnd, idx) => (
                      <div
                        key={rnd.id || idx}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{rnd.name}</span>
                            <span className="text-[11px] text-slate-400 font-normal">({rnd.date})</span>
                          </div>
                          {rnd.notes && <p className="text-slate-400 mt-0.5">{rnd.notes}</p>}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            rnd.passed
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {rnd.passed ? 'Passed ✓' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Questions Asked & Mock Feedback Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Questions Asked */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    <span>💡</span>
                    <span>Real Interview Questions ({job.questions_asked.length})</span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add question asked in interview..."
                      value={newQuestions[job.id] || ''}
                      onChange={e => setNewQuestions({ ...newQuestions, [job.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleAddQuestion(job.id)}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleAddQuestion(job.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {job.questions_asked.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300 p-2 rounded-lg"
                      >
                        • {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Interviews */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <span>🎯</span>
                      <span>Mock Interview Feedback ({job.mock_interviews.length})</span>
                    </div>
                    <button
                      onClick={() => setActiveMockJobId(activeMockJobId === job.id ? null : job.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      {activeMockJobId === job.id ? 'Cancel' : '+ Add Mock'}
                    </button>
                  </div>

                  {activeMockJobId === job.id && (
                    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 mb-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Interviewer (Mentor / Senior)"
                          value={mockInterviewer}
                          onChange={e => setMockInterviewer(e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                        <input
                          type="date"
                          value={mockDate}
                          onChange={e => setMockDate(e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Feedback, areas to strengthen..."
                        value={mockFeedback}
                        onChange={e => setMockFeedback(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAddMock(job.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                        >
                          Save Mock
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {job.mock_interviews.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="bg-slate-900/60 border border-slate-800/60 text-xs p-2 rounded-lg space-y-1"
                      >
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span className="font-semibold text-slate-200">{m.interviewer}</span>
                          <span>{m.date}</span>
                        </div>
                        <p className="text-slate-300">{m.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Job Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Job Application</h2>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palantir Technologies"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forward Deployed Software Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={e => setAppliedDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Resume Version Used</label>
                <input
                  type="text"
                  placeholder="e.g. v2.1-systems-fde.pdf"
                  value={resumeVersion}
                  onChange={e => setResumeVersion(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
