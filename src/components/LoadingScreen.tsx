export function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 700,
        letterSpacing: '-0.5px',
        color: 'var(--text-primary)',
      }}>
        Flow
      </div>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Setting up your workspace…</p>
    </div>
  );
}
