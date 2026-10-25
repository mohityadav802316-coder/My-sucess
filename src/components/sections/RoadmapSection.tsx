import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import { CheckCircle2, Clock, Sparkles, Compass } from 'lucide-react';

export const RoadmapSection: React.FC = () => {
  const { mode } = useLanguage();
  const { milestones } = useImages();

  const getMilestoneStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'text-emerald-400',
          dotBg: 'bg-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.8)]',
          theme: 'cyan' as const,
        };
      case 'in-progress':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
          color: 'text-amber-400',
          dotBg: 'bg-amber-400 ring-4 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.8)]',
          theme: 'gold' as const,
        };
      case 'future':
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
          color: 'text-rose-400',
          dotBg: 'bg-rose-400 ring-4 ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.8)]',
          theme: 'scarlet' as const,
        };
    }
  };

  return (
    <section
      id="roadmap"
      className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto w-full space-y-12 relative z-10">
        {/* Section Header: Pure Unboxed Floating Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>SCENE 06 • JOURNEY &amp; EVOLUTION TIMELINE</span>
          </div>

          <BlackMagicSmoke theme="darkMagic">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'मेरी तकनीकी यात्रा (Journey)' : 'My Tech Journey & Milestones'}
                magicTheme="amber"
                className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-300"
              />
            </h2>
          </BlackMagicSmoke>

          <BlackMagicSmoke theme="multi">
            <p className="text-sm sm:text-base font-mono text-emerald-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {mode === 'hi'
                ? 'कक्षा 12 विज्ञान की नींव से लेकर आधुनिक AI और सॉफ्टवेयर निर्माण तक के महत्वपूर्ण पड़ाव।'
                : 'Key milestones from Class 12 Science foundations to autonomous AI systems and software builds.'}
            </p>
          </BlackMagicSmoke>
        </motion.div>

        {/* Glowing 3D Neon Timeline Spine with Mystic Energy */}
        <div className="relative">
          {/* Central 3D Glowing Line on Desktop */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-amber-400 via-rose-500 to-cyan-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] opacity-70" />
          {/* Left 3D Glowing Line on Mobile */}
          <div className="lg:hidden absolute left-4 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-amber-400 via-rose-500 to-cyan-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] opacity-70" />

          <div className="space-y-10">
            {milestones.map((m, idx) => {
              const statusMeta = getMilestoneStatus(m.status);
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={m.id || idx}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col lg:flex-row items-center justify-between gap-6 pl-10 lg:pl-0"
                >
                  {/* Central Magical Node Indicator with Ring & Particle Flare */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-4 h-4 rounded-full ${statusMeta.dotBg}`} />
                      <div className="absolute -inset-2 rounded-full border border-amber-400/40 animate-ping opacity-30" />
                    </div>
                  </div>
                  <div className="lg:hidden absolute left-4 -translate-x-1/2 top-5 z-20">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-4 h-4 rounded-full ${statusMeta.dotBg}`} />
                      <div className="absolute -inset-2 rounded-full border border-amber-400/40 animate-ping opacity-30" />
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className={`w-full lg:w-[46%] ${isEven ? 'lg:pr-8' : 'lg:order-2 lg:pl-8'}`}>
                    <MysticTiltCard
                      glowTheme={statusMeta.theme}
                      className="p-5 bg-slate-950/75 backdrop-blur-xl space-y-3 border border-amber-500/20 hover:border-amber-400/50 transition-all shadow-xl"
                    >
                      {/* Year / Month & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-amber-300 tracking-wider px-2 py-0.5 rounded bg-slate-900/80 border border-amber-500/30">
                          {m.yearMonth || m.phase}
                        </span>
                        <div className={`flex items-center gap-1.5 text-xs font-mono ${statusMeta.color}`}>
                          {statusMeta.icon}
                          <span>{mode === 'hi' ? m.statusTextHi || m.statusText : m.statusText}</span>
                        </div>
                      </div>

                      {/* Title & 1-Line Description */}
                      <div>
                        <h3 className="font-cyber font-bold text-lg text-white">
                          {mode === 'hi' ? m.titleHi || m.title : m.title}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans line-clamp-1">
                          {mode === 'hi' ? m.descriptionHi || m.description : m.description}
                        </p>
                      </div>

                      {/* Highlights / Topics if any */}
                      {m.topics && m.topics.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                          {m.topics.map((t, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </MysticTiltCard>
                  </div>
                  <div className={`hidden lg:block w-[46%] ${isEven ? 'order-2' : 'order-1'}`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
