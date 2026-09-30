
import React, { useState, useEffect } from 'react';
import { User, Section } from '../types';
import { MAGIC_PATH, MAGIC_ISLANDS } from '../services/mockData';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  setSection: (s: Section) => void;
  onSelectCard: (index: number) => void;
}

const Hub: React.FC<Props> = ({ user, onSelectCard }) => {
  const [adultUnlock, setAdultUnlock] = useState(false);
  const [showAdultPrompt, setShowAdultPrompt] = useState(false);

  const handleCardSelect = (index: number) => {
    playPopSound();
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

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-1 pt-24 sm:pt-28 pb-40 px-4 max-w-4xl mx-auto w-full">

        <div className="flex flex-col items-center mb-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-magic text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] mb-1 uppercase tracking-tighter">
            Mundo de Gumi
          </h2>
          <p className="text-sm sm:text-base text-cyan-200 font-bold uppercase tracking-widest opacity-80">
            Sube de isla en isla aprendiendo a leer
          </p>
        </div>

        <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50">
          <button
            onClick={() => setShowAdultPrompt(true)}
            className="bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl border-2 border-white/20 text-lg sm:text-xl hover:bg-white/20 transition-all active:scale-90 shadow-lg"
            title="Modo adulto"
          >
            🔓
          </button>
        </div>

        {MAGIC_ISLANDS.map((island, islandIdx) => {
          const islandCards = island.cardIds.map(id => MAGIC_PATH[cardIdToIndex[id]]);
          const firstCardIdx = cardIdToIndex[island.cardIds[0]];
          const lastCardIdx = cardIdToIndex[island.cardIds[island.cardIds.length - 1]];
          const islandUnlocked = isCardUnlocked(firstCardIdx);
          const islandComplete = user.progressIndex > lastCardIdx;

          return (
            <div key={island.id} className="relative mb-8 sm:mb-12">
              {/* Camino conector entre islas */}
              {islandIdx > 0 && (
                <div className="flex justify-center mb-2">
                  <div className="w-2 h-12 sm:h-16 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
                </div>
              )}

              {/* Isla */}
              <div className={`relative rounded-[2.5rem] sm:rounded-[3rem] p-4 sm:p-8 transition-all duration-500 ${
                islandUnlocked
                  ? 'bg-gradient-to-br from-teal-500/30 via-cyan-500/20 to-blue-600/30 border-2 border-cyan-300/40 shadow-2xl'
                  : 'bg-indigo-950/40 border-2 border-white/10 opacity-60'
              }`}>
                {/* Decoración de isla */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl z-20 drop-shadow-lg">
                  {island.islandIcon}
                </div>

                {/* Nombre de la isla */}
                <div className="flex items-center justify-center gap-3 mb-6 mt-2">
                  <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
                  <h3 className={`text-lg sm:text-2xl font-magic uppercase tracking-widest text-center ${
                    islandUnlocked ? 'text-white drop-shadow-lg' : 'text-white/40'
                  }`}>
                    {island.name}
                  </h3>
                  <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
                </div>

                {/* Niveles en camino serpenteante */}
                <div className="relative">
                  {islandCards.map((card, cardIdx) => {
                    const globalIdx = cardIdToIndex[card.id];
                    const unlocked = isCardUnlocked(globalIdx);
                    const isNext = isCardNext(globalIdx);
                    const completed = user.progressIndex > globalIdx;

                    // Camino serpenteante: alterna izquierda-centro-derecha
                    const positions = ['justify-start', 'justify-center', 'justify-end'];
                    const posClass = positions[cardIdx % 3];

                    return (
                      <div key={card.id} className={`flex ${posClass} relative`}>
                        {/* Línea punteada conectora */}
                        {cardIdx > 0 && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-1 h-4 sm:h-6 border-l-2 border-dashed border-white/30"></div>
                        )}

                        <button
                          disabled={!unlocked}
                          onClick={() => handleCardSelect(globalIdx)}
                          className={`group relative w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-4 my-2 sm:my-3 ${
                            unlocked
                              ? `${card.color} border-white/40 ${isNext ? 'ring-4 ring-amber-400 scale-110 z-10 animate-pulse' : 'hover:scale-105'}`
                              : 'bg-indigo-950/60 opacity-50 grayscale border-transparent cursor-not-allowed'
                          } ${completed ? 'ring-2 ring-emerald-400' : ''}`}
                        >
                          {unlocked ? (
                            <>
                              <div className="text-2xl sm:text-3xl">{card.icon}</div>
                              <h4 className="font-magic text-white text-base sm:text-xl uppercase leading-none mt-0.5">
                                {card.value.length > 3 ? card.value.slice(0, 3) : card.value}
                              </h4>
                              {completed && (
                                <div className="absolute -top-1 -right-1 bg-emerald-400 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-lg z-20">
                                  ✓
                                </div>
                              )}
                              {isNext && (
                                <div className="absolute -top-2 -right-2 bg-amber-400 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-lg z-20 animate-bounce">
                                  ⭐
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-2xl sm:text-3xl">🔒</div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {islandUnlocked && !islandComplete && (
                  <div className="text-center mt-3">
                    <span className="text-xs sm:text-sm text-cyan-200 font-bold uppercase tracking-wider opacity-70">
                      {islandComplete ? '¡Isla completada!' : 'Sigue el camino'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Barra de progreso */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-40 flex justify-center pointer-events-none">
        <div className="bg-indigo-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-cyan-400/30 shadow-2xl flex items-center gap-3 sm:gap-4 w-full max-w-md pointer-events-auto transform hover:scale-102 transition-transform">
          <div className="text-3xl sm:text-4xl floating-gumi select-none">👾</div>
          <div className="flex-1">
            <div className="w-full bg-black/40 h-2.5 sm:h-3 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              <p className="text-[8px] sm:text-[10px] font-magic text-cyan-300 uppercase tracking-widest">Progreso Mágico</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-white/70 uppercase tracking-tighter">{progressPercent}% Completado</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de desbloqueo adulto */}
      {showAdultPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setShowAdultPrompt(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-cyan-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-magic text-indigo-900 uppercase text-center mb-4">Modo Adulto</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              ¿Quieres desbloquear todos los niveles para que el niño pueda elegir libremente?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setAdultUnlock(!adultUnlock); setShowAdultPrompt(false); playPopSound(); }}
                className="flex-1 bg-cyan-500 text-white py-3 rounded-2xl font-bold uppercase text-sm shadow-lg active:scale-95 transition-all"
              >
                {adultUnlock ? 'Bloquear' : 'Desbloquear todo'}
              </button>
              <button
                onClick={() => setShowAdultPrompt(false)}
                className="flex-1 bg-gray-200 text-gray-600 py-3 rounded-2xl font-bold uppercase text-sm active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
            {adultUnlock && (
              <p className="text-xs text-emerald-600 text-center mt-4 font-bold">
                Todos los niveles están desbloqueados
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Hub;
