
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

// ---- Central audio manager: prevents overlapping voice playback ----

let currentVoiceSource: AudioBufferSourceNode | null = null;
let currentVoiceText: string | null = null;
const voiceListeners: Set<(text: string | null) => void> = new Set();

export function onVoiceChange(cb: (text: string | null) => void): () => void {
  voiceListeners.add(cb);
  return () => voiceListeners.delete(cb);
}

function notifyVoiceChange() {
  voiceListeners.forEach(cb => cb(currentVoiceText));
}

export function stopCurrentVoice(): void {
  if (currentVoiceSource) {
    try { currentVoiceSource.onended = null; currentVoiceSource.stop(); } catch {}
    currentVoiceSource = null;
  }
  currentVoiceText = null;
  notifyVoiceChange();
}

export function isVoicePlaying(text?: string): boolean {
  if (!currentVoiceSource) return false;
  if (text) return currentVoiceText === text;
  return true;
}

export async function playVoiceBuffer(buffer: AudioBuffer, text: string): Promise<void> {
  stopCurrentVoice();
  const ctx = getSharedAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  currentVoiceSource = source;
  currentVoiceText = text;
  notifyVoiceChange();
  source.onended = () => {
    if (currentVoiceSource === source) {
      currentVoiceSource = null;
      currentVoiceText = null;
      notifyVoiceChange();
    }
  };
  source.start();
}

export async function speakText(text: string): Promise<void> {
  const { textToSpeech } = await import('../services/gemini');
  const audioData = await textToSpeech(text);
  if (!audioData) return;
  const ctx = getSharedAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();
  const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
  await playVoiceBuffer(buffer, text);
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

export function playPopSound() {
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
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
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn("Audio success failed", e);
  }
}

export function playGentleSuccessSound() {
  try {
    const ctx = getSharedAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
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
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn("Audio gentle error failed", e);
  }
}

export function playApplauseSound() {
  try {
    const ctx = getSharedAudioContext();
    for (let i = 0; i < 6; i++) {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.3;
      }
      noise.buffer = buffer;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(ctx.currentTime + i * 0.06);
      noise.stop(ctx.currentTime + i * 0.06 + 0.05);
    }
  } catch (e) {
    console.warn("Audio applause failed", e);
  }
}

export function playRewardSound() {
  try {
    playApplauseSound();
    const ctx = getSharedAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
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
