import { db, ProjectItem, getTodayDateString } from './db';

export const SAMPLE_PROJECTS: Omit<ProjectItem, 'id'>[] = [
  {
    name: 'Autonomous Web Agent with MCP Protocol',
    category: 'AI Engineering',
    aboutReadme: `# Autonomous Web Agent with Model Context Protocol (MCP)

### Overview
A production-ready AI agent built using Python, Claude 3.5 Sonnet, and Anthropic's Model Context Protocol (MCP). The agent executes last-mile browser automations, extracts semi-structured tables into PostgreSQL, and performs automated delta evaluations.

### Key Features
- **MCP Server Integration**: Exposes local terminal and SQLite tools directly to the LLM.
- **RAG Subsystem**: Context caching with vector search over engineering RFCs.
- **Self-Healing DOM Navigation**: Retries with fuzzy CSS selectors if site UI updates.

### Tech Stack
Python 3.12, Anthropic SDK, Playwright, PostgreSQL, Docker.`,
    githubUrl: 'https://github.com/example/mcp-autonomous-agent',
    liveDemoUrl: 'https://mcp-agent-demo.internal',
    status: 'MVP Ready',
    startDate: '2026-11-01',
    tags: ['Python', 'MCP', 'LLMs', 'Playwright'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'Distributed High-Throughput Log Aggregator',
    category: 'Backend & Systems',
    aboutReadme: `# Distributed High-Throughput Log Aggregator

### Overview
A lightweight distributed log collector written in Go and PostgreSQL, designed to handle 25,000 requests/sec with Raft-based metadata consensus.

### Architecture
1. **Edge Forwarders**: Lightweight Go daemons streaming gRPC logs with gzip compression.
2. **Buffer Queue**: In-memory ring buffer with overflow to local disk persistence.
3. **Partitioned Storage**: PostgreSQL with TimescaleDB hypertables.`,
    githubUrl: 'https://github.com/example/go-log-aggregator',
    status: 'In Progress',
    startDate: '2026-11-03',
    tags: ['Go', 'PostgreSQL', 'gRPC', 'Distributed Systems'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  }
];

export async function seedSampleProjectsIfEmpty(): Promise<boolean> {
  try {
    const count = await db.projects.count();
    if (count > 0) return false;
    await db.projects.bulkAdd(SAMPLE_PROJECTS as any);
    return true;
  } catch (err) {
    console.error('Error seeding sample projects:', err);
    return false;
  }
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
