import { Settings } from 'lucide-react';
import SettingsClient from './SettingsClient';

export default async function CourseSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem 6rem' }}>
      
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={32} color="var(--color-accent)" />
          Course Settings
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Customize your learning experience and manage this generated course.
        </p>
      </header>

      <SettingsClient courseId={id} />
    </main>
  );
}
