import { describe, it, expect } from 'vitest';
import { PRESET_TIMELINE_BLOCKS } from '../timelineService';

describe('Plan & Timeline Preset Verification', () => {
  it('contains the starting notebook preset with parallel lanes', () => {
    expect(PRESET_TIMELINE_BLOCKS.length).toBeGreaterThanOrEqual(7);

    // Track 0
    const track0 = PRESET_TIMELINE_BLOCKS.find(b => b.trackId === 0);
    expect(track0).toBeDefined();
    expect(track0!.startDate).toBe('2026-11-01');
    expect(track0!.endDate).toBe('2026-11-03');

    // Track 1 (Python)
    const python = PRESET_TIMELINE_BLOCKS.find(b => b.trackId === 1);
    expect(python).toBeDefined();
    expect(python!.startDate).toBe('2026-11-03');
    expect(python!.isParallel).toBe(true);

    // Track 2 (DSA)
    const dsa = PRESET_TIMELINE_BLOCKS.find(b => b.trackId === 2);
    expect(dsa).toBeDefined();
    expect(dsa!.isParallel).toBe(true);

    // Track 12 (Communication, English & ADSD)
    const track12 = PRESET_TIMELINE_BLOCKS.find(b => b.trackId === 12);
    expect(track12).toBeDefined();
    expect(track12!.isParallel).toBe(true);
  });
});
