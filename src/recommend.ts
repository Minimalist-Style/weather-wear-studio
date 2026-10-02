import type { Lang, Weather, WeatherKind } from './types';

export function weatherKind(code: number): WeatherKind {
  if ([95, 96, 99].includes(code)) return 'storm';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([45, 48].includes(code)) return 'fog';
  if (code === 0 || code === 1) return 'sun';
  return 'cloud';
}

export type Garment = { iconUrl: string; kk: string; en: string };
const g = (iconUrl: string, kk: string, en: string): Garment => ({ iconUrl, kk, en });
const coat = g('/icons/coat.png', 'Қалың күрте / Пальто', 'Warm coat');
const jacket = g('/icons/jacket.png', 'Күрте', 'Jacket');
const light = g('/icons/hoodie.png', 'Жеңіл күрте / Худи', 'Light jacket / Hoodie');
const tee = g('/icons/tshirt.png', 'Жеңіл киім', 'Light clothes');
const boots = g('/icons/boots.png', 'Жылы / Су өтпейтін етік', 'Warm / Waterproof boots');
const shoes = g('/icons/shoes.png', 'Жабық аяқ киім', 'Closed shoes');
const gloves = g('/icons/gloves.png', 'Бас киім мен қолғап', 'Hat & gloves');
const scarf = g('/icons/scarf.png', 'Мойынорағыш', 'Scarf');
const layer = g('/icons/sweater.png', 'Қосымша жылы қабат / Жемпір', 'Warm sweater / Extra layer');
const umbrella = g('/icons/umbrella.png', 'Қолшатыр / Жаңбырқап', 'Umbrella / Raincoat');
const cap = g('/icons/cap.png', 'Кепка / Күнқағар', 'Cap / Sun hat');
const water = g('/icons/water.png', 'Ауыз су', 'Water bottle');

export function recommend(w: Weather, lang: Lang) {
  const effective = Math.min(w.temp, Number.isFinite(w.feels) ? w.feels : w.temp);
  const kind = weatherKind(w.code);
  const kk = lang === 'kk';
  let items: Garment[];
  let title: string;
  let baseRule: string;

  if (effective <= -10) {
    items = [coat, boots, gloves, scarf, layer];
    title = kk ? 'Қалың жылыну керек' : 'Heavy winter wear';
    baseRule = kk
      ? 'Негізгі ереже (≤ -10°C): Қалың пальто/күрте, жылы қабаттар, бас киім, мойынорағыш және қолғап қажет.'
      : 'Base rule (≤ -10°C): Warm coat, thermal layers, hat, scarf and gloves required.';
  } else if (effective <= 0) {
    items = [coat, boots, layer, gloves];
    title = kk ? 'Жылы күрте киіңіз' : 'Warm coat & sweater';
    baseRule = kk
      ? 'Негізгі ереже (-9...0°C): Жылы күрте, жемпір және жылы аяқ киім киген жөн.'
      : 'Base rule (-9...0°C): Warm coat, sweater and warm footwear recommended.';
  } else if (effective <= 10) {
    items = [jacket, shoes, layer];
    title = kk ? 'Күрте қажет' : 'Jacket needed';
    baseRule = kk
      ? 'Негізгі ереже (1...10°C): Күрте және ұзын жеңді киім таңдаңыз.'
      : 'Base rule (1...10°C): Mid-weight jacket and long sleeves optimal.';
  } else if (effective <= 17) {
    items = [light, shoes];
    title = kk ? 'Жеңіл күрте жетеді' : 'Light jacket / hoodie';
    baseRule = kk
      ? 'Негізгі ереже (11...17°C): Жеңіл күрте немесе худи және жабық аяқ киім жеткілікті.'
      : 'Base rule (11...17°C): Light jacket or hoodie with closed shoes works well.';
  } else if (effective <= 24) {
    items = [tee, shoes];
    title = kk ? 'Жеңіл киім' : 'Light everyday clothes';
    baseRule = kk
      ? 'Негізгі ереже (18...24°C): Ыңғайлы жеңіл күнделікті киім.'
      : 'Base rule (18...24°C): Comfortable light clothes.';
  } else {
    items = [tee, shoes, cap, water];
    title = kk ? 'Жаздық жеңіл киім' : 'Breathable summer wear';
    baseRule = kk
      ? 'Негізгі ереже (≥ 25°C): Тыныс алатын жеңіл киім, күннен қорғайтын кепка және ауыз су.'
      : 'Base rule (≥ 25°C): Breathable light clothes, sun cap and water bottle.';
  }

  const notes = [baseRule];

  if (kind === 'rain' || kind === 'storm') {
    items.push(umbrella);
    notes.push(kk ? 'Жауын-шашын: Су өткізбейтін қабат немесе қолшатыр алыңыз.' : 'Precipitation: Bring a waterproof layer or umbrella.');
  }
  if (kind === 'snow') {
    if (!items.includes(boots)) items.push(boots);
    notes.push(kk ? 'Қар: Жылы әрі таймайтын су өтпейтін аяқ киім таңдаңыз.' : 'Snow: Choose warm waterproof non-slip footwear.');
  }
  if (w.wind >= 25) {
    if (effective > 10 && !items.includes(layer)) items.push(layer);
    notes.push(kk ? 'Қатты жел (≥25 км/сағ): Салқындықтан қорғану үшін қосымша сыртқы қабат киіңіз.' : 'Strong wind (≥25 km/h): Add an outer layer to block wind chill.');
  }
  if (w.temp >= 25 && !items.includes(cap)) {
    items.push(cap);
    notes.push(kk ? 'Күн қатты: Күнқағар киіп, көлеңкеде жүріңіз.' : 'Strong sun: Wear a cap and seek shade.');
  }
  if (!w.day) {
    notes.push(kk ? 'Түнде ауа температурасы төмендеуі мүмкін.' : 'Temperatures may drop at night.');
  }

  notes.push(kk ? '* Бұл — ғылыми-оқу үлгісі. Жеке ыңғайлылық пен жағдайға байланысты бейімдеңіз.' : '* Educational research model. Adjust for personal comfort and local conditions.');

  return { title, items: [...new Set(items)], reason: notes.join(' ') };
}
