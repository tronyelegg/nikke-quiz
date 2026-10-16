"use client";

import { useState, useMemo, useEffect } from 'react';
import nikkesData from '../src/data/nikkes.json';

type GameState = 'menu' | 'playing';
type GroupMode = 'company' | 'burst' | 'element' | 'release' | 'weapon';
type Language = 'ko' | 'en' | 'ja';

const uiText = {
  ko: {
    title: "니케 퀴즈", startAll: "모든 니케 맞추기", selectMode: "분류 방식 선택",
    modes: { company: "기업별", burst: "버스트별", element: "우월 코드별", release: "출시 연도별", weapon: "무기군별" },
    giveUp: "포기 / 메뉴로", inputLabel: "니케 이름:", placeholder: "이름을 입력하세요...",
    dark: "다크모드", light: "라이트모드", audioOn: "소리 ON", audioOff: "소리 OFF", shadowOn: "실루엣 ON", shadowOff: "실루엣 OFF",
  },
  en: {
    title: "Nikke Quiz", startAll: "Name All Nikkes", selectMode: "Select Category",
    modes: { company: "By Company", burst: "By Burst", element: "By Element", release: "By Release", weapon: "By Weapon" },
    giveUp: "Give Up / Menu", inputLabel: "Nikke Name:", placeholder: "Type a name...",
    dark: "Dark Mode", light: "Light Mode", audioOn: "Audio ON", audioOff: "Audio OFF", shadowOn: "Shadow ON", shadowOff: "Shadow OFF",
  },
  ja: {
    title: "ニケクイズ", startAll: "全ニケを当てる", selectMode: "カテゴリ選択",
    modes: { company: "企業別", burst: "バースト別", element: "コード別", release: "実装年別", weapon: "武器종별" },
    giveUp: "諦める / メニュー", inputLabel: "ニケの名前:", placeholder: "名前を入力...",
    dark: "ダーク", light: "ライト", audioOn: "音声 ON", audioOff: "音声 OFF", shadowOn: "シルエット ON", shadowOff: "シルエット OFF",
  }
};

const translateTerm = (term: string, lang: Language) => {
  if (!term) return 'Unknown';
  if (term.includes('Burst')) return term.replace('Burst', lang === 'ko' ? '버스트' : lang === 'ja' ? 'バースト' : 'Burst');
  if (term.includes('Release')) return term.replace('Release', lang === 'ko' ? '년 출시' : lang === 'ja' ? '年 実装' : ' Release');

  const dict: Record<string, any> = {
    "ELYSION": { ko: "엘리시온", en: "Elysion", ja: "エリシオン" },
    "MISSILIS": { ko: "미실리스", en: "Missilis", ja: "ミシリス" },
    "TETRA": { ko: "테트라", en: "Tetra", ja: "テトラ" },
    "PILGRIM": { ko: "필그림", en: "Pilgrim", ja: "ピルグリム" },
    "ABNORMAL": { ko: "어브노멀", en: "Abnormal", ja: "アブノーマル" },
    "Fire": { ko: "작열 (Fire)", en: "Fire", ja: "灼熱 (Fire)" },
    "Water": { ko: "수냉 (Water)", en: "Water", ja: "水冷 (Water)" },
    "Wind": { ko: "풍압 (Wind)", en: "Wind", ja: "風圧 (Wind)" },
    "Iron": { ko: "철갑 (Iron)", en: "Iron", ja: "鉄甲 (Iron)" },
    "Electric": { ko: "전격 (Electric)", en: "Electric", ja: "電撃 (Electric)" },
    "SG": { ko: "샷건 (SG)", en: "Shotgun (SG)", ja: "ショットガン (SG)" },
    "SMG": { ko: "기관단총 (SMG)", en: "Sub Machine Gun (SMG)", ja: "サブマシンガン (SMG)" },
    "AR": { ko: "소총 (AR)", en: "Assault Rifle (AR)", ja: "アサルトライフル (AR)" },
    "MG": { ko: "머신건 (MG)", en: "Machine Gun (MG)", ja: "マシンガン (MG)" },
    "SR": { ko: "저격소총 (SR)", en: "Sniper Rifle (SR)", ja: "スナイパーライフル (SR)" },
    "RL": { ko: "런처 (RL)", en: "Rocket Launcher (RL)", ja: "ランチャー (RL)" }
  };

  const foundKey = Object.keys(dict).find(k => k.toLowerCase() === term.toLowerCase());
  if (foundKey) return dict[foundKey][lang];
  return term;
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [groupMode, setGroupMode] = useState<GroupMode>('company');
  const [inputValue, setInputValue] = useState("");
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isShadowOn, setIsShadowOn] = useState(false);
  const [lang, setLang] = useState<Language>('ko');

  const t = uiText[lang];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const startGame = (mode: GroupMode) => {
    setGroupMode(mode);
    setAnsweredIds([]); 
    setInputValue("");
    setGameState('playing');
  };

  const groupedNikkes = useMemo(() => {
    let sortedNikkes = [...nikkesData].sort((a: any, b: any) => {
      if (a.releaseDate && b.releaseDate) return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      return parseInt(a.id) - parseInt(b.id);
    });

    const groups = sortedNikkes.reduce((acc: Record<string, typeof nikkesData>, nikke: any) => {
      let key = '기타';
      if (groupMode === 'company') key = nikke.company || '기타';
      else if (groupMode === 'burst') {
        const burstNum = String(nikke.burst).replace(/[^0-9]/g, '');
        key = burstNum ? `${burstNum} Burst` : 'ALL 버스트';
      }
      else if (groupMode === 'element') key = nikke.element || '기타';
      else if (groupMode === 'release') key = nikke.releaseDate ? `${nikke.releaseDate.substring(0, 4)} Release` : 'Unknown';
      else if (groupMode === 'weapon') key = nikke.weaponType || '기타';

      if (!acc[key]) acc[key] = [];
      acc[key].push(nikke);
      return acc;
    }, {});

    return Object.entries(groups).sort(([keyA], [keyB]) => {
      return keyA.localeCompare(keyB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [groupMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);

    const normalizedText = text.trim().replace(/\s+/g, '').toLowerCase();
    if (!normalizedText) return;

    const matchedNikke = nikkesData.find((nikke: any) => {
      if (answeredIds.includes(nikke.id)) return false;
      const namesToCheck = [nikke.name, nikke.nameEn || "", nikke.nameJa || ""].map(n => n.replace(/\s+/g, '').toLowerCase());
      if (namesToCheck.includes(normalizedText)) return true;
      if (nikke.aliases && nikke.aliases.some((alias: any) => alias.text && alias.text.replace(/\s+/g, '').toLowerCase() === normalizedText)) return true;
      return false;
    });

    if (matchedNikke) {
      setAnsweredIds(prev => [...prev, matchedNikke.id]);
      setInputValue(""); 
      if (isAudioOn && matchedNikke.sound) {
        const audio = new Audio(`/${matchedNikke.sound}`);
        audio.play().catch(err => console.error("Audio error:", err));
      }
    }
  };

  const SettingsPanel = () => (
    <div className="flex flex-wrap items-center gap-2 bg-white/40 dark:bg-black/30 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/40 dark:border-gray-700 shadow-sm transition-colors">
      <div className="flex items-center gap-2 text-xs font-black bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md shadow-sm transition-colors">
        <button onClick={() => setLang('ko')} className={`transition-colors ${lang === 'ko' ? "text-green-600 dark:text-green-400" : "opacity-40 hover:opacity-80"}`}>KR</button>
        <span className="opacity-20">|</span>
        <button onClick={() => setLang('en')} className={`transition-colors ${lang === 'en' ? "text-green-600 dark:text-green-400" : "opacity-40 hover:opacity-80"}`}>EN</button>
        <span className="opacity-20">|</span>
        <button onClick={() => setLang('ja')} className={`transition-colors ${lang === 'ja' ? "text-green-600 dark:text-green-400" : "opacity-40 hover:opacity-80"}`}>JP</button>
      </div>
      <button onClick={toggleDarkMode} className="bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md font-bold text-xs transition-colors shadow-sm whitespace-nowrap">
        {isDarkMode ? t.light : t.dark}
      </button>
      <button onClick={() => setIsAudioOn(!isAudioOn)} className="bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md font-bold text-xs transition-colors shadow-sm whitespace-nowrap">
        {isAudioOn ? t.audioOn : t.audioOff}
      </button>
      <button onClick={() => setIsShadowOn(!isShadowOn)} className="bg-white/80 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md font-bold text-xs transition-colors shadow-sm whitespace-nowrap">
        {isShadowOn ? t.shadowOn : t.shadowOff}
      </button>
    </div>
  );

  return (
    <>
      {gameState === 'menu' ? (
        <main className="min-h-screen w-full bg-[#4a5c39] dark:bg-gray-900 transition-colors duration-300 flex flex-col p-4 md:p-8 font-sans">
          <div className="w-full flex justify-end mb-8 md:mb-16">
            <SettingsPanel />
          </div>
          <div className="flex flex-col items-center justify-center grow max-w-2xl mx-auto w-full pb-20">
            <h1 className="text-5xl font-black text-white mb-12 drop-shadow-lg tracking-wider text-center">{t.title}</h1>
            <div className="flex flex-col items-center space-y-6 w-full">
              <button onClick={() => startGame('company')} className="w-64 py-6 bg-[#8ab661] hover:bg-[#9ccb6f] dark:bg-[#5b803a] dark:hover:bg-[#6c9846] text-white font-bold text-2xl transition-all shadow-lg hover:-translate-y-1 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md">
                {t.startAll}
              </button>
              <div className="w-full border-t border-white/20 my-4"></div>
              <h2 className="text-white/80 font-bold mb-2">{t.selectMode}</h2>
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {(Object.keys(t.modes) as GroupMode[]).map((mode) => (
                  <button key={mode} onClick={() => startGame(mode)} className="py-4 px-6 min-w-[120px] bg-[#8ab661] hover:bg-[#9ccb6f] dark:bg-[#5b803a] dark:hover:bg-[#6c9846] text-white font-bold text-lg transition-all shadow hover:shadow-lg rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md">
                    {t.modes[mode as keyof typeof t.modes]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="min-h-screen bg-[#eaf4e0] dark:bg-gray-800 transition-colors duration-300 p-4 md:p-8 font-sans">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 mb-8 sticky top-4 z-10 bg-[#eaf4e0]/90 dark:bg-gray-800/90 p-2 rounded-xl backdrop-blur-sm shadow-sm md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none md:p-0 md:shadow-none transition-colors">
            <button onClick={() => setGameState('menu')} className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 text-white px-5 py-2.5 rounded-lg shadow-md font-bold text-sm transition-colors whitespace-nowrap shrink-0">
              {t.giveUp}
            </button>
            <div className="bg-[#8ab661] dark:bg-[#5b803a] text-white px-6 py-2.5 rounded-lg shadow-md font-bold text-lg whitespace-nowrap shrink-0 transition-colors">
              {answeredIds.length} / {nikkesData.length}
            </div>
            <div className="bg-[#4a5c39] dark:bg-gray-900 text-white/90 px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center whitespace-nowrap shadow-md shrink-0 transition-colors">
              {t.modes[groupMode as keyof typeof t.modes]}
            </div>
            <div className="flex bg-[#8ab661] dark:bg-[#5b803a] rounded-lg shadow-md overflow-hidden border-2 border-[#8ab661] dark:border-[#5b803a] grow min-w-[250px] transition-colors">
              <div className="bg-[#4a5c39] dark:bg-gray-900 text-white px-4 py-3 font-bold flex items-center whitespace-nowrap transition-colors">
                {t.inputLabel}
              </div>
              <input type="text" value={inputValue} onChange={handleInputChange} placeholder={t.placeholder} className="px-4 py-3 w-full outline-none font-bold text-gray-800 dark:text-white dark:bg-gray-700 transition-colors" autoFocus />
            </div>
            <div className="shrink-0 md:ml-auto w-full md:w-auto flex justify-center md:justify-end mt-2 md:mt-0">
              <SettingsPanel />
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-6">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {groupedNikkes.map(([groupTitle, nikkes]) => (
                <div key={groupTitle} className="break-inside-avoid bg-white dark:bg-gray-900 rounded-xl p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                  <h2 className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-bold border-b dark:border-gray-700 pb-1 flex justify-between transition-colors">
                    <span>{translateTerm(groupTitle, lang)}</span>
                    <span className="text-gray-400 text-xs font-normal">({nikkes.filter((n:any)=>answeredIds.includes(n.id)).length}/{nikkes.length})</span>
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {nikkes.map((nikke: any) => {
                      const isAnswered = answeredIds.includes(nikke.id);
                      const displayName = lang === 'en' && nikke.nameEn ? nikke.nameEn : lang === 'ja' && nikke.nameJa ? nikke.nameJa : nikke.name;
                      return (
                        <div key={nikke.id} className="w-10 h-10 md:w-12 md:h-12 relative shrink-0" title={isAnswered ? displayName : "???"}>
                          {isAnswered ? (
                            <img src={`/${nikke.image}`} alt={displayName} className="w-full h-full object-cover rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm animate-fade-in transition-colors" />
                          ) : isShadowOn ? (
                            // 💡 [수정] 다크모드일 때 검정 대신 흰색반전(dark:invert) + 투명도 조절로 회색빛 고대비 실루엣 처리
                            <img 
                              src={`/${nikke.image}`} 
                              alt="silhouette" 
                              className="w-full h-full object-cover rounded border border-gray-200 dark:border-gray-700 brightness-0 opacity-25 dark:invert dark:opacity-[0.35] transition-colors" 
                            />
                          ) : (
                            <div className="w-full h-full bg-[#f1f1f1] dark:bg-gray-800 rounded border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center opacity-70 transition-colors">
                              <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-colors"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </>
  );
}