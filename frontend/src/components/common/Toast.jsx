import { useState, useEffect } from 'react'

let toastFn = null

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = (msg, type = 'info') => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
  }, [])

  const colors = {
    success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: 'var(--clr-success)' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: 'var(--clr-danger)' },
    info: { bg: 'var(--clr-accent-dim)', border: 'rgba(59,130,246,0.3)', color: 'var(--clr-accent)' },
    warning: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', color: 'var(--clr-warning)' },
  }

  return (
    <div style={{ position: 'fixed', top: 'calc(var(--nav-height) + 16px)', right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '14px 18px', borderRadius: 'var(--radius)',
          border: `1px solid ${colors[t.type].border}`,
          background: colors[t.type].bg, color: colors[t.type].color,
          animation: 'fadeInUp 0.3s ease', fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span>{t.msg}</span>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, padding: 4 }}>✕</button>
        </div>
      ))}
    </div>
  )
}

export const toast = {
  success: (msg) => toastFn?.(msg, 'success'),
  error: (msg) => toastFn?.(msg, 'error'),
  info: (msg) => toastFn?.(msg, 'info'),
  warning: (msg) => toastFn?.(msg, 'warning'),
}
