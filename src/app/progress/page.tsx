'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Globe, Layers, User, Sliders, LayoutTemplate, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

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

  const courseUrl = searchParams?.get('courseUrl') || '';
  const notes = searchParams?.get('notes') || '';
  const instructorOverride = searchParams?.get('instructorOverride') || '';
  
  // Extract domain for subtitle
  const displayDomain = courseUrl ? courseUrl.replace(/^https?:\/\//, '').split('/')[0] : 'Scanning source...';

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
    if (!courseUrl || cooldown !== null) return;

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
        if (!res.ok) throw new Error(data.error || 'Failed to extract');
        return data;
      });
    }

    win.__extractPromise
      .then((data: any) => {
        if (isMounted && data.courseId) {
          setIsComplete(true);
          setCurrentStep(4); // Jump to final step
          setTimeout(() => {
            if (isMounted) router.push(`/course/${data.courseId}`);
          }, 1500);
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
  }, [courseUrl, notes, instructorOverride, cooldown]);



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
      padding: '2rem'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1 }}></div>
      </div>

      <div className="card" style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '32rem',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              {error ? 'Extraction Failed' : cooldown !== null ? 'Rate Limit Exceeded' : 'Building your course'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '0.2rem' }}>
              {error ? 'Connection error encountered.' : cooldown !== null ? 'The AI engine is extremely busy. Please wait.' : 'Reading the live page. This takes a few seconds.'}
            </p>
          </div>
        </div>

        {/* Top Progress Bar */}
        {!error && cooldown === null && (
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

        {cooldown !== null ? (
           <div style={{ color: '#ff6b6b', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', backgroundColor: 'rgba(255, 107, 107, 0.05)', border: '1px solid rgba(255, 107, 107, 0.1)', borderRadius: '0.75rem' }}>
             <AlertTriangle size={32} />
             <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>High Traffic Server Pause</div>
             <p style={{ textAlign: 'center', fontSize: '0.95rem', opacity: 0.8 }}>We've temporarily paused your extraction to comply with AI rate limits. It will automatically resume in:</p>
             <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{cooldown}s</div>
           </div>
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
