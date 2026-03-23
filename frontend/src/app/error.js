'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1 style={{ color: '#e63946' }}>Something went wrong</h1>
          <p>{error?.message || "Unexpected application error."}</p>

          <button
            onClick={() => reset()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#457b9d',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
