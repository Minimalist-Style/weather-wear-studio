import {describe,it,expect} from 'vitest';
import {recommend,weatherKind} from './recommend';
import type {Weather} from './types';
const sample:Weather={temp:8,feels:8,wind:5,precip:0,code:3,day:true,time:''};
describe('clothing matrix',()=>{
  it('uses a coat and boots for frost (effective <= 0)', () => {
    const rec = recommend({...sample, temp: 0, feels: 0}, 'en');
    expect(rec.items.some(x => x.en === 'Warm coat')).toBe(true);
    expect(rec.items.some(x => x.en === 'Warm boots')).toBe(true);
  });
  it('uses a jacket for cool weather (effective > 0 and <= 10)', () => {
    const rec1 = recommend({...sample, temp: 1, feels: 1}, 'en');
    expect(rec1.items.some(x => x.en === 'Jacket')).toBe(true);
    const rec10 = recommend({...sample, temp: 10, feels: 10}, 'en');
    expect(rec10.items.some(x => x.en === 'Jacket')).toBe(true);
  });
  it('uses a light layer for warm weather (effective > 10 and <= 17)', () => {
    const rec11 = recommend({...sample, temp: 11, feels: 11}, 'en');
    expect(rec11.items.some(x => x.en === 'Light jacket')).toBe(true);
    const rec17 = recommend({...sample, temp: 17, feels: 17}, 'en');
    expect(rec17.items.some(x => x.en === 'Light jacket')).toBe(true);
  });
  it('uses light clothes for hot weather (effective > 17)', () => {
    const rec18 = recommend({...sample, temp: 18, feels: 18}, 'en');
    expect(rec18.items.some(x => x.en === 'Light clothes')).toBe(true);
  });
  it('adds an umbrella for rain',()=>expect(recommend({...sample,code:63},'en').items.some(x=>x.en==='Umbrella')).toBe(true));
  it('adds an extra layer for wind >= 25 when effective > 10', () => {
    expect(recommend({...sample, temp: 16, feels: 16, wind: 25}, 'en').items.some(x => x.en === 'Extra layer')).toBe(true);
  });
  it('recognizes snow',()=>expect(weatherKind(73)).toBe('snow'));
  it('uses effective temperature for frost',()=>expect(recommend({...sample,temp:3,feels:-3},'en').items.some(x=>x.en==='Warm coat')).toBe(true));
  it('handles heat and recommends cap (temp >= 25)', () => {
    const rec25 = recommend({...sample, temp: 25, feels: 25}, 'en');
    expect(rec25.items.some(x => x.en === 'Cap & water')).toBe(true);
  });
});
