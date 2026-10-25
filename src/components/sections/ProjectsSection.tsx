import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { ProjectItem } from '../../types';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import {
  Sparkles,
  ExternalLink,
  CheckCircle,
  Clock,
  X,
  ArrowRight,
  Github,
  Globe,
  Layers
} from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const { mode } = useLanguage();
  const { projects } = useImages();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject) {
        sound.playClick();
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  const getStatusBadge = (status: string, statusHi?: string) => {
    const isDone = status === 'Done' || status === 'Live Showcase';
    const isActive = status === 'Active' || status === 'Active Development' || status === 'In Progress';

    if (isDone) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>{mode === 'hi' ? statusHi || 'पूर्ण' : status}</span>
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-amber-300 bg-amber-950/60 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{mode === 'hi' ? statusHi || 'प्रगति पर' : status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-rose-300 bg-rose-950/60 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
        <Sparkles className="w-3 h-3 text-rose-400" />
        <span>{mode === 'hi' ? statusHi || 'प्रारूप' : status}</span>
      </span>
    );
  };

  return (
    <section
      id="projects"
      className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto w-full space-y-10 relative z-10">
        {/* Section Header: Pure Unboxed Floating Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SCENE 07 • PRACTICAL PROJECTS &amp; BUILDS</span>
          </div>

          <BlackMagicSmoke theme="crimson">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'व्यावहारिक प्रोजेक्ट्स' : 'Practical Projects & Builds'}
                magicTheme="gold"
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400"
              />
            </h2>
          </BlackMagicSmoke>

          <BlackMagicSmoke theme="multi">
            <p className="text-sm sm:text-base font-mono text-amber-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {mode === 'hi'
                ? 'उत्पादन-तैयार सॉफ्टवेयर, पायथन इंजन और सक्रिय रूप से तैनात उत्तरदायी वेब प्रणालियां।'
                : 'Production-ready software, Python engines, and responsive web systems in active deployment.'}
            </p>
          </BlackMagicSmoke>
        </motion.div>

        {/* 3D Tilt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <MysticTiltCard
                glowTheme={idx % 2 === 0 ? 'gold' : 'scarlet'}
                className="p-4 sm:p-5 bg-slate-950/75 backdrop-blur-xl h-full flex flex-col justify-between space-y-4 group cursor-pointer border border-amber-500/20 hover:border-amber-400/50 transition-colors shadow-lg hover:shadow-amber-500/10"
                onClick={() => {
                  sound.playClick();
                  setSelectedProject(project);
                }}
              >
                <div className="space-y-3">
                  {/* Screenshot / Visual Banner */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    {project.imageUrl && project.imageUrl.trim() !== '' ? (
                      <img
                        src={project.imageUrl || undefined}
                        alt={project.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)]" />
                        <Layers className="w-8 h-8 text-amber-400/60 mb-1" />
                        <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                          {project.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      {getStatusBadge(project.status, project.statusHi)}
                    </div>
                  </div>

                  {/* Title & 1-line Description */}
                  <div>
                    <h3 className="font-cyber font-bold text-white text-base group-hover:text-amber-200 transition">
                      {mode === 'hi' ? project.titleHi || project.title : project.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1 line-clamp-1">
                      {mode === 'hi' ? project.descriptionHi || project.description : project.description}
                    </p>
                  </div>
                </div>

                {/* Footer with Link Button and Details Trigger */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/40 hover:to-rose-500/40 border border-amber-500/30 text-amber-200 text-[11px] font-mono transition"
                        title="Open Live Link"
                      >
                        <Globe className="w-3 h-3 text-amber-400" />
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                        }}
                        className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition"
                        title="GitHub Repo"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{mode === 'hi' ? 'विवरण' : 'Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </MysticTiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transparent Deep Dive Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              sound.playClick();
              setSelectedProject(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl w-full rounded-2xl p-6 bg-slate-950/90 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-5 relative text-left backdrop-blur-2xl"
            >
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedProject(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-10">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(selectedProject.status, selectedProject.statusHi)}
                </div>
                <h3 className="font-cyber font-bold text-2xl text-white">
                  {mode === 'hi' ? selectedProject.titleHi || selectedProject.title : selectedProject.title}
                </h3>
                <p className="text-xs font-mono text-amber-300">
                  {mode === 'hi' ? selectedProject.subtitleHi || selectedProject.subtitle : selectedProject.subtitle}
                </p>
              </div>

              {Boolean(selectedProject.imageUrl && selectedProject.imageUrl.trim() !== '') && (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                  <img
                    src={selectedProject.imageUrl || undefined}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-slate-200 font-sans leading-relaxed">
                {mode === 'hi' ? selectedProject.descriptionHi || selectedProject.description : selectedProject.description}
              </p>

              {((mode === 'hi' ? selectedProject.featuresHi : selectedProject.features) || []).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-xs font-mono text-amber-400 block uppercase">
                    {mode === 'hi' ? 'मुख्य विशेषताएं' : 'Key Highlights'}
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 font-sans">
                    {(mode === 'hi' ? selectedProject.featuresHi : selectedProject.features).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                {selectedProject.liveUrl && (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition hover:from-amber-400 hover:to-rose-400 shadow-md shadow-amber-500/20"
                  >
                    <span>{mode === 'hi' ? 'लाइव देखें' : 'Open Live Link'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-mono text-xs transition"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
