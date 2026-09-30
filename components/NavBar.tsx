
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

  const getStreakColor = (s: number) => {
    if (s === 0) return 'from-gray-400 to-gray-500';
    if (s < 4) return 'from-amber-400 to-amber-500';
    if (s < 7) return 'from-cyan-400 to-blue-500';
    return 'from-amber-400 to-yellow-400 animate-pulse';
  };

  const streak = getStreakColor(user.streak);
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
        )}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-magic text-white tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] select-none">
          MAGIC<span className="text-cyan-400">TRIS</span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
        <div className="bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-amber-400/50 flex items-center gap-1 sm:gap-2 shadow-lg backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm sm:text-xl font-magic text-white">{user.score}</span>
            <span className="text-[5px] sm:text-[7px] font-magic text-amber-300 font-bold uppercase tracking-widest">Puntos</span>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${streak} px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-white shadow-xl flex items-center gap-1 sm:gap-2 transform hover:scale-105 transition-all relative`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={user.streak > 0 ? 'animate-bounce' : 'opacity-50'}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm sm:text-xl font-magic text-white">{user.streak}</span>
            <span className="text-[5px] sm:text-[7px] font-magic text-white/90 font-bold uppercase tracking-widest text-center w-full">Días</span>
          </div>
        </div>

        <button
          onClick={() => handleNav('info')}
          className="bg-cyan-500 text-white w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="¿Qué es MagicTris?"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </button>

        <button
          onClick={() => handleNav('printable')}
          className="bg-white text-indigo-700 hover:bg-indigo-50 px-2 py-1.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-indigo-200 text-[8px] sm:text-xs font-magic uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-1 sm:gap-2 font-bold"
        >
          Álbum
        </button>

        <button
          onClick={() => handleNav('profile')}
          className="flex items-center gap-1 sm:gap-2 bg-white/10 p-0.5 sm:p-1 rounded-full border-2 border-white/20 hover:bg-white/30 shadow-lg pr-2 sm:pr-4"
        >
          <img src="/gumi-avatar.png" alt={user.nickname} className="text-xl sm:text-3xl bg-white p-0.5 sm:p-1 rounded-full shadow-inner flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 overflow-hidden object-cover" />
          <span className="text-[10px] sm:text-sm font-magic text-white hidden lg:block tracking-tight">{user.nickname}</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
