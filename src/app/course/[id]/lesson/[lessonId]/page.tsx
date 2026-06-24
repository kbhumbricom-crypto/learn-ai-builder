'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, RefreshCw, Play, Pause, Square, Volume2, AlertTriangle } from 'lucide-react';
import { speakText, TTSControls } from '@/lib/tts';
import { useCompletion } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import FlowchartRenderer from '@/components/FlowchartRenderer';
import remarkGfm from 'remark-gfm';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { Settings2, Type } from 'lucide-react';
import { useReaderSettings } from '../../ReaderSettingsContext';
import { triggerHaptic } from '@/lib/haptics';

export default function LessonReader({ params }: { params: Promise<{ id: string, lessonId: string }> }) {
  const { id, lessonId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [strength, setStrength] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const ttsRef = useRef<TTSControls | null>(null);

  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const lastScrollY = useRef(0);
  const { fontSize, fontFamily, setFontSize, setFontFamily } = useReaderSettings();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (cooldown === null) return;
    if (cooldown <= 0) {
      setCooldown(null);
      fetchLesson(true);
      return;
    }
    const timer = setTimeout(() => setCooldown(c => (c ? c - 1 : 0)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const [completion, setCompletion] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");

  const fetchLesson = async (forceGenerate = false) => {
    setError(null);
    setLoading(false); 
    setCompletion("");
    
    try {
      const response = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, strength, forceGenerate }),
        signal: AbortSignal.timeout(60000)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("The AI engine is currently experiencing extremely high traffic. Please try again in 60 seconds.");
        }
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // Strip any generated # H1 tags from cached content
        const cleanContent = data.content.replace(/^#\s.*?\n+/, '');
        setCompletion(cleanContent);
        if (data.title) setLessonTitle(data.title);
        return;
      }

      const titleHeader = response.headers.get('x-lesson-title');
      if (titleHeader) setLessonTitle(decodeURIComponent(titleHeader));

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let done = false;
      let text = "";
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          text += decoder.decode(value, { stream: true });
          const cleanText = text.replace(/^#\s.*?\n+/, '');
          setCompletion(cleanText);
        }
      }
      
      if (!text.trim() && done) {
        throw new Error("The AI generated an empty response. Please try again.");
      }
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError("The connection timed out while waiting for the AI to structure the lesson. Please try again.");
      } else {
        setError(err.message || "An unknown error occurred while generating the lesson.");
      }
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const markComplete = async () => {
    triggerHaptic([20, 50, 20]); // Confetti-like double pop for completing a lesson!
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/complete`, { method: 'POST' });
      const data = await res.json();
      router.refresh();
      if (data.nextLessonId) {
        router.push(`/course/${id}/lesson/${data.nextLessonId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePlay = () => {
    if (isPaused && ttsRef.current) {
      ttsRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    if (!completion) return;
    ttsRef.current = speakText(completion, playbackRate, () => {
      setIsPlaying(false);
      setIsPaused(false);
    });
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    ttsRef.current?.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    ttsRef.current?.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const changeRate = (newRate: number) => {
    setPlaybackRate(newRate);
    if (isPlaying || isPaused) {
      ttsRef.current?.stop();
      if (completion) {
        ttsRef.current = speakText(completion, newRate, () => {
          setIsPlaying(false);
          setIsPaused(false);
        });
        setIsPlaying(true);
        setIsPaused(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      ttsRef.current?.stop();
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'transparent', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <ReadingProgressBar />

      {/* Floating Toolbar (Right Aligned) */}
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-[100] flex items-center gap-2 sm:gap-4 transition-all duration-500 ease-out" style={{ 
        opacity: showControls ? 1 : 0,
        transform: showControls ? 'translateY(0)' : 'translateY(-20px)',
        pointerEvents: showControls ? 'auto' : 'none',
      }}>
        
        {/* Audio Player */}
        {!loading && !error && completion && (
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
            {isPlaying ? (
              <button onClick={handlePause} className="flex p-0 bg-transparent border-none text-accent cursor-pointer">
                <Pause size={18} />
              </button>
            ) : (
              <button onClick={handlePlay} className="flex p-0 bg-transparent border-none text-accent cursor-pointer">
                {isPaused ? <Play size={18} /> : <Volume2 size={18} />}
              </button>
            )}

            <span className="hidden sm:inline min-w-[40px] text-[0.85rem] font-medium" style={{ color: isPlaying ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
              {isPlaying ? 'Playing...' : isPaused ? 'Paused' : 'Listen'}
            </span>

            {(isPlaying || isPaused) && (
              <button onClick={handleStop} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <Square size={14} />
              </button>
            )}

            <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeRate(rate)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    backgroundColor: playbackRate === rate ? 'var(--color-accent)' : 'transparent',
                    color: playbackRate === rate ? 'white' : 'var(--color-text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typography Settings Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: 'rgba(10, 10, 10, 0.8)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', color: 'var(--color-text-muted)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <Type size={16} />
          </button>

        {showSettings && (
          <div style={{ position: 'absolute', top: '3rem', right: 0, width: '250px', background: 'rgba(15,15,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Typography</h4>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                <button onClick={() => setFontFamily('sans')} style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', borderRadius: '0.35rem', border: 'none', background: fontFamily === 'sans' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontFamily === 'sans' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>Sans</button>
                <button onClick={() => setFontFamily('serif')} style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', fontFamily: 'Georgia, serif', borderRadius: '0.35rem', border: 'none', background: fontFamily === 'serif' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontFamily === 'serif' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>Serif</button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                <button onClick={() => setFontSize('sm')} style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', borderRadius: '0.35rem', border: 'none', background: fontSize === 'sm' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontSize === 'sm' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>A</button>
                <button onClick={() => setFontSize('md')} style={{ flex: 1, padding: '0.5rem', fontSize: '1rem', borderRadius: '0.35rem', border: 'none', background: fontSize === 'md' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontSize === 'md' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>A</button>
                <button onClick={() => setFontSize('lg')} style={{ flex: 1, padding: '0.5rem', fontSize: '1.2rem', borderRadius: '0.35rem', border: 'none', background: fontSize === 'lg' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontSize === 'lg' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>A</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <main style={{ maxWidth: '780px', margin: '4rem auto 8rem', padding: '0 2rem' }}>
          {loading || cooldown !== null ? (
            <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--color-text-muted)' }}>
              {cooldown !== null ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-orange-500 transition-all duration-1000 ease-linear" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - cooldown / 60)} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-orange-500">{cooldown}s</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1.5rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>Writing the lesson...</p>
                </>
              )}
            </div>
          ) : error ? (
            <div className="glass-card" style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', backgroundColor: 'rgba(255, 0, 0, 0.05)', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
              <div style={{ color: '#ff6b6b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                {error.includes('503') || error.includes('UNAVAILABLE') || error.includes('busy')
                  ? "The AI model is currently experiencing high demand. Please try again in a moment."
                  : error}
              </div>
              <button onClick={() => fetchLesson(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem' }}>
                <RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Try Again
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Audio player moved to right toolbar */}

              {/* Medium / LinkedIn Style Markdown Reader */}
              <article 
                className="markdown-reader"
                style={{
                  fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 'var(--font-sans)',
                  fontSize: fontSize === 'sm' ? '0.9rem' : fontSize === 'lg' ? '1.25rem' : '1rem',
                  lineHeight: fontSize === 'sm' ? '1.6' : fontSize === 'lg' ? '1.8' : '1.7',
                  transition: 'all 0.3s ease'
                }}
              >
                {lessonTitle && <h1 style={{ marginBottom: '2rem' }}>{lessonTitle}</h1>}
                {completion ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (match && (match[1] === 'flowchart' || match[1] === 'timeline' || match[1] === 'mermaid')) {
                          return <FlowchartRenderer chart={String(children).replace(/\n$/, '')} />;
                        }
                        return <code className={className} {...props}>{children}</code>;
                      }
                    }}
                  >
                    {completion}
                  </ReactMarkdown>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center space-y-4 mt-12 p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                    <AlertTriangle className="text-red-500" size={32} />
                    <h3 className="text-xl font-display text-red-400">Stream Disconnected</h3>
                    <p className="text-text-muted max-w-md">
                      {error || "We lost connection to the Architect AI while streaming this lesson. Please try reloading the page."}
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                    >
                      Retry Lesson
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 animate-pulse mt-8">
                    <div className="h-4 bg-orange-500/20 rounded w-3/4"></div>
                    <div className="h-4 bg-orange-500/10 rounded w-full"></div>
                    <div className="h-4 bg-orange-500/10 rounded w-5/6"></div>
                    <div className="h-4 bg-orange-500/10 rounded w-4/5 pt-4"></div>
                    <div className="h-4 bg-orange-500/10 rounded w-full"></div>
                    
                    <div className="pt-8 flex items-center space-x-3 text-orange-400 opacity-80">
                      <RefreshCw className="animate-spin" size={18} />
                      <span className="font-mono text-sm tracking-wide">Architect AI is structuring the lesson...</span>
                    </div>
                  </div>
                )}
              </article>

              {/* Completion Action */}
              <div style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={markComplete}
                  disabled={isCompleting}
                  className="btn"
                  style={{ 
                    padding: '0.6rem 1.5rem', 
                    fontSize: '0.95rem', 
                    borderRadius: '100px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
                  }}
                >
                  {isCompleting ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Mark as Complete
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .glass-card {
          background-color: rgba(5, 5, 5, 0.4);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1);
          padding: 3rem;
          transition: all 0.3s ease;
        }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* PREMIUM LINKEDIN-STYLE TYPOGRAPHY */
        .markdown-reader {
          font-family: var(--font-sans);
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1.6;
          font-weight: 400;
        }

        .markdown-reader h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin-bottom: 1.5rem;
          color: #ffffff;
        }

        .markdown-reader h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .markdown-reader h3 {
          font-family: var(--font-sans);
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #ffffff;
        }

        .markdown-reader p {
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .markdown-reader strong {
          font-weight: 600;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
          padding: 0 0.2rem;
          border-radius: 0.2rem;
        }

        .markdown-reader blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid var(--color-accent);
          background-color: rgba(255, 138, 61, 0.05);
          font-size: 1.15rem;
          font-style: italic;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          border-radius: 0 0.5rem 0.5rem 0;
          line-height: 1.5;
        }

        .markdown-reader blockquote p {
          margin-bottom: 0;
        }

        .markdown-reader ul, .markdown-reader ol {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }

        .markdown-reader li {
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }
        
        .markdown-reader li::marker {
          color: var(--color-accent);
        }

        .markdown-reader pre {
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2.5rem 0;
          font-size: 0.95rem;
        }

        .markdown-reader code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: monospace;
          color: #FFB380;
        }

        .markdown-reader pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }

        @media (max-width: 768px) {
          .glass-card { padding: 1.5rem; }
          .markdown-reader { font-size: 1rem; line-height: 1.6; }
          .markdown-reader blockquote { padding: 1.25rem 1.5rem; font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
}
