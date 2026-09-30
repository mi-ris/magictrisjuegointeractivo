
import React, { useState, useEffect, useRef } from 'react';
import { getSharedAudioContext, speakText, stopCurrentVoice, onVoiceChange, getCurrentVoiceText } from './AudioUtils';
import { useSettings } from './SettingsContext';

interface Props {
  text: string;
  className?: string;
  autoPlayMarker?: boolean;
  large?: boolean;
}

const VoiceButton: React.FC<Props> = ({ text, className, autoPlayMarker, large }) => {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const isMounted = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const unsub = onVoiceChange((current) => {
      if (!isMounted.current) return;
      setIsPlaying(current === text);
    });
    return () => {
      isMounted.current = false;
      unsub();
    };
  }, [text]);

  const handlePlay = async () => {
    if (!isMounted.current) return;
    if (!settings.soundEnabled) return;

    // If this text is currently playing, stop it (toggle off)
    if (getCurrentVoiceText() === text) {
      stopCurrentVoice();
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    const audioCtx = getSharedAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    try {
      // If another voice started while loading, don't override it
      if (getCurrentVoiceText() && getCurrentVoiceText() !== text) {
        loadingRef.current = false;
        return;
      }
      await speakText(text);
    } catch (err: any) {
      console.error("Error de voz:", err);
    } finally {
      loadingRef.current = false;
    }
  };

  const sizeClass = large ? 'p-3 sm:p-4 min-w-[3.5rem]' : 'p-2 min-w-[3rem]';

  return (
    <button
      onClick={handlePlay}
      data-auto-voice={autoPlayMarker ? 'true' : undefined}
      data-voice-text={text}
      className={`rounded-full bg-indigo-400 text-white shadow hover:scale-110 transition-transform flex items-center justify-center ${sizeClass} ${className}`}
    >
      {isPlaying ? (
        <span className="flex gap-1 items-center px-2">
          <span className="w-1.5 h-4 bg-white animate-pulse rounded-full"></span>
          <span className="w-1.5 h-6 bg-white animate-pulse rounded-full delay-75"></span>
          <span className="w-1.5 h-4 bg-white animate-pulse rounded-full delay-150"></span>
        </span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width={large ? '28' : '22'} height={large ? '28' : '22'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      )}
    </button>
  );
};

export default VoiceButton;
