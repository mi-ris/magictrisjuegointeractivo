import React from 'react';

interface Props {
  onStart: () => void;
}

const cards = [
  { letter: 'A', color: 'pink', icon: '🧠' },
  { letter: 'E', color: 'yellow', icon: '●' },
  { letter: 'I', color: 'green', icon: '♣' },
] as const;

const PreLogin: React.FC<Props> = ({ onStart }) => {
  return (
    <main className="cover-page">
      <section className="cover-content" aria-label="MagicTris">
        <header className="cover-heading">
          <h1>MAGICTRIS</h1>
          <p>¡La magia de aprender!</p>
        </header>

        <div className="letter-cards" aria-label="Vocales mágicas">
          {cards.map((card) => (
            <article className={`letter-card letter-card--${card.color}`} key={card.letter}>
              <span className={`card-icon card-icon--${card.color}`} aria-hidden="true">
                {card.icon}
              </span>
              <strong>{card.letter}</strong>
            </article>
          ))}
        </div>

        <button className="start-button" type="button" onClick={onStart}>
          <span>COMENZAR</span>
        </button>

        <p className="cover-footer">Hecho con magia para niños curiosos</p>
      </section>
    </main>
  );
};

export default PreLogin;
