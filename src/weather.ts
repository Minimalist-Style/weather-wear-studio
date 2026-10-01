import type {City,WeatherData} from './types';
export const initialCity:City={name:'Павлодар',latitude:52.2833,longitude:76.9667,timezone:'Asia/Almaty',country:'Қазақстан'};
const valid=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
export async function getWeather(city:City,signal?:AbortSignal):Promise<WeatherData>{
 const u=new URL('https://api.open-meteo.com/v1/forecast');
 Object.entries({latitude:city.latitude,longitude:city.longitude,current:'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day',daily:'temperature_2m_max,temperature_2m_min,weather_code',timezone:city.timezone||'auto',forecast_days:3}).forEach(([k,v])=>u.searchParams.set(k,String(v)));
 const r=await fetch(u,{signal});if(!r.ok)throw Error('Weather HTTP '+r.status);const d=await r.json();const c=d.current,z=d.daily;
 if(!c||!z||!valid(c.temperature_2m)||!Array.isArray(z.time)||!Array.isArray(z.temperature_2m_max)||!Array.isArray(z.temperature_2m_min)||!Array.isArray(z.weather_code))throw Error('Invalid weather response');
 return{now:{temp:c.temperature_2m,feels:valid(c.apparent_temperature)?c.apparent_temperature:c.temperature_2m,wind:valid(c.wind_speed_10m)?c.wind_speed_10m:0,precip:valid(c.precipitation)?c.precipitation:0,code:valid(c.weather_code)?c.weather_code:3,day:c.is_day!==0,time:String(c.time||'')},days:z.time.slice(0,3).map((date:string,i:number)=>({date,high:z.temperature_2m_max[i],low:z.temperature_2m_min[i],code:z.weather_code[i]}))};
}
export async function searchCities(query:string,signal?:AbortSignal):Promise<City[]>{
 if(query.trim().length<3)return[];const u=new URL('https://geocoding-api.open-meteo.com/v1/search');u.searchParams.set('name',query.trim());u.searchParams.set('count','8');u.searchParams.set('language','ru');u.searchParams.set('countryCode','KZ');
 const r=await fetch(u,{signal});if(!r.ok)throw Error('City HTTP '+r.status);const data=await r.json();return (data.results||[]).filter((v:City)=>valid(v.latitude)&&valid(v.longitude)).map((v:City)=>({name:v.name,latitude:v.latitude,longitude:v.longitude,timezone:v.timezone||'Asia/Almaty',country:v.country,region:v.region}));
}
