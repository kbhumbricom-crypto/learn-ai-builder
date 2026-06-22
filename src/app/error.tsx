'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service if we had one
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--color-bg)', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ 
        maxWidth: '32rem', 
        width: '100%', 
        padding: '3rem 2rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          color: '#ff6b6b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle size={32} />
        </div>
        
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Something went wrong!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            The system encountered an unexpected error. This has been logged and our subagents will look into it.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
          <button 
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Try again
          </button>
          <button 
            onClick={() => router.push('/')}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
