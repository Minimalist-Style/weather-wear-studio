import type {DiaryEntry} from './types';
export const DIARY_KEY='ww-studio-diary-v2';
export function readDiary():DiaryEntry[]{try{const x=JSON.parse(localStorage.getItem(DIARY_KEY)||'[]');return Array.isArray(x)?x.filter((v)=>v&&typeof v.id==='string'&&typeof v.date==='string'&&Number.isFinite(v.temp)).slice(0,100):[]}catch{return[]}}
export function writeDiary(entries:DiaryEntry[]){localStorage.setItem(DIARY_KEY,JSON.stringify(entries.slice(0,100)))}
export function exportDiary(entries:DiaryEntry[]){const q=(value:string|number)=>'"'+String(value).replaceAll('"','""')+'"';const rows=[['date','temperature_c','weather_code','wind_kmh','comfort','note'],...entries.map(x=>[x.date,x.temp,x.code,x.wind,x.comfort,x.note])];const csv='\uFEFF'+rows.map(row=>row.map(q).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='weather-wear-observations.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export function parseCsvImport(text: string): DiaryEntry[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('invalid_format');
  const parseLine = (line: string) => {
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
      } else if (line[i] === ',' && !inQuotes) { result.push(cur); cur = ''; } else { cur += line[i]; }
    }
    result.push(cur); return result;
  };
  const headers = parseLine(lines[0].replace(/^\uFEFF/, '').toLowerCase());
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const tempIdx = headers.findIndex(h => h.includes('temperature_c'));
  const codeIdx = headers.findIndex(h => h.includes('weather_code'));
  const windIdx = headers.findIndex(h => h.includes('wind_kmh'));
  const comfortIdx = headers.findIndex(h => h.includes('comfort'));
  const noteIdx = headers.findIndex(h => h.includes('note'));
  if (dateIdx < 0 || tempIdx < 0) throw new Error('missing_columns');
  
  const entries: DiaryEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = parseLine(lines[i]);
    const date = row[dateIdx]?.trim();
    const temp = Number(row[tempIdx]);
    const code = Number(row[codeIdx] || 3);
    const wind = Number(row[windIdx] || 0);
    const comfort = (row[comfortIdx]?.trim() || 'right') as 'cold'|'right'|'warm';
    const note = row[noteIdx]?.trim() || '';
    if (date && Number.isFinite(temp)) {
      entries.push({
        id: globalThis.crypto?.randomUUID?.() || String(Date.now() + i),
        date, temp, code, wind, comfort, note
      });
    }
  }
  return entries;
}
