import React, { useState } from 'react';
import { Home, Plus, ArrowRight, User } from 'lucide-react';
import { Friend, resolveImageUrl } from '../data/friends';
import { sound } from '../../components/audio/SoundEffects';

interface SharedProfilePreviewProps {
  friend: Friend | null;
  isLoading?: boolean;
  onViewMore: () => void;
  onClose: () => void;
  onAdd?: () => void;
}

export const SharedProfilePreview: React.FC<SharedProfilePreviewProps> = ({
  friend,
  isLoading = false,
  onViewMore,
  onClose,
  onAdd,
}) => {
  const [imgError, setImgError] = useState(false);

  const photoUrl = friend
    ? resolveImageUrl(friend.avatar || friend.heroPhotos?.[0] || friend.photos?.[0]) || ''
    : '';

  // Naam ko first aur last name me split karne ke liye (Jaise: Aditya / Sharma)
  const nameParts = friend?.name ? friend.name.trim().split(' ') : ['Aditya', 'Sharma'];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClickCapture={() => (window as any).__startBackgroundMusic?.()}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#070708] text-slate-100 select-none overflow-y-auto overflow-x-hidden font-sans"
    >
      {/* Background Subtle Vignette & Dark Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[450px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      {/* 1. Top Header Bar */}
      <header className="relative z-20 w-full max-w-md mx-auto px-5 pt-6 pb-2 flex items-center justify-between">
        {/* Left Home Button */}
        <button
          type="button"
          onClick={() => {
            sound?.playClick?.();
            onClose();
          }}
          className="w-10 h-10 rounded-full border border-amber-500/30 bg-[#121214] flex items-center justify-center text-amber-200/80 hover:text-amber-300 hover:border-amber-400/60 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <Home className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Center CyberMohit Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border border-amber-500/60 rounded flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">
            F_
          </div>
          <span className="text-xs font-mono font-bold tracking-[0.28em] text-amber-100 uppercase">
            CYBERMOHIT
          </span>
        </div>

        {/* Right Gold Plus Button */}
        <button
          type="button"
          onClick={() => {
            sound?.playClick?.();
            onAdd?.();
          }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#eed286] via-[#d4af37] to-[#aa7c11] flex items-center justify-center text-black font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* 2. Main Content Area */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-4 flex-1 flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 animate-spin" />
            <p className="text-xs font-mono text-amber-400 tracking-widest uppercase mt-3">
              Loading Profile...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* Arch-Shaped Profile Photo Container */}
            <div className="relative w-64 sm:w-72 h-[340px] sm:h-[370px] rounded-t-full rounded-b-2xl p-[1.5px] bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-amber-500/40 shadow-[0_0_35px_rgba(0,0,0,0.8)]">
              {/* Inner Arch Frame */}
              <div className="w-full h-full rounded-t-full rounded-b-2xl bg-[#0d0d10] overflow-hidden flex flex-col items-center justify-between p-4 relative">
                {/* Background Shadow inside frame */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                {/* Profile Image or Placeholder */}
                <div className="w-full h-full flex items-center justify-center">
                  {photoUrl && !imgError ? (
                    <img
                      src={photoUrl}
                      alt={friend?.name || 'Profile'}
                      onError={() => setImgError(true)}
                      className="absolute inset-0 w-full h-full object-cover object-center rounded-t-full rounded-b-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center mt-12 opacity-40">
                      <div className="w-24 h-24 rounded-full border-2 border-amber-400/80 mb-2" />
                      <div className="w-36 h-20 border-t-2 border-amber-400/80 rounded-t-full" />
                    </div>
                  )}
                </div>

                {/* Bottom Photo Tag Text */}
                <span className="relative z-20 text-[10px] tracking-[0.35em] text-amber-200/50 font-mono uppercase pb-1">
                  [ PORTRAIT PHOTO ]
                </span>
              </div>
            </div>

            {/* Name Typography (Serif Style) */}
            <div className="mt-7 flex flex-col items-center">
              <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-wide leading-tight">
                {firstName}
              </h1>
              {lastName && (
                <h2 className="font-serif text-3xl sm:text-4xl bg-gradient-to-b from-[#f5df9b] to-[#b8861d] bg-clip-text text-transparent font-medium tracking-wide">
                  {lastName}
                </h2>
              )}
            </div>

            {/* Red Diamond Divider */}
            <div className="mt-3.5 flex items-center justify-center gap-3 w-40">
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-500/40" />
              <span className="w-1.5 h-1.5 bg-rose-600 rotate-45" />
              <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-500/40" />
            </div>

            {/* Tagline / Subtitle */}
            <p className="mt-2 text-[10px] sm:text-xs font-mono tracking-[0.25em] text-amber-100/70 uppercase">
              {friend?.tagline || friend?.role || 'VETERAN SNIPER LEGEND'}
            </p>

            {/* 3. Gold Pill "View More" Button */}
            <div className="mt-6 mb-2">
              <button
                type="button"
                onClick={() => {
                  sound?.playClick?.();
                  onViewMore();
                }}
                className="relative inline-flex items-center justify-center gap-2 px-9 py-3 rounded-full font-bold text-xs tracking-[0.18em] text-[#121008] uppercase bg-gradient-to-r from-[#eed286] via-[#d4af37] to-[#aa7c11] shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.6)] hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>VIEW MORE</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Safe bottom spacing for mobile screens */}
      <div className="h-4" />
    </div>
  );
};

export default SharedProfilePreview;
