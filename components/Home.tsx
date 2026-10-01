
import React from 'react';
import VoiceButton from './VoiceButton';
import { User } from '../types';

interface Props {
  user: User;
}

const Home: React.FC<Props> = ({ user }) => {
  const welcomeText = `¡Hola ${user.username}! Qué alegría verte hoy. Vamos a aprender y jugar juntos en este mundo mágico.`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 md:p-6 animate-fade-in">
      <div className="relative mb-8">
        <div className="w-64 h-48 md:w-80 md:h-60 rounded-[3rem] border-[10px] border-white shadow-2xl overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500 bg-indigo-100 flex items-center justify-center">
          <img src={user.avatar.startsWith('/') ? user.avatar : '/avatar-bear.webp'} alt={user.nickname} className="w-32 h-32 floating-gumi object-contain" />
        </div>
        <div className="absolute -top-6 -right-6 bg-amber-400 p-4 rounded-full text-4xl shadow-lg animate-bounce border-4 border-white">
          🌟
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl magic-title mb-4">¡Hola {user.username}!</h1>
      <p className="text-xl md:text-2xl text-indigo-900/70 font-bold mb-8 max-w-md leading-relaxed">
        ¡Qué alegría verte hoy! Vamos a aprender y jugar juntos en este mundo mágico.
      </p>

      <div className="flex flex-col items-center gap-4">
        <VoiceButton 
          text={welcomeText} 
          className="!px-10 !py-5 !text-2xl btn-magic-pop bg-indigo-500 shadow-[0_8px_0_#3730a3]" 
        />
        <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Escuchar saludo</span>
      </div>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {[
          { icon: '📚', label: 'Lee', color: 'border-indigo-300 text-indigo-500' },
          { icon: '🎨', label: 'Crea', color: 'border-cyan-300 text-cyan-500' },
          { icon: '🧸', label: 'Juega', color: 'border-amber-300 text-amber-600' },
          { icon: '💖', label: 'Siente', color: 'border-indigo-300 text-indigo-400' },
        ].map((item, i) => (
          <div key={i} className={`bg-white p-4 rounded-[2rem] shadow-md border-b-8 transition-transform hover:scale-105 ${item.color}`}>
            <span className="text-4xl block mb-2">{item.icon}</span>
            <p className="font-magic text-xl">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
