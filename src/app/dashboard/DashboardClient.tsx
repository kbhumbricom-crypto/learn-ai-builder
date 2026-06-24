'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, CheckSquare, Square, X, Check } from 'lucide-react';

export default function DashboardClient({ courses }: { courses: any[] }) {
  const router = useRouter();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const getCourseProgress = (course: any) => {
    let totalLessons = 0;
    let completedLessons = 0;
    course.modules.forEach((module: any) => {
      totalLessons += module.lessons.length;
      module.lessons.forEach((lesson: any) => {
        if (lesson.completed) completedLessons++;
      });
    });
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleCourseSelection = (id: string, e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
    }
  };

  const selectAll = () => {
    if (selectedIds.size === courses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(courses.map(c => c.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} course(s)?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await fetch('/api/course/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: Array.from(selectedIds) })
      });
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error('Failed to delete courses:', error);
      alert('Failed to delete courses. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          {courses.length} enrolled {courses.length === 1 ? 'course' : 'courses'}
        </h2>

        {courses.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isSelectionMode ? (
              <>
                <button onClick={selectAll} className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {selectedIds.size === courses.length ? <CheckSquare size={14} style={{ marginRight: '0.4rem' }} /> : <Square size={14} style={{ marginRight: '0.4rem' }} />}
                  {selectedIds.size === courses.length ? 'Deselect All' : 'Select All'}
                </button>
                <button 
                  onClick={deleteSelected} 
                  disabled={selectedIds.size === 0 || isDeleting}
                  className="btn" 
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: selectedIds.size > 0 ? 'rgba(255, 51, 0, 0.2)' : 'rgba(255,255,255,0.05)', color: selectedIds.size > 0 ? '#ff6b6b' : 'var(--color-text-muted)', border: selectedIds.size > 0 ? '1px solid rgba(255, 51, 0, 0.4)' : '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Trash2 size={14} style={{ marginRight: '0.4rem' }} />
                  {isDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
                </button>
                <button onClick={toggleSelectionMode} className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: 'var(--color-text-muted)' }}>
                  <X size={14} style={{ marginRight: '0.25rem' }} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={toggleSelectionMode} className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CheckSquare size={14} style={{ marginRight: '0.4rem' }} /> Manage Courses
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 md:gap-8">
        {courses.map(course => {
          const progress = getCourseProgress(course);
          const isSelected = selectedIds.has(course.id);

          return (
            <Link 
              key={course.id} 
              href={isSelectionMode ? '#' : `/course/${course.id}`} 
              onClick={(e) => toggleCourseSelection(course.id, e)}
              onMouseMove={handleMouseMove}
              className="glass-card course-card magnetic-card"
              style={{
                borderColor: isSelected ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? '0 12px 32px rgba(255, 138, 61, 0.15)' : '',
                transform: isSelected ? 'translateY(-4px)' : '',
                position: 'relative'
              }}
            >
              {isSelectionMode && (
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.3)', backgroundColor: isSelected ? 'var(--color-accent)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <Check size={16} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: isSelectionMode && !isSelected ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
                <div style={{ flexGrow: 1 }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                    {course.instructor?.name ? `TAUGHT BY ${course.instructor.name}` : 'PERSONALIZED COURSE'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '1rem', paddingRight: isSelectionMode ? '2rem' : '0' }}>
                    {course.title}
                  </h3>
                  {course.tagline && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.tagline}
                    </p>
                  )}
                </div>
                
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-accent)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        {courses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1.5rem' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>You haven't generated any courses yet.</p>
            <Link href="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem' }}>
              Generate your first course
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
