export default function Input({ label, error, hint, ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <label style={{ display: 'block', fontWeight: 500, color: 'var(--clr-text)', marginBottom: 8, fontSize: '0.9rem' }}>{label}</label>}
      <input
        style={{
          width: '100%', background: 'var(--clr-surface-2)',
          border: `1px solid ${error ? 'var(--clr-danger)' : 'var(--clr-border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '12px 16px',
          color: 'var(--clr-text)', fontSize: '0.9rem', outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--clr-primary)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--clr-danger)' : 'var(--clr-border)'}
        {...props}
      />
      {error && <p style={{ color: 'var(--clr-danger)', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
      {hint && !error && <p style={{ color: 'var(--clr-text-3)', fontSize: '0.8rem', marginTop: 6 }}>{hint}</p>}
    </div>
  )
}
