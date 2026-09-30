
import React, { useState, useMemo } from 'react';
import { User, MagicCard } from '../types';
import VoiceButton from './VoiceButton';
import { playPopSound, playSuccessSound } from './AudioUtils';
import { FIRST_WORDS } from '../services/mockData';

interface Props {
  user: User;
  card: MagicCard;
  onComplete: (scoreGain: number) => void;
  onBack: () => void;
}

type Step = 'intro' | 'identify' | 'wordBuild' | 'success';

const GameBoard: React.FC<Props> = ({ card, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('intro');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [touchedSyllables, setTouchedSyllables] = useState<number[]>([]);

  const wordData = useMemo(() => FIRST_WORDS.find(w => w.word === card.value), [card.value]);

  const numChoices = useMemo(() => {
    return attempts < 2 ? 2 : attempts < 4 ? 3 : 4;
  }, [attempts]);

  const wordChoices = useMemo(() => {
    const others = FIRST_WORDS.filter(w => w.word !== card.value).map(w => w.word);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numChoices - 1);
    return [...selected, card.value].sort(() => Math.random() - 0.5);
  }, [card.value, numChoices]);

  const handleCorrectIdentify = () => {
    playSuccessSound();
    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setWrongChoice(null);
      setTouchedSyllables([]);
      setStep('wordBuild');
    }, 1200);
  };

  const handleCorrectWordBuild = () => {
    playSuccessSound();
    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setStep('success');
    }, 1200);
  };

  const handleError = (choice: string) => {
    playPopSound();
    setFeedback('error');
    setWrongChoice(choice);
    setTimeout(() => setFeedback(null), 1000);
  };

  const handleBack = () => {
    playPopSound();
    onBack();
  };

  const handleStartGame = () => {
    playPopSound();
    setAttempts(0);
    setStep('identify');
  };

  const handleComplete = () => {
    playPopSound();
    onComplete(100);
  };

  const handleSyllableTouch = (idx: number) => {
    playPopSound();
    setTouchedSyllables(prev => [...prev, idx]);
    if (wordData && touchedSyllables.length + 1 >= wordData.syllables.length) {
      setTimeout(() => handleCorrectWordBuild(), 400);
    }
  };

  const renderHighlightedWord = (word: string) => {
    const wordSizeClass = word.length > 8 ? 'text-xl sm:text-3xl' : (word.length > 5 ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl');
    return (
      <span className={`font-magic uppercase tracking-tight text-indigo-900 drop-shadow-sm whitespace-nowrap ${wordSizeClass}`}>
        {word}
      </span>
    );
  };

  const bubbleClass = "w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-indigo-800/60 border-[6px] sm:border-[8px] border-white/40 shadow-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 overflow-hidden p-3";
  const syllableCardClass = "w-24 h-32 sm:w-32 sm:h-40 rounded-[2rem] bg-white border-[6px] sm:border-[10px] border-indigo-200 flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-center overflow-hidden p-2";

  const renderHintWordCard = (choice: string, isCorrect: boolean, idx: number) => {
    const isWrong = wrongChoice === choice;
    if (isWrong) {
      return (
        <div
          key={idx}
          className={`${bubbleClass} opacity-0 scale-0 pointer-events-none transition-all duration-500`}
        />
      );
    }
    const choiceWord = FIRST_WORDS.find(w => w.word === choice);
    return (
      <button
        key={idx}
        onClick={() => {
          if (choice === card.value) {
            handleCorrectIdentify();
          } else {
            handleError(choice);
            setAttempts(a => a + 1);
          }
        }}
        className={`${bubbleClass} ${isCorrect ? 'ring-4 ring-amber-300/60 animate-pulse' : ''}`}
      >
        {choiceWord && <span className="text-4xl sm:text-7xl leading-none mb-1">{choiceWord.icon}</span>}
        <span className="font-magic text-white text-lg sm:text-2xl uppercase leading-tight">{choice}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-indigo-950/90 backdrop-blur-sm z-[100] flex flex-col p-3 sm:p-6 pt-24 sm:pt-28 overflow-y-auto">
      <button
        onClick={handleBack}
        className="absolute top-24 sm:top-28 left-3 sm:left-6 z-[110] bg-white/10 p-2 sm:p-3 rounded-2xl border-2 border-white/20 text-lg sm:text-xl hover:bg-white/20 transition-all active:scale-90 shadow-lg"
      >
        ←
      </button>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full pb-8 sm:pb-10">

        {/* INTRO - ver y escuchar la palabra completa */}
        {step === 'intro' && (
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 text-center w-full animate-fade-in">
            <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-10 rounded-[3rem] sm:rounded-[4rem] border-2 sm:border-4 border-white/30 w-full max-w-lg space-y-6 shadow-2xl">
              <div className="flex flex-col items-center justify-center bg-indigo-900/40 py-6 sm:py-8 rounded-[2rem] sm:rounded-[3rem] border-2 border-white/10 shadow-inner overflow-hidden">
                <h3 className="font-magic text-[50px] sm:text-[90px] text-black leading-none mb-3 uppercase tracking-tight drop-shadow-lg">
                  {card.value}
                </h3>
                <div className="bg-white p-4 sm:p-6 rounded-[2rem] border-2 sm:border-4 border-indigo-100 shadow-xl flex flex-col items-center w-[90%] mx-auto">
                  <span className="text-6xl sm:text-8xl mb-2 leading-none">{card.icon}</span>
                  {renderHighlightedWord(card.pictogramWord)}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <VoiceButton text={card.audioInstruction} className="w-full py-3 sm:py-4 bg-indigo-500 rounded-full border-b-[6px] sm:border-b-[8px] border-indigo-800 justify-center" />
                <button
                  onClick={handleStartGame}
                  className="w-full bg-cyan-500 text-white py-4 sm:py-5 rounded-[2rem] text-2xl sm:text-3xl font-magic shadow-2xl hover:bg-cyan-600 border-b-[6px] sm:border-b-[8px] border-cyan-800 transition-all active:translate-y-1 uppercase tracking-widest"
                >
                  JUGAR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IDENTIFY - Toca la palabra correcta (2 opciones con pista) */}
        {step === 'identify' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-4 sm:py-6 animate-fade-in">
            <div className="bg-indigo-900/60 backdrop-blur-xl p-5 sm:p-7 rounded-[2rem] border-2 border-white/20 shadow-2xl max-w-lg w-full">
              <h3 className="text-lg sm:text-3xl font-magic text-white leading-tight uppercase text-center">
                ¿Cuál es {card.value}?
              </h3>
            </div>

            <div className="flex-1 w-full flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-2">
              {wordChoices.map((choice, idx) => renderHintWordCard(choice, choice === card.value, idx))}
            </div>

            {wrongChoice && (
              <p className="text-amber-300 text-sm sm:text-base font-bold uppercase animate-fade-in">
                Casi... intenta con la que brilla
              </p>
            )}
          </div>
        )}

        {/* WORD BUILD - Armar la palabra tocando sílabas */}
        {step === 'wordBuild' && wordData && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-4 sm:py-6 animate-fade-in">
            <div className="bg-gradient-to-r from-rose-400 to-pink-600 p-5 sm:p-7 rounded-[2rem] border-2 sm:border-4 border-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] max-w-lg w-full">
              <h3 className="text-xl sm:text-4xl font-magic text-white leading-tight uppercase text-center drop-shadow-lg">
                Arma la palabra {card.value}
              </h3>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border-2 border-white/20 shadow-2xl">
              <div className="text-6xl sm:text-8xl text-center mb-4">{wordData.icon}</div>
              <div className="flex gap-2 sm:gap-3 justify-center items-center">
                {wordData.syllables.map((syl, idx) => {
                  const touched = touchedSyllables.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => !touched && handleSyllableTouch(idx)}
                      disabled={touched}
                      className={`${syllableCardClass} ${!touched ? 'ring-4 ring-amber-300/70 animate-pulse' : 'ring-2 ring-emerald-400 opacity-50'} transition-all`}
                    >
                      <span className="font-magic text-[36px] sm:text-[60px] text-indigo-900 leading-none">
                        {touched ? syl : syl}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-cyan-200 text-xs sm:text-sm text-center mt-4 font-bold uppercase tracking-wider">
                Toca cada sílaba para armar la palabra
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="bg-gradient-to-br from-amber-400 via-cyan-500 to-teal-500 p-8 sm:p-14 rounded-[3rem] sm:rounded-[5rem] border-[6px] sm:border-[10px] border-white shadow-[0_0_80px_rgba(20,184,166,0.5)] text-center space-y-6 sm:space-y-8 max-w-lg w-full animate-bounce-in">
            <div className="text-[90px] sm:text-[160px] drop-shadow-2xl">🌟</div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-6xl font-magic text-white drop-shadow-lg tracking-tighter uppercase">EXCELENTE</h3>
              <p className="text-base sm:text-xl font-bold text-white uppercase tracking-[0.15em] opacity-90">
                ¡Aprendiste la palabra {card.value}!
              </p>
            </div>
            <button
              onClick={handleComplete}
              className="bg-white text-teal-600 py-4 sm:py-5 px-8 sm:px-14 rounded-full text-xl sm:text-3xl font-magic shadow-2xl hover:scale-110 active:scale-95 transition-all border-b-[6px] sm:border-b-[8px] border-teal-200 uppercase tracking-widest"
            >
              SIGUIENTE
            </button>
          </div>
        )}

        {/* FEEDBACK overlays */}
        {feedback === 'success' && (
          <div className="fixed inset-0 flex items-center justify-center bg-emerald-500/30 z-[150] backdrop-blur-lg">
            <span className="text-[100px] sm:text-[180px] animate-bounce">✨</span>
          </div>
        )}

        {feedback === 'error' && (
          <div className="fixed inset-0 flex items-center justify-center bg-rose-500/20 z-[150] backdrop-blur-md">
            <div className="bg-white p-8 sm:p-10 rounded-[3rem] border-8 border-rose-400 shadow-2xl animate-bounce-in">
              <span className="text-2xl sm:text-3xl font-magic text-rose-500 uppercase tracking-widest">Intenta de nuevo</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;
