'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 2rem' }}>
      <h1>Something went wrong!</h1>
      <p style={{ margin: '1rem 0', color: '#666' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
