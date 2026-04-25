import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', bio: user?.bio || '', organization_name: user?.organization_name || '', avatar: null })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({...form, [k]: e.target.value})

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess(false); setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    try {
      const { data } = await usersAPI.updateProfile(fd)
      updateUser(data); setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'680px'}}>
        <h1 style={{marginBottom:'8px',fontSize:'1.75rem'}}>My Profile</h1>
        <p style={{marginBottom:'32px'}}>Manage your personal information.</p>

        <div className="card">
          <div className="card-header" style={{display:'flex',alignItems:'center',gap:'18px'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.75rem',fontWeight:700,color:'white',flexShrink:0}}>
              {user?.avatar_url ? <img src={user.avatar_url} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} /> : user?.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 style={{margin:0}}>{user?.first_name} {user?.last_name}</h3>
              <p style={{margin:'4px 0 8px',fontSize:'0.875rem'}}>{user?.email}</p>
              <span className={`badge badge-${user?.role === 'organizer' ? 'primary' : 'info'}`}>{user?.role}</span>
            </div>
          </div>
          <div className="card-body">
            {success && <div className="alert alert-success">Profile updated successfully!</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-control" value={form.first_name} onChange={set('first_name')} /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-control" value={form.last_name} onChange={set('last_name')} /></div>
              </div>
              <div className="form-group"><label className="form-label">Phone</label><input type="tel" className="form-control" value={form.phone} onChange={set('phone')} placeholder="0712 345 678" /><p className="form-hint">Used for M-Pesa payments</p></div>
              <div className="form-group"><label className="form-label">Profile Picture</label><input type="file" className="form-control" accept="image/*" onChange={e => setForm({...form, avatar: e.target.files[0]})} /></div>
              <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself…" /></div>
              {user?.is_organizer && <div className="form-group"><label className="form-label">Organization Name</label><input type="text" className="form-control" value={form.organization_name} onChange={set('organization_name')} /></div>}
              <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
