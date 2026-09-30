
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

  const numChoices = useMemo(() => {
    return attempts < 2 ? 2 : attempts < 4 ? 3 : 4;
  }, [attempts]);

  const wordChoices = useMemo(() => {
    const others = FIRST_WORDS.filter(w => w.word !== card.value).map(w => w.word);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numChoices - 1);
    return [...selected, card.value].sort(() => Math.random() - 0.5);
  }, [card.value, numChoices]);

  // Auto-play voice when entering intro
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

  // Gumi messages per step
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

  const playSound = (fn: () => void) => {
    if (settings.soundEnabled) fn();
  };

  const handleStartActivity = () => {
    playSound(playPopSound);
    setAttempts(0);
    setStep('intro');
  };

  const handleCorrectIdentify = () => {
    playSound(playGentleSuccessSound);
    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setWrongChoice(null);
      setTouchedSyllables([]);
      setStep('wordBuild');
    }, 1200);
  };

  const handleCorrectWordBuild = () => {
    playSound(playGentleSuccessSound);
    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setStep('reward');
    }, 800);
  };

  const handleError = (choice: string) => {
    playSound(playGentleErrorSound);
    setFeedback('error');
    setWrongChoice(choice);
    setGumiMessage('¡Casi! Intenta de nuevo, tú puedes.');
    setTimeout(() => {
      setFeedback(null);
      setGumiMessage(`¿Cuál es ${card.value}? Toca la que brilla.`);
    }, 1500);
  };

  const handleBack = () => {
    playSound(playPopSound);
    onBack();
  };

  const handleComplete = () => {
    playSound(playPopSound);
    onComplete(100);
  };

  const handleSyllableTouch = (idx: number) => {
    playSound(playPopSound);
    setTouchedSyllables(prev => [...prev, idx]);
    if (wordData && touchedSyllables.length + 1 >= wordData.syllables.length) {
      setTimeout(() => handleCorrectWordBuild(), 400);
    }
  };

  const bubbleClass = "w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[6px] border-white/50 shadow-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 overflow-hidden p-0 relative";

  const renderHintWordCard = (choice: string, isCorrect: boolean, idx: number) => {
    const isWrong = wrongChoice === choice;
    const choiceWord = FIRST_WORDS.find(w => w.word === choice);
    const choicePict = PICTOGRAMS[choice];

    if (isWrong) {
      return (
        <div
          key={idx}
          className={`${bubbleClass} bg-indigo-800/40 opacity-30 scale-90 pointer-events-none transition-all duration-500`}
        >
          {choicePict?.imageUrl && (
            <img src={choicePict.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <span className="font-magic text-white/40 text-lg uppercase">{choice}</span>
        </div>
      );
    }

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
        className={`${bubbleClass} ${isCorrect ? `ring-4 ring-amber-300 ${!reduceAnim ? 'animate-pulse' : ''} bg-cyan-500` : 'bg-indigo-700'}`}
      >
        {choicePict?.imageUrl ? (
          <img
            src={choicePict.imageUrl}
            alt={choiceWord?.word || choice}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl sm:text-6xl leading-none mb-1">{choiceWord?.icon}</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center">
          <span className="font-magic text-white text-sm sm:text-lg uppercase leading-tight">{choice}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-900 via-indigo-950 to-blue-950 z-[100] flex flex-col p-3 sm:p-6 pt-20 sm:pt-24 overflow-y-auto">

      {/* Botón volver */}
      <button
        onClick={handleBack}
        className="absolute top-20 sm:top-24 left-3 sm:left-6 z-[110] bg-white/10 p-2 sm:p-3 rounded-2xl border-2 border-white/20 text-lg sm:text-xl hover:bg-white/20 transition-all active:scale-90 shadow-lg"
      >
        ←
      </button>

      {/* Gumi guía flotante */}
      <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-[110] flex flex-col items-end">
        <div className={`text-4xl sm:text-5xl ${!reduceAnim ? 'floating-gumi' : ''} select-none`}>👾</div>
      </div>

      {/* Mensaje de Gumi */}
      <div className="fixed top-32 sm:top-36 right-3 sm:right-6 z-[110] max-w-[180px] sm:max-w-[220px]">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl rounded-tr-none px-3 py-2 shadow-lg">
          <p className="text-xs sm:text-sm text-indigo-800 font-bold leading-tight">{gumiMessage}</p>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-8 sm:pb-10 mt-16">

        {/* GREETING - Rutina: saludo de Gumi */}
        {step === 'greeting' && (
          <div className="flex flex-col items-center space-y-6 text-center w-full animate-fade-in">
            <div className={`text-8xl ${!reduceAnim ? 'animate-bounce' : ''}`}>👾</div>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/20 max-w-sm w-full">
              <h3 className="text-2xl sm:text-3xl font-magic text-white uppercase mb-2">¡Hola, {user.nickname}!</h3>
              <p className="text-cyan-200 text-sm sm:text-base mb-4">Vamos a aprender una palabra nueva.</p>
              <button
                onClick={handleStartActivity}
                className="w-full bg-cyan-500 text-white py-4 rounded-[2rem] text-xl sm:text-2xl font-magic shadow-2xl border-b-[6px] border-cyan-800 transition-all active:translate-y-1 uppercase tracking-widest"
              >
                ¡EMPEZAR!
              </button>
            </div>
          </div>
        )}

        {/* INTRO - Ver y escuchar la palabra completa */}
        {step === 'intro' && (
          <div className="flex flex-col items-center space-y-4 text-center w-full animate-fade-in">
            <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[3rem] border-2 border-white/30 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex flex-col items-center justify-center bg-indigo-900/40 py-6 rounded-[2rem] border-2 border-white/10 overflow-hidden">
                <h3 className="font-magic text-[40px] sm:text-[70px] text-white leading-none mb-3 uppercase tracking-tight drop-shadow-lg">
                  {card.value}
                </h3>
                <div className="bg-white rounded-[2rem] border-4 border-indigo-100 shadow-xl overflow-hidden w-[80%] mx-auto">
                  {pictInfo?.imageUrl ? (
                    <img
                      src={pictInfo.imageUrl}
                      alt={card.pictogramWord}
                      className="w-full h-40 sm:h-52 object-cover"
                    />
                  ) : (
                    <div className="text-6xl sm:text-8xl py-6">{card.icon}</div>
                  )}
                  <div className="py-2 bg-white">
                    <span className="font-magic text-2xl sm:text-3xl text-indigo-900 uppercase tracking-tight">
                      {card.pictogramWord}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <VoiceButton
                  text={card.audioInstruction}
                  className="w-full py-3 sm:py-4 bg-indigo-500 rounded-full border-b-[6px] border-indigo-800 justify-center"
                  autoPlayMarker
                />
                <button
                  onClick={() => { setAttempts(0); setStep('identify'); }}
                  className="w-full bg-cyan-500 text-white py-4 sm:py-5 rounded-[2rem] text-2xl sm:text-3xl font-magic shadow-2xl border-b-[6px] border-cyan-800 transition-all active:translate-y-1 uppercase tracking-widest"
                >
                  ¡JUGAR!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IDENTIFY - Toca la palabra correcta (2 opciones, pista visual) */}
        {step === 'identify' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 py-4 animate-fade-in">
            <div className="bg-indigo-900/60 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] border-2 border-white/20 max-w-lg w-full text-center">
              <VoiceButton
                text={`¿Cuál es ${card.value}? Toca la correcta.`}
                className="bg-cyan-500 rounded-full mb-3"
                large
              />
              <h3 className="text-lg sm:text-2xl font-magic text-white leading-tight uppercase">
                ¿Cuál es {card.value}?
              </h3>
            </div>

            <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-2">
              {wordChoices.map((choice, idx) => renderHintWordCard(choice, choice === card.value, idx))}
            </div>
          </div>
        )}

        {/* WORD BUILD - Armar la palabra tocando sílabas */}
        {step === 'wordBuild' && wordData && (
          <div className="w-full flex flex-col items-center justify-center space-y-6 py-4 animate-fade-in">
            <div className="bg-gradient-to-r from-rose-400 to-pink-600 p-4 rounded-[2rem] border-2 border-white max-w-lg w-full text-center">
              <h3 className="text-xl sm:text-3xl font-magic text-white uppercase drop-shadow-lg">
                Arma: {card.value}
              </h3>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border-2 border-white/20 shadow-2xl flex flex-col items-center">
              {pictInfo?.imageUrl && (
                <img src={pictInfo.imageUrl} alt={wordData.word} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl mb-4 border-2 border-white/30" />
              )}
              <div className="flex gap-2 sm:gap-3 justify-center items-center">
                {wordData.syllables.map((syl, idx) => {
                  const touched = touchedSyllables.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => !touched && handleSyllableTouch(idx)}
                      disabled={touched}
                      className={`w-20 h-28 sm:w-28 sm:h-36 rounded-[1.5rem] bg-white border-[5px] flex items-center justify-center shadow-2xl transition-all ${
                        !touched
                          ? `border-indigo-200 hover:scale-105 active:scale-95 ${!reduceAnim ? 'ring-4 ring-amber-300/70 animate-pulse' : ''}`
                          : 'border-emerald-400 ring-2 ring-emerald-400'
                      }`}
                    >
                      <span className={`font-magic text-[32px] sm:text-[50px] leading-none ${touched ? 'text-emerald-600' : 'text-indigo-900'}`}>
                        {syl}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* REWARD - Celebración con Gumi (rutina: premio) */}
        {step === 'reward' && (
          <div className="flex flex-col items-center space-y-6 text-center w-full animate-fade-in">
            <div className="bg-gradient-to-br from-amber-400 via-cyan-500 to-teal-500 p-8 rounded-[3rem] border-[6px] border-white shadow-[0_0_60px_rgba(20,184,166,0.4)] max-w-sm w-full">
              <div className={`text-7xl mb-4 ${!reduceAnim ? 'animate-bounce' : ''}`}>👾</div>
              <h3 className="text-3xl sm:text-4xl font-magic text-white drop-shadow-lg uppercase mb-2">¡MUY BIEN!</h3>
              <p className="text-lg sm:text-xl font-bold text-white uppercase mb-4">
                ¡Aprendiste {card.value}!
              </p>
              <div className="bg-white/20 rounded-2xl p-3 mb-4">
                {pictInfo?.imageUrl && (
                  <img src={pictInfo.imageUrl} alt={card.pictogramWord} className="w-20 h-20 mx-auto rounded-xl object-cover border-2 border-white/50" />
                )}
                <span className="font-magic text-2xl text-white uppercase mt-2 block">{card.pictogramWord}</span>
              </div>
              <div className={`text-5xl mb-2 ${!reduceAnim ? 'animate-bounce' : ''}`}>⭐</div>
              <p className="text-white font-bold">+100 estrellas</p>
            </div>
            <button
              onClick={handleComplete}
              className="bg-white text-teal-600 py-4 px-10 rounded-full text-xl sm:text-2xl font-magic shadow-2xl border-b-[6px] border-teal-200 uppercase tracking-widest active:scale-95 transition-all"
            >
              SIGUIENTE
            </button>
          </div>
        )}

        {/* SUCCESS - transición final */}
        {step === 'success' && (
          <div className="flex flex-col items-center space-y-6 text-center w-full">
            <div className={`text-8xl ${!reduceAnim ? 'animate-bounce' : ''}`}>🌟</div>
            <button
              onClick={handleComplete}
              className="bg-white text-teal-600 py-4 px-10 rounded-full text-xl sm:text-2xl font-magic shadow-2xl border-b-[6px] border-teal-200 uppercase tracking-widest active:scale-95 transition-all"
            >
              CONTINUAR
            </button>
          </div>
        )}

        {/* FEEDBACK: solo positivo, sin sonidos negativos fuertes */}
        {feedback === 'success' && (
          <div className="fixed inset-0 flex items-center justify-center bg-emerald-500/20 z-[150] backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <div className="text-7xl sm:text-9xl">✨</div>
              <p className="text-2xl sm:text-3xl font-magic text-white drop-shadow-lg uppercase mt-2">¡Muy bien!</p>
            </div>
          </div>
        )}

        {feedback === 'error' && (
          <div className="fixed inset-0 flex items-center justify-center bg-amber-500/15 z-[150] backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <div className="text-6xl">😊</div>
              <p className="text-xl sm:text-2xl font-magic text-white drop-shadow-lg uppercase mt-2">¡Casi! Intenta otra vez</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;
