'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Sidebar } from 'lucide-react';
import SidebarClient from './SidebarClient';
import { useSidebar } from './SidebarContext';

export default function SidebarWrapperClient({ course, courseId }: { course: any, courseId: string }) {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();

  return (
    <>
      {/* Sidebar Header */}
      <div style={{ padding: isSidebarCollapsed ? '1.5rem 0' : '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: isSidebarCollapsed ? 'center' : 'stretch', gap: isSidebarCollapsed ? '1.5rem' : '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSidebarCollapsed ? '0' : '1.5rem', flexDirection: isSidebarCollapsed ? 'column' : 'row', gap: isSidebarCollapsed ? '1.5rem' : '0' }}>
          {!isSidebarCollapsed ? (
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', transition: 'color 0.2s' }} title="My Courses">
              <ArrowLeft size={16} /> My Courses
            </Link>
          ) : (
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', width: '40px', height: '40px', borderRadius: '10px', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }} title="My Courses" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}>
              <ArrowLeft size={18} />
            </Link>
          )}
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ 
              background: isSidebarCollapsed ? 'rgba(255,255,255,0.02)' : 'none', 
              border: 'none', 
              color: 'var(--color-text-muted)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: isSidebarCollapsed ? '40px' : 'auto',
              height: isSidebarCollapsed ? '40px' : 'auto',
              borderRadius: isSidebarCollapsed ? '10px' : '0',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => isSidebarCollapsed && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => isSidebarCollapsed && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
          >
            <Sidebar size={18} />
          </button>
        </div>

        {!isSidebarCollapsed && (
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>{course.title}</h2>
        )}
      </div>

      {/* Curriculum Navigation */}
      <div style={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }} className={isSidebarCollapsed ? "no-scrollbar" : "custom-scrollbar"}>
        <div style={{ width: isSidebarCollapsed ? '72px' : '100%' }}>
          <SidebarClient course={course} courseId={courseId} />
        </div>
      </div>

      {/* Sidebar Footer */}
      <div style={{ padding: isSidebarCollapsed ? '1.5rem 0' : '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
        {!isSidebarCollapsed ? (
          <Link href={`/course/${courseId}/settings`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500, transition: 'color 0.2s' }} title="Course Settings">
            <Settings size={18} /> Course Settings
          </Link>
        ) : (
          <Link href={`/course/${courseId}/settings`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', width: '40px', height: '40px', borderRadius: '10px', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }} title="Course Settings" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}>
            <Settings size={18} />
          </Link>
        )}
      </div>
    </>
  );
}
