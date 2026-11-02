import { db, TimelineBlock } from './db';

export const PRESET_TIMELINE_BLOCKS: Omit<TimelineBlock, 'id'>[] = [
  {
    trackId: 0,
    title: 'Track 0: Introduction to FDE',
    startDate: '2026-11-01',
    endDate: '2026-11-03',
    laneIndex: 0,
    isParallel: false,
    status: 'Ready to Start',
    notes: 'Delta, UAT, Last-Mile Integration, Day 2 Operations, FDE Tiers.',
  },
  {
    trackId: 1,
    title: 'Track 1: Python (Main Language)',
    startDate: '2026-11-03',
    endDate: '2027-02-15',
    laneIndex: 0,
    isParallel: true,
    status: 'Upcoming',
    notes: 'Angela Yu 100 Days Bootcamp + Python internals. Parallel with daily DSA.',
  },
  {
    trackId: 2,
    title: 'Track 2: DSA (Striver A2Z + Code & Debug)',
    startDate: '2026-11-03',
    endDate: '2030-10-31',
    laneIndex: 1,
    isParallel: true,
    status: 'In Progress',
    notes: 'Continuous parallel lane throughout all 4 years: 1 to 2 problems daily.',
  },
  {
    trackId: 3,
    title: 'Track 3: Git & GitHub',
    startDate: '2026-11-10',
    endDate: '2026-11-13',
    laneIndex: 2,
    isParallel: true,
    status: 'Upcoming',
    notes: 'Git CLI, branches, merge, rebase, PR reviews, commit hygiene. Parallel with DSA.',
  },
  {
    trackId: 4,
    title: 'Track 4: Linux Skills',
    startDate: '2026-11-15',
    endDate: '2026-11-30',
    laneIndex: 2,
    isParallel: false,
    status: 'Queue',
    notes: 'Hierarchy, permissions, processes, networking, Bash scripting.',
  },
  {
    trackId: 5,
    title: 'Track 5: Frontend Skills (React & TypeScript)',
    startDate: '2027-02-01',
    endDate: '2027-03-03',
    laneIndex: 0,
    isParallel: true,
    status: 'Upcoming',
    notes: 'Modern React, hooks, state, Tailwind, Vite, 8 Frontend projects.',
  },
  {
    trackId: 6,
    title: 'Track 6: Backend Skills (Node.js & PostgreSQL)',
    startDate: '2027-03-03',
    endDate: '2027-05-03',
    laneIndex: 0,
    isParallel: false,
    status: 'Upcoming',
    notes: 'REST & gRPC APIs, SQL, PostgreSQL, indexing, NoSQL databases.',
  },
  {
    trackId: 12,
    title: 'Track 12: Communication, English & ADSD',
    startDate: '2026-11-01',
    endDate: '2027-05-31',
    laneIndex: 3,
    isParallel: true,
    status: 'In Progress',
    notes: 'Executive speaking, technical English writing, and Analog & Digital System Design.',
  },
];

export async function seedTimelineIfEmpty(forceReset = false): Promise<boolean> {
  try {
    const count = await db.timelineBlocks.count();
    if (count > 0 && !forceReset) {
      return false;
    }

    if (forceReset) {
      await db.timelineBlocks.clear();
    }

    await db.timelineBlocks.bulkAdd(PRESET_TIMELINE_BLOCKS as any);
    return true;
  } catch (err) {
    console.error('Error seeding timeline:', err);
    return false;
  }
}

export async function addTimelineBlock(block: Omit<TimelineBlock, 'id'>) {
  return await db.timelineBlocks.add(block as TimelineBlock);
}

export async function updateTimelineBlock(id: number, updates: Partial<TimelineBlock>) {
  await db.timelineBlocks.update(id, updates);
}

export async function deleteTimelineBlock(id: number) {
  await db.timelineBlocks.delete(id);
}

// Shift remaining unfinished plan by X days
export async function shiftRemainingPlan(days: number) {
  const blocks = await db.timelineBlocks.toArray();
  for (const block of blocks) {
    if (block.status !== 'Completed' && block.id) {
      const shiftDate = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        d.setDate(d.getDate() + days);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      await db.timelineBlocks.update(block.id, {
        startDate: shiftDate(block.startDate),
        endDate: shiftDate(block.endDate),
      });
    }
  }
}
