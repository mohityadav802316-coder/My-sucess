import React from 'react';

interface FriendsWelcomeLoaderProps {
  statusText?: string;
  className?: string;
}

export const FriendsWelcomeLoader: React.FC<FriendsWelcomeLoaderProps> = ({
  statusText = 'फ्रेंड्स यूनिवर्स लोड हो रहा है...',
  className = '',
}) => {
  return (
    <div
      className={`relative w-full max-w-lg mx-auto py-14 px-6 flex flex-col items-center justify-center text-center overflow-hidden select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient Cyberpunk Glow Behind Text */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full bg-blue-600/15 blur-2xl pointer-events-none" />

      {/* Futuristic Tag */}
      <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0d1527]/90 border border-[#00f2fe]/30 shadow-[0_0_15px_rgba(0,242,254,0.15)] mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2fe]" />
        </span>
        <span className="text-[11px] font-mono font-semibold tracking-widest text-[#00f2fe] uppercase">
          FRIEND NETWORK ACTIVE
        </span>
      </div>

      {/* Main Animated Headline: Welcome, Mohit */}
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase font-mono bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,242,254,0.65)] animate-pulse">
          Welcome, Mohit
        </h2>

        {/* Neon Pulse Scanner / Divider */}
        <div className="relative w-48 sm:w-56 h-[2px] my-3.5 bg-[#14233c] rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent w-full animate-pulse shadow-[0_0_8px_#00f2fe]" />
        </div>

        {/* Futuristic Status / Loading message */}
        <p className="text-xs sm:text-sm font-medium text-[#8fa3bf] tracking-wide flex items-center gap-2 mt-1">
          <span className="text-[#00f2fe] font-mono text-xs">SYS//SYNC</span>
          <span>•</span>
          <span>{statusText}</span>
        </p>
      </div>
    </div>
  );
};

export default FriendsWelcomeLoader;
