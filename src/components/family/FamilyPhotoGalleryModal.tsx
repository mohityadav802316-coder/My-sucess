import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Camera,
  Maximize2
} from 'lucide-react';

interface FamilyPhotoGalleryModalProps {
  memberName: string;
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyPhotoGalleryModal: React.FC<FamilyPhotoGalleryModalProps> = ({
  memberName,
  photos,
  isOpen,
  onClose,
}) => {
  const { mode } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = () => {
    sound.playClick();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    sound.playClick();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl max-h-[92vh] bg-slate-950 border border-rose-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/20 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-400" />
              <span className="font-cyber font-bold text-sm text-white tracking-wide">
                {memberName} — {mode === 'hi' ? 'तस्वीरें' : 'Gallery'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                {currentIndex + 1} / {photos.length}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo Arena */}
          <div
            className="relative flex-1 min-h-[340px] sm:min-h-[460px] bg-black/80 flex items-center justify-center p-4 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <motion.img
              key={currentPhoto}
              src={currentPhoto}
              alt={`${memberName} photo ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
              transition={{ duration: 0.3 }}
              className={`max-w-full max-h-[65vh] object-contain rounded-2xl select-none transition-transform duration-300 ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Previous / Next buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/80 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 transition cursor-pointer shadow-lg active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/80 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 transition cursor-pointer shadow-lg active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Zoom toggle floating button */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-4 right-4 p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
          </div>

          {/* Thumbnails Row */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 p-3 px-6 overflow-x-auto bg-slate-900/40 border-t border-slate-800">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setIsZoomed(false);
                    setCurrentIndex(idx);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    currentIndex === idx
                      ? 'border-rose-400 shadow-md shadow-rose-500/30 scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
