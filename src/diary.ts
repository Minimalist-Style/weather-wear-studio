import type { DiaryEntry } from './types';

export const DIARY_KEY = 'ww-studio-diary-v2';

export function readDiary(): DiaryEntry[] {
  try {
    const x = JSON.parse(localStorage.getItem(DIARY_KEY) || '[]');
    return Array.isArray(x)
      ? x
          .filter(
            (v) =>
              v &&
              typeof v.id === 'string' &&
              typeof v.date === 'string' &&
              Number.isFinite(v.temp)
          )
          .slice(0, 100)
      : [];
  } catch {
    return [];
  }
}

export function writeDiary(entries: DiaryEntry[]) {
  localStorage.setItem(DIARY_KEY, JSON.stringify(entries.slice(0, 100)));
}

export function exportDiary(entries: DiaryEntry[]) {
  const q = (value: string | number) => '"' + String(value).replaceAll('"', '""') + '"';
  const rows = [
    ['date', 'temperature_c', 'weather_code', 'wind_kmh', 'comfort', 'note'],
    ...entries.map((x) => [x.date, x.temp, x.code, x.wind, x.comfort, x.note]),
  ];
  const csv = '\uFEFF' + rows.map((row) => row.map(q).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'weather-wear-observations.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function countUniqueDays(entries: DiaryEntry[]): number {
  return new Set(entries.map((e) => e.date)).size;
}

export function parseCsvImport(text: string): DiaryEntry[] {
  const clean = text.replace(/^\uFEFF/, '').trim();
  if (!clean) throw new Error('empty_file');

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) throw new Error('missing_data_rows');

  const headers = rows[0].map((h) => h.toLowerCase());
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const tempIdx = headers.findIndex((h) => h.includes('temp'));
  const codeIdx = headers.findIndex((h) => h.includes('code'));
  const windIdx = headers.findIndex((h) => h.includes('wind'));
  const comfortIdx = headers.findIndex((h) => h.includes('comfort'));
  const noteIdx = headers.findIndex((h) => h.includes('note'));

  if (dateIdx < 0 || tempIdx < 0) throw new Error('missing_required_columns');

  const entries: DiaryEntry[] = [];
  const seenKeys = new Set<string>();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const date = row[dateIdx]?.trim();
    const temp = Number(row[tempIdx]);
    const code = Number(row[codeIdx] ?? 3);
    const wind = Number(row[windIdx] ?? 0);
    const rawComfort = row[comfortIdx]?.trim().toLowerCase();
    const comfort: DiaryEntry['comfort'] =
      rawComfort === 'cold' || rawComfort === 'warm' ? rawComfort : 'right';
    const note = (noteIdx >= 0 ? row[noteIdx] : '') || '';

    if (!date || !Number.isFinite(temp) || temp < -60 || temp > 60) continue;

    const dupKey = `${date}|${temp}|${note}`;
    if (seenKeys.has(dupKey)) continue;
    seenKeys.add(dupKey);

    entries.push({
      id: globalThis.crypto?.randomUUID?.() || String(Date.now() + r),
      date,
      temp,
      code: Number.isFinite(code) ? code : 3,
      wind: Number.isFinite(wind) ? wind : 0,
      comfort,
      note,
    });
  }

  return entries;
}
