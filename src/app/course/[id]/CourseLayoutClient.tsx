'use client';

import { ReaderSettingsProvider } from './ReaderSettingsContext';
import { SidebarProvider, useSidebar } from './SidebarContext';
import CourseBlobs from './CourseBlobs';

function CourseLayoutInner({ sidebar, children }: { sidebar: React.ReactNode, children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#111111', color: 'var(--color-text)', position: 'relative' }}>
      <CourseBlobs />
      
      {/* Sidebar */}
      <div style={{
        width: isSidebarCollapsed ? '72px' : '320px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        backgroundColor: 'rgba(5,5,5,0.6)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {sidebar}
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flexGrow: 1, 
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: isSidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 320px)'
      }}>
        {children}
      </div>
    </div>
  );
}

export default function CourseLayoutClient({ sidebar, children }: { sidebar: React.ReactNode, children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ReaderSettingsProvider>
        <CourseLayoutInner sidebar={sidebar}>
          {children}
        </CourseLayoutInner>
      </ReaderSettingsProvider>
    </SidebarProvider>
  );
}
