
import React, { useState } from 'react';
import { User, Section } from '../types';
import { playPopSound } from './AudioUtils';
import { useSettings } from './SettingsContext';

interface Props {
  user: User;
  currentSection: string;
  inGame: boolean;
  onNavigate: (s: Section) => void;
  onHome: () => void;
}

const NavBar: React.FC<Props> = ({ user, currentSection, inGame, onNavigate, onHome }) => {
  const { settings, updateSettings } = useSettings();
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

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

  const speedLabel = settings.speechRate === 'slow' ? '🐢' : settings.speechRate === 'fast' ? '🐇' : '🐕';
  const speeds: { value: 'slow' | 'normal' | 'fast'; label: string; name: string }[] = [
    { value: 'slow', label: '🐢', name: 'Lento' },
    { value: 'normal', label: '🐕', name: 'Normal' },
    { value: 'fast', label: '🐇', name: 'Rápido' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-20 sm:h-24 bg-indigo-900/80 backdrop-blur-xl shadow-2xl z-[200] px-3 sm:px-8 flex items-center justify-between border-b-4 border-white/10">
      <div className="flex items-center gap-2 sm:gap-3">
        {showHome && (
          <button
            onClick={handleHome}
            className="bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-white/20 hover:bg-white/30 transition-all active:scale-90 shadow-lg"
            title="Inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
        )}
        <img src="/Logo_gumi_.jpg" alt="MagicTris" className="h-12 sm:h-16 md:h-20 w-auto object-contain" />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Puntos */}
        <div className="bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-amber-400/50 flex items-center gap-1 sm:gap-2 shadow-lg backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm sm:text-xl font-magic text-white">{user.score}</span>
            <span className="text-[5px] sm:text-[7px] font-magic text-amber-300 font-bold uppercase tracking-widest">Puntos</span>
          </div>
        </div>

        {/* Racha */}
        <div className={`bg-gradient-to-br ${streak} px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-white shadow-xl flex items-center gap-1 sm:gap-2 transition-all relative`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={user.streak > 0 ? 'animate-bounce' : 'opacity-50'}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm sm:text-xl font-magic text-white">{user.streak}</span>
            <span className="text-[5px] sm:text-[7px] font-magic text-white/90 font-bold uppercase tracking-widest">Días</span>
          </div>
        </div>

        {/* Control velocidad de voz */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(p => !p)}
            className="bg-white/10 border-2 border-white/30 rounded-xl sm:rounded-2xl px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 hover:bg-white/20 transition-all shadow-lg"
            title="Velocidad de voz"
          >
            <span className="text-base sm:text-xl">{speedLabel}</span>
            <div className="flex flex-col items-start leading-none hidden sm:flex">
              <span className="text-[7px] font-magic text-white/90 uppercase tracking-widest">Voz</span>
            </div>
          </button>
          {showSpeedMenu && (
            <div className="absolute top-full right-0 mt-2 bg-indigo-900/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden z-[300] min-w-[110px]">
              {speeds.map(s => (
                <button
                  key={s.value}
                  onClick={() => { updateSettings({ speechRate: s.value }); setShowSpeedMenu(false); playPopSound(); }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all ${settings.speechRate === s.value ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
                >
                  <span className="text-lg">{s.label}</span>
                  <span className="font-magic uppercase text-xs tracking-wide">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sonido on/off */}
        <button
          onClick={() => { updateSettings({ soundEnabled: !settings.soundEnabled }); playPopSound(); }}
          className="bg-white/10 border-2 border-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
          title={settings.soundEnabled ? 'Silenciar' : 'Activar sonido'}
        >
          {settings.soundEnabled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5 opacity-50"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          )}
        </button>

        {/* Info */}
        <button
          onClick={() => handleNav('info')}
          className="bg-cyan-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shadow-lg border-2 border-white/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="¿Qué es MagicTris?"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </button>

        {/* Álbum */}
        <button
          onClick={() => handleNav('printable')}
          className="bg-white text-indigo-700 hover:bg-indigo-50 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 border-indigo-200 text-[8px] sm:text-xs font-magic uppercase tracking-widest transition-all shadow-xl active:scale-95 font-bold hidden sm:block"
        >
          Álbum
        </button>

        {/* Perfil */}
        <button
          onClick={() => handleNav('profile')}
          className="flex items-center gap-1 sm:gap-2 bg-white/10 p-0.5 sm:p-1 rounded-full border-2 border-white/20 hover:bg-white/30 shadow-lg pr-2 sm:pr-3"
        >
          <img src={user.avatar.startsWith('/') ? user.avatar : '/avatar-bear.webp'} alt={user.nickname} className="bg-white rounded-full shadow-inner w-8 h-8 sm:w-10 sm:h-10 overflow-hidden object-cover" />
          <span className="text-[10px] sm:text-sm font-magic text-white hidden lg:block tracking-tight">{user.nickname}</span>
        </button>
      </div>

      {/* Cerrar menú velocidad al hacer click fuera */}
      {showSpeedMenu && (
        <div className="fixed inset-0 z-[299]" onClick={() => setShowSpeedMenu(false)} />
      )}
    </header>
  );
};

export default NavBar;
