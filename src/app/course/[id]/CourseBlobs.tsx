'use client';

import { useReaderSettings } from './ReaderSettingsContext';

export default function CourseBlobs() {
  const { cursorGlow } = useReaderSettings();
  
  if (!cursorGlow) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <style>{`
        /* Blobs */
        .blob {
          position: absolute;
          filter: blur(100px);
          opacity: 0.37;
          border-radius: 50%;
          animation: blob-float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 55vmax;
          height: 55vmax;
          background: #FF3300;
          animation-delay: 0s;
        }
        .blob-2 {
          top: 30%;
          right: -20%;
          width: 65vmax;
          height: 65vmax;
          background: #E61000;
          animation-delay: -5s;
          animation-duration: 25s;
        }
        .blob-3 {
          bottom: -30%;
          left: 10%;
          width: 50vmax;
          height: 50vmax;
          background: #FF6600;
          animation-delay: -10s;
          animation-duration: 18s;
        }
        @keyframes blob-float {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(5vw, 10vh) scale(1.1) rotate(45deg); }
          66% { transform: translate(-10vw, 15vh) scale(0.9) rotate(90deg); }
          100% { transform: translate(-5vw, -10vh) scale(1.2) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
