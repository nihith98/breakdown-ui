import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    // Redirect to dashboard if user is logged in
    // (This will be handled by middleware in a real app)
  }

  return (
    <main style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>breakDown</h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Privacy-first expense splitting
        </p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Features</h2>
        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          <li>🔒 Privacy-first</li>
          <li>📐 Optimal splits</li>
          <li>👨‍👩‍👧‍👦 Family units</li>
          <li>🔄 Recurring bills</li>
        </ul>
      </div>

      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '0.5rem',
        border: '1px solid #ddd',
        marginBottom: '3rem',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Built for real groups</h2>
        <p>
          Trips, families, flat-mates — breakDown calculates the fewest
          transactions needed to settle every debt. Families settle as one
          unit. Recurring expenses auto-calculate. And we only ever ask for
          your username.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/login">
          <button style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
            Get Started
          </button>
        </Link>
      </div>

      <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem', color: '#999' }}>
        No email. No phone number. No tracking.
      </p>
    </main>
  );
}
