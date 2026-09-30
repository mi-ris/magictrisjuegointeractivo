
import React from 'react';
import { User, Section } from '../types';
import { MAGIC_PATH, MAGIC_LEVELS } from '../services/mockData';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  setSection: (s: Section) => void;
  onSelectCard: (index: number) => void;
}

const Hub: React.FC<Props> = ({ user, onSelectCard }) => {
  let globalCardIndex = 0;

  const handleCardSelect = (index: number) => {
    playPopSound();
    onSelectCard(index);
  };

  const progressPercent = Math.round((user.progressIndex / MAGIC_PATH.length) * 100);

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-1 pt-24 sm:pt-28 pb-32 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center mb-10 sm:mb-16 text-center">
            <h2 className="text-4xl sm:text-7xl font-magic text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] mb-2 uppercase tracking-tighter">Camino Mágico</h2>
            <p className="text-sm sm:text-lg font-bold text-amber-200/80 uppercase tracking-widest">Toca una letra para empezar a jugar</p>
        </div>

        {MAGIC_LEVELS.map((level, levelIdx) => {
          const levelColors = [
            'text-amber-300', 'text-rose-300', 'text-teal-300', 'text-violet-300',
          ];
          const levelColor = levelColors[levelIdx % levelColors.length];
          return (
          <div key={levelIdx} className="mb-24">
            <div className="flex items-center gap-6 mb-12">
              <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
              <h3 className={`text-2xl sm:text-3xl font-magic uppercase tracking-widest ${levelColor} drop-shadow-lg text-center`}>{level.name}</h3>
              <div className="flex-1 h-1 bg-white/20 rounded-full"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 px-2">
              {level.items.map((item) => {
                const currentIndex = globalCardIndex++;
                const card = MAGIC_PATH[currentIndex];
                const isUnlocked = currentIndex <= user.progressIndex;
                const isNext = currentIndex === user.progressIndex;
                return (
                  <button
                    key={card.id}
                    disabled={!isUnlocked}
                    onClick={() => handleCardSelect(currentIndex)}
                    className={`group relative w-24 sm:w-32 aspect-[4/5] p-2 rounded-[2rem] flex flex-col items-center justify-around transition-all duration-300 shadow-xl border-4 ${
                      isUnlocked ? `${card.color} border-white/30 ${isNext ? 'ring-4 ring-amber-400 scale-110 z-10' : 'hover:scale-105'}` : 'bg-violet-950/40 opacity-40 grayscale border-transparent cursor-not-allowed'
                    }`}
                  >
                    <div className="text-4xl sm:text-5xl">{isUnlocked ? card.icon : '🔒'}</div>
                    <h4 className="font-magic text-white text-2xl sm:text-3xl uppercase">{isUnlocked ? card.value : ''}</h4>
                    {isNext && <div className="absolute -top-3 -right-3 bg-amber-400 w-8 h-8 rounded-full border-2 border-white animate-bounce flex items-center justify-center text-xs shadow-lg z-20">⭐</div>}
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-40 flex justify-center pointer-events-none">
         <div className="bg-gradient-to-r from-violet-800 to-teal-700 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-amber-300/30 shadow-2xl flex items-center gap-3 sm:gap-4 w-full max-w-md pointer-events-auto transform hover:scale-102 transition-transform">
            <div className="text-3xl sm:text-4xl floating-gumi select-none">👾</div>
            <div className="flex-1">
                <div className="w-full bg-black/40 h-2.5 sm:h-3 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="flex justify-between mt-1.5 px-1">
                    <p className="text-[8px] sm:text-[10px] font-magic text-amber-300 uppercase tracking-widest">Progreso Mágico</p>
                    <p className="text-[8px] sm:text-[10px] font-bold text-white/70 uppercase tracking-tighter">{progressPercent}% Completado</p>
                </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Hub;
