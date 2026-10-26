import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';
import { sound } from '../audio/SoundEffects';

interface Floating3DFireFriendsButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}

interface Ember {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

export const Floating3DFireFriendsButton: React.FC<Floating3DFireFriendsButtonProps> = ({
  onClick,
  isVisible = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const buttonRef = useRef<HTMLDivElement | null>(null);

  // Procedural rising fire ember sparks
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    const colors = ['#ff4500', '#ff8c00', '#ffd700', '#ff2200', '#fff'];
    const interval = setInterval(() => {
      setEmbers((prev) => {
        // Move existing embers up and fade
        const updated = prev
          .map((e) => ({
            ...e,
            y: e.y - e.speedY,
            x: e.x + e.speedX + (Math.random() - 0.5) * 1.5,
            opacity: e.opacity - 0.035,
          }))
          .filter((e) => e.opacity > 0 && e.y > -80);

        // Spawn 1-2 new embers from the button top
        if (updated.length < (isHovered ? 24 : 14)) {
          updated.push({
            id: Math.random(),
            x: Math.random() * 110 - 10, // across button width percentage
            y: 10 + Math.random() * 15, // start near top
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 2.2 + 1.2,
            speedX: (Math.random() - 0.5) * 1.2,
            opacity: Math.random() * 0.4 + 0.6,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
        return updated;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      rotateX: -(y / (rect.height / 2)) * 14,
      rotateY: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 select-none"
      style={{ perspective: 1000 }}
    >
      {/* 1. Fire Shockwave Pulsing Rings (Attention Magnet) */}
      <div className="absolute inset-0 -m-3 pointer-events-none flex items-center justify-center">
        <span className="absolute w-full h-full rounded-full border-2 border-orange-500/50 animate-ping opacity-40 duration-1000" />
        <span className="absolute w-[125%] h-[150%] rounded-full bg-gradient-to-r from-red-600/20 via-orange-500/25 to-amber-400/20 blur-xl animate-pulse" />
      </div>

      {/* 2. Rising Animated Fire Embers */}
      <div className="absolute inset-x-0 bottom-4 h-28 pointer-events-none overflow-visible">
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${ember.x}%`,
              bottom: `${ember.y}px`,
              width: `${ember.size}px`,
              height: `${ember.size * 1.4}px`,
              backgroundColor: ember.color,
              opacity: ember.opacity,
              boxShadow: `0 0 10px ${ember.color}, 0 0 18px #ff4500`,
              transform: `scale(${ember.opacity}) rotate(${Math.sin(ember.y) * 20}deg)`,
              transition: 'transform 0.05s linear',
            }}
          />
        ))}
      </div>

      {/* 3. Leaping 3D Fire Flame Tongues */}
      <div className="absolute -top-7 inset-x-0 flex justify-center items-end gap-1.5 pointer-events-none h-12 overflow-visible">
        {/* Flame Tongue 1 (Left) */}
        <motion.div
          animate={{
            scaleY: isHovered ? [1.2, 1.8, 1.3] : [1, 1.4, 1.1],
            scaleX: [0.9, 1.1, 0.95],
            opacity: [0.75, 1, 0.8],
          }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          className="w-4 h-9 rounded-t-full bg-gradient-to-t from-red-600 via-orange-500 to-amber-200 blur-[1px] shadow-[0_0_12px_#ff4500]"
        />
        {/* Flame Tongue 2 (Center Major) */}
        <motion.div
          animate={{
            scaleY: isHovered ? [1.4, 2.2, 1.5] : [1.1, 1.6, 1.2],
            scaleX: [1, 1.2, 0.9],
            opacity: [0.9, 1, 0.85],
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          className="w-5 h-12 rounded-t-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 blur-[0.5px] shadow-[0_0_20px_#ff7700]"
        />
        {/* Flame Tongue 3 (Right) */}
        <motion.div
          animate={{
            scaleY: isHovered ? [1.1, 1.7, 1.2] : [0.9, 1.3, 1],
            scaleX: [0.85, 1.15, 0.9],
            opacity: [0.7, 0.95, 0.75],
          }}
          transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="w-4 h-8 rounded-t-full bg-gradient-to-t from-red-600 via-orange-500 to-amber-200 blur-[1px] shadow-[0_0_12px_#ff4500]"
        />
      </div>

      {/* 4. The 3D Tactile Fire Button */}
      <motion.button
        type="button"
        onClick={() => {
          sound.playWarp();
          onClick();
        }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93, y: 3 }}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          y: isHovered ? -3 : [0, -5, 0],
        }}
        transition={{
          y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          scale: { type: 'spring', stiffness: 400, damping: 25 },
        }}
        className="relative group cursor-pointer focus:outline-none"
        style={{ transformStyle: 'preserve-3d' }}
        title="Open Friends Universe 3D - Click to explore!"
        aria-label="Friends Universe 3D खोलें"
      >
        {/* Deep 3D Shadow Base (Extrusion Layer) */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-950 via-amber-950 to-black translate-y-2.5 rounded-b-3xl shadow-[0_15px_30px_rgba(239,68,68,0.65),0_0_50px_rgba(249,115,22,0.5)] pointer-events-none"
          style={{ transform: 'translateZ(-15px)' }}
        />

        {/* 3D Gold / Chrome Metallic Perimeter Rim */}
        <div className="relative p-[2.5px] rounded-2xl bg-gradient-to-r from-amber-300 via-orange-500 to-red-600 shadow-xl overflow-hidden">
          {/* Animated Lava Light Streak */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {/* Core Button Face */}
          <div className="relative px-5 py-3 sm:px-6 sm:py-3.5 rounded-[14px] bg-gradient-to-b from-[#240808] via-[#150404] to-[#0a0202] border border-orange-500/40 flex items-center gap-3 backdrop-blur-md">
            {/* Glowing 3D Flame Orb Icon */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-600 to-red-700 p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(255,100,0,0.9)] group-hover:shadow-[0_0_24px_rgba(255,165,0,1)] transition-all">
              <div className="w-full h-full rounded-[10px] bg-black/40 flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 fill-amber-400 animate-pulse drop-shadow-[0_0_10px_#ffaa00]" />
              </div>
              {/* Little Sparkle */}
              <Sparkles className="w-3 h-3 text-yellow-200 absolute -top-1 -right-1 animate-spin" />
            </div>

            {/* Glowing Text Content */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-cyber font-black text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
                  FRIENDS
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-600/80 text-white shadow-sm border border-orange-300/60 animate-pulse">
                  3D
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-amber-300/80 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping inline-block" />
                EXPLORE UNIVERSE
              </span>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};
