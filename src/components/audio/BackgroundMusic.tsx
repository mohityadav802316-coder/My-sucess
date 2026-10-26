import React, { useEffect, useRef, useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from './SoundEffects';

// Procedural Cyberpunk Ambient Drone Synthesizer (Zero network dependencies, 100% reliable fallback)
class ProceduralAmbientSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isRunning = false;

  public start(targetVolume = 0.22) {
    if (this.isRunning) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(targetVolume, 0.01), this.ctx.currentTime + 2.5);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass resonant filter for warm analog sci-fi sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.2, this.ctx.currentTime);
      filter.connect(this.masterGain);

      // LFO for breathing filter sweep
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.oscillators.push(lfo);

      // Harmonious Sci-Fi Cyber Chord: C2 (65.41 Hz), G2 (98.00 Hz), C3 (130.81 Hz), D#3 (155.56 Hz), G3 (196.00 Hz)
      const frequencies = [65.41, 98.0, 130.81, 155.56, 196.0];
      frequencies.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        // subtle detune for analog chorus warmth
        osc.detune.setValueAtTime((idx - 2) * 4, this.ctx!.currentTime);

        oscGain.gain.setValueAtTime(0.12 / frequencies.length, this.ctx!.currentTime);
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
        if (this.ctx && this.ctx.state !== 'closed') {
          try {
            this.ctx.close();
          } catch {}
        }
        this.isRunning = false;
      }, 1000);
    } catch {
      this.isRunning = false;
    }
  }
}

const ambientSynth = new ProceduralAmbientSynth();

/**
 * BackgroundMusic
 * - Starts automatically on the user's VERY FIRST screen touch/click anywhere.
 * - Plays uploaded Cloudinary MP3 song when available.
 * - If no MP3 is uploaded or external URL fails, plays our 100% reliable procedural cyber synth.
 * - Synchronizes with CyberNavbar's Mute button.
 */
export const BackgroundMusic: React.FC = () => {
  const { siteSettings } = useImages();

  const userAudioUrl = siteSettings.music?.audioUrl?.trim() || '';

  const musicSettings = {
    enabled: siteSettings.music?.enabled ?? true,
    audioUrl: userAudioUrl,
    volume: siteSettings.music?.volume ?? 0.35,
    title: siteSettings.music?.title || 'Cyberpunk Ambient Dream',
    loop: siteSettings.music?.loop ?? true,
    fadeInSeconds: siteSettings.music?.fadeInSeconds ?? 2,
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Listen for Mute button toggle from CyberNavbar
  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const custom = e as CustomEvent<{ isMuted: boolean }>;
      const nextMuted = custom.detail?.isMuted ?? sound.getMuted();
      setIsMuted(nextMuted);

      if (nextMuted) {
        ambientSynth.setVolume(0);
        if (audioRef.current) {
          audioRef.current.muted = true;
          audioRef.current.pause();
        }
      } else {
        const targetVol = musicSettings.volume || 0.35;
        if (audioRef.current && userAudioUrl && !audioRef.current.paused) {
          audioRef.current.muted = false;
          audioRef.current.volume = targetVol;
        } else {
          ambientSynth.setVolume(targetVol);
        }
      }
    };

    window.addEventListener('mohit_sound_mute_toggle', handleMuteChange);
    return () => {
      window.removeEventListener('mohit_sound_mute_toggle', handleMuteChange);
    };
  }, [musicSettings.volume, userAudioUrl]);

  // Handle first user gesture anywhere on screen to automatically start background music
  useEffect(() => {
    if (hasStartedPlaying) return;

    const startAudioOnFirstTouch = () => {
      sound.setMuted(false);
      setIsMuted(false);

      if (!musicSettings.enabled) {
        setHasStartedPlaying(true);
        return;
      }

      const targetVol = Math.min(Math.max(musicSettings.volume || 0.35, 0.05), 1.0);

      // 1. If user provided a Cloudinary or direct MP3 audio URL
      if (userAudioUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio(userAudioUrl);
          audioRef.current.loop = musicSettings.loop !== false;
        }

        const audio = audioRef.current;
        if (audio.src !== userAudioUrl) {
          audio.src = userAudioUrl;
        }
        audio.loop = musicSettings.loop !== false;
        audio.volume = 0;
        audio.muted = false;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setHasStartedPlaying(true);
              ambientSynth.stop(); // Stop fallback synth when MP3 plays successfully

              // Fade-in MP3
              const duration = (musicSettings.fadeInSeconds || 2) * 1000;
              const steps = 25;
              const stepInterval = duration / steps;
              const volumeIncrement = targetVol / steps;
              let currentStep = 0;

              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = window.setInterval(() => {
                currentStep++;
                if (audio) {
                  audio.volume = Math.min(currentStep * volumeIncrement, targetVol);
                }
                if (currentStep >= steps) {
                  if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                }
              }, stepInterval);
            })
            .catch((err) => {
              console.warn('Custom MP3 playback deferred or blocked, fallback to ambient synth:', err);
              // Fallback to ambient synth
              ambientSynth.start(targetVol);
              setHasStartedPlaying(true);
            });
        }

        audio.onerror = () => {
          console.warn('Audio URL encountered an error, activating ambient synth fallback.');
          ambientSynth.start(targetVol);
        };
      } else {
        // 2. No custom MP3 URL set yet: Start soothing procedural cyberpunk ambient synthesizer
        ambientSynth.start(targetVol);
        setHasStartedPlaying(true);
      }
    };

    const events = ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'];
    const handleGesture = () => {
      startAudioOnFirstTouch();
      events.forEach((evt) => window.removeEventListener(evt, handleGesture, true));
    };

    events.forEach((evt) => window.addEventListener(evt, handleGesture, true));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleGesture, true));
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [userAudioUrl, musicSettings.enabled, musicSettings.loop, musicSettings.volume, musicSettings.fadeInSeconds, hasStartedPlaying]);

  // When audio URL is uploaded or changed from admin panel
  useEffect(() => {
    if (!userAudioUrl || !hasStartedPlaying) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(userAudioUrl);
    }

    const audio = audioRef.current;
    if (audio.src !== userAudioUrl) {
      audio.src = userAudioUrl;
      audio.loop = musicSettings.loop !== false;
      audio.volume = musicSettings.volume || 0.35;
      audio.muted = isMuted;

      if (!isMuted && musicSettings.enabled) {
        audio
          .play()
          .then(() => {
            ambientSynth.stop();
          })
          .catch(() => {
            ambientSynth.start(musicSettings.volume || 0.35);
          });
      }
    }
  }, [userAudioUrl, hasStartedPlaying, isMuted, musicSettings.enabled, musicSettings.volume, musicSettings.loop]);

  return null; // Silent controller
};
