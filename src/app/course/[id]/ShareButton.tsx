'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: copied ? '#4ade80' : 'var(--color-text-muted)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.color = 'var(--color-accent)';
          e.currentTarget.style.borderColor = 'rgba(255, 138, 61, 0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 138, 61, 0.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      }}
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? 'Link copied!' : 'Share course'}
    </button>
  );
}
