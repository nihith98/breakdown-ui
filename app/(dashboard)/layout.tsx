import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav style={{
        width: '250px',
        background: '#313538',
        color: '#fff',
        padding: '2rem 1rem',
        borderRight: '1px solid #ddd',
      }}>
        <h2 style={{ marginBottom: '2rem' }}>
          <Link href="/groups" style={{ color: '#fff', textDecoration: 'none' }}>
            breakDown
          </Link>
        </h2>

        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          <li>
            <Link href="/groups" style={{ color: '#fff' }}>
              Groups
            </Link>
          </li>
          <li>
            <Link href="/settings" style={{ color: '#fff' }}>
              Settings
            </Link>
          </li>
          <li>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 0,
              }}>
                Logout
              </button>
            </form>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
