import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  FolderGit2, 
  Plus, 
  Github, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Sparkles, 
  FileText, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock, 
  X,
  Code
} from 'lucide-react';
import { db, ProjectItem, getTodayDateString } from '../services/db';
import { 
  cleanupSampleProjects, 
  addProject, 
  updateProject, 
  deleteProject 
} from '../services/projectService';
import { triggerGoldSparkle } from '../utils/confetti';

const CATEGORIES = [
  'Python & Scripts',
  'Frontend & React',
  'Backend & APIs',
  'AI Engineering & Agents',
  'Data Engineering',
  'DevOps & Cloud',
  'Systems & Low-Level',
  'Other Portfolio Work',
];

const STATUS_OPTIONS: ProjectItem['status'][] = [
  'In Progress',
  'MVP Ready',
  'Completed',
  'Ideation',
];

export const ProjectsScreen: React.FC = () => {
  useEffect(() => {
    cleanupSampleProjects();
  }, []);

  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray()) || [];

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [expandedReadmeId, setExpandedReadmeId] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState<ProjectItem['status']>('In Progress');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [aboutReadme, setAboutReadme] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());

  const openAddModal = () => {
    setEditingProject(null);
    setName('');
    setCategory(CATEGORIES[0]);
    setStatus('In Progress');
    setGithubUrl('');
    setLiveDemoUrl('');
    setAboutReadme('');
    setTagsInput('');
    setStartDate(getTodayDateString());
    setShowModal(true);
  };

  const openEditModal = (p: ProjectItem) => {
    setEditingProject(p);
    setName(p.name);
    setCategory(p.category || CATEGORIES[0]);
    setStatus(p.status || 'In Progress');
    setGithubUrl(p.githubUrl || '');
    setLiveDemoUrl(p.liveDemoUrl || '');
    setAboutReadme(p.aboutReadme || '');
    setTagsInput((p.tags || []).join(', '));
    setStartDate(p.startDate || getTodayDateString());
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !aboutReadme.trim() || !githubUrl.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject && editingProject.id) {
      await updateProject(editingProject.id, {
        name: name.trim(),
        category,
        status,
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        aboutReadme: aboutReadme.trim(),
        tags,
        startDate,
        completedDate: status === 'Completed' ? getTodayDateString() : undefined,
      });
    } else {
      await addProject({
        name: name.trim(),
        category,
        status,
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        aboutReadme: aboutReadme.trim(),
        tags,
        startDate,
        completedDate: status === 'Completed' ? getTodayDateString() : undefined,
      });
      triggerGoldSparkle(0.5, 0.5);
    }

    setShowModal(false);
    setEditingProject(null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this project record from your portfolio tracker?')) {
      await deleteProject(id);
    }
  };

  const totalCount = projects.length;
  const completedCount = projects.filter((p) => p.status === 'Completed' || p.status === 'MVP Ready').length;
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length;

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5 mb-1 font-sans">
            <FolderGit2 className="w-3.5 h-3.5" /> 4-Year Engineering Portfolio
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Project Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#B8B0AA] font-sans mt-0.5">
            Log projects, documentation READMEs, and GitHub source code across your journey
          </p>
        </div>

        {/* Add Project Button */}
        <button
          onClick={openAddModal}
          className="min-h-[44px] px-4 py-2 rounded-2xl btn-shiny-gold text-xs font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Telemetry Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] font-bold text-[#FFDF73] uppercase">
            Total Projects
          </span>
          <div className="font-serif text-3xl font-bold text-white mt-1">
            {totalCount}
          </div>
          <span className="text-[11px] text-shiny-gold mt-1 block">In Portfolio</span>
        </div>

        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] font-bold text-[#FFDF73] uppercase">
            Completed / MVP
          </span>
          <div className="font-serif text-3xl font-bold text-shiny-gold mt-1">
            {completedCount}
          </div>
          <span className="text-[11px] text-[#FFDF73]/80 mt-1 block font-medium">Shipped Code</span>
        </div>

        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] font-bold text-[#FFDF73] uppercase">
            In Progress
          </span>
          <div className="font-serif text-3xl font-bold text-shiny-gold mt-1">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-[#B8B0AA] mt-1 block">Active Development</span>
        </div>

        <div className="p-4 rounded-2xl card-maroon-gold shadow-md">
          <span className="text-[11px] font-bold text-[#FFDF73] uppercase">
            GitHub Linked
          </span>
          <div className="font-serif text-3xl font-bold text-white mt-1">
            {projects.filter((p) => p.githubUrl).length}
          </div>
          <span className="text-[11px] text-shiny-gold mt-1 block">Public Repositories</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="p-12 rounded-3xl card-maroon-gold text-center space-y-3">
            <FolderGit2 className="w-10 h-10 text-shiny-gold mx-auto opacity-80" />
            <h3 className="font-serif text-xl font-bold text-white">No projects added yet</h3>
            <p className="text-xs text-[#B8B0AA] max-w-md mx-auto">
              Track your Python mini-projects, full-stack apps, AI agents, and systems tools here. Click the button below to add your first project.
            </p>
            <button
              onClick={openAddModal}
              className="min-h-[44px] px-5 py-2 rounded-2xl btn-shiny-gold text-xs font-bold inline-flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Project</span>
            </button>
          </div>
        ) : (
          projects.map((p) => {
            const isReadmeExpanded = expandedReadmeId === p.id;

            return (
              <div
                key={p.id}
                className="rounded-3xl card-maroon-gold p-5 sm:p-6 transition-all duration-200 shadow-xl space-y-4"
              >
                {/* Top Row: Title, Status, Category & External Links */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                        {p.name}
                      </h3>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          p.status === 'Completed'
                            ? 'bg-[#004D20] text-[#73FF9D] border-[#009940]'
                            : p.status === 'MVP Ready'
                            ? 'bg-[#3D2500] text-[#FFDF73] border-[#D4AF37]'
                            : p.status === 'In Progress'
                            ? 'bg-[#220509] text-[#FFA8C5] border-[#1a1a1a]'
                            : 'bg-[#000000] text-[#B8B0AA] border-[#1a1a1a]'
                        }`}
                      >
                        {p.status}
                      </span>

                      {/* Category Badge */}
                      {p.category && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#000000] text-[#D4AF37] border border-[#D4AF37]/35 font-semibold">
                          {p.category}
                        </span>
                      )}
                    </div>

                    {/* Metadata & Dates */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#B8B0AA] font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#D4AF37]" />
                        Started: {p.startDate}
                      </span>
                      {p.completedDate && (
                        <span className="text-[#D4AF37]">
                          Completed: {p.completedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {/* GitHub Link */}
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-[#000000] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="View Source on GitHub"
                      >
                        <Github className="w-4 h-4 text-[#D4AF37]" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}

                    {/* Live Demo */}
                    {p.liveDemoUrl && (
                      <a
                        href={p.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-[#000000] border border-[#1a1a1a] hover:border-[#D4AF37] text-[#B8B0AA] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Open Live Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(p)}
                      className="min-h-[42px] min-w-[42px] rounded-xl bg-black border border-[#1a1a1a] hover:border-[#D4AF37] text-[#B8B0AA] hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                      title="Edit project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="min-h-[42px] min-w-[42px] rounded-xl bg-black border border-red-950/60 hover:border-red-500/50 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-black/60 border border-[#1a1a1a] text-[#B8B0AA]"
                      >
                        <Tag className="w-2.5 h-2.5 text-[#D4AF37]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* About Project README Display */}
                <div className="p-4 rounded-2xl bg-black/80 border border-[#1a1a1a] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>README.md</span>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedReadmeId(isReadmeExpanded ? null : p.id || null)
                      }
                      className="text-[11px] text-[#B8B0AA] hover:text-[#D4AF37] font-medium"
                    >
                      {isReadmeExpanded ? 'Show Less' : 'Expand Full'}
                    </button>
                  </div>

                  <div
                    className={`text-xs text-[#E5E0DC] font-sans leading-relaxed whitespace-pre-wrap ${
                      isReadmeExpanded ? '' : 'line-clamp-4'
                    }`}
                  >
                    {p.aboutReadme}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#080808] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Add Project to Portfolio'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#B8B0AA] hover:text-[#D4AF37] p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Project Name */}
              <div>
                <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                  Project Name <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autonomous Browser Agent, Distributed Log Aggregator..."
                  style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0E0205] border border-[#1a1a1a] focus:border-[#D4AF37] text-white text-sm focus:outline-none cursor-pointer"
                  required
                  autoFocus
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#1a1a1a] focus:border-[#D4AF37] text-white text-sm focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{ colorScheme: 'dark' }} className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0E0205] border border-[#1a1a1a] focus:border-[#D4AF37] text-[#D4AF37] font-semibold text-sm focus:outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GitHub Link & Live Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                    Code GitHub Link <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#1a1a1a] focus:border-[#D4AF37] text-white text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                    Live Demo Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#1a1a1a] focus:border-[#D4AF37] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                    Tech Stack Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Python, FastAPI, Docker, PostgreSQL"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#1a1a1a] focus:border-[#D4AF37] text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black border border-[#1a1a1a] focus:border-[#D4AF37] text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* About that Project README */}
              <div>
                <label className="text-[11px] font-semibold text-[#B8B0AA] uppercase block mb-1">
                  About That Project README <span className="text-[#D4AF37]">*</span>
                </label>
                <textarea
                  value={aboutReadme}
                  onChange={(e) => setAboutReadme(e.target.value)}
                  placeholder={`# Project Title\n\n### Overview\nWhat does this project solve? What did you build?\n\n### Architecture & Implementation\nKey modules, database design, and concurrency.\n\n### What I Learned\nInsights, bottlenecks solved, and performance optimizations.`}
                  rows={8}
                  className="w-full p-3.5 rounded-2xl bg-black border border-[#1a1a1a] focus:border-[#D4AF37] text-[#E5E0DC] text-xs font-mono focus:outline-none"
                  required
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a1a1a] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-[#B8B0AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-2xl btn-shiny-gold text-xs font-bold"
                >
                  {editingProject ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};