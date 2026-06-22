'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'sm' | 'md' | 'lg';
type FontFamily = 'sans' | 'serif';

interface ReaderSettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
  cursorGlow: boolean;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  setCursorGlow: (glow: boolean) => void;
}

const ReaderSettingsContext = createContext<ReaderSettings | undefined>(undefined);

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [cursorGlow, setCursorGlow] = useState<boolean>(true);

  useEffect(() => {
    const savedSize = localStorage.getItem('reader_fontSize') as FontSize;
    const savedFamily = localStorage.getItem('reader_fontFamily') as FontFamily;
    const savedGlow = localStorage.getItem('reader_cursorGlow');
    if (savedSize) setFontSize(savedSize);
    if (savedFamily) setFontFamily(savedFamily);
    if (savedGlow !== null) setCursorGlow(savedGlow === 'true');
  }, []);

  const handleSetFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('reader_fontSize', size);
  };

  const handleSetFontFamily = (family: FontFamily) => {
    setFontFamily(family);
    localStorage.setItem('reader_fontFamily', family);
  };

  const handleSetCursorGlow = (glow: boolean) => {
    setCursorGlow(glow);
    localStorage.setItem('reader_cursorGlow', String(glow));
    window.dispatchEvent(new CustomEvent('cursorGlowChanged', { detail: glow }));
  };

  return (
    <ReaderSettingsContext.Provider value={{ fontSize, fontFamily, cursorGlow, setFontSize: handleSetFontSize, setFontFamily: handleSetFontFamily, setCursorGlow: handleSetCursorGlow }}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext);
  if (context === undefined) {
    throw new Error('useReaderSettings must be used within a ReaderSettingsProvider');
  }
  return context;
}
