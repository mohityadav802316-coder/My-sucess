import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sound } from './audio/SoundEffects';
import {
  Volume2,
  VolumeX,
  Languages,
  Shield,
  Menu,
  X,
  Zap,
  Sparkles,
  Lock,
  Heart,
  Users
} from 'lucide-react';

interface CyberNavbarProps {
  onOpenAdmin: () => void;
  isAdminView?: boolean;
  onOpenFamilyVault?: () => void;
  onOpenFriends?: () => void;
}

export const CyberNavbar: React.FC<CyberNavbarProps> = ({
  onOpenAdmin,
  isAdminView = false,
  onOpenFamilyVault,
  onOpenFriends,
}) => {
  const { mode, setMode } = useLanguage();
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isLowEffects, setIsLowEffects] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mohit_low_effects') === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const toggleLanguage = () => {
    sound.playClick();
    setMode(mode === 'hi' ? 'en' : 'hi');
  };

  const toggleLowEffects = () => {
    sound.playClick();
    const next = !isLowEffects;
    setIsLowEffects(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mohit_low_effects', String(next));
      window.dispatchEvent(new CustomEvent('mohit_toggle_low_effects', { detail: { lowEffects: next } }));
    }
  };

  const navLinks = [
    { href: '#about', labelEn: 'About', labelHi: 'परिचय' },
    { href: '#tech-console', labelEn: '3D Console', labelHi: '3D कंसोल' },
    { href: '#skills', labelEn: 'Skills', labelHi: 'कौशल' },
    { href: '#roadmap', labelEn: 'Journey', labelHi: 'सफर' },
    { href: '#projects', labelEn: 'Projects', labelHi: 'प्रोजेक्ट्स' },
    { href: '#gallery', labelEn: '3D Gallery', labelHi: '3D गैलरी' },
    { href: '#guestbook', labelEn: 'Guestbook', labelHi: 'गेस्टबुक' },
    { href: '#contact', labelEn: 'Contact', labelHi: 'संपर्क' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          onClick={() => sound.playClick()}
          className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-cyber font-black text-amber-400 text-xs">
              MY
            </div>
          </div>
          <span className="font-cyber font-bold text-white text-base tracking-wider group-hover:text-amber-300 transition whitespace-nowrap drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            MOHIT YADAV
          </span>
        </a>

        {/* Zone 2: Nav Links */}
        {!isAdminView && (
          <nav className="hidden lg:flex items-center space-x-1 shrink-0" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => sound.playHover()}
                className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-amber-300 transition whitespace-nowrap"
              >
                {mode === 'hi' ? link.labelHi : link.labelEn}
              </a>
            ))}
          </nav>
        )}

        {/* Zone 3: Primary Actions (Friends, Family Vault, Low Effects, Language, Audio, Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Friends Universe Button */}
          {onOpenFriends && !isAdminView && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenFriends();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-500/10 active:scale-95"
              title="Friends Universe 3D"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-bold">
                {mode === 'hi' ? 'दोस्त' : 'Friends'}
              </span>
            </button>
          )}

          {/* Locked Folder (Family Vault) Button */}
          {onOpenFamilyVault && !isAdminView && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenFamilyVault();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-300 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap shadow-sm shadow-rose-500/10 active:scale-95"
              title="Locked Folder - Family Vault"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline font-bold">
                {mode === 'hi' ? 'परिवार' : 'Vault'}
              </span>
            </button>
          )}

          {/* Low Effects / 100fps Battery Saver Toggle */}
          <button
            onClick={toggleLowEffects}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono border transition cursor-pointer active:scale-95 ${
              isLowEffects
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-amber-300 border-slate-800'
            }`}
            title={
              isLowEffects
                ? 'Low Effects: Active (Fastest 100fps Mode)'
                : 'Enable Low Effects (Battery Saver / Fast 100fps)'
            }
          >
            <Zap className={`w-3.5 h-3.5 ${isLowEffects ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline text-[10px]">
              {isLowEffects ? '100fps' : 'FX'}
            </span>
          </button>

          {/* EN/HI Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap shadow-sm shadow-amber-500/10 active:scale-95"
            title={mode === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase text-[11px]">
              {mode === 'hi' ? 'हिंदी' : 'ENG'}
            </span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 rounded-lg text-xs transition cursor-pointer active:scale-95"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Toggle sound"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Admin Panel Entry */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition cursor-pointer whitespace-nowrap ${
              isAdminView
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm shadow-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-800 hover:border-amber-500/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {isAdminView ? (mode === 'hi' ? 'साइट पर लौटें' : 'Return to Site') : (mode === 'hi' ? 'प्रशासक' : 'Admin')}
            </span>
            <span className="sm:hidden">Admin</span>
          </button>

          {!isAdminView && (
            <button
              onClick={() => {
                sound.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isAdminView && (
        <div className="lg:hidden bg-slate-950/95 border-b border-amber-500/20 px-4 pt-3 pb-5 space-y-2 backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-2">
            {onOpenFriends && (
              <button
                onClick={() => {
                  sound.playClick();
                  setMobileMenuOpen(false);
                  onOpenFriends();
                }}
                className="col-span-2 px-3 py-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 rounded-md border border-cyan-500/40 flex items-center justify-between"
              >
                <span className="flex items-center gap-2 font-bold">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{mode === 'hi' ? 'Friends Universe (दोस्त)' : 'Friends Universe 3D'}</span>
                </span>
                <span className="text-[10px] text-cyan-400">⚡</span>
              </button>
            )}
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  sound.playClick();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-xs font-mono text-slate-300 hover:text-amber-300 hover:bg-slate-900 rounded-md border border-slate-800 flex items-center justify-between"
              >
                <span>{mode === 'hi' ? link.labelHi : link.labelEn}</span>
                <span className="text-[10px] text-amber-400">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
