import type {DiaryEntry} from './types';
export const DIARY_KEY='ww-studio-diary-v2';
export function readDiary():DiaryEntry[]{try{const x=JSON.parse(localStorage.getItem(DIARY_KEY)||'[]');return Array.isArray(x)?x.filter((v)=>v&&typeof v.id==='string'&&typeof v.date==='string'&&Number.isFinite(v.temp)).slice(0,100):[]}catch{return[]}}
export function writeDiary(entries:DiaryEntry[]){
  try {
    localStorage.setItem(DIARY_KEY,JSON.stringify(entries.slice(0,100)));
  } catch {
    throw new Error('quota_exceeded');
  }
}

export function exportDiary(entries:DiaryEntry[]){const q=(value:string|number)=>'"'+String(value).replaceAll('"','""')+'"';const rows=[['date','temperature_c','weather_code','wind_kmh','comfort','note'],...entries.map(x=>[x.date,x.temp,x.code,x.wind,x.comfort,x.note])];const csv='\uFEFF'+rows.map(row=>row.map(q).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='weather-wear-observations.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export function parseCsvImport(text: string): DiaryEntry[] {
  text = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let cur = '', row: string[] = [], inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i+1];
    if (inQuotes) {
      if (char === '"' && next === '"') { cur += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else cur += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(cur); cur = ''; }
      else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(cur); rows.push(row); row = []; cur = '';
        if (char === '\r') i++;
      } else if (char !== '\r') cur += char;
    }
  }
  if (cur || row.length > 0) { row.push(cur); rows.push(row); }

  if (rows.length < 2) throw new Error('invalid_format');
  const headers = rows[0].map(h => h.trim().toLowerCase());
  
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const tempIdx = headers.findIndex(h => h.includes('temperature_c'));
  const codeIdx = headers.findIndex(h => h.includes('weather_code'));
  const windIdx = headers.findIndex(h => h.includes('wind_kmh'));
  const comfortIdx = headers.findIndex(h => h.includes('comfort'));
  const noteIdx = headers.findIndex(h => h.includes('note'));
  
  if (dateIdx < 0 || tempIdx < 0) throw new Error('missing_columns');
  
  const entries: DiaryEntry[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length <= 1) continue;
    
    const date = r[dateIdx]?.trim();
    const temp = Number(r[tempIdx]);
    const code = Number(r[codeIdx] || 3);
    const wind = Number(r[windIdx] || 0);
    const comfortRaw = r[comfortIdx]?.trim() || 'right';
    const comfort = ['cold', 'right', 'warm'].includes(comfortRaw) ? comfortRaw as 'cold'|'right'|'warm' : 'right';
    const note = r[noteIdx]?.trim() || '';
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && dateRegex.test(date) && Number.isFinite(temp) && temp >= -60 && temp <= 60 && Number.isFinite(wind) && wind >= 0 && wind <= 150) {
      const key = `${date}|${temp}|${note}`;
      if (!seen.has(key)) {
        seen.add(key);
        entries.push({
          id: globalThis.crypto?.randomUUID?.() || String(Date.now() + i),
          date, temp, code, wind, comfort, note
        });
      }
    }
  }
  return entries;
}

export const countUniqueDays = (entries: DiaryEntry[]) => new Set(entries.map(e => e.date)).size;
