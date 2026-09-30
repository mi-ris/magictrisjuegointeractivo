
import React, { useState } from 'react';
import { User, Section } from '../types';
import { MAGIC_PATH, MAGIC_ISLANDS, MAGIC_LEVELS, PICTOGRAMS } from '../services/mockData';
import { playPopSound } from './AudioUtils';
import { useSettings } from './SettingsContext';

interface Props {
  user: User;
  setSection: (s: Section) => void;
  onSelectCard: (index: number) => void;
}

const IslandIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const icons: Record<string, React.ReactElement> = {
    sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    family: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M14 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"/></svg>,
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    paw: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.32 4.46 16.5a3.5 3.5 0 0 1 1.18-6.6"/></svg>,
    tree: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L7 9h3v4h4V9h3z M10 13v8 M14 13v8"/></svg>,
    gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  };
  return icons[name] || icons.sun;
};

const Hub: React.FC<Props> = ({ user, onSelectCard }) => {
  const [adultUnlock, setAdultUnlock] = useState(false);
  const [showAdultPanel, setShowAdultPanel] = useState(false);
  const { settings, updateSettings, getSessionMinutes, showBreakReminder, dismissBreakReminder } = useSettings();

  const handleCardSelect = (index: number) => {
    if (settings.soundEnabled) playPopSound();
    onSelectCard(index);
  };

  const cardIdToIndex = React.useMemo(() => {
    const map: Record<string, number> = {};
    MAGIC_PATH.forEach((card, idx) => { map[card.id] = idx; });
    return map;
  }, []);

  const progressPercent = Math.round((user.progressIndex / MAGIC_PATH.length) * 100);

  const isCardUnlocked = (cardIndex: number) => adultUnlock || cardIndex <= user.progressIndex;
  const isCardNext = (cardIndex: number) => !adultUnlock && cardIndex === user.progressIndex;

  const totalLevelNumber = (islandIdx: number, cardIdx: number) => {
    let count = 0;
    for (let i = 0; i < islandIdx; i++) count += MAGIC_LEVELS[i].items.length;
    return count + cardIdx + 1;
  };

  const reduceAnim = settings.reduceAnimations;

  const ZIGZAG = [
    { x: '15%', y: 0 },
    { x: '62%', y: 0 },
    { x: '20%', y: 0 },
    { x: '65%', y: 0 },
    { x: '35%', y: 0 },
    { x: '58%', y: 0 },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">

      <main className="flex-1 pt-20 sm:pt-24 pb-32 px-3 max-w-lg mx-auto w-full">

        {/* Encabezado con Gumi */}
        <div className="flex flex-col items-center mb-3 text-center">
          <img src="/gumi-avatar.webp" alt="Gumi" className={`w-14 h-14 sm:w-16 sm:h-16 mb-0.5 ${!reduceAnim ? 'floating-gumi' : ''} select-none object-contain`} />
          <h2 className="text-2xl sm:text-4xl font-magic text-indigo-700 drop-shadow-[0_3px_8px_rgba(255,255,255,0.8)] uppercase tracking-tighter">
            ¡Hola, {user.nickname}!
          </h2>
          <p className="text-[10px] sm:text-xs text-indigo-500 font-bold uppercase tracking-widest">
            Toca las nubes y aprende palabras
          </p>
        </div>

        {/* Botón adulto */}
        <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50">
          <button
            onClick={() => setShowAdultPanel(true)}
            className="bg-white/80 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border-2 border-indigo-200 hover:bg-white transition-all active:scale-90 shadow-md"
            title="Panel de adulto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

        {/* Camino de nubes */}
        <div className="relative mt-2">
          {MAGIC_ISLANDS.map((island, islandIdx) => {
            const islandCards = island.cardIds.map(id => MAGIC_PATH[cardIdToIndex[id]]);
            const firstCardIdx = cardIdToIndex[island.cardIds[0]];
            const lastCardIdx = cardIdToIndex[island.cardIds[island.cardIds.length - 1]];
            const islandUnlocked = isCardUnlocked(firstCardIdx);
            const islandComplete = user.progressIndex > lastCardIdx;

            return (
              <div key={island.id} className="relative mb-2">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <IslandIcon name={island.islandIcon} className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  <h3 className={`text-xs sm:text-sm font-magic uppercase tracking-wider ${islandUnlocked ? 'text-indigo-700' : 'text-indigo-300'}`}>
                    {island.name}
                  </h3>
                  {islandComplete && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>

                <div className="relative" style={{ minHeight: `${islandCards.length * 78}px` }}>
                  {islandCards.map((card, cardIdx) => {
                    const globalIdx = cardIdToIndex[card.id];
                    const unlocked = isCardUnlocked(globalIdx);
                    const isNext = isCardNext(globalIdx);
                    const completed = user.progressIndex > globalIdx;
                    const levelNum = totalLevelNumber(islandIdx, cardIdx);
                    const pos = ZIGZAG[cardIdx % ZIGZAG.length];
                    const pictInfo = PICTOGRAMS[card.value];

                    return (
                      <div
                        key={card.id}
                        className="absolute transition-all duration-300"
                        style={{ left: pos.x, top: `${cardIdx * 76}px`, width: '90px' }}
                      >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                          <div className="bg-indigo-500 text-white text-[10px] font-magic w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                            {levelNum}
                          </div>
                        </div>

                        <button
                          disabled={!unlocked}
                          onClick={() => handleCardSelect(globalIdx)}
                          className={`relative w-[90px] h-[68px] flex flex-col items-center justify-center transition-all duration-300 group ${
                            unlocked ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed'
                          }`}
                        >
                          <div className={`absolute inset-0 rounded-[2rem] rounded-tr-md transition-all ${
                            unlocked
                              ? isNext
                                ? `bg-white shadow-[0_0_20px_rgba(99,102,241,0.5)] ${!reduceAnim ? 'animate-pulse' : ''} ring-3 ring-amber-300 scale-110`
                                : completed
                                  ? 'bg-white shadow-lg ring-2 ring-emerald-300'
                                  : 'bg-white/95 shadow-lg'
                              : 'bg-white/40 shadow-sm'
                          }`}>
                            <div className={`absolute -top-2 left-3 w-6 h-6 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                            <div className={`absolute -top-1 right-4 w-5 h-5 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                          </div>

                          <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                            {unlocked ? (
                              <>
                                {pictInfo?.imageUrl && (
                                  <img
                                    src={pictInfo.imageUrl}
                                    alt={card.pictogramWord}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                    loading="lazy"
                                  />
                                )}
                                <span className="text-[9px] font-magic text-indigo-700 uppercase leading-none mt-0.5">
                                  {card.value.length > 5 ? card.value.slice(0, 4) + '…' : card.value}
                                </span>
                              </>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            )}
                          </div>

                          {completed && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md z-20">
                              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          )}

                          {isNext && (
                            <div className={`absolute -bottom-1 -right-1 bg-amber-400 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md z-20 ${!reduceAnim ? 'animate-bounce' : ''}`}>
                              <svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Nube final */}
          <div className="flex justify-center mt-2 mb-4">
            <div className="relative">
              <div className="absolute -top-2 left-3 w-6 h-6 rounded-full bg-white/80" />
              <div className="absolute -top-1 right-4 w-5 h-5 rounded-full bg-white/80" />
              <div className="bg-white/80 rounded-[2rem] rounded-tr-md px-6 py-4 shadow-md flex flex-col items-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                <span className="text-[10px] font-magic text-indigo-500 uppercase">¡Meta!</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de progreso flotante */}
      <footer className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 z-40 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border-2 border-indigo-200 shadow-lg flex items-center gap-2.5 w-full max-w-xs pointer-events-auto">
          <img src="/gumi-avatar.webp" alt="Gumi" className={`w-7 h-7 sm:w-8 sm:h-8 select-none object-contain ${!reduceAnim ? 'floating-gumi' : ''}`} />
          <div className="flex-1">
            <div className="w-full bg-indigo-100 h-2 sm:h-2.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between mt-0.5 px-0.5">
              <p className="text-[7px] sm:text-[9px] font-magic text-indigo-500 uppercase tracking-wider">{progressPercent}%</p>
              <p className="text-[7px] sm:text-[9px] font-bold text-indigo-400">{getSessionMinutes()} min</p>
            </div>
          </div>
          {settings.soundEnabled ? (
            <button onClick={() => updateSettings({ soundEnabled: false })} className="p-0.5" title="Silenciar">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            </button>
          ) : (
            <button onClick={() => updateSettings({ soundEnabled: true })} className="p-0.5 opacity-40" title="Activar sonido">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            </button>
          )}
        </div>
      </footer>

      {/* Panel de adulto */}
      {showAdultPanel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setShowAdultPanel(false)}>
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xs w-full shadow-2xl border-4 border-indigo-200 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-magic text-indigo-800 uppercase text-center mb-3">Panel de Adulto</h3>

            <div className="bg-indigo-50 rounded-2xl p-3 mb-3">
              <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">Progreso de {user.nickname}</h4>
              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Niveles</span><span className="font-bold">{user.progressIndex} / {MAGIC_PATH.length}</span></div>
              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Puntos</span><span className="font-bold">{user.score}</span></div>
              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Racha</span><span className="font-bold">{user.streak} días</span></div>
              <div className="flex justify-between text-xs text-gray-600"><span>Tiempo</span><span className="font-bold">{getSessionMinutes()} min</span></div>
            </div>

            <div className="space-y-2 mb-3">
              <h4 className="text-xs font-bold text-indigo-600 uppercase">Ajustes</h4>
              <label className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 cursor-pointer">
                <span className="text-sm text-gray-700">Sonidos</span>
                <input type="checkbox" checked={settings.soundEnabled} onChange={e => updateSettings({ soundEnabled: e.target.checked })} className="w-5 h-5" />
              </label>
              <label className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 cursor-pointer">
                <span className="text-sm text-gray-700">Voz automática</span>
                <input type="checkbox" checked={settings.autoPlayVoice} onChange={e => updateSettings({ autoPlayVoice: e.target.checked })} className="w-5 h-5" />
              </label>
              <label className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 cursor-pointer">
                <span className="text-sm text-gray-700">Reducir animaciones</span>
                <input type="checkbox" checked={settings.reduceAnimations} onChange={e => updateSettings({ reduceAnimations: e.target.checked })} className="w-5 h-5" />
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5">
                <span className="text-sm text-gray-700">Velocidad de voz</span>
                <select value={settings.speechRate} onChange={e => updateSettings({ speechRate: e.target.value as 'slow' | 'normal' })} className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                  <option value="slow">Lenta</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => { setAdultUnlock(!adultUnlock); if (settings.soundEnabled) playPopSound(); }}
              className={`w-full py-2.5 rounded-xl font-bold uppercase text-sm shadow-md active:scale-95 transition-all mb-2 ${adultUnlock ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-indigo-500 text-white'}`}
            >
              {adultUnlock ? 'Niveles desbloqueados' : 'Desbloquear todos'}
            </button>
            <button onClick={() => setShowAdultPanel(false)} className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-xl font-bold uppercase text-sm active:scale-95 transition-all">Cerrar</button>
          </div>
        </div>
      )}

      {/* Aviso de descanso */}
      {showBreakReminder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[310] flex items-center justify-center p-4" onClick={dismissBreakReminder}>
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl border-4 border-indigo-200 text-center" onClick={e => e.stopPropagation()}>
            <img src="/gumi-avatar.webp" alt="Gumi" className="w-12 h-12 mx-auto mb-3 object-contain" />
            <h3 className="text-lg font-magic text-indigo-700 uppercase mb-2">¡Hora de descansar!</h3>
            <p className="text-sm text-gray-500 mb-4">Llevas {getSessionMinutes()} minutos. ¿Hacemos una pausa?</p>
            <button onClick={dismissBreakReminder} className="w-full bg-indigo-500 text-white py-2.5 rounded-xl font-bold uppercase text-sm shadow-md active:scale-95 transition-all">¡Descansar!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hub;
