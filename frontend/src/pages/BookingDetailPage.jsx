import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bookingsAPI } from '../services/api'
import { format } from 'date-fns'
import { Calendar, MapPin, Ticket, CheckCircle, XCircle } from 'lucide-react'

export default function BookingDetailPage() {
  const { reference } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    bookingsAPI.detail(reference).then(({ data }) => setBooking(data)).catch(() => navigate('/bookings')).finally(() => setLoading(false))
  }, [reference])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true)
    try {
      const { data } = await bookingsAPI.cancel(reference, '')
      setBooking(data)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"></div></div>
  if (!booking) return null

  const start = booking.event_detail?.start_date ? new Date(booking.event_detail.start_date) : null
  const statusColors = { confirmed:'var(--success)', pending:'var(--warning)', cancelled:'var(--danger)' }

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'700px'}}>
        <Link to="/bookings" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'var(--text-3)',fontSize:'0.875rem',marginBottom:'24px'}}>← All Bookings</Link>

        {/* Reference card */}
        <div style={{background:`linear-gradient(135deg,var(--primary),#fb923c)`,borderRadius:'var(--radius-lg)',padding:'24px 28px',marginBottom:'20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{color:'rgba(255,255,255,0.75)',fontSize:'0.75rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'4px'}}>Booking Reference</div>
            <div style={{color:'white',fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:800,letterSpacing:'0.05em'}}>{booking.reference}</div>
          </div>
          <span className="badge" style={{background:'rgba(255,255,255,0.2)',color:'white',border:'1px solid rgba(255,255,255,0.4)',fontSize:'0.85rem',padding:'6px 14px'}}>
            {booking.status === 'confirmed' ? '✓ Confirmed' : booking.status}
          </span>
        </div>

        {/* Event info */}
        <div className="card" style={{marginBottom:'16px'}}>
          <div className="card-header"><h3 style={{margin:0}}>Event</h3></div>
          <div className="card-body">
            <div style={{display:'flex',gap:'16px',alignItems:'flex-start'}}>
              {booking.event_detail?.poster_url && <img src={booking.event_detail.poster_url} alt="" style={{width:'88px',height:'62px',objectFit:'cover',borderRadius:'var(--radius-sm)',flexShrink:0}} />}
              <div>
                <h3 style={{marginBottom:'10px',fontSize:'1rem'}}><Link to={`/events/${booking.event_detail?.slug}`} style={{color:'var(--text)'}}>{booking.event_detail?.title}</Link></h3>
                {start && <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
                  <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'0.875rem',color:'var(--text-2)'}}><Calendar size={14} />{format(start,'EEEE, MMMM d, yyyy')}</span>
                  {booking.event_detail?.venue && <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'0.875rem',color:'var(--text-2)'}}><MapPin size={14} />{booking.event_detail.venue.name}</span>}
                </div>}
              </div>
            </div>
          </div>
        </div>

        {/* Payment + Attendee */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
          <div className="card card-body">
            <h3 style={{fontSize:'0.9rem',marginBottom:'14px'}}>Payment</h3>
            <div style={{fontSize:'0.875rem',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-3)'}}>Tickets ({booking.quantity}×)</span><span>KES {Number(booking.total_amount).toLocaleString()}</span></div>
              {Number(booking.service_fee) > 0 && <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-3)'}}>Fee</span><span>KES {Number(booking.service_fee).toFixed(2)}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,color:'var(--text)',paddingTop:'8px',borderTop:'1px solid var(--border)'}}><span>Total</span><span style={{color:'var(--primary)'}}>{Number(booking.grand_total)===0?'FREE':`KES ${Number(booking.grand_total).toLocaleString()}`}</span></div>
            </div>
          </div>
          <div className="card card-body">
            <h3 style={{fontSize:'0.9rem',marginBottom:'14px'}}>Attendee</h3>
            <div style={{fontSize:'0.875rem',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div><div style={{color:'var(--text-3)',fontSize:'0.75rem'}}>Name</div><div>{booking.attendee_name}</div></div>
              <div><div style={{color:'var(--text-3)',fontSize:'0.75rem'}}>Email</div><div>{booking.attendee_email}</div></div>
              {booking.attendee_phone && <div><div style={{color:'var(--text-3)',fontSize:'0.75rem'}}>Phone</div><div>{booking.attendee_phone}</div></div>}
            </div>
          </div>
        </div>

        {/* QR Code */}
        {booking.qr_code && booking.status === 'confirmed' && (
          <div className="card card-body" style={{textAlign:'center',marginBottom:'16px'}}>
            <h3 style={{marginBottom:'16px',fontSize:'0.9rem'}}>Entry QR Code</h3>
            <div style={{background:'white',display:'inline-block',padding:'16px',borderRadius:'var(--radius)'}}>
              <img src={booking.qr_code} alt="QR Code" style={{width:'160px',height:'160px'}} />
            </div>
            <p style={{fontSize:'0.82rem',color:'var(--text-3)',marginTop:'10px'}}>Show at the event entrance for quick check-in.</p>
          </div>
        )}

        {/* Actions */}
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          {booking.status === 'pending' && <Link to={`/payment/${booking.reference}`} className="btn btn-primary"><Ticket size={16} /> Complete Payment</Link>}
          {booking.status === 'confirmed' && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              <XCircle size={16} /> {cancelling ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          )}
          <Link to="/bookings" className="btn btn-secondary">All Bookings</Link>
        </div>
      </div>
    </div>
  )
}
