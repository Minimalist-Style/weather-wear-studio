import { describe, expect, it } from 'vitest';
import { countUniqueDays, parseCsvImport } from './diary';

describe('CSV Parser & Diary Integrity', () => {
  it('parses multi-line CSV with quotes and internal newlines', () => {
    const csv = `date,temperature_c,weather_code,wind_kmh,comfort,note
2026-10-01,8.5,3,10,right,"Line 1
Line 2 with comma, and details"
2026-10-02,12.0,0,5,warm,"Simple note"`;

    const parsed = parseCsvImport(csv);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].note).toBe('Line 1\nLine 2 with comma, and details');
    expect(parsed[1].comfort).toBe('warm');
  });

  it('deduplicates identical rows inside CSV', () => {
    const csv = `date,temperature_c,weather_code,wind_kmh,comfort,note
2026-10-01,8.5,3,10,right,Note
2026-10-01,8.5,3,10,right,Note`;

    const parsed = parseCsvImport(csv);
    expect(parsed).toHaveLength(1);
  });

  it('counts unique observation days properly', () => {
    const entries = [
      { id: '1', date: '2026-10-01', temp: 8, code: 3, wind: 5, comfort: 'right' as const, note: 'Morning' },
      { id: '2', date: '2026-10-01', temp: 11, code: 3, wind: 8, comfort: 'warm' as const, note: 'Afternoon' },
      { id: '3', date: '2026-10-02', temp: 6, code: 61, wind: 12, comfort: 'cold' as const, note: 'Rainy' },
    ];
    expect(countUniqueDays(entries)).toBe(2);
  });
});
