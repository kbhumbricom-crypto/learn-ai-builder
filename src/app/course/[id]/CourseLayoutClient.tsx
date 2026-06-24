'use client';

import { ReaderSettingsProvider } from './ReaderSettingsContext';
import { SidebarProvider, useSidebar } from './SidebarContext';
import CourseBlobs from './CourseBlobs';

import { useEffect } from 'react';

function CourseLayoutInner({ sidebar, children }: { sidebar: React.ReactNode, children: React.ReactNode }) {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  }, [setIsSidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-[#111111] text-[var(--color-text)] relative">
      <CourseBlobs />
      
      {/* Overlay for mobile when sidebar is open */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex-shrink-0 h-screen flex flex-col z-50 bg-[rgba(5,5,5,0.85)] border-r border-white/10 backdrop-blur-xl transition-all duration-300 ease-in-out
        ${isSidebarCollapsed 
          ? 'w-[72px] sticky top-0' 
          : 'fixed inset-y-0 left-0 w-[85%] max-w-[320px] md:sticky md:top-0 md:w-[320px]'
        }
      `}>
        {sidebar}
      </div>

      {/* Main Content Area */}
      <div className={`
        flex-grow relative transition-all duration-300 ease-in-out
        ${isSidebarCollapsed 
          ? 'w-[calc(100%-72px)]' 
          : 'w-full md:w-[calc(100%-320px)]'
        }
      `}>
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
