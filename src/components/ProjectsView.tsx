import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { dataService } from '../services/dataService';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStackStr, setTechStackStr] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'completed'>('in_progress');
  const [milestonesStr, setMilestonesStr] = useState('');

  const loadProjects = () => {
    setProjects(dataService.getProjects());
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    dataService.toggleProjectMilestone(projectId, milestoneId);
    loadProjects();
  };

  const handleToggleReadme = (projectId: string, readmeId: string) => {
    dataService.toggleProjectReadmeItem(projectId, readmeId);
    loadProjects();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this project from your portfolio tracker?')) {
      dataService.deleteProject(id);
      loadProjects();
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setTechStackStr('FastAPI, PostgreSQL, React, TypeScript, Docker');
    setGithubUrl('');
    setDemoUrl('');
    setDemoVideoUrl('');
    setStatus('in_progress');
    setMilestonesStr('Architecture spec\nCore database schema\nClient deployment POC');
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProjectItem) => {
    setEditingProject(p);
    setTitle(p.title);
    setDescription(p.description);
    setTechStackStr(p.tech_stack.join(', '));
    setGithubUrl(p.github_url);
    setDemoUrl(p.demo_url);
    setDemoVideoUrl(p.demo_video_url);
    setStatus(p.status);
    setMilestonesStr(p.milestones.map(m => m.title).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const stack = techStackStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingProject) {
      dataService.updateProject(editingProject.id, {
        title: title.trim(),
        description: description.trim(),
        tech_stack: stack,
        github_url: githubUrl.trim(),
        demo_url: demoUrl.trim(),
        demo_video_url: demoVideoUrl.trim(),
        status
      });
    } else {
      const ms = milestonesStr
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map((m, idx) => ({
          id: `m-${Date.now()}-${idx}`,
          title: m,
          completed: false
        }));

      dataService.addProject({
        title: title.trim(),
        description: description.trim(),
        tech_stack: stack,
        github_url: githubUrl.trim(),
        demo_url: demoUrl.trim(),
        demo_video_url: demoVideoUrl.trim(),
        status,
        milestones: ms,
        readme_checklist: [
          { id: `r-${Date.now()}-1`, title: 'Clear architecture diagram (Mermaid/System design)', completed: false },
          { id: `r-${Date.now()}-2`, title: '2-minute video walkthrough showcasing client integration', completed: false },
          { id: `r-${Date.now()}-3`, title: 'High-res UI screenshots & telemetry metrics', completed: false },
          { id: `r-${Date.now()}-4`, title: 'One-command Docker Compose setup instruction', completed: false }
        ]
      });
    }

    setIsModalOpen(false);
    loadProjects();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">FDE Portfolio Projects</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Production-grade systems showcasing architecture diagrams, 2-minute video demos, and client integrations.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(proj => {
          const totalMilestones = proj.milestones.length;
          const completedMilestones = proj.milestones.filter(m => m.completed).length;
          const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

          const totalReadme = proj.readme_checklist.length;
          const completedReadme = proj.readme_checklist.filter(r => r.completed).length;
          const isPortfolioReady = totalReadme > 0 && completedReadme === totalReadme;

          return (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-6 flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          proj.status === 'completed'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                            : proj.status === 'in_progress'
                            ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {proj.status === 'in_progress' ? 'In Progress' : proj.status.toUpperCase()}
                      </span>
                      {isPortfolioReady && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                          🏆 Portfolio Ready
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Edit Project"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Delete Project"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mt-2 leading-relaxed">{proj.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {proj.tech_stack.map(tech => (
                    <span
                      key={tech}
                      className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* External links */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <span>GitHub</span>
                      <span>↗</span>
                    </a>
                  )}
                  {proj.demo_url && (
                    <a
                      href={proj.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <span>Live Demo</span>
                      <span>↗</span>
                    </a>
                  )}
                  {proj.demo_video_url && (
                    <a
                      href={proj.demo_video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <span>2-Min Demo Video</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>

                {/* README Standard Checklist */}
                <div className="mt-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      README Standard Checklist
                    </span>
                    <span className="text-xs font-mono text-indigo-400">
                      {completedReadme}/{totalReadme} Completed
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {proj.readme_checklist.map(item => (
                      <label
                        key={item.id}
                        className="flex items-start gap-2 text-xs cursor-pointer hover:bg-slate-800/40 p-1 rounded transition select-none"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleReadme(proj.id, item.id)}
                          className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                        />
                        <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                          {item.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Milestones Checklist */}
                {proj.milestones.length > 0 && (
                  <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Milestones ({milestonePercent}%)
                      </span>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${milestonePercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {proj.milestones.map(m => (
                        <label
                          key={m.id}
                          className="flex items-start gap-2 text-xs cursor-pointer hover:bg-slate-800/40 p-1 rounded transition select-none"
                        >
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => handleToggleMilestone(proj.id, m.id)}
                            className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                          />
                          <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                            {m.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProject ? 'Edit Project' : 'Add New Portfolio Project'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-Time Telemetry Pipeline"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description & FDE Value Proposition</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What customer problem does this prototype solve?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="FastAPI, React, Docker..."
                    value={techStackStr}
                    onChange={e => setTechStackStr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://...vercel.app"
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">2-Min Demo Video URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={demoVideoUrl}
                    onChange={e => setDemoVideoUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {!editingProject && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Initial Milestones (one per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Architecture spec&#10;Core database schema&#10;Client POC"
                    value={milestonesStr}
                    onChange={e => setMilestonesStr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
