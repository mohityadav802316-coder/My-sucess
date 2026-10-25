import React, { createContext, useContext, useState } from 'react';
import { LanguageMode } from '../types';

interface LanguageContextType {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
  renderText: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  mode: 'en',
  setMode: () => {},
  renderText: (en) => en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<LanguageMode>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mohit_portfolio_lang') : null;
    if (saved === 'hi') {
      return 'hi';
    }
    return 'en';
  });

  const setMode = (newMode: LanguageMode) => {
    // Strictly single language active (toggle between en and hi)
    const normalized: LanguageMode = newMode === 'hi' ? 'hi' : 'en';
    setModeState(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mohit_portfolio_lang', normalized);
    }
  };

  const renderText = (en: string, hi: string): string => {
    return mode === 'hi' ? hi : en;
  };

  return (
    <LanguageContext.Provider value={{ mode, setMode, renderText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
