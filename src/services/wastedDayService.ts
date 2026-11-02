import { db, WastedDayRecord, getOrCreateDailyLog } from './db';

export async function logWastedDay({
  date,
  reason,
  reasons = [],
  explanation,
  hoursWasted = 8,
}: {
  date: string;
  reason?: string;
  reasons?: string[];
  explanation: string;
  hoursWasted?: number;
}): Promise<number> {
  // If multiple reasons provided, join them for string compatibility
  const reasonsList = reasons && reasons.length > 0 ? reasons : (reason ? [reason] : ['Other Distraction']);
  const primaryReason = reasonsList.join(', ');

  // Always append a new permanent wasted day record
  const id = await db.wastedDays.add({
    date,
    reason: primaryReason,
    reasons: reasonsList,
    explanation,
    hoursWasted,
    createdAt: Date.now(),
  });

  // Update Daily Log for that date to reflect wasted time & note
  try {
    const dailyLog = await getOrCreateDailyLog(date);
    const addedMinutes = Math.round(hoursWasted * 60);
    dailyLog.wastedMinutes = (dailyLog.wastedMinutes || 0) + addedMinutes;
    dailyLog.oneLineNote = `[Wasted Day: ${reasonsList.join(' + ')}] ${explanation}`;
    dailyLog.updatedAt = Date.now();
    await db.dailyLogs.put(dailyLog);
  } catch (err) {
    console.error('Failed to sync wasted day to dailyLogs:', err);
  }

  return id;
}

export async function deleteWastedDay(id: number): Promise<void> {
  await db.wastedDays.delete(id);
}

export async function updateWastedDay(
  id: number,
  updates: Partial<WastedDayRecord>
): Promise<void> {
  if (updates.reasons && updates.reasons.length > 0 && !updates.reason) {
    updates.reason = updates.reasons.join(', ');
  }
  await db.wastedDays.update(id, updates);
}
