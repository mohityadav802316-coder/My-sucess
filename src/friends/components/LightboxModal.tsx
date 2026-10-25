import React, { useEffect } from 'react';

interface LightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    if (!imageUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-label="Photo preview lightbox"
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="बंद करें"
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-[#111726] border border-[#1f2b46] text-[#00f2fe] hover:bg-[#161f33] hover:border-[#00f2fe] flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* Big Preview Image */}
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-[#00f2fe]/40 glow-cyan shadow-2xl"
        />

        <p className="text-xs text-[#8fa3bf] mt-3 font-mono">क्लिक करें या ESC दबाकर बंद करें</p>
      </div>
    </div>
  );
};
