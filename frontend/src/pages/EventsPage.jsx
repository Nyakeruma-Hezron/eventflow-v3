import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { eventsAPI } from '../services/api'
import EventCard from '../components/common/EventCard'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const params = Object.fromEntries(searchParams.entries())

  useEffect(() => {
    setLoading(true)
    Promise.all([
      eventsAPI.list(params),
      eventsAPI.categories(),
    ]).then(([ev, cat]) => {
      const data = ev.data
      setEvents(Array.isArray(data) ? data : data.results || [])
      setTotal(data.count || (Array.isArray(data) ? data.length : 0))
      setCategories(cat.data.results || cat.data)
    }).finally(() => setLoading(false))
  }, [searchParams.toString()])

  const update = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const clearAll = () => setSearchParams({})

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{marginBottom:'32px'}}>
          <h1 style={{marginBottom:'6px'}}>Discover Events</h1>
          <p><strong style={{color:'var(--text)'}}>{total}</strong> event{total !== 1 ? 's' : ''} found</p>
        </div>

        {/* Filter bar */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'20px',marginBottom:'28px'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:'14px',alignItems:'end',flexWrap:'wrap'}}>
            <div className="form-group" style={{margin:0}}>
              <div style={{position:'relative'}}>
                <Search size={16} style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)',pointerEvents:'none'}} />
                <input type="text" className="form-control" style={{paddingLeft:'38px'}} placeholder="Search events…"
                  value={params.search || ''} onChange={e => update('search', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{margin:0}}>
              <select className="form-control" value={params.category || ''} onChange={e => update('category', e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{margin:0}}>
              <select className="form-control" value={params.format || ''} onChange={e => update('format', e.target.value)}>
                <option value="">All Formats</option>
                <option value="in_person">In Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group" style={{margin:0}}>
              <select className="form-control" value={params.ordering || 'start_date'} onChange={e => update('ordering', e.target.value)}>
                <option value="start_date">Soonest First</option>
                <option value="-bookings_count">Most Popular</option>
                <option value="base_price">Price: Low–High</option>
                <option value="-base_price">Price: High–Low</option>
                <option value="-created_at">Newest</option>
              </select>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              {Object.keys(params).length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear</button>
              )}
            </div>
          </div>
          <div style={{marginTop:'12px',display:'flex',alignItems:'center',gap:'16px'}}>
            <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'0.875rem',color:'var(--text-2)'}}>
              <input type="checkbox" checked={params.is_free === 'true'} onChange={e => update('is_free', e.target.checked ? 'true' : '')} />
              Free events only
            </label>
          </div>
        </div>

        {/* Category pills */}
        <div style={{display:'flex',gap:'10px',overflowX:'auto',marginBottom:'28px',paddingBottom:'4px',scrollbarWidth:'none'}}>
          <button className={`btn btn-sm ${!params.category ? 'btn-primary' : 'btn-secondary'}`} onClick={() => update('category', '')}>All</button>
          {categories.map(c => (
            <button key={c.id} className={`btn btn-sm ${params.category === String(c.id) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => update('category', c.id)}>{c.name}</button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'60px 0'}}><div className="spinner"></div></div>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2 style={{marginBottom:'10px'}}>No events found</h2>
            <p>Try adjusting your filters or search terms.</p>
            <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={clearAll}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  )
}
