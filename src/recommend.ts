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
 let items:Garment[];let title:string;
 if(effective<=0){items=[coat,boots,gloves];title=lang==='kk'?'Жылы киінейік':'Bundle up'}
 else if(effective<=10){items=[jacket,shoes];title=lang==='kk'?'Күрте керек':'Grab a jacket'}
 else if(effective<=17){items=[light,shoes];title=lang==='kk'?'Жеңіл қабат жеткілікті':'A light layer works'}
 else{items=[tee,shoes];title=lang==='kk'?'Жеңіл киін':'Keep it light'}
 const notes:string[]=[];
 if(kind==='rain'||kind==='storm'){items.push(umbrella);notes.push(lang==='kk'?'Жаңбыр күтіледі — су өткізбейтін киім ал.':'Rain expected — bring a waterproof layer.')}
 if(kind==='snow'){if(!items.includes(boots))items.push(boots);notes.push(lang==='kk'?'Қар: табаны таймайтын жылы аяқ киім таңда.':'Snow: choose warm, grippy footwear.')}
 if(w.wind>=25){if(effective>10)items.push(layer);notes.push(lang==='kk'?'Жел қатты: қосымша қабат ыңғайлы.':'Windy: an extra layer may help.')}
 if(w.temp>=25){items.push(cap);notes.push(lang==='kk'?'Ыстықта су ішіп, көлеңкеде демал.':'Stay hydrated and find shade.')}
 if(!w.day)notes.push(lang==='kk'?'Кешке салқындауы мүмкін.':'It may feel cooler at night.');
 if(!notes.length)notes.push(lang==='kk'?'Сыртқа шығар алдында ауа райын қайта тексер.':'Check conditions again before going outside.');
 return{title,items:[...new Set(items)],reason:notes.join(' ')};
}
