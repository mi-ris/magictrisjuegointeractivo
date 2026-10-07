import React from 'react';
import { getSharedAudioContext, playPopSound } from './AudioUtils';
import CloudBackground from './CloudBackground';

interface Props { onStart: () => void; }

const wordCards = [
  { word: 'CASA', imageUrl: '/word-casa.webp', color: 'pink' },
  { word: 'SOL', imageUrl: '/word-sol.webp', color: 'yellow' },
  { word: 'GATO', imageUrl: '/word-gato.webp', color: 'green' },
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
      <CloudBackground />
      <div className="cover-content">
        <header className="cover-heading">
          <h1>MAGICTRIS</h1>
          <p>¡La magia de aprender!</p>
        </header>

        <section className="word-cards" aria-label="Palabras mágicas">
          {wordCards.map((card) => (
            <article className={`word-card word-card-${card.color}`} key={card.word}>
              <div className="word-image-frame">
                <img src={card.imageUrl} alt={card.word} className="word-image" />
              </div>
              <span className="word-label">{card.word}</span>
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
