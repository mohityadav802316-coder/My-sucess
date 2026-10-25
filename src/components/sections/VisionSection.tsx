import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { Quote, Sparkles } from 'lucide-react';

export const VisionSection: React.FC = () => {
  const { mode } = useLanguage();

  return (
    <section
      id="vision"
      className="py-16 px-4 sm:px-6 lg:px-8 relative flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-4xl mx-auto w-full space-y-6 relative z-10 text-center">
        {/* Section Header: Pure Unboxed Typography Floating Over 3D */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SCENE 09 • GUIDING PHILOSOPHY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
            <MysticTextReveal
              text={mode === 'hi' ? 'मार्गदर्शक दृष्टि और दर्शन' : 'Guiding Vision & Philosophy'}
              magicTheme="gold"
              className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-300"
            />
          </h2>
        </motion.div>

        {/* Compact Guiding Philosophy Card */}
        <MysticTiltCard
          glowTheme="multiverse"
          className="p-6 sm:p-8 bg-slate-950/85 backdrop-blur-xl text-center space-y-3"
        >
          <Quote className="w-6 h-6 text-amber-400 mx-auto opacity-70" />
          <blockquote className="text-base sm:text-xl font-cyber font-medium text-white leading-relaxed">
            {mode === 'hi'
              ? 'कक्षा 12 विज्ञान के अनुशासन को निरंतर पायथन प्रोग्रामिंग के साथ जोड़कर वास्तविक, स्वायत्त AI सिस्टम का निर्माण करना।'
              : '"Bridging the discipline of Class 12 Science with continuous Python engineering to build real, autonomous AI systems."'}
          </blockquote>
          <p className="text-xs font-mono text-amber-300/80">
            — MOHIT YADAV • Aspiring AI Engineer • Bihar, India
          </p>
        </MysticTiltCard>
      </div>
    </section>
  );
};
