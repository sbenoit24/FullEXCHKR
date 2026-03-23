'use client';

export default function OfficerError({ error, reset }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2 style={{ color: '#2a9d8f' }}>Officer Dashboard Error</h2>
      <p>{error?.message || "An issue occurred in the officer section."}</p>

      <button
        onClick={() => reset()}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          background: '#1d3557',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Reload Section
      </button>
    </div>
  );
}
