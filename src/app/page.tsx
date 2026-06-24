'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import { User, Mail, Layers, UserCircle, MessageSquare, CheckCircle, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import MarketingSections from './MarketingSections';
import SplashScreen from '@/components/SplashScreen';

export default function EarlyAccess() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [courseUrl, setCourseUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [instructor, setInstructor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peekTitle, setPeekTitle] = useState<string | null>(null);
  const [isPeeking, setIsPeeking] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(30);
  const [scrollY, setScrollY] = useState(0);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
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

  useEffect(() => {
    fetch('/api/lead')
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') {
          setWaitlistCount(30 + data.count);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (cardRef.current) {
        // Show floating CTA if the user has scrolled past the main form card
        const cardBottom = cardRef.current.getBoundingClientRect().bottom;
        let shouldShow = cardBottom < 0;

        // Hide it if they've scrolled down to the footer CTA
        const footerCta = document.getElementById('footer-cta');
        if (footerCta) {
          const footerTop = footerCta.getBoundingClientRect().top;
          if (footerTop < window.innerHeight) {
            shouldShow = false;
          }
        }

        setShowFloatingCta(shouldShow);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to check initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // URL Peeking logic
  useEffect(() => {
    if (!courseUrl || !courseUrl.includes('http')) {
      setPeekTitle(null);
      setIsPeeking(false);
      return;
    }

    setIsPeeking(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/peek?url=${encodeURIComponent(courseUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title) {
            setPeekTitle(data.title);
          } else {
            setPeekTitle(null);
          }
        }
      } catch (e) {
        setPeekTitle(null);
      } finally {
        setIsPeeking(false);
      }
    }, 600); // Debounce to avoid spamming the API

    return () => clearTimeout(timeoutId);
  }, [courseUrl]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleCtaClick = () => {
    if (cardRef.current) {
      // Calculate offset to leave a bit of breathing room at the top
      const yOffset = -20;
      const y = cardRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });

      cardRef.current.classList.add('shimmer-effect');
      setTimeout(() => {
        cardRef.current?.classList.remove('shimmer-effect');
      }, 1500);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setError(null);
    if (!courseUrl.includes('http')) {
      setError('Please provide a valid course URL including http:// or https://');
      return;
    }

    setIsLoading(true);
    const searchParams = new URLSearchParams({ courseUrl, notes, instructor });
    router.push(`/progress?${searchParams.toString()}`);
  };

  return (
    <>
      <AnimatePresence>
        {isPageLoading && <SplashScreen onComplete={() => setIsPageLoading(false)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'var(--color-bg)', minHeight: '100vh', overflow: 'hidden' }}
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

        {/* Animated AI Blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <style>{`
          @keyframes shimmer-badge {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          .shimmer-badge {
            position: relative;
            background: rgba(255, 138, 61, 0.06);
            border: 1px solid transparent !important;
            border-radius: 9999px;
          }
          .shimmer-badge::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(
              90deg,
              rgba(255, 138, 61, 0.1) 0%,
              rgba(255, 138, 61, 0.1) 40%,
              rgba(255, 138, 61, 0.8) 50%,
              rgba(255, 138, 61, 0.1) 60%,
              rgba(255, 138, 61, 0.1) 100%
            );
            background-size: 200% 100%;
            animation: shimmer-badge 3s infinite linear;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
          .mouse-indicator {
            width: 20px;
            height: 32px;
            border-radius: 12px;
            position: relative;
            display: flex;
            justify-content: center;
            background: linear-gradient(var(--color-bg), var(--color-bg)) padding-box,
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.5) 100%) border-box;
            border: 1px solid transparent;
          }
          .mouse-wheel {
            width: 3px;
            height: 6px;
            background-color: var(--color-accent);
            border-radius: 2px;
            margin-top: 6px;
            box-shadow: 0 0 6px var(--color-accent);
            animation: scroll-wheel 1.5s cubic-bezier(0.15, 0.41, 0.69, 0.94) infinite;
          }
          @keyframes scroll-wheel {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(10px); opacity: 0; }
          }
        `}</style>
          {/* Navbar */}
          <nav style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '75rem', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.45rem', color: 'var(--color-text)' }}>
              <Logo size={28} /> LearnAI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {isLoaded && userId ? (
                <>
                  <a href="/progress" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text)'}>
                    My Courses
                  </a>
                  <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,138,61,0.5)] border-2 border-transparent hover:border-[#FF8A3D]"
                      }
                    }}
                  />
                </>
              ) : isLoaded && !userId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image src="https://i.pravatar.cc/100?img=44" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', zIndex: 4, position: 'relative' }} />
                    <Image src="https://i.pravatar.cc/100?img=47" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 3, position: 'relative' }} />
                    <Image src="https://i.pravatar.cc/100?img=68" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 2, position: 'relative' }} />
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 1, position: 'relative', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                      5k
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>Join 5k+</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>active learners</span>
                  </div>
                  <SignInButton mode="modal">
                    <button style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-bg)', backgroundColor: 'var(--color-text)', borderRadius: '2rem', cursor: 'pointer', border: 'none', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              ) : null}
            </div>
          </nav>

          {/* Main Content Container */}
          <main style={{ maxWidth: '75rem', margin: 'auto', padding: 'clamp(1.2rem, 5vw, 2rem)', display: 'grid', gridTemplateColumns: '1.2fr 25rem', gap: '3rem', alignItems: 'center', width: '100%', flexGrow: 1 }}>
            
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
                {/* Removed Early Access Badge */}
                <h1 style={{ fontSize: 'clamp(2.75rem, 4.5vw, 4rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', textWrap: 'balance' }}>
                  Learn any paid course for&nbsp;<span className="font-serif italic font-normal bg-gradient-to-br from-[#FFD4B0] via-orange-soft to-orange bg-clip-text text-transparent tracking-tight">free,</span><br />straight from its syllabus.
                </h1>
                <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '90%' }}>
                  Unlock world-class education instantly. Provide a link to an expensive course outline, and LearnAI reconstructs the material into a bespoke curriculum designed specifically for you.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 138, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-accent)' }}>
                    <Layers size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>Curriculum Mapping</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '95%' }}>Turn any dry syllabus or reference material into a highly structured learning path.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 138, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-accent)' }}>
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>Persona-Driven Learning</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '95%' }}>We don't just generate content; we re-teach existing knowledge in your perfect instructor's voice.</p>
                  </div>
                </div>

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
            <div className="mt-12 md:mt-0" style={{ position: 'relative' }}>
              
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
                style={{ padding: '2.5rem 2rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.12)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(40px) saturate(120%)', WebkitBackdropFilter: 'blur(40px) saturate(120%)', boxShadow: '0 0 80px rgba(255, 138, 61, 0.12), 0 32px 64px rgba(0,0,0,0.6), inset 0 2px 20px rgba(255,255,255,0.05)', opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.4s ease' }}
              >
                <div className="edge-glow-wrapper"></div>
                
                <AnimatePresence mode="wait">
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div style={{ marginBottom: '1.5rem' }}>
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
                          <AnimatePresence>
                            {(peekTitle || isPeeking) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: '0.75rem' }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  {isPeeking ? (
                                    <>
                                      <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255, 138, 61, 0.3)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                      <span style={{ color: 'rgba(255, 138, 61, 0.7)' }}>Scanning URL...</span>
                                      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                                    </>
                                  ) : peekTitle ? (
                                    <>
                                      ✨ Found: {peekTitle}
                                    </>
                                  ) : null}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Instructor Name / Role <span style={{ color: 'rgba(245, 239, 230, 0.3)', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal' }}>(Optional)</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '0 0 0 1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(245, 239, 230, 0.4)' }}>
                              <UserCircle size={16} />
                            </div>
                            <input
                              type="text"
                              value={instructor}
                              onChange={(e) => setInstructor(e.target.value)}
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
                            href={`/course/demo-psychology-of-decisions`}
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
                        
                        <div style={{ marginTop: '1.75rem', paddingTop: '1.75rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <p style={{ fontSize: '0.75rem', color: 'rgba(245, 239, 230, 0.4)', lineHeight: 1.6, margin: 0 }}>
                            LearnAI analyzes syllabus links in seconds to instantly construct a highly personalized curriculum tailored to your exact learning style.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </main>

          {/* Scroll Indicator */}
          <div 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            style={{ marginTop: 'auto', paddingBottom: '2rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', opacity: Math.max(0, 0.8 - scrollY / 300), transition: 'opacity 0.1s', cursor: 'pointer', zIndex: 20 }}
          >
            <div className="mouse-indicator">
              <div className="mouse-wheel"></div>
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Scroll</span>
          </div>
        </div>

        <MarketingSections onCtaClick={handleCtaClick} />

      {/* Floating Mobile CTA */}
      <AnimatePresence>
        {showFloatingCta && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 100,
              padding: '0 1.2rem',
              pointerEvents: 'none', // Allow clicking through the container
            }}
          >
            <button
              onClick={handleCtaClick}
              className="btn btn-primary"
              style={{
                padding: '1.2rem 3.5rem', 
                fontSize: '1.05rem', 
                fontWeight: 700, 
                borderRadius: '1.25rem', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderTop: '1px solid rgba(255,255,255,0.3)', 
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,138,61,0.4)',
                pointerEvents: 'auto', // Re-enable clicking on the button itself
              }}
            >
              Start Generating
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
