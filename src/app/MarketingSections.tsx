'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Video, BookOpen, User, GraduationCap, PenTool, Briefcase, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';

export default function MarketingSections({ onCtaClick }: { onCtaClick?: () => void }) {
  const [activeTab, setActiveTab] = useState('storyteller');
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
      }
    });
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div style={{ position: 'relative', backgroundColor: 'transparent', overflow: 'hidden' }}>

      {/* Background Flow Gradients */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '-10%', width: '70vmax', height: '70vmax',
          background: 'radial-gradient(circle, rgba(255, 138, 61, 0.1) 0%, rgba(255, 138, 61, 0) 60%)',
          borderRadius: '50%', filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '-20%', width: '80vmax', height: '80vmax',
          background: 'radial-gradient(circle, rgba(255, 90, 31, 0.08) 0%, rgba(255, 90, 31, 0) 60%)',
          borderRadius: '50%', filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '10%', width: '60vmax', height: '60vmax',
          background: 'radial-gradient(circle, rgba(255, 174, 0, 0.05) 0%, rgba(255, 174, 0, 0) 60%)',
          borderRadius: '50%', filter: 'blur(80px)'
        }} />
      </div>

      <style>{`
        .marketing-section {
          padding: 6rem clamp(1.5rem, 5vw, 2rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .marketing-content {
          max-width: 75rem;
          width: 100%;
          margin: 0 auto;
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.85rem;
          border: 1px solid rgba(255, 138, 61, 0.3);
          border-radius: 100px;
          background-color: rgba(255, 138, 61, 0.05);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent);
          margin-bottom: 1.5rem;
        }
        
        .browser-tab {
          position: relative;
          z-index: 1;
        }
        .browser-tab.active {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-left: 1px solid rgba(255,255,255,0.1);
          border-right: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          z-index: 2;
        }
        .section-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 3rem;
        }
        .section-title-dark {
          color: #f5efe6;
        }
        .title-accent {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(135deg, var(--orange-soft), var(--orange) 60%, var(--orange-deep));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        
        .marketing-glass-card {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1.5rem;
          padding: 2.5rem;
          transition: transform 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .marketing-glass-card:hover {
          transform: translateY(-4px) !important;
          background-color: rgba(255, 255, 255, 0.04);
        }
      `}</style>

      {/* SECTION 1: HOW IT WORKS (Dark) */}
      <section id="how-it-works" className="marketing-section">
        <motion.div 
          className="marketing-content" 
          style={{ textAlign: 'center' }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label">How It Works</div>
          <h2 className="section-title section-title-dark" style={{ maxWidth: '48rem', margin: '0 auto 4rem auto' }}>
            From URL to full course in about <span className="title-accent">60 seconds.</span>
          </h2>
          
          <div style={{ width: '100%', maxWidth: '900px', margin: '4rem auto 1.5rem auto', aspectRatio: '16/9', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
            <video 
              src="/learnai.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '3rem', opacity: 0.8 }}>
            Watch Learn.ai generate a complete, structured course from a single URL in real-time.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '2rem' }}>
            {/* Step 1 */}
            <motion.div className="marketing-glass-card magnetic-card" variants={fadeInUp}>
              <div className="section-label" style={{ marginBottom: '1rem' }}>Step 1</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>Paste any syllabus</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>A Maven bootcamp. An MIT OpenCourseWare page. A Coursera syllabus. If it has a curriculum, Learn.ai can read it.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="marketing-glass-card magnetic-card" variants={fadeInUp}>
              <div className="section-label" style={{ marginBottom: '1rem' }}>Step 2</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>Pick a persona</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Choose how your brain learns best. A storyteller, a coach, an analyst, or a friend who explains it plainly.</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="marketing-glass-card magnetic-card" variants={fadeInUp}>
              <div className="section-label" style={{ marginBottom: '1rem' }}>Step 3</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>Get a full course</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Modules, lessons, and summaries. Structured, written, and ready to read in a voice that resonates with you.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: THE REAL PROBLEM (Dark) */}
      <section className="marketing-section" style={{ paddingTop: '5rem' }}>
        <motion.div 
          className="marketing-content" 
          style={{ maxWidth: '48rem', textAlign: 'center' }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label">The Real Problem</div>
          <h2 className="section-title section-title-dark">
            You didn't fail the course.<br/>
            <span className="title-accent">The course failed you.</span>
          </h2>
          
          <div style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <p>You've been here before. You find a course that covers exactly what you want to learn. You start strong. By week two, you're behind. By week four, you've quietly given up. Not because you're lazy, but because the way it was taught just didn't click.</p>

            <p>The best teachers in the world don't just know their subject. They know how to read a room. They adjust their pace, their analogies, their tone until it lands. Most online courses do none of that. They're recorded once, for everyone, which means they're truly perfect for almost no one.</p>
          </div>

          <div style={{ marginTop: '5rem', paddingTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.3, color: '#f5efe6', letterSpacing: '-0.02em' }}>
              "The internet doesn't have a knowledge problem. It has a teaching problem."
            </h3>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: WHY NOTHING ELSE WORKS (Dark) */}
      <section className="marketing-section">
        <motion.div 
          className="marketing-content" 
          style={{ textAlign: 'center' }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label">Why Nothing Else Works</div>
          <h2 className="section-title section-title-dark" style={{ maxWidth: '56rem', margin: '0 auto 4rem auto' }}>
            More content isn't the answer. <span className="title-accent">Better teaching is.</span>
          </h2>
          
          <motion.div 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', textAlign: 'left' }}
            variants={staggerContainer}
          >
            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,138,61,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Search size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>You've tried Googling it</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#f5efe6' }}>Why it fails:</strong> You get fragments. No structure, no progression, no context for what matters and what doesn't.
              </p>
            </motion.div>
            
            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,138,61,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Video size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>You've tried YouTube</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#f5efe6' }}>Why it fails:</strong> 47 tabs later, you know a little about a lot and a lot about nothing.
              </p>
            </motion.div>

            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,138,61,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <BookOpen size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>You've tried online courses</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#f5efe6' }}>Why it fails:</strong> Great curriculum, wrong teacher. Or great teacher, wrong pace. It never quite fits.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            style={{ marginTop: '4rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', maxWidth: '40rem', margin: '4rem auto 0 auto' }}
            variants={fadeInUp}
          >
            Learn.ai doesn't add more content to the pile. It takes the content that already exists and teaches it the way that works for you.
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 4: SEE THE DIFFERENCE (Dark) */}
      <section className="marketing-section" style={{ paddingBottom: '10rem' }}>
        <motion.div 
          className="marketing-content" 
          style={{ textAlign: 'center' }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label">See The Difference</div>
          <h2 className="section-title section-title-dark" style={{ maxWidth: '48rem', margin: '0 auto 1.5rem auto' }}>
            Same topic. Four completely <span className="title-accent">different teachers.</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '40rem', margin: '0 auto 4rem auto', lineHeight: 1.6 }}>
            Let's take an example of "How compound interest works", taught by four different personas.
          </p>

          <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'left' }}>
            <div 
              ref={cardRef} 
              onMouseMove={handleMouseMove} 
              className="marketing-glass-card magnetic-card" 
              style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255, 138, 61, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              {/* Sleek Underline Tabs Header */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent' }}>
                {['Storyteller', 'Coach', 'Friend', 'Analyst'].map(tab => {
                  const id = tab.toLowerCase();
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      style={{
                        flex: 1,
                        padding: '1.25rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                        color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        marginBottom: '-1px'
                      }}
                    >
                      The {tab}
                    </button>
                  );
                })}
              </div>
              
              {/* Content Area */}
              <div style={{ padding: 'clamp(2rem, 5vw, 4rem)', minHeight: '260px', position: 'relative', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                {/* Visual decoration: Quote Mark */}
                <div style={{ position: 'absolute', top: 'clamp(1rem, 3vw, 2rem)', left: 'clamp(1rem, 3vw, 2rem)', opacity: 0.1, color: 'var(--color-accent)' }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21L16.411 14.5C16.892 13.06 17.5 11.5 18 10C18.172 9.474 18.259 8.949 18.259 8.423C18.259 6.533 16.726 5 14.836 5C12.946 5 11.413 6.533 11.413 8.423C11.413 8.653 11.451 8.878 11.523 9.094C11.979 10.457 12.639 11.758 13.486 12.955L14.017 21ZM5.017 21L7.411 14.5C7.892 13.06 8.5 11.5 9 10C9.172 9.474 9.259 8.949 9.259 8.423C9.259 6.533 7.726 5 5.836 5C3.946 5 2.413 6.533 2.413 8.423C2.413 8.653 2.451 8.878 2.523 9.094C2.979 10.457 3.639 11.758 4.486 12.955L5.017 21Z" />
                  </svg>
                </div>
                
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: 'relative', zIndex: 1, paddingLeft: 'clamp(0.5rem, 3vw, 1.5rem)' }}
                >
                  {activeTab === 'storyteller' && (
                    <p style={{ fontSize: 'clamp(1rem, 4vw, 1.45rem)', lineHeight: 1.8, fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', margin: 0 }}>
                      "Imagine you plant a single apple seed. It grows into a tree, which gives you 100 apples. You plant those. Now you have 100 trees. Each of those gives you 100 apples. That's compound interest. Your money isn't just growing, it's growing the thing that grows it. The longer you leave it alone, the more absurd the numbers get."
                    </p>
                  )}
                  {activeTab === 'coach' && (
                    <p style={{ fontSize: 'clamp(1rem, 4vw, 1.45rem)', lineHeight: 1.8, fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', margin: 0 }}>
                      "Most people lose at wealth because they interrupt the math. Compound interest is the only force that rewards extreme patience with extreme exponential returns. If you touch the money, you kill the compounding. Your only job is to put the money in the machine and refuse to look at it for twenty years. Got it?"
                    </p>
                  )}
                  {activeTab === 'friend' && (
                    <p style={{ fontSize: 'clamp(1rem, 4vw, 1.45rem)', lineHeight: 1.8, fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', margin: 0 }}>
                      "Okay, so compound interest sounds complicated, but it's basically just money making babies, and then those babies making babies. So instead of just getting $5 every year, your $5 starts earning its own money. It's super slow at first, which is why people quit, but suddenly ten years later it literally explodes."
                    </p>
                  )}
                  {activeTab === 'analyst' && (
                    <p style={{ fontSize: 'clamp(1rem, 4vw, 1.45rem)', lineHeight: 1.8, fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', margin: 0 }}>
                      "Compound interest operates on the formula A = P(1 + r/n)^(nt). Unlike simple interest, which only calculates returns on the principal, compound interest calculates returns on the accumulated total. This creates an exponential growth curve that accelerates significantly over longer time horizons."
                    </p>
                  )}
                </motion.div>
                
                {/* AI Generation Meta Tag */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ position: 'relative', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}
                >
                  <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--color-accent)', boxShadow: '0 0 10px var(--color-accent)' }} />
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    Re-taught by <span style={{ color: 'rgba(255,255,255,0.8)' }}>Learn.ai</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4.5: FACTUAL FOUNDATION (Dark) */}
      <section className="marketing-section">
        <motion.div 
          className="marketing-content" 
          style={{ textAlign: 'center' }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label">The Factual Foundation</div>
          <h2 className="section-title section-title-dark" style={{ maxWidth: '48rem', margin: '0 auto 4rem auto' }}>
            We don't invent facts.<br/>
            <span className="title-accent">We translate them.</span>
          </h2>
          
          <motion.div 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '1.5rem', 
              padding: 'clamp(2rem, 5vw, 4rem)', 
              textAlign: 'left', 
              maxWidth: '56rem', 
              margin: '0 auto',
              backdropFilter: 'blur(10px)'
            }}
            variants={cardVariant}
          >
            <p style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '4px solid var(--color-accent)', paddingLeft: 'clamp(1rem, 3vw, 1.5rem)' }}>
              "A common question we get: How do I know the information is actually legit?"
            </p>
            
            <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Learn.ai doesn't invent curriculum—it decodes it. By isolating the core principles of your source material, it preserves 100% of the academic rigor while completely reinventing the delivery.
            </p>
            
            <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
              It anchors itself to the established ground truth of the subject, ensuring no hallucinations or filler. You get the exact same concepts taught at top universities, just translated into a language your brain can actually absorb.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 5: WHO IT'S FOR (Dark) */}
      <section className="marketing-section">
        <motion.div 
          className="marketing-content" 
          style={{ textAlign: 'center' }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="section-label">Who It's For</div>
          <h2 className="section-title section-title-dark" style={{ maxWidth: '48rem', margin: '0 auto 4rem auto' }}>
            If you've ever given up on a course, <span className="title-accent">this is for you.</span>
          </h2>
          
          <motion.div 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left', maxWidth: '64rem', margin: '0 auto' }}
            variants={staggerContainer}
          >
            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,138,61,0.3)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <User size={18} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>The self-learner</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>You're motivated, curious, and you have a list of things you want to learn. You just need them taught in a way that doesn't put you to sleep by page three.</p>
            </motion.div>

            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,138,61,0.3)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <GraduationCap size={18} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>The student</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>Your professor is brilliant. Their lectures just don't click for you. Paste the course page and get the same material explained the way your brain actually processes it.</p>
            </motion.div>

            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,138,61,0.3)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <PenTool size={18} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>The educator</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>You need to build a 12-week curriculum and you have two weeks to do it. Use Learn.ai as a first-draft engine, structured, well-written, and ready to edit.</p>
            </motion.div>

            <motion.div className="marketing-glass-card magnetic-card" variants={cardVariant}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,138,61,0.3)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Briefcase size={18} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f5efe6' }}>The career switcher</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>You're learning something completely new, like data science, design, or finance. You need a teacher who meets you where you are, not where they wish you were.</p>
            </motion.div>

          </motion.div>
        </motion.div>

        {/* Manifesto Content (moved into the global marketing-section container) */}
        <motion.div
          className="marketing-content"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ maxWidth: '48rem', margin: '12rem auto 4rem auto', textAlign: 'center', position: 'relative', zIndex: 2 }}
        >
          <div className="section-label">
            Why This Matters
          </div>
          
          <h2 className="section-title section-title-dark">
            Everyone deserves<br/>
            a <span className="title-accent">great teacher.</span>
          </h2>
          
          <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.15rem)', lineHeight: 1.8, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <p>
              Think about the best teacher you ever had. The one who made a subject click that you'd written off as "not for you." The one whose explanations felt like they were written specifically for your brain.
            </p>
            <p>
              Most people get one teacher like that in their whole life. Maybe two. And usually, it's pure luck: the right class, the right year, the right school.
            </p>
            <p>
              The knowledge has always been there. Distributed across syllabuses, lectures, textbooks, and courses, in every subject, at every level.
              What's been missing is the teaching layer. The part that translates knowledge into understanding, for you specifically.
            </p>
            <div style={{ marginTop: '3.5rem', paddingTop: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: '#f5efe6', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                That's what Learn.ai is. Not a content library. A teaching layer. Built for the way you learn.
              </p>
            </div>
          </div>
        </motion.div>
      </section>


      {/* FINAL CTA SECTION */}
      <section style={{ position: 'relative', zIndex: 1, backgroundColor: 'transparent', paddingTop: '3.5rem', textAlign: 'center', overflow: 'hidden' }}>
        
        {/* Vibrant orange glow behind CTA */}
        <div style={{
          position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', width: '70vmax', height: '70vmax',
          background: 'radial-gradient(circle, rgba(255, 138, 61, 0.25) 0%, rgba(255, 138, 61, 0) 70%)',
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        {/* CTA Content */}
        <motion.div
          id="footer-cta"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2rem', paddingBottom: '8rem' }}
        >
          {/* Laptop Image FIRST */}
          <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto 3.4rem auto', position: 'relative' }}>
            <img 
              src="/mockup.png" 
              alt="Learn.ai interface" 
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }} 
            />
          </div>

          <h2 className="section-title section-title-dark" style={{ position: 'relative', zIndex: 2 }}>
            For years, students adapted to education.<br/>
            <span className="title-accent" style={{ color: '#ff8a3d', textShadow: '0 2px 10px rgba(0,0,0,0.22)' }}>Now, education adapts to students.</span>
          </h2>
          
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', maxWidth: '32rem', margin: '0 auto 3.5rem auto', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
            We believe the future of education is one where every learning experience is personalized to the individual.
          </p>

          <button 
            className="btn btn-primary"
            onClick={() => {
              if (onCtaClick) {
                onCtaClick();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              padding: '1.2rem 3.5rem', 
              fontSize: '1.05rem', 
              fontWeight: 700, 
              borderRadius: '1.25rem', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderTop: '1px solid rgba(255,255,255,0.3)', 
              textShadow: '0 1px 2px rgba(0,0,0,0.2)', 
              cursor: 'pointer', 
              zIndex: 2 
            }}
          >
            Get Early Access
          </button>
          
          <div style={{ marginTop: '1.5rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            LIMITED SPOTS AVAILABLE. JOIN THE WAITLIST TODAY.
          </div>
        </motion.div>
      </section>

      {/* ACTUAL FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, backgroundColor: '#0D0907', padding: '3rem 4rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '80rem', margin: '0 auto', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <Logo size={20} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f5efe6', letterSpacing: '-0.02em' }}>Learn.ai</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                {link}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', flex: 1, textAlign: 'right' }}>
            © 2025 Learn.ai. Made for curious people.
          </div>

        </div>
      </footer>
    </div>
  );
}
