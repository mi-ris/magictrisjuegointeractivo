
import React, { useState } from 'react';
import { User, Section } from '../types';
import { MAGIC_PATH, MAGIC_ISLANDS, MAGIC_LEVELS } from '../services/mockData';
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

  const isCardUnlocked = (cardIndex: number) => {
    return adultUnlock || cardIndex <= user.progressIndex;
  };

  const isCardNext = (cardIndex: number) => {
    return !adultUnlock && cardIndex === user.progressIndex;
  };

  const totalLevelNumber = (islandIdx: number, cardIdx: number) => {
    let count = 0;
    for (let i = 0; i < islandIdx; i++) count += MAGIC_LEVELS[i].items.length;
    return count + cardIdx + 1;
  };

  const reduceAnim = settings.reduceAnimations;

  return (
    <div className="relative min-h-screen flex flex-col">

      <main className="flex-1 pt-24 sm:pt-28 pb-44 px-4 max-w-md mx-auto w-full">

        {/* Gumi guía */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className={`text-6xl mb-1 ${!reduceAnim ? 'floating-gumi' : ''} select-none`}>👾</div>
          <h2 className="text-3xl sm:text-5xl font-magic text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] mb-1 uppercase tracking-tighter">
            ¡Hola, {user.nickname}!
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200 font-bold uppercase tracking-widest opacity-80">
            Sigue el camino y aprende palabras
          </p>
        </div>

        {/* Botón adulto */}
        <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50">
          <button
            onClick={() => setShowAdultPanel(true)}
            className="bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl border-2 border-white/20 text-lg sm:text-xl hover:bg-white/20 transition-all active:scale-90 shadow-lg"
            title="Panel de adulto"
          >
            ⚙️
          </button>
        </div>

        {/* Camino vertical de mundos */}
        <div className="relative">
          {MAGIC_ISLANDS.map((island, islandIdx) => {
            const islandCards = island.cardIds.map(id => MAGIC_PATH[cardIdToIndex[id]]);
            const firstCardIdx = cardIdToIndex[island.cardIds[0]];
            const lastCardIdx = cardIdToIndex[island.cardIds[island.cardIds.length - 1]];
            const islandUnlocked = isCardUnlocked(firstCardIdx);
            const islandComplete = user.progressIndex > lastCardIdx;
            const islandColor = MAGIC_LEVELS[islandIdx].color || 'from-cyan-400 to-blue-500';

            return (
              <div key={island.id} className="relative mb-6">
                {/* Conector entre mundos */}
                {islandIdx > 0 && (
                  <div className="flex justify-center -my-2 z-0 relative">
                    <div className={`w-1 h-8 bg-gradient-to-b ${islandColor} rounded-full opacity-50`}></div>
                  </div>
                )}

                {/* Mundo */}
                <div className={`relative rounded-[2rem] overflow-hidden transition-all duration-500 ${
                  islandUnlocked
                    ? `bg-gradient-to-br ${islandColor} shadow-2xl`
                    : 'bg-gray-800/60 opacity-60'
                }`}>
                  {/* Cabecera del mundo */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-black/20">
                    <div className="text-3xl sm:text-4xl">{island.islandIcon}</div>
                    <div className="flex-1">
                      <h3 className={`text-sm sm:text-lg font-magic uppercase tracking-wider ${islandUnlocked ? 'text-white' : 'text-white/50'}`}>
                        {island.name}
                      </h3>
                      {islandComplete && (
                        <span className="text-[10px] text-white/80 font-bold">¡Completado! ✓</span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/60 font-bold">
                      {islandCards.filter(c => user.progressIndex > cardIdToIndex[c.id]).length}/{islandCards.length}
                    </div>
                  </div>

                  {/* Nodos del camino */}
                  <div className="relative p-4 pt-2">
                    {/* Línea curva de fondo */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                      <path
                        d={islandCards.length === 5
                          ? "M 50% 0 Q 20% 25% 50% 50 Q 80% 75% 50% 100"
                          : "M 50% 0 Q 25% 33% 50% 66 Q 75% 100% 50% 100"
                        }
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="3"
                        strokeDasharray="8 6"
                        fill="none"
                      />
                    </svg>

                    <div className="relative z-10">
                      {islandCards.map((card, cardIdx) => {
                        const globalIdx = cardIdToIndex[card.id];
                        const unlocked = isCardUnlocked(globalIdx);
                        const isNext = isCardNext(globalIdx);
                        const completed = user.progressIndex > globalIdx;
                        const levelNum = totalLevelNumber(islandIdx, cardIdx);

                        // Posiciones en zigzag
                        const offsets = ['10%', '40%', '70%', '40%', '10%'];
                        const leftOffset = offsets[cardIdx % offsets.length];

                        return (
                          <div key={card.id} className="relative flex justify-center" style={{ marginBottom: cardIdx < islandCards.length - 1 ? '0.5rem' : 0 }}>
                            <div className="relative" style={{ alignSelf: 'flex-start', marginLeft: leftOffset, width: '72px' }}>
                              {/* Número de nivel arriba */}
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-magic text-white/70 whitespace-nowrap">
                                Nivel {levelNum}
                              </div>

                              <button
                                disabled={!unlocked}
                                onClick={() => handleCardSelect(globalIdx)}
                                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-4 overflow-hidden ${
                                  unlocked
                                    ? `${card.color} border-white/50 ${isNext ? `ring-4 ring-amber-300 scale-110 z-20 ${!reduceAnim ? 'animate-pulse' : ''}` : 'hover:scale-105'}`
                                    : 'bg-gray-700 border-gray-600 cursor-not-allowed'
                                } ${completed ? 'ring-2 ring-emerald-400' : ''}`}
                              >
                                {unlocked ? (
                                  <>
                                    {card.imageUrl ? (
                                      <img
                                        src={card.imageUrl}
                                        alt={card.pictogramWord}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="text-2xl sm:text-3xl">{card.icon}</div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center">
                                      <span className="text-[9px] sm:text-[10px] font-magic text-white uppercase leading-none">{card.value}</span>
                                    </div>
                                    {completed && (
                                      <div className="absolute -top-1 -right-1 bg-emerald-400 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-lg z-20">
                                        ✓
                                      </div>
                                    )}
                                    {isNext && (
                                      <div className={`absolute -top-2 -right-2 bg-amber-400 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-lg z-20 ${!reduceAnim ? 'animate-bounce' : ''}`}>
                                        ⭐
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-xl sm:text-2xl opacity-50">🔒</div>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Barra de progreso con Gumi */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 z-40 flex justify-center pointer-events-none">
        <div className="bg-indigo-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] border-2 border-cyan-400/30 shadow-2xl flex items-center gap-3 w-full max-w-sm pointer-events-auto">
          <div className={`text-3xl sm:text-4xl select-none ${!reduceAnim ? 'floating-gumi' : ''}`}>👾</div>
          <div className="flex-1">
            <div className="w-full bg-black/40 h-2.5 sm:h-3 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="flex justify-between mt-1 px-1">
              <p className="text-[8px] sm:text-[10px] font-magic text-cyan-300 uppercase tracking-widest">{progressPercent}%</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-white/70">{getSessionMinutes()} min</p>
            </div>
          </div>
          {settings.soundEnabled ? (
            <button onClick={() => updateSettings({ soundEnabled: false })} className="text-xl sm:text-2xl p-1" title="Silenciar">🔊</button>
          ) : (
            <button onClick={() => updateSettings({ soundEnabled: true })} className="text-xl sm:text-2xl p-1 opacity-50" title="Activar sonido">🔇</button>
          )}
        </div>
      </footer>

      {/* Panel de adulto */}
      {showAdultPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setShowAdultPanel(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-cyan-300 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-magic text-indigo-900 uppercase text-center mb-4">Panel de Adulto</h3>

            {/* Progreso */}
            <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
              <h4 className="text-sm font-bold text-indigo-700 uppercase mb-2">Progreso de {user.nickname}</h4>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Niveles completados</span>
                <span className="font-bold">{user.progressIndex} / {MAGIC_PATH.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Puntos</span>
                <span className="font-bold">{user.score} ⭐</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Racha</span>
                <span className="font-bold">{user.streak} días 🔥</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tiempo de sesión</span>
                <span className="font-bold">{getSessionMinutes()} min</span>
              </div>
            </div>

            {/* Ajustes */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-bold text-indigo-700 uppercase">Ajustes</h4>

              <label className="flex items-center justify-between bg-gray-50 rounded-xl p-3 cursor-pointer">
                <span className="text-sm text-gray-700">Sonidos del juego</span>
                <input type="checkbox" checked={settings.soundEnabled} onChange={e => updateSettings({ soundEnabled: e.target.checked })} className="w-5 h-5" />
              </label>

              <label className="flex items-center justify-between bg-gray-50 rounded-xl p-3 cursor-pointer">
                <span className="text-sm text-gray-700">Voz automática</span>
                <input type="checkbox" checked={settings.autoPlayVoice} onChange={e => updateSettings({ autoPlayVoice: e.target.checked })} className="w-5 h-5" />
              </label>

              <label className="flex items-center justify-between bg-gray-50 rounded-xl p-3 cursor-pointer">
                <span className="text-sm text-gray-700">Reducir animaciones</span>
                <input type="checkbox" checked={settings.reduceAnimations} onChange={e => updateSettings({ reduceAnimations: e.target.checked })} className="w-5 h-5" />
              </label>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-700">Velocidad de voz</span>
                <select value={settings.speechRate} onChange={e => updateSettings({ speechRate: e.target.value as 'slow' | 'normal' })} className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                  <option value="slow">Lenta</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>

            {/* Desbloqueo */}
            <button
              onClick={() => { setAdultUnlock(!adultUnlock); if (settings.soundEnabled) playPopSound(); }}
              className={`w-full py-3 rounded-2xl font-bold uppercase text-sm shadow-lg active:scale-95 transition-all mb-2 ${adultUnlock ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-cyan-500 text-white'}`}
            >
              {adultUnlock ? '✓ Todos los niveles desbloqueados' : '🔓 Desbloquear todos los niveles'}
            </button>

            <button
              onClick={() => setShowAdultPanel(false)}
              className="w-full bg-gray-200 text-gray-600 py-3 rounded-2xl font-bold uppercase text-sm active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Aviso de descanso */}
      {showBreakReminder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[310] flex items-center justify-center p-4" onClick={dismissBreakReminder}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-2xl border-4 border-cyan-300 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">👾</div>
            <h3 className="text-xl font-magic text-indigo-800 uppercase mb-2">¡Hora de descansar!</h3>
            <p className="text-sm text-gray-600 mb-6">Llevas {getSessionMinutes()} minutos jugando. ¿Hacemos una pausa?</p>
            <button
              onClick={dismissBreakReminder}
              className="w-full bg-cyan-500 text-white py-3 rounded-2xl font-bold uppercase text-sm shadow-lg active:scale-95 transition-all"
            >
              ¡Descansar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hub;
