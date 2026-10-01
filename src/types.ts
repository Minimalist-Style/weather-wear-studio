export type Lang = 'kk' | 'en';
export type WeatherKind = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';
export type Weather = {temp:number; feels:number; wind:number; precip:number; code:number; day:boolean; time:string};
export type ForecastDay = {date:string; high:number; low:number; code:number};
export type WeatherData = {now:Weather; days:ForecastDay[]};
export type City = {name:string; latitude:number; longitude:number; timezone:string; country?:string; region?:string};
export type DiaryEntry = {id:string; date:string; temp:number; code:number; wind:number; comfort:'cold'|'right'|'warm'; note:string};
