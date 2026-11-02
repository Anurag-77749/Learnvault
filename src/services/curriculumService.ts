import { db, CurriculumTopic, SubtopicItem, getTodayDateString } from './db';
import { CANONICAL_CURRICULUM } from '../data/curriculumData';

// Seed canonical curriculum into Dexie if empty or updated
export async function seedCurriculumIfEmpty(forceReset = false): Promise<boolean> {
  try {
    const count = await db.curriculumTopics.count();
    const allExisting = await db.curriculumTopics.toArray();
    const hasOldPython = allExisting.some(t => t.id === 't1-1');
    const needsSync = count < 83 || hasOldPython || allExisting.some(t => !t.resources || t.resources.length === 0);

    if (count > 0 && !needsSync && !forceReset) {
      return false;
    }

    if (hasOldPython) {
      await db.curriculumTopics.delete('t1-1');
    }

    // Preserve existing subtopic completions & user custom fields if syncing
    const existingMap = new Map<string, CurriculumTopic>();
    if (!forceReset) {
      allExisting.forEach((t) => {
        if (t.id !== 't1-1') {
          existingMap.set(t.id, t);
        }
      });
    } else {
      await db.curriculumTopics.clear();
    }

    let globalOrder = 1;
    const records: CurriculumTopic[] = [];

    for (const track of CANONICAL_CURRICULUM) {
      for (const topic of track.topics) {
        const existing = existingMap.get(topic.id);
        const existingSubMap = new Map<string, SubtopicItem>();
        if (existing) {
          existing.subtopics.forEach((s) => existingSubMap.set(s.title.toLowerCase(), s));
        }

        const subtopicItems: SubtopicItem[] = topic.subtopics.map((sub, idx) => {
          const prev = existingSubMap.get(sub.toLowerCase());
          return {
            id: prev ? prev.id : `sub-${topic.id}-${idx + 1}`,
            title: sub,
            completed: prev ? prev.completed : false,
            status: prev ? prev.status : 'not_started',
            deadline: prev?.deadline,
            completedDate: prev?.completedDate,
            resources: prev && prev.resources?.length ? prev.resources : [],
            notes: prev?.notes,
            orderIndex: idx + 1,
          };
        });

        records.push({
          id: topic.id,
          trackId: track.trackId,
          trackTitle: track.trackTitle,
          topicTitle: existing ? existing.topicTitle : topic.title,
          orderIndex: globalOrder++,
          deadline: existing?.deadline,
          completedDate: existing?.completedDate,
          resources: (topic.resources && topic.resources.length > 0) ? topic.resources : (existing?.resources || []),
          notes: existing?.notes,
          subtopics: subtopicItems,
        });
      }
    }

    await db.curriculumTopics.bulkPut(records);
    return true;
  } catch (err) {
    console.error('Failed to seed curriculum:', err);
    return false;
  }
}

// Toggle subtopic completion
export async function toggleSubtopicCompletion(
  topicId: string,
  subtopicId: string,
  completed: boolean
) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const subIndex = topic.subtopics.findIndex((s) => s.id === subtopicId);
  if (subIndex === -1) return;

  topic.subtopics[subIndex].completed = completed;
  topic.subtopics[subIndex].status = completed ? 'done' : 'learning';
  topic.subtopics[subIndex].completedDate = completed ? getTodayDateString() : undefined;

  // Auto-mark topic completed date if all subtopics are completed
  const allCompleted = topic.subtopics.every((s) => s.completed);
  if (allCompleted) {
    topic.completedDate = getTodayDateString();
  } else if (!completed) {
    topic.completedDate = undefined;
  }

  await db.curriculumTopics.put(topic);

  // Sync to any linked task
  try {
    const matchingTasks = await db.tasks.where('subtopicId').equals(subtopicId).toArray();
    for (const t of matchingTasks) {
      if (t.id && t.completed !== completed) {
        await db.tasks.update(t.id, {
          completed,
          completedAt: completed ? Date.now() : undefined,
        });
      }
    }
  } catch (err) {
    console.error('Error syncing subtopic completion to tasks:', err);
  }

  // Sync to today's dailyLog topicsLearned if completed
  if (completed) {
    try {
      const today = getTodayDateString();
      const log = await db.dailyLogs.get(today);
      const subTitle = topic.subtopics[subIndex].title;
      if (log) {
        const currentLearned = log.topicsLearned || [];
        if (!currentLearned.includes(subTitle)) {
          await db.dailyLogs.update(today, {
            topicsLearned: [...currentLearned, subTitle],
          });
        }
      }
    } catch (err) {
      console.error('Error syncing to daily log:', err);
    }
  }
}

// Update topic details (deadline, notes, resources, topicTitle)
export async function updateTopic(
  topicId: string,
  updates: Partial<CurriculumTopic>
) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const updated = { ...topic, ...updates };
  await db.curriculumTopics.put(updated);
}

// Add resource to topic
export async function addResourceToTopic(
  topicId: string,
  title: string,
  url: string
) {
  const isVideo =
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo') ||
    url.includes('loom');
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const currentResources = topic.resources || [];
  currentResources.push({
    title: title.trim() || url.trim(),
    url: url.trim(),
    isVideo,
  });

  topic.resources = currentResources;
  await db.curriculumTopics.put(topic);
}

// Add a new topic
export async function addTopic(trackId: number, trackTitle: string, topicTitle: string) {
  const allInTrack = await db.curriculumTopics.where('trackId').equals(trackId).toArray();
  const newTopic: CurriculumTopic = {
    id: `custom-topic-${trackId}-${Date.now()}`,
    trackId,
    trackTitle,
    topicTitle: topicTitle.trim(),
    orderIndex: allInTrack.length + 1,
    subtopics: [],
  };
  await db.curriculumTopics.put(newTopic);
  return newTopic;
}

// Delete topic
export async function deleteTopic(topicId: string) {
  await db.curriculumTopics.delete(topicId);
}

// Reorder topics in track
export async function reorderTopics(topicIdsInOrder: string[]) {
  for (let idx = 0; idx < topicIdsInOrder.length; idx++) {
    const id = topicIdsInOrder[idx];
    const topic = await db.curriculumTopics.get(id);
    if (topic) {
      topic.orderIndex = idx + 1;
      await db.curriculumTopics.put(topic);
    }
  }
}

// Update subtopic details (status, deadline, notes, resources)
export async function updateSubtopic(
  topicId: string,
  subtopicId: string,
  updates: Partial<SubtopicItem>
) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const subIndex = topic.subtopics.findIndex((s) => s.id === subtopicId);
  if (subIndex === -1) return;

  topic.subtopics[subIndex] = { ...topic.subtopics[subIndex], ...updates };
  await db.curriculumTopics.put(topic);
}

// Add resource to topic or subtopic
export async function addResourceToSubtopic(
  topicId: string,
  subtopicId: string,
  title: string,
  url: string
) {
  const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo') || url.includes('loom');
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const subIndex = topic.subtopics.findIndex((s) => s.id === subtopicId);
  if (subIndex === -1) return;

  topic.subtopics[subIndex].resources.push({
    title: title.trim() || url.trim(),
    url: url.trim(),
    isVideo,
  });

  await db.curriculumTopics.put(topic);
}

// Add a new custom subtopic
export async function addSubtopic(topicId: string, title: string) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const newSub: SubtopicItem = {
    id: `sub-${topicId}-${Date.now()}`,
    title: title.trim(),
    completed: false,
    status: 'not_started',
    resources: [],
    orderIndex: topic.subtopics.length + 1,
  };

  topic.subtopics.push(newSub);
  await db.curriculumTopics.put(topic);
}

// Rename subtopic
export async function renameSubtopic(topicId: string, subtopicId: string, newTitle: string) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const sub = topic.subtopics.find((s) => s.id === subtopicId);
  if (sub) {
    sub.title = newTitle.trim();
    await db.curriculumTopics.put(topic);
  }
}

// Delete subtopic
export async function deleteSubtopic(topicId: string, subtopicId: string) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  topic.subtopics = topic.subtopics.filter((s) => s.id !== subtopicId);
  await db.curriculumTopics.put(topic);
}

// Reorder subtopic
export async function reorderSubtopics(topicId: string, subtopicIdsInOrder: string[]) {
  const topic = await db.curriculumTopics.get(topicId);
  if (!topic) return;

  const reordered: SubtopicItem[] = [];
  subtopicIdsInOrder.forEach((id, idx) => {
    const item = topic.subtopics.find((s) => s.id === id);
    if (item) {
      item.orderIndex = idx + 1;
      reordered.push(item);
    }
  });

  topic.subtopics = reordered;
  await db.curriculumTopics.put(topic);
}

// Bulk import from pasted string: Track | Topic | Subtopic | URL
export async function importFromPastedList(pastedText: string): Promise<{ added: number; skipped: number }> {
  const lines = pastedText.split('\n').map((l) => l.trim()).filter(Boolean);
  let added = 0;
  let skipped = 0;

  for (const line of lines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      skipped++;
      continue;
    }

    const [trackName, topicName, subtopicName, url] = parts;
    const allTopics = await db.curriculumTopics.toArray();
    
    // Find or create topic
    let targetTopic = allTopics.find(
      (t) => t.topicTitle.toLowerCase() === topicName.toLowerCase() ||
             t.trackTitle.toLowerCase().includes(trackName.toLowerCase())
    );

    if (!targetTopic) {
      // Create new topic in Track 11 or custom
      const newTopicId = `custom-top-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      targetTopic = {
        id: newTopicId,
        trackId: 11,
        trackTitle: trackName.toUpperCase(),
        topicTitle: topicName,
        orderIndex: allTopics.length + 1,
        subtopics: [],
      };
      await db.curriculumTopics.put(targetTopic);
    }

    // Check duplicate subtopic
    const exists = targetTopic.subtopics.some(
      (s) => s.title.toLowerCase() === subtopicName.toLowerCase()
    );

    if (exists) {
      // If URL provided, append if not exists
      if (url) {
        const sub = targetTopic.subtopics.find((s) => s.title.toLowerCase() === subtopicName.toLowerCase())!;
        if (!sub.resources.some((r) => r.url === url)) {
          sub.resources.push({
            title: subtopicName,
            url,
            isVideo: url.includes('youtube') || url.includes('youtu.be'),
          });
          await db.curriculumTopics.put(targetTopic);
          added++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    } else {
      targetTopic.subtopics.push({
        id: `sub-${targetTopic.id}-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        title: subtopicName,
        completed: false,
        status: 'not_started',
        resources: url ? [{ title: subtopicName, url, isVideo: url.includes('youtube') || url.includes('youtu.be') }] : [],
        orderIndex: targetTopic.subtopics.length + 1,
      });
      await db.curriculumTopics.put(targetTopic);
      added++;
    }
  }

  return { added, skipped };
}
