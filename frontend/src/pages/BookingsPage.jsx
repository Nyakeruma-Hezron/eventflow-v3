import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../services/api'
import { Calendar, Ticket, Hash } from 'lucide-react'
import { format } from 'date-fns'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingsAPI.list().then(({ data }) => setBookings(data.results || data)).finally(() => setLoading(false))
  }, [])

  const statusBadge = (s) => {
    const map = { confirmed:'success', pending:'warning', cancelled:'danger', refunded:'info' }
    return <span className={`badge badge-${map[s] || 'default'}`}>{s}</span>
  }

  if (loading) return <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"></div></div>

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
          <div><h1 style={{marginBottom:'4px'}}>My Bookings</h1><p>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p></div>
          <Link to="/events" className="btn btn-primary"><Ticket size={16} /> Find Events</Link>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <h2 style={{marginBottom:'10px'}}>No bookings yet</h2>
            <p>Discover and book your first event on EventFlow.</p>
            <Link to="/events" className="btn btn-primary" style={{marginTop:'20px'}}>Explore Events</Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {bookings.map(b => (
              <div key={b.id} className="card">
                <div style={{display:'flex',gap:'20px',alignItems:'center',padding:'20px',flexWrap:'wrap'}}>
                  <div style={{flexShrink:0}}>
                    {b.event_detail?.poster_url
                      ? <img src={b.event_detail.poster_url} alt="" style={{width:'88px',height:'64px',objectFit:'cover',borderRadius:'var(--radius-sm)'}} />
                      : <div style={{width:'88px',height:'64px',background:'var(--surface-2)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem'}}>🎪</div>
                    }
                  </div>
                  <div style={{flex:1,minWidth:'180px'}}>
                    <h3 style={{fontSize:'0.95rem',marginBottom:'7px'}}>
                      <Link to={`/events/${b.event_detail?.slug}`} style={{color:'var(--text)'}}>{b.event_detail?.title}</Link>
                    </h3>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'12px'}}>
                      <span style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.78rem',color:'var(--text-3)'}}><Calendar size={12} />{b.event_detail?.start_date ? format(new Date(b.event_detail.start_date),'MMM d, yyyy') : '—'}</span>
                      <span style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.78rem',color:'var(--text-3)'}}><Ticket size={12} />{b.quantity} ticket{b.quantity > 1 ? 's' : ''}</span>
                      <span style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'0.78rem',color:'var(--text-3)'}}><Hash size={12} />{b.reference}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1.05rem',fontWeight:700,color:Number(b.grand_total)===0?'var(--success)':'var(--primary)',marginBottom:'6px'}}>
                      {Number(b.grand_total)===0 ? 'FREE' : `KES ${Number(b.grand_total).toLocaleString()}`}
                    </div>
                    {statusBadge(b.status)}
                  </div>
                  <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                    <Link to={`/bookings/${b.reference}`} className="btn btn-sm btn-secondary">View</Link>
                    {b.status === 'pending' && <Link to={`/payment/${b.reference}`} className="btn btn-sm btn-primary">Pay Now</Link>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
