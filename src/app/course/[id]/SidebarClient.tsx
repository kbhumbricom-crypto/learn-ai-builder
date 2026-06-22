'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, BookOpen, Book, PlayCircle, FileText, LayoutDashboard } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export default function SidebarClient({ course, courseId }: { course: any, courseId: string }) {
  const pathname = usePathname();
  // By default, open all modules
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    course.modules.reduce((acc: any, m: any) => ({ ...acc, [m.id]: true }), {})
  );
  
  const { isSidebarCollapsed } = useSidebar();

  const toggleModule = (id: string) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ padding: isSidebarCollapsed ? '0' : '0 1.5rem', marginBottom: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
        {!isSidebarCollapsed ? (
          <Link href={`/course/${courseId}`} className={`sidebar-link ${pathname === `/course/${courseId}` ? 'active' : ''}`} title="Course Overview">
            <LayoutDashboard size={18} /> Course Overview
          </Link>
        ) : (
          <Link href={`/course/${courseId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', color: pathname === `/course/${courseId}` ? 'var(--color-accent)' : 'var(--color-text-muted)', backgroundColor: pathname === `/course/${courseId}` ? 'rgba(255, 138, 61, 0.1)' : 'transparent', transition: 'all 0.2s' }} title="Course Overview" onMouseEnter={(e) => pathname !== `/course/${courseId}` && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')} onMouseLeave={(e) => pathname !== `/course/${courseId}` && (e.currentTarget.style.backgroundColor = 'transparent')}>
            <LayoutDashboard size={18} />
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {course.modules.map((module: any) => {
          const isOpen = openModules[module.id];
          return (
            <div key={module.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <button 
                onClick={() => !isSidebarCollapsed && toggleModule(module.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', padding: isSidebarCollapsed ? '1rem 0' : '1rem 1.5rem', background: 'none', border: 'none', color: 'var(--color-text)', cursor: isSidebarCollapsed ? 'default' : 'pointer', textAlign: 'left' }}
                title={isSidebarCollapsed ? `Module ${module.n}: ${module.title.replace(/^Module \d+:\s*/i, '')}` : undefined}
              >
                {!isSidebarCollapsed ? (
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {`Module ${module.n}`}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>
                      {module.title.replace(/^Module \d+:\s*/i, '')}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    M{module.n}
                  </div>
                )}
                {!isSidebarCollapsed && (isOpen ? <ChevronDown size={18} color="var(--color-text-muted)" /> : <ChevronRight size={18} color="var(--color-text-muted)" />)}
              </button>

              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', padding: isSidebarCollapsed ? '0.5rem 0 1rem' : '0.5rem 1.5rem 1rem' }}>
                  {module.lessons.map((lesson: any) => {
                    const href = `/course/${courseId}/lesson/${lesson.id}`;
                    const isActive = pathname === href;
                    return (
                      <Link 
                        key={lesson.id} 
                        href={href}
                        title={isSidebarCollapsed ? lesson.title : undefined}
                        style={{ 
                          display: 'flex', 
                          alignItems: isSidebarCollapsed ? 'center' : 'flex-start', 
                          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                          gap: '0.75rem', 
                          padding: isSidebarCollapsed ? '0' : '0.75rem 1rem', 
                          width: isSidebarCollapsed ? '40px' : 'auto',
                          height: isSidebarCollapsed ? '40px' : 'auto',
                          margin: isSidebarCollapsed ? '0 auto 0.5rem auto' : '0',
                          borderRadius: isSidebarCollapsed ? '10px' : '0.75rem',
                          color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                          textDecoration: 'none',
                          backgroundColor: isActive ? 'rgba(255, 138, 61, 0.15)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                        className="sidebar-lesson-link"
                      >
                        <div style={{ marginTop: isSidebarCollapsed ? 0 : '0.1rem', color: isActive ? 'var(--color-accent)' : (lesson.completed ? '#4ade80' : 'rgba(255,255,255,0.2)'), display: 'flex', alignItems: 'center' }}>
                          {lesson.completed ? <BookOpen size={isSidebarCollapsed ? 18 : 16} /> : <Book size={isSidebarCollapsed ? 18 : 16} />}
                        </div>
                        {!isSidebarCollapsed && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', lineHeight: 1.4, fontWeight: isActive ? 500 : 400 }}>{lesson.title}</span>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {lesson.hasPreview ? <PlayCircle size={10} /> : <FileText size={10} />}
                              {lesson.hasPreview ? 'Audio Lesson' : 'Reading'}
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        .sidebar-lesson-link:hover {
          background-color: rgba(255,255,255,0.08) !important;
          color: var(--color-text) !important;
        }
      `}</style>
    </div>
  );
}
