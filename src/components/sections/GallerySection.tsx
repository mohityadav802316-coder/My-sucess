import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import {
  Camera,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Image as ImageIcon,
  RotateCw
} from 'lucide-react';

interface Unified3DGalleryItem {
  id: string;
  type: 'mohit' | 'custom';
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  imageUrl: string;
  ownerName?: string;
  badge: string;
  badgeHi: string;
}

export const GallerySection: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings, galleryImages, mainProfileImage } = useImages();

  const [items, setItems] = useState<Unified3DGalleryItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [activeLightbox, setActiveLightbox] = useState<Unified3DGalleryItem | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const autoRotateTimerRef = useRef<number | null>(null);

  // Load photos automatically from Mohit's profile and Custom Gallery
  useEffect(() => {
    const loadUnifiedGallery = async () => {
      const unified: Unified3DGalleryItem[] = [];

      // 1. Mohit's Primary Profile & Showcase Shots
      const profilePhoto =
        mainProfileImage?.downloadUrl ||
        (typeof window !== 'undefined' ? localStorage.getItem('mohit_profile_photo') : null) ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

      unified.push({
        id: 'mohit_profile',
        type: 'mohit',
        title: siteSettings.profile?.name || 'Mohit Yadav',
        titleHi: 'मोहित यादव',
        subtitle: 'Core Creator & AI Engineer',
        subtitleHi: 'भावी AI इंजीनियर',
        imageUrl: profilePhoto,
        badge: 'Creator',
        badgeHi: 'निर्माता',
      });

      // 2. Custom Admin Gallery Images
      galleryImages.forEach((img, idx) => {
        if (img.downloadUrl) {
          unified.push({
            id: img.id || `custom_${idx}`,
            type: 'custom',
            title: img.title || img.caption || 'Studio Snapshot',
            titleHi: img.captionHi || img.caption || 'तस्वीर',
            subtitle: img.category || 'Tech & Art',
            subtitleHi: 'गैलरी',
            imageUrl: img.downloadUrl,
            badge: 'Gallery',
            badgeHi: 'गैलरी',
          });
        }
      });

      setItems(unified);
    };

    loadUnifiedGallery();
  }, [mainProfileImage, galleryImages, siteSettings.profile?.name]);

  // Automatic slow cinematic 3D camera rotation
  useEffect(() => {
    if (!isRotating || items.length <= 1) return;
    autoRotateTimerRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4200);
    return () => {
      if (autoRotateTimerRef.current) clearInterval(autoRotateTimerRef.current);
    };
  }, [isRotating, items.length]);

  const handleNext = () => {
    sound.playClick();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    sound.playClick();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Touch Swipe for mobile 3D camera pan
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  if (items.length === 0) return null;

  return (
    <section
      id="gallery"
      className="py-24 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto w-full space-y-12 relative z-10">
        {/* Header with Black Magic Smoke */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>SCENE 06 • 3D ORBITAL CAMERA GALLERY</span>
          </div>

          <BlackMagicSmoke>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <MysticTextReveal
                text={mode === 'hi' ? '3D विजुअल गैलरी' : '3D Spatial Visual Gallery'}
                magicTheme="gold"
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400"
              />
            </h2>
          </BlackMagicSmoke>

          <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-xl mx-auto">
            {mode === 'hi'
              ? 'स्थानिक परिप्रेक्ष्य में क्रिएटर और विजुअल मीडिया को प्रदर्शित करने वाला इंटरैक्टिव 3D रोटेटिंग हिंडोला।'
              : 'Interactive 3D rotating carousel showcasing creator highlights and visual media in spatial perspective.'}
          </p>
        </div>

        {/* 3D Camera Stage */}
        <div
          className="relative w-full h-[430px] sm:h-[480px] flex items-center justify-center perspective-[1200px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setIsRotating(false)}
          onMouseLeave={() => setIsRotating(true)}
        >
          {items.map((item, idx) => {
            const count = items.length;
            let offset = (idx - activeIndex + count) % count;
            if (offset > count / 2) offset -= count;

            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            const isCenter = offset === 0;
            const translateX = offset * (window.innerWidth < 640 ? 120 : 200);
            const translateZ = -Math.abs(offset) * 160;
            const rotateY = -offset * 28;
            const scale = isCenter ? 1.08 : 0.82;
            const opacity = isCenter ? 1 : 0.65;
            const zIndex = 30 - Math.abs(offset) * 5;

            return (
              <motion.div
                key={item.id}
                animate={{
                  x: translateX,
                  z: translateZ,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  zIndex: zIndex,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => {
                  if (isCenter) {
                    sound.playClick();
                    setActiveLightbox(item);
                  } else {
                    sound.playHover();
                    setActiveIndex(idx);
                  }
                }}
                className={`w-[260px] sm:w-[300px] h-[360px] sm:h-[400px] rounded-2xl p-1 cursor-pointer transition-shadow duration-500 backdrop-blur-xl ${
                  isCenter
                    ? 'shadow-[0_0_40px_rgba(245,158,11,0.45)] ring-2 ring-amber-400/80 bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950'
                    : 'shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-slate-800/80 bg-slate-950/80 hover:border-amber-500/50'
                }`}
              >
                <div className="w-full h-full rounded-[14px] overflow-hidden flex flex-col justify-between relative bg-slate-950">
                  {/* Photo Canvas */}
                  <div className="relative w-full h-[76%] overflow-hidden bg-slate-900 flex items-center justify-center">
                    {item.imageUrl && item.imageUrl.trim() !== '' ? (
                      <img
                        src={item.imageUrl || undefined}
                        alt={item.title}
                        className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <Camera className="w-10 h-10 text-amber-400/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono text-amber-300">
                      {item.type === 'mohit' ? (
                        <User className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                      )}
                      <span>{mode === 'hi' ? item.badgeHi : item.badge}</span>
                    </div>

                    {isCenter && (
                      <div className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 border border-amber-400 text-amber-300 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Info */}
                  <div className="p-3.5 flex flex-col justify-center space-y-0.5">
                    <h3 className="font-cyber font-bold text-white text-sm sm:text-base truncate drop-shadow">
                      {mode === 'hi' ? item.titleHi : item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-amber-300/80 truncate">
                      {mode === 'hi' ? item.subtitleHi : item.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white transition shadow-lg active:scale-95 cursor-pointer"
            title="Previous 3D Angle"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsRotating(!isRotating);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono border transition active:scale-95 cursor-pointer ${
              isRotating
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span>{isRotating ? (mode === 'hi' ? '3D घूर्णन' : '3D Rotating') : (mode === 'hi' ? 'रोक दिया गया' : 'Paused')}</span>
          </button>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white transition shadow-lg active:scale-95 cursor-pointer"
            title="Next 3D Angle"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setActiveLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/40 shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full flex-1 max-h-[70vh] flex items-center justify-center bg-black/60 p-2">
                {activeLightbox && activeLightbox.imageUrl && activeLightbox.imageUrl.trim() !== '' ? (
                  <img
                    src={activeLightbox.imageUrl || undefined}
                    alt={activeLightbox.title}
                    className="max-w-full max-h-[68vh] object-contain rounded-lg"
                  />
                ) : null}
              </div>

              <div className="p-5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-cyber font-bold text-white text-lg">
                    {mode === 'hi' ? activeLightbox.titleHi : activeLightbox.title}
                  </h4>
                  <p className="text-xs font-mono text-amber-300">
                    {mode === 'hi' ? activeLightbox.subtitleHi : activeLightbox.subtitle}
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {mode === 'hi' ? activeLightbox.badgeHi : activeLightbox.badge}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
