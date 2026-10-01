import { describe, expect, it } from 'vitest';
import { recommend, weatherKind } from './recommend';
import type { Weather } from './types';

const sample: Weather = { temp: 8, feels: 8, wind: 5, precip: 0, code: 3, day: true, time: '' };
const at = (temp: number, patch: Partial<Weather> = {}) => recommend({ ...sample, temp, feels: temp, ...patch }, 'en');
const names = (temp: number, patch: Partial<Weather> = {}) => at(temp, patch).items.map(item => item.en);

describe('research clothing matrix: six bands', () => {
  it.each([
    [-11, 'At −10°C and below'], [-10, 'At −10°C and below'],
    [-9, 'From −9°C to 0°C'], [0, 'From −9°C to 0°C'],
    [1, 'From 1°C to 10°C'], [10, 'From 1°C to 10°C'],
    [11, 'From 11°C to 17°C'], [17, 'From 11°C to 17°C'],
    [18, 'From 18°C to 24°C'], [24, 'From 18°C to 24°C'],
    [25, 'At 25°C and above'], [30, 'At 25°C and above'],
  ])('%s°C selects %s', (temp, rule) => {
    expect(at(temp).reason).toContain(rule);
  });
  it('uses the colder apparent temperature for the base set', () => {
    expect(names(4, { feels: -10 })).toContain('Scarf');
  });
  it('adds rain protection for rain', () => {
    expect(names(12, { code: 63 })).toContain('Rain protection');
  });
  it('adds warm footwear once for snow', () => {
    expect(names(-10, { code: 73 }).filter(name => name === 'Warm boots')).toHaveLength(1);
  });
  it('adds an extra layer in strong wind over 10°C', () => {
    expect(names(16, { wind: 25 })).toContain('Extra layer');
  });
  it('suggests water at 25°C and above', () => {
    expect(names(25)).toContain('Water');
  });
  it('keeps suggestions educational in both languages', () => {
    expect(at(8).reason).toContain('Educational guide only');
    expect(recommend(sample, 'kk').reason).toContain('оқу үлгісі');
  });
});

describe('weather codes', () => {
  it('classifies snow', () => expect(weatherKind(73)).toBe('snow'));
  it('classifies rain', () => expect(weatherKind(63)).toBe('rain'));
  it('classifies clear weather', () => expect(weatherKind(0)).toBe('sun'));
});
