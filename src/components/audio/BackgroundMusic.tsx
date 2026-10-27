import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from './SoundEffects';

// Global Singleton HTMLAudioElement - exactly ONE instance across the entire application lifecycle
let globalAudioInstance: HTMLAudioElement | null = null;
let globalIsPlaying = false;
let globalPlaybackStarted = false;
let activePlayPromise: Promise<void> | null = null;

export const CLOUDINARY_PRIMARY_AUDIO =
  'https://res.cloudinary.com/xdwssllt/video/upload/v1793005297/portfolio_audio/mwoet0zflonxye8ifzpl.mp3';

// Procedural Cyberpunk Ambient Drone Synthesizer (Zero network dependencies, emergency fallback only)
class ProceduralAmbientSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isRunning = false;

  public initOrResume(): AudioContext | null {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  public start(targetVolume = 0.8) {
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
 * 1. If remote audio URL is provided, save to localStorage and use it.
 * 2. If cached in localStorage, return it.
 * 3. Default to the active Cloudinary song (Rolex BGM).
 */
function resolveAudioUrl(url: string | undefined): string {
  if (url && typeof url === 'string') {
    const trimmed = url.trim();
    if (
      trimmed &&
      (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
      !trimmed.includes('pixabay.com')
    ) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mohit_bg_music_url', trimmed);
        }
      } catch {}
      return trimmed;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mohit_bg_music_url');
      if (
        stored &&
        stored.trim() &&
        (stored.startsWith('http://') || stored.startsWith('https://')) &&
        !stored.includes('pixabay.com')
      ) {
        return stored.trim();
      }
    } catch {}
  }

  return CLOUDINARY_PRIMARY_AUDIO;
}

function getSharedAudio(initialUrl?: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioInstance) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.setAttribute('playsinline', 'true');
    (audio as any).playsInline = true;

    const url = initialUrl || CLOUDINARY_PRIMARY_AUDIO;
    audio.src = url;
    try {
      audio.load();
    } catch {}

    // Seamless loop across all desktop and mobile browsers
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
 * - Starts instantly on the user's VERY FIRST screen touch/tap/scroll anywhere on any page.
 * - Works on mobile touches, scrolls, taps, clicks across Home, direct Friend links, and all tabs.
 * - Does not block native 60fps scrolling or other interactions ({ passive: true }).
 * - Immediate Firestore sync for fresh sessions and direct deep links.
 * - Exposes window.__startBackgroundMusic() for zero-delay triggers.
 */
export const BackgroundMusic: React.FC = () => {
  const { siteSettings } = useImages();
  const musicSettings = siteSettings?.music;
  const isMusicEnabled = musicSettings?.enabled !== false;
  const rawAudioUrl = musicSettings?.audioUrl?.trim() || '';
  const [activeUrl, setActiveUrl] = useState<string>(() => resolveAudioUrl(rawAudioUrl));
  const targetVolume = Math.min(Math.max(musicSettings?.volume ?? 0.85, 0.05), 1.0);
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

    const urlToPlay = sourceUrl || activeUrlRef.current || CLOUDINARY_PRIMARY_AUDIO;

    // Warm up sound effects context during user gesture
    sound.setMuted(false);

    // Synchronize volume
    try {
      audio.volume = targetVolumeRef.current;
    } catch {}

    // If audio is already playing smoothly, preserve position and avoid restarting
    if (!audio.paused && audio.currentTime > 0 && audio.src && audio.src.includes(urlToPlay)) {
      globalIsPlaying = true;
      globalPlaybackStarted = true;
      setIsPlaying(true);
      emergencySynth.stop();
      return Promise.resolve(true);
    }

    // Set source if not matching
    if (!audio.src || !audio.src.includes(urlToPlay)) {
      audio.src = urlToPlay;
      try {
        audio.load();
      } catch {}
    }

    // Set error listener for automatic fallback
    audio.onerror = () => {
      const mediaError = audio.error;
      console.warn('[BackgroundMusic] Audio file notice on URL:', urlToPlay, mediaError?.code, mediaError?.message);
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
        activePlayPromise = playPromise;
        return playPromise
          .then(() => {
            activePlayPromise = null;
            globalIsPlaying = true;
            globalPlaybackStarted = true;
            setIsPlaying(true);
            emergencySynth.stop();
            return true;
          })
          .catch((err: any) => {
            activePlayPromise = null;
            if (err?.name === 'NotAllowedError') {
              // Expected if browser autoplay policy demands user gesture
            } else if (err?.name === 'AbortError') {
              // Interrupted by next touch/interaction
            } else {
              console.warn('[BackgroundMusic] Playback notice:', err?.name, err?.message);
            }
            return false;
          });
      }
    } catch (err: any) {
      activePlayPromise = null;
      console.warn('[BackgroundMusic] Play invocation notice:', err?.message || err);
    }
    return Promise.resolve(false);
  }, []);

  // Expose global starter on window for direct friend profile and UI interactions
  useEffect(() => {
    (window as any).__startBackgroundMusic = () => {
      attemptPlayback();
    };
    return () => {
      delete (window as any).__startBackgroundMusic;
    };
  }, [attemptPlayback]);

  // 1. Direct Autoplay Attempt on Initial Site Load
  useEffect(() => {
    if (isMusicEnabled) {
      attemptPlayback().catch(() => {});
    }
  }, [isMusicEnabled, attemptPlayback]);

  // 2. Attach touch/scroll/pointer/click listeners for FIRST genuine screen touch anywhere
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

    const audio = getSharedAudio(activeUrlRef.current);
    if (audio && !audio.paused && audio.currentTime > 0) {
      setIsPlaying(true);
      return;
    }

    let isListenerActive = true;
    const userEvents = [
      'touchstart',
      'touchend',
      'pointerdown',
      'pointerup',
      'mousedown',
      'mouseup',
      'click',
      'wheel',
      'scroll',
      'keydown'
    ];

    const removeAllListeners = () => {
      isListenerActive = false;
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction, true);
        document.removeEventListener(evt, handleUserInteraction, true);
        if (document.documentElement) {
          document.documentElement.removeEventListener(evt, handleUserInteraction, true);
        }
        if (document.body) {
          document.body.removeEventListener(evt, handleUserInteraction, true);
        }
      });
    };

    const handleUserInteraction = () => {
      if (!isListenerActive) return;

      attemptPlayback().then((started) => {
        if (started && isListenerActive) {
          removeAllListeners();
        }
      });
    };

    // When audio successfully starts playing, remove gesture listeners
    const onPlaying = () => {
      removeAllListeners();
    };

    if (audio) {
      audio.addEventListener('playing', onPlaying, { once: true });
    }

    userEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { capture: true, passive: true });
      document.addEventListener(evt, handleUserInteraction, { capture: true, passive: true });
      if (document.documentElement) {
        document.documentElement.addEventListener(evt, handleUserInteraction, { capture: true, passive: true });
      }
      if (document.body) {
        document.body.addEventListener(evt, handleUserInteraction, { capture: true, passive: true });
      }
    });

    return () => {
      if (audio) {
        audio.removeEventListener('playing', onPlaying);
      }
      removeAllListeners();
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
