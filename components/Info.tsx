
import React from 'react';
import VoiceButton from './VoiceButton';

interface Props { onBack: () => void; }

const Info: React.FC<Props> = () => {
  const sections = [
    {
      icon: '🧠',
      title: 'Aprender Jugando',
      text: 'Cada palabra se aprende con imágenes, sonidos y juegos divertidos.',
      color: 'from-indigo-400 to-cyan-400',
    },
    {
      icon: '🔊',
      title: 'Voz Amiga',
      text: 'Una voz alegre te acompana y te ensena cada palabra con carino.',
      color: 'from-cyan-400 to-blue-400',
    },
    {
      icon: '🌈',
      title: 'Mundo de Colores',
      text: 'Pantallas llenas de color que hacen que aprender sea divertido.',
      color: 'from-amber-400 to-orange-400',
    },
    {
      icon: '🎖️',
      title: 'Gana Estrellas',
      text: 'Cada acierto te da estrellas. ¡Colecciona tantas como puedas!',
      color: 'from-pink-400 to-rose-400',
    },
  ];

  const introText = '¡Hola! Bienvenido a MagicTris, el mundo magico donde aprendes palabras jugando con Gumi y Pipo. Vamos a explorar juntos.';

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 pb-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Hero card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border-[6px] border-white mb-6">
          <div className="bg-gradient-to-br from-indigo-500 via-cyan-500 to-blue-500 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white" style={{
                  width: `${8 + Math.random() * 20}px`,
                  height: `${8 + Math.random() * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }} />
              ))}
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <img src="/gumi-avatar.png" alt="Gumi" className="w-24 h-24 sm:w-32 sm:h-32 mb-4 floating-gumi object-contain drop-shadow-2xl" />
              <h2 className="text-4xl sm:text-6xl font-magic text-white drop-shadow-lg uppercase tracking-tight mb-3">¿Qué es MagicTris?</h2>
              <p className="text-lg sm:text-xl text-white/90 font-bold max-w-lg leading-relaxed mb-4">
                Un mundo mágico donde los niños aprenden palabras jugando con pictogramas, sonidos y juegos divertidos.
              </p>
              <VoiceButton text={introText} className="bg-white text-indigo-600 px-6 py-3 rounded-full shadow-lg" large />
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl border-4 border-white p-6 flex items-center gap-5 hover:scale-[1.02] transition-transform">
              <div className={`bg-gradient-to-br ${s.color} w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-magic text-indigo-700 mb-1">{s.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 font-bold leading-snug">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How to play */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border-[6px] border-white p-8 sm:p-10 mb-6">
          <h3 className="text-2xl sm:text-3xl font-magic text-indigo-700 text-center mb-6 uppercase">¿Cómo se juega?</h3>
          <div className="space-y-4">
            {[
              { num: '1', text: 'Elige una isla de palabras en el mapa mágico.' },
              { num: '2', text: 'Toca una tarjeta para empezar a aprender esa palabra.' },
              { num: '3', text: 'Escucha la voz, mira la imagen y juega los mini-juegos.' },
              { num: '4', text: '¡Acertar te da estrellas y desbloquea nuevas palabras!' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 bg-indigo-50 rounded-2xl p-4">
                <div className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-magic text-xl shadow-md shrink-0">
                  {step.num}
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Characters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-[2.5rem] shadow-xl border-4 border-white p-6 text-center">
            <img src="/gumi-avatar.png" alt="Gumi" className="w-20 h-20 mx-auto mb-3 floating-gumi object-contain" />
            <h3 className="text-2xl font-magic text-indigo-700 mb-1">Gumi</h3>
            <p className="text-sm font-bold text-gray-600">Tu guía mágica que te enseña cada palabra con alegría.</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-[2.5rem] shadow-xl border-4 border-white p-6 text-center">
            <img src="/pipo-avatar.webp" alt="Pipo" className="w-20 h-20 mx-auto mb-3 floating-gumi object-contain" />
            <h3 className="text-2xl font-magic text-cyan-700 mb-1">Pipo</h3>
            <p className="text-sm font-bold text-gray-600">Tu amigo robot que charla contigo y te hace reír.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
