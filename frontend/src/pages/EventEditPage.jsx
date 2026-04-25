import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsAPI } from '../services/api'

export default function EventEditPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(null)

  useEffect(() => {
    Promise.all([eventsAPI.detail(slug), eventsAPI.categories(), eventsAPI.venues()])
      .then(([ev, cat, ven]) => {
        const e = ev.data
        setForm({
          title: e.title, short_description: e.short_description || '',
          description: e.description, category: e.category?.id || '',
          venue: e.venue?.id || '', format: e.format, online_link: e.online_link || '',
          start_date: e.start_date?.slice(0, 16) || '', end_date: e.end_date?.slice(0, 16) || '',
          total_capacity: e.total_capacity, base_price: e.base_price,
          is_free: e.is_free, tags: e.tags || '', status: e.status,
          poster: null, banner: null,
        })
        setCategories(cat.data.results || cat.data)
        setVenues(ven.data.results || ven.data)
      }).catch(() => navigate('/organizer/dashboard'))
      .finally(() => setLoading(false))
  }, [slug])

  const set = (k) => (e) => setForm({...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value})
  const setFile = (k) => (e) => setForm({...form, [k]: e.target.files[0]})

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({}); setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null) fd.append(k, v) })
    try {
      await eventsAPI.update(slug, fd)
      navigate(`/events/${slug}`)
    } catch (err) {
      setErrors(err.response?.data || {})
    } finally { setSaving(false) }
  }

  const field = (k) => errors[k] ? <div className="form-error">{Array.isArray(errors[k]) ? errors[k][0] : errors[k]}</div> : null

  if (loading || !form) return <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"></div></div>

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'860px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'28px',flexWrap:'wrap',gap:'14px'}}>
          <div>
            <Link to={`/events/${slug}`} style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'var(--text-3)',fontSize:'0.875rem',marginBottom:'8px'}}>← Back to Event</Link>
            <h1 style={{fontSize:'1.75rem',marginBottom:'4px'}}>Edit Event</h1>
          </div>
          <Link to={`/events/${slug}`} className="btn btn-ghost" target="_blank">Preview</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Basic Information</h3></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Title</label><input type="text" className="form-control" value={form.title} onChange={set('title')} required />{field('title')}</div>
              <div className="form-group"><label className="form-label">Short Description</label><textarea className="form-control" rows={2} value={form.short_description} onChange={set('short_description')} style={{minHeight:'60px'}} /></div>
              <div className="form-group"><label className="form-label">Full Description</label><textarea className="form-control" value={form.description} onChange={set('description')} required />{field('description')}</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Category</label><select className="form-control" value={form.category} onChange={set('category')}><option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={set('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option></select></div>
              </div>
              <div className="form-group"><label className="form-label">Tags</label><input type="text" className="form-control" value={form.tags} onChange={set('tags')} placeholder="music, nairobi (comma-separated)" /></div>
            </div>
          </div>

          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Images</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Replace Poster</label><input type="file" className="form-control" accept="image/*" onChange={setFile('poster')} /></div>
                <div className="form-group"><label className="form-label">Replace Banner</label><input type="file" className="form-control" accept="image/*" onChange={setFile('banner')} /></div>
              </div>
            </div>
          </div>

          <div className="card" style={{marginBottom:'20px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Date & Time</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Start</label><input type="datetime-local" className="form-control" value={form.start_date} onChange={set('start_date')} required /></div>
                <div className="form-group"><label className="form-label">End</label><input type="datetime-local" className="form-control" value={form.end_date} onChange={set('end_date')} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Venue</label><select className="form-control" value={form.venue} onChange={set('venue')}><option value="">No venue</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}</select></div>
            </div>
          </div>

          <div className="card" style={{marginBottom:'28px'}}>
            <div className="card-header"><h3 style={{margin:0}}>Tickets & Pricing</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Capacity</label><input type="number" className="form-control" value={form.total_capacity} onChange={set('total_capacity')} min={1} /></div>
                <div className="form-group"><label className="form-label">Price (KES)</label><input type="number" className="form-control" value={form.base_price} onChange={set('base_price')} min={0} step={0.01} /></div>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}>
                <input type="checkbox" checked={form.is_free} onChange={set('is_free')} />
                <span className="form-label" style={{margin:0}}>Free event</span>
              </label>
            </div>
          </div>

          <div style={{display:'flex',gap:'14px'}}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving ? <><div className="spinner spinner-sm"></div> Saving…</> : 'Save Changes'}</button>
            <Link to={`/events/${slug}`} className="btn btn-secondary btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
