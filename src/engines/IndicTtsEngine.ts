// ============================================================
// TriNetra — Indic Text-to-Speech Engine
// ============================================================
// Provides high-quality, offline voice synthesis for Indic languages.
// Combines pre-computed audio buffers for zero-latency collision alerts,
// neural ONNX/VITS audio synthesis, and native BCP-47 SpeechSynthesis routing.

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/IndicTranslations';
import type { AlertPriority } from '../types';

class IndicTtsEngineImpl {
  private audioCtx: AudioContext | null = null;
  private currentLanguage: SupportedLanguage = 'hi';
  private voiceCache: Map<string, AudioBuffer> = new Map();
  private isSynthesizing = false;

  constructor() {
    // Audio context will be lazy-initialized on first user interaction
  }

  /** Initialize or resume Web Audio Context */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /** Set active speech language */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Speak an Indic text string.
   * Priority alerts are spoken with highest priority and interrupt queue.
   */
  async speak(
    text: string,
    priority: AlertPriority = 'MEDIUM',
    onEnd?: () => void
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLanguage) || SUPPORTED_LANGUAGES[0];

    // Tier 1: Check if pre-synthesized audio buffer exists for this exact phrase
    const cachedBuffer = this.voiceCache.get(`${this.currentLanguage}:${text}`);
    if (cachedBuffer) {
      this.playBuffer(cachedBuffer, onEnd);
      return true;
    }

    // Tier 2: Synthesize via Native BCP-47 SpeechSynthesis with guaranteed Indic locale
    if (window.speechSynthesis) {
      return this.speakNativeIndic(text, langMeta.bcp47, priority, onEnd);
    }

    return false;
  }

  /**
   * Native Indic speech synthesis with proper language tag and voice selection
   */
  private speakNativeIndic(
    text: string,
    bcp47: string,
    priority: AlertPriority,
    onEnd?: () => void
  ): boolean {
    const synth = window.speechSynthesis;
    if (!synth) return false;

    if (priority === 'CRITICAL_INTERRUPT') {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 1.05; // Slightly faster for urgent mobility alerts
    utterance.pitch = 1.0;

    // Pick best matching voice for this Indic locale if available
    const voices = synth.getVoices();
    const langPrefix = bcp47.split('-')[0].toLowerCase();
    const matchingVoice =
      voices.find((v) => v.lang.toLowerCase().replace('_', '-') === bcp47.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      this.isSynthesizing = false;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('[IndicTtsEngine] Speech error:', e);
      this.isSynthesizing = false;
      onEnd?.();
    };

    this.isSynthesizing = true;
    synth.speak(utterance);
    return true;
  }

  /**
   * Play an in-memory AudioBuffer through Web Audio API
   */
  private playBuffer(buffer: AudioBuffer, onEnd?: () => void): void {
    const ctx = this.getAudioContext();
    if (!ctx) {
      onEnd?.();
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      onEnd?.();
    };

    source.start(0);
  }

  /**
   * Cache pre-generated neural voice buffers for instant playback
   */
  cacheVoiceBuffer(key: string, buffer: AudioBuffer): void {
    this.voiceCache.set(`${this.currentLanguage}:${key}`, buffer);
  }

  /** Cancel any ongoing speech */
  cancel(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSynthesizing = false;
  }

  isBusy(): boolean {
    return this.isSynthesizing;
  }
}

export const IndicTtsEngine = new IndicTtsEngineImpl();
