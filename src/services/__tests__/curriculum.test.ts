import { describe, it, expect } from 'vitest';
import { CANONICAL_CURRICULUM } from '../../data/curriculumData';

describe('Curriculum Dataset Verification (Part 3 Source of Truth + Track 12 & Curated Resources)', () => {
  it('contains exactly 13 tracks numbered 0 to 12', () => {
    expect(CANONICAL_CURRICULUM.length).toBe(13);
    const trackIds = CANONICAL_CURRICULUM.map((t) => t.trackId);
    expect(trackIds).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('contains exactly 83 canonical topics', () => {
    const totalTopics = CANONICAL_CURRICULUM.reduce((acc, t) => acc + t.topics.length, 0);
    expect(totalTopics).toBe(83);
  });

  it('contains exactly 892 canonical subtopics in learning order', () => {
    const totalSubtopics = CANONICAL_CURRICULUM.reduce(
      (acc, t) => acc + t.topics.reduce((subAcc, top) => subAcc + top.subtopics.length, 0),
      0
    );
    expect(totalSubtopics).toBe(892);
  });

  it('verifies Track 0 (Introduction) topics and subtopics', () => {
    const track0 = CANONICAL_CURRICULUM.find((t) => t.trackId === 0);
    expect(track0).toBeDefined();
    expect(track0!.topics.length).toBe(2);
    expect(track0!.topics[0].title).toBe('FDE Glossary');
    expect(track0!.topics[0].subtopics.length).toBe(6);
  });

  it('verifies Python matches Angela Yu 100 Days course (Beginner, Intermediate, Intermediate+, Advanced, Projects)', () => {
    const track1 = CANONICAL_CURRICULUM.find((t) => t.trackId === 1);
    expect(track1).toBeDefined();
    const titles = track1!.topics.map(t => t.title);
    expect(titles).toContain('Python: Beginner Python');
    expect(titles).toContain('Python: Intermediate Python');
    expect(titles).toContain('Python: Intermediate +');
    expect(titles).toContain('Python: Advanced Python');
    expect(titles).toContain('Python: Professional Portfolio Projects');

    const beginner = track1!.topics.find(t => t.title === 'Python: Beginner Python');
    expect(beginner!.subtopics.length).toBe(24);

    const intermediate = track1!.topics.find(t => t.title === 'Python: Intermediate Python');
    expect(intermediate!.subtopics.length).toBe(32);

    const intermediatePlus = track1!.topics.find(t => t.title === 'Python: Intermediate +');
    expect(intermediatePlus!.subtopics.length).toBe(16);

    const advanced = track1!.topics.find(t => t.title === 'Python: Advanced Python');
    expect(advanced!.subtopics.length).toBe(28);

    const projects = track1!.topics.find(t => t.title === 'Python: Professional Portfolio Projects');
    expect(projects!.subtopics.length).toBe(19);
  });

  it('verifies DSA topics include Code and Debug playlist and Striver A2Z sheet', () => {
    const track2 = CANONICAL_CURRICULUM.find((t) => t.trackId === 2);
    const firstDsaTopic = track2!.topics[0];
    expect(firstDsaTopic.resources).toBeDefined();
    expect(firstDsaTopic.resources!.some((r) => r.title.includes('Code and Debug'))).toBe(true);
    expect(firstDsaTopic.resources!.some((r) => r.title.includes('Striver'))).toBe(true);
  });

  it('verifies Track 12 (Communication, English & ADSD) topics and subtopics', () => {
    const track12 = CANONICAL_CURRICULUM.find((t) => t.trackId === 12);
    expect(track12).toBeDefined();
    expect(track12!.topics.length).toBe(3);
    const titles = track12!.topics.map((t) => t.title);
    expect(titles).toContain('Professional Communication & Field Presence');
    expect(titles).toContain('Technical English & Engineering Writing');
    expect(titles).toContain('ADSD: Analog & Digital System Design');
  });
});
