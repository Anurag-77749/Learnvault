import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  HelpCircle, 
  X,
  Building,
  FileText,
  UserCheck
} from 'lucide-react';
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
        return 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40';
      case 'interviewing':
        return 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/40';
      case 'applied':
        return 'bg-white/[0.08] text-white border-white/[0.15]';
      case 'wishlist':
        return 'bg-white/[0.04] text-[#9898A0] border-white/[0.08]';
      case 'rejected':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      default:
        return 'bg-white/[0.04] text-[#9898A0] border-white/[0.08]';
    }
  };

  return (
    <div className="space-y-6 pb-28 font-sans max-w-[1500px] mx-auto select-none">
      {/* 1. TOP PIPELINE COMMAND HEADER (SMOKED OBSIDIAN) */}
      <div className="smoked-glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9898A0] font-bold">
              CAREER HQ // FORWARD DEPLOYED PIPELINE
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Interview & Application Command
          </h1>
          <p className="text-xs text-[#9898A0] mt-1">
            Track Forward Deployed Engineer & Solutions Engineering pipelines, real technical interview rounds, and mock feedback.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-full btn-mercury text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="font-mono uppercase text-[11px]">Add Application</span>
        </button>
      </div>

      {/* 2. PIPELINE STAGE CHIPS (HIGH DENSITY / LEAST MESS) */}
      <div className="flex flex-wrap gap-2">
        {['all', 'wishlist', 'applied', 'interviewing', 'offer', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === st
                ? 'bg-gradient-to-b from-white to-[#E0E0E6] text-[#050507] shadow-md font-black'
                : 'bg-white/[0.04] text-[#9898A0] hover:text-white border border-white/[0.08]'
            }`}
          >
            {st} ({st === 'all' ? jobs.length : jobs.filter(j => j.status === st).length})
          </button>
        ))}
      </div>

      {/* 3. APPLICATIONS LIST */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="smoked-glass p-12 text-center text-[#9898A0] font-mono text-xs border border-dashed border-white/[0.08]">
            NO APPLICATIONS CURRENTLY TRACKED IN THIS PIPELINE STAGE.
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="smoked-glass p-5 sm:p-6 space-y-4 relative overflow-hidden"
            >
              {/* Header: Company, Role & Status Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#FF5500]" />
                    <h3 className="font-display font-extrabold text-lg text-white">
                      {job.company}
                    </h3>
                    <span className="text-xs text-[#9898A0]">({job.role})</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-[#9898A0]">
                    <span>APPLIED: {job.applied_date}</span>
                    <span>•</span>
                    <span>RESUME: {job.resume_version}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={job.status}
                    onChange={e => handleUpdateStatus(job.id, e.target.value)}
                    className={`text-[10px] font-mono font-bold uppercase rounded-lg px-2.5 py-1.5 border focus:outline-none ${getStatusColor(
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
                    className="p-1.5 text-[#9898A0] hover:text-rose-400 bg-white/[0.04] border border-white/[0.08] rounded-lg transition cursor-pointer"
                    title="Delete Application"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-Section 1: Interview Rounds Timeline */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-[#9898A0]">
                    <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>INTERVIEW ROUNDS ({job.rounds.length})</span>
                  </div>
                  <button
                    onClick={() => setActiveRoundJobId(activeRoundJobId === job.id ? null : job.id)}
                    className="text-[10px] font-mono text-[#FF5500] hover:underline font-bold cursor-pointer"
                  >
                    {activeRoundJobId === job.id ? 'Cancel' : '+ Add Round'}
                  </button>
                </div>

                {activeRoundJobId === job.id && (
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.1] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Round Name (e.g. System Design)"
                        value={newRoundName}
                        onChange={e => setNewRoundName(e.target.value)}
                        className="input-command-bar text-xs rounded-lg px-2.5 py-1.5"
                      />
                      <input
                        type="date"
                        value={newRoundDate}
                        onChange={e => setNewRoundDate(e.target.value)}
                        className="input-command-bar text-xs rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Notes or areas evaluated..."
                      value={newRoundNotes}
                      onChange={e => setNewRoundNotes(e.target.value)}
                      className="w-full input-command-bar text-xs rounded-lg px-2.5 py-1.5"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleAddRound(job.id)}
                        className="px-3 py-1 btn-mercury text-[10px] font-mono font-bold rounded-full"
                      >
                        Save Round
                      </button>
                    </div>
                  </div>
                )}

                {job.rounds.length === 0 ? (
                  <p className="text-[11px] font-mono text-[#9898A0] italic">No interview rounds recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {job.rounds.map((rnd, idx) => (
                      <div
                        key={rnd.id || idx}
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{rnd.name}</span>
                            <span className="text-[10px] font-mono text-[#9898A0]">({rnd.date})</span>
                          </div>
                          {rnd.notes && <p className="text-[11px] text-[#9898A0] mt-0.5 font-mono">{rnd.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-Section 2: Questions Asked Bank */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-[#9898A0]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>TECHNICAL QUESTIONS ASKED ({job.questions_asked?.length || 0})</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Log a question asked in this company's interviews..."
                    value={newQuestions[job.id] || ''}
                    onChange={e => setNewQuestions({ ...newQuestions, [job.id]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddQuestion(job.id)}
                    className="flex-1 input-command-bar text-xs rounded-lg px-3 py-1.5"
                  />
                  <button
                    onClick={() => handleAddQuestion(job.id)}
                    className="px-3 py-1 btn-tactile text-[10px] font-mono font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {job.questions_asked && job.questions_asked.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {job.questions_asked.map((q, idx) => (
                      <div key={idx} className="text-xs text-[#F5F5F7] font-mono bg-white/[0.02] px-2.5 py-1 rounded border border-white/[0.04]">
                        • {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. MODAL: ADD APPLICATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md smoked-glass p-6 space-y-4 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FF5500]" />
                <h3 className="font-display font-bold text-lg text-white">Add Job Application</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9898A0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palantir Technologies"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forward Deployed Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={e => setAppliedDate(e.target.value)}
                    className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9898A0] block mb-1">Resume Version</label>
                <input
                  type="text"
                  value={resumeVersion}
                  onChange={e => setResumeVersion(e.target.value)}
                  placeholder="v1.2-fde-systems.pdf"
                  className="w-full input-command-bar rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9898A0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full btn-mercury text-xs font-black shadow-md cursor-pointer"
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
