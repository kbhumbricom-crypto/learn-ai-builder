import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <SignUp 
        routing="path" 
        path="/sign-up"
        signInUrl="/progress" /* Optional: where to go if they click sign in, could be / */
        appearance={{
          variables: {
            colorBackground: 'transparent',
          },
          elements: {
            cardBox: { boxShadow: 'none', margin: 0 },
            card: { 
              backgroundColor: 'rgba(255, 255, 255, 0.02)', 
              boxShadow: 'var(--shadow-md)', 
              padding: '2.5rem 2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%',
              maxWidth: '32rem'
            },
            headerTitle: { color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.5rem' },
            headerSubtitle: { color: 'rgba(255, 255, 255, 0.7)' },
            footer: { background: 'transparent' },
            dividerLine: { background: 'rgba(255, 255, 255, 0.1)' },
            dividerText: { color: 'rgba(255, 255, 255, 0.7)' },
            footerActionText: { color: 'rgba(255, 255, 255, 0.7)' },
            formFieldLabel: { color: 'rgba(255, 255, 255, 0.8)' },
            identityPreviewText: { color: 'white' },
            socialButtonsBlockButtonText: { color: 'white', fontWeight: 600 },
            socialButtonsBlockButton: { 
              border: '1px solid rgba(255, 255, 255, 0.15)', 
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              transition: 'all 0.2s ease'
            }
          }
        }}
      />
    </div>
  );
}
