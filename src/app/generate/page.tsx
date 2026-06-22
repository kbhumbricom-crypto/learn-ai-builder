'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, UserCircle, Sparkles } from 'lucide-react';
import { DEMO_COURSE_ID } from '@/lib/constants';

export default function GeneratePage() {
  const router = useRouter();
  const [courseUrl, setCourseUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [instructor, setInstructor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
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
    <div style={{ minHeight: '100vh', backgroundColor: '#07050A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Generate Your Course</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '15px' }}>Paste a syllabus URL, and tell us exactly how you want it taught.</p>

        {error && (
          <div style={{ padding: '12px 16px', marginBottom: '24px', borderRadius: '12px', backgroundColor: 'rgba(255, 51, 0, 0.1)', border: '1px solid rgba(255, 51, 0, 0.3)', color: '#FF6666', fontSize: '14px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Course or Syllabus URL</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '0 0 0 16px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }}><LinkIcon size={16} /></div>
              <input type="url" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor Name / Role <span style={{ textTransform: 'none' }}>(Optional)</span></label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '0 0 0 16px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }}><UserCircle size={16} /></div>
              <input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="e.g. Stanford Professor" style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>How should it be taught? <span style={{ textTransform: 'none' }}>(Optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Explain like I'm talking to a friend" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', minHeight: '100px' }} />
          </div>
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#FF5A1F', color: 'white', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer' }}>
            {isLoading ? 'Generating...' : 'Generate Course'}
          </button>
        </form>
      </div>
    </div>
  );
}
