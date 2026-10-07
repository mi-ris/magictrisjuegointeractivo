import React from 'react';
import { getSharedAudioContext, playPopSound } from './AudioUtils';

interface Props { onStart: () => void; }

const letters = [
  { letter: 'A', color: 'pink', symbol: '🧠' },
  { letter: 'E', color: 'yellow', symbol: '●' },
  { letter: 'I', color: 'green', symbol: '☘' },
];

const PreLogin: React.FC<Props> = ({ onStart }) => {
  const handleStart = () => {
    const context = getSharedAudioContext();
    if (context.state === 'suspended') context.resume();
    playPopSound();
    onStart();
  };

  return (
    <main className="cover-page">
      <div className="cover-content">
        <header className="cover-heading">
          <h1>MAGICTRIS</h1>
          <p>¡La magia de aprender!</p>
        </header>

        <section className="vowel-cards" aria-label="Vocales mágicas">
          {letters.map((item) => (
            <article className={`vowel-card vowel-card-${item.color}`} key={item.letter}>
              <span className="vowel-symbol" aria-hidden="true">{item.symbol}</span>
              <span className="vowel-letter">{item.letter}</span>
            </article>
          ))}
        </section>

        <button className="start-button" onClick={handleStart} type="button">COMENZAR</button>
        <p className="cover-footer">✦ HECHO CON MAGIA PARA NIÑOS CURIOSOS ✦</p>
      </div>
    </main>
  );
};

export default PreLogin;
