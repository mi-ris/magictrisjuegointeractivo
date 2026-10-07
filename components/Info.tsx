import React from 'react';

interface Props {
  onBack: () => void;
}

const sections = [
  {
    icon: '🧠',
    title: 'Aprender\nJugando',
    text: 'MagicTris utiliza la asociación de pictogramas (imágenes) con sonidos para facilitar el aprendizaje visual.',
  },
  {
    icon: '🔊',
    title: 'Voz Clara',
    text: 'Utilizamos sonidos pausados y claros, diseñados para captar la atención y mejorar la comprensión.',
  },
  {
    icon: '🌈',
    title: 'Estímulo Visual',
    text: 'Los colores fuertes y degradados ayudan a mantener el interés en los elementos educativos principales.',
  },
  {
    icon: '🏅',
    title: 'Progreso Mágico',
    text: 'Cada acierto motiva al niño a seguir explorando el abecedario de una forma positiva y divertida.',
  },
];

const Info: React.FC<Props> = () => {
  return (
    <div className="min-h-screen bg-[#211d50] px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-[432px] rounded-[2rem] border border-white/25 bg-[#302d78] px-5 py-7 shadow-2xl sm:px-8 sm:py-8">
        <h2 className="mb-7 text-center font-magic text-[2.25rem] leading-[0.95] tracking-tight text-white uppercase drop-shadow-[0_3px_0_rgba(0,0,0,0.25)] sm:text-[3rem]">
          ¿Qué es<br />MagicTris?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="flex min-h-[218px] flex-col items-center rounded-[1.8rem] border border-white/20 bg-[#484685] px-3 py-7 text-center shadow-[0_8px_14px_rgba(18,15,61,0.25)]"
            >
              <span className="mb-5 text-[2.75rem] leading-none" aria-hidden="true">{section.icon}</span>
              <h3 className="mb-3 whitespace-pre-line font-magic text-[1.05rem] leading-[0.95] text-cyan-300 sm:text-xl">
                {section.title}
              </h3>
              <p className="font-bold text-[0.68rem] leading-[1.22] text-white/95 sm:text-xs">
                {section.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-9 rounded-[2rem] border-[3px] border-purple-300/80 bg-gradient-to-br from-[#665af0] to-[#8521d1] px-5 py-6 text-center shadow-[0_8px_16px_rgba(17,12,63,0.3)]">
          <div className="mb-4 text-4xl" aria-hidden="true">✨</div>
          <p className="font-bold text-sm leading-[1.2] text-white sm:text-base">
            “Este juego ha sido diseñado para que cada letra sea un paso lleno de alegría y aprendizaje.”
          </p>
          <p className="mt-4 font-magic text-xl text-yellow-300 sm:text-2xl">MAGICTRIS</p>
        </div>
      </div>
    </div>
  );
};

export default Info;
