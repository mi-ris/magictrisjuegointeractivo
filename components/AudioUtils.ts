
let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: 24000 
    });
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

// ---- Master volume control ----

let masterGain: GainNode | null = null;

function getMasterGain(): GainNode {
  const ctx = getSharedAudioContext();
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

// ---- Central audio manager: prevents overlapping voice playback ----

let currentVoiceSource: AudioBufferSourceNode | null = null;
let currentVoiceGain: GainNode | null = null;
let currentVoiceText: string | null = null;
let browserUtterance: SpeechSynthesisUtterance | null = null;
const voiceListeners: Set<(text: string | null) => void> = new Set();

export function onVoiceChange(cb: (text: string | null) => void): () => void {
  voiceListeners.add(cb);
  return () => voiceListeners.delete(cb);
}

function notifyVoiceChange() {
  voiceListeners.forEach(cb => cb(currentVoiceText));
}

export function stopCurrentVoice(): void {
  // Soft fade-out for voice
  if (currentVoiceSource && currentVoiceGain) {
    try {
      const ctx = getSharedAudioContext();
      currentVoiceGain.gain.cancelScheduledValues(ctx.currentTime);
      currentVoiceGain.gain.setValueAtTime(currentVoiceGain.gain.value, ctx.currentTime);
      currentVoiceGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      const src = currentVoiceSource;
      setTimeout(() => { try { src.stop(); } catch {} }, 120);
    } catch {
      try { currentVoiceSource.stop(); } catch {}
    }
    currentVoiceSource = null;
    currentVoiceGain = null;
  }
  if (browserUtterance && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    browserUtterance = null;
  }
  currentVoiceText = null;
  notifyVoiceChange();
}

export function isVoicePlaying(text?: string): boolean {
  if (!currentVoiceSource && !browserUtterance) return false;
  if (text) return currentVoiceText === text;
  return true;
}

export async function playVoiceBuffer(buffer: AudioBuffer, text: string, rate: 'slow' | 'normal' = 'slow'): Promise<void> {
  stopCurrentVoice();
  const ctx = getSharedAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate === 'slow' ? 0.85 : 1.0;

  // Soft fade-in and gentle EQ for a warmer voice
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 8000;
  filter.Q.value = 0.5;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMasterGain());

  currentVoiceSource = source;
  currentVoiceGain = gain;
  currentVoiceText = text;
  notifyVoiceChange();

  source.onended = () => {
    if (currentVoiceSource === source) {
      currentVoiceSource = null;
      currentVoiceGain = null;
      currentVoiceText = null;
      notifyVoiceChange();
    }
  };

  source.start();
}

// ---- Speech rate setting ----

let currentSpeechRate: 'slow' | 'normal' = 'slow';

export function setSpeechRate(rate: 'slow' | 'normal') {
  currentSpeechRate = rate;
}

export function getSpeechRate(): 'slow' | 'normal' {
  return currentSpeechRate;
}

export async function speakText(text: string): Promise<void> {
  const rate = getSpeechRate();
  try {
    const { textToSpeech } = await import('../services/gemini');
    const audioData = await textToSpeech(text, rate);
    if (audioData) {
      const ctx = getSharedAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
      await playVoiceBuffer(buffer, text, rate);
      return;
    }
  } catch (err) {
    console.warn('Gemini TTS no disponible, usando voz del navegador:', err);
  }
  // Fallback: browser built-in speech synthesis
  speakWithBrowser(text, rate);
}

// ---- Browser Speech Synthesis fallback ----

function speakWithBrowser(text: string, rate: 'slow' | 'normal' = 'slow'): void {
  stopCurrentVoice();
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  utter.rate = rate === 'slow' ? 0.75 : 0.95;
  utter.pitch = 1.15;
  utter.volume = 0.85;

  const voices = window.speechSynthesis.getVoices();
  // Prefer a female Spanish voice for a warmer, more child-friendly tone
  const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
  const preferredVoice = spanishVoices.find(v => /female|mujer|laura|paulina|monica|helena/i.test(v.name)) || spanishVoices[0];
  if (preferredVoice) utter.voice = preferredVoice;

  browserUtterance = utter;
  currentVoiceText = text;
  notifyVoiceChange();

  utter.onend = () => {
    if (currentVoiceText === text) {
      currentVoiceText = null;
      currentVoiceSource = null;
      browserUtterance = null;
      notifyVoiceChange();
    }
  };

  window.speechSynthesis.speak(utter);
}

export function getCurrentVoiceText(): string | null {
  return currentVoiceText;
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// ---- Soft sound effects with smooth envelopes ----
// All effects use gentle fade-in/fade-out to avoid harsh clicks
// and slight pitch randomization for a more dynamic, lively feel

function randomSlightPitch(base: number): number {
  return base * (1 + (Math.random() - 0.5) * 0.06);
}

export function playPopSound() {
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = randomSlightPitch(500);
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(getMasterGain());

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (e) {
    console.warn("Audio pop failed", e);
  }
}

export function playSuccessSound() {
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const base = randomSlightPitch(523.25);
    osc.frequency.setValueAtTime(base, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(getMasterGain());

    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch (e) {
    console.warn("Audio success failed", e);
  }
}

export function playGentleSuccessSound() {
  try {
    const ctx = getSharedAudioContext();
    // Pentatonic ascending: C5, E5, G5, A5 — gentle and cheerful
    const notes = [523.25, 659.25, 783.99, 880.0];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(randomSlightPitch(freq), t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(getMasterGain());
      osc.start(t);
      osc.stop(t + 0.36);
    });
  } catch (e) {
    console.warn("Audio gentle success failed", e);
  }
}

export function playGentleErrorSound() {
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomSlightPitch(320), ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(getMasterGain());
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    console.warn("Audio gentle error failed", e);
  }
}

export function playApplauseSound() {
  try {
    const ctx = getSharedAudioContext();
    // Fewer, softer claps with gentle filtering
    const clapCount = 5;
    for (let i = 0; i < clapCount; i++) {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        // Softer noise with a decay envelope baked in
        const decay = 1 - j / data.length;
        data[j] = (Math.random() * 2 - 1) * 0.2 * decay;
      }
      noise.buffer = buffer;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 0.8;
      const t = ctx.currentTime + i * 0.08 + Math.random() * 0.02;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(getMasterGain());
      noise.start(t);
      noise.stop(t + 0.07);
    }
  } catch (e) {
    console.warn("Audio applause failed", e);
  }
}

export function playRewardSound() {
  try {
    playApplauseSound();
    const ctx = getSharedAudioContext();
    // Major scale ascending: C5, E5, G5, C6 — triumphant but soft
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = ctx.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(randomSlightPitch(freq), t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(getMasterGain());
      osc.start(t);
      osc.stop(t + 0.46);
    });
  } catch (e) {
    console.warn("Audio reward failed", e);
  }
}

export function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
