import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsAPI, bookingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { Plus, BarChart2, Calendar, Users } from 'lucide-react'

export default function OrganizerDashboardPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsAPI.myEvents().then(({ data }) => setEvents(data.results || data)).finally(() => setLoading(false))
  }, [])

  const published = events.filter(e => e.status === 'published').length
  const totalBookings = events.reduce((s, e) => s + (e.bookings_count || 0), 0)

  const statusBadge = (s) => {
    const map = { published:'success', draft:'default', cancelled:'danger', completed:'info' }
    return <span className={`badge badge-${map[s]||'default'}`}>{s}</span>
  }

  if (loading) return <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"></div></div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
          <div>
            <h1 style={{marginBottom:'4px'}}>Organizer Dashboard</h1>
            <p>Welcome back, {user?.display_name}!</p>
          </div>
          <Link to="/events/create" className="btn btn-primary"><Plus size={16} /> Create Event</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{marginBottom:'32px'}}>
          {[[events.length,'Total Events','var(--primary)',Calendar],[published,'Published','var(--success)',BarChart2],[totalBookings,'Total Bookings','var(--accent)',Users]].map(([val,label,color,Icon]) => (
            <div key={label} className="card card-body" style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'18px',right:'18px',width:'38px',height:'38px',borderRadius:'var(--radius-sm)',background:`${color}22`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon size={18} style={{color}} />
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:800,color:'var(--text)'}}>{val}</div>
              <div style={{fontSize:'0.82rem',color:'var(--text-3)',marginTop:'4px'}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Events table */}
        <div className="card" style={{marginBottom:'28px'}}>
          <div className="card-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3 style={{margin:0}}>My Events</h3>
            <Link to="/events/create" className="btn btn-sm btn-secondary">+ Add</Link>
          </div>
          {events.length === 0 ? (
            <div className="card-body" style={{textAlign:'center',padding:'40px'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'14px'}}>🎪</div>
              <h3 style={{marginBottom:'8px'}}>No events yet</h3>
              <p>Create your first event and start selling tickets.</p>
              <Link to="/events/create" className="btn btn-primary" style={{marginTop:'16px'}}>Create Event</Link>
            </div>
          ) : (
            <div className="table-wrapper" style={{border:'none',borderRadius:0}}>
              <table>
                <thead><tr><th>Event</th><th>Date</th><th>Tickets</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                          {e.poster_url ? <img src={e.poster_url} alt="" style={{width:'40px',height:'30px',objectFit:'cover',borderRadius:'4px'}} /> : <div style={{width:'40px',height:'30px',background:'var(--surface-2)',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center'}}>🎪</div>}
                          <div>
                            <Link to={`/events/${e.slug}`} style={{fontWeight:600,color:'var(--text)',fontSize:'0.875rem'}}>{e.title.length > 35 ? e.title.slice(0,35)+'…' : e.title}</Link>
                            <div style={{fontSize:'0.75rem',color:'var(--text-3)'}}>{e.category?.name || 'No category'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{e.start_date ? format(new Date(e.start_date),'MMM d, yyyy') : '—'}</td>
                      <td><span style={{color:'var(--text)'}}>{e.bookings_count}</span><span style={{color:'var(--text-3)'}}> / {e.total_capacity}</span></td>
                      <td>{statusBadge(e.status)}</td>
                      <td>
                        <div style={{display:'flex',gap:'6px'}}>
                          <Link to={`/events/${e.slug}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                          <Link to={`/events/${e.slug}`} className="btn btn-sm btn-ghost">View</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
