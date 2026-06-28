/**
 * Tests for the pure stats analytics (streaks, peaks, buckets, pages).
 */

import { streaks, peakWeekday, bestDay, wordsToPages, bucketSeries, sumSeries, weekdayLabel, dayNum } from '../src/services/statsAnalytics.js';

describe('streaks()', () => {
  test('counts the current streak ending today', () => {
    const dw = { '2026-06-25': 100, '2026-06-26': 200, '2026-06-27': 50 };
    expect(streaks(dw, '2026-06-27')).toEqual({ current: 3, longest: 3 });
  });
  test('a gap breaks the streak; longest is the max run', () => {
    const dw = { '2026-06-20': 10, '2026-06-21': 10, '2026-06-26': 10, '2026-06-27': 10 };
    expect(streaks(dw, '2026-06-27')).toEqual({ current: 2, longest: 2 });
  });
  test('current counts from yesterday if today is empty', () => {
    const dw = { '2026-06-25': 10, '2026-06-26': 10 };
    expect(streaks(dw, '2026-06-27').current).toBe(2);
  });
  test('a day with 0 words does not count', () => {
    const dw = { '2026-06-26': 0, '2026-06-27': 5 };
    expect(streaks(dw, '2026-06-27')).toEqual({ current: 1, longest: 1 });
  });
  test('empty → zeros', () => {
    expect(streaks({}, '2026-06-27')).toEqual({ current: 0, longest: 0 });
  });
});

describe('peakWeekday()', () => {
  test('returns the weekday with most cumulative words', () => {
    // 2026-06-23 is a Tuesday.
    const dw = { '2026-06-23': 500, '2026-06-24': 100 };
    expect(peakWeekday(dw)).toBe('Tue');
  });
  test('ties join with &', () => {
    const dw = { '2026-06-23': 100, '2026-06-24': 100 }; // Tue & Wed
    expect(peakWeekday(dw)).toBe('Tue & Wed');
  });
  test('weekdayLabel maps day numbers correctly', () => {
    expect(weekdayLabel(dayNum('2026-06-23'))).toBe('Tue');
    expect(weekdayLabel(dayNum('2026-06-27'))).toBe('Sat');
  });
});

describe('bestDay() & wordsToPages()', () => {
  test('best day is the max-words day', () => {
    expect(bestDay({ '2026-06-25': 100, '2026-06-26': 900 })).toEqual({ date: '2026-06-26', words: 900 });
  });
  test('words → pages at a per-page rate', () => {
    expect(wordsToPages(190, 190)).toBe(1);
    expect(wordsToPages(95, 190)).toBe(0.5);
    expect(wordsToPages(0, 190)).toBe(0);
  });
});

describe('bucketSeries()', () => {
  test('week → 7 daily buckets ending today, weekday labels', () => {
    const dw = { '2026-06-27': 300, '2026-06-25': 100 };
    const s = bucketSeries(dw, 'week', '2026-06-27');
    expect(s).toHaveLength(7);
    expect(s[6]).toMatchObject({ label: 'Sat', words: 300 }); // today
    expect(sumSeries(s)).toBe(400);
  });
  test('month → 30 daily buckets', () => {
    expect(bucketSeries({}, 'month', '2026-06-27')).toHaveLength(30);
  });
  test('year → 12 monthly buckets summing the month', () => {
    const dw = { '2026-06-01': 100, '2026-06-15': 200, '2026-05-10': 50 };
    const s = bucketSeries(dw, 'year', '2026-06-27');
    expect(s).toHaveLength(12);
    expect(s[11]).toMatchObject({ label: 'Jun', words: 300 });
    expect(s[10]).toMatchObject({ label: 'May', words: 50 });
  });
});
