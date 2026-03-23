'use client';

export default function MemberError({ error, reset }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2 style={{ color: '#ffb703' }}>Member Area Error</h2>
      <p>{error?.message || "An issue occurred in the member section."}</p>

      <button
        onClick={() => reset()}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          background: '#023047',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
}
