import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Home, LayoutDashboard, Compass, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'My Courses | Learn.ai',
};

export default async function DashboardPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      instructor: true,
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated AI Blobs for magical background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div className="blob blob-1" style={{ filter: 'blur(100px)' }}></div>
        <div className="blob blob-2" style={{ filter: 'blur(100px)' }}></div>
        <div className="blob blob-3" style={{ filter: 'blur(100px)' }}></div>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}></div>
      </div>

      {/* Sidebar Navigation */}
      <aside style={{ width: '280px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(5,5,5,0.6)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', color: '#f5efe6', padding: '1rem', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
            <Logo size={30} /> Learn.ai
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/dashboard" className="sidebar-link active">
              <LayoutDashboard size={18} /> My Courses
            </Link>
            <Link href="#" className="sidebar-link">
              <Compass size={18} /> Explore
            </Link>
            <Link href="/" className="sidebar-link">
              <Home size={18} /> Generate Course
            </Link>
          </nav>
        </div>
        
        <div style={{ marginTop: 'auto', padding: '2rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
           <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="#" className="sidebar-link">
              <Settings size={18} /> Settings
            </Link>
            <Link href="#" className="sidebar-link text-muted">
              <LogOut size={18} /> Sign Out
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '4rem', position: 'relative', zIndex: 10, overflowY: 'auto' }}>
        <header style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>My Courses</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Manage and resume your generated courses.</p>
        </header>

        <DashboardClient courses={courses} />
      </main>

      <style>{`
        .course-card {
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .course-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 138, 61, 0.4);
          box-shadow: 0 12px 32px rgba(255, 138, 61, 0.15);
        }

        /* Blobs */
        .blob {
          position: absolute;
          filter: blur(100px);
          opacity: 0.5;
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

        /* Glassmorphism perfectly matching the home page */
        .glass-card {
          background-color: rgba(5, 5, 5, 0.4);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1);
          padding: 2rem;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
