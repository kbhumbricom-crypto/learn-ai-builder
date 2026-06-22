import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Book, LayoutDashboard, User, Sparkles, PlayCircle } from 'lucide-react';
import type { Metadata } from 'next';
import ShareButton from './ShareButton';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    select: { title: true, tagline: true, instructor: { select: { name: true } } },
  });

  if (!course) {
    return { title: 'Course Not Found' };
  }

  const description = course.tagline || `Learn ${course.title} on Learn.ai`;

  return {
    title: `${course.title} | Learn.ai`,
    description,
    openGraph: {
      title: `${course.title} | Learn.ai`,
      description,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(course.title)}&instructor=${encodeURIComponent(course.instructor?.name || '')}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function CourseOverview({ params }: Props) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: true,
      modules: {
        include: { lessons: true },
        orderBy: { n: 'asc' }
      }
    }
  });

  if (!course) notFound();

  const persona = course.instructor?.persona ? JSON.parse(course.instructor.persona) : {};

  let uncompletedLessons = [];
  let totalLessons = 0;
  let completedLessons = 0;
  for (const module of course.modules) {
    totalLessons += module.lessons.length;
    for (const lesson of module.lessons) {
      if (lesson.completed) completedLessons++;
      if (!lesson.completed) {
        uncompletedLessons.push(lesson);
      }
    }
  }

  const nextLesson = uncompletedLessons[0] || null;
  const upcomingLessons = uncompletedLessons.slice(0, 3);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = progressPercent === 100;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'transparent', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle unique background just for the Overview page */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '80vh', background: 'radial-gradient(ellipse at top, rgba(255, 90, 31, 0.08) 0%, rgba(17, 17, 17, 0) 70%)', pointerEvents: 'none', zIndex: 0 }}></div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <main style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem 4rem' }}>
          
          <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
            <div>
              <h1 className="course-title" style={{ fontSize: 'clamp(1.85rem, 3vw, 2.5rem)', marginBottom: '0.5rem' }}>{course.title}</h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.5, maxWidth: '90%' }}>{course.tagline}</p>
            </div>
            <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
              <ShareButton />
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
            
            {/* Widget 1: Resume Learning (spans 2 columns) */}
            <div className="glass-card" style={{ gridColumn: 'span 2', padding: '2rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(255, 138, 61, 0.08) 0%, rgba(5,5,5,0.4) 100%)', border: '1px solid rgba(255, 138, 61, 0.15)', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', marginBottom: '1rem' }}>
                <PlayCircle size={16} /> 
                {completedLessons === 0 ? 'Start Your Journey' : isCompleted ? 'Course Completed' : 'Resume Learning'}
              </div>
              
              <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                {!isCompleted && nextLesson ? (
                  <>
                    <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>{nextLesson.title}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '80%' }}>Pick up exactly where you left off in your personalized curriculum.</p>
                    <Link href={`/course/${course.id}/lesson/${nextLesson.id}`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <PlayCircle size={18} /> {completedLessons === 0 ? 'Start First Lesson' : 'Continue Learning'}
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>You've mastered this course!</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>Great job completing all the lessons. You can always review the material.</p>
                  </>
                )}
              </div>
            </div>

            {/* Widget 2: Course Progress (spans 1 column) */}
            <div className="glass-card" style={{ gridColumn: 'span 1', padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={15} color="var(--color-accent)" /> Course Progress
              </h3>
              
              <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Overall Completion</span>
                  <span style={{ color: 'var(--color-accent)' }}>{progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '2rem' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--color-accent)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.2rem' }}>{completedLessons} <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ {totalLessons}</span></div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Lessons</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.2rem' }}>{course.modulesCount}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Modules</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Wide Instructor Profile (spans 2 columns) */}
            <div className="glass-card" style={{ gridColumn: 'span 2', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={15} color="var(--color-accent)" /> Your Instructor
              </h3>
              
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'stretch' }}>
                
                {/* Left Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ flexShrink: 0, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #FFB17A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                      <User size={28} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-text)', lineHeight: 1.2 }}>{course.instructor?.name}</p>
                      {course.instructor?.title && (
                        <p style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--color-text-muted)', 
                          marginTop: '0.3rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4,
                          paddingRight: '1rem'
                        }}>
                          {course.instructor.title}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {persona.summary && (
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--color-accent)', paddingLeft: '1rem', margin: 0 }}>"{persona.summary}"</p>
                  )}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>

                {/* Right Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {persona.voice && (
                    <div>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem' }}>
                        Speaking Style
                      </strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {persona.voice.map((v: string, i: number) => (
                          <span key={i} className="tag-pill" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {persona.signatures && (
                    <div>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(245, 239, 230, 0.6)', marginBottom: '0.75rem' }}>
                        Signatures
                      </strong>
                      <ul style={{ fontSize: '0.85rem', paddingLeft: '0', listStyle: 'none', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0 }}>
                        {persona.signatures.map((s: string, i: number) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.4 }}>
                            <span style={{ color: 'rgba(255,255,255,0.2)', marginTop: '0.1rem' }}>•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Widget 4: Quick Syllabus (spans 1 column) */}
            <div className="glass-card" style={{ gridColumn: 'span 1', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Book size={15} color="var(--color-accent)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Syllabus Queue</h3>
              </div>

              {upcomingLessons.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {upcomingLessons.map((lesson: any, index: number) => (
                    <Link key={lesson.id} href={`/course/${course.id}/lesson/${lesson.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0.85rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', transition: 'background-color 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: index === 0 ? 'var(--color-accent)' : 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>
                        <PlayCircle size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: '0.2rem' }}>{lesson.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                           {index === 0 ? 'Up Next' : 'In Queue'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', margin: 'auto 0' }}>No more lessons in queue.</p>
              )}
            </div>

          </div>
        </main>
      </div>

      <style>{`
        .glass-card {
          background-color: rgba(5, 5, 5, 0.4);
          border-radius: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1);
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .course-title {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 4vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #FFD4B0, var(--orange-soft) 40%, var(--orange));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .lesson-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.2s ease;
          font-weight: 500;
          color: var(--color-text);
        }
        .lesson-item:hover {
          background-color: rgba(255, 138, 61, 0.05);
          border-color: rgba(255, 138, 61, 0.3);
          transform: translateY(-2px);
          color: var(--color-accent);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        
        .instructor-card {
          position: sticky;
          top: 2rem;
        }
        
        .tag-pill {
          font-size: 0.75rem;
          padding: 0.35rem 0.85rem;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
        }
        
        @media (max-width: 992px) {
          main {
            grid-template-columns: 1fr !important;
          }
          .instructor-card {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
