
import React from 'react';
import { User } from '../types';
import { MAGIC_PATH } from '../services/mockData';
import { playPopSound } from './AudioUtils';
import { useSettings } from './SettingsContext';
import CloudPath from './CloudPath';

interface Props {
  user: User;
  onSelectCard: (index: number) => void;
}

const Hub: React.FC<Props> = ({ user, onSelectCard }) => {
  const { settings, getSessionMinutes, showBreakReminder, dismissBreakReminder } = useSettings();

  const handleCardSelect = (index: number) => {
    if (settings.soundEnabled) playPopSound();
    onSelectCard(index);
  };

  const progressPercent = Math.round((user.progressIndex / MAGIC_PATH.length) * 100);
  const pi = Number(user.progressIndex) || 0;
  const isCardUnlocked = (cardIndex: number) => cardIndex === 0 || cardIndex <= pi;
  const isCardNext = (cardIndex: number) => cardIndex === pi;
  const isCardCompleted = (cardIndex: number) => pi > cardIndex;
  const reduceAnim = settings.reduceAnimations;

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-1 pt-20 sm:pt-24 pb-32 px-3 max-w-lg mx-auto w-full">
        <div className="flex flex-col items-center mb-3 text-center">
          <img src="/gumi-avatar.png" alt="Gumi" className={`w-14 h-14 sm:w-16 sm:h-16 mb-0.5 ${!reduceAnim ? 'floating-gumi' : ''} select-none object-contain`} />
          <h2 className="text-2xl sm:text-4xl font-magic text-indigo-700 drop-shadow-[0_3px_8px_rgba(255,255,255,0.8)] uppercase tracking-tighter">¡Hola, {user.nickname}!</h2>
          <p className="text-[10px] sm:text-xs text-indigo-500 font-bold uppercase tracking-widest">Toca las nubes y aprende palabras</p>
        </div>

        <CloudPath
          isCardUnlocked={isCardUnlocked}
          isCardNext={isCardNext}
          isCardCompleted={isCardCompleted}
          onSelectCard={handleCardSelect}
        />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 z-40 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border-2 border-indigo-200 shadow-lg flex items-center gap-2.5 w-full max-w-xs pointer-events-auto">
          <img src="/gumi-avatar.png" alt="Gumi" className={`w-7 h-7 sm:w-8 sm:h-8 select-none object-contain ${!reduceAnim ? 'floating-gumi' : ''}`} />
          <div className="flex-1">
            <div className="w-full bg-indigo-100 h-2 sm:h-2.5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-1000" style={{ width: `${progressPercent}%` }} /></div>
            <div className="flex justify-between mt-0.5 px-0.5"><p className="text-[7px] sm:text-[9px] font-magic text-indigo-500 uppercase tracking-wider">{progressPercent}%</p></div>
          </div>
          <span className="text-[8px] font-magic text-indigo-400 uppercase tracking-widest">{getSessionMinutes()} min</span>
        </div>
      </footer>

      {showBreakReminder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[310] flex items-center justify-center p-4" onClick={dismissBreakReminder}>
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl border-4 border-indigo-200 text-center" onClick={e => e.stopPropagation()}>
            <img src="/gumi-avatar.png" alt="Gumi" className="w-12 h-12 mx-auto mb-3 object-contain" />
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
