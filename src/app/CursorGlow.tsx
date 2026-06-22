'use client';

import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        glow.style.opacity = '1';
        isVisible = true;
      }

      // Automatically update all magnetic cards across the entire application
      const cards = document.querySelectorAll('.magnetic-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    const onMouseLeave = () => {
      glow.style.opacity = '0';
      isVisible = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    let animationFrameId: number;
    const render = () => {
      // Smooth interpolation for that trailing effect
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleGlowChange = (e: CustomEvent) => {
      if (glow) {
        glow.style.display = e.detail ? 'block' : 'none';
      }
    };

    const initialGlow = localStorage.getItem('reader_cursorGlow');
    if (initialGlow === 'false') {
      glow.style.display = 'none';
    }

    window.addEventListener('cursorGlowChanged', handleGlowChange as EventListener);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('cursorGlowChanged', handleGlowChange as EventListener);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 138, 61, 0.12) 0%, rgba(255, 138, 61, 0) 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform, opacity',
        opacity: 0, // start hidden until mouse moves
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}
