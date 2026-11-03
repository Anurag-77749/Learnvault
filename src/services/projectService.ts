import { db, ProjectItem } from './db';

const SAMPLE_PROJECT_NAMES = [
  'Autonomous Web Agent with MCP Protocol',
  'Distributed High-Throughput Log Aggregator',
  'High-Throughput Enterprise RAG & Vector Pipeline',
  'Real-Time Edge Telemetry & Client Observability Platform'
];

/**
 * Completely cleans up any preseeded demo/sample projects from IndexedDB.
 */
export async function cleanupSampleProjects(): Promise<void> {
  try {
    const all = await db.projects.toArray();
    for (const proj of all) {
      const isSample = 
        SAMPLE_PROJECT_NAMES.includes(proj.name) ||
        proj.githubUrl?.includes('example/mcp-autonomous-agent') ||
        proj.githubUrl?.includes('example/go-log-aggregator') ||
        proj.githubUrl?.includes('polak-fde');

      if (isSample && proj.id) {
        await db.projects.delete(proj.id);
      }
    }
  } catch (err) {
    console.error('Error cleaning up sample projects:', err);
  }
}

// Deprecated: No longer seeds any sample projects. Cleans them up if present.
export async function seedSampleProjectsIfEmpty(): Promise<boolean> {
  await cleanupSampleProjects();
  return false;
}

export async function addProject(project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  return await db.projects.add({
    ...project,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateProject(id: number, updates: Partial<ProjectItem>) {
  await db.projects.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(id: number) {
  await db.projects.delete(id);
}
