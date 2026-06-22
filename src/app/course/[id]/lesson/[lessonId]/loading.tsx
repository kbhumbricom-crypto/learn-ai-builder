import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '400px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--color-accent)" />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Loading Lesson...
        </span>
      </div>
    </div>
  );
}
