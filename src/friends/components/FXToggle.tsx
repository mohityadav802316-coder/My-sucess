import React from 'react';
import { FXLevel } from './BackgroundUniverse3D';

interface FXToggleProps {
  fxLevel: FXLevel;
  onChangeFX: (level: FXLevel) => void;
}

export const FXToggle: React.FC<FXToggleProps> = ({ fxLevel, onChangeFX }) => {
  const nextLevel = (): FXLevel => {
    if (fxLevel === 'high') return 'low';
    if (fxLevel === 'low') return 'minimal';
    return 'high';
  };

  const labels: Record<FXLevel, { title: string; color: string; badge: string }> = {
    high: { title: '3D VFX High (उच्च)', color: 'text-[#00f2fe] border-[#00f2fe]/60', badge: 'HIGH ⚡' },
    low: { title: '3D VFX Low (मध्यम)', color: 'text-[#ffb53d] border-[#ffb53d]/60', badge: 'LOW 🔋' },
    minimal: { title: '3D VFX Min (न्यूनतम)', color: 'text-[#8fa3bf] border-[#1f2b46]', badge: 'MIN ⏸️' },
  };

  const current = labels[fxLevel];

  return (
    <button
      onClick={() => onChangeFX(nextLevel())}
      title={`VFX स्तर: ${current.title}`}
      aria-label={`VFX Level: ${fxLevel}. क्लिक करके बदलें`}
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
        bg-[#111726]/80 backdrop-blur-sm border transition-all cursor-pointer
        hover:scale-105 active:scale-95
        ${current.color}
      `}
    >
      <span className="text-[10px]">FX:</span>
      <span>{current.badge}</span>
    </button>
  );
};
