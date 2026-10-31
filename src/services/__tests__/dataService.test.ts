import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../dataService';

describe('Stage 1: FDE Learning Tracker - Topic System & Coverage Verification', () => {
  let dataService: DataService;

  beforeEach(() => {
    dataService = new DataService();
    dataService.resetToDefaults();
  });

  it('correctly loads all 4 roadmap tracks from the attached images', () => {
    const tracks = dataService.getTracks();
    expect(tracks.length).toBe(4);
    expect(tracks.map(t => t.title)).toEqual([
      'FDE Roadmap',
      'AI Engineer',
      'Software Design & Architecture',
      'System Design'
    ]);
  });

  it('verifies exact total count of 408 transcribed topics across 59 sections', () => {
    const report = dataService.getCoverageReport();
    expect(report.overallTotal).toBe(408);
    expect(report.tracks.length).toBe(4);

    const fdeTrack = report.tracks.find(t => t.trackTitle === 'FDE Roadmap');
    expect(fdeTrack?.totalTopics).toBe(31);

    const aiTrack = report.tracks.find(t => t.trackTitle === 'AI Engineer');
    expect(aiTrack?.totalTopics).toBe(136);

    const sdaTrack = report.tracks.find(t => t.trackTitle === 'Software Design & Architecture');
    expect(sdaTrack?.totalTopics).toBe(93);

    const sdTrack = report.tracks.find(t => t.trackTitle === 'System Design');
    expect(sdTrack?.totalTopics).toBe(148);
  });

  it('supports per-topic fields (status, difficulty, confidence, subtasks, notes, resources)', () => {
    const topics = dataService.getTopics();
    const sample = topics[0];

    expect(sample).toBeDefined();
    expect(sample.status).toBe('not_started');
    expect(['easy', 'medium', 'hard']).toContain(sample.difficulty);
    expect(sample.confidence).toBeGreaterThanOrEqual(1);
    expect(sample.confidence).toBeLessThanOrEqual(5);
    expect(Array.isArray(sample.subtasks)).toBe(true);

    // Update topic fields
    const updated = dataService.updateTopic(sample.id, {
      status: 'in_progress',
      confidence: 4,
      time_spent_mins: 90,
      planned_start: '2026-11-01',
      deadline: '2026-11-15'
    });

    expect(updated?.status).toBe('in_progress');
    expect(updated?.confidence).toBe(4);
    expect(updated?.time_spent_mins).toBe(90);
    expect(updated?.planned_start).toBe('2026-11-01');
    expect(updated?.deadline).toBe('2026-11-15');
  });

  it('correctly detects duplicate topics and imports only new ones', () => {
    dataService.resetToDefaults();
    const initialCount = dataService.getCoverageReport().overallTotal;

    // 1 existing topic and 2 new topics
    const rawImportText = `
      FDE Roadmap | Introduction | Roles & Responsabilities
      AI Engineer | Advanced Topics | Supervised Fine-Tuning SFT | https://example.com/sft
      Custom Track | Systems | Distributed Tracing & OpenTelemetry | https://opentelemetry.io
    `;

    const check = dataService.parseAndCheckImports(rawImportText);
    expect(check.duplicateTopics.length).toBe(1);
    expect(check.duplicateTopics[0].topicTitle).toBe('Roles & Responsabilities');

    expect(check.newTopics.length).toBe(2);

    // Execute import
    const addedCount = dataService.executeImport(check.newTopics);
    expect(addedCount).toBe(2);

    const newOverallReport = dataService.getCoverageReport();
    expect(newOverallReport.overallTotal).toBe(initialCount + 2);
  });

  it('supports full CRUD on tracks, sections, and topics', () => {
    // Add track
    const newTrk = dataService.addTrack('Test Track', 'Test Description');
    expect(newTrk.id).toBeDefined();

    // Add section
    const newSec = dataService.addSection(newTrk.id, 'Test Section');
    expect(newSec.track_id).toBe(newTrk.id);

    // Add topic
    const newTop = dataService.addTopic({
      track_id: newTrk.id,
      section_id: newSec.id,
      title: 'Test Topic'
    });
    expect(newTop.title).toBe('Test Topic');

    // Add resource
    const res = dataService.addResource({
      topic_id: newTop.id,
      title: 'Video Guide',
      url: 'https://youtube.com/watch?v=123',
      type: 'video'
    });
    expect(res.id).toBeDefined();

    // Verify retrieval
    const fetched = dataService.getTopicById(newTop.id);
    expect(fetched?.resources?.length).toBe(1);

    // Delete topic
    expect(dataService.deleteTopic(newTop.id)).toBe(true);
    expect(dataService.getTopicById(newTop.id)).toBeNull();
  });

  it('validates JSON and CSV export/import integrity', () => {
    const jsonStr = dataService.exportToJson();
    expect(jsonStr).toContain('"version": "1.0"');
    expect(jsonStr).toContain('FDE Roadmap');

    const csvStr = dataService.exportToCsv();
    expect(csvStr).toContain('Track,Section,Topic,Status');
    expect(csvStr.split('\n').length).toBeGreaterThan(400);

    // Restore from json
    const restored = dataService.importFromJson(jsonStr);
    expect(restored).toBe(true);
  });
});
