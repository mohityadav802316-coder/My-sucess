import React, { useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { ThemeSettings } from '../../types';
import {
  Palette,
  Save,
  CheckCircle2,
  Sparkles,
  Volume2,
  Sliders,
  AlertCircle
} from 'lucide-react';

export const AdminThemeCustomizer: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useImages();
  const theme = siteSettings.theme;

  const [neonColor, setNeonColor] = useState<ThemeSettings['neonColor']>(
    theme?.neonColor || 'cyan'
  );
  const [glowIntensity, setGlowIntensity] = useState<ThemeSettings['glowIntensity']>(
    theme?.glowIntensity || 'balanced'
  );
  const [fontFamily, setFontFamily] = useState<ThemeSettings['fontFamily']>(
    theme?.fontFamily || 'rajdhani'
  );
  const [backgroundStyle, setBackgroundStyle] = useState<ThemeSettings['backgroundStyle']>(
    theme?.backgroundStyle || 'particles'
  );
  const [soundEnabled, setSoundEnabled] = useState(
    theme?.soundEnabledByDefault ?? false
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    sound.playClick();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateSiteSettings({
        theme: {
          neonColor,
          glowIntensity,
          fontFamily,
          backgroundStyle,
          soundEnabledByDefault: soundEnabled,
        },
        themeColor: neonColor,
      });
      sound.playSuccess();
      setSaveStatus('Theme customization saved and applied to live site!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      sound.playAlert();
      setSaveStatus(`Failed to save: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const colors = [
    { id: 'cyan', name: 'Electric Cyan (#06b6d4)', bg: 'bg-cyan-500', border: 'border-cyan-400' },
    { id: 'magenta', name: 'Neon Magenta (#ec4899)', bg: 'bg-pink-500', border: 'border-pink-400' },
    { id: 'purple', name: 'Ultra Violet (#a855f7)', bg: 'bg-purple-500', border: 'border-purple-400' },
    { id: 'emerald', name: 'Cyber Emerald (#10b981)', bg: 'bg-emerald-500', border: 'border-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h3 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <span>Theme &amp; Aesthetics Customizer / थीम एवं चमक</span>
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Control neon palette, atmospheric lighting intensity, typography, and procedural audio defaults.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Save & Publish Theme'}</span>
        </button>
      </div>

      {saveStatus && (
        <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
          saveStatus.includes('Failed')
            ? 'bg-red-950/80 border border-red-500/50 text-red-300'
            : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
        }`}>
          {saveStatus.includes('Failed') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Color Palette Selector */}
      <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-4">
        <h4 className="font-cyber font-bold text-sm text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Primary Neon Accent Palette</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playClick();
                setNeonColor(c.id as any);
              }}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2.5 transition cursor-pointer ${
                neonColor === c.id
                  ? `${c.border} bg-gray-900 shadow-md`
                  : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${c.bg} shadow-md`} />
              <span className="text-xs font-mono text-gray-200">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity & Typography */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
          <label className="text-xs font-mono text-gray-300 uppercase block font-semibold">
            Neon Glow Intensity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['subtle', 'balanced', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  sound.playClick();
                  setGlowIntensity(level);
                }}
                className={`py-2 rounded-lg text-xs font-mono uppercase border transition cursor-pointer ${
                  glowIntensity === level
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-gray-900 text-gray-400 border-gray-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
          <label className="text-xs font-mono text-gray-300 uppercase block font-semibold">
            Typography System
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'rajdhani', label: 'Rajdhani (Tech)' },
              { id: 'orbitron', label: 'Orbitron (Cyber)' },
              { id: 'sans', label: 'Inter / Sans' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sound.playClick();
                  setFontFamily(f.id as any);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-mono border transition cursor-pointer text-center ${
                  fontFamily === f.id
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                    : 'bg-gray-900 text-gray-400 border-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Procedural Audio Settings */}
      <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
        <h4 className="font-cyber font-bold text-sm text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Synthesizer Audio Settings</span>
        </h4>
        <label className="flex items-center gap-3 text-xs font-mono text-gray-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="accent-cyan-400 rounded w-4 h-4"
          />
          <span>Enable Web Audio UI sound effects by default for visitors</span>
        </label>
      </div>
    </div>
  );
};
