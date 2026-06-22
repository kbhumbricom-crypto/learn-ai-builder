'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'flash' | 'done'>('loading');
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const widthStr = useTransform(count, (latest) => `${latest}%`);
  const coreOpacity = useTransform(count, [0, 5], [0, 1]);

  useEffect(() => {
    // A highly cinematic, aggressive "snap and glide" bezier curve
    const animation = animate(count, 100, {
      duration: 1.8,
      ease: [0.76, 0, 0.24, 1], 
      onComplete: () => {
        setPhase('flash');
        setTimeout(() => setPhase('done'), 200); // Allow flash to resolve
      }
    });
    return animation.stop;
  }, [count]);

  useEffect(() => {
    if (phase === 'done') {
      setTimeout(() => onComplete(), 500);
    }
  }, [phase, onComplete]);

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ opacity: phase === 'done' ? 0 : 1, scale: phase === 'done' ? 1.05 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ position: 'relative', width: '240px', height: '2px' }}
      >
        
        {/* Track Container */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '2px',
        }} />

        {/* Laser Gradient */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0,
            width: widthStr,
            background: 'linear-gradient(90deg, rgba(255, 138, 61, 0) 0%, rgba(255, 138, 61, 1) 100%)',
            boxShadow: '0 0 15px rgba(255, 138, 61, 0.8)',
            borderRadius: '2px',
          }}
        />

        {/* Tracking Number (pushed AHEAD of the laser) */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: widthStr,
            marginTop: '-10px', // Vertically center text
          }}
        >
          <div style={{
            transform: 'translateX(16px)', // Pushed exactly 16px ahead of the laser tip
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 400,
            letterSpacing: '0.1em',
            opacity: 0.7,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}>
            <motion.span>{rounded}</motion.span>%
          </div>
        </motion.div>

        {/* Ambient Lens Flare */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: widthStr,
            width: '120px', height: '120px',
            marginTop: '-60px', marginLeft: '-60px',
            background: 'radial-gradient(circle at center, rgba(255, 138, 61, 0.3) 0%, rgba(255, 138, 61, 0) 60%)',
            mixBlendMode: 'screen',
          }}
        />
        
        {/* White-Hot Core Flash */}
        <motion.div
          animate={phase === 'flash' ? { scale: 12, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: 'absolute',
            top: '50%', left: widthStr,
            width: '6px', height: '6px',
            marginTop: '-3px', marginLeft: '-3px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 0 12px 4px rgba(255, 138, 61, 1)',
            // Fade in naturally, fade out during flash via animate prop above
            opacity: coreOpacity,
          }}
        />

      </motion.div>
    </motion.div>
  );
}
