export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#efe9da',
    }}>
      <div style={{
        background: '#fff',
        padding: '3rem',
        borderRadius: '0.5rem',
        border: '1px solid #ddd',
        width: '100%',
        maxWidth: '400px',
      }}>
        {children}
      </div>
    </div>
  );
}
