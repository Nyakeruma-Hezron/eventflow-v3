import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleButton from '../components/auth/GoogleButton'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div className={styles.visualContent}>
          <div className={styles.logo}>⚡</div>
          <h1 className={styles.visualTitle}>Welcome to<br /><span>EventFlow</span></h1>
          <p className={styles.visualDesc}>Kenya's #1 event booking platform. Discover concerts, conferences, festivals and more.</p>
          <div className={styles.features}>
            <div className={styles.featureItem}><span>🎟️</span><span>Instant M-Pesa ticket booking</span></div>
            <div className={styles.featureItem}><span>📱</span><span>QR code tickets sent to your email</span></div>
            <div className={styles.featureItem}><span>🎪</span><span>Host your own events as an organizer</span></div>
          </div>
        </div>
      </div>

      <div className={styles.formWrap}>
        <div className={styles.formBox}>
          <div className={styles.mobileLogo}>
            <div style={{fontSize:'2rem'}}>⚡</div>
            <div className={styles.mobileBrand}>EventFlow</div>
          </div>

          <h2 className={styles.title}>Sign in</h2>
          <p className={styles.subtitle}>Access your EventFlow account</p>

          <GoogleButton onSuccess={() => navigate(from, { replace: true })} />

          <div className="divider">or sign in with email</div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Your password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner spinner-sm"></div> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
