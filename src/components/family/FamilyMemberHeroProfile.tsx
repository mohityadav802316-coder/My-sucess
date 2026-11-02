import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import { FamilyMember } from '../../types';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { FamilyPhotoGalleryModal } from './FamilyPhotoGalleryModal';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Images,
  ShieldCheck,
  Lock,
  UserCheck
} from 'lucide-react';

interface FamilyMemberHeroProfileProps {
  member: FamilyMember;
  onBack: () => void;
}

export const FamilyMemberHeroProfile: React.FC<FamilyMemberHeroProfileProps> = ({
  member,
  onBack,
}) => {
  const { mode } = useLanguage();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const memberName = mode === 'hi' && member.nameHi ? member.nameHi : member.name;
  const memberRelation = mode === 'hi' && member.relationHi ? member.relationHi : member.relation;
  const memberBio =
    mode === 'hi' && member.bioHi
      ? member.bioHi
      : member.bio ||
        (mode === 'hi'
          ? 'परिवार के अनमोल स्तम्भ और जीवन की प्रेरणा।'
          : 'Cherished family pillar and lifelong inspiration.');

  const allPhotos = [member.photoUrl, ...(member.photos || [])].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-[calc(100vh-6rem)] flex flex-col justify-center pt-2 pb-12 px-4 sm:px-6 select-none z-30"
    >
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pb-4 border-b border-rose-500/20 mb-6">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white transition shadow-lg active:scale-95 text-xs font-mono cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{mode === 'hi' ? 'वापस जाएँ' : '← Back to Family Vault'}</span>
        </button>

        <div className="flex items-center gap-2">
          {allPhotos.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                setIsGalleryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 border border-rose-500/40 text-rose-300 hover:text-white transition shadow-lg text-xs font-mono cursor-pointer active:scale-95"
            >
              <Images className="w-3.5 h-3.5 text-amber-400" />
              <span>{mode === 'hi' ? 'तस्वीरें देखें (View More)' : 'View More Photos'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-rose-300 border border-slate-800">
                {allPhotos.length}
              </span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-rose-300/90">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
            <span>FAMILY VAULT 3D HERO // {memberRelation.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6 order-2 lg:order-1 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>{memberRelation} • Locked Family Circle</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cyber font-black tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={memberName}
                magicTheme="scarlet"
                className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-400"
              />
            </h1>
            <p className="text-base sm:text-lg font-mono text-rose-200/90 font-medium tracking-wide">
              {mode === 'hi' ? `संबंध: ${memberRelation}` : `Relationship: ${memberRelation}`}
            </p>
          </div>

          <p className="text-gray-200 font-sans text-sm sm:text-base leading-relaxed max-w-xl drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
            {memberBio}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsGalleryOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cyber font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Images className="w-4 h-4 text-amber-300" />
              <span>{mode === 'hi' ? 'सभी तस्वीरें देखें (View More)' : 'View More (All Photos)'}</span>
            </button>
          </div>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block">RELATION</span>
              <span className="font-bold text-rose-300 text-xs">{memberRelation}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">SECURITY</span>
              <span className="font-bold text-emerald-400 text-xs">🔒 Encrypted Vault</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">GALLERY</span>
              <span className="font-bold text-amber-300 text-xs">{allPhotos.length} Photos</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Luxury Portrait Dossier Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative flex flex-col items-center order-1 lg:order-2 w-full"
        >
          <div className="relative w-full max-w-md mx-auto">
            {/* Ambient Back Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none" />

            <div className="relative rounded-3xl border border-amber-500/30 bg-[#0C0B09]/90 backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-500/15">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] tracking-[0.25em] font-bold text-amber-300 uppercase">FAMILY VAULT</span>
                </div>
                <span className="text-[9px] tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                  {memberRelation.toUpperCase()} // DOSSIER
                </span>
              </div>

              {/* Portrait Display Frame */}
              <div className="relative my-5 rounded-2xl overflow-hidden aspect-[4/5] bg-black/60 border border-amber-500/20 flex items-center justify-center group">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <UserCheck className="w-16 h-16 text-amber-400/40 mb-3" />
                    <span className="text-sm text-neutral-400 font-serif">{member.name}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-serif text-lg font-bold drop-shadow-md">{memberName}</p>
                    <p className="text-amber-300/90 text-xs font-mono tracking-wide">{memberRelation}</p>
                  </div>
                  {allPhotos.length > 0 && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsGalleryOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg cursor-pointer"
                    >
                      <Images className="w-3.5 h-3.5" />
                      <span>{allPhotos.length}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-500/15 text-center">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-amber-500/10">
                  <span className="block text-[9px] text-neutral-400 font-mono">FAMILY</span>
                  <span className="text-xs font-bold text-amber-300">CIRCLE</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-amber-500/10">
                  <span className="block text-[9px] text-neutral-400 font-mono">{memberRelation.toUpperCase().slice(0, 8)}</span>
                  <span className="text-xs font-bold text-amber-300">BOND</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-amber-500/10">
                  <span className="block text-[9px] text-neutral-400 font-mono">STATUS</span>
                  <span className="text-xs font-bold text-amber-300">ARCHIVED</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3D Multi-Photo Gallery Modal */}
      <FamilyPhotoGalleryModal
        memberName={memberName}
        photos={allPhotos}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </motion.div>
  );
};
