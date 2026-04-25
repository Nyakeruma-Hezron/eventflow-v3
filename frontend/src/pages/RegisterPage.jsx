import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleButton from '../components/auth/GoogleButton'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '', password1: '', password2: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({...form, [k]: e.target.value})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password1 !== form.password2) { setErrors({ password2: 'Passwords do not match.' }); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data || {}
      setErrors(typeof data === 'object' ? data : { general: String(data) })
    } finally {
      setLoading(false)
    }
  }

  const field = (k) => errors[k] ? <div className="form-error">{Array.isArray(errors[k]) ? errors[k][0] : errors[k]}</div> : null

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div className={styles.visualContent}>
          <div style={{fontSize:'3rem',marginBottom:'16px'}}>🚀</div>
          <h1 className={styles.visualTitle}>Join EventFlow</h1>
          <p className={styles.visualDesc}>Create your free account and start discovering amazing events happening across Kenya.</p>
        </div>
      </div>

      <div className={styles.formWrap}>
        <div className={styles.formBox}>
          <div className={styles.mobileLogo}>
            <div style={{fontSize:'2rem'}}>⚡</div>
            <div className={styles.mobileBrand}>EventFlow</div>
          </div>

          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>Free forever. No credit card needed.</p>

          <GoogleButton onSuccess={() => navigate('/')} label="Sign up with Google" />
          <div className="divider">or register with email</div>

          {errors.general && <div className="alert alert-error">{errors.general}</div>}
          {errors.non_field_errors && <div className="alert alert-error">{errors.non_field_errors[0]}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" placeholder="John" value={form.first_name} onChange={set('first_name')} required />
                {field('first_name')}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              {field('email')}
            </div>
            <div className="form-group">
              <label className="form-label">Phone (for M-Pesa)</label>
              <input type="tel" className="form-control" placeholder="0712 345 678" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Min 8 chars" value={form.password1} onChange={set('password1')} required />
                {field('password1')}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input type="password" className="form-control" placeholder="Repeat" value={form.password2} onChange={set('password2')} required />
                {field('password2')}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner spinner-sm"></div> Creating…</> : 'Create My Account'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
