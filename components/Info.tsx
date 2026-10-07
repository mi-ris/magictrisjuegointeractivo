import React from 'react';

interface Props {
  onBack: () => void;
}

const features = [
  {
    tone: 'pink',
    title: 'Aprender jugando',
    text: 'Relaciona cada letra con imágenes y sonidos para aprender de forma natural.',
    icon: <path d="M12 3.5c-2.8-2.1-7-.4-7 3.1 0 1.2.5 2.4 1.4 3.2C5.5 11 5 12.7 5 14.5A4.5 4.5 0 0 0 9.5 19h5a4.5 4.5 0 0 0 4.5-4.5c0-1.8-.5-3.5-1.4-4.7.9-.8 1.4-2 1.4-3.2 0-3.5-4.2-5.2-7-3.1Z" />,
  },
  {
    tone: 'cyan',
    title: 'Voz clara',
    text: 'Las instrucciones habladas acompañan cada actividad con calma y entusiasmo.',
    icon: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7 7 0 0 1 0 10" /></>,
  },
  {
    tone: 'yellow',
    title: 'Estímulo visual',
    text: 'Colores, movimiento y pictogramas mantienen la atención sin sobrecargar la pantalla.',
    icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  },
  {
    tone: 'green',
    title: 'Progreso mágico',
    text: 'Cada logro abre nuevos retos y ayuda a avanzar con confianza, paso a paso.',
    icon: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></>,
  },
];

const Info: React.FC<Props> = ({ onBack }) => {
  return (
    <main className="info-page">
      <div className="info-shell">
        <button className="info-back" onClick={onBack} type="button" aria-label="Volver al inicio">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          Volver
        </button>

        <header className="info-hero">
          <div className="info-badge">Un mundo para descubrir</div>
          <h1>¿Qué es <span>MagicTris</span>?</h1>
          <p>Un juego de aprendizaje donde cada letra se convierte en una pequeña aventura.</p>
        </header>

        <section className="info-features" aria-label="Beneficios de MagicTris">
          {features.map((feature) => (
            <article className={`info-feature info-feature-${feature.tone}`} key={feature.title}>
              <div className="info-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="info-quote">
          <div className="info-quote-mark">“</div>
          <p>Cada letra es un paso lleno de alegría, curiosidad y aprendizaje.</p>
          <strong>La magia empieza jugando</strong>
        </section>
      </div>
    </main>
  );
};

export default Info;
