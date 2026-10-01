import { useEffect, useMemo, useState } from "react";
import {
  CloudSun,
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  ArrowRight,
  RotateCcw,
  FlaskConical,
  BookOpen,
  Download,
  Upload,
  Trash2,
  Search,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Cloud,
  Check,
  Menu,
  X,
  Plus,
  ExternalLink,
  Navigation,
} from "lucide-react";
import type {
  City,
  DiaryEntry,
  Lang,
  Weather,
  WeatherKind,
  WeatherData,
} from "./types";
import { weatherKind, recommend } from "./recommend";
import { getWeather, initialCity, searchCities } from "./weather";
import { readDiary, writeDiary, exportDiary, parseCsvImport, countUniqueDays } from "./diary";
const SCENARIOS = [
  {
    id: "frost",
    temp: -16,
    code: 73,
    wind: 18,
    emoji: "❄️",
    kk: "Аяз",
    en: "Frost",
  },
  {
    id: "wind",
    temp: 8,
    code: 3,
    wind: 38,
    emoji: "💨",
    kk: "Жел",
    en: "Wind",
  },
  {
    id: "rain",
    temp: 12,
    code: 63,
    wind: 16,
    emoji: "🌧️",
    kk: "Жаңбыр",
    en: "Rain",
  },
  {
    id: "sun",
    temp: 28,
    code: 0,
    wind: 7,
    emoji: "☀️",
    kk: "Ыстық",
    en: "Heat",
  },
] as const;
const c: Record<Lang, Record<string, string>> = {
  kk: {
    tag: "АУА РАЙЫ × КҮНДЕЛІКТІ ТАҢДАУ",
    hero: "Ауа райы —",
    hero2: "ақылды таңдауға жол.",
    subtitle: "Таңертеңгі бір сұраққа ғылыми жауап: бүгін не киемін?",
    app: "Қосымшаны ашу",
    research: "Зерттеуді көру",
    nav1: "Бүгін",
    nav2: "Зертхана",
    nav3: "Күнделік",
    location: "Қаланы іздеу",
    locate: "Менің орным",
    today: "Бүгін",
    forecast: "Келесі 3 күн",
    guide: "Бүгінгі ұсыныс",
    why: "Неліктен?",
    feels: "Сезіледі",
    wind: "Жел",
    rain: "Жауын",
    live: "Нақты болжам",
    demo: "Оқу сценарийі",
    back: "Нақты ауа райына оралу",
    lab: "Ауа райын өзгерт. Нәтижені көр.",
    labSub:
      "Температура, жел және жауын — әрқайсысы киім таңдауын өзгертеді. Бұл — біздің зерттеу моделіміз.",
    temp: "Температура",
    condition: "Аспан жағдайы",
    daytime: "Күндіз",
    night: "Түнде",
    diary: "Бақылау күнделігі",
    diarySub: "14 күн бойы нақты ауа райын жазып, сыныппен бірге салыстырыңыз.",
    diaryWarning:
      "Ескерту: деректер тек осы браузерде сақталады. Жоғалтпас үшін күн сайын CSV жүктеп отырыңыз.",
    date: "Күні",
    observed: "Өлшенген °C",
    windLabel: "Жел, км/сағ",
    feel: "Қалай сезіндің?",
    cold: "Суық",
    right: "Ыңғайлы",
    warm: "Ыстық",
    note: "Киім және қысқаша ескерту (міндетті емес)",
    save: "Бақылауды сақтау",
    export: "Экспорт (CSV)",
    importFile: "Импорт (CSV)",
    found: "жазба табылды. Біріктіру немесе ауыстыру?",
    merge: "Біріктіру",
    replace: "Ауыстыру",
    cancel: "Болдырмау",
    empty: "Әзірге бақылау жоқ. Бірінші жазбаны қосыңыз.",
    facts: "Зерттеу туралы",
    factText:
      "Бұл прототип Маратова Аяжан мен Мақсат Ақжібектің «Ауа райы станциясы және киім нұсқаулығы» ғылыми жобасына арналған. Болжам мен оқушылардың өз бақылауы бөлек көрсетіледі.",
    warning:
      "Ұсыныстар оқу мақсатында берілген. Ауа райын және өз жағдайыңызды өзіңіз бағалаңыз.",
    credits:
      "Ауа райы деректері Open-Meteo · Болжам — метеостанцияның тікелей өлшемі емес",
    loading: "Болжам жүктелуде…",
    fail: "Болжам алынбады. Зертхананы пайдаланыңыз немесе кейін қайталаңыз.",
    searchFail: "Қалалар табылмады немесе іздеу қолжетімсіз",
    searchTip: "Қазақстан қалаларының атауын енгізіңіз",
    source: "Болжам",
    sun: "Ашық",
    cloud: "Бұлтты",
    rainy: "Жаңбыр",
    snow: "Қар",
    storm: "Найзағай",
    fog: "Тұман",
    demoNote: "Жасанды жағдай. Нақты ауа райы емес.",
    days: "Үш күнге алдын ала дайындал",
    study: "Болжам емес, өз өлшеуіңіз",
    remove: "Өшіру",
    view: "Болжамды қарау",
    noForecast: "Желіге қосылғанда болжам көрсетіледі.",
    project: "Мектептегі ғылыми жоба · 2026",
    liveSection: "01 / LIVE WEATHER",
    forecastSection: "02 / АЛДАҒЫ КҮНДЕР",
    labSection: "03 / АУА РАЙЫ ЭКСПЕРИМЕНТІ",
    labControls: "✳ АУА РАЙЫН БАСҚАРУ",
    diarySection: "04 / ДАЛА КҮНДЕЛІГІ",
    researchSection: "ЗЕРТТЕУ / 2026",
    simulationEdit: "СИМУЛЯЦИЯ НӘТИЖЕСІ",
    newObservation: "ЖАҢА БАҚЫЛАУ",
    researchProgress: "ЗЕРТТЕУ ПРОГРЕСІ",
    progressWait: "Айырмашылықты талдау деректер жиналғаннан кейін қолжетімді болады.",
    progressDays: "КҮН",
  },
  en: {
    tag: "WEATHER × EVERYDAY DECISIONS",
    hero: "Weather,",
    hero2: "made wearable.",
    subtitle:
      "A research-backed answer to one morning question: what should I wear?",
    app: "Explore the app",
    research: "About the research",
    nav1: "Today",
    nav2: "Weather lab",
    nav3: "Field diary",
    location: "Search a city",
    locate: "My location",
    today: "Today",
    forecast: "Next 3 days",
    guide: "Your outfit edit",
    why: "Why this look?",
    feels: "Feels like",
    wind: "Wind",
    rain: "Rain",
    live: "Live forecast",
    demo: "Learning scenario",
    back: "Return to live forecast",
    lab: "Change the weather. See the result.",
    labSub:
      "Temperature, wind and rain can all change your outfit. Explore our research model.",
    temp: "Temperature",
    condition: "Sky conditions",
    daytime: "Daytime",
    night: "Nighttime",
    diary: "Field notes",
    diarySub:
      "Record actual observations for 14 days and compare them with your classmates.",
    diaryWarning:
      "Note: Data is saved only in this browser. Export CSV daily to prevent data loss.",
    date: "Date",
    observed: "Observed °C",
    windLabel: "Wind, km/h",
    feel: "How did you feel?",
    cold: "Too cold",
    right: "Just right",
    warm: "Too warm",
    note: "What did you wear? (optional)",
    save: "Save observation",
    export: "Export CSV",
    importFile: "Import CSV",
    found: "entries found. Merge or Replace?",
    merge: "Merge",
    replace: "Replace",
    cancel: "Cancel",
    empty: "No observations yet. Add your first entry.",
    facts: "About the research",
    factText:
      "This prototype supports the scientific project “The Weather Station & Clothes Guide” by Ayazhan Maratova and Aqzhibek Maksat. Forecasts and pupils’ actual observations are kept separate.",
    warning:
      "Clothing suggestions are educational, not personal safety advice. Check your conditions and comfort.",
    credits:
      "Weather data: Open-Meteo · Forecast is not a direct station measurement",
    loading: "Loading forecast…",
    fail: "Forecast unavailable. Try the lab or refresh later.",
    searchFail: "No matching city or search unavailable",
    searchTip: "Enter a city in Kazakhstan",
    source: "Forecast",
    sun: "Sunny",
    cloud: "Cloudy",
    rainy: "Rain",
    snow: "Snow",
    storm: "Storm",
    fog: "Fog",
    demoNote: "Simulation, not actual weather.",
    days: "Plan the next three days",
    study: "Your own measurement, not a forecast",
    remove: "Remove",
    view: "See forecast",
    noForecast: "Forecast appears when connected.",
    project: "School research project · 2026",
    liveSection: "01 / LIVE WEATHER",
    forecastSection: "02 / LOOK AHEAD",
    labSection: "03 / WEATHER EXPERIMENT",
    labControls: "✳ WEATHER CONTROLS",
    diarySection: "04 / FIELD JOURNAL",
    researchSection: "THE RESEARCH / 2026",
    simulationEdit: "SIMULATION EDIT",
    newObservation: "NEW OBSERVATION",
    researchProgress: "RESEARCH PROGRESS",
    progressWait: "Difference from forecast will be available after collecting data.",
    progressDays: "DAYS",
  },
};
const iconMap = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  fog: CloudFog,
};
const codeName: Record<WeatherKind, string> = {
  sun: "sun",
  cloud: "cloud",
  rain: "rainy",
  snow: "snow",
  storm: "storm",
  fog: "fog",
};
const f = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n)}°`;
const getSavedCity = (): City => {
  try {
    const x = JSON.parse(localStorage.getItem("ww-city-v2") || "null");
    return x &&
      typeof x.name === "string" &&
      Number.isFinite(x.latitude) &&
      Number.isFinite(x.longitude)
      ? x
      : initialCity;
  } catch {
    return initialCity;
  }
};
const dateLocal = (zone: string) => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};
function WeatherIcon({ code, size = 30 }: { code: number; size?: number }) {
  const I = iconMap[weatherKind(code)];
  return <I size={size} strokeWidth={1.5} aria-hidden="true" />;
}
export default function App() {
  const [lang, setLang] = useState<Lang>("kk"),
    [city, setCity] = useState<City>(getSavedCity),
    [forecast, setForecast] = useState<WeatherData | null>(null),
    [status, setStatus] = useState(""),
    [demo, setDemo] = useState(false),
    [scenario, setScenario] = useState<string>(""),
    [manual, setManual] = useState<Weather>({
      temp: 8,
      feels: 8,
      wind: 8,
      precip: 0,
      code: 3,
      day: true,
      time: "",
    });
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<City[]>([]),
    [searching, setSearching] = useState(false),
    [entries, setEntries] = useState<DiaryEntry[]>(readDiary),
    [mobileMenu, setMobileMenu] = useState(false),
    [importData, setImportData] = useState<DiaryEntry[] | null>(null);
  const [date, setDate] = useState(() => dateLocal(city.timezone)),
    [observed, setObserved] = useState(""),
    [observedWind, setObservedWind] = useState(""),
    [observedCode, setObservedCode] = useState(3),
    [comfort, setComfort] = useState<DiaryEntry["comfort"]>("right"),
    [note, setNote] = useState("");
  const tx = c[lang],
    active = demo ? manual : forecast?.now,
    kind = active ? weatherKind(active.code) : "cloud",
    rec = useMemo(
      () => (active ? recommend(active, lang) : null),
      [active, lang],
    );
  useEffect(() => {
    const ctrl = new AbortController();
    setStatus(c[lang].loading);
    setForecast(null);
    getWeather(city, ctrl.signal)
      .then((x) => {
        setForecast(x);
        setStatus("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus(c[lang].fail);
      });
    return () => ctrl.abort();
  }, [city]);
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    let timer = setTimeout(() => {
      setSearching(true);
      searchCities(query, ctrl.signal)
        .then(setResults)
        .catch((e) => {
          if (e.name !== "AbortError") setResults([]);
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setSearching(false);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);
  const selectCity = (v: City) => {
    setCity(v);
    localStorage.setItem("ww-city-v2", JSON.stringify(v));
    setQuery("");
    setResults([]);
    setDemo(false);
    setDate(dateLocal(v.timezone));
  };
  const changeManual = (patch: Partial<Weather>) => {
    setScenario("");
    setDemo(true);
    setManual((old) => ({ ...old, ...patch, feels: patch.temp ?? old.temp }));
  };
  const chooseScenario = (s: (typeof SCENARIOS)[number]) => {
    setDemo(true);
    setScenario(s.id);
    setManual({
      temp: s.temp,
      feels: s.temp - (s.wind >= 25 ? 3 : 0),
      wind: s.wind,
      code: s.code,
      precip: s.code === 63 ? 1.4 : 0,
      day: true,
      time: "",
    });
  };
  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(observed),
      w = observedWind.trim() === "" ? 0 : Number(observedWind);
    if (
      !date ||
      observed.trim() === "" ||
      !Number.isFinite(n) ||
      n < -60 ||
      n > 60 ||
      !Number.isFinite(w) ||
      w < 0 ||
      w > 150
    )
      return;
    const item: DiaryEntry = {
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      date,
      temp: n,
      wind: w,
      code: observedCode,
      comfort,
      note: note.trim().slice(0, 240),
    };
    const updated = [item, ...entries].slice(0, 100);
    setEntries(updated);
    writeDiary(updated);
    setObserved("");
    setObservedWind("");
    setNote("");
  };
  const remove = (id: string) => {
    const updated = entries.filter((x) => x.id !== id);
    setEntries(updated);
    writeDiary(updated);
  };
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };
  const locateMe = () => {
    if (!navigator.geolocation) {
      alert(
        lang === "kk"
          ? "Браузер геолокацияны қолдамайды"
          : "Geolocation not supported",
      );
      return;
    }
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearching(false);
        selectCity({
          name: tx.locate,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timezone: "auto",
          country: "",
        });
      },
      () => {
        setSearching(false);
        alert(
          lang === "kk"
            ? "Орынды анықтау мүмкін болмады"
            : "Could not get location",
        );
      },
      { timeout: 10000 },
    );
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (evt) => {
      try {
        const parsed = parseCsvImport(evt.target?.result as string);
        if (parsed.length) setImportData(parsed);
        else
          alert(
            lang === "kk"
              ? "CSV бос немесе қате деректер"
              : "Empty CSV or invalid data",
          );
      } catch (err) {
        alert(lang === "kk" ? "Қате формат" : "Invalid format");
      }
      e.target.value = "";
    };
    r.readAsText(file);
  };
  const confirmImport = (mode: "merge" | "replace") => {
    if (!importData) return;
    let next: DiaryEntry[];
    if (mode === "replace") {
      next = importData;
    } else {
      const keys = new Set(entries.map((x) => `${x.date}|${x.temp}|${x.note}`));
      const toAdd = importData.filter(
        (x) => !keys.has(`${x.date}|${x.temp}|${x.note}`),
      );
      next = [...toAdd, ...entries];
    }
    if (next.length > 100) {
      const msg =
        lang === "kk"
          ? `Назар аударыңыз: 100 жазба шегінен асты. ${next.length - 100} жазба сақталмайды. Жалғастырамыз ба?`
          : `Warning: 100 entries limit exceeded. ${next.length - 100} entries will be discarded. Continue?`;
      if (!window.confirm(msg)) return;
    }
    const final = next.slice(0, 100);
    try {
      writeDiary(final);
      setEntries(final);
      setImportData(null);
    } catch (e) {
      alert(
        lang === "kk"
          ? "Қате: Браузер жады толып кетті (Storage Quota Exceeded)."
          : "Error: Browser storage quota exceeded.",
      );
    }
  };
  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />
      <header className="topbar wrap">
        <a className="brand" href="#home" aria-label="Weather and Wear home">
          <span className="brand-icon">
            <CloudSun size={23} />
          </span>
          <span>
            weather<span className="accent">&</span>wear
            <small>FIELD NOTES / 2026</small>
          </span>
        </a>
        <nav
          className={mobileMenu ? "nav open" : "nav"}
          aria-label="Main navigation"
        >
          <button onClick={() => jump("today")}>{tx.nav1}</button>
          <button onClick={() => jump("lab")}>{tx.nav2}</button>
          <button onClick={() => jump("diary")}>{tx.nav3}</button>
        </nav>
        <div className="top-actions">
          <button
            className="language"
            onClick={() => setLang(lang === "kk" ? "en" : "kk")}
            aria-label="Switch language"
          >
            {lang === "kk" ? "ҚАЗ / EN" : "KAZ / EN"}
          </button>
          <button
            className="menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="home">
        <div className="mobile-reverse-wrap">
          <section className="intro wrap">
            <div className="intro-content">
              <div className="tiny-label">
                <span className="dot" />
                {tx.tag}
              </div>
              <h1>
                {tx.hero}
                <br />
                <em>{tx.hero2}</em>
              </h1>
              <p>{tx.subtitle}</p>
              <div className="intro-actions">
                <button
                  className="button primary"
                  onClick={() => jump("today")}
                >
                  {tx.app}
                  <ArrowRight size={18} />
                </button>
                <button
                  className="button subdued"
                  onClick={() => jump("about")}
                >
                  {tx.research}
                  <ExternalLink size={16} />
                </button>
              </div>
              <div className="intro-meta">
                <span>01 — 03</span>
                <span>DESIGNED FOR CURIOUS MINDS</span>
              </div>
            </div>
            <div className="intro-art" aria-hidden="true">
              <div className="orbit orbit-a" />
              <div className="orbit orbit-b" />
              <div className="art-sun" />
              <div className="art-cloud a" />
              <div className="art-cloud b" />
              <div className="art-floor" />
              <div className="art-figure">
                <div className="figure-hood" />
                <div className="figure-body" />
                <div className="figure-pocket" />
                <div className="figure-arm" />
                <div className="figure-legs" />
              </div>
              <span className="art-mark one">+08°</span>
              <span className="art-mark two">W/W · 26</span>
            </div>
          </section>
          <section className="dashboard wrap" id="today">
            <div className="section-top">
              <div>
                <span className="section-number">{tx.liveSection}</span>
                <h2>
                  {tx.today}
                  <span className="period">.</span>
                </h2>
              </div>
              <div className="citybox">
                <MapPin size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={city.name}
                  aria-label={tx.location}
                  autoComplete="off"
                />
                <Search size={18} />
                <button
                  className="locate-btn"
                  onClick={locateMe}
                  aria-label={tx.locate}
                  title={tx.locate}
                >
                  <Navigation size={17} />
                </button>
                {query.trim().length >= 3 && (
                  <div className="search-results" role="listbox">
                    {results.length ? (
                      results.map((v, i) => (
                        <button
                          key={`${v.latitude}-${v.longitude}-${i}`}
                          onClick={() => selectCity(v)}
                        >
                          {v.name}
                          {v.region ? ", " + v.region : ""}
                        </button>
                      ))
                    ) : (
                      <div className="search-msg">
                        {searching ? "…" : tx.searchFail}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="hero-grid">
              <article
                className={
                  "weather-panel theme-" +
                  kind +
                  (active && !active.day ? " nighttime" : "")
                }
              >
                <div className="weather-bg-fx">
                  {(kind === "sun" || kind === "cloud") && (
                    <div className="fx-sun" />
                  )}
                  {kind === "snow" && <div className="fx-snow" />}
                  {(kind === "rain" || kind === "storm") && (
                    <div className="fx-rain" />
                  )}
                </div>
                <div className="weather-top">
                  <div>
                    <span className="eyebrow light">
                      {demo ? tx.demo : tx.live}
                    </span>
                    <h3>{city.name}</h3>
                    <span className="time-label">
                      {active?.time
                        ? active.time.replace("T", " · ")
                        : tx.source}
                    </span>
                  </div>
                  <div className="round-glass">
                    <WeatherIcon code={active?.code ?? 3} size={27} />
                  </div>
                </div>
                <div className="weather-center">
                  <div className="big-temp">
                    {active ? f(active.temp) : "—°"}
                  </div>
                  <div className="big-weather">
                    <WeatherIcon code={active?.code ?? 3} size={130} />
                  </div>
                </div>
                <div className="weather-bottom">
                  <span>{active ? tx[codeName[kind]] : status}</span>
                  <span>
                    {demo ? tx.demoNote : "OPEN-METEO / WEATHER MODEL"}
                  </span>
                </div>
              </article>
              <article className="outfit-panel">
                <div className="card-kicker">
                  <span>THE DAILY EDIT</span>
                  <span>✳ / 01</span>
                </div>
                <h3>{tx.guide}</h3>
                <div className="outfit-heading">
                  {rec?.title ?? tx.loading}
                  <span className="outfit-spark">✴</span>
                </div>
                <div className="garments">
                  {rec?.items.map((item, i) => (
                    <div className="garment" key={i}>
                      <span>{item.icon}</span>
                      <b>{item[lang]}</b>
                    </div>
                  ))}
                </div>
                <div className="outfit-reason">
                  <span>✺ {tx.why}</span>
                  <p>{rec?.reason ?? tx.noForecast}</p>
                </div>
              </article>
            </div>
            <div className="metric-grid">
              <div className="metric">
                <Thermometer size={19} />
                <span>{tx.feels}</span>
                <b>{active ? f(active.feels) : "—"}</b>
              </div>
              <div className="metric">
                <Wind size={20} />
                <span>{tx.wind}</span>
                <b>{active ? Math.round(active.wind) + " km/h" : "—"}</b>
              </div>
              <div className="metric">
                <Droplets size={20} />
                <span>{tx.rain}</span>
                <b>{active ? active.precip.toFixed(1) + " mm" : "—"}</b>
              </div>
            </div>
            {status && !demo && (
              <p className="notice" role="status">
                {status}
              </p>
            )}
          </section>
        </div>
        <section className="forecast-section wrap" id="forecast">
          <div className="section-top">
            <div>
              <span className="section-number">{tx.forecastSection}</span>
              <h2>
                {tx.forecast}
                <span className="period">.</span>
              </h2>
            </div>
            <span className="section-side">{tx.days}</span>
          </div>
          <div className="forecast-grid">
            {forecast?.days.length ? (
              forecast.days.map((day, i) => {
                const weekday = new Intl.DateTimeFormat(
                  lang === "kk" ? "kk-KZ" : "en-GB",
                  { weekday: "long", timeZone: "UTC" },
                ).format(new Date(day.date + "T12:00:00Z"));
                const r = recommend(
                  {
                    temp: day.high,
                    feels: day.low,
                    code: day.code,
                    wind: 0,
                    precip: 0,
                    day: true,
                    time: "",
                  },
                  lang,
                );
                return (
                  <article className="forecast-card" key={day.date}>
                    <div className="forecast-head">
                      <span>0{i + 1}</span>
                      <WeatherIcon code={day.code} size={34} />
                    </div>
                    <div className="forecast-main">
                      <span>{i === 0 ? tx.today : weekday}</span>
                      <b>
                        {f(day.high)} <small>/ {f(day.low)}</small>
                      </b>
                    </div>
                    <div className="forecast-tail">
                      <span>
                        {r.items[0]?.icon} {r.title}
                      </span>
                      <ArrowRight size={17} />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="forecast-placeholder">{tx.noForecast}</div>
            )}
          </div>
        </section>
        <section className="lab-section" id="lab">
          <div className="wrap lab-layout">
            <div className="lab-copy">
              <span className="section-number lime">
                {tx.labSection}
              </span>
              <div className="lab-emblem">
                <FlaskConical size={33} />
              </div>
              <h2>{tx.lab}</h2>
              <p>{tx.labSub}</p>
              <div className="scenario-list">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    className={
                      scenario === s.id && demo
                        ? "scenario selected"
                        : "scenario"
                    }
                    onClick={() => chooseScenario(s)}
                  >
                    <span>{s.emoji}</span>
                    {s[lang]} <b>{f(s.temp)}</b>
                  </button>
                ))}
              </div>
              {demo && (
                <button
                  className="reset"
                  onClick={() => {
                    setDemo(false);
                    setScenario("");
                    jump("today");
                  }}
                >
                  <RotateCcw size={15} />
                  {tx.back}
                </button>
              )}
            </div>
            <div className="lab-controls">
              <div className="lab-control-header">
                <span>{tx.labControls}</span>
                <b>001 — 004</b>
              </div>
              <div className="temp-control">
                <div className="control-heading">
                  <span>{tx.temp}</span>
                  <b>{f(manual.temp)}</b>
                </div>
                <input
                  type="range"
                  min="-35"
                  max="38"
                  value={manual.temp}
                  onChange={(e) =>
                    changeManual({ temp: Number(e.target.value) })
                  }
                  aria-label={tx.temp}
                />
                <div className="range-ticks">
                  <span>−35°C</span>
                  <span>+38°C</span>
                </div>
              </div>
              <div className="control-heading separate">
                <span>{tx.condition}</span>
              </div>
              <div className="condition-grid">
                {(
                  [
                    { code: 0, icon: "☀️", name: "sun" },
                    { code: 3, icon: "☁️", name: "cloud" },
                    { code: 63, icon: "🌧️", name: "rainy" },
                    { code: 73, icon: "❄️", name: "snow" },
                  ] as const
                ).map((x) => (
                  <button
                    key={x.name}
                    className={
                      manual.code === x.code
                        ? "condition-choice chosen"
                        : "condition-choice"
                    }
                    onClick={() =>
                      changeManual({
                        code: x.code,
                        precip: x.code === 63 ? 1.3 : 0,
                      })
                    }
                  >
                    <span>{x.icon}</span>
                    {tx[x.name]}
                  </button>
                ))}
              </div>
              <div className="temp-control wind-control">
                <div className="control-heading">
                  <span>{tx.windLabel}</span>
                  <b>{manual.wind} km/h</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={manual.wind}
                  onChange={(e) =>
                    changeManual({ wind: Number(e.target.value) })
                  }
                  aria-label={tx.windLabel}
                />
              </div>
              <button
                className="day-toggle"
                onClick={() => changeManual({ day: !manual.day })}
              >
                {manual.day ? <Sun size={19} /> : <Moon size={19} />}{" "}
                {manual.day ? tx.daytime : tx.night}
                <span>↗</span>
              </button>
              {demo && (
                <div style={{ marginTop: "24px" }}>
                  <article
                    className="outfit-panel"
                    style={{ minHeight: "auto", padding: "20px" }}
                  >
                    <div className="card-kicker">
                      <span>{tx.simulationEdit}</span>
                      <span>✳</span>
                    </div>
                    <h3 style={{ margin: "8px 0" }}>{rec?.title}</h3>
                    <div className="garments">
                      {rec?.items.map((item, i) => (
                        <div className="garment" key={i}>
                          <span>{item.icon}</span>
                          <b>{item[lang]}</b>
                        </div>
                      ))}
                    </div>
                    <div className="outfit-reason">
                      <span>✺ {tx.why}</span>
                      <p>{rec?.reason}</p>
                    </div>
                  </article>
                </div>
              )}
              <div className="lab-foot">{tx.demoNote}</div>
            </div>
          </div>
        </section>
        <section className="diary-section wrap" id="diary">
          <div className="section-top">
            <div>
              <span className="section-number">{tx.diarySection}</span>
              <h2>
                {tx.diary}
                <span className="period">.</span>
              </h2>
              <p className="section-description">{tx.diarySub}</p>
            </div>
            <div className="diary-actions">
              <label className="button subdued dark file-upload">
                <Upload size={17} />
                {tx.importFile}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
              <button
                className="button subdued dark"
                onClick={() => exportDiary(entries)}
                disabled={!entries.length}
              >
                <Download size={17} />
                {tx.export}
              </button>
            </div>
          </div>
          <div className="diary-grid">
            <form className="diary-form" onSubmit={onSave}>
              <div className="form-top">
                <BookOpen size={20} />
                <span>{tx.newObservation}</span>
                <span>✳</span>
              </div>
              <div className="form-two">
                <label>
                  {tx.date}
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  {tx.observed}
                  <input
                    type="number"
                    required
                    min="-60"
                    max="60"
                    step="0.1"
                    value={observed}
                    onChange={(e) => setObserved(e.target.value)}
                    placeholder="+8"
                  />
                </label>
              </div>
              <div className="form-two">
                <label>
                  {tx.condition}
                  <select
                    value={observedCode}
                    onChange={(e) => setObservedCode(Number(e.target.value))}
                  >
                    <option value={0}>{tx.sun}</option>
                    <option value={3}>{tx.cloud}</option>
                    <option value={63}>{tx.rainy}</option>
                    <option value={73}>{tx.snow}</option>
                  </select>
                </label>
                <label>
                  {tx.windLabel}
                  <input
                    type="number"
                    min="0"
                    max="150"
                    step="1"
                    value={observedWind}
                    onChange={(e) => setObservedWind(e.target.value)}
                    placeholder="8"
                  />
                </label>
              </div>
              <div className="form-label">{tx.feel}</div>
              <div className="comfort-grid">
                {(["cold", "right", "warm"] as const).map((x) => (
                  <button
                    type="button"
                    key={x}
                    className={comfort === x ? "comfort selected" : "comfort"}
                    onClick={() => setComfort(x)}
                  >
                    {comfort === x && <Check size={14} />} {tx[x]}
                  </button>
                ))}
              </div>
              <label className="note-label">
                {tx.note}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={240}
                  rows={2}
                />
              </label>
              <button type="submit" className="button primary form-submit">
                <Plus size={17} />
                {tx.save}
              </button>
            </form>
            <div className="diary-entries">
              <div className="entries-top">
                <span>{tx.study}</span>
                <b>{String(countUniqueDays(entries)).padStart(2, "0")} / 14</b>
              </div>
              {importData && (
                <div className="import-prompt">
                  <b>
                    {importData.length} {tx.found}
                  </b>
                  <div className="import-prompt-actions">
                    <button
                      onClick={() => confirmImport("merge")}
                      className="button primary"
                    >
                      {tx.merge}
                    </button>
                    <button
                      onClick={() => confirmImport("replace")}
                      className="button subdued"
                    >
                      {tx.replace}
                    </button>
                    <button
                      onClick={() => setImportData(null)}
                      className="button subdued"
                    >
                      {tx.cancel}
                    </button>
                  </div>
                </div>
              )}
              {entries.length ? (
                entries.map((item) => (
                  <div className="entry" key={item.id}>
                    <div className="entry-icon">
                      <WeatherIcon code={item.code} size={26} />
                    </div>
                    <div className="entry-content">
                      <b>
                        {item.date} <span>· {f(item.temp)}</span>
                      </b>
                      <small>
                        {tx[item.comfort]} · {item.wind} km/h
                        {item.note ? " · " + item.note : ""}
                      </small>
                    </div>
                    <button
                      aria-label={tx.remove}
                      title={tx.remove}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <BookOpen size={42} strokeWidth={1} />
                  <p>{tx.empty}</p>
                </div>
              )}
              <div className="research-progress">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <b>{tx.researchProgress}</b>
                  <span>{Math.min(countUniqueDays(entries), 14)}/14 {tx.progressDays}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((countUniqueDays(entries) / 14) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="diff-badge neutral">{tx.progressWait}</div>
              </div>
              <div className="diary-warning">{tx.diaryWarning}</div>
            </div>
          </div>
        </section>
        <section className="about-section wrap" id="about">
          <div className="about-mark">✳</div>
          <div>
            <span className="section-number">{tx.researchSection}</span>
            <h2>{tx.facts}</h2>
            <p>{tx.factText}</p>
            <small>{tx.warning}</small>
          </div>
        </section>
      </main>
      <footer className="footer wrap">
        <div className="brand">
          <span className="brand-icon">
            <CloudSun size={20} />
          </span>
          <span>
            weather<span className="accent">&</span>wear
          </span>
        </div>
        <p>{tx.project}</p>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx.credits} ↗
        </a>
      </footer>
    </div>
  );
}
