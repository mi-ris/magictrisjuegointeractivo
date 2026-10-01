
import React from 'react';
import { getSharedAudioContext, playPopSound } from './AudioUtils';

interface Props { onStart: () => void; }

const PreLogin: React.FC<Props> = ({ onStart }) => {
  const handleStart = () => {
    const ctx = getSharedAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    playPopSound();
    onStart();
  };

  const letters = [
    { letter: 'A', color: 'from-rose-400 to-pink-500', shadow: 'shadow-rose-300' },
    { letter: 'E', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-300' },
    { letter: 'I', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-300' },
    { letter: 'O', color: 'from-sky-400 to-blue-500', shadow: 'shadow-sky-300' },
    { letter: 'U', color: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-300' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-6 px-4 overflow-hidden">

      {/* Logo Gumi con brillo */}
      <div className="z-10 flex flex-col items-center mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/40 blur-2xl scale-110" />
          <img
            src="/Logo_gumi_.jpg"
            alt="Gumi"
            className="relative w-36 h-36 sm:w-52 sm:h-52 object-contain drop-shadow-2xl floating-gumi"
          />
        </div>
      </div>

      {/* Título con fondo pill */}
      <div className="z-10 text-center mb-6 sm:mb-8">
        <h1 className="text-[52px] sm:text-[90px] md:text-[110px] leading-none magic-title whitespace-nowrap drop-shadow-[0_6px_0_rgba(49,46,129,0.4)]">
          MAGICTRIS
        </h1>
        <div className="mt-2 sm:mt-3">
          <span className="text-base sm:text-2xl text-blue-900 font-magic px-5 sm:px-8 py-1.5 sm:py-2 bg-white/70 backdrop-blur-md rounded-full inline-block shadow-md border-2 border-white/80">
            ¡La magia de aprender!
          </span>
        </div>
      </div>

      {/* Letras flotantes */}
      <div className="flex gap-2 sm:gap-5 items-center justify-center mb-8 sm:mb-10 z-10">
        {letters.map((item, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${item.color} w-12 h-16 sm:w-20 sm:h-28 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-2xl ${item.shadow} border-4 border-white/60`}
            style={{ animation: `float-gumi ${2.8 + idx * 0.35}s ease-in-out infinite`, animationDelay: `${idx * 0.15}s` }}
          >
            <span className="text-3xl sm:text-5xl font-magic text-white drop-shadow-md leading-none">{item.letter}</span>
          </div>
        ))}
      </div>

      {/* Botón comenzar */}
      <div className="flex flex-col items-center gap-3 z-20">
        <button
          onClick={handleStart}
          className="btn-magic-pop bg-indigo-500 hover:bg-indigo-600 text-white text-2xl sm:text-4xl px-12 sm:px-20 py-4 sm:py-6 rounded-full font-magic uppercase tracking-widest border-4 border-white shadow-[0_10px_0_#3730a3] active:shadow-none active:translate-y-3 transition-all"
        >
          ¡COMENZAR!
        </button>
        <p className="text-xs sm:text-sm font-bold text-indigo-700/70 uppercase tracking-widest">
          ¡Toca para empezar la aventura!
        </p>
      </div>

      <footer className="absolute bottom-4 w-full text-center z-10 opacity-50">
        <p className="text-[10px] sm:text-xs font-magic text-blue-900 uppercase tracking-widest">
          Hecho con magia para niños curiosos
        </p>
      </footer>
    </div>
  );
};

export default PreLogin;
