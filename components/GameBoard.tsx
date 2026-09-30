
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, MagicCard } from '../types';
import VoiceButton from './VoiceButton';
import { playPopSound, playGentleSuccessSound, playGentleErrorSound, playApplauseSound } from './AudioUtils';
import { FIRST_WORDS, PICTOGRAMS } from '../services/mockData';
import { useSettings } from './SettingsContext';

interface Props {
  user: User;
  card: MagicCard;
  onComplete: (scoreGain: number) => void;
  onBack: () => void;
}

type Step = 'greeting' | 'intro' | 'identify' | 'wordBuild' | 'reward' | 'success';

const GameBoard: React.FC<Props> = ({ user, card, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('greeting');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [touchedSyllables, setTouchedSyllables] = useState<number[]>([]);
  const [gumiMessage, setGumiMessage] = useState('');
  const voicePlayedRef = useRef(false);

  const { settings } = useSettings();
  const reduceAnim = settings.reduceAnimations;

  const wordData = useMemo(() => FIRST_WORDS.find(w => w.word === card.value), [card.value]);
  const pictInfo = PICTOGRAMS[card.value];

  const numChoices = useMemo(() => attempts < 2 ? 2 : attempts < 4 ? 3 : 4, [attempts]);

  const wordChoices = useMemo(() => {
    const others = FIRST_WORDS.filter(w => w.word !== card.value).map(w => w.word);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numChoices - 1);
    return [...selected, card.value].sort(() => Math.random() - 0.5);
  }, [card.value, numChoices]);

  useEffect(() => {
    if (step === 'intro' && settings.autoPlayVoice && settings.soundEnabled && !voicePlayedRef.current) {
      voicePlayedRef.current = true;
      const timer = setTimeout(() => {
        const speakBtn = document.querySelector('[data-auto-voice]') as HTMLButtonElement;
        if (speakBtn) speakBtn.click();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, settings.autoPlayVoice, settings.soundEnabled]);

  useEffect(() => {
    if (step === 'greeting') setGumiMessage(`¡Hola ${user.nickname}! Vamos a aprender.`);
    else if (step === 'intro') setGumiMessage(`Mira y escucha la palabra ${card.value}.`);
    else if (step === 'identify') setGumiMessage(`¿Cuál es ${card.value}? Toca la que brilla.`);
    else if (step === 'wordBuild') setGumiMessage(`¡Toca las sílabas para armar ${card.value}!`);
    else if (step === 'reward') {
      setGumiMessage(`¡Muy bien! ¡Aprendiste ${card.value}!`);
      if (settings.soundEnabled) playApplauseSound();
    }
  }, [step, user.nickname, card.value, settings.soundEnabled]);

  const playSound = (fn: () => void) => { if (settings.soundEnabled) fn(); };

  const handleStartActivity = () => { playSound(playPopSound); setAttempts(0); setStep('intro'); };

  const handleCorrectIdentify = () => {
    playSound(playGentleSuccessSound);
    setFeedback('success');
    setTimeout(() => { setFeedback(null); setWrongChoice(null); setTouchedSyllables([]); setStep('wordBuild'); }, 1200);
  };

  const handleCorrectWordBuild = () => {
    playSound(playGentleSuccessSound);
    setFeedback('success');
    setTimeout(() => { setFeedback(null); setStep('reward'); }, 800);
  };

  const handleError = (choice: string) => {
    playSound(playGentleErrorSound);
    setFeedback('error');
    setWrongChoice(choice);
    setGumiMessage('¡Casi! Intenta de nuevo, tú puedes.');
    setTimeout(() => { setFeedback(null); setGumiMessage(`¿Cuál es ${card.value}? Toca la que brilla.`); }, 1500);
  };

  const handleBack = () => { playSound(playPopSound); onBack(); };
  const handleComplete = () => { playSound(playPopSound); onComplete(100); };

  const handleSyllableTouch = (idx: number) => {
    playSound(playPopSound);
    setTouchedSyllables(prev => [...prev, idx]);
    if (wordData && touchedSyllables.length + 1 >= wordData.syllables.length) {
      setTimeout(() => handleCorrectWordBuild(), 400);
    }
  };

  const cardBase = "w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white border-4 border-indigo-200 shadow-xl flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 overflow-hidden relative";

  const renderHintWordCard = (choice: string, isCorrect: boolean, idx: number) => {
    const isWrong = wrongChoice === choice;
    const choicePict = PICTOGRAMS[choice];

    if (isWrong) {
      return (
        <div key={idx} className={`${cardBase} opacity-30 scale-90 pointer-events-none transition-all duration-500`}>
          {choicePict?.imageUrl && <img src={choicePict.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        </div>
      );
    }

    return (
      <button
        key={idx}
        onClick={() => {
          if (choice === card.value) { handleCorrectIdentify(); }
          else { handleError(choice); setAttempts(a => a + 1); }
        }}
        className={`${cardBase} ${isCorrect ? `ring-4 ring-amber-300 ${!reduceAnim ? 'animate-pulse' : ''}` : ''}`}
      >
        {choicePict?.imageUrl ? (
          <img src={choicePict.imageUrl} alt={choice} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-4xl sm:text-6xl">{choicePict?.icon || '✨'}</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500/90 py-1 text-center">
          <span className="font-magic text-white text-sm sm:text-lg uppercase leading-tight">{choice}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col p-3 sm:p-6 pt-20 sm:pt-24 overflow-y-auto">

      {/* Botón volver */}
      <button
        onClick={handleBack}
        className="absolute top-20 sm:top-24 left-3 sm:left-6 z-[110] bg-white/90 p-2 sm:p-3 rounded-xl border-2 border-indigo-200 text-lg sm:text-xl hover:bg-white transition-all active:scale-90 shadow-md"
      >
        ←
      </button>

      {/* Gumi guía */}
      <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-[110] flex flex-col items-end">
        <div className={`text-3xl sm:text-4xl ${!reduceAnim ? 'floating-gumi' : ''} select-none`}>👾</div>
      </div>

      {/* Mensaje de Gumi */}
      <div className="fixed top-28 sm:top-32 right-3 sm:right-6 z-[110] max-w-[170px] sm:max-w-[200px]">
        <div className="bg-white/95 rounded-2xl rounded-tr-none px-3 py-2 shadow-md border border-indigo-100">
          <p className="text-xs sm:text-sm text-indigo-700 font-bold leading-tight">{gumiMessage}</p>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-8 mt-14">

        {/* GREETING */}
        {step === 'greeting' && (
          <div className="flex flex-col items-center space-y-4 text-center w-full animate-fade-in">
            <div className={`text-7xl ${!reduceAnim ? 'animate-bounce' : ''}`}>👾</div>
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] border-4 border-indigo-200 max-w-xs w-full shadow-xl">
              <h3 className="text-xl sm:text-2xl font-magic text-indigo-700 uppercase mb-1">¡Hola, {user.nickname}!</h3>
              <p className="text-indigo-400 text-sm mb-3">Vamos a aprender una palabra.</p>
              <button
                onClick={handleStartActivity}
                className="w-full bg-indigo-500 text-white py-3 rounded-2xl text-lg sm:text-xl font-magic shadow-lg border-b-4 border-indigo-700 active:translate-y-1 transition-all uppercase tracking-widest"
              >
                ¡EMPEZAR!
              </button>
            </div>
          </div>
        )}

        {/* INTRO */}
        {step === 'intro' && (
          <div className="flex flex-col items-center space-y-3 text-center w-full animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] border-4 border-indigo-200 w-full max-w-sm space-y-3 shadow-xl">
              <div className="flex flex-col items-center justify-center py-4">
                <h3 className="font-magic text-4xl sm:text-6xl text-indigo-700 leading-none mb-3 uppercase tracking-tight">
                  {card.value}
                </h3>
                <div className="bg-white rounded-[2rem] border-4 border-indigo-100 shadow-lg overflow-hidden w-[85%] mx-auto">
                  {pictInfo?.imageUrl ? (
                    <img src={pictInfo.imageUrl} alt={card.pictogramWord} className="w-full h-36 sm:h-48 object-cover" />
                  ) : (
                    <div className="text-6xl sm:text-7xl py-6">{card.icon}</div>
                  )}
                  <div className="py-1.5 bg-white">
                    <span className="font-magic text-xl sm:text-2xl text-indigo-700 uppercase tracking-tight">{card.pictogramWord}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <VoiceButton
                  text={card.audioInstruction}
                  className="w-full py-3 bg-indigo-500 rounded-full border-b-4 border-indigo-700 justify-center"
                  autoPlayMarker
                />
                <button
                  onClick={() => { setAttempts(0); setStep('identify'); }}
                  className="w-full bg-cyan-500 text-white py-3.5 rounded-2xl text-xl sm:text-2xl font-magic shadow-lg border-b-4 border-cyan-700 active:translate-y-1 transition-all uppercase tracking-widest"
                >
                  ¡JUGAR!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IDENTIFY */}
        {step === 'identify' && (
          <div className="w-full flex flex-col items-center justify-center space-y-5 py-2 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border-2 border-indigo-200 max-w-lg w-full text-center shadow-lg">
              <VoiceButton text={`¿Cuál es ${card.value}? Toca la correcta.`} className="bg-indigo-500 rounded-full mb-2" large />
              <h3 className="text-lg sm:text-2xl font-magic text-indigo-700 uppercase">¿Cuál es {card.value}?</h3>
            </div>
            <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-2">
              {wordChoices.map((choice, idx) => renderHintWordCard(choice, choice === card.value, idx))}
            </div>
          </div>
        )}

        {/* WORD BUILD */}
        {step === 'wordBuild' && wordData && (
          <div className="w-full flex flex-col items-center justify-center space-y-4 py-2 animate-fade-in">
            <div className="bg-indigo-500 p-3 rounded-2xl max-w-lg w-full text-center shadow-lg">
              <h3 className="text-lg sm:text-2xl font-magic text-white uppercase">Arma: {card.value}</h3>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-indigo-200 shadow-lg flex flex-col items-center">
              {pictInfo?.imageUrl && (
                <img src={pictInfo.imageUrl} alt={wordData.word} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl mb-3 border-2 border-indigo-200" />
              )}
              <div className="flex gap-2 sm:gap-3 justify-center items-center">
                {wordData.syllables.map((syl, idx) => {
                  const touched = touchedSyllables.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => !touched && handleSyllableTouch(idx)}
                      disabled={touched}
                      className={`w-18 h-24 sm:w-24 sm:h-32 rounded-2xl bg-white border-4 flex items-center justify-center shadow-lg transition-all px-2 ${
                        !touched
                          ? `border-indigo-200 hover:scale-105 active:scale-95 ${!reduceAnim ? 'ring-4 ring-amber-300/70 animate-pulse' : ''}`
                          : 'border-emerald-400 ring-2 ring-emerald-400'
                      }`}
                      style={{ width: touched ? 'auto' : undefined, minWidth: '72px' }}
                    >
                      <span className={`font-magic text-2xl sm:text-4xl leading-none ${touched ? 'text-emerald-500' : 'text-indigo-700'}`}>
                        {syl}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* REWARD */}
        {step === 'reward' && (
          <div className="flex flex-col items-center space-y-4 text-center w-full animate-fade-in">
            <div className="bg-white/95 p-6 rounded-[2.5rem] border-4 border-indigo-200 shadow-xl max-w-xs w-full">
              <div className={`text-6xl mb-2 ${!reduceAnim ? 'animate-bounce' : ''}`}>👾</div>
              <h3 className="text-2xl sm:text-3xl font-magic text-indigo-700 uppercase mb-1">¡MUY BIEN!</h3>
              <p className="text-base sm:text-lg font-bold text-indigo-500 uppercase mb-3">¡Aprendiste {card.value}!</p>
              <div className="bg-indigo-50 rounded-2xl p-2.5 mb-3 flex flex-col items-center">
                {pictInfo?.imageUrl && (
                  <img src={pictInfo.imageUrl} alt={card.pictogramWord} className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-200" />
                )}
                <span className="font-magic text-xl text-indigo-700 uppercase mt-1">{card.pictogramWord}</span>
              </div>
              <div className={`text-4xl mb-1 ${!reduceAnim ? 'animate-bounce' : ''}`}>⭐</div>
              <p className="text-indigo-500 font-bold text-sm">+100 estrellas</p>
            </div>
            <button
              onClick={handleComplete}
              className="bg-indigo-500 text-white py-3 px-8 rounded-full text-lg sm:text-xl font-magic shadow-lg border-b-4 border-indigo-700 uppercase tracking-widest active:scale-95 transition-all"
            >
              SIGUIENTE
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="flex flex-col items-center space-y-4 text-center w-full">
            <div className={`text-7xl ${!reduceAnim ? 'animate-bounce' : ''}`}>🌟</div>
            <button
              onClick={handleComplete}
              className="bg-indigo-500 text-white py-3 px-8 rounded-full text-lg sm:text-xl font-magic shadow-lg border-b-4 border-indigo-700 uppercase tracking-widest active:scale-95 transition-all"
            >
              CONTINUAR
            </button>
          </div>
        )}

        {/* FEEDBACK positivo */}
        {feedback === 'success' && (
          <div className="fixed inset-0 flex items-center justify-center bg-emerald-400/20 z-[150] backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <div className="text-6xl sm:text-8xl">✨</div>
              <p className="text-xl sm:text-2xl font-magic text-indigo-700 uppercase mt-2">¡Muy bien!</p>
            </div>
          </div>
        )}

        {feedback === 'error' && (
          <div className="fixed inset-0 flex items-center justify-center bg-amber-400/15 z-[150] backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <div className="text-5xl">😊</div>
              <p className="text-lg sm:text-xl font-magic text-indigo-600 uppercase mt-2">¡Casi! Otra vez</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;
