import React, { useEffect, useRef, useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from './SoundEffects';

// Procedural Cyberpunk Ambient Drone Synthesizer (Zero network dependencies, 100% reliable fallback)
class ProceduralAmbientSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isRunning = false;

  public initOrResume(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public start(targetVolume = 0.3) {
    if (this.isRunning) return;
    try {
      const ctx = this.initOrResume();
      if (!ctx) return;

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(targetVolume, 0.05), ctx.currentTime + 1.5);
      this.masterGain.connect(ctx.destination);

      // Lowpass resonant filter for warm analog sci-fi sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);
      filter.connect(this.masterGain);

      // LFO for breathing filter sweep
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
      lfoGain.gain.setValueAtTime(160, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.oscillators.push(lfo);

      // Harmonious Sci-Fi Cyber Chord: C2 (65.41 Hz), G2 (98.00 Hz), C3 (130.81 Hz), D#3 (155.56 Hz), G3 (196.00 Hz)
      const frequencies = [65.41, 98.0, 130.81, 155.56, 196.0];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((idx - 2) * 4, ctx.currentTime);

        oscGain.gain.setValueAtTime(0.14 / frequencies.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        this.oscillators.push(osc);
      });

      this.isRunning = true;
    } catch (err) {
      console.warn('Procedural synth init note:', err);
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(Math.max(vol, 0.0001), this.ctx.currentTime, 0.1);
      } catch {}
    }
  }

  public stop() {
    if (!this.isRunning) return;
    try {
      if (this.masterGain && this.ctx) {
        try {
          this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
        } catch {}
      }
      setTimeout(() => {
        this.oscillators.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        this.oscillators = [];
        this.isRunning = false;
      }, 1000);
    } catch {
      this.isRunning = false;
    }
  }
}

const ambientSynth = new ProceduralAmbientSynth();

/**
 * Filter and resolve audio URL:
 * - If admin uploaded a custom Cloudinary / MP3 URL, use it.
 * - If empty or pointing to blocked CDN (e.g. Pixabay 403), use local '/audio/ambient-cyberpunk.mp3'.
 */
function resolveAudioUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '/audio/ambient-cyberpunk.mp3';
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('pixabay.com')) {
    return '/audio/ambient-cyberpunk.mp3';
  }
  return trimmed;
}

/**
 * BackgroundMusic
 * - Starts automatically on the user's VERY FIRST screen touch/click/press anywhere.
 * - Works identically on Mobile (iOS / Android) and Desktop (Chrome / Safari / Edge / Firefox).
 * - Plays in an endless, seamless loop.
 * - No Music OFF button (always active).
 */
export const BackgroundMusic: React.FC = () => {
  const { siteSettings } = useImages();

  const rawAudioUrl = siteSettings.music?.audioUrl?.trim() || '';
  const resolvedUrl = resolveAudioUrl(rawAudioUrl);

  const targetVolume = Math.min(Math.max(siteSettings.music?.volume ?? 0.35, 0.1), 1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Play audio safely with automatic loop and fallback
  const startPlayback = useRef((url: string) => {
    // 1. Synchronously warm up Web Audio API during user touch gesture
    ambientSynth.initOrResume();

    // 2. Ensure sound effects manager is unmuted
    sound.setMuted(false);

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = url;
      audio.loop = true; // Continuous loop
      audio.volume = targetVolume;
      audio.muted = false;

      // Reliable loop backup across mobile devices
      audio.onended = () => {
        try {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } catch {}
      };

      // Error handler: If custom remote audio URL fails, fall back to local MP3, then ambient synth
      audio.onerror = () => {
        console.warn('Audio URL playback failed, falling back to local ambient audio.');
        if (url !== '/audio/ambient-cyberpunk.mp3') {
          startPlayback.current('/audio/ambient-cyberpunk.mp3');
        } else {
          ambientSynth.start(targetVolume);
          setIsPlaying(true);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            ambientSynth.stop(); // Stop synth if MP3 is playing smoothly
          })
          .catch((err) => {
            console.warn('Audio element play deferred, activating procedural ambient synth:', err);
            ambientSynth.start(targetVolume);
            setIsPlaying(true);
          });
      }
    } catch (err) {
      console.warn('HTML Audio error, starting procedural synth fallback:', err);
      ambientSynth.start(targetVolume);
      setIsPlaying(true);
    }
  });

  // Attach touch/click listeners on the whole screen for the VERY FIRST user interaction
  useEffect(() => {
    if (isPlaying) return;

    const handleFirstUserTouch = () => {
      startPlayback.current(resolvedUrl);
      // Clean up event listeners after first trigger
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstUserTouch, true);
        document.removeEventListener(evt, handleFirstUserTouch, true);
      });
    };

    const userEvents = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'click', 'keydown'];

    userEvents.forEach((evt) => {
      window.addEventListener(evt, handleFirstUserTouch, { capture: true, passive: true });
      document.addEventListener(evt, handleFirstUserTouch, { capture: true, passive: true });
    });

    return () => {
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstUserTouch, true);
        document.removeEventListener(evt, handleFirstUserTouch, true);
      });
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [resolvedUrl, isPlaying]);

  // When admin panel changes or uploads a new MP3 URL
  useEffect(() => {
    if (!isPlaying) return;
    if (audioRef.current && audioRef.current.src !== resolvedUrl) {
      startPlayback.current(resolvedUrl);
    }
  }, [resolvedUrl, isPlaying]);

  return null; // Headless audio background engine
};
