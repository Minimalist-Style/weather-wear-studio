import { useState, useEffect, useRef } from 'react';
import './styles.css';

const SCENARIOS = [
  { id: 'ayaz', label: 'Аяз', temp: -16, iconUrl: '/icons/weather-snow.png' },
  { id: 'jel', label: 'Жел', temp: 8, iconUrl: '/icons/weather-wind.png' },
  { id: 'jaubyir', label: 'Жаңбыр', temp: 12, iconUrl: '/icons/weather-rain.png' },
  { id: 'ystyq', label: 'Ыстық', temp: 28, iconUrl: '/icons/weather-sun.png' },
];

const CONDITIONS = [
  { id: 'ashyq', label: 'Ашық', iconUrl: '/icons/weather-sun.png' },
  { id: 'bultty', label: 'Бұлтты', iconUrl: '/icons/weather-cloud.png' },
  { id: 'jaubyir', label: 'Жаңбыр', iconUrl: '/icons/weather-rain.png' },
  { id: 'qar', label: 'Қар', iconUrl: '/icons/weather-snow.png' },
];

interface Garment {
  id: string;
  nameKZ: string;
  iconUrl: string;
  ayaz: boolean;
  jel: boolean;
  jaubyir: boolean;
  ystyq: boolean;
  ashyq: boolean;
  bultty: boolean;
  qar: boolean;
}

const GARMENTS: Garment[] = [
  { id: 'coat', nameKZ: 'Пальто', iconUrl: '/icons/coat.png', ayaz: true, jel: true, jaubyir: false, ystyq: false, ashyq: false, bultty: true, qar: true },
  { id: 'jacket', nameKZ: 'Куртка', iconUrl: '/icons/jacket.png', ayaz: true, jel: true, jaubyir: true, ystyq: false, ashyq: false, bultty: true, qar: true },
  { id: 'hoodie', nameKZ: 'Худи', iconUrl: '/icons/hoodie.png', ayaz: true, jel: true, jaubyir: false, ystyq: false, ashyq: true, bultty: true, qar: false },
  { id: 'tshirt', nameKZ: 'Футболка', iconUrl: '/icons/tshirt.png', ayaz: false, jel: false, jaubyir: false, ystyq: true, ashyq: true, bultty: false, qar: false },
  { id: 'boots', nameKZ: 'Ботинки', iconUrl: '/icons/boots.png', ayaz: true, jel: false, jaubyir: true, ystyq: false, ashyq: false, bultty: true, qar: true },
  { id: 'shoes', nameKZ: 'Кроссовки', iconUrl: '/icons/shoes.png', ayaz: false, jel: true, jaubyir: false, ystyq: true, ashyq: true, bultty: false, qar: false },
  { id: 'gloves', nameKZ: 'Перчатки', iconUrl: '/icons/gloves.png', ayaz: true, jel: true, jaubyir: false, ystyq: false, ashyq: false, bultty: false, qar: true },
  { id: 'scarf', nameKZ: 'Шарф', iconUrl: '/icons/scarf.png', ayaz: true, jel: true, jaubyir: false, ystyq: false, ashyq: false, bultty: true, qar: true },
  { id: 'sweater', nameKZ: 'Свитер', iconUrl: '/icons/sweater.png', ayaz: true, jel: true, jaubyir: false, ystyq: false, ashyq: false, bultty: true, qar: true },
  { id: 'umbrella', nameKZ: 'Зонт', iconUrl: '/icons/umbrella.png', ayaz: false, jel: false, jaubyir: true, ystyq: false, ashyq: false, bultty: true, qar: false },
  { id: 'cap', nameKZ: 'Кепка', iconUrl: '/icons/cap.png', ayaz: false, jel: false, jaubyir: false, ystyq: true, ashyq: true, bultty: false, qar: false },
  { id: 'water', nameKZ: 'Вода', iconUrl: '/icons/water.png', ayaz: false, jel: true, jaubyir: false, ystyq: true, ashyq: true, bultty: false, qar: false },
];

// Звуковые эффекты (короткие mp3)
const SOUND_HOVER = new Audio('/sounds/ui-hover.mp3');
const SOUND_CLICK = new Audio('/sounds/ui-click.mp3');
const SOUND_SAVE = new Audio('/sounds/ui-save.mp3');
const SOUND_AMBIENT = new Audio('/sounds/ambient-wind.mp3');

// Настройки громкости
SOUND_HOVER.volume = 0.15;
SOUND_CLICK.volume = 0.25;
SOUND_SAVE.volume = 0.35;
SOUND_AMBIENT.volume = 0.08;
SOUND_AMBIENT.loop = true;

function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ayaz');
  const [selectedConditionId, setSelectedConditionId] = useState<string>('ashyq');
  const [journalText, setJournalText] = useState('');
  const [journalEntries, setJournalEntries] = useState<{ date: string; text: string }[]>([]);
  const [portalMouse, setPortalMouse] = useState({ x: 0, y: 0 });
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(SOUND_AMBIENT);

  const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId)!;
  const selectedCondition = CONDITIONS.find(c => c.id === selectedConditionId)!;

  useEffect(() => {
    const saved = localStorage.getItem('weather-journal-entries');
    if (saved) {
      try {
        setJournalEntries(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!portalRef.current) return;
      const rect = portalRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      setPortalMouse({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Включение фонового эмбиента при первом взаимодействии
  useEffect(() => {
    const enableAmbient = () => {
      if (!ambientEnabled && ambientRef.current) {
        ambientRef.current.play().catch(() => {});
        setAmbientEnabled(true);
      }
    };
    window.addEventListener('click', enableAmbient, { once: true });
    window.addEventListener('touchstart', enableAmbient, { once: true });
    return () => {
      window.removeEventListener('click', enableAmbient);
      window.removeEventListener('touchstart', enableAmbient);
    };
  }, [ambientEnabled]);

  const playHover = () => {
    SOUND_HOVER.currentTime = 0;
    SOUND_HOVER.play().catch(() => {});
  };

  const playClick = () => {
    SOUND_CLICK.currentTime = 0;
    SOUND_CLICK.play().catch(() => {});
  };

  const playSave = () => {
    SOUND_SAVE.currentTime = 0;
    SOUND_SAVE.play().catch(() => {});
  };

  const matchingGarments = GARMENTS.filter(g => {
    const scenarioMatch =
      (selectedScenario.id === 'ayaz' && g.ayaz) ||
      (selectedScenario.id === 'jel' && g.jel) ||
      (selectedScenario.id === 'jaubyir' && g.jaubyir) ||
      (selectedScenario.id === 'ystyq' && g.ystyq);
    const conditionMatch =
      (selectedCondition.id === 'ashyq' && g.ashyq) ||
      (selectedCondition.id === 'bultty' && g.bultty) ||
      (selectedCondition.id === 'jaubyir' && g.jaubyir) ||
      (selectedCondition.id === 'qar' && g.qar);
    return scenarioMatch && conditionMatch;
  });

  const getResearchResult = (temp: number) => {
    if (temp <= -10) return 'Қалың пальто, жылы ботинки, қолғап және шарф ұсынылады.';
    if (temp <= 0) return 'Қалың куртка немесе пальто, ботинки, қолғап қажет.';
    if (temp <= 10) return 'Орташа куртка немесе худи, аяққа ботинки немесе кроссовки.';
    if (temp <= 17) return 'Худи немесе жеңіл куртка, кроссовки жеткілікті.';
    if (temp <= 24) return 'Жеңіл киім, футболка, кроссовки немесе аяқ киім.';
    return 'Жеңіл футболка, шорты, су ішу ұсынылады.';
  };

  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    const newEntry = { date: new Date().toLocaleString('kk-KZ'), text: journalText };
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('weather-journal-entries', JSON.stringify(updated));
    setJournalText('');
    playSave(); // Звук сохранения
  };

  const isCold = selectedScenario.temp <= 0;
  const isRain = selectedScenario.id === 'jaubyir' || selectedCondition.id === 'jaubyir';
  const isHot = selectedScenario.temp >= 25;

  return (
    <div className={`app theme-${selectedScenario.id}`}>
      <section className="intro wrap">
        <div className="intro-left">
          <div className="badge-row">
            <span className="badge badge-1">Жаңа</span>
            <span className="badge badge-2">Тәжірибелік зерттеу</span>
          </div>
          <h1 className="intro-title">Ауа райына байланысты киім таңдау</h1>
          <p className="intro-subtitle">Бұл зерттеу жұмысы ауа райына байланысты киім таңдауға арналған.</p>
          <div className="cta-row">
            <button className="btn btn-primary" onMouseEnter={playHover} onClick={playClick}>Қосымшаны ашу</button>
            <button className="btn btn-secondary" onMouseEnter={playHover} onClick={playClick}>Зерттеуді көру</button>
          </div>
        </div>
        <div className="intro-right">
          <div
            ref={portalRef}
            className="intro-art"
            style={{
              '--mouse-x': portalMouse.x,
              '--mouse-y': portalMouse.y,
              transform: `perspective(800px) rotateY(${portalMouse.x * 8}deg) rotateX(${-portalMouse.y * 8}deg)`,
            } as React.CSSProperties}
          >
            <div className={`art-sun ${isHot ? 'pulse-hot' : ''}`} />
            <div className="art-cloud a" />
            <div className="art-cloud b" />
            {isRain && <div className="art-rain" />}
            <div className="art-floor" />
            <div className={`art-figure ${isCold ? 'frost-glow' : ''}`}>
              <div className="figure-hood" />
              <div className="figure-body" />
              {isRain && <div className="figure-umbrella" />}
              {isCold && <div className="breath-vapor" />}
            </div>
          </div>
        </div>
      </section>

      <section className="lab wrap">
        <h2 className="section-title">Зертханалық тәжірибе</h2>
        <div className="scenarios-row">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              className={`scenario-btn ${selectedScenarioId === s.id ? 'active' : ''}`}
              onMouseEnter={playHover}
              onClick={() => {
                playClick();
                setSelectedScenarioId(s.id);
              }}
            >
              <img src={s.iconUrl} alt="" className="scenario-icon" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="lab-main">
          <div className="lab-left">
            <h3 className="lab-subtitle">Киімдер</h3>
            <div className="garments-grid">
              {matchingGarments.map(g => (
                <div key={g.id} className="garment-card" onMouseEnter={playHover}>
                  <img src={g.iconUrl} alt="" className="garment-img" />
                  <span>{g.nameKZ}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lab-right">
            <h3 className="lab-subtitle">Ауа райы жағдайы</h3>
            <div className="condition-grid">
              {CONDITIONS.map(c => (
                <button
                  key={c.id}
                  className={`condition-btn ${selectedConditionId === c.id ? 'active' : ''}`}
                  onMouseEnter={playHover}
                  onClick={() => {
                    playClick();
                    setSelectedConditionId(c.id);
                  }}
                >
                  <img src={c.iconUrl} alt="" className="condition-img" />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
            <div className="research-box">
              <h4>Зерттеу нәтижесі</h4>
              <p>{getResearchResult(selectedScenario.temp)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="journal wrap">
        <h2 className="section-title">Күнделік</h2>
        <div className="journal-form">
          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="Бүгін қандай киім кидің?"
            rows={3}
            onFocus={playHover}
          />
          <button className="btn btn-primary" onMouseEnter={playHover} onClick={handleSaveJournal}>Сақтау</button>
        </div>
        <div className="journal-entries">
          {journalEntries.map((entry, i) => (
            <div key={i} className="journal-entry" onMouseEnter={playHover}>
              <div className="entry-date">{entry.date}</div>
              <div className="entry-text">{entry.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
