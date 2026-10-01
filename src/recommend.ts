import type { Lang, Weather, WeatherKind } from './types';

export function weatherKind(code: number): WeatherKind {
  if ([95, 96, 99].includes(code)) return 'storm';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([45, 48].includes(code)) return 'fog';
  if (code === 0 || code === 1) return 'sun';
  return 'cloud';
}

export type Garment = { icon: string; kk: string; en: string };
const g = (icon: string, kk: string, en: string): Garment => ({ icon, kk, en });
const coat = g('🧥', 'Қалың күрте', 'Warm coat');
const jacket = g('🧥', 'Күрте', 'Jacket');
const light = g('🧥', 'Жеңіл күрте', 'Light jacket');
const tee = g('👕', 'Жеңіл киім', 'Light clothes');
const boots = g('🥾', 'Жылы аяқ киім', 'Warm boots');
const shoes = g('👟', 'Жабық аяқ киім', 'Closed shoes');
const gloves = g('🧤', 'Бас киім мен қолғап', 'Hat and gloves');
const scarf = g('🧣', 'Мойынорағыш', 'Scarf');
const layer = g('🧶', 'Қосымша қабат', 'Extra layer');
const umbrella = g('☂️', 'Жаңбырдан қорғаныс', 'Rain protection');
const cap = g('🧢', 'Бас киім', 'Cap');
const water = g('💧', 'Су', 'Water');

/** Educational prompts based on the six ranges in the supplied research matrix. */
export function recommend(w: Weather, lang: Lang) {
  const effective = Math.min(w.temp, Number.isFinite(w.feels) ? w.feels : w.temp);
  const kind = weatherKind(w.code);
  const kk = lang === 'kk';
  let items: Garment[];
  let title: string;
  let baseRule: string;
  if (effective <= -10) {
    items = [coat, boots, gloves, scarf, layer];
    title = kk ? 'Жылы киінейік' : 'Bundle up';
    baseRule = kk ? 'Негізгі ереже: −10°C және одан суықта жылы күрте мен бірнеше қабат киім таңда.' : 'Base rule: At −10°C and below, choose a warm coat and layers.';
  } else if (effective <= 0) {
    items = [coat, boots, gloves, layer];
    title = kk ? 'Жылы киінейік' : 'Bundle up';
    baseRule = kk ? 'Негізгі ереже: −9°C пен 0°C аралығында жылы күрте мен жемпір таңда.' : 'Base rule: From −9°C to 0°C, choose a warm coat and sweater.';
  } else if (effective <= 10) {
    items = [jacket, shoes];
    title = kk ? 'Күрте киіп ал' : 'Grab a jacket';
    baseRule = kk ? 'Негізгі ереже: 1–10°C аралығында күрте мен ұзын жеңді киім таңда.' : 'Base rule: From 1°C to 10°C, choose a jacket and long sleeves.';
  } else if (effective <= 17) {
    items = [light, shoes];
    title = kk ? 'Жеңіл қабат жеткілікті' : 'A light layer works';
    baseRule = kk ? 'Негізгі ереже: 11–17°C аралығында жеңіл күрте немесе худи таңда.' : 'Base rule: From 11°C to 17°C, choose a light jacket or hoodie.';
  } else if (effective < 25) {
    items = [tee, shoes];
    title = kk ? 'Жеңіл киін' : 'Keep it light';
    baseRule = kk ? 'Негізгі ереже: 18–24°C аралығында жеңіл киім таңда.' : 'Base rule: From 18°C to 24°C, choose light clothes.';
  } else {
    items = [tee, shoes, cap, water];
    title = kk ? 'Жеңіл киін' : 'Keep it light';
    baseRule = kk ? 'Негізгі ереже: 25°C және одан ыстықта жеңіл киім киіп, су ішуді ұмытпа.' : 'Base rule: At 25°C and above, choose breathable clothes and bring water.';
  }
  const notes = [baseRule];
  if (kind === 'rain' || kind === 'storm') {
    items.push(umbrella);
    notes.push(kk ? 'Жаңбыр болса, су өткізбейтін қабат ал.' : 'If it rains, bring a waterproof layer.');
  }
  if (kind === 'snow') {
    items.push(boots);
    notes.push(kk ? 'Қар болса, жылы әрі су өткізбейтін аяқ киім таңда.' : 'For snow, choose warm waterproof shoes.');
  }
  if (w.wind >= 25) {
    if (effective > 10) items.push(layer);
    notes.push(kk ? 'Қатты желде қосымша жылы қабат пайдалы болуы мүмкін.' : 'In strong wind, another warm layer may help.');
  }
  if (!w.day) notes.push(kk ? 'Кешке ауа райын қайта тексер.' : 'Check conditions again before going out at night.');
  notes.push(kk ? 'Бұл — оқу үлгісі. Киімді өз жағдайыңа бейімде.' : 'Educational guide only. Adjust for your own comfort.');
  return { title, items: [...new Set(items)], reason: notes.join(' ') };
}
