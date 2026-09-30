
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

  // Posiciones en zigzag para el camino sobre nubes
  const ZIGZAG = [
    { x: '15%', y: 0 },
    { x: '65%', y: 0 },
    { x: '20%', y: 0 },
    { x: '70%', y: 0 },
    { x: '35%', y: 0 },
    { x: '60%', y: 0 },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">

      <main className="flex-1 pt-20 sm:pt-24 pb-32 px-3 max-w-lg mx-auto w-full">

        {/* Encabezado con Gumi */}
        <div className="flex flex-col items-center mb-3 text-center">
          <div className={`text-5xl mb-0.5 ${!reduceAnim ? 'floating-gumi' : ''} select-none`}>👾</div>
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
            className="bg-white/80 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border-2 border-indigo-200 text-base sm:text-lg hover:bg-white transition-all active:scale-90 shadow-md"
            title="Panel de adulto"
          >
            ⚙️
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
                {/* Título del mundo - compacto */}
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="text-xl sm:text-2xl">{island.islandIcon}</div>
                  <h3 className={`text-xs sm:text-sm font-magic uppercase tracking-wider ${islandUnlocked ? 'text-indigo-700' : 'text-indigo-300'}`}>
                    {island.name}
                  </h3>
                  {islandComplete && <span className="text-[10px] text-emerald-500 font-bold">✓</span>}
                </div>

                {/* Niveles sobre nubes en zigzag */}
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
                        style={{
                          left: pos.x,
                          top: `${cardIdx * 76}px`,
                          width: '90px',
                        }}
                      >
                        {/* Número de nivel */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                          <div className="bg-indigo-500 text-white text-[10px] font-magic w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white">
                            {levelNum}
                          </div>
                        </div>

                        {/* Nube-nivel */}
                        <button
                          disabled={!unlocked}
                          onClick={() => handleCardSelect(globalIdx)}
                          className={`relative w-[90px] h-[68px] flex flex-col items-center justify-center transition-all duration-300 group ${
                            unlocked ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed'
                          }`}
                        >
                          {/* Forma de nube */}
                          <div className={`absolute inset-0 rounded-[2rem] rounded-tr-md transition-all ${
                            unlocked
                              ? isNext
                                ? `bg-white shadow-[0_0_20px_rgba(99,102,241,0.5)] ${!reduceAnim ? 'animate-pulse' : ''} ring-3 ring-amber-300 scale-110`
                                : completed
                                  ? 'bg-white shadow-lg ring-2 ring-emerald-300'
                                  : 'bg-white/95 shadow-lg'
                              : 'bg-white/40 shadow-sm'
                          }`}>
                            {/* Picos de nube */}
                            <div className={`absolute -top-2 left-3 w-6 h-6 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                            <div className={`absolute -top-1 right-4 w-5 h-5 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full ${unlocked ? 'bg-white' : 'bg-white/40'}`} />
                          </div>

                          {/* Contenido de la nube */}
                          <div className="relative z-10 flex flex-col items-center justify-center h-full pb-1">
                            {unlocked ? (
                              <>
                                {pictInfo?.imageUrl ? (
                                  <img
                                    src={pictInfo.imageUrl}
                                    alt={card.pictogramWord}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="text-xl">{card.icon}</div>
                                )}
                                <span className="text-[9px] font-magic text-indigo-700 uppercase leading-none mt-0.5">
                                  {card.value.length > 5 ? card.value.slice(0, 4) + '…' : card.value}
                                </span>
                              </>
                            ) : (
                              <div className="text-lg opacity-40">🔒</div>
                            )}
                          </div>

                          {/* Badge completado */}
                          {completed && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] shadow-md z-20">
                              ✓
                            </div>
                          )}

                          {/* Badge siguiente */}
                          {isNext && (
                            <div className={`absolute -bottom-1 -right-1 bg-amber-400 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-md z-20 ${!reduceAnim ? 'animate-bounce' : ''}`}>
                              ⭐
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
                <div className="text-2xl">🏆</div>
                <span className="text-[10px] font-magic text-indigo-500 uppercase">¡Meta!</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de progreso flotante */}
      <footer className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 z-40 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border-2 border-indigo-200 shadow-lg flex items-center gap-2.5 w-full max-w-xs pointer-events-auto">
          <div className={`text-2xl sm:text-3xl select-none ${!reduceAnim ? 'floating-gumi' : ''}`}>👾</div>
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
            <button onClick={() => updateSettings({ soundEnabled: false })} className="text-base sm:text-lg p-0.5" title="Silenciar">🔊</button>
          ) : (
            <button onClick={() => updateSettings({ soundEnabled: true })} className="text-base sm:text-lg p-0.5 opacity-40" title="Activar sonido">🔇</button>
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
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Niveles</span><span className="font-bold">{user.progressIndex} / {MAGIC_PATH.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Puntos</span><span className="font-bold">{user.score} ⭐</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Racha</span><span className="font-bold">{user.streak} días 🔥</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tiempo</span><span className="font-bold">{getSessionMinutes()} min</span>
              </div>
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
              {adultUnlock ? '✓ Niveles desbloqueados' : '🔓 Desbloquear todos'}
            </button>
            <button
              onClick={() => setShowAdultPanel(false)}
              className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-xl font-bold uppercase text-sm active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Aviso de descanso */}
      {showBreakReminder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[310] flex items-center justify-center p-4" onClick={dismissBreakReminder}>
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl border-4 border-indigo-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">👾</div>
            <h3 className="text-lg font-magic text-indigo-700 uppercase mb-2">¡Hora de descansar!</h3>
            <p className="text-sm text-gray-500 mb-4">Llevas {getSessionMinutes()} minutos. ¿Hacemos una pausa?</p>
            <button onClick={dismissBreakReminder} className="w-full bg-indigo-500 text-white py-2.5 rounded-xl font-bold uppercase text-sm shadow-md active:scale-95 transition-all">
              ¡Descansar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hub;
