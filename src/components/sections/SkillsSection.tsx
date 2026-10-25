import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import {
  Code,
  Terminal,
  Cpu,
  BrainCircuit,
  Layers,
  Sparkles,
  GitBranch,
  Cloud,
  Database,
  Gauge
} from 'lucide-react';

export const SkillsSection: React.FC = () => {
  const { mode } = useLanguage();
  const { skills } = useImages();
  const [activeTab, setActiveTab] = useState<'all' | 'current' | 'tools' | 'learning'>('all');

  const filteredSkills = skills.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const getSkillIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'terminal':
      case 'code':
        return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'braincircuit':
      case 'brain':
        return <BrainCircuit className="w-5 h-5 text-rose-400" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'code2':
      case 'gitbranch':
        return <GitBranch className="w-5 h-5 text-amber-400" />;
      case 'globe':
      case 'cloud':
        return <Cloud className="w-5 h-5 text-cyan-400" />;
      case 'database':
        return <Database className="w-5 h-5 text-emerald-400" />;
      default:
        return <Code className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'current':
        return mode === 'hi' ? 'सक्रिय कौशल' : 'Active Skill';
      case 'tools':
        return mode === 'hi' ? 'टूलचेन' : 'Toolchain';
      case 'learning':
      default:
        return mode === 'hi' ? 'सक्रिय अध्ययन' : 'Active Study';
    }
  };

  return (
    <section
      id="skills"
      className="py-24 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto w-full space-y-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>SCENE 05 • 3D TECHNICAL SKILLS & PROFICIENCY METERS</span>
          </div>

          <BlackMagicSmoke>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'तकनीकी कौशल एवं 3D मीटर' : 'Skills & 3D Proficiency Meters'}
                magicTheme="gold"
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400"
              />
            </h2>
          </BlackMagicSmoke>

          <p className="text-sm sm:text-base font-mono text-amber-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {mode === 'hi'
              ? 'पायथन, आधुनिक वेब स्टैक, जनरेटिव AI और रियल-टाइम ऑटोमेशन में व्यावहारिक दक्षता।'
              : 'Practical proficiency in Python, modern web stacks, generative AI, and real-time automation.'}
          </p>
        </motion.div>

        {/* Tab Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', en: 'All Skills', hi: 'सभी कौशल' },
            { id: 'current', en: 'Core Development', hi: 'मुख्य विकास' },
            { id: 'tools', en: 'Dev Tools & Deploy', hi: 'टूल्स व डिप्लॉय' },
            { id: 'learning', en: 'Advanced AI Study', hi: 'उन्नत AI अध्ययन' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {mode === 'hi' ? tab.hi : tab.en}
            </button>
          ))}
        </div>

        {/* Skills Grid with 3D Radial Gauge Rings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, idx) => {
            const percentage = skill.proficiency || 85;
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <motion.div
                key={skill.id || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: idx * 0.05 }}
              >
                <MysticTiltCard
                  glowTheme={idx % 2 === 0 ? 'gold' : 'scarlet'}
                  className="p-5 bg-slate-950/85 backdrop-blur-xl h-full flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + 3D Radial Meter Gauge */}
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                        {getSkillIcon(skill.icon)}
                      </div>

                      {/* 3D Glowing Circular Progress Meter Ring */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="#1e293b"
                            strokeWidth="8"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="url(#skillMeterGrad)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            whileInView={{ strokeDashoffset }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.6, delay: 0.2 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                            className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                          />
                          <defs>
                            <linearGradient id="skillMeterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="50%" stopColor="#f43f5e" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-cyber font-black text-white text-xs sm:text-sm tracking-tight drop-shadow">
                            {percentage}%
                          </span>
                          <span className="text-[8px] font-mono text-amber-400">LVL</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-cyber font-bold text-white text-lg tracking-wide">
                          {mode === 'hi' ? skill.nameHi : skill.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300">
                          {getCategoryLabel(skill.category)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {mode === 'hi' ? skill.descriptionHi : skill.description}
                      </p>
                    </div>
                  </div>

                  {skill.highlights && skill.highlights.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {skill.highlights.map((h, hIdx) => (
                        <span
                          key={hIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </MysticTiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
