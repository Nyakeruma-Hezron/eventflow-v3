import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventsAPI, bookingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Calendar, Clock, MapPin, Video, User, Eye, Ticket, Edit, X, Bell, ShieldCheck, Mail, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

export default function EventDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    eventsAPI.detail(slug).then(({ data }) => {
      setEvent(data)
      if (data.ticket_types?.length) setSelectedTicket(data.ticket_types[0])
    }).catch(() => navigate('/events')).finally(() => setLoading(false))
  }, [slug])

  const price = selectedTicket ? parseFloat(selectedTicket.price) : parseFloat(event?.base_price || 0)
  const total = price * quantity
  const fee = total > 0 ? total * 0.03 : 0
  const grandTotal = total + fee

  const isOrganizer = user?.id === event?.organizer_id
  const isAvailable = event?.is_available

  const handleBook = async () => {
    setError('')
    setBookingLoading(true)
    try {
      const { data } = await bookingsAPI.create({
        event_slug: slug,
        ticket_type_id: selectedTicket?.id || null,
        quantity,
        attendee_phone: user?.phone || '',
      })
      setBooking(data)
      if (data.status === 'pending' && grandTotal > 0) {
        navigate(`/payment/${data.reference}`)
      } else {
        navigate(`/bookings/${data.reference}`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div style={{paddingTop:'var(--nav-height)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"></div></div>
  if (!event) return null

  const start = new Date(event.start_date)
  const end = new Date(event.end_date)

  return (
    <div>
      {/* Hero */}
      <div style={{paddingTop:'var(--nav-height)',position:'relative',minHeight:'400px',display:'flex',alignItems:'flex-end'}}>
        <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
          {(event.banner_url || event.poster_url) && <img src={event.banner_url || event.poster_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.3,filter:'blur(1px)'}} />}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,var(--bg) 30%,rgba(8,12,20,0.7) 100%)'}}></div>
        </div>
        <div className="container" style={{position:'relative',zIndex:1,paddingBottom:'48px',paddingTop:'48px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px',flexWrap:'wrap'}}>
            {event.category && <span className="badge badge-primary">{event.category.name}</span>}
            <span className={`badge badge-${event.status === 'published' ? 'success' : event.status === 'cancelled' ? 'danger' : 'default'}`}>{event.status}</span>
            {event.is_free && <span className="badge badge-success">Free</span>}
            {event.format === 'online' && <span className="badge badge-info">Online</span>}
          </div>
          <h1 style={{fontSize:'clamp(1.75rem,4vw,3rem)',maxWidth:'800px',marginBottom:'18px'}}>{event.title}</h1>
          <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
            <span style={{display:'flex',alignItems:'center',gap:'7px',color:'var(--text-2)',fontSize:'0.9rem'}}><User size={15} />By <strong style={{color:'var(--text)'}}>{event.organizer_name}</strong></span>
            <span style={{display:'flex',alignItems:'center',gap:'7px',color:'var(--text-2)',fontSize:'0.9rem'}}><Eye size={15} />{event.views_count} views</span>
            {event.bookings_count > 0 && <span style={{display:'flex',alignItems:'center',gap:'7px',color:'var(--text-2)',fontSize:'0.9rem'}}><Ticket size={15} />{event.bookings_count} booked</span>}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:'40px',maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 80px'}}>

        {/* Left */}
        <div>
          {/* Info cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:'14px',marginBottom:'36px'}}>
            <div className="card card-body">
              <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'8px',color:'var(--primary)'}}><Calendar size={18} /><span style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Date & Time</span></div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--text)'}}>{format(start,'EEE, MMM d, yyyy')}</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-3)',marginTop:'3px'}}>{format(start,'h:mm a')} – {format(end,'h:mm a')}</div>
            </div>
            {event.venue && (
              <div className="card card-body">
                <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'8px',color:'var(--accent)'}}><MapPin size={18} /><span style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Venue</span></div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--text)'}}>{event.venue.name}</div>
                <div style={{fontSize:'0.85rem',color:'var(--text-3)',marginTop:'3px'}}>{event.venue.city}, {event.venue.country}</div>
              </div>
            )}
            {event.format === 'online' && !event.venue && (
              <div className="card card-body">
                <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'8px',color:'var(--accent)'}}><Video size={18} /><span style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Format</span></div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--text)'}}>Online Event</div>
                <div style={{fontSize:'0.85rem',color:'var(--text-3)',marginTop:'3px'}}>Link sent after booking</div>
              </div>
            )}
            {isOrganizer && (
              <div className="card card-body">
                <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'8px',color:'var(--success)'}}><Ticket size={18} /><span style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Availability</span></div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--text)'}}>{event.available_tickets} / {event.total_capacity}</div>
                <div style={{background:'var(--surface-2)',borderRadius:'3px',height:'5px',marginTop:'8px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${event.occupancy_percentage}%`,background:'linear-gradient(90deg,var(--success),var(--primary))',borderRadius:'3px'}}></div>
                </div>
                <div style={{fontSize:'0.75rem',color:'var(--text-3)',marginTop:'5px'}}>{event.occupancy_percentage}% sold</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{marginBottom:'36px'}}>
            <h2 style={{fontSize:'1.2rem',marginBottom:'16px'}}>About This Event</h2>
            <p style={{lineHeight:1.8,whiteSpace:'pre-line'}}>{event.description}</p>
          </div>

          {/* Tags */}
          {event.tags_list?.length > 0 && (
            <div style={{marginBottom:'36px'}}>
              <h3 style={{fontSize:'0.95rem',marginBottom:'14px'}}>Tags</h3>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {event.tags_list.map(tag => (
                  <Link key={tag} to={`/events?search=${tag}`} className="badge badge-default" style={{cursor:'pointer'}}>#{tag}</Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Widget */}
        <div>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'28px',position:'sticky',top:'calc(var(--nav-height) + 20px)'}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:800,color:event.is_free ? 'var(--success)' : 'var(--primary)',marginBottom:'20px'}}>
              {event.is_free ? 'Free' : `KES ${Number(event.base_price).toLocaleString()}`}
            </div>

            {/* Ticket types */}
            {event.ticket_types?.map(tt => (
              <div key={tt.id}
                onClick={() => setSelectedTicket(tt)}
                style={{background:'var(--surface-2)',border:`2px solid ${selectedTicket?.id === tt.id ? 'var(--primary)' : 'var(--border)'}`,borderRadius:'var(--radius)',padding:'14px',cursor:'pointer',marginBottom:'10px',transition:'all 0.2s',background:selectedTicket?.id === tt.id ? 'var(--primary-dim)' : 'var(--surface-2)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}>
                  <span style={{fontWeight:600}}>{tt.name}</span>
                  <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--primary)'}}>{parseFloat(tt.price) === 0 ? 'FREE' : `KES ${Number(tt.price).toLocaleString()}`}</span>
                </div>
                {tt.description && <p style={{fontSize:'0.8rem',margin:'0 0 4px'}}>{tt.description}</p>}
                <span style={{fontSize:'0.75rem',color:'var(--text-3)'}}>{tt.quantity_available} available</span>
              </div>
            ))}

            {/* Quantity */}
            {isAvailable && (
              <div style={{margin:'18px 0'}}>
                <label className="form-label">Quantity</label>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <button className="btn btn-secondary btn-sm" style={{width:'36px',height:'36px',padding:0,justifyContent:'center'}}
                    onClick={() => setQuantity(Math.max(event.min_tickets_per_booking, quantity - 1))}>−</button>
                  <input type="number" className="form-control" value={quantity} style={{textAlign:'center',width:'70px'}}
                    onChange={e => setQuantity(Math.min(event.max_tickets_per_booking, Math.max(event.min_tickets_per_booking, parseInt(e.target.value) || 1)))} />
                  <button className="btn btn-secondary btn-sm" style={{width:'36px',height:'36px',padding:0,justifyContent:'center'}}
                    onClick={() => setQuantity(Math.min(event.max_tickets_per_booking, quantity + 1))}>+</button>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            {grandTotal > 0 && isAvailable && (
              <div style={{background:'var(--surface-2)',borderRadius:'var(--radius)',padding:'14px',marginBottom:'18px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',color:'var(--text-2)',paddingBottom:'8px',borderBottom:'1px solid var(--border)',marginBottom:'8px'}}>
                  <span>{quantity} × ticket</span><span>KES {total.toLocaleString()}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',color:'var(--text-2)',paddingBottom:'8px',borderBottom:'1px solid var(--border)',marginBottom:'8px'}}>
                  <span>Service fee (3%)</span><span>KES {fee.toFixed(2)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,color:'var(--text)'}}>
                  <span>Total</span><span style={{color:'var(--primary)'}}>KES {grandTotal.toFixed(0)}</span>
                </div>
              </div>
            )}

            {error && <div className="alert alert-error" style={{marginBottom:'14px'}}>{error}</div>}

            {/* Action button */}
            {event.status === 'cancelled' ? (
              <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--radius)',padding:'14px',textAlign:'center',color:'var(--danger)',fontWeight:600}}>Event Cancelled</div>
            ) : isAvailable ? (
              <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={bookingLoading}>
                {bookingLoading ? <><div className="spinner spinner-sm"></div> Processing…</> : <><Ticket size={16} /> {event.is_free ? 'Reserve Free Ticket' : 'Book Now'}</>}
              </button>
            ) : (
              <div style={{background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px',textAlign:'center',color:'var(--text-3)'}}>Sold Out / Unavailable</div>
            )}

            {/* Organizer edit */}
            {isOrganizer && (
              <div style={{marginTop:'16px',paddingTop:'16px',borderTop:'1px solid var(--border)',display:'flex',gap:'8px'}}>
                <Link to={`/events/${slug}/edit`} className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}}><Edit size={14} /> Edit</Link>
              </div>
            )}

            {/* Trust signals */}
            <div style={{marginTop:'18px',display:'flex',flexDirection:'column',gap:'7px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'0.78rem',color:'var(--text-3)'}}><ShieldCheck size={13} style={{color:'var(--success)'}} /> Secure M-Pesa payment</div>
              <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'0.78rem',color:'var(--text-3)'}}><Mail size={13} style={{color:'var(--accent)'}} /> QR ticket sent to your email</div>
              <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'0.78rem',color:'var(--text-3)'}}><RefreshCw size={13} style={{color:'var(--warning)'}} /> Refundable 24h before event</div>
            </div>

            {/* Organizer card */}
            <div style={{marginTop:'20px',paddingTop:'20px',borderTop:'1px solid var(--border)'}}>
              <div style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-3)',marginBottom:'12px'}}>About the Organizer</div>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'white',flexShrink:0}}>{event.organizer_name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{fontWeight:600,color:'var(--text)',fontSize:'0.9rem'}}>{event.organizer_name}</div>
                  <div style={{fontSize:'0.78rem',color:'var(--text-3)',marginTop:'2px'}}>Event Organizer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
