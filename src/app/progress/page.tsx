'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Globe, Layers, User, Sliders, LayoutTemplate, Loader2, CheckCircle2, AlertTriangle, Lock, ArrowLeft, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

const STEPS = [
  { id: 0, title: "Reading the course page", icon: Globe },
  { id: 1, title: "Mapping the curriculum", icon: Layers },
  { id: 2, title: "Studying the instructor", icon: User },
  { id: 3, title: "Tuning the teaching persona", icon: Sliders },
  { id: 4, title: "Drafting your course", icon: LayoutTemplate }
];

function ProgressPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const courseUrl = searchParams?.get('courseUrl') || '';
  const notes = searchParams?.get('notes') || '';
  const instructorOverride = searchParams?.get('instructorOverride') || '';
  
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [hasGyro, setHasGyro] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isWaitlistSubmitting, setIsWaitlistSubmitting] = useState(false);
  const [isWaitlistSuccess, setIsWaitlistSuccess] = useState(false);
  const [waitlistNumber, setWaitlistNumber] = useState(0);

  useEffect(() => {
    if (isWaitlistSuccess) {
      const target = 14204 + Math.floor(Math.random() * 100);
      let current = 0;
      const interval = setInterval(() => {
        current += Math.floor(target / 20);
        if (current >= target) {
          setWaitlistNumber(target);
          clearInterval(interval);
        } else {
          setWaitlistNumber(current);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isWaitlistSuccess]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waitlistEmail);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !isEmailValid) return;
    setIsWaitlistSubmitting(true);
    setTimeout(() => {
      setIsWaitlistSubmitting(false);
      setIsWaitlistSuccess(true);
      flipProgress.set(180);
    }, 1200);
  };

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { damping: 25, stiffness: 150 });
  const rotateYBase = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { damping: 25, stiffness: 150 });
  
  const flipProgress = useSpring(0, { damping: 20, stiffness: 100 });
  const rotateY = useTransform(() => rotateYBase.get() + flipProgress.get());
  
  const frontOpacity = useTransform(flipProgress, [89, 90], [1, 0]);
  const backOpacity = useTransform(flipProgress, [89, 90], [0, 1]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set((x / rect.width) - 0.5);
    mouseY.set((y / rect.height) - 0.5);
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    mouseX.set((x / rect.width) - 0.5);
    mouseY.set((y / rect.height) - 0.5);
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const [gyroPermissionGranted, setGyroPermissionGranted] = useState<boolean | null>(null);
  const [needsGyroPermission, setNeedsGyroPermission] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).DeviceOrientationEvent?.requestPermission === 'function') {
      const stored = localStorage.getItem('gyroPermissionGranted');
      if (stored === 'true') {
        setGyroPermissionGranted(true);
      } else {
        setNeedsGyroPermission(true);
      }
    }
  }, []);

  // Gyroscope tilt for mobile
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      
      setHasGyro(true);

      // Beta: front-to-back tilt [-180 to 180]. Assuming 45deg is comfortable resting angle.
      // Map 20deg...70deg -> -0.5...0.5
      const beta = Math.min(Math.max(e.beta, 20), 70); 
      const normalizedY = ((beta - 20) / 50) - 0.5;
      
      // Gamma: left-to-right tilt [-90 to 90]. 
      // Map -25deg...25deg -> -0.5...0.5
      const gamma = Math.min(Math.max(e.gamma, -25), 25);
      const normalizedX = (gamma / 50);

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
      
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        // Fallback to arbitrary center if rect isn't ready
        const w = rect.width || 300; 
        const h = rect.height || 400;
        cardRef.current.style.setProperty('--mouse-x', `${(normalizedX + 0.5) * w}px`);
        cardRef.current.style.setProperty('--mouse-y', `${(normalizedY + 0.5) * h}px`);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
        // Non-iOS 13+ devices don't need permission
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      } else if (gyroPermissionGranted) {
        // iOS 13+ devices that have been granted permission
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [gyroPermissionGranted, mouseX, mouseY]);

  const requestGyro = async () => {
    if (typeof window !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setGyroPermissionGranted(true);
          localStorage.setItem('gyroPermissionGranted', 'true');
        }
      } catch (error) {
        console.error('Gyro permission error:', error);
      }
    }
  };
  
  // Extract domain for subtitle
  const displayDomain = courseUrl ? courseUrl.replace(/^https?:\/\//, '').split('/')[0] : 'Scanning source...';

  // Redirect to dashboard if accessed directly without a URL
  useEffect(() => {
    if (typeof window !== 'undefined' && !courseUrl) {
      router.replace('/dashboard');
    }
  }, [courseUrl, router]);

  // Countdown effect
  useEffect(() => {
    if (cooldown === null) return;
    if (cooldown <= 0) {
      setCooldown(null);
      setError(null);
      setCurrentStep(0);
      return;
    }
    const timer = setTimeout(() => setCooldown(c => (c ? c - 1 : 0)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Effect 1: Visual Loading Timers
  useEffect(() => {
    if (cooldown !== null) return;
    let isMounted = true;
    const timings = [0, 4000, 10000, 18000]; 
    const timeouts = timings.map((time, idx) => 
      setTimeout(() => {
        if (isMounted && !error && !isComplete && cooldown === null) setCurrentStep(prev => Math.max(prev, idx));
      }, time)
    );
    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [cooldown, error, isComplete]);

  // Effect 2: Data Fetching
  useEffect(() => {
    if (!courseUrl || cooldown !== null || isWaitlisted) return;

    let isMounted = true;

    const win = window as any;
    if (!win.__extractPromise || win.__extractUrl !== courseUrl) {
      win.__extractUrl = courseUrl;
      win.__extractPromise = fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseUrl, notes, instructorOverride }),
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          throw new Error('RATE_LIMIT:' + (data.retryAfter || 60));
        }
        if (res.status === 401) {
          throw new Error('AUTH_REQUIRED');
        }
        if (res.status === 403) {
          throw new Error('PRO_REQUIRED');
        }
        if (!res.ok) throw new Error(data.error || 'Failed to extract');
        return data;
      });
    }

    win.__extractPromise
      .then((data: any) => {
        if (isMounted) {
          if (data.isQueued && data.jobId) {
            setIsWaitlisted(true);
            setJobId(data.jobId);
          } else if (data.courseId) {
            setIsComplete(true);
            setCurrentStep(4); // Jump to final step
            setTimeout(() => {
              if (isMounted) router.push(`/course/${data.courseId}`);
            }, 1500);
          }
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          win.__extractPromise = null; // Allow retry on error
          let cleanMessage = err.message;
          if (cleanMessage.startsWith('RATE_LIMIT:')) {
            const time = parseInt(cleanMessage.split(':')[1], 10);
            setCooldown(time);
            return;
          }
          if (cleanMessage === 'AUTH_REQUIRED') {
            setError('Please sign in to generate another course.');
            return;
          }
          if (cleanMessage === 'PRO_REQUIRED') {
            setError('Upgrade to Pro (Coming Soon) to generate unlimited courses.');
            return;
          }
          try {
            if (cleanMessage.includes('429') || cleanMessage.includes('RESOURCE_EXHAUSTED') || cleanMessage.includes('quota')) {
              setCooldown(60);
              return;
            } else if (cleanMessage.includes('503') || cleanMessage.includes('UNAVAILABLE')) {
              cleanMessage = "The AI engine is temporarily unavailable. Please try again in a few moments.";
            } else if (cleanMessage.startsWith('{')) {
               const parsed = JSON.parse(cleanMessage);
               cleanMessage = parsed.error?.message || parsed.message || cleanMessage;
            }
          } catch (e) {
            // keep original message if parsing fails
          }
          setError(cleanMessage);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [courseUrl, notes, instructorOverride, cooldown, isWaitlisted, router]);

  // Effect 3: Waitlist Polling
  useEffect(() => {
    if (!isWaitlisted || !jobId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/job/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (isMounted) {
          if (data.status === 'COMPLETED' && data.courseId) {
            setIsComplete(true);
            setIsWaitlisted(false);
            setCurrentStep(4);
            setTimeout(() => {
              if (isMounted) router.push(`/course/${data.courseId}`);
            }, 1500);
          } else if (data.status === 'FAILED') {
            setIsWaitlisted(false);
            setError(data.error || 'Job failed in queue');
          }
        }
      } catch (err) {
        // Ignore polling errors
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isWaitlisted, jobId, router]);



  const progressPercentage = Math.min(((currentStep + (error ? 0 : 0.5)) / STEPS.length) * 100, 100);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--color-bg)', 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(1rem, 4vw, 2rem)'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1 }}></div>
      </div>

      {error && error.includes('Upgrade to Pro') ? (
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          style={{ perspective: 1200, display: 'flex', justifyContent: 'center', width: '100%', zIndex: 10 }}
        >
          <motion.div 
            ref={cardRef}
            onClick={requestGyro}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            initial={{ opacity: 0, y: 60, scale: 0.85, filter: 'blur(15px)' }} 
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} 
            whileHover={{
              boxShadow: '0 0 50px rgba(255,138,61,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,138,61,0.4)',
              scale: 1.02
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className={`card magnetic-card ${hasGyro ? 'gyro-active' : ''}`}
            style={{ 
              rotateX,
              rotateY,
              position: 'relative', 
            zIndex: 10, 
            width: '100%', 
            maxWidth: '32rem',
            padding: 'clamp(2rem, 6vw, 3rem) clamp(1.5rem, 5vw, 2.5rem)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(20, 20, 20, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div className="edge-glow-wrapper"></div>
          <div className="sheen-layer"></div>
          
          <style>{`
            .magnetic-card {
              position: relative;
              transform-style: preserve-3d;
            }
            .magnetic-card::before {
              content: "";
              position: absolute;
              inset: 0;
              border-radius: var(--radius-lg);
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
            .edge-glow-wrapper {
              position: absolute;
              inset: 0;
              border-radius: var(--radius-lg);
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
            .sheen-layer {
              position: absolute;
              inset: 0;
              border-radius: var(--radius-lg);
              background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.06), transparent 50%);
              opacity: 0;
              transition: opacity 0.3s;
              pointer-events: none;
              z-index: 15;
            }
            .magnetic-card:hover .sheen-layer, .magnetic-card.gyro-active .sheen-layer {
              opacity: 1;
            }
          `}</style>
          
          <motion.div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: frontOpacity }}>
            <div style={{ 
              width: '65%', minWidth: '140px', height: 'clamp(50px, 12vw, 80px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <Image src="/logo-2.png" alt="LearnAI Logo" fill style={{ objectFit: 'contain' }} priority />
            </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 8vw, 3rem)', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', marginBottom: '1.5rem', color: 'white', lineHeight: 1.1 }}>
            LearnAI <span className="font-serif italic font-normal bg-gradient-to-br from-[#FFD4B0] via-orange-soft to-orange bg-clip-text text-transparent tracking-tight" style={{ fontWeight: 400, fontSize: '1.15em', paddingRight: '0.1em' }}>PRO</span>
          </h2>
          
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '90%', lineHeight: 1.6 }}>
            You&apos;ve hit your generation limit! We&apos;re currently building Pro to give you unlimited AI courses, saved libraries, and premium instructor personas. Join the waitlist.
          </p>

          {/* Email Capture Form */}
          <div style={{ width: '100%', marginBottom: '2rem', position: 'relative' }}>
            <motion.form 
              onSubmit={handleWaitlistSubmit}
              style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.25rem' }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '0 0 0 1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(245, 239, 230, 0.4)' }}>
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  required
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Email address" 
                  disabled={isWaitlistSubmitting || isWaitlistSuccess}
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(255, 255, 255, 0.03)', fontSize: '0.95rem', color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s', opacity: isWaitlistSubmitting ? 0.5 : 1 }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 138, 61, 0.5)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 138, 61, 0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <motion.button 
                type="submit"
                disabled={isWaitlistSubmitting || (waitlistEmail.length > 0 && !isEmailValid) || isWaitlistSuccess}
                className="btn btn-primary"
                animate={{
                  scale: isEmailValid && !isWaitlistSuccess ? 1.02 : 1,
                  boxShadow: isEmailValid && !isWaitlistSuccess ? '0 0 20px rgba(255,138,61,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  opacity: waitlistEmail ? (isEmailValid ? 1 : 0.6) : 0.8
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '1.125rem', fontSize: '1rem', fontWeight: 700, borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)' }}
              >
                {isWaitlistSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 size={18} className="animate-spin" />
                    Joining...
                  </div>
                ) : (
                  "Notify Me"
                )}
              </motion.button>
            </motion.form>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => router.push('/')}
              style={{ 
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.2s',
                zIndex: 20
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <ArrowLeft size={14} /> Return to Home
            </button>

            {needsGyroPermission && !gyroPermissionGranted && (
              <button 
                onClick={requestGyro}
                style={{ 
                  background: 'transparent',
                  border: '1px solid rgba(255,138,61,0.2)',
                  color: 'var(--color-accent)',
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  zIndex: 20
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,138,61,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,138,61,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,138,61,0.2)'; }}
              >
                Enable 3D Tilt
              </button>
            )}
          </div>
          </motion.div>

          {/* Back of Card (VIP Pass) */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotateY(180deg)',
              pointerEvents: isWaitlistSuccess ? 'auto' : 'none',
              opacity: backOpacity,
              background: 'radial-gradient(circle at top right, rgba(255,138,61,0.15), transparent 60%), rgba(15, 15, 15, 0.95)',
              borderRadius: 'inherit',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 60px rgba(255,138,61,0.1)',
              padding: 'clamp(2rem, 6vw, 3rem) clamp(1.5rem, 5vw, 2.5rem)'
            }}
          >
            {/* 8x8 Faded Grid */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              background: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
              maskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
              pointerEvents: 'none'
            }} />
            
            {/* PRO Watermark */}
            <div style={{ position: 'absolute', bottom: '-4.5rem', left: '50%', transform: 'translateX(-50%)', fontSize: '16rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.015)', pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap', userSelect: 'none', lineHeight: 1 }}>
              PRO
            </div>

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #FFD4B0, #FF8A3D)', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: '#FF8A3D', filter: 'blur(60px)', opacity: 0.3, zIndex: 1 }} />
            
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', zIndex: 1 }} />
              </div>
              Spot Secured
            </div>
            
            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', margin: '0 0 1rem 0', color: 'white', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
              LearnAI <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#FF8A3D', fontWeight: 400 }}>PRO</span>
            </h2>
            
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 2.5rem 0', textAlign: 'center', lineHeight: 1.6, maxWidth: '280px' }}>
              YOU ARE IN. The future of AI course creation is almost here. Get ready to build without limits.
            </p>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.5rem' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,138,61,0.8)', fontWeight: 600 }}>
                  Access Token
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                  WAITLIST #{waitlistNumber.toLocaleString()}
                </motion.div>
              </div>
              <div style={{ position: 'relative', fontFamily: 'monospace', color: 'white', fontSize: '0.95rem', padding: '1rem 1.25rem', background: 'linear-gradient(90deg, rgba(255,138,61,0.15), rgba(255,138,61,0.02))', borderRadius: '0.75rem', border: '1px solid rgba(255,138,61,0.2)', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
                <span style={{ opacity: 0.9, position: 'relative', zIndex: 1 }}>{waitlistEmail || 'user@example.com'}</span>
                <Lock size={14} style={{ color: 'rgba(255,138,61,0.6)', position: 'relative', zIndex: 1 }} />
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/')}
              style={{ 
                background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '3rem', transition: 'color 0.2s', zIndex: 10
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <ArrowLeft size={16} /> Return to Home
            </button>
          </motion.div>

        </motion.div>
        </motion.div>
      ) : (
        <div className="card relative z-10 w-full max-w-[32rem] p-5 sm:p-8 md:p-10 shadow-md">
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {error === 'Please sign in to generate another course.' && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255,138,61,0.2) 0%, rgba(255,138,61,0.05) 100%)',
                  border: '1px solid rgba(255,138,61,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-accent)',
                  boxShadow: '0 0 20px rgba(255,138,61,0.15)'
                }}
              >
                <Lock size={24} />
              </motion.div>
            )}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                {error === 'Please sign in to generate another course.' ? 'Sign In Required' : error ? 'Extraction Failed' : isWaitlisted ? 'You are in the Waitlist' : cooldown !== null ? 'Rate Limit Exceeded' : 'Building your course'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '0.2rem' }}>
                {error === 'Please sign in to generate another course.' ? "You've reached your free anonymous limit. Sign in to continue." : error ? 'Connection error encountered.' : isWaitlisted ? 'The AI engines are at capacity. We are building your course in the background.' : cooldown !== null ? 'The AI engine is extremely busy. Please wait.' : 'Reading the live page. This takes a few seconds.'}
              </p>
            </div>
          </div>

          {/* Top Progress Bar */}
          {!error && cooldown === null && !isWaitlisted && (
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden', margin: '1.5rem 0 2rem 0', position: 'relative' }}>
              <div style={{ 
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: `${isComplete ? 100 : progressPercentage}%`, 
                backgroundColor: 'var(--color-accent)',
                transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: 'var(--shadow-glow)'
              }} />
            </div>
          )}

          {isWaitlisted ? (
             <div style={{ color: 'var(--color-accent)', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', backgroundColor: 'rgba(255, 138, 61, 0.05)', border: '1px solid rgba(255, 138, 61, 0.1)', borderRadius: '0.75rem' }}>
               <div className="spinner" style={{ borderColor: 'rgba(255,138,61,0.3)', borderTopColor: 'var(--color-accent)', width: 32, height: 32 }}></div>
               <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Position: In Queue</div>
               <p style={{ textAlign: 'center', fontSize: '0.95rem', opacity: 0.8 }}>Please leave this page open. Your course will automatically appear here once the background workers finish.</p>
             </div>
          ) : cooldown !== null ? (
             <div style={{ color: '#ff6b6b', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', backgroundColor: 'rgba(255, 107, 107, 0.05)', border: '1px solid rgba(255, 107, 107, 0.1)', borderRadius: '0.75rem' }}>
               <AlertTriangle size={32} />
               <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>High Traffic Server Pause</div>
               <p style={{ textAlign: 'center', fontSize: '0.95rem', opacity: 0.8 }}>We&apos;ve temporarily paused your extraction to comply with AI rate limits. It will automatically resume in:</p>
               <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{cooldown}s</div>
             </div>
          ) : error === 'Please sign in to generate another course.' ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
              >
               <SignIn 
                 routing="hash" 
                 forceRedirectUrl={typeof window !== 'undefined' ? window.location.href : '/'} 
                 signUpUrl="/sign-up"
                 appearance={{
                   variables: {
                     colorBackground: 'transparent'
                   },
                   elements: {
                     cardBox: { boxShadow: 'none', margin: 0 },
                     card: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0 },
                     headerTitle: { display: 'none' },
                     headerSubtitle: { display: 'none' },
                     footer: { background: 'transparent' },
                     dividerLine: { background: 'rgba(255, 255, 255, 0.1)' },
                     dividerText: { color: 'rgba(255, 255, 255, 0.7)' },
                     footerActionText: { color: 'rgba(255, 255, 255, 0.7)' },
                     formFieldLabel: { color: 'rgba(255, 255, 255, 0.8)' },
                     identityPreviewText: { color: 'white' },
                     socialButtonsBlockButtonText: { color: 'white', fontWeight: 600 },
                     socialButtonsBlockButton: { 
                       border: '1px solid rgba(255, 255, 255, 0.15)', 
                       backgroundColor: 'rgba(255, 255, 255, 0.03)',
                       transition: 'all 0.2s ease'
                     }
                   }
                 }}
               />
              </motion.div>
          ) : error ? (
             <div style={{ color: '#ff6b6b', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', backgroundColor: 'rgba(255, 107, 107, 0.05)', border: '1px solid rgba(255, 107, 107, 0.1)', borderRadius: '0.75rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                 <AlertTriangle size={18} /> Error
               </div>
               <span style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{error}</span>
               <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', borderRadius: '0.75rem' }} onClick={() => router.push('/')}>
                 Return to Home
               </button>
             </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STEPS.map((step) => {
              const isActive = currentStep === step.id && !isComplete;
              const isPast = currentStep > step.id || isComplete;
              const isPending = currentStep < step.id && !isComplete;
              
              const Icon = step.icon;

              return (
                <div 
                  key={step.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'rgba(255, 138, 61, 0.04)' : 'transparent',
                    transition: 'all 0.3s ease',
                    opacity: isPending ? 0.4 : 1
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: 'var(--radius-full)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: isPast ? 'rgba(34, 197, 94, 0.1)' : isActive ? 'var(--color-accent)' : 'transparent',
                    color: isPast ? '#22c55e' : isActive ? 'white' : 'var(--color-text-muted)',
                    border: isPast || isActive ? 'none' : '1px solid var(--color-border)',
                    transition: 'all 0.3s ease'
                  }}>
                    {isPast ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: isActive ? 600 : 500, 
                      color: isActive || isPast ? 'var(--color-text)' : 'var(--color-text-muted)',
                      transition: 'color 0.3s ease'
                    }}>
                      {step.title}
                    </span>
                    {step.id === 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                        {displayDomain}
                      </span>
                    )}
                  </div>

                  {isActive && <Loader2 className="animate-spin" size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        )}

      </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} />}>
      <ProgressPageContent />
    </Suspense>
  );
}
