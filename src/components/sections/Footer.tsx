import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import { Shield, ArrowUp, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onReplayBoot?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onReplayBoot }) => {
  const { mode } = useLanguage();

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-slate-900 bg-slate-950/95 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          {/* Brand Info */}
          <div className="space-y-1 text-center md:text-left">
            <span className="font-cyber font-bold text-lg text-white tracking-wider block">
              MOHIT YADAV
            </span>
            <p className="text-xs font-mono text-slate-400">
              Future AI Engineer • Python Developer • Web &amp; App Creator
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              Class 12 Science Student, Bihar Board (BSEB) • Bihar, India
            </p>
          </div>

          {/* Quick Nav & Admin Link */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono text-slate-400">
            <a href="#about" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              About
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <a href="#cybersecurity" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              Cyber Defense
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <a href="#gallery" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              3D Gallery
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <a href="#skills" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              Skills
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <a href="#roadmap" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              Roadmap
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <a href="#projects" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              Projects
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <a href="#contact" onClick={() => sound.playHover()} className="hover:text-cyan-300 transition">
              Contact
            </a>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenAdmin();
              }}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
            {onReplayBoot && (
              <>
                <span aria-hidden="true" className="text-slate-700">•</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onReplayBoot();
                  }}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                  title="Replay Cyber Boot Sequence"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{mode === 'hi' ? 'री-प्ले बूट' : 'Replay Boot'}</span>
                </button>
              </>
            )}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 hover:text-cyan-300 transition cursor-pointer"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Closing Statement */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-400 font-sans max-w-xl mx-auto">
            {mode === 'hi'
              ? 'दैनिक निरंतर अभ्यास, AI के सिद्धांतों में महारत और समाज के लिए सार्थक डिजिटल तकनीक के निर्माण का संकल्प।'
              : 'Dedicated to relentless daily learning, mastering AI fundamentals, and crafting impactful digital tools for the future.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
            <span>© 2026 Mohit Yadav. All rights reserved.</span>
            <span aria-hidden="true">•</span>
            <span className="text-amber-400/80">Class 12 Science (BSEB)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
