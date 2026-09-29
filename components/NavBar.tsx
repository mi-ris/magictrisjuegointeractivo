
import React from 'react';
import { User, Section } from '../types';
import { playPopSound } from './AudioUtils';

interface Props {
  user: User;
  currentSection: string;
  inGame: boolean;
  onNavigate: (s: Section) => void;
  onHome: () => void;
}

const NavBar: React.FC<Props> = ({ user, currentSection, inGame, onNavigate, onHome }) => {
  const handleNav = (s: Section) => {
    playPopSound();
    onNavigate(s);
  };

  const handleHome = () => {
    playPopSound();
    onHome();
  };

  const getStreakData = (s: number) => {
    if (s === 0) return { color: 'from-gray-400 to-gray-500', icon: '❄️' };
    if (s < 4) return { color: 'from-orange-400 to-red-500', icon: '🔥' };
    if (s < 7) return { color: 'from-fuchsia-500 to-purple-600', icon: '💜' };
    return { color: 'from-yellow-400 via-orange-500 to-red-600 animate-pulse', icon: '👑' };
  };

  const streak = getStreakData(user.streak);
  const showHome = inGame || currentSection !== 'hub';

  return (
    <header className="fixed top-0 left-0 right-0 h-20 sm:h-24 bg-indigo-900/80 backdrop-blur-xl shadow-2xl z-[200] px-3 sm:px-8 flex items-center justify-between border-b-4 border-white/10">
      <div className="flex items-center gap-2 sm:gap-3">
        {showHome && (
          <button
            onClick={handleHome}
            className="bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-white/20 text-xl sm:text-2xl hover:bg-white/30 transition-all active:scale-90 shadow-lg"
            title="Inicio"
          >
            🏠
          </button>
        )}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-magic text-white tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] select-none">
          MAGIC<span className="text-cyan-400">TRIS</span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
        <div className="bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-yellow-400/50 flex items-center gap-1 sm:gap-2 shadow-lg backdrop-blur-md">
          <span className="text-lg sm:text-2xl drop-shadow-md">⭐</span>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm sm:text-xl font-magic text-white">{user.score}</span>
            <span className="text-[5px] sm:text-[7px] font-magic text-yellow-300 font-bold uppercase tracking-widest">Puntos</span>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${streak.color} px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-white shadow-xl flex items-center gap-1 sm:gap-2 transform hover:scale-105 transition-all relative`}>
          <span className={`text-lg sm:text-2xl drop-shadow-md ${user.streak > 0 ? 'animate-bounce' : 'grayscale opacity-50'}`}>
            {streak.icon}
          </span>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm sm:text-xl font-magic text-white">{user.streak}</span>
            <span className="text-[5px] sm:text-[7px] font-magic text-white/90 font-bold uppercase tracking-widest text-center w-full">Días</span>
          </div>
        </div>

        <button
          onClick={() => handleNav('info')}
          className="bg-cyan-500 text-white w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="¿Qué es MagicTris?"
        >
          <span className="text-sm sm:text-xl font-bold">❓</span>
        </button>

        <button
          onClick={() => handleNav('printable')}
          className="bg-white text-indigo-700 hover:bg-blue-50 px-2 py-1.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-indigo-200 text-[8px] sm:text-xs font-magic uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-1 sm:gap-2 font-bold"
        >
          <span className="hidden sm:inline">🎴</span> Álbum
        </button>

        <button
          onClick={() => handleNav('profile')}
          className="flex items-center gap-1 sm:gap-2 bg-white/10 p-0.5 sm:p-1 rounded-full border-2 border-white/20 hover:bg-white/30 shadow-lg pr-2 sm:pr-4"
        >
          <span className="text-xl sm:text-3xl bg-white p-0.5 sm:p-1 rounded-full shadow-inner flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 overflow-hidden">{user.avatar}</span>
          <span className="text-[10px] sm:text-sm font-magic text-white hidden lg:block tracking-tight">{user.nickname}</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
