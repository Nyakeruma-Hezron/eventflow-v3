import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { eventsAPI } from '../services/api'

export default function EventCreatePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title:'', short_description:'', description:'', category:'', venue:'',
    format:'in_person', online_link:'', start_date:'', end_date:'',
    total_capacity:'100', base_price:'0', is_free:false,
    min_tickets_per_booking:'1', max_tickets_per_booking:'10',
    tags:'', status:'draft', poster:null, banner:null,
  })

  useEffect(() => {
    Promise.all([eventsAPI.categories(), eventsAPI.venues()]).then(([c,v]) => {
      setCategories(c.data.results || c.data)
      setVenues(v.data.results || v.data)
    })
  }, [])

  const set = (k) => (e) => setForm({...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value})
  const setFile = (k) => (e) => setForm({...form, [k]: e.target.files[0]})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null && v !== '') fd.append(k, v) })
    try {
      const { data } = await eventsAPI.create(fd)
      navigate(`/events/${data.slug}`)
    } catch (err) {
      setErrors(err.response?.data || {})
    } finally {
      setLoading(false)
    }
  }

  const field = (k) => errors[k] ? <div className="form-error">{Array.isArray(errors[k]) ? errors[k][0] : errors[k]}</div> : null

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'860px'}}>
        <Link to="/organizer/dashboard" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'var(--text-3)',fontSize:'0.875rem',marginBottom:'20px'}}>← Dashboard</Link>
        <h1 style={{marginBottom:'8px',fontSize:'1.75rem'}}>Create New Event</h1>
        <p style={{marginBottom:'32px'}}>Fill in the details to publish your event on EventFlow.</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Basic Information</h3></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Event Title *</label><input type="text" className="form-control" value={form.title} onChange={set('title')} placeholder="e.g. Nairobi Jazz Festival 2025" required />{field('title')}</div>
              <div className="form-group"><label className="form-label">Short Description</label><textarea className="form-control" rows={2} value={form.short_description} onChange={set('short_description')} placeholder="Brief one-liner (shown in cards)" style={{minHeight:'60px'}} />{field('short_description')}</div>
              <div className="form-group"><label className="form-label">Full Description *</label><textarea className="form-control" value={form.description} onChange={set('description')} placeholder="Describe your event in detail…" required />{field('description')}</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Category</label><select className="form-control" value={form.category} onChange={set('category')}><option value="">Select…</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Format</label><select className="form-control" value={form.format} onChange={set('format')}><option value="in_person">In Person</option><option value="online">Online</option><option value="hybrid">Hybrid</option></select></div>
              </div>
              {(form.format === 'online' || form.format === 'hybrid') && <div className="form-group"><label className="form-label">Online Link</label><input type="url" className="form-control" value={form.online_link} onChange={set('online_link')} placeholder="https://meet.google.com/…" /></div>}
              <div className="form-group"><label className="form-label">Tags</label><input type="text" className="form-control" value={form.tags} onChange={set('tags')} placeholder="music, festival, nairobi (comma-separated)" /><p className="form-hint">Helps attendees discover your event</p></div>
            </div>
          </div>

          {/* Images */}
          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Images</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Poster (800×450px)</label><input type="file" className="form-control" accept="image/*" onChange={setFile('poster')} /></div>
                <div className="form-group"><label className="form-label">Banner (1200×400px)</label><input type="file" className="form-control" accept="image/*" onChange={setFile('banner')} /></div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Date & Time</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Start Date & Time *</label><input type="datetime-local" className="form-control" value={form.start_date} onChange={set('start_date')} required />{field('start_date')}</div>
                <div className="form-group"><label className="form-label">End Date & Time *</label><input type="datetime-local" className="form-control" value={form.end_date} onChange={set('end_date')} required />{field('end_date')}</div>
              </div>
              <div className="form-group"><label className="form-label">Venue</label><select className="form-control" value={form.venue} onChange={set('venue')}><option value="">No venue (online)</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}</select></div>
            </div>
          </div>

          {/* Tickets */}
          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Tickets & Pricing</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Total Capacity *</label><input type="number" className="form-control" value={form.total_capacity} onChange={set('total_capacity')} min={1} required /></div>
                <div className="form-group"><label className="form-label">Base Price (KES)</label><input type="number" className="form-control" value={form.base_price} onChange={set('base_price')} min={0} step={0.01} /></div>
              </div>
              <div className="form-group">
                <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}>
                  <input type="checkbox" checked={form.is_free} onChange={set('is_free')} />
                  <span className="form-label" style={{margin:0}}>This is a free event</span>
                </label>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card" style={{marginBottom:'28px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Publishing</h3></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={set('status')}><option value="draft">Save as Draft</option><option value="published">Publish Immediately</option></select><p className="form-hint">Drafts are not visible to the public</p></div>
            </div>
          </div>

          <div style={{display:'flex',gap:'14px'}}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? <><div className="spinner spinner-sm"></div> Creating…</> : 'Create Event'}</button>
            <Link to="/organizer/dashboard" className="btn btn-secondary btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
