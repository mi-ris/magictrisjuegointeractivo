
import React from 'react';
import { User, Section } from '../types';
import { MAGIC_PATH } from '../services/mockData';
import { playPopSound } from './AudioUtils';
import { useSettings } from './SettingsContext';
import CloudPath from './CloudPath';

interface Props {
  user: User;
  setSection: (s: Section | 'admin') => void;
  onSelectCard: (index: number) => void;
}

const Hub: React.FC<Props> = ({ user, setSection, onSelectCard }) => {
  const { settings, updateSettings, getSessionMinutes, showBreakReminder, dismissBreakReminder } = useSettings();

  const handleCardSelect = (index: number) => {
    if (settings.soundEnabled) playPopSound();
    onSelectCard(index);
  };

  const progressPercent = Math.round((user.progressIndex / MAGIC_PATH.length) * 100);

  const FIRST_LEVELS = 3;
  const isCardUnlocked = (cardIndex: number) => cardIndex < FIRST_LEVELS || cardIndex <= user.progressIndex;
  const isCardNext = (cardIndex: number) => cardIndex === user.progressIndex && cardIndex >= FIRST_LEVELS;
  const isCardCompleted = (cardIndex: number) => user.progressIndex > cardIndex;

  const reduceAnim = settings.reduceAnimations;

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

        {/* Botón adulto - abre panel administrativo */}
        <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50">
          <button
            onClick={() => { if (settings.soundEnabled) playPopSound(); setSection('admin'); }}
            className="bg-white/80 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border-2 border-indigo-200 hover:bg-white transition-all active:scale-90 shadow-md"
            title="Panel de adulto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

        <CloudPath
          isCardUnlocked={isCardUnlocked}
          isCardNext={isCardNext}
          isCardCompleted={isCardCompleted}
          onSelectCard={handleCardSelect}
        />
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
