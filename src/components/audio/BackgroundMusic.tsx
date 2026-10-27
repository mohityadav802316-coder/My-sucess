import React, { useEffect, useRef, useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from './SoundEffects';

// Global Singleton HTMLAudioElement - exactly ONE instance across the entire application lifecycle
let globalAudioInstance: HTMLAudioElement | null = null;
let globalIsPlaying = false;
let globalPlaybackStarted = false;

// Procedural Cyberpunk Ambient Drone Synthesizer (Zero network dependencies, emergency fallback only)
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

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);
      filter.connect(this.masterGain);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
      lfoGain.gain.setValueAtTime(160, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.oscillators.push(lfo);

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
      console.warn('[AmbientSynth] init note:', err);
    }
  }

  public stop() {
    if (!this.isRunning) return;
    try {
      if (this.masterGain && this.ctx) {
        try {
          this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
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
      }, 500);
    } catch {
      this.isRunning = false;
    }
  }
}

const emergencySynth = new ProceduralAmbientSynth();

// Helper to retrieve or lazily create the single shared HTMLAudioElement
function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioInstance) {
    const audio = new Audio();
    // On-demand fast loading: preload metadata only, never block bandwidth on startup
    audio.preload = 'metadata';
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    // iOS Safari inline playback policy
    audio.setAttribute('playsinline', 'true');
    (audio as any).playsInline = true;

    // Ensure seamless looping across all desktop and mobile browsers
    audio.addEventListener('ended', () => {
      try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } catch {}
    });

    globalAudioInstance = audio;
  }
  return globalAudioInstance;
}

/**
 * Filter and resolve audio URL:
 * 1. If Cloudinary audio URL is in siteSettings, use it.
 * 2. If cached in localStorage from previous session or admin upload, use immediately.
 * 3. Fallback to local '/audio/ambient-cyberpunk.mp3'.
 */
function resolveAudioUrl(url: string | undefined): string {
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed && !trimmed.includes('pixabay.com')) {
      return trimmed;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mohit_bg_music_url');
      if (stored && stored.trim() && !stored.includes('pixabay.com')) {
        return stored.trim();
      }
    } catch {}
  }

  return '/audio/ambient-cyberpunk.mp3';
}

/**
 * BackgroundMusic
 * - Single shared HTMLAudioElement for entire application.
 * - Starts automatically on the user's VERY FIRST screen touch/click/press anywhere.
 * - Respects browser autoplay policies and retries on subsequent gestures if blocked.
 * - Preserves playback position across internal page/tab navigation (zero duplicate audio).
 * - Fast on-demand streaming from Cloudinary CDN without slowing down the site.
 */
export const BackgroundMusic: React.FC = () => {
  const { siteSettings } = useImages();

  const musicSettings = siteSettings.music;
  const isMusicEnabled = musicSettings?.enabled !== false;
  const rawAudioUrl = musicSettings?.audioUrl?.trim() || '';
  const resolvedUrl = resolveAudioUrl(rawAudioUrl);
  const targetVolume = Math.min(Math.max(musicSettings?.volume ?? 0.35, 0.05), 1.0);

  const [isPlaying, setIsPlaying] = useState<boolean>(() => globalIsPlaying);
  const activeUrlRef = useRef<string>(resolvedUrl);
  activeUrlRef.current = resolvedUrl;

  const targetVolumeRef = useRef<number>(targetVolume);
  targetVolumeRef.current = targetVolume;

  // Single robust playback function
  const attemptPlayback = (sourceUrl?: string): Promise<boolean> => {
    if (!isMusicEnabled) return Promise.resolve(false);

    const audio = getSharedAudio();
    if (!audio) return Promise.resolve(false);

    const urlToPlay = sourceUrl || activeUrlRef.current;
    if (!urlToPlay) return Promise.resolve(false);

    // Warm up sound effects context during user gesture
    sound.setMuted(false);

    // Synchronize volume
    audio.volume = targetVolumeRef.current;

    // If audio is already playing the desired track, preserve position and avoid restarting
    if (!audio.paused && audio.src && audio.src.includes(urlToPlay)) {
      globalIsPlaying = true;
      globalPlaybackStarted = true;
      setIsPlaying(true);
      emergencySynth.stop();
      return Promise.resolve(true);
    }

    // Set source if not matching
    if (!audio.src || !audio.src.includes(urlToPlay)) {
      audio.src = urlToPlay;
    }

    // Set error listener for automatic fallback
    audio.onerror = () => {
      const mediaError = audio.error;
      console.warn('[BackgroundMusic] Audio file error on URL:', urlToPlay, mediaError?.code, mediaError?.message);

      // If Cloudinary or remote URL fails, attempt fallback to local MP3
      if (urlToPlay !== '/audio/ambient-cyberpunk.mp3') {
        console.info('[BackgroundMusic] Remote playback failed, falling back to local ambient soundtrack.');
        attemptPlayback('/audio/ambient-cyberpunk.mp3');
      } else {
        // Last-resort fallback to procedural synth
        console.info('[BackgroundMusic] Local audio failed, activating emergency procedural synth.');
        emergencySynth.start(targetVolumeRef.current);
        globalIsPlaying = true;
        setIsPlaying(true);
      }
    };

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        return playPromise
          .then(() => {
            console.log('[BackgroundMusic] Audio playback active on:', urlToPlay);
            globalIsPlaying = true;
            globalPlaybackStarted = true;
            setIsPlaying(true);
            emergencySynth.stop();
            return true;
          })
          .catch((err: any) => {
            if (err?.name === 'NotAllowedError') {
              console.warn('[BackgroundMusic] Browser autoplay policy blocked first attempt. Will retry on next user interaction.');
            } else if (err?.name === 'AbortError') {
              console.log('[BackgroundMusic] Play request interrupted by track change.');
            } else {
              console.warn('[BackgroundMusic] Playback exception:', err?.name, err?.message);
            }
            return false;
          });
      }
    } catch (err: any) {
      console.warn('[BackgroundMusic] Play invocation error:', err?.message || err);
    }

    return Promise.resolve(false);
  };

  // Attach touch/click listeners for the FIRST user interaction anywhere
  useEffect(() => {
    if (!isMusicEnabled) {
      if (globalAudioInstance && !globalAudioInstance.paused) {
        globalAudioInstance.pause();
      }
      emergencySynth.stop();
      globalIsPlaying = false;
      setIsPlaying(false);
      return;
    }

    // If audio is already actively playing in the shared instance, no listeners needed
    const audio = getSharedAudio();
    if (audio && !audio.paused) {
      setIsPlaying(true);
      return;
    }

    let isListenerActive = true;
    const userEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];

    const handleUserInteraction = () => {
      if (!isListenerActive) return;

      // Attempt playback directly inside the synchronous user gesture stack
      attemptPlayback().then((started) => {
        if (started && isListenerActive) {
          // Playback successfully started! Safely remove listeners to save CPU/battery
          isListenerActive = false;
          userEvents.forEach((evt) => {
            window.removeEventListener(evt, handleUserInteraction, true);
            document.removeEventListener(evt, handleUserInteraction, true);
          });
        }
        // If started === false (e.g. browser blocked with NotAllowedError), listeners
        // remain active so the very next user tap/click retries immediately!
      });
    };

    userEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { capture: true, passive: true });
      document.addEventListener(evt, handleUserInteraction, { capture: true, passive: true });
    });

    return () => {
      isListenerActive = false;
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction, true);
        document.removeEventListener(evt, handleUserInteraction, true);
      });
    };
  }, [isMusicEnabled]);

  // When admin uploads a new song or changes audioUrl in Admin Panel
  useEffect(() => {
    if (!globalPlaybackStarted) return;
    const audio = getSharedAudio();
    if (audio && resolvedUrl && (!audio.src || !audio.src.includes(resolvedUrl))) {
      console.log('[BackgroundMusic] Updating song to new URL from settings:', resolvedUrl);
      attemptPlayback(resolvedUrl);
    }
  }, [resolvedUrl]);

  // When volume setting is adjusted in Admin Panel
  useEffect(() => {
    const audio = getSharedAudio();
    if (audio) {
      audio.volume = targetVolume;
    }
  }, [targetVolume]);

  return null; // Headless shared background music engine
};

export default BackgroundMusic;
