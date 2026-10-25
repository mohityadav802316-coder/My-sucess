import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_CATEGORIES, CategoryKey, CategoryItem } from '../data/friends';

interface CategoryTabsProps {
  currentCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  onOpenCategoryPage: (category: CategoryKey) => void;
  categories?: CategoryItem[];
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenCategoryPage,
  categories = DEFAULT_CATEGORIES,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [burstingKey, setBurstingKey] = useState<string | null>(null);

  // Auto-scroll selected circle to center smoothly
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentCategory]);

  const handleTabClick = (key: CategoryKey) => {
    // 1. Trigger shockwave burst animation
    setBurstingKey(key);
    setTimeout(() => setBurstingKey(null), 650);

    // 2. If 'all', stay on main list
    if (key === 'all') {
      onSelectCategory('all');
    } else {
      // 3. If 3D category, open full-screen dedicated page after a tiny delay for burst feedback
      setTimeout(() => {
        onOpenCategoryPage(key);
      }, 160);
    }
  };

  const activeCategories = (categories || DEFAULT_CATEGORIES).filter((c) => c.enabled !== false);

  return (
    <div
      ref={scrollContainerRef}
      className="tabs flex items-center justify-start sm:justify-center gap-3 overflow-x-auto no-scrollbar py-3 px-3 touch-pan-x w-full max-w-2xl mx-auto"
      role="tablist"
      aria-label="Friend categories"
    >
      {activeCategories.map((cat) => {
        const isSquad = cat.key === 'squad' || cat.isSpecialSquad === true;
        const isSelected = currentCategory === cat.key;
        const isBursting = burstingKey === cat.key;
        const customColor = cat.color || (isSquad ? '#FFB53D' : '#00F2FE');

        if (isSquad) {
          return (
            <button
              key={cat.key}
              ref={isSelected ? activeTabRef : null}
              role="tab"
              aria-selected={isSelected}
              aria-label={cat.label}
              onClick={() => handleTabClick(cat.key)}
              className={`
                tab tab-press relative flex-shrink-0 flex flex-col items-center justify-center
                w-[74px] h-[74px] rounded-full cursor-pointer transition-all duration-200
                border-2 select-none font-bold
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#ffb53d] to-[#ff7a2f] text-[#1a1000] border-[#ffb53d] glow-gold-intense scale-105'
                    : 'bg-[#111726]/90 text-[#ffb53d] border-[#ffb53d]/60 glow-gold hover:border-[#ffb53d] hover:scale-102'
                }
              `}
              style={
                !isSelected && cat.color
                  ? { borderColor: `${cat.color}80`, color: cat.color }
                  : undefined
              }
            >
              <span className="text-[22px] leading-none mb-0.5 filter drop-shadow">
                {cat.emoji || '👑'}
              </span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold leading-tight">
                {cat.shortLabel || 'SQUAD'}
              </span>
              {/* Pulsing highlight ring for Squad */}
              <span
                className="absolute inset-[-4px] rounded-full border border-[#ffb53d]/40 pointer-events-none animate-spin-slow"
                style={{ borderStyle: 'dashed' }}
              />
              {/* Shockwave ring burst */}
              {isBursting && <span className="ring-burst-squad" />}
            </button>
          );
        }

        return (
          <button
            key={cat.key}
            ref={isSelected ? activeTabRef : null}
            role="tab"
            aria-selected={isSelected}
            aria-label={cat.label}
            onClick={() => handleTabClick(cat.key)}
            className={`
              tab tab-press relative flex-shrink-0 flex flex-col items-center justify-center
              w-[62px] h-[62px] rounded-full cursor-pointer transition-all duration-200
              border select-none
              ${
                isSelected
                  ? 'bg-[#00f2fe] text-[#001317] border-[#00f2fe] glow-cyan font-bold scale-105'
                  : 'bg-[#111726]/85 text-[#8fa3bf] border-[#1f2b46] hover:text-[#e8f4ff] hover:border-[#00f2fe]/50 hover:bg-[#161f33]'
              }
            `}
            style={
              isSelected && customColor !== '#00F2FE'
                ? { backgroundColor: customColor, borderColor: customColor }
                : undefined
            }
          >
            <span className="text-[17px] leading-none mb-1">{cat.emoji}</span>
            <span className="text-[10px] font-medium leading-tight tracking-tight px-1 text-center truncate max-w-[56px]">
              {cat.shortLabel}
            </span>
            {/* Shockwave ring burst */}
            {isBursting && <span className="ring-burst" />}
          </button>
        );
      })}
    </div>
  );
};
