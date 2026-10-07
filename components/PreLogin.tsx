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
    { letter: 'A', color: 'border-pink-400 text-pink-500', symbol: '🧠' },
    { letter: 'E', color: 'border-amber-400 text-amber-500', symbol: '●' },
    { letter: 'I', color: 'border-emerald-400 text-emerald-500', symbol: '☘' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500">
      <div className="absolute top-10 left-8 text-white/70 text-6xl">☁</div>
      <div className="absolute bottom-24 left-1/4 text-white/70 text-6xl">☁</div>
      <div className="relative z-10 text-center mb-7 sm:mb-10">
        <h1 className="text-6xl sm:text-8xl md:text-9xl leading-none font-magic text-blue-700 drop-shadow-[0_5px_0_white] tracking-tight">MAGICTRIS</h1>
        <span className="inline-block mt-3 px-7 py-1.5 rounded-full bg-white/60 text-blue-800 font-magic text-lg sm:text-2xl shadow-sm">¡La magia de aprender!</span>
      </div>

      <div className="relative z-10 flex gap-4 sm:gap-7 mb-10">
        {letters.map(item => (
          <div key={item.letter} className={`w-28 h-56 sm:w-36 sm:h-64 rounded-[2rem] bg-white border-[10px] ${item.color} shadow-xl flex flex-col items-center justify-between py-8`}>
            <span className="text-4xl opacity-85 drop-shadow-md">{item.symbol}</span>
            <span className={`text-6xl sm:text-7xl font-magic ${item.color.split(' ')[1]}`}>{item.letter}</span>
          </div>
        ))}
      </div>

      <button onClick={handleStart} className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white text-2xl sm:text-4xl px-14 sm:px-24 py-4 rounded-full font-magic uppercase tracking-wider border-4 border-white shadow-[0_9px_0_#c2410c] active:translate-y-2 active:shadow-none transition-all">COMENZAR</button>
      <p className="relative z-10 mt-12 text-xs font-magic text-blue-800 uppercase tracking-widest">Hecho con magia para niños curiosos</p>
    </div>
  );
};

export default PreLogin;
