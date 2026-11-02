import { describe, it, expect } from 'vitest';
import { calculateSleepHours, formatMinutes } from '../dailyLogService';
import { DEFAULT_TIMER_SETTINGS } from '../timerState';

describe('Stage 1 Core Services', () => {
  it('calculates sleep hours correctly including overnight crossing', () => {
    // 23:30 to 07:00 is 7.5 hours
    expect(calculateSleepHours('23:30', '07:00')).toBe(7.5);
    // 22:00 to 06:30 is 8.5 hours
    expect(calculateSleepHours('22:00', '06:30')).toBe(8.5);
    // 01:00 to 09:00 is 8.0 hours
    expect(calculateSleepHours('01:00', '09:00')).toBe(8);
  });

  it('formats minutes cleanly into human readable form', () => {
    expect(formatMinutes(0)).toBe('0m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(135)).toBe('2h 15m');
  });

  it('provides correct default timer settings', () => {
    expect(DEFAULT_TIMER_SETTINGS.focusDurationMins).toBe(25);
    expect(DEFAULT_TIMER_SETTINGS.shortBreakMins).toBe(5);
    expect(DEFAULT_TIMER_SETTINGS.longBreakMins).toBe(15);
    expect(DEFAULT_TIMER_SETTINGS.longBreakInterval).toBe(4);
  });
});
