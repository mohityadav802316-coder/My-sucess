import React from 'react';
import { DivineHero3D } from '../three/DivineHero3D';

interface HeroSectionProps {
  isPaused?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isPaused = false }) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full select-none bg-[#060606]">
      <DivineHero3D
        isPaused={isPaused}
        onExplorePortfolio={() => scrollTo('about')}
        onContactClick={() => scrollTo('contact')}
      />
    </section>
  );
};
