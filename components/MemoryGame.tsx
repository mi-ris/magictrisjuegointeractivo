
import React, { useState, useEffect, useCallback } from 'react';
import { PICTOGRAMS } from '../services/mockData';
import { playPopSound, playGentleSuccessSound, playGentleErrorSound, playRewardSound, speakText } from './AudioUtils';

interface MemCard {
  id: number;
  word: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const WORDS = Object.keys(PICTOGRAMS).slice(0, 6);

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [locked, setLocked] = useState(false);

  const initGame = useCallback(() => {
    const deck = [...WORDS, ...WORDS]
      .sort(() => Math.random() - 0.5)
      .map((word, idx) => ({
        id: idx,
        word,
        imageUrl: PICTOGRAMS[word]?.imageUrl || '',
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);
    setFlipped([]);
    setMatches(0);
    setLocked(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (id: number) => {
    if (locked || flipped.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    playPopSound();

    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [first, second] = newFlipped;

      setCards(prev => {
        if (prev[first].word === prev[second].word) {
          // Match!
          setTimeout(() => {
            playGentleSuccessSound();
            const word = prev[first].word;
            speakText(`¡${PICTOGRAMS[word]?.word || word}!`).catch(() => {});
            setCards(p => p.map(c =>
              c.id === first || c.id === second ? { ...c, isMatched: true } : c
            ));
            setFlipped([]);
            setLocked(false);
            setMatches(m => {
              const newM = m + 1;
              if (newM === WORDS.length) {
                setTimeout(() => playRewardSound(), 300);
              }
              return newM;
            });
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            playGentleErrorSound();
            setCards(p => p.map(c =>
              c.id === first || c.id === second ? { ...c, isFlipped: false } : c
            ));
            setFlipped([]);
            setLocked(false);
          }, 1000);
        }
        return prev;
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-magic text-yellow-600 mb-6 uppercase tracking-wider">Juego de Memoria</h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center transition-all duration-300 transform border-b-4 active:scale-95 overflow-hidden ${
              card.isFlipped || card.isMatched
                ? 'bg-white border-yellow-200 shadow-inner'
                : 'bg-yellow-400 border-yellow-600 shadow-lg'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              card.imageUrl ? (
                <img src={card.imageUrl} alt={card.word} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-magic text-indigo-700 uppercase">{card.word}</span>
              )
            ) : (
              <span className="text-4xl">❓</span>
            )}
          </button>
        ))}
      </div>

      {matches === WORDS.length && (
        <div className="text-center animate-bounce">
          <h3 className="text-4xl text-green-500 font-bold mb-4 font-magic">¡Ganaste! 🎉</h3>
          <button
            onClick={initGame}
            className="bg-green-500 text-white px-8 py-3 rounded-full shadow-lg font-bold text-xl btn-magic-pop"
          >
            Jugar otra vez
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-8 items-center">
        <div className="text-center">
          <p className="text-blue-400 uppercase text-xs font-bold">Parejas</p>
          <p className="text-3xl font-bold text-blue-600">{matches}</p>
        </div>
        <button onClick={initGame} className="text-blue-400 hover:text-red-500 font-bold transition-colors">
          Reiniciar
        </button>
      </div>
    </div>
  );
};

export default MemoryGame;
