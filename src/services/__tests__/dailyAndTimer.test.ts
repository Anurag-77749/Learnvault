import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../dataService';

describe('Stage 2: Daily Log & Pomodoro Timer System Verification', () => {
  let dataService: DataService;

  beforeEach(() => {
    dataService = new DataService();
    dataService.resetToDefaults();
  });

  it('creates and retrieves daily logs with all required tracking metrics', () => {
    const today = new Date().toISOString().split('T')[0];

    const savedLog = dataService.saveDailyLog({
      date: today,
      total_study_time_mins: 150,
      time_wasted_mins: 35,
      wasted_reason: 'youtube',
      sleep_hours: 8,
      energy: 4,
      mood: 5,
      dsa_problems_solved: 3,
      what_learned: 'Deep dive into CAP theorem and Raft consensus.',
      tomorrow_plan: 'Implement Vector search and build LangChain RAG pipeline.'
    });

    expect(savedLog.date).toBe(today);
    expect(savedLog.total_study_time_mins).toBe(150);
    expect(savedLog.time_wasted_mins).toBe(35);
    expect(savedLog.wasted_reason).toBe('youtube');
    expect(savedLog.sleep_hours).toBe(8);
    expect(savedLog.energy).toBe(4);
    expect(savedLog.mood).toBe(5);
    expect(savedLog.dsa_problems_solved).toBe(3);

    const fetched = dataService.getDailyLogByDate(today);
    expect(fetched).not.toBeNull();
    expect(fetched?.what_learned).toContain('CAP theorem');
  });

  it('calculates study streaks accurately across consecutive days', () => {
    const today = new Date();
    const d0 = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d1 = yesterday.toISOString().split('T')[0];

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const d2 = twoDaysAgo.toISOString().split('T')[0];

    dataService.saveDailyLog({ date: d2, total_study_time_mins: 120 });
    dataService.saveDailyLog({ date: d1, total_study_time_mins: 90 });
    dataService.saveDailyLog({ date: d0, total_study_time_mins: 180 });

    const streak = dataService.getStreak();
    expect(streak.currentStreak).toBe(3);
    expect(streak.longestStreak).toBeGreaterThanOrEqual(3);
    expect(streak.totalDaysLogged).toBe(3);
  });

  it('tags Pomodoro session to topic and auto-increments both topic and daily totals', () => {
    const topics = dataService.getTopics();
    const targetTopic = topics[0];
    const initialTopicTime = targetTopic.time_spent_mins || 0;

    const today = new Date().toISOString().split('T')[0];
    const initialDailyLog = dataService.getDailyLogByDate(today);
    const initialDailyStudyTime = initialDailyLog?.total_study_time_mins || 0;

    const startTime = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const endTime = new Date().toISOString();

    // Log 25m Pomodoro session tagged to targetTopic
    const session = dataService.addPomodoroSession({
      topic_id: targetTopic.id,
      duration_mins: 25,
      started_at: startTime,
      completed_at: endTime
    });

    expect(session.id).toBeDefined();
    expect(session.topic_id).toBe(targetTopic.id);
    expect(session.duration_mins).toBe(25);

    // Verify topic total updated
    const refreshedTopic = dataService.getTopicById(targetTopic.id);
    expect(refreshedTopic?.time_spent_mins).toBe(initialTopicTime + 25);

    // Verify daily log total updated
    const refreshedDailyLog = dataService.getDailyLogByDate(today);
    expect(refreshedDailyLog?.total_study_time_mins).toBe(initialDailyStudyTime + 25);
  });

  it('records multiple timer sessions and preserves session history', () => {
    const topics = dataService.getTopics();
    const t1 = topics[0];
    const t2 = topics[1];

    const now = Date.now();
    dataService.addPomodoroSession({
      topic_id: t1.id,
      duration_mins: 25,
      started_at: new Date(now - 120000).toISOString(),
      completed_at: new Date(now - 60000).toISOString()
    });

    dataService.addPomodoroSession({
      topic_id: t2.id,
      duration_mins: 50,
      started_at: new Date(now - 60000).toISOString(),
      completed_at: new Date(now).toISOString()
    });

    const sessions = dataService.getPomodoroSessions();
    expect(sessions.length).toBe(2);
    expect(sessions[0].duration_mins).toBe(50); // sorted descending by completed_at
    expect(sessions[1].duration_mins).toBe(25);
  });

  it('exports and restores daily logs and pomodoro sessions in JSON backup', () => {
    const today = new Date().toISOString().split('T')[0];
    dataService.saveDailyLog({
      date: today,
      total_study_time_mins: 90,
      what_learned: 'Backup and restore test'
    });

    dataService.addPomodoroSession({
      topic_id: null,
      duration_mins: 45,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });

    const backupJson = dataService.exportToJson();
    expect(backupJson).toContain('Backup and restore test');
    expect(backupJson).toContain('"duration_mins": 45');

    // Reset and restore
    dataService.resetToDefaults();
    expect(dataService.getDailyLogs().length).toBe(0);

    const success = dataService.importFromJson(backupJson);
    expect(success).toBe(true);
    expect(dataService.getDailyLogs().length).toBe(1);
    expect(dataService.getPomodoroSessions().length).toBe(1);
    expect(dataService.getDailyLogByDate(today)?.what_learned).toBe('Backup and restore test');
  });
});
