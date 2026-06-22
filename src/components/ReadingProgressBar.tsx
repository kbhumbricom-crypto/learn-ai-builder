'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      const maxScroll = documentHeight - windowHeight;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      
      const progress = Math.max(0, Math.min(100, (scrollTop / maxScroll) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '3px',
      backgroundColor: 'transparent',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      <div style={{
        height: '100%',
        width: `${scrollProgress}%`,
        backgroundColor: 'var(--color-accent)',
        transition: 'width 0.1s ease-out'
      }} />
    </div>
  );
}
