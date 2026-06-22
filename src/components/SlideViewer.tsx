'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight, LayoutList } from 'lucide-react';

interface Block {
  type: string;
  content: any;
}

interface SlideViewerProps {
  title: string;
  lede: string;
  blocks: Block[];
}

export const SlideViewer = memo(function SlideViewer({ title, lede, blocks }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse blocks into slides
  const slides = useMemo(() => {
    const slidesArr = [];
    
    // Slide 0: Title slide
    slidesArr.push(
      <div key="title-slide" className="flex flex-col items-center justify-center h-full text-center p-8">
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em', textWrap: 'balance' }}>
        {title}
      </h2>
      <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '80%', textWrap: 'balance' }}>
        {lede}
      </p>
    </div>
  );

  // Group subsequent blocks. We'll put 1 heading + 1 paragraph, or 2 paragraphs per slide
  let currentGroup = [];
  let blockCount = 0;

  for (let i = 0; i < blocks?.length || 0; i++) {
    const block = blocks[i];
    currentGroup.push(block);
    
    // Count "weight" of blocks. A paragraph is 1. A list is 2. An h2/h3 is 0.5.
    let weight = 1;
    if (block.type === 'ul' || block.type === 'ol') weight = 2;
    if (block.type === 'h2' || block.type === 'h3') weight = 0.5;
    
    blockCount += weight;

    // If we reach weight >= 2, or it's the last block, push the slide
    if (blockCount >= 2 || i === blocks.length - 1) {
      const slideContent = currentGroup.map((b, idx) => {
        if (b.type === 'h2') return <h2 key={idx} style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', marginTop: idx === 0 ? 0 : '1.5rem' }}>{b.content}</h2>;
        if (b.type === 'h3') return <h3 key={idx} style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', marginTop: idx === 0 ? 0 : '1.25rem' }}>{b.content}</h3>;
        if (b.type === 'p') return <p key={idx} style={{ fontSize: '1.2rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: '1.25rem' }}>{b.content}</p>;
        if (b.type === 'ul') return (
          <ul key={idx} style={{ paddingLeft: '1.5rem', listStyleType: 'disc', fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.isArray(b.content) ? b.content.map((li: any, i: number) => <li key={i}>{li}</li>) : null}
          </ul>
        );
        if (b.type === 'ol') return (
          <ol key={idx} style={{ paddingLeft: '1.5rem', listStyleType: 'decimal', fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.isArray(b.content) ? b.content.map((li: any, i: number) => <li key={i}>{li}</li>) : null}
          </ol>
        );
        if (b.type === 'key') {
          return (
            <div key={idx} style={{ padding: '2rem', backgroundColor: 'rgba(255, 138, 61, 0.05)', border: '1px solid rgba(255, 138, 61, 0.2)', borderRadius: '1.5rem', display: 'flex', gap: '1.25rem', margin: '1rem 0', fontFamily: 'var(--font-sans)', letterSpacing: 'normal' }}>
              <div style={{ width: '28px', height: '28px', flexShrink: 0, backgroundColor: 'var(--color-accent)', maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4\'/%3E%3Cpath d=\'m21 2-9.6 9.6\'/%3E%3Ccircle cx=\'7.5\' cy=\'15.5\' r=\'5.5\'/%3E%3C/svg%3E")', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4\'/%3E%3Cpath d=\'m21 2-9.6 9.6\'/%3E%3Ccircle cx=\'7.5\' cy=\'15.5\' r=\'5.5\'/%3E%3C/svg%3E")', WebkitMaskRepeat: 'no-repeat' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-accent)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KEY TAKEAWAY</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5 }}>{b.content}</span>
              </div>
            </div>
          );
        }
        if (b.type === 'step') {
          return (
            <div key={idx} style={{ padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '1.5rem', display: 'flex', gap: '1.25rem', margin: '1rem 0', fontFamily: 'var(--font-sans)', letterSpacing: 'normal' }}>
              <div style={{ width: '28px', height: '28px', flexShrink: 0, backgroundColor: 'var(--color-text-muted)', maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\'/%3E%3Cpath d=\'M8 12h8\'/%3E%3Cpath d=\'m12 16 4-4-4-4\'/%3E%3C/svg%3E")', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\'/%3E%3Cpath d=\'M8 12h8\'/%3E%3Cpath d=\'m12 16 4-4-4-4\'/%3E%3C/svg%3E")', WebkitMaskRepeat: 'no-repeat' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NEXT STEP</strong>
                <span style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>{b.content}</span>
              </div>
            </div>
          );
        }
        return null;
      });

      slidesArr.push(
        <div key={`slide-${i}`} className="flex flex-col justify-center h-full w-full max-w-4xl mx-auto px-10 py-8">
          {slideContent}
        </div>
      );
      
      currentGroup = [];
      blockCount = 0;
    }
  }
  
    return slidesArr;
  }, [title, lede, blocks]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(c => Math.min(c + 1, slides.length - 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(c => Math.max(c - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div style={{ 
      width: '100%', 
      aspectRatio: '16/9', 
      minHeight: '500px',
      maxHeight: '70vh',
      backgroundColor: 'rgba(20, 20, 20, 0.6)', 
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      
      {/* Slide Content Area */}
      <div style={{ flexGrow: 1, position: 'relative', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          {slides[currentSlide]}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{ 
          width: `${((currentSlide + 1) / slides.length) * 100}%`, 
          height: '100%', 
          backgroundColor: 'var(--color-accent)',
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>

      {/* Bottom Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          <LayoutList size={16} />
          Slide {currentSlide + 1} of {slides.length}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.5rem', height: '2.5rem', borderRadius: '50%',
              backgroundColor: currentSlide === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
              color: currentSlide === 0 ? 'rgba(255,255,255,0.2)' : 'var(--color-text)',
              border: '1px solid rgba(255,255,255,0.05)',
              cursor: currentSlide === 0 ? 'default' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.5rem', height: '2.5rem', borderRadius: '50%',
              backgroundColor: currentSlide === slides.length - 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255, 138, 61, 0.15)',
              color: currentSlide === slides.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--color-accent)',
              border: '1px solid',
              borderColor: currentSlide === slides.length - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255, 138, 61, 0.3)',
              cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

    </div>
  );
});
