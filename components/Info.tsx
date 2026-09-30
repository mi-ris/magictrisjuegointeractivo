
import React from 'react';

interface Props { onBack: () => void; }

const Info: React.FC<Props> = ({ onBack }) => {
  const sections = [
    {
      icon: '🧠',
      title: 'Aprender Jugando',
      text: 'MagicTris utiliza la asociación de pictogramas (imágenes) con sonidos para facilitar el aprendizaje visual.',
      accent: 'text-amber-300'
    },
    {
      icon: '🔊',
      title: 'Voz Clara',
      text: 'Utilizamos sonidos pausados y claros, diseñados para captar la atención y mejorar la comprensión.',
      accent: 'text-teal-300'
    },
    {
      icon: '🌈',
      title: 'Estímulo Visual',
      text: 'Los colores fuertes y degradados ayudan a mantener el interés en los elementos educativos principales.',
      accent: 'text-rose-300'
    },
    {
      icon: '🎖️',
      title: 'Progreso Mágico',
      text: 'Cada acierto motiva al niño a seguir explorando el abecedario de una forma positiva y divertida.',
      accent: 'text-emerald-300'
    }
  ];

  return (
    <div className="fixed inset-0 bg-violet-950/90 backdrop-blur-sm z-[110] overflow-y-auto animate-fade-in pt-20 sm:pt-24">
      <div className="p-6 max-w-5xl mx-auto pb-32 pt-8">
        <div className="bg-violet-900/60 backdrop-blur-3xl rounded-[5rem] border-4 border-white/20 p-8 sm:p-20 shadow-2xl">
          <h2 className="text-5xl sm:text-8xl font-magic text-white text-center mb-16 drop-shadow-2xl uppercase tracking-tighter">¿Qué es MagicTris?</h2>
          
          <div className="grid md:grid-cols-2 gap-10">
              {sections.map((s, i) => (
                  <div key={i} className="bg-white/10 p-10 rounded-[4rem] border-2 border-white/10 flex flex-col items-center text-center group transition-all shadow-xl">
                      <span className="text-[80px] sm:text-[100px] mb-8 group-hover:scale-110 transition-transform drop-shadow-lg">{s.icon}</span>
                      <h3 className={`text-3xl sm:text-4xl font-magic mb-6 ${s.accent}`}>{s.title}</h3>
                      <p className="text-xl sm:text-2xl text-white font-bold leading-relaxed opacity-90">{s.text}</p>
                  </div>
              ))}
          </div>

          <div className="mt-20 p-10 sm:p-14 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 rounded-[4.5rem] text-center border-8 border-white/40 shadow-2xl">
              <span className="text-7xl mb-8 block">✨</span>
              <p className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                  "Este juego ha sido diseñado para que cada letra sea un paso lleno de alegría y aprendizaje."
              </p>
              <p className="mt-8 text-amber-300 font-magic text-4xl sm:text-5xl drop-shadow-md">MAGICTRIS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
