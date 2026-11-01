
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sound } from './audio/SoundEffects';

import {
  Languages,
  Shield,
  Menu,
  X,
  Zap,
  Lock,
  Users,
  ChevronRight,
  Home,
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

  // Safely read saved performance preference
  const [isLowEffects, setIsLowEffects] = useState(() => {
    if (typeof window === 'undefined') return false;

    try {
      return localStorage.getItem('mohit_low_effects') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation links
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

  // Sound helper
  const playClick = () => {
    sound.playClick();
  };

  // Language switcher
  const toggleLanguage = () => {
    playClick();
    setMode(mode === 'hi' ? 'en' : 'hi');
  };

  // Performance / Low Effects switcher
  const toggleLowEffects = () => {
    playClick();

    const next = !isLowEffects;
    setIsLowEffects(next);

    try {
      localStorage.setItem('mohit_low_effects', String(next));
    } catch {
      // Continue even if browser storage is unavailable
    }

    window.dispatchEvent(
      new CustomEvent('mohit_toggle_low_effects', {
        detail: { lowEffects: next },
      })
    );
  };

  // Open Friends
  const handleOpenFriends = () => {
    playClick();
    setMobileMenuOpen(false);
    onOpenFriends?.();
  };

  // Open Family Vault
  const handleOpenFamilyVault = () => {
    playClick();
    setMobileMenuOpen(false);
    onOpenFamilyVault?.();
  };

  // Open Admin
  const handleOpenAdmin = () => {
    playClick();
    setMobileMenuOpen(false);
    onOpenAdmin();
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    playClick();
    setMobileMenuOpen((prev) => !prev);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isHindi = mode === 'hi';

  // Reusable luxury button styling
  const actionButton =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer whitespace-nowrap';

  const goldButton =
    'border-amber-500/30 bg-[#11100c] text-amber-300 hover:border-amber-400/70 hover:bg-amber-500/10 hover:text-amber-200';

  const silverButton =
    'border-slate-500/30 bg-[#101010] text-slate-300 hover:border-slate-300/60 hover:bg-white/5 hover:text-white';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-2xl border-b border-amber-500/20 shadow-[0_5px_25px_rgba(0,0,0,0.65)]">

      {/* Main Navbar */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-[66px] flex items-center justify-between gap-2 sm:gap-4">

        {/* Zone 1: Premium Brand Logo */}
        <a
          href="#"
          onClick={playClick}
          aria-label="Mohit Yadav - Home"
          className="group flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
        >
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f5d77a] via-[#c49a36] to-[#80601d] p-[1px] shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:shadow-[0_0_22px_rgba(212,175,55,0.35)] transition-all duration-300">
            <div className="w-full h-full rounded-[10px] bg-[#080808] flex items-center justify-center">
              <span className="text-[#e5c46b] font-black text-sm tracking-tight">
                MY
              </span>
            </div>
          </div>

          {/* Brand Name */}
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-white text-[13px] sm:text-[15px] tracking-[1.5px] whitespace-nowrap group-hover:text-amber-200 transition-colors">
              MOHIT YADAV
            </span>
            <span className="hidden sm:block text-[8px] tracking-[3px] text-[#b7a16a] font-medium mt-1">
              DIGITAL IDENTITY
            </span>
          </div>
        </a>

        {/* Zone 2: Desktop Navigation */}
        {!isAdminView && (
          <nav
            className="hidden xl:flex items-center justify-center gap-0.5 flex-1"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => sound.playHover()}
                className="relative px-2.5 py-2 text-[11px] font-medium tracking-wide text-slate-300 hover:text-[#e7c66e] transition-colors duration-200 whitespace-nowrap group"
              >
                {isHindi ? link.labelHi : link.labelEn}

                <span className="absolute bottom-0 left-2.5 right-2.5 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </a>
            ))}
          </nav>
        )}

        {/* Zone 3: Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* Friends Button */}
          {onOpenFriends && !isAdminView && (
            <button
              type="button"
              onClick={handleOpenFriends}
              className={`${actionButton} ${goldButton}`}
              title="Friends Universe"
              aria-label="Open Friends Universe"
            >
              <Users className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">
                {isHindi ? 'दोस्त' : 'Friends'}
              </span>
            </button>
          )}

          {/* Family Vault Button */}
          {onOpenFamilyVault && !isAdminView && (
            <button
              type="button"
              onClick={handleOpenFamilyVault}
              className={`${actionButton} ${silverButton}`}
              title="Family Vault"
              aria-label="Open Family Vault"
            >
              <Lock className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">
                {isHindi ? 'परिवार' : 'Vault'}
              </span>
            </button>
          )}

          {/* Low Effects Toggle */}
          <button
            type="button"
            onClick={toggleLowEffects}
            className={`${actionButton} ${
              isLowEffects
                ? 'border-amber-400/60 bg-amber-500/10 text-amber-300'
                : silverButton
            }`}
            title={
              isLowEffects
                ? 'Low Effects Active - Performance Mode'
                : 'Enable Low Effects - Battery Saver'
            }
            aria-label="Toggle Low Effects"
            aria-pressed={isLowEffects}
          >
            <Zap
              className={`w-4 h-4 ${
                isLowEffects ? 'text-amber-300' : 'text-slate-400'
              }`}
              fill={isLowEffects ? 'currentColor' : 'none'}
            />
            <span className="hidden md:inline text-[10px]">
              {isLowEffects ? 'ON' : 'FX'}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={`${actionButton} ${goldButton}`}
            title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
            aria-label="Change language"
          >
            <Languages className="w-4 h-4" />
            <span className="font-semibold uppercase text-[10px]">
              {isHindi ? 'HI' : 'EN'}
            </span>
          </button>

          {/* Admin Button */}
          <button
            type="button"
            onClick={handleOpenAdmin}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer whitespace-nowrap ${
              isAdminView
                ? 'bg-gradient-to-r from-[#c49a36]/20 to-[#80601d]/10 text-[#f0d68b] border-[#d4af37]/60 shadow-[0_0_12px_rgba(212,175,55,0.12)]'
                : 'bg-[#15130e] text-[#d4af37] border-[#d4af37]/40 hover:border-[#e8ca72] hover:bg-[#d4af37]/10'
            }`}
            aria-label={isAdminView ? 'Return to Website' : 'Open Admin Panel'}
          >
            <Shield className="w-4 h-4 text-[#d4af37]" />

            <span className="hidden sm:inline">
              {isAdminView
                ? isHindi
                  ? 'साइट पर लौटें'
                  : 'Return to Site'
                : isHindi
                  ? 'प्रशासक'
                  : 'Admin'}
            </span>

            <span className="sm:hidden text-[10px]">
              Admin
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          {!isAdminView && (
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="xl:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-amber-500/30 bg-[#11100c] text-[#d4af37] hover:bg-amber-500/10 hover:border-amber-400 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && !isAdminView && (
        <div className="xl:hidden border-t border-[#d4af37]/20 bg-[#070707]/[0.98] backdrop-blur-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)]">

          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">

            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] tracking-[3px] text-[#c5a75b] uppercase font-semibold">
                  Navigation
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  {isHindi ? 'आपका डिजिटल स्पेस' : 'Explore Digital Space'}
                </p>
              </div>

              <span className="text-[9px] text-slate-500 font-mono tracking-wider">
                MOHIT OS
              </span>
            </div>

            {/* Friends and Family Actions */}
            {(onOpenFriends || onOpenFamilyVault) && (
              <div className="grid grid-cols-2 gap-2 mb-4">

                {onOpenFriends && (
                  <button
                    type="button"
                    onClick={handleOpenFriends}
                    className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl border border-[#d4af37]/35 bg-gradient-to-br from-[#d4af37]/10 to-transparent text-[#e8ca72] hover:bg-[#d4af37]/15 transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Users className="w-4 h-4" />
                      {isHindi ? 'दोस्त' : 'Friends'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#a58b4b]" />
                  </button>
                )}

                {onOpenFamilyVault && (
                  <button
                    type="button"
                    onClick={handleOpenFamilyVault}
                    className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl border border-slate-500/30 bg-gradient-to-br from-white/5 to-transparent text-slate-300 hover:border-[#d4af37]/40 hover:text-[#e8ca72] transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Lock className="w-4 h-4 text-[#d4af37]" />
                      {isHindi ? 'परिवार' : 'Family Vault'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>
            )}

            {/* Navigation Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    playClick();
                    closeMobileMenu();
                  }}
                  className="group flex items-center justify-between gap-2 px-3 py-3 rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-300 hover:text-[#e8ca72] hover:border-[#d4af37]/35 hover:bg-[#d4af37]/[0.06] transition-all duration-200"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] text-[#a58b4b] font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="text-[11px] font-medium truncate">
                      {isHindi ? link.labelHi : link.labelEn}
                    </span>
                  </span>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#d4af37] shrink-0 transition-colors" />
                </a>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-[#a58b4b]" />
                <span className="text-[10px] text-slate-500 tracking-wide">
                  MOHIT YADAV
                </span>
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="text-[10px] text-[#d4af37] hover:text-white transition-colors"
              >
                {isHindi ? 'बंद करें' : 'Close Menu'}
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
