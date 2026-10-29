import React from 'react';
import { Friend, resolveImageUrl } from '../data/friends';
import { sound } from '../../components/audio/SoundEffects';
import { ChevronRight, ArrowLeft, Sparkles, User, AlertCircle } from 'lucide-react';

interface SharedProfilePreviewProps {
  friend: Friend | null;
  isLoading?: boolean;
  onViewMore: () => void;
  onClose: () => void;
}

export const SharedProfilePreview: React.FC<SharedProfilePreviewProps> = ({
  friend,
  isLoading = false,
  onViewMore,
  onClose,
}) => {
  const photoUrl = friend
    ? resolveImageUrl(friend.avatar || friend.heroPhotos?.[0] || friend.photos?.[0]) || '/images/default-avatar.png'
    : '';

  const accentColor = friend?.accent || '#00f2fe';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={friend ? `${friend.name} Preview` : 'Profile Preview'}
      onTouchStartCapture={() => (window as any).__startBackgroundMusic?.()}
      onTouchMoveCapture={() => (window as any).__startBackgroundMusic?.()}
      onTouchEndCapture={() => (window as any).__startBackgroundMusic?.()}
      onPointerDownCapture={() => (window as any).__startBackgroundMusic?.()}
      onScrollCapture={() => (window as any).__startBackgroundMusic?.()}
      onClickCapture={() => (window as any).__startBackgroundMusic?.()}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#030611] text-slate-100 select-none overflow-y-auto overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse 95% 75% at 50% 15%, #0e1838 0%, #030611 70%)',
      }}
    >
      {/* Background Cyber Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[120px] opacity-25"
          style={{ background: accentColor }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00f2fe 1px, transparent 1px), linear-gradient(to bottom, #9b5cff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* CyberMohit Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs sm:text-sm tracking-[0.2em] text-white font-mono uppercase">
              CYBER<span className="text-cyan-400">MOHIT</span>
            </span>
            <span className="text-[8px] tracking-[0.3em] text-cyan-300/60 font-mono uppercase">
              FRIEND NETWORK
            </span>
          </div>
        </div>

        {/* Back to Home / Portfolio Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#0a1226]/80 hover:bg-cyan-950/60 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)] transition-all cursor-pointer active:scale-95"
          title="होम / मुख्य पृष्ठ"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-mono">होम</span>
        </button>
      </header>

      {/* Center Main Preview Area */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        {isLoading ? (
          /* Loading State while fetching friend from Firestore */
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500 animate-spin-reverse" />
              <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
            </div>
            <p className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              प्रोफाइल लोड हो रही है...
            </p>
          </div>
        ) : !friend ? (
          /* Friend Not Found State */
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#0a1226]/80 border border-rose-500/30 text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              प्रोफाइल नहीं मिली
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              यह शेयर लिंक पुराना हो सकता है या प्रोफाइल मौजूद नहीं है।
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              मुख्य पृष्ठ पर जाएँ
            </button>
          </div>
        ) : (
          /* High-Fidelity Profile Preview Card */
          <div className="flex flex-col items-center w-full">
            {/* 1. Complete Profile Photo in Visually Appealing Layout */}
            <div className="relative group">
              {/* Outer Glowing Holographic Rings */}
              <div
                className="absolute -inset-2 sm:-inset-3 rounded-[32px] opacity-75 blur-xl transition-all duration-500 group-hover:opacity-100 animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                }}
              />

              {/* Decorative Corner Accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg z-20" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg z-20" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-purple-400 rounded-bl-lg z-20" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400 rounded-br-lg z-20" />

              {/* Photo Container */}
              <div className="relative z-10 w-60 h-60 sm:w-72 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-cyan-400/50 bg-[#091024] shadow-[0_0_35px_rgba(0,242,254,0.35)] flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={friend.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-20 h-20 text-cyan-400/40" />
                )}

                {/* Subtle Inner Gradient Shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030611]/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* 2. Friend's Name directly below the photo */}
            <div className="mt-6 mb-2 flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-cyber tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-white to-[#c084fc] drop-shadow-[0_0_25px_rgba(0,242,254,0.5)]">
                {friend.name}
              </h1>

              {/* Optional clean subtitle if present */}
              {(friend.tagline || friend.role || friend.nickname) && (
                <p className="text-xs sm:text-sm font-mono text-cyan-300/80 mt-1.5 tracking-wider">
                  {friend.nickname ? `"${friend.nickname}"` : friend.tagline || friend.role}
                </p>
              )}
            </div>

            {/* 3. Clearly Visible "View More" Button below the name */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onViewMore();
                }}
                className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base text-white font-mono tracking-wider uppercase bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_25px_rgba(0,242,254,0.45)] hover:shadow-[0_0_35px_rgba(0,242,254,0.7)] transition-all transform active:scale-95 cursor-pointer border border-cyan-300/40"
              >
                <span>View More</span>
                <ChevronRight className="w-5 h-5 text-cyan-200 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Bottom Footer Note */}
      <footer className="relative z-10 w-full max-w-md mx-auto py-4 text-center px-4">
        <p className="text-[11px] font-mono text-slate-500">
          CYBERMOHIT 3D NETWORK • SHARED PROFILE PREVIEW
        </p>
      </footer>
    </div>
  );
};

export default SharedProfilePreview;
