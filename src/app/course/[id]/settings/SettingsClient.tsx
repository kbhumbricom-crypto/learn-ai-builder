'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Trash2, Monitor, Type } from 'lucide-react';
import { useReaderSettings } from '../ReaderSettingsContext';

export default function SettingsClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { fontSize, fontFamily, cursorGlow, setFontSize, setFontFamily, setCursorGlow } = useReaderSettings();
  
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all your progress in this course?")) return;
    setIsResetting(true);
    try {
      await fetch(`/api/course/${courseId}/reset`, { method: 'POST' });
      router.refresh();
      alert("Progress successfully reset!");
    } catch (e) {
      alert("Failed to reset progress");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this course? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await fetch('/api/course/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: [courseId] })
      });
      router.push('/dashboard');
    } catch (e) {
      alert("Failed to delete course");
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Display & Accessibility */}
      <section>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <Monitor size={15} /> Reading Experience
        </h2>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem', backgroundColor: 'var(--color-bg)', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.35rem' }}>Focus Mode</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '400px' }}>Disable the animated AI background blobs behind your course reading material to focus more on the content.</p>
            </div>
            <button 
              onClick={() => setCursorGlow(!cursorGlow)}
              style={{ width: '48px', height: '26px', backgroundColor: !cursorGlow ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)', borderRadius: '13px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
            >
              <div style={{ position: 'absolute', top: '2px', left: !cursorGlow ? '24px' : '2px', width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </button>
          </div>
          
          <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Type size={16} /> Typography Preferences</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: '1.5rem' }}>Adjust font size and style for the lesson reader.</p>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Font Family</span>
                <div style={{ display: 'inline-flex', gap: '0.35rem', background: 'rgba(0,0,0,0.5)', padding: '0.35rem', borderRadius: '0.5rem' }}>
                  <button onClick={() => setFontFamily('sans')} style={{ padding: '0.45rem 1.25rem', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', borderRadius: '0.35rem', border: 'none', background: fontFamily === 'sans' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontFamily === 'sans' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>Sans</button>
                  <button onClick={() => setFontFamily('serif')} style={{ padding: '0.45rem 1.25rem', fontSize: '0.9rem', fontFamily: 'Georgia, serif', borderRadius: '0.35rem', border: 'none', background: fontFamily === 'serif' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontFamily === 'serif' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>Serif</button>
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Font Size</span>
                <div style={{ display: 'inline-flex', gap: '0.35rem', background: 'rgba(0,0,0,0.5)', padding: '0.35rem', borderRadius: '0.5rem' }}>
                  <button onClick={() => setFontSize('sm')} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderRadius: '0.35rem', border: 'none', background: fontSize === 'sm' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontSize === 'sm' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>A</button>
                  <button onClick={() => setFontSize('md')} style={{ padding: '0.45rem 0.9rem', fontSize: '0.95rem', borderRadius: '0.35rem', border: 'none', background: fontSize === 'md' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontSize === 'md' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>A</button>
                  <button onClick={() => setFontSize('lg')} style={{ padding: '0.45rem 0.9rem', fontSize: '1.1rem', borderRadius: '0.35rem', border: 'none', background: fontSize === 'lg' ? 'rgba(255,255,255,0.1)' : 'transparent', color: fontSize === 'lg' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>A</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Progression */}
      <section>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <RefreshCw size={15} /> Progression
        </h2>
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.35rem' }}>Reset Progress</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '400px' }}>Clear all completed lessons and start from the beginning.</p>
            </div>
            <button 
              onClick={handleReset}
              disabled={isResetting}
              style={{ padding: '0.7rem 1.4rem', fontSize: '0.95rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--color-text)', borderRadius: '100px', cursor: isResetting ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: isResetting ? 0.5 : 1 }}
            >
              {isResetting ? 'Resetting...' : 'Reset Course'}
            </button>
          </div>
        </div>
      </section>

      {/* Export & Danger Zone */}
      <section>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <Trash2 size={15} /> Danger Zone
        </h2>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.75rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.35rem', color: '#ef4444' }}>Delete Course</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(239, 68, 68, 0.8)', maxWidth: '400px' }}>Permanently remove this generated course and all its progress from your account.</p>
            </div>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              style={{ padding: '0.7rem 1.4rem', fontSize: '0.95rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '100px', cursor: isDeleting ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isDeleting ? 0.5 : 1 }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
