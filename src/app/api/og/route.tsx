import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Untitled Course';
  const instructor = searchParams.get('instructor') || '';

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#07050A',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient accent */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 90, 31, 0.3), transparent 70%)',
          display: 'flex',
        }} />

        {/* Title */}
        <div style={{
          fontSize: '64px',
          fontWeight: 800,
          color: '#F5EFE6',
          lineHeight: 1.1,
          marginBottom: '24px',
          maxWidth: '900px',
          display: 'flex',
        }}>
          {title}
        </div>

        {/* Instructor */}
        {instructor && (
          <div style={{
            fontSize: '28px',
            color: 'rgba(245, 239, 230, 0.6)',
            marginBottom: '40px',
            display: 'flex',
          }}>
            Taught in the voice of {instructor}
          </div>
        )}

        {/* Branding */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '80px',
          fontSize: '24px',
          fontWeight: 700,
          color: '#FF8A3D',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ✨ Learn.ai
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
