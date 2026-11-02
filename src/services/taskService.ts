import { db, getTodayDateString, TaskItem } from './db';

// Carry over unfinished tasks from previous days to today
export async function carryOverUnfinishedTasks(todayStr: string = getTodayDateString()) {
  try {
    const allTasks = await db.tasks.toArray();
    const previousUnfinished = allTasks.filter(t => !t.completed && t.date < todayStr);
    
    if (previousUnfinished.length > 0) {
      // Find maximum order today
      const todayTasks = allTasks.filter(t => t.date === todayStr);
      let maxOrder = todayTasks.reduce((max, t) => Math.max(max, t.order || 0), 0);

      for (const task of previousUnfinished) {
        maxOrder += 1;
        await db.tasks.update(task.id!, {
          date: todayStr,
          order: maxOrder,
        });
      }
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
  const existing = await db.tasks.where('date').equals(today).toArray();
  const maxOrder = existing.reduce((max, t) => Math.max(max, t.order || 0), 0);

  return (await db.tasks.add({
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
}

// Update task note
export async function updateTaskNote(taskId: number, note?: string) {
  await db.tasks.update(taskId, {
    note: note ? note.trim() : undefined,
  });
}

// Toggle complete task
export async function toggleTaskComplete(taskId: number, completed: boolean) {
  const task = await db.tasks.get(taskId);
  if (!task) return;

  await db.tasks.update(taskId, {
    completed,
    completedAt: completed ? Date.now() : undefined,
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
}

// Delete task
export async function deleteTask(taskId: number) {
  await db.tasks.delete(taskId);
}

// Reorder tasks
export async function reorderTasks(taskIdsInOrder: number[]) {
  for (let i = 0; i < taskIdsInOrder.length; i++) {
    await db.tasks.update(taskIdsInOrder[i], { order: i + 1 });
  }
}
