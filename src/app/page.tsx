'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Layers, UserCircle, MessageSquare, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import MarketingSections from './MarketingSections';

export default function EarlyAccess() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistCount, setWaitlistCount] = useState(30);
  const [scrollY, setScrollY] = useState(0);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
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

  // Removed height-based scaling logic that was causing layout issues on mobile

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
    
    if (!name || !email) {
      setError('Please provide both your name and email address.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (typeof data.count === 'number') {
        setWaitlistCount(30 + data.count);
      }

      setIsSuccess(true);
      setName('');
      setEmail('');
      
      // Fire confetti burst using dynamic import to avoid SSR issues
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF8A3D', '#FFB380', '#FFFFFF']
      });

    } catch (err: any) {
      setError(err.message || 'Failed to join early access. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '75rem', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.45rem', color: 'var(--color-text)' }}>
              <Logo size={28} /> Learn.ai
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Image src="https://i.pravatar.cc/100?img=44" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', zIndex: 4, position: 'relative' }} />
                  <Image src="https://i.pravatar.cc/100?img=47" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 3, position: 'relative' }} />
                  <Image src="https://i.pravatar.cc/100?img=68" alt="User" width={32} height={32} unoptimized style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 2, position: 'relative' }} />
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-0.75rem', zIndex: 1, position: 'relative', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                    +{waitlistCount}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>Join others</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>on the waitlist</span>
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
                <span className="shimmer-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-accent)', border: '1px solid rgba(255, 138, 61, 0.3)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  ✦ Early access is now open
                </span>
                <h1 style={{ fontSize: 'clamp(2.75rem, 4.5vw, 4rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', textWrap: 'balance' }}>
                  Master any subject, through the mind you&nbsp;<span className="font-serif italic font-normal bg-gradient-to-br from-[#FFD4B0] via-orange-soft to-orange bg-clip-text text-transparent tracking-tight">choose.</span>
                </h1>
                <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '90%' }}>
                  Learn.ai turns any syllabus into a deeply personalized course taught in the style of your favorite expert. Join our early access to be the first to experience the future of learning.
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
                style={{ padding: '2.5rem 2rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.12)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(40px) saturate(120%)', WebkitBackdropFilter: 'blur(40px) saturate(120%)', boxShadow: '0 0 80px rgba(255, 138, 61, 0.12), 0 32px 64px rgba(0,0,0,0.6), inset 0 2px 20px rgba(255,255,255,0.05)', opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.4s ease' }}
              >
                <div className="edge-glow-wrapper"></div>
                
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}
                    >
                      <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(255, 138, 61, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(255, 138, 61, 0.2)' }}>
                        <CheckCircle size={32} />
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>You're on the list!</h2>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                        Thank you for your interest in Learn.ai. We'll notify you as soon as early access opens up.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>Get Early Access</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Join the waitlist to be among the first to experience Learn.ai.</p>
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
                            Your Name
                          </label>
                          <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '0 0 0 1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(245, 239, 230, 0.4)' }}>
                              <User size={16} />
                            </div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Enter full name"
                              style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }}
                              onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 138, 61, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 138, 61, 0.15)'; }}
                              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.target.style.boxShadow = 'none'; }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address
                          </label>
                          <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '0 0 0 1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(245, 239, 230, 0.4)' }}>
                              <Mail size={16} />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="john@example.com"
                              style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s' }}
                              onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 138, 61, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 138, 61, 0.15)'; }}
                              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.target.style.boxShadow = 'none'; }}
                            />
                          </div>
                          
                          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(245, 239, 230, 0.4)', fontSize: '0.75rem', fontWeight: 500 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Secure & private. We'll never spam you.
                          </div>
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
                              Joining...
                            </div>
                          ) : (
                            <>
                              Join Waitlist
                            </>
                          )}
                        </button>

                        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem', textDecoration: 'underline dotted', textUnderlineOffset: '4px' }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                          >
                            How it works
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
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
              padding: '0 1.5rem',
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
              Get Early Access
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
