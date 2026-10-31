import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../dataService';

describe('Stage 3: Planner, Parallel Schedule & Dashboard Verification', () => {
  let dataService: DataService;

  beforeEach(() => {
    dataService = new DataService();
    dataService.resetToDefaults();
  });

  it('auto-fills deadlines sequentially based on target hours and difficulty', () => {
    const tracks = dataService.getTracks();
    const targetTrack = tracks[0]; // FDE Roadmap

    const scheduledCount = dataService.autoFillDeadlines({
      trackId: targetTrack.id,
      startDate: '2026-11-01',
      hoursPerDay: 4
    });

    expect(scheduledCount).toBeGreaterThan(0);

    const trackTopics = dataService.getTopics({ trackId: targetTrack.id });
    const firstTopic = trackTopics[0];
    expect(firstTopic.planned_start).toBe('2026-11-01');
    expect(firstTopic.deadline).toBeDefined();
    expect(firstTopic.deadline! >= firstTopic.planned_start!).toBe(true);

    const secondTopic = trackTopics[1];
    expect(secondTopic.planned_start).toBeDefined();
    expect(secondTopic.planned_start! > firstTopic.planned_start!).toBe(true);
  });

  it('exam mode pushes deadlines past the exam window', () => {
    const tracks = dataService.getTracks();
    const targetTrack = tracks[0];

    dataService.savePlannerSettings({
      examMode: true,
      examStartDate: '2026-11-05',
      examEndDate: '2026-11-12'
    });

    dataService.autoFillDeadlines({
      trackId: targetTrack.id,
      startDate: '2026-11-01',
      hoursPerDay: 2
    });

    const topics = dataService.getTopics({ trackId: targetTrack.id });
    // Any topic scheduled across Nov 5-12 should be moved past Nov 12
    const insideExamWindow = topics.filter(
      t => t.planned_start && t.planned_start >= '2026-11-05' && t.planned_start <= '2026-11-12'
    );
    expect(insideExamWindow.length).toBe(0);
  });

  it('one-tap reschedule moves overdue topics forward starting from today', () => {
    const topics = dataService.getTopics();
    const t1 = topics[0];
    const t2 = topics[1];

    // Mark t1 and t2 with past deadlines in 2025
    dataService.updateTopic(t1.id, {
      planned_start: '2025-01-01',
      deadline: '2025-01-05',
      status: 'not_started'
    });
    dataService.updateTopic(t2.id, {
      planned_start: '2025-01-06',
      deadline: '2025-01-10',
      status: 'in_progress'
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const rescheduledCount = dataService.oneTapReschedule();
    expect(rescheduledCount).toBeGreaterThanOrEqual(2);

    const refreshedT1 = dataService.getTopicById(t1.id);
    const refreshedT2 = dataService.getTopicById(t2.id);

    expect(refreshedT1?.deadline! >= todayStr).toBe(true);
    expect(refreshedT2?.deadline! >= todayStr).toBe(true);
  });

  it('retrieves next up topics prioritizing in-progress and imminent deadlines', () => {
    const topics = dataService.getTopics();
    const t1 = topics[5];
    const t2 = topics[6];

    dataService.updateTopic(t1.id, {
      status: 'in_progress',
      deadline: '2026-12-01'
    });

    dataService.updateTopic(t2.id, {
      status: 'not_started',
      deadline: '2026-11-15'
    });

    const nextUp = dataService.getNextUpTopics(5);
    expect(nextUp.length).toBe(5);
    expect(nextUp.some(t => t.id === t1.id)).toBe(true);
  });

  it('computes 30-day chart trend and yearly heatmap data', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    dataService.saveDailyLog({
      date: todayStr,
      total_study_time_mins: 180,
      time_wasted_mins: 30,
      dsa_problems_solved: 2
    });

    const chartData = dataService.getChartData30Days();
    expect(chartData.length).toBe(30);

    const todayChartItem = chartData.find(c => c.date === todayStr);
    expect(todayChartItem).toBeDefined();
    expect(todayChartItem?.studyMins).toBe(180);
    expect(todayChartItem?.wastedMins).toBe(30);
    expect(todayChartItem?.dsaCount).toBe(2);

    const heatmap = dataService.getYearlyHeatmapData();
    expect(heatmap.length).toBe(365);
    const todayHeatmapItem = heatmap.find(h => h.date === todayStr);
    expect(todayHeatmapItem?.count).toBe(180);
  });

  it('generates 7-day and 30-day review summaries accurately', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    dataService.saveDailyLog({
      date: todayStr,
      total_study_time_mins: 240,
      time_wasted_mins: 60,
      wasted_reason: 'phone',
      dsa_problems_solved: 4,
      sleep_hours: 8
    });

    const summary7 = dataService.getReviewSummary(7);
    expect(summary7.totalStudyHours).toBe(4.0);
    expect(summary7.totalWastedHours).toBe(1.0);
    expect(summary7.dsaSolved).toBe(4);
    expect(summary7.wasteReasons['phone']).toBe(60);

    const summary30 = dataService.getReviewSummary(30);
    expect(summary30.totalStudyHours).toBe(4.0);
  });
});
