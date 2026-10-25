import React, { useState, useEffect } from 'react';
import { sound } from './audio/SoundEffects';
import { ChevronUp } from 'lucide-react';

interface SceneItem {
  id: string;
  num: string;
  title: string;
}

const SCENES: SceneItem[] = [
  { id: 'hero', num: '01', title: 'Identity Nexus' },
  { id: 'about', num: '02', title: 'Bio Reveal' },
  { id: 'cybersecurity', num: '03', title: 'Cyber Defense' },
  { id: 'gallery', num: '04', title: '3D Obsidian Gallery' },
  { id: 'skills', num: '05', title: 'Skills Arsenal' },
  { id: 'roadmap', num: '06', title: '2026 Roadmap' },
  { id: 'projects', num: '07', title: 'Projects Matrix' },
  { id: 'vision', num: '08', title: 'Vision Horizon' },
  { id: 'contact', num: '09', title: 'Contact Uplink' },
];

export const CinematicScrollHUD: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentY = window.scrollY;
      const progress = docHeight > 0 ? Math.min(Math.max(currentY / docHeight, 0), 1) : 0;
      setScrollProgress(progress);
      setShowScrollTop(currentY > 400);

      // Determine active scene based on viewport position
      for (let i = SCENES.length - 1; i >= 0; i--) {
        const el = document.getElementById(SCENES[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveSceneIndex(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToScene = (id: string) => {
    sound.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeScene = SCENES[activeSceneIndex] || SCENES[0];

  return (
    <>
      {/* 1. Slim Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-900/60 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* 2. Desktop Right Clean Nav Rail */}
      <aside
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-2.5 select-none pointer-events-auto"
        aria-label="Scene Navigator"
      >
        {/* Active Scene Indicator */}
        <div className="px-2.5 py-1 rounded bg-slate-950/80 border border-amber-500/30 text-[10px] font-mono text-amber-300 backdrop-blur-md shadow-sm shadow-amber-500/10">
          <span>SCENE {activeScene.num} // {activeScene.title.toUpperCase()}</span>
        </div>

        {/* Scene Nodes */}
        <div className="flex flex-col items-center gap-2 p-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md">
          {SCENES.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <button
                key={scene.id}
                onClick={() => scrollToScene(scene.id)}
                className="group relative flex items-center justify-center p-1 focus:outline-none cursor-pointer"
                aria-label={`Scroll to ${scene.title}`}
              >
                {/* Tooltip on hover */}
                <div className="absolute right-7 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {scene.num} // {scene.title}
                </div>
                {/* Node indicator */}
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 scale-125 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* 3. Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
