import type {Lang,Weather,WeatherKind} from './types';
export function weatherKind(code:number):WeatherKind {
  if ([95,96,99].includes(code)) return 'storm';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
  if ([71,73,75,77,85,86].includes(code)) return 'snow';
  if ([45,48].includes(code)) return 'fog';
  if (code===0||code===1) return 'sun';
  return 'cloud';
}
export type Garment={icon:string;kk:string;en:string};
const g=(icon:string,kk:string,en:string):Garment=>({icon,kk,en});
const coat=g('🧥','Жылы пальто','Warm coat'), jacket=g('🧥','Күрте','Jacket'), light=g('🧥','Жеңіл күрте','Light jacket'), tee=g('👕','Жеңіл киім','Light clothes'), boots=g('🥾','Жылы аяқ киім','Warm boots'), shoes=g('👟','Жабық аяқ киім','Closed shoes'), gloves=g('🧤','Қолғап пен бас киім','Gloves & hat'), layer=g('🧶','Қосымша қабат','Extra layer'), umbrella=g('☂️','Қолшатыр','Umbrella'), cap=g('🧢','Бас киім мен су','Cap & water');
export function recommend(w:Weather,lang:Lang){
 const effective=Math.min(w.temp,Number.isFinite(w.feels)?w.feels:w.temp),kind=weatherKind(w.code);
 let items:Garment[];let title:string;let baseRule:string;
 if(effective<=0){items=[coat,boots,gloves];title=lang==='kk'?'Жылы киінейік':'Bundle up'; baseRule=lang==='kk'?'Негізгі ереже: 0°C-тан төмен кезде қалың пальто мен қолғап қажет.':'Base rule: Below 0°C requires a heavy coat and gloves.';}
 else if(effective<=10){items=[jacket,shoes];title=lang==='kk'?'Күрте керек':'Grab a jacket'; baseRule=lang==='kk'?'Негізгі ереже: 1°C пен 10°C аралығында орташа жылы күрте киген жөн.':'Base rule: Between 1°C and 10°C, a mid-weight jacket is optimal.';}
 else if(effective<=17){items=[light,shoes];title=lang==='kk'?'Жеңіл қабат жеткілікті':'A light layer works'; baseRule=lang==='kk'?'Негізгі ереже: 11°C пен 17°C аралығында жеңіл күрте жеткілікті.':'Base rule: Between 11°C and 17°C, a light jacket is enough.';}
 else{items=[tee,shoes];title=lang==='kk'?'Жеңіл киін':'Keep it light'; baseRule=lang==='kk'?'Негізгі ереже: 18°C-тан жоғарыда жаздық киім ыңғайлы.':'Base rule: Above 18°C, summer clothes are comfortable.';}
 const notes:string[]=[baseRule];
 if(kind==='rain'||kind==='storm'){items.push(umbrella);notes.push(lang==='kk'?'Жауын-шашын: су өткізбейтін қабат немесе қолшатыр ал.':'Precipitation: bring a waterproof layer or umbrella.')}
 if(kind==='snow'){if(!items.includes(boots))items.push(boots);notes.push(lang==='kk'?'Қар: табаны таймайтын жылы аяқ киім таңда.':'Snow: choose warm, grippy footwear.')}
 if(w.wind>=25){if(effective>10)items.push(layer);notes.push(lang==='kk'?'Қатты жел (25 км/сағ+): жылуды ұстап қалу үшін қосымша қабат қажет.':'High wind (25+ km/h): an extra layer blocks wind chill.')}
 if(w.temp>=25){items.push(cap);notes.push(lang==='kk'?'Ыстық ауа райы: күннен қорғайтын бас киім киіп, су ішуді ұмытпа.':'Hot weather: wear a cap for sun protection and hydrate.')}
 if(!w.day)notes.push(lang==='kk'?'Түнде температура төмендеуі мүмкін.':'Temperatures may drop at night.');
 notes.push(lang==='kk'?'* Бұл — білім беру моделі. Өз қалауыңыз бен жағдайыңызға қарай бейімдеңіз.':'* Educational model. Adjust based on your personal comfort.');
 return{title,items:[...new Set(items)],reason:notes.join(' ')};
}
