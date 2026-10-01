
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, MagicCard } from '../types';
import VoiceButton from './VoiceButton';
import { playPopSound, playGentleSuccessSound, playGentleErrorSound, playRewardSound, stopCurrentVoice, speakText } from './AudioUtils';
import { FIRST_WORDS, PICTOGRAMS } from '../services/mockData';
import { useSettings } from './SettingsContext';
import { supabase } from '../services/supabaseClient';

interface Props {
  user: User;
  card: MagicCard;
  cardIndex: number;
  onComplete: (scoreGain: number) => void;
  onBack: () => void;
}

type GameType = 'identify' | 'wordBuild' | 'imageMatch' | 'syllableFill' | 'listenPick';
type Step = 'intro' | GameType | 'reward';

const GAME_ROTATION: GameType[][] = [
  ['identify', 'wordBuild'],
  ['imageMatch', 'wordBuild'],
  ['identify', 'syllableFill'],
  ['listenPick', 'wordBuild'],
  ['imageMatch', 'syllableFill'],
  ['identify', 'listenPick'],
  ['wordBuild', 'imageMatch'],
  ['syllableFill', 'listenPick'],
];

const logAttempt = async (userId: string, cardId: string, cardValue: string, step: string, isCorrect: boolean, wrongChoice: string | null, attemptsCount: number, timeMs: number | null) => {
  try {
    await supabase.from('game_attempts').insert({
      user_id: userId,
      card_id: cardId,
      card_value: cardValue,
      step,
      is_correct: isCorrect,
      wrong_choice: wrongChoice,
      attempts_count: attemptsCount,
      time_spent_ms: timeMs,
    });
  } catch (err) {
    console.warn('No se pudo registrar intento:', err);
  }
};

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GameBoard: React.FC<Props> = ({ user, card, cardIndex, onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('intro');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [touchedSyllables, setTouchedSyllables] = useState<number[]>([]);
  const [gumiMessage, setGumiMessage] = useState('');
  const levelStartTime = useRef<number>(Date.now());
  const gameStartTime = useRef<number>(Date.now());

  const { settings } = useSettings();
  const reduceAnim = settings.reduceAnimations;

  const wordData = useMemo(() => FIRST_WORDS.find(w => w.word === card.value), [card.value]);
  const pictInfo = PICTOGRAMS[card.value];

  const games = useMemo(() => GAME_ROTATION[cardIndex % GAME_ROTATION.length], [cardIndex]);
  const [currentGameIdx, setCurrentGameIdx] = useState(0);
  const currentGame = games[currentGameIdx];

  const numChoices = useMemo(() => attempts < 2 ? 2 : attempts < 4 ? 3 : 4, [attempts]);

  const wordChoices = useMemo(() => {
    const others = FIRST_WORDS.filter(w => w.word !== card.value).map(w => w.word);
    const shuffled = shuffle(others);
    const selected = shuffled.slice(0, numChoices - 1);
    return shuffle([...selected, card.value]);
  }, [card.value, numChoices]);

  const imageChoices = useMemo(() => {
    const others = Object.entries(PICTOGRAMS).filter(([w]) => w !== card.value);
    const shuffled = shuffle(others);
    const selected = shuffled.slice(0, numChoices - 1);
    return shuffle([...selected, [card.value, pictInfo]]);
  }, [card.value, pictInfo, numChoices]);

  const syllableFillChoices = useMemo(() => {
    if (!wordData || wordData.syllables.length < 2) return [];
    const missingIdx = Math.floor(Math.random() * wordData.syllables.length);
    const correctSyl = wordData.syllables[missingIdx];
    const allSyls = FIRST_WORDS.flatMap(w => w.syllables).filter(s => s !== correctSyl);
    const wrongs = shuffle([...new Set(allSyls)]).slice(0, 3);
    return { missingIdx, correctSyl, options: shuffle([...wrongs, correctSyl]) };
  }, [wordData]);

  // Auto-play voice for each step's instruction
  const stepVoiceText = useMemo(() => {
    if (!settings.autoPlayVoice || !settings.soundEnabled) return null;
    switch (step) {
      case 'intro': return card.audioInstruction;
      case 'identify': return `¿Cuál es ${card.value}? Toca la correcta.`;
      case 'wordBuild': return `¡Toca las sílabas en orden para armar ${card.value}!`;
      case 'imageMatch': return `Esta es la palabra ${card.value}. Toca la imagen que va con ella.`;
      case 'syllableFill': return `¡Falta una sílaba! Toca la que completa ${card.value}.`;
      case 'listenPick': return card.pictogramWord;
      case 'reward': return `¡Muy bien! ¡Aprendiste ${card.value}!`;
      default: return null;
    }
  }, [step, card, settings.autoPlayVoice, settings.soundEnabled]);

  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenStepRef = useRef<string>('');

  useEffect(() => {
    // Stop any previous voice when step changes
    stopCurrentVoice();
    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);

    if (!stepVoiceText) return;
    // Prevent replaying the same step's voice
    if (lastSpokenStepRef.current === step) return;
    lastSpokenStepRef.current = step;

    voiceTimerRef.current = setTimeout(() => {
      speakText(stepVoiceText).catch(() => {});
    }, 400);

    return () => {
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    };
  }, [step, stepVoiceText]);

  useEffect(() => {
    if (step === 'intro') setGumiMessage(`Mira y escucha la palabra ${card.value}.`);
    else if (step === 'identify') setGumiMessage(`¿Cuál es ${card.value}? Toca la imagen correcta.`);
    else if (step === 'wordBuild') setGumiMessage(`¡Toca las sílabas en orden para armar ${card.value}!`);
    else if (step === 'imageMatch') setGumiMessage(`Esta es la palabra ${card.value}. Toca la imagen que va con ella.`);
    else if (step === 'syllableFill') setGumiMessage(`¡Falta una sílaba! Toca la que completa ${card.value}.`);
    else if (step === 'listenPick') setGumiMessage(`Escucha y toca la palabra correcta.`);
    else if (step === 'reward') {
      setGumiMessage(`¡Muy bien! ¡Aprendiste ${card.value}!`);
      if (settings.soundEnabled) {
        playRewardSound();
      }
    }
  }, [step, user.nickname, card.value, settings.soundEnabled]);

  const playSound = (fn: () => void) => { if (settings.soundEnabled) fn(); };

  useEffect(() => {
    return () => { stopCurrentVoice(); };
  }, []);

  const advanceFromGame = () => {
    setWrongChoice(null);
    setTouchedSyllables([]);
    setAttempts(0);
    if (currentGameIdx + 1 < games.length) {
      setCurrentGameIdx(currentGameIdx + 1);
      setStep(games[currentGameIdx + 1]);
      gameStartTime.current = Date.now();
    } else {
      setStep('reward');
    }
  };

  const handleGameSuccess = (gameType: GameType) => {
    playSound(playGentleSuccessSound);
    const elapsed = Date.now() - gameStartTime.current;
    logAttempt(user.id, card.id, card.value, gameType, true, null, attempts, elapsed);
    setFeedback('success');
    setTimeout(() => { setFeedback(null); advanceFromGame(); }, 1200);
  };

  const handleGameError = (gameType: GameType, choice: string) => {
    playSound(playGentleErrorSound);
    logAttempt(user.id, card.id, card.value, gameType, false, choice, attempts, null);
    setFeedback('error');
    setWrongChoice(choice);
    setGumiMessage('¡Casi! Intenta de nuevo, tú puedes.');
    setTimeout(() => { setFeedback(null); }, 1500);
  };

  const handleBack = () => { playSound(playPopSound); stopCurrentVoice(); onBack(); };
  const handleComplete = () => {
    playSound(playPopSound);
    stopCurrentVoice();
    const totalTime = Date.now() - levelStartTime.current;
    logAttempt(user.id, card.id, card.value, 'complete', true, null, attempts, totalTime);
    onComplete(100);
  };

  const startGames = () => {
    setAttempts(0);
    setCurrentGameIdx(0);
    setStep(games[0]);
    gameStartTime.current = Date.now();
  };

  const handleSyllableTouch = (idx: number) => {
    if (!wordData) return;
    // Must tap syllables in the correct order (left to right)
    const expectedIdx = touchedSyllables.length;
    if (idx !== expectedIdx) {
      // Wrong order — error
      playSound(playGentleErrorSound);
      setWrongChoice(wordData.syllables[idx]);
      setGumiMessage('¡Casi! Toca las sílabas en orden, de izquierda a derecha.');
      setFeedback('error');
      logAttempt(user.id, card.id, card.value, 'wordBuild', false, wordData.syllables[idx], attempts, null);
      setTimeout(() => { setFeedback(null); setWrongChoice(null); }, 1500);
      return;
    }
    playSound(playPopSound);
    const newTouched = [...touchedSyllables, idx];
    setTouchedSyllables(newTouched);
    if (newTouched.length >= wordData.syllables.length) {
      setTimeout(() => handleGameSuccess('wordBuild'), 400);
    }
  };

  const imageCardBase = "w-32 sm:w-40 rounded-3xl bg-white border-4 border-indigo-200 shadow-xl flex flex-col transition-all transform hover:scale-105 active:scale-95 overflow-hidden relative";

  const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  const CheckIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
  const StarIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

  const gameLabel: Record<GameType, string> = {
    identify: 'Identificar',
    wordBuild: 'Armar palabra',
    imageMatch: 'Unir imagen',
    syllableFill: 'Completar sílaba',
    listenPick: 'Escoger palabra',
  };

  const renderImageChoice = (word: string, imageUrl: string, idx: number) => {
    const isWrong = wrongChoice === word;
    if (isWrong) {
      return (
        <div key={idx} className={`${imageCardBase} opacity-30 scale-90 pointer-events-none transition-all duration-500`}>
          <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-indigo-50 p-1">
            <img src={imageUrl} alt="" className="w-full h-full object-contain opacity-30" />
          </div>
          <div className="bg-indigo-100 py-1 text-center">
            <span className="font-magic text-indigo-400 text-sm sm:text-lg uppercase leading-tight">{word}</span>
          </div>
        </div>
      );
    }
    return (
      <button
        key={idx}
        onClick={() => {
          if (word === card.value) handleGameSuccess('identify');
          else { handleGameError('identify', word); setAttempts(a => a + 1); }
        }}
        className={`${imageCardBase} ${word === card.value && step === 'identify' ? `ring-4 ring-amber-300 ${!reduceAnim ? 'animate-pulse' : ''}` : ''}`}
      >
        <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-white p-1.5">
          <img src={imageUrl} alt={word} className="w-full h-full object-contain" loading="lazy" />
        </div>
        <div className="bg-indigo-500 py-1.5 text-center">
          <span className="font-magic text-white text-sm sm:text-lg uppercase leading-tight">{word}</span>
        </div>
      </button>
    );
  };

  const renderWordChoice = (word: string, idx: number, gameType: GameType) => {
    const isWrong = wrongChoice === word;
    const choicePict = PICTOGRAMS[word];
    if (isWrong) {
      return (
        <div key={idx} className={`${imageCardBase} opacity-30 scale-90 pointer-events-none transition-all duration-500`}>
          <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-indigo-50 p-1">
            {choicePict?.imageUrl ? (
              <img src={choicePict.imageUrl} alt="" className="w-full h-full object-contain opacity-30" />
            ) : (
              <span className="font-magic text-lg text-gray-400 uppercase">{word}</span>
            )}
          </div>
          <div className="bg-indigo-100 py-1 text-center">
            <span className="font-magic text-indigo-400 text-sm sm:text-lg uppercase leading-tight">{word}</span>
          </div>
        </div>
      );
    }
    return (
      <button
        key={idx}
        onClick={() => {
          if (word === card.value) handleGameSuccess(gameType);
          else { handleGameError(gameType, word); setAttempts(a => a + 1); }
        }}
        className={`${imageCardBase} ${word === card.value && !reduceAnim ? 'ring-2 ring-amber-300/50' : ''}`}
      >
        <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-white p-1.5">
          {choicePict?.imageUrl ? (
            <img src={choicePict.imageUrl} alt={word} className="w-full h-full object-contain" loading="lazy" />
          ) : (
            <span className="font-magic text-lg text-indigo-700 uppercase">{word}</span>
          )}
        </div>
        <div className="bg-indigo-500 py-1.5 text-center">
          <span className="font-magic text-white text-sm sm:text-lg uppercase leading-tight">{word}</span>
        </div>
      </button>
    );
  };

  const renderSyllableChoice = (syl: string, idx: number) => {
    const isWrong = wrongChoice === syl;
    if (isWrong) {
      return (
        <button key={idx} disabled className="w-24 h-20 rounded-2xl bg-white/40 border-4 border-gray-200 opacity-30 flex items-center justify-center shadow-sm">
          <span className="font-magic text-2xl text-gray-400">{syl}</span>
        </button>
      );
    }
    return (
      <button
        key={idx}
        onClick={() => {
          if (syllableFillChoices && syl === syllableFillChoices.correctSyl) handleGameSuccess('syllableFill');
          else { handleGameError('syllableFill', syl); setAttempts(a => a + 1); }
        }}
        className={`w-24 h-20 rounded-2xl bg-white border-4 border-indigo-200 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${syl === syllableFillChoices?.correctSyl && !reduceAnim ? 'ring-2 ring-amber-300/50' : ''}`}
      >
        <span className="font-magic text-2xl sm:text-3xl text-indigo-700">{syl}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col p-3 sm:p-6 pt-20 sm:pt-24 overflow-y-auto">
      <button onClick={handleBack} className="absolute top-20 sm:top-24 left-3 sm:left-6 z-[110] bg-white/90 p-2 sm:p-3 rounded-xl border-2 border-indigo-200 hover:bg-white transition-all active:scale-90 shadow-md">
        <BackIcon />
      </button>

      <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-[110] flex flex-col items-end">
        <img src="/Logo_gumi_.jpg" alt="Gumi" className={`w-8 h-8 sm:w-10 sm:h-10 ${!reduceAnim ? 'floating-gumi' : ''} select-none object-contain`} />
      </div>

      <div className="fixed top-28 sm:top-32 right-3 sm:right-6 z-[110] max-w-[170px] sm:max-w-[200px]">
        <div className="bg-white/95 rounded-2xl rounded-tr-none px-3 py-2 shadow-md border border-indigo-100">
          <p className="text-xs sm:text-sm text-indigo-700 font-bold leading-tight">{gumiMessage}</p>
        </div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-8 mt-14">

        {/* INTRO */}
        {step === 'intro' && (
          <div className="flex flex-col items-center space-y-3 text-center w-full animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] border-4 border-indigo-200 w-full max-w-sm space-y-3 shadow-xl">
              <div className="flex flex-col items-center justify-center py-4">
                <h3 className="font-magic text-4xl sm:text-6xl text-indigo-700 leading-none mb-3 uppercase tracking-tight">{card.value}</h3>
                <div className="bg-white rounded-[2rem] border-4 border-indigo-100 shadow-lg overflow-hidden w-[85%] mx-auto">
                  {pictInfo?.imageUrl ? (
                    <img src={pictInfo.imageUrl} alt={card.pictogramWord} className="w-full h-36 sm:h-48 object-contain bg-white" />
                  ) : (
                    <div className="w-full h-36 sm:h-48 bg-indigo-100" />
                  )}
                  <div className="py-1.5 bg-white">
                    <span className="font-magic text-xl sm:text-2xl text-indigo-700 uppercase tracking-tight">{card.pictogramWord}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <VoiceButton text={card.audioInstruction} className="w-full py-3 bg-indigo-500 rounded-full border-b-4 border-indigo-700 justify-center" autoPlayMarker />
                <button onClick={startGames} className="w-full bg-cyan-500 text-white py-3.5 rounded-2xl text-xl sm:text-2xl font-magic shadow-lg border-b-4 border-cyan-700 active:translate-y-1 transition-all uppercase tracking-widest">¡JUGAR!</button>
              </div>
            </div>
          </div>
        )}

        {/* Progress dots */}
        {step !== 'intro' && step !== 'reward' && (
          <div className="flex gap-2 mb-4">
            {games.map((g, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i < currentGameIdx ? 'bg-emerald-400 w-8' : i === currentGameIdx ? 'bg-indigo-500 w-12' : 'bg-indigo-200 w-8'}`} />
            ))}
          </div>
        )}

        {/* IDENTIFY: hear word, pick correct image */}
        {step === 'identify' && (
          <div className="w-full flex flex-col items-center justify-center space-y-5 py-2 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border-2 border-indigo-200 max-w-lg w-full text-center shadow-lg">
              <VoiceButton text={`¿Cuál es ${card.value}? Toca la correcta.`} className="bg-indigo-500 rounded-full mb-2" large />
              <h3 className="text-lg sm:text-2xl font-magic text-indigo-700 uppercase">¿Cuál es {card.value}?</h3>
            </div>
            <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-2">
              {imageChoices.map(([word, info], idx) => renderImageChoice(word, info.imageUrl, idx))}
            </div>
          </div>
        )}

        {/* IMAGE MATCH: see word text, pick matching image */}
        {step === 'imageMatch' && (
          <div className="w-full flex flex-col items-center justify-center space-y-5 py-2 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border-2 border-indigo-200 max-w-lg w-full text-center shadow-lg">
              <h3 className="font-magic text-3xl sm:text-4xl text-indigo-700 uppercase mb-1">{card.value}</h3>
              <p className="text-xs text-indigo-400 font-bold uppercase">Toca la imagen que va con esta palabra</p>
            </div>
            <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-2">
              {imageChoices.map(([word, info], idx) => {
                const isWrong = wrongChoice === word;
                if (isWrong) {
                  return (
                    <div key={idx} className={`${imageCardBase} opacity-30 scale-90 pointer-events-none`}>
                      <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-indigo-50 p-1">
                        <img src={info.imageUrl} alt="" className="w-full h-full object-contain opacity-30" />
                      </div>
                      <div className="bg-indigo-100 py-1 text-center">
                        <span className="font-magic text-indigo-400 text-sm sm:text-lg uppercase leading-tight">{word}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (word === card.value) handleGameSuccess('imageMatch');
                      else { handleGameError('imageMatch', word); setAttempts(a => a + 1); }
                    }}
                    className={imageCardBase}
                  >
                    <div className="w-full h-24 sm:h-28 flex items-center justify-center bg-white p-1.5">
                      <img src={info.imageUrl} alt={word} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                    <div className="bg-indigo-500 py-1.5 text-center">
                      <span className="font-magic text-white text-sm sm:text-lg uppercase leading-tight">{word}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* WORD BUILD: tap syllables in order */}
        {step === 'wordBuild' && wordData && (
          <div className="w-full flex flex-col items-center justify-center space-y-4 py-2 animate-fade-in">
            <div className="bg-indigo-500 p-3 rounded-2xl max-w-lg w-full text-center shadow-lg">
              <h3 className="text-lg sm:text-2xl font-magic text-white uppercase">Arma: {card.value}</h3>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-indigo-200 shadow-lg flex flex-col items-center">
              {pictInfo?.imageUrl && (
                <img src={pictInfo.imageUrl} alt={wordData.word} className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl mb-3 border-2 border-indigo-200 bg-white" />
              )}
              <div className="flex gap-2 sm:gap-3 justify-center items-center">
                {wordData.syllables.map((syl, idx) => {
                  const touched = touchedSyllables.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => !touched && handleSyllableTouch(idx)}
                      disabled={touched}
                      className={`rounded-2xl bg-white border-4 flex items-center justify-center shadow-lg transition-all px-2 ${
                        !touched
                          ? `border-indigo-200 hover:scale-105 active:scale-95 ${!reduceAnim ? 'ring-4 ring-amber-300/70 animate-pulse' : ''}`
                          : 'border-emerald-400 ring-2 ring-emerald-400'
                      }`}
                      style={{ minWidth: '72px', height: '88px' }}
                    >
                      <span className={`font-magic text-2xl sm:text-4xl leading-none ${touched ? 'text-emerald-500' : 'text-indigo-700'}`}>{syl}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SYLLABLE FILL: word with missing syllable, pick correct one */}
        {step === 'syllableFill' && wordData && syllableFillChoices && (
          <div className="w-full flex flex-col items-center justify-center space-y-4 py-2 animate-fade-in">
            <div className="bg-indigo-500 p-3 rounded-2xl max-w-lg w-full text-center shadow-lg">
              <h3 className="text-lg sm:text-2xl font-magic text-white uppercase">Completa: {card.value}</h3>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-indigo-200 shadow-lg flex flex-col items-center">
              {pictInfo?.imageUrl && (
                <img src={pictInfo.imageUrl} alt={wordData.word} className="w-20 h-20 object-contain rounded-xl mb-3 border-2 border-indigo-200 bg-white" />
              )}
              <div className="flex gap-1 sm:gap-2 justify-center items-center mb-5">
                {wordData.syllables.map((syl, idx) => {
                  const isMissing = idx === syllableFillChoices.missingIdx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border-4 flex items-center justify-center ${isMissing ? 'border-amber-400 border-dashed bg-amber-50' : 'border-indigo-200 bg-white'}`}
                      style={{ minWidth: '64px', height: '72px' }}
                    >
                      {isMissing ? (
                        <span className="font-magic text-2xl text-amber-400">?</span>
                      ) : (
                        <span className="font-magic text-xl sm:text-2xl text-indigo-700">{syl}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-indigo-400 uppercase mb-3">Elige la sílaba que falta</p>
              <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
                {syllableFillChoices.options.map((syl, idx) => renderSyllableChoice(syl, idx))}
              </div>
            </div>
          </div>
        )}

        {/* LISTEN PICK: hear audio, pick correct word from text options */}
        {step === 'listenPick' && (
          <div className="w-full flex flex-col items-center justify-center space-y-5 py-2 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border-2 border-indigo-200 max-w-lg w-full text-center shadow-lg">
              <VoiceButton text={card.pictogramWord} className="bg-indigo-500 rounded-full mb-2" large />
              <h3 className="text-lg sm:text-2xl font-magic text-indigo-700 uppercase">Escucha y elige</h3>
              <p className="text-xs text-indigo-400">Toca el botón para escuchar, luego elige la palabra</p>
            </div>
            <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-2">
              {wordChoices.map((word, idx) => renderWordChoice(word, idx, 'listenPick'))}
            </div>
          </div>
        )}

        {/* REWARD — full-screen celebration */}
        {step === 'reward' && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-300/80 via-orange-300/70 to-yellow-200/80" />
            {!reduceAnim && [...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${10 + Math.random() * 24}px`,
                  height: `${10 + Math.random() * 24}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#fbbf24', '#f59e0b', '#fb923c', '#facc15', '#fde047'][i % 5],
                  animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s infinite`,
                }}
              />
            ))}
            <div className="relative z-10 flex flex-col items-center animate-bounce-in px-6 text-center">
              <img src="/Logo_gumi_.jpg" alt="Gumi" className={`w-28 h-28 sm:w-36 sm:h-36 mb-3 ${!reduceAnim ? 'animate-bounce' : ''} object-contain drop-shadow-2xl`} />
              <h2 className="text-5xl sm:text-7xl font-magic text-white uppercase drop-shadow-lg mb-2" style={{ textShadow: '0 4px 0 rgba(245,158,11,0.6)' }}>¡Muy bien!</h2>
              <p className="text-2xl sm:text-3xl font-magic text-white uppercase mb-4" style={{ textShadow: '0 3px 0 rgba(245,158,11,0.5)' }}>¡Aprendiste {card.value}!</p>
              {pictInfo?.imageUrl && (
                <img src={pictInfo.imageUrl} alt={card.pictogramWord} className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-contain border-4 border-white bg-white shadow-2xl mb-4" />
              )}
              <div className="flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}><StarIcon className="w-10 h-10 sm:w-12 sm:h-12" /></div>
                ))}
              </div>
              <span className="bg-white text-amber-500 text-lg sm:text-xl font-black px-6 py-2 rounded-full shadow-lg uppercase mb-6">+100 estrellas</span>
              <button onClick={handleComplete} className="bg-white text-indigo-600 py-4 px-12 rounded-full text-xl sm:text-2xl font-magic shadow-2xl border-4 border-indigo-200 uppercase tracking-widest active:scale-95 hover:scale-105 transition-all">SIGUIENTE</button>
            </div>
          </div>
        )}

        {feedback === 'success' && (
          <div className="fixed inset-0 flex items-center justify-center bg-emerald-400/20 z-[150] backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <CheckIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-emerald-500" />
              <p className="text-xl sm:text-2xl font-magic text-indigo-700 uppercase mt-2">¡Muy bien!</p>
            </div>
          </div>
        )}

        {feedback === 'error' && (
          <div className="fixed inset-0 flex items-center justify-center bg-amber-400/15 z-[150] backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <img src="/Logo_gumi_.jpg" alt="Gumi" className="w-14 h-14 mx-auto object-contain" />
              <p className="text-lg sm:text-xl font-magic text-indigo-600 uppercase mt-2">¡Casi! Otra vez</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameBoard;
