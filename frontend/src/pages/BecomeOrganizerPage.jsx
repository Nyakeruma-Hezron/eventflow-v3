import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

export default function BecomeOrganizerPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ organization_name: '', bio: user?.bio || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user?.is_verified_organizer) { navigate('/organizer/dashboard'); return null }

  const set = (k) => (e) => setForm({...form, [k]: e.target.value})

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await usersAPI.becomeOrganizer(form)
      updateUser(data)
      navigate('/organizer/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'640px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{width:'64px',height:'64px',background:'var(--primary-dim)',border:'2px solid rgba(249,115,22,0.3)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',margin:'0 auto 20px'}}>🎪</div>
          <h1 style={{fontSize:'1.75rem',marginBottom:'10px'}}>Become an Organizer</h1>
          <p style={{maxWidth:'460px',margin:'0 auto'}}>Join 200+ organizers on EventFlow. Create events, sell tickets, and grow your audience.</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'36px'}}>
          {[['💳','M-Pesa Payments','Accept payments directly from attendees via STK Push.'],['📊','Analytics Dashboard','Track bookings, revenue, and attendee data in real time.'],['🎟️','Flexible Tickets','Create multiple ticket types with custom pricing.'],['📧','Auto Notifications','Attendees receive booking confirmations with QR codes.']].map(([icon,title,desc]) => (
            <div key={title} className="card card-body" style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
              <span style={{fontSize:'1.3rem',flexShrink:0}}>{icon}</span>
              <div><strong style={{color:'var(--text)',display:'block',marginBottom:'3px',fontSize:'0.9rem'}}>{title}</strong><span style={{fontSize:'0.82rem',color:'var(--text-3)'}}>{desc}</span></div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{margin:0}}>Organizer Registration</h3></div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Organization / Business Name *</label><input type="text" className="form-control" value={form.organization_name} onChange={set('organization_name')} placeholder="e.g. Nairobi Events Co." required /></div>
              <div className="form-group"><label className="form-label">Phone Number *</label><input type="tel" className="form-control" value={form.phone} onChange={set('phone')} placeholder="0712 345 678" required /></div>
              <div className="form-group"><label className="form-label">About Your Organization</label><textarea className="form-control" value={form.bio} onChange={set('bio')} placeholder="Describe what kind of events you organize…" /></div>
              <div style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px',marginBottom:'20px',fontSize:'0.875rem',color:'var(--text-2)'}}>
                By registering, you agree to EventFlow's Terms of Service and Organizer Guidelines.
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? 'Submitting…' : 'Submit Organizer Application'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
