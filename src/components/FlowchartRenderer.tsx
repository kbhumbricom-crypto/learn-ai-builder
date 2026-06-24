'use client';
import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function FlowchartRenderer({ chart }: { chart: string }) {
  // Parse the simple text-based list into structured nodes
  const lines = chart.split('\n').filter(line => line.trim() !== '');
  const nodes = lines.map(line => {
    // Remove leading bullets, dashes, or numbers
    const cleanLine = line.replace(/^[\s\-*\d.]+\s*/, '').trim();
    
    // Split into title and description if there's a colon or dash separator
    let title = cleanLine;
    let description = '';
    
    if (cleanLine.includes(':')) {
      const parts = cleanLine.split(':');
      title = parts[0];
      description = parts.slice(1).join(':').trim();
    } else if (cleanLine.includes(' - ')) {
      const parts = cleanLine.split(' - ');
      title = parts[0];
      description = parts.slice(1).join(' - ').trim();
    }

    return {
      title: title.trim(),
      description: description.trim()
    };
  }).filter(n => n.title);

  if (nodes.length === 0) return null;

  return (
    <div style={{ 
      margin: '2.5rem 0', 
      padding: '2rem', 
      backgroundColor: 'rgba(255, 255, 255, 0.02)', 
      borderRadius: '1rem', 
      border: '1px solid rgba(255, 255, 255, 0.08)',
      width: '100%',
      whiteSpace: 'normal',
      fontFamily: 'var(--font-geist-sans), sans-serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '600px', margin: '0 auto' }}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              padding: '1.25rem 1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 138, 61, 0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 2,
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--color-accent)', fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                {node.title}
              </span>
              {node.description && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {node.description}
                </span>
              )}
            </div>
            {i < nodes.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.25rem 0', color: 'rgba(255, 255, 255, 0.3)', zIndex: 1 }}>
                <ArrowDown size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
