
import React, { useState, useRef, useEffect } from 'react';
import { textToSpeech } from '../services/gemini';
import { decode, decodeAudioData, getSharedAudioContext, playPopSound } from './AudioUtils';

interface Props {
  text: string;
  className?: string;
  autoPlayMarker?: boolean;
  large?: boolean;
}

const VoiceButton: React.FC<Props> = ({ text, className, autoPlayMarker, large }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const audioCtx = getSharedAudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    setIsPlaying(true);
    try {
      const audioData = await textToSpeech(text);
      if (!isMounted.current) return;

      if (audioData) {
        const buffer = await decodeAudioData(decode(audioData), audioCtx, 24000, 1);
        if (!isMounted.current) return;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        sourceRef.current = source;

        source.onended = () => {
          if (isMounted.current) setIsPlaying(false);
          sourceRef.current = null;
        };

        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (err: any) {
      console.error("Error de voz:", err);
      if (isMounted.current) {
        setIsPlaying(false);
      }
    }
  };

  const sizeClass = large ? 'p-3 sm:p-4 min-w-[3.5rem]' : 'p-2 min-w-[3rem]';

  return (
    <button
      onClick={handlePlay}
      data-auto-voice={autoPlayMarker ? 'true' : undefined}
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
