import { db, getTodayDateString, TaskItem } from './db';
import { cloudSyncService } from './cloudSyncService';

// Carry over unfinished tasks from previous days to today
export async function carryOverUnfinishedTasks(todayStr: string = getTodayDateString()) {
  try {
    const allTasks = await db.tasks.toArray();
    const previousUnfinished = allTasks.filter(t => !t.completed && t.date < todayStr);
    
    if (previousUnfinished.length > 0) {
      const todayTasks = allTasks.filter(t => t.date === todayStr);
      let maxOrder = todayTasks.reduce((max, t) => Math.max(max, t.order || 0), 0);

      for (const task of previousUnfinished) {
        if (task.id) {
          maxOrder += 1;
          await db.tasks.update(task.id, {
            date: todayStr,
            order: maxOrder,
          });
        }
      }
      cloudSyncService.triggerAutoSync();
    }
  } catch (err) {
    console.error('Error carrying over tasks:', err);
  }
}

// Add a new task
export async function addTask(
  title: string,
  topicId?: string,
  subtopicId?: string,
  subtopicTitle?: string,
  note?: string
): Promise<number> {
  const today = getTodayDateString();
  const allTasks = await db.tasks.toArray();
  const maxOrder = allTasks.reduce((max, t) => Math.max(max, t.order || 0), 0);

  const newId = (await db.tasks.add({
    title: title.trim(),
    completed: false,
    date: today,
    order: maxOrder + 1,
    topicId,
    subtopicId,
    subtopicTitle,
    note: note ? note.trim() : undefined,
    createdAt: Date.now(),
  })) as number;

  await cloudSyncService.pushToCloud();
  return newId;
}

// Update task note
export async function updateTaskNote(taskId: number, note?: string) {
  await db.tasks.update(taskId, {
    note: note ? note.trim() : undefined,
  });
  cloudSyncService.triggerAutoSync();
}

// Toggle complete task
export async function toggleTaskComplete(taskId: number, completed: boolean) {
  const task = await db.tasks.get(taskId);
  if (!task) return;

  await db.tasks.update(taskId, {
    completed,
    completedAt: completed ? Date.now() : undefined,
    date: getTodayDateString(),
  });

  // If this task is linked to a subtopic, also update subtopic status in curriculumTopics if present
  if (task.subtopicId) {
    try {
      const allCurriculum = await db.curriculumTopics.toArray();
      for (const curr of allCurriculum) {
        const subIndex = curr.subtopics.findIndex(s => s.id === task.subtopicId);
        if (subIndex !== -1) {
          curr.subtopics[subIndex].completed = completed;
          curr.subtopics[subIndex].status = completed ? 'done' : 'learning';
          curr.subtopics[subIndex].completedDate = completed ? getTodayDateString() : undefined;
          await db.curriculumTopics.put(curr);
          break;
        }
      }
    } catch (e) {
      console.warn('Could not sync linked subtopic:', e);
    }
  }

  await cloudSyncService.pushToCloud();
}

// Delete task by id or task object
export async function deleteTask(taskOrId: TaskItem | number) {
  let id = typeof taskOrId === 'number' ? taskOrId : taskOrId.id;

  if (!id && typeof taskOrId === 'object' && taskOrId.title) {
    const all = await db.tasks.toArray();
    const match = all.find(t => t.title.trim().toLowerCase() === taskOrId.title.trim().toLowerCase());
    if (match?.id) id = match.id;
  }

  if (id) {
    cloudSyncService.registerDeletedTaskId(id);
    await db.tasks.delete(id);
  }

  // Push immediately so Supabase updates right away and never restores this task
  await cloudSyncService.pushToCloud();
}

// Clear all completed tasks
export async function clearCompletedTasks() {
  const all = await db.tasks.toArray();
  const completed = all.filter(t => t.completed && t.id);
  for (const t of completed) {
    if (t.id) {
      cloudSyncService.registerDeletedTaskId(t.id);
      await db.tasks.delete(t.id);
    }
  }
  await cloudSyncService.pushToCloud();
}

// Reorder tasks
export async function reorderTasks(taskIdsInOrder: number[]) {
  for (let i = 0; i < taskIdsInOrder.length; i++) {
    await db.tasks.update(taskIdsInOrder[i], { order: i + 1 });
  }
  cloudSyncService.triggerAutoSync();
}
