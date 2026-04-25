export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  fullWidth = false, onClick, type = 'button', disabled, style,
}) {
  const sizes = { sm: '6px 14px', md: '10px 22px', lg: '14px 32px' }
  const variants = {
    primary: { background: 'var(--clr-primary)', color: 'white', border: 'none' },
    secondary: { background: 'var(--clr-surface)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)' },
    ghost: { background: 'transparent', color: 'var(--clr-text-2)', border: 'none' },
    danger: { background: 'rgba(239,68,68,0.15)', color: 'var(--clr-danger)', border: '1px solid rgba(239,68,68,0.3)' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: sizes[size],
        borderRadius: 'var(--radius-sm)', fontSize: size === 'lg' ? '1rem' : size === 'sm' ? '0.8rem' : '0.9rem',
        fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', width: fullWidth ? '100%' : 'auto',
        opacity: disabled || loading ? 0.6 : 1,
        ...variants[variant], ...style,
      }}
    >
      {loading ? <span className="spinner-sm" /> : children}
    </button>
  )
}
