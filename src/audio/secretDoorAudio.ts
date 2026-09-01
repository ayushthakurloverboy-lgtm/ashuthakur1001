/**
 * Robust Audio Engine for "Can I Call You Tonight?" (Dayglow)
 * Uses Web Audio API with preloaded AudioBuffer for 100% glitch-free playback in iframes,
 * with HTMLAudioElement fallback.
 */

const AUDIO_URL = '/can-i-call-you-tonight.mp3';
const FALLBACK_STREAM_URL = '/secret-door.mp3';

class SecretDoorAudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;

  private isPlaying: boolean = false;
  private startTimestamp: number = 0;
  private pausedAtSec: number = 0;
  private timerId: number | null = null;
  public totalDuration: number = 45.7; // Duration of the song clip in seconds

  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Pre-load audio buffer in the background
      this.preloadAudio();
      this.initAudioElement();
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private async preloadAudio() {
    try {
      const response = await fetch(AUDIO_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getAudioContext();
      this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (this.audioBuffer.duration > 0) {
        this.totalDuration = this.audioBuffer.duration;
      }
    } catch (err) {
      console.warn('Audio preloading buffer note:', err);
      // Try fallback url if primary fetch failed
      try {
        const fbRes = await fetch(FALLBACK_STREAM_URL);
        const fbAb = await fbRes.arrayBuffer();
        const ctx = this.getAudioContext();
        this.audioBuffer = await ctx.decodeAudioData(fbAb);
        if (this.audioBuffer.duration > 0) {
          this.totalDuration = this.audioBuffer.duration;
        }
      } catch (fbErr) {
        console.warn('Fallback audio preloading note:', fbErr);
      }
    }
  }

  private initAudioElement() {
    try {
      const audio = new Audio();
      audio.src = AUDIO_URL;
      audio.preload = 'auto';
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          this.totalDuration = audio.duration;
        }
      });
      audio.addEventListener('ended', () => {
        this.handleTrackEnded();
      });
      this.audioElement = audio;
    } catch (e) {
      console.warn('HTMLAudioElement init note:', e);
    }
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onEnded(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public async start(fromTimeSec: number = 0) {
    this.isPlaying = true;
    this.pausedAtSec = fromTimeSec;

    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    // Try starting Web Audio buffer source first (most reliable in iframes)
    let bufferPlaySuccess = false;
    if (this.audioBuffer) {
      try {
        this.stopBufferSource();
        const src = ctx.createBufferSource();
        src.buffer = this.audioBuffer;
        if (this.gainNode) {
          src.connect(this.gainNode);
        } else {
          src.connect(ctx.destination);
        }
        src.onended = () => {
          if (this.isPlaying && this.getCurrentTime() >= this.totalDuration - 0.5) {
            this.handleTrackEnded();
          }
        };
        const offset = Math.max(0, Math.min(fromTimeSec, this.totalDuration));
        src.start(0, offset);
        this.sourceNode = src;
        bufferPlaySuccess = true;
      } catch (err) {
        console.warn('Buffer play note:', err);
      }
    }

    // If buffer source was not ready or failed, use HTMLAudioElement
    if (!bufferPlaySuccess && this.audioElement) {
      try {
        this.audioElement.currentTime = fromTimeSec;
        const p = this.audioElement.play();
        if (p !== undefined) {
          p.catch((err) => {
            console.warn('HTMLAudioElement play note:', err);
          });
        }
      } catch (err) {
        console.warn('AudioElement start error:', err);
      }
    }

    // Set high-precision clock reference
    this.startTimestamp = performance.now() - fromTimeSec * 1000;
    this.startSyncLoop();
  }

  private stopBufferSource() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
  }

  public pause() {
    this.isPlaying = false;
    this.pausedAtSec = this.getCurrentTime();

    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }

    this.stopBufferSource();

    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }
  }

  public resume() {
    if (this.isPlaying) return;
    this.start(this.pausedAtSec);
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying) {
      return this.pausedAtSec;
    }
    const elapsed = (performance.now() - this.startTimestamp) / 1000;
    return Math.max(0, Math.min(elapsed, this.totalDuration));
  }

  private handleTrackEnded() {
    this.isPlaying = false;
    this.pausedAtSec = this.totalDuration;
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
    this.stopBufferSource();
    if (this.onEndedCallback) {
      this.onEndedCallback();
    }
  }

  private startSyncLoop() {
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
    }

    const tick = () => {
      if (!this.isPlaying) return;

      const current = this.getCurrentTime();

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(current);
      }

      if (current >= this.totalDuration) {
        this.handleTrackEnded();
        return;
      }

      this.timerId = requestAnimationFrame(tick);
    };

    this.timerId = requestAnimationFrame(tick);
  }

  /**
   * Delicate acoustic touch sparkle chime on tap
   */
  public playTouchHarp(xRatio: number, yRatio: number) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Pentatonic romantic frequencies based on touch position
      const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
      const index = Math.min(scale.length - 1, Math.floor(xRatio * scale.length));
      const freq = scale[index] * (1 + (1 - yRatio) * 0.5);

      const osc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.3);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(chimeGain);
      chimeGain.connect(this.gainNode || ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    } catch {}
  }
}

export const secretDoorAudio = new SecretDoorAudioEngine();
