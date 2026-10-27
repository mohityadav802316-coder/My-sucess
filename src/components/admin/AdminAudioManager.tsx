import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { uploadAudioToCloudinary } from '../../services/cloudinary';
import {
  Volume2,
  VolumeX,
  Music,
  Upload,
  Sparkles,
  Flame,
  Zap,
  Save,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Sliders,
  FastForward,
  Copy,
  Check
} from 'lucide-react';

export const AdminAudioManager: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings, updateSiteSettings } = useImages();

  // Music State
  const currentMusic = siteSettings.music || {
    enabled: true,
    audioUrl: '',
    volume: 0.35,
    title: 'Cyberpunk Ambient Dream',
    loop: true,
    fadeInSeconds: 3,
  };

  const [musicEnabled, setMusicEnabled] = useState(currentMusic.enabled !== false);
  const [audioUrl, setAudioUrl] = useState(currentMusic.audioUrl || '');
  const [volume, setVolume] = useState(currentMusic.volume ?? 0.35);
  const [musicTitle, setMusicTitle] = useState(currentMusic.title || 'Ambient Soundtrack');
  const [fadeInSeconds, setFadeInSeconds] = useState(currentMusic.fadeInSeconds || 3);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Black Magic Smoke State
  const currentSmoke = siteSettings.magicSmoke || {
    enabled: true,
    intensity: 'medium',
  };
  const [smokeEnabled, setSmokeEnabled] = useState(currentSmoke.enabled !== false);
  const [smokeIntensity, setSmokeIntensity] = useState<'off' | 'low' | 'medium' | 'high'>(
    currentSmoke.intensity || 'medium'
  );

  // Exploded View Intro State
  const currentIntro = siteSettings.explodedIntro || { enabled: true };
  const [introEnabled, setIntroEnabled] = useState(currentIntro.enabled !== false);

  // Low Data Mode State
  const [lowDataDefault, setLowDataDefault] = useState(siteSettings.lowDataMode ?? false);

  // Audio Preview state
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (siteSettings.music) {
      if (siteSettings.music.enabled !== undefined) setMusicEnabled(siteSettings.music.enabled);
      if (siteSettings.music.audioUrl) setAudioUrl(siteSettings.music.audioUrl);
      if (siteSettings.music.volume !== undefined) setVolume(siteSettings.music.volume);
      if (siteSettings.music.title) setMusicTitle(siteSettings.music.title);
      if (siteSettings.music.fadeInSeconds !== undefined) setFadeInSeconds(siteSettings.music.fadeInSeconds);
    }
    if (siteSettings.magicSmoke) {
      if (siteSettings.magicSmoke.enabled !== undefined) setSmokeEnabled(siteSettings.magicSmoke.enabled);
      if (siteSettings.magicSmoke.intensity) setSmokeIntensity(siteSettings.magicSmoke.intensity as any);
    }
    if (siteSettings.explodedIntro?.enabled !== undefined) {
      setIntroEnabled(siteSettings.explodedIntro.enabled);
    }
    if (siteSettings.lowDataMode !== undefined) {
      setLowDataDefault(siteSettings.lowDataMode);
    }
  }, [siteSettings.music, siteSettings.magicSmoke, siteSettings.explodedIntro, siteSettings.lowDataMode]);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    setUploadingAudio(true);
    setStatusMessage(null);

    try {
      // Direct Unsigned Upload to Cloudinary API without Firebase or Supabase
      const result = await uploadAudioToCloudinary(file, 'portfolio_audio');

      setAudioUrl(result.secureUrl);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setMusicTitle(cleanTitle);

      // Auto-persist directly into siteSettings so it is live immediately
      await updateSiteSettings({
        music: {
          ...currentMusic,
          enabled: true,
          audioUrl: result.secureUrl,
          title: cleanTitle,
          volume,
          loop: true,
        },
      });

      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: 'ऑडियो Cloudinary CDN पर सफलतापूर्वक अपलोड हो गया और बैकग्राउंड म्यूजिक में सेट हो गया!',
      });
    } catch (err: any) {
      console.error('Cloudinary audio upload error:', err);
      sound.playAlert();
      setStatusMessage({ type: 'error', text: 'Cloudinary Audio Upload Failed: ' + err.message });
    } finally {
      setUploadingAudio(false);
    }
  };

  const togglePreview = () => {
    sound.playClick();
    if (isPlayingPreview && previewAudio) {
      previewAudio.pause();
      setIsPlayingPreview(false);
    } else {
      if (!audioUrl || audioUrl.trim() === '') {
        setStatusMessage({ type: 'error', text: 'Please provide a valid audio URL or upload an audio file first.' });
        return;
      }
      const audio = new Audio(audioUrl.trim());
      audio.volume = volume;
      audio.play().then(() => {
        setPreviewAudio(audio);
        setIsPlayingPreview(true);
        audio.onended = () => setIsPlayingPreview(false);
      }).catch((err) => {
        setStatusMessage({ type: 'error', text: 'Preview playback failed: ' + err.message });
      });
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await updateSiteSettings({
        music: {
          enabled: musicEnabled,
          audioUrl: audioUrl.trim(),
          volume: Number(volume),
          title: musicTitle.trim(),
          loop: true,
          fadeInSeconds: Number(fadeInSeconds),
        },
        magicSmoke: {
          enabled: smokeEnabled && smokeIntensity !== 'off',
          intensity: smokeIntensity,
          colors: ['#ef4444', '#a855f7', '#f59e0b', '#06b6d4'],
        },
        explodedIntro: {
          enabled: introEnabled,
        },
        lowDataMode: lowDataDefault,
      }, true);

      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: 'Audio, Black Magic Smoke, and Intro settings saved successfully!',
      });
    } catch (err: any) {
      console.error('Settings save error:', err);
      setStatusMessage({ type: 'error', text: 'Failed to save settings: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1">
        <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-400" />
          <span>Background Music &amp; Black Magic Smoke Manager</span>
        </h2>
        <p className="text-xs font-mono text-slate-400">
          Configure auto-looping soundtrack, volume fade-in, and Doctor Strange text smoke intensity.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= SECTION 1: BACKGROUND MUSIC ================= */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-cyber font-bold text-white text-base flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Background Music Track</span>
            </h3>
            <label className="flex items-center gap-2 text-xs font-mono text-amber-300 cursor-pointer">
              <span>Enable Music</span>
              <input
                type="checkbox"
                checked={musicEnabled}
                onChange={(e) => setMusicEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">Track Title</label>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="e.g. Cyberpunk Ambient Dream"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                Audio Stream URL (or Upload below)
              </label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or paste MP3 URL"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              {audioUrl && (
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(audioUrl);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied URL!' : 'Copy Direct Audio URL'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-500">|</span>
                  <a
                    href={audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-slate-400 hover:text-white underline truncate max-w-xs"
                  >
                    Open Audio Link
                  </a>
                </div>
              )}
            </div>

            {/* Upload MP3 directly to Cloudinary CDN */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    Upload MP3 Song (Cloudinary CDN)
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    No Firebase / 100% Cloudinary
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Cloud: xdwssllt • Uploads directly to Cloudinary and sets background music
                </span>
              </div>
              <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-mono text-xs font-black cursor-pointer transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 active:scale-95 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingAudio ? 'Uploading...' : 'Select MP3 Song'}</span>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingAudio && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Uploading song directly to Cloudinary CDN (video/upload API)...
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-amber-400 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Volume Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Default Target Volume:</span>
                <span className="text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Fade In Duration */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Fade-In Duration (seconds):</span>
                <span className="text-amber-400 font-bold">{fadeInSeconds}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={fadeInSeconds}
                onChange={(e) => setFadeInSeconds(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Preview Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={togglePreview}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono hover:text-white transition cursor-pointer"
              >
                {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingPreview ? 'Pause Audio Preview' : 'Test Audio Preview'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: BLACK MAGIC SMOKE & PERFORMANCE ================= */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border border-rose-500/30 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-cyber font-bold text-white text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Black Magic Smoke (Text Aura)</span>
              </h3>
              <label className="flex items-center gap-2 text-xs font-mono text-rose-300 cursor-pointer">
                <span>Enable Aura</span>
                <input
                  type="checkbox"
                  checked={smokeEnabled}
                  onChange={(e) => setSmokeEnabled(e.target.checked)}
                  className="w-4 h-4 accent-rose-500"
                />
              </label>
            </div>
            <p className="text-xs font-sans text-slate-300">
              Doctor Strange dark dimension smoke curls around headings and text in the viewport. Subtle crimson core with violet, gold, and azure blue highlights.
            </p>
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-300 block">Smoke Intensity</label>
              <div className="grid grid-cols-4 gap-2">
                {(['off', 'low', 'medium', 'high'] as const).map((intensity) => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSmokeIntensity(intensity);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono uppercase font-bold border transition cursor-pointer ${
                      smokeIntensity === intensity
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Swirl Palette:</span>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-red-600 shadow-sm shadow-red-500" title="Crimson Core" />
                <span className="w-4 h-4 rounded-full bg-purple-600 shadow-sm shadow-purple-500" title="Violet Magic" />
                <span className="w-4 h-4 rounded-full bg-amber-500 shadow-sm shadow-amber-500" title="Runic Gold" />
                <span className="w-4 h-4 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500" title="Azure Portal" />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: EXPLODED VIEW INTRO ================= */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-fuchsia-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-cyber font-bold text-white text-base flex items-center gap-2">
                <FastForward className="w-4 h-4 text-fuchsia-400" />
                <span>Exploded View Missile Intro</span>
              </h3>
              <label className="flex items-center gap-2 text-xs font-mono text-fuchsia-300 cursor-pointer">
                <span>{introEnabled ? 'Active' : 'Disabled'}</span>
                <input
                  type="checkbox"
                  checked={introEnabled}
                  onChange={(e) => setIntroEnabled(e.target.checked)}
                  className="w-4 h-4 accent-fuchsia-500"
                />
              </label>
            </div>
            <p className="text-xs font-sans text-slate-300">
              Words launch like supersonic missiles with smoke tails from outer space and lock into place like an exploded view diagram. Plays once per session with skip button and real loading sync.
            </p>
          </div>

          {/* Performance & Low Data Mode Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/30 space-y-4 shadow-xl">
            <h3 className="font-cyber font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Mobile 60fps &amp; Low Data Mode</span>
            </h3>
            <p className="text-xs font-sans text-slate-300">
              Optimizes the site for mobile devices by automatically capping particle overhead and silencing heavy audio streams on metered connections.
            </p>
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs font-mono text-white">Default to Low Data Mode</span>
              <input
                type="checkbox"
                checked={lowDataDefault}
                onChange={(e) => setLowDataDefault(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xl shadow-amber-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Audio & Smoke Settings...' : 'Save All Settings to Firebase'}</span>
        </button>
      </div>
    </form>
  );
};
