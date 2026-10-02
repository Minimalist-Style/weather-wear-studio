import { describe, it, expect } from 'vitest';
import { parseCsvImport } from './diary';
import type { DiaryEntry } from './types';

describe('Diary CSV Import', () => {
  it('should parse valid CSV string', () => {
    const csv = `date,temperature_c,weather_code,wind_kmh,comfort,note
2026-10-01,15.5,3,12,right,Test note`;
    const entries = parseCsvImport(csv);
    expect(entries).toHaveLength(1);
    expect(entries[0].date).toBe('2026-10-01');
    expect(entries[0].temp).toBe(15.5);
    expect(entries[0].code).toBe(3);
    expect(entries[0].wind).toBe(12);
    expect(entries[0].comfort).toBe('right');
    expect(entries[0].note).toBe('Test note');
    expect(entries[0].id).toBeDefined();
  });

  it('should ignore invalid rows or empty lines', () => {
    const csv = `date,temperature_c,weather_code,wind_kmh,comfort,note\n\n2026-10-01,invalid,3,12,right,`;
    const entries = parseCsvImport(csv);
    expect(entries).toHaveLength(0);
  });

  it('should throw on missing required columns', () => {
    const csv = `wrong_column\nval`;
    expect(() => parseCsvImport(csv)).toThrow('missing_columns');
  });

  it('should handle commas in quotes and newlines (round-trip)', () => {
    const csv = `date,temperature_c,weather_code,wind_kmh,comfort,note\n2026-10-01,15,3,0,right,"Hello, world\nLine 2"`;
    const entries = parseCsvImport(csv);
    expect(entries[0].note).toBe('Hello, world\nLine 2');
    expect(entries[0].code).toBe(3);
    expect(entries[0].temp).toBe(15);
  });
});
import { countUniqueDays } from './diary';
describe('countUniqueDays', () => {
  it('counts unique dates for 14-day progress even with multiple entries on the same day', () => {
    const entries: DiaryEntry[] = [
      { id: '1', date: '2026-10-01', temp: 10, code: 3, wind: 5, comfort: 'right', note: '' },
      { id: '2', date: '2026-10-01', temp: 12, code: 3, wind: 5, comfort: 'warm', note: '' },
      { id: '3', date: '2026-10-02', temp: 8, code: 3, wind: 5, comfort: 'cold', note: '' }
    ];
    expect(countUniqueDays(entries)).toBe(2);
  });
});
