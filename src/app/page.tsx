'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, User, Squircle, Layers, UserCircle, MessageSquare, Zap } from 'lucide-react';
import Image from 'next/image';
import { DEMO_COURSE_ID } from '@/lib/constants';
import MarketingSections from './MarketingSections';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import { Logo } from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const [courseUrl, setCourseUrl] = useState('');
  const [instructorOverride, setInstructorOverride] = useState('');
  const [notes, setNotes] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  };
  
  const [peekTitle, setPeekTitle] = useState('');
  const [isPeeking, setIsPeeking] = useState(false);

  useEffect(() => {
    if (!courseUrl.includes('http')) {
      setPeekTitle('');
      return;
    }
    
    setIsPeeking(true);
    const timer = setTimeout(() => {
      fetch(`/api/peek?url=${encodeURIComponent(courseUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data.title) setPeekTitle(data.title);
          setIsPeeking(false);
        })
        .catch(() => setIsPeeking(false));
    }, 800);
    
    return () => clearTimeout(timer);
  }, [courseUrl]);

  useEffect(() => {
    const handleResize = () => {
      // 950px is our ideal baseline height for 16px (1rem)
      const height = window.innerHeight;
      let newScale = height / 950;
      if (newScale > 1) newScale = 1;
      
      // Update the root font size, which naturally scales ALL rem units perfectly
      document.documentElement.style.fontSize = `${16 * newScale}px`;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.fontSize = '16px';
    };
  }, []);

  useEffect(() => {
    // Force scroll to top on initial load so the splash screen reveals the hero section perfectly
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!courseUrl.includes('http')) {
      setError('Please provide a valid course URL including http:// or https://');
      return;
    }
    setIsLoading(true);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
    const searchParams = new URLSearchParams({
      courseUrl,
      notes,
      instructorOverride
    });
    router.push(`/progress?${searchParams.toString()}`);
  };

  const handleCtaClick = () => {
    // Custom fast smooth scroll
    const duration = 500; // milliseconds
    const startY = window.scrollY;
    const startTime = performance.now();

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      window.scrollTo(0, startY * (1 - easeOutQuart(progress)));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    requestAnimationFrame(animateScroll);

    if (cardRef.current) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          cardRef.current?.classList.add('shimmer-effect');
          setTimeout(() => {
            cardRef.current?.classList.remove('shimmer-effect');
          }, 1500);
          observer.disconnect();
        }
      }, { threshold: 0.5 }); // Trigger when 50% of the card is visible
      
      observer.observe(cardRef.current);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      
      <motion.div 
        initial={{ scale: 0.96, filter: 'blur(10px)' }}
        animate={{ scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'var(--color-bg)' }}
      >
        {/* GLOBAL SEAMLESS BACKGROUND TEXTURE */}
      <div 
        style={{ 
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(to right, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to right, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px)`,
          maskImage: 'linear-gradient(to bottom, transparent, black 1%, black 99%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 1%, black 99%, transparent)'
        }} 
      />

      {/* Hero Section */}
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'transparent', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Animated AI Blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div className="blob blob-1" style={{ transform: isFlashing ? 'scale(1.1)' : 'scale(1)', opacity: isFlashing ? 0.8 : 0.6, transition: 'all 0.2s' }}></div>
        <div className="blob blob-2" style={{ transform: isFlashing ? 'scale(1.1)' : 'scale(1)', opacity: isFlashing ? 0.8 : 0.6, transition: 'all 0.2s' }}></div>
        <div className="blob blob-3" style={{ transform: isFlashing ? 'scale(1.1)' : 'scale(1)', opacity: isFlashing ? 0.8 : 0.6, transition: 'all 0.2s' }}></div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Navbar */}
        <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '75rem', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.45rem', color: 'var(--color-text)' }}>
          <Logo size={28} /> Learn.ai
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          <a href="/dashboard" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-muted)', transition: 'color 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            My Courses
          </a>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="https://i.pravatar.cc/100?img=1" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', zIndex: 4, position: 'relative' }} />
              <Image src="https://i.pravatar.cc/100?img=5" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 3, position: 'relative' }} />
              <Image src="https://i.pravatar.cc/100?img=3" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 2, position: 'relative' }} />
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 1, position: 'relative', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text)' }}>
                +5k
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>Join 5k+</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>active learners</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main style={{ maxWidth: '75rem', margin: 'auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 25rem', gap: '3rem', alignItems: 'center', width: '100%', flexGrow: 1 }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
          
          {/* Ambient Glow - Center */}
          <div style={{
            position: 'absolute',
            top: '5%',
            left: '0%',
            width: '90%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(255, 138, 61, 0.25) 0%, rgba(255, 138, 61, 0) 65%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-accent)', backgroundColor: 'rgba(255, 138, 61, 0.06)', border: '1px solid rgba(255, 138, 61, 0.3)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              Hyper-personalized learning
            </span>
            <h1 style={{ fontSize: 'clamp(2.75rem, 4.5vw, 4rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', textWrap: 'balance' }}>
              Master any subject, through the mind you&nbsp;<span className="font-serif italic font-normal bg-gradient-to-br from-[#FFD4B0] via-orange-soft to-orange bg-clip-text text-transparent tracking-tight">choose.</span>
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '90%' }}>
              Point Learn.ai at any course syllabus and an instructor's profile. We analyze the curriculum, decode their unique teaching style, and instantly generate a self-paced course written exactly how they'd teach it.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
            {/* Feature 1 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 138, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-accent)' }}>
                <Layers size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>Curriculum Mapping</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '95%' }}>Turn any dry syllabus or reference material into a highly structured learning path.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 138, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-accent)' }}>
                <UserCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>Persona-Driven Learning</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '95%' }}>We don't just generate content; we re-teach existing knowledge in your perfect instructor's voice.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 138, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-accent)' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>Listen or Read</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '95%' }}>Every generated lesson comes with high-quality AI narration so you can learn on the commute.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Form Card) */}
        <div style={{ position: 'relative' }}>
          
          {/* Ambient Glow - Right Side */}
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '120%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(255, 138, 61, 0.15) 0%, rgba(255, 138, 61, 0) 65%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />
          <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="card magnetic-card" 
            style={{ padding: '2rem', backgroundColor: 'rgba(5, 5, 5, 0.4)', borderRadius: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)', opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.4s ease', pointerEvents: isLoading ? 'none' : 'auto' }}
          >
            <div className="edge-glow-wrapper"></div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>Generate Your Course</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Paste a syllabus URL, and tell us exactly how you want it taught.</p>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255, 51, 0, 0.1)', border: '1px solid rgba(255, 51, 0, 0.3)', color: '#FF6666', fontSize: '0.85rem', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <form 
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              onSubmit={handleSubmit} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Course or Syllabus URL
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '0 0 0 1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(245, 239, 230, 0.4)' }}>
                    <LinkIcon size={16} />
                  </div>
                  <input
                    type="url"
                    value={courseUrl}
                    onChange={(e) => setCourseUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 138, 61, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 138, 61, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {isPeeking && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.5rem', opacity: 0.7, animation: 'pulse 1.5s infinite' }}>
                    ✨ Verifying URL...
                  </p>
                )}
                {!isPeeking && peekTitle && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.5rem', animation: 'fade-in 0.3s ease-out' }}>
                    ✨ Found: {peekTitle}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Instructor Name / Role <span style={{ color: 'rgba(245, 239, 230, 0.3)', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal' }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '0 0 0 1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(245, 239, 230, 0.4)' }}>
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={instructorOverride}
                    onChange={(e) => setInstructorOverride(e.target.value)}
                    placeholder="e.g. Stanford Professor, YC Founder"
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 138, 61, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 138, 61, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  How should it be taught? <span style={{ color: 'rgba(245, 239, 230, 0.3)', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal' }}>(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 'Explain like I'm a 10 year old' or 'Use real-world case studies'"
                  style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: 'var(--color-text)', minHeight: '5rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 138, 61, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 138, 61, 0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.target.style.boxShadow = 'none'; }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Fine-tune the AI's understanding of their teaching style.
                </p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
                style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '1.125rem', fontSize: '1rem', fontWeight: 700, borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,0,0,0.2)', marginTop: '0.4rem' }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <div className="spinner"></div>
                    Generating...
                  </div>
                ) : (
                  <>
                    Generate Course
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <a 
                  href={`/course/${DEMO_COURSE_ID}`}
                  style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--color-text-muted)', 
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  or see a sample course →
                </a>
              </div>
            </form>
          </div>
        </div>

      </main>
      </div>

      <MarketingSections onCtaClick={handleCtaClick} />
      </div>

      <style>{`
        /* Blobs */
        .blob {
          position: absolute;
          will-change: transform;
          animation: blob-float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 70vmax;
          height: 70vmax;
          background: radial-gradient(circle, rgba(255, 138, 61, 0.1) 0%, rgba(255, 138, 61, 0) 60%);
        }
        .blob-2 {
          bottom: -20%;
          right: -10%;
          width: 80vmax;
          height: 80vmax;
          background: radial-gradient(circle, rgba(255, 90, 31, 0.08) 0%, rgba(255, 90, 31, 0) 60%);
          animation-delay: -5s;
        }
        .blob-3 {
          top: 30%;
          left: 40%;
          width: 60vmax;
          height: 60vmax;
          background: radial-gradient(circle, rgba(255, 174, 0, 0.05) 0%, rgba(255, 174, 0, 0) 60%);
          animation-delay: -10s;
          animation-duration: 18s;
        }
        @keyframes blob-float {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(5vw, 10vh) scale(1.1) rotate(45deg); }
          66% { transform: translate(-10vw, 15vh) scale(0.9) rotate(90deg); }
          100% { transform: translate(-5vw, -10vh) scale(1.2) rotate(180deg); }
        }
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        textarea::-webkit-scrollbar-corner {
          background: transparent;
        }
        textarea::-webkit-resizer {
          background: transparent;
        }
        .magnetic-card {
          position: relative;
        }
        .magnetic-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 2.5rem;
          background: radial-gradient(800px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255, 138, 61, 0.08), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
        }
        .magnetic-card:hover::before {
          opacity: 1;
        }
        .magnetic-card::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255, 138, 61, 0.8), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 0;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 1px;
        }
        .magnetic-card:hover::after {
          opacity: 1;
        }
        .magnetic-card > * {
          position: relative;
          z-index: 1;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-glow {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in-out-shimmer {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .edge-glow-wrapper {
          position: absolute;
          inset: 0;
          border-radius: 2.5rem;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          z-index: 20;
          overflow: hidden;
        }
        .edge-glow-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 45%, rgba(255, 138, 61, 0.1) 47%, rgba(255, 138, 61, 1) 50%, rgba(255, 138, 61, 0.1) 53%, transparent 55%);
          background-size: 300% 300%;
          background-position: 100% 100%;
        }
        .shimmer-effect .edge-glow-wrapper {
          animation: fade-in-out-shimmer 2s ease-in-out forwards;
        }
        .shimmer-effect .edge-glow-wrapper::before {
          animation: diagonal-shimmer 2s ease-in-out forwards;
        }
        @keyframes diagonal-shimmer {
          0% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes fade-in-out-shimmer {
          0% { opacity: 0; }
          20% { opacity: 1; }
          60% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          main {
            grid-template-columns: 1fr 25rem !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 992px) {
          main {
            grid-template-columns: 1fr !important;
          }
      `}</style>
      </motion.div>
    </>
  );
}
