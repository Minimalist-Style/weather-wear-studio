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
 if(effective<=-10){items=[coat,boots,gloves];title=lang==='kk'?'Өте жылы киінейік':'Bundle up heavily'; baseRule=lang==='kk'?'Негізгі ереже: -10°C және одан төмен кезде ең қалың қыстық киім қажет.':'Base rule: At or below -10°C, heaviest winter gear is needed.';}
 else if(effective<=0){items=[coat,boots,gloves];title=lang==='kk'?'Жылы киінейік':'Wear warm clothes'; baseRule=lang==='kk'?'Негізгі ереже: -9°C пен 0°C аралығында қалың пальто мен қолғап киген жөн.':'Base rule: Between -9°C and 0°C, a heavy coat and gloves are advised.';}
 else if(effective<=10){items=[jacket,shoes];title=lang==='kk'?'Күрте керек':'Grab a jacket'; baseRule=lang==='kk'?'Негізгі ереже: 1°C пен 10°C аралығында орташа жылы күрте киген жөн.':'Base rule: Between 1°C and 10°C, a mid-weight jacket is optimal.';}
 else if(effective<=17){items=[light,shoes];title=lang==='kk'?'Жеңіл қабат жеткілікті':'A light layer works'; baseRule=lang==='kk'?'Негізгі ереже: 11°C пен 17°C аралығында жеңіл күрте жеткілікті.':'Base rule: Between 11°C and 17°C, a light jacket is enough.';}
 else if(effective<=24){items=[tee,shoes];title=lang==='kk'?'Жеңіл киін':'Keep it light'; baseRule=lang==='kk'?'Негізгі ереже: 18°C пен 24°C аралығында жаздық киім ыңғайлы.':'Base rule: Between 18°C and 24°C, summer clothes are comfortable.';}
 else{items=[tee,shoes,cap];title=lang==='kk'?'Ыстық ауа райы':'Hot weather'; baseRule=lang==='kk'?'Негізгі ереже: 25°C және одан жоғарыда күннен қорғану маңызды.':'Base rule: 25°C and above, sun protection is important.';}
 const notes:string[]=[baseRule];
 if(kind==='rain'||kind==='storm'){items.push(umbrella);notes.push(lang==='kk'?'Жауын-шашын: су өткізбейтін қабат немесе қолшатыр ал.':'Precipitation: bring a waterproof layer or umbrella.')}
 if(kind==='snow'){if(!items.includes(boots))items.push(boots);notes.push(lang==='kk'?'Қар: табаны таймайтын жылы аяқ киім таңда.':'Snow: choose warm, grippy footwear.')}
 if(w.wind>=25){if(effective>10)items.push(layer);notes.push(lang==='kk'?'Қатты жел (25 км/сағ+): жылуды ұстап қалу үшін қосымша қабат қажет.':'High wind (25+ km/h): an extra layer blocks wind chill.')}
 if(!w.day)notes.push(lang==='kk'?'Түнде температура төмендеуі мүмкін.':'Temperatures may drop at night.');
 notes.push(lang==='kk'?'* Бұл — білім беру моделі. Ол қауіпсіздікке кепілдік бермейді, өз қалауыңызға қарай бейімдеңіз.':'* Educational model. Does not guarantee safety; adjust to personal comfort.');
 return{title,items:[...new Set(items)],reason:notes.join(' ')};
}
