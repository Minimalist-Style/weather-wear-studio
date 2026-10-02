import { describe, expect, it } from 'vitest';
import { recommend, weatherKind } from './recommend';
import type { Weather } from './types';

const sample: Weather = { temp: 8, feels: 8, wind: 5, precip: 0, code: 3, day: true, time: '' };
const at = (temp: number, patch: Partial<Weather> = {}) => recommend({ ...sample, temp, feels: temp, ...patch }, 'en');

describe('Research Matrix: 6 temperature bands', () => {
  it('Band 1: <= -10°C', () => {
    const res = at(-15);
    expect(res.reason).toContain('≤ -10°C');
    expect(res.items.some((i) => i.en.includes('Warm coat'))).toBe(true);
    expect(res.items.some((i) => i.en.includes('Scarf'))).toBe(true);
  });

  it('Band 2: -9..0°C', () => {
    const res = at(-4);
    expect(res.reason).toContain('-9...0°C');
    expect(res.items.some((i) => i.en.includes('Warm coat'))).toBe(true);
  });

  it('Band 3: 1..10°C', () => {
    const res = at(6);
    expect(res.reason).toContain('1...10°C');
    expect(res.items.some((i) => i.en === 'Jacket')).toBe(true);
  });

  it('Band 4: 11..17°C', () => {
    const res = at(14);
    expect(res.reason).toContain('11...17°C');
    expect(res.items.some((i) => i.en.includes('Light jacket'))).toBe(true);
  });

  it('Band 5: 18..24°C', () => {
    const res = at(21);
    expect(res.reason).toContain('18...24°C');
    expect(res.items.some((i) => i.en.includes('Light clothes'))).toBe(true);
  });

  it('Band 6: >= 25°C', () => {
    const res = at(28);
    expect(res.reason).toContain('≥ 25°C');
    expect(res.items.some((i) => i.en.includes('Cap'))).toBe(true);
    expect(res.items.some((i) => i.en.includes('Water'))).toBe(true);
  });

  it('adds modifiers for rain and strong wind', () => {
    const rain = at(12, { code: 63, wind: 30 });
    expect(rain.items.some((i) => i.en.includes('Umbrella'))).toBe(true);
    expect(rain.items.some((i) => i.en.includes('Extra layer'))).toBe(true);
  });
});

describe('weatherKind classification', () => {
  it('classifies codes correctly', () => {
    expect(weatherKind(0)).toBe('sun');
    expect(weatherKind(3)).toBe('cloud');
    expect(weatherKind(61)).toBe('rain');
    expect(weatherKind(71)).toBe('snow');
    expect(weatherKind(95)).toBe('storm');
  });
});
