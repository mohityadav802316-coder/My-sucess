import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from './SoundEffects';

// Global Singleton HTMLAudioElement - exactly ONE instance across the entire application lifecycle
let globalAudioInstance: HTMLAudioElement | null = null;
let globalIsPlaying = false;
let globalPlaybackStarted = false;
let isPlaybackAttemptPending = false;

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

/**
 * Filter and resolve audio URL:
 * 1. If Cloudinary / remote audio URL is provided, save to localStorage and use it.
 * 2. If url is default/local, check localStorage for a remote Cloudinary song saved previously.
 * 3. Fallback to local '/audio/ambient-cyberpunk.mp3'.
 */
function resolveAudioUrl(url: string | undefined): string {
  // If remote URL is provided (Cloudinary / HTTPS)
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !trimmed.includes('pixabay.com')) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mohit_bg_music_url', trimmed);
        }
      } catch {}
      return trimmed;
    }
  }

  // Check localStorage for remote URL
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mohit_bg_music_url');
      if (stored && stored.trim() && (stored.startsWith('http://') || stored.startsWith('https://')) && !stored.includes('pixabay.com')) {
        return stored.trim();
      }
    } catch {}
  }

  // If provided url is valid non-remote string
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed && !trimmed.includes('pixabay.com')) {
      return trimmed;
    }
  }

  return '/audio/ambient-cyberpunk.mp3';
}

// Helper to retrieve or lazily create the single shared HTMLAudioElement
function getSharedAudio(initialUrl?: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioInstance) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    audio.setAttribute('playsinline', 'true');
    (audio as any).playsInline = true;

    if (initialUrl) {
      audio.src = initialUrl;
    }

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
 * BackgroundMusic
 * - Single shared HTMLAudioElement for entire application.
 * - Starts reliably on the user's VERY FIRST screen touch/click/press anywhere on any page.
 * - Works on Home page, direct Friend Profile links (?friend=ID, /friend/ID), and all tabs.
 * - Direct Firestore sync on mount for fresh sessions.
 * - Debounced interaction handlers to prevent mobile AbortError.
 * - Exposes window.__startBackgroundMusic() for direct triggers.
 */
export const BackgroundMusic: React.FC = () => {
  const { siteSettings } = useImages();
  const musicSettings = siteSettings?.music;
  const isMusicEnabled = musicSettings?.enabled !== false;
  const rawAudioUrl = musicSettings?.audioUrl?.trim() || '';
  const [activeUrl, setActiveUrl] = useState<string>(() => resolveAudioUrl(rawAudioUrl));
  const targetVolume = Math.min(Math.max(musicSettings?.volume ?? 0.35, 0.05), 1.0);
  const [, setIsPlaying] = useState<boolean>(() => globalIsPlaying);

  const activeUrlRef = useRef<string>(activeUrl);
  activeUrlRef.current = activeUrl;
  const targetVolumeRef = useRef<number>(targetVolume);
  targetVolumeRef.current = targetVolume;
  const isMusicEnabledRef = useRef<boolean>(isMusicEnabled);
  isMusicEnabledRef.current = isMusicEnabled;

  // Direct Firestore fetch on mount for fresh sessions / direct friend URLs
  useEffect(() => {
    let isMounted = true;
    const fetchDirectSettings = async () => {
      try {
        const { db } = await import('../../firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists() && isMounted) {
          const data = snap.data();
          const remoteUrl = data?.music?.audioUrl;
          if (remoteUrl && typeof remoteUrl === 'string' && remoteUrl.trim().startsWith('http')) {
            const cleanUrl = remoteUrl.trim();
            try {
              localStorage.setItem('mohit_bg_music_url', cleanUrl);
            } catch {}
            setActiveUrl(cleanUrl);
            activeUrlRef.current = cleanUrl;
            const audio = getSharedAudio();
            if (audio && (!audio.src || !audio.src.includes(cleanUrl))) {
              audio.src = cleanUrl;
            }
          }
        }
      } catch {
        // Fallback silently if offline or restricted
      }
    };
    fetchDirectSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state when siteSettings changes from context
  useEffect(() => {
    const nextUrl = resolveAudioUrl(rawAudioUrl);
    if (nextUrl !== activeUrlRef.current) {
      setActiveUrl(nextUrl);
      activeUrlRef.current = nextUrl;
      const audio = getSharedAudio();
      if (audio && (!audio.src || !audio.src.includes(nextUrl))) {
        audio.src = nextUrl;
        if (globalPlaybackStarted && !audio.paused) {
          audio.play().catch(() => {});
        }
      }
    }
  }, [rawAudioUrl]);

  // Single robust playback function
  const attemptPlayback = useCallback((sourceUrl?: string): Promise<boolean> => {
    if (!isMusicEnabledRef.current) return Promise.resolve(false);
    const audio = getSharedAudio(activeUrlRef.current);
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
      if (urlToPlay !== '/audio/ambient-cyberpunk.mp3') {
        attemptPlayback('/audio/ambient-cyberpunk.mp3');
      } else {
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
              console.warn('[BackgroundMusic] Browser autoplay policy blocked. Will retry on next interaction.');
            } else if (err?.name === 'AbortError') {
              console.log('[BackgroundMusic] Play request interrupted or debounced.');
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
  }, []);

  // Expose global starter on window for direct friend profile clicks
  useEffect(() => {
    (window as any).__startBackgroundMusic = () => {
      if (!isPlaybackAttemptPending) {
        isPlaybackAttemptPending = true;
        attemptPlayback().finally(() => {
          setTimeout(() => {
            isPlaybackAttemptPending = false;
          }, 300);
        });
      }
    };
    return () => {
      delete (window as any).__startBackgroundMusic;
    };
  }, [attemptPlayback]);

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

    // Pre-initialize shared audio with current active URL so it is immediately ready
    const audio = getSharedAudio(activeUrlRef.current);
    if (audio && !audio.paused) {
      setIsPlaying(true);
      return;
    }

    let isListenerActive = true;
    const userEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];

    const handleUserInteraction = () => {
      if (!isListenerActive) return;
      if (isPlaybackAttemptPending) return;

      isPlaybackAttemptPending = true;
      setTimeout(() => {
        isPlaybackAttemptPending = false;
      }, 350);

      // Attempt playback directly inside the synchronous user gesture stack
      attemptPlayback().then((started) => {
        if (started && isListenerActive) {
          isListenerActive = false;
          userEvents.forEach((evt) => {
            window.removeEventListener(evt, handleUserInteraction, true);
            document.removeEventListener(evt, handleUserInteraction, true);
          });
        }
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
  }, [isMusicEnabled, attemptPlayback]);

  // When volume setting is adjusted in Admin Panel
  useEffect(() => {
    const audio = getSharedAudio();
    if (audio) {
      audio.volume = targetVolume;
    }
  }, [targetVolume]);

  return null;
};

export default BackgroundMusic;
