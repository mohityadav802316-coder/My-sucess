import React, { useEffect, useRef, useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from './SoundEffects';

/**
 * BackgroundMusic
 * - No separate button needed: Starts automatically and loops on the user's first screen tap/touch.
 * - Synchronizes with CyberNavbar's Mute button.
 * - Smooth fade-in over 3-4 seconds.
 * - Silences or lowers volume automatically if Low Effects or Low Data mode is enabled.
 * - Fully configurable from Admin Panel (song upload, direct URL, volume slider, toggle switch).
 */
export const BackgroundMusic: React.FC = () => {
  const { siteSettings } = useImages();

  const DEFAULT_AUDIO_URL =
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-cyberpunk-114294.mp3';

  const rawUrl = siteSettings.music?.audioUrl;
  const validAudioUrl =
    rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== ''
      ? rawUrl.trim()
      : DEFAULT_AUDIO_URL;

  const musicSettings = {
    enabled: siteSettings.music?.enabled ?? true,
    audioUrl: validAudioUrl,
    volume: siteSettings.music?.volume ?? 0.35,
    title: siteSettings.music?.title || 'Cyberpunk Ambient Dream',
    loop: siteSettings.music?.loop ?? true,
    fadeInSeconds: siteSettings.music?.fadeInSeconds ?? 3,
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isLowEffects, setIsLowEffects] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mohit_low_effects') === 'true';
    }
    return false;
  });
  const [isLowData, setIsLowData] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        siteSettings.lowDataMode ||
        (navigator as any)?.connection?.saveData === true
      );
    }
    return false;
  });

  // Listen for Mute button toggle from CyberNavbar
  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const custom = e as CustomEvent<{ isMuted: boolean }>;
      const nextMuted = custom.detail?.isMuted ?? sound.getMuted();
      setIsMuted(nextMuted);
    };

    const handleLowEffectsChange = (e: Event) => {
      const custom = e as CustomEvent<{ lowEffects: boolean }>;
      setIsLowEffects(custom.detail?.lowEffects ?? false);
    };

    window.addEventListener('mohit_sound_mute_toggle', handleMuteChange);
    window.addEventListener('mohit_toggle_low_effects', handleLowEffectsChange);
    return () => {
      window.removeEventListener('mohit_sound_mute_toggle', handleMuteChange);
      window.removeEventListener('mohit_toggle_low_effects', handleLowEffectsChange);
    };
  }, []);

  // Update target volume & mute state
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (!musicSettings.enabled || isMuted || isLowEffects || isLowData) {
      audio.muted = true;
      audio.pause();
    } else {
      audio.muted = false;
      if (hasStartedPlaying && audio.paused) {
        audio.play().catch(() => {});
      }
    }
  }, [musicSettings.enabled, isMuted, isLowEffects, isLowData, hasStartedPlaying]);

  // Handle first user gesture to unlock audio in mobile browsers
  useEffect(() => {
    if (hasStartedPlaying) return;

    const startAudioOnFirstTouch = () => {
      if (!validAudioUrl) return;

      if (!audioRef.current) {
        audioRef.current = new Audio(validAudioUrl);
        audioRef.current.loop = musicSettings.loop !== false;
      }

      const audio = audioRef.current;
      if (audio.src !== validAudioUrl) {
        audio.src = validAudioUrl;
      }
      audio.loop = musicSettings.loop !== false;

      // If muted or low effects/data, keep audio paused/muted
      if (sound.getMuted() || !musicSettings.enabled || isLowEffects || isLowData) {
        audio.muted = true;
        setHasStartedPlaying(true);
        return;
      }

      // Smooth Fade-in sequence
      audio.volume = 0;
      audio.muted = false;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setHasStartedPlaying(true);
            const targetVolume = Math.min(Math.max(musicSettings.volume || 0.35, 0.05), 1.0);
            const duration = (musicSettings.fadeInSeconds || 3) * 1000;
            const steps = 30;
            const stepInterval = duration / steps;
            const volumeIncrement = targetVolume / steps;
            let currentStep = 0;

            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = window.setInterval(() => {
              currentStep++;
              if (audio) {
                const nextVol = Math.min(currentStep * volumeIncrement, targetVolume);
                audio.volume = nextVol;
              }
              if (currentStep >= steps) {
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              }
            }, stepInterval);
          })
          .catch((err) => {
            console.warn('Audio autoplay interaction deferred:', err);
          });
      }
    };

    const events = ['pointerdown', 'touchstart', 'click', 'keydown'];
    const handleGesture = () => {
      startAudioOnFirstTouch();
      events.forEach((evt) => window.removeEventListener(evt, handleGesture));
    };

    events.forEach((evt) => window.addEventListener(evt, handleGesture, { passive: true }));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleGesture));
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [validAudioUrl, musicSettings.enabled, musicSettings.loop, musicSettings.volume, musicSettings.fadeInSeconds, hasStartedPlaying, isLowEffects, isLowData]);

  // When audio URL changes from admin panel
  useEffect(() => {
    if (!audioRef.current || !validAudioUrl) return;
    if (audioRef.current.src !== validAudioUrl) {
      audioRef.current.src = validAudioUrl;
      if (hasStartedPlaying && !isMuted && musicSettings.enabled) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [validAudioUrl, hasStartedPlaying, isMuted, musicSettings.enabled]);

  return null; // Silent background controller
};
