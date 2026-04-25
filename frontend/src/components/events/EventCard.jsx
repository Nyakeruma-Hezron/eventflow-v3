import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function EventCard({ event }) {
  const isLow = event.available_tickets > 0 && event.available_tickets <= 20

  return (
    <Link to={`/events/${event.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          transition: 'all 0.3s ease', cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'
          e.currentTarget.style.transform = 'translateY(-6px)'
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--clr-border)'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--clr-surface-2)' }}>
          {event.poster_url ? (
            <img src={event.poster_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'linear-gradient(135deg,var(--clr-surface-2),var(--clr-bg-2))' }}>🎪</div>
          )}
          {event.featured && <Badge label="⭐ Featured" color="var(--clr-primary)" left />}
          {event.is_free && <Badge label="FREE" color="var(--clr-success)" right={event.featured} />}
          {!event.available_tickets && <Badge label="Sold Out" color="#64748b" left />}
          {event.category && !event.featured && <Badge label={event.category.name} color="rgba(0,0,0,0.6)" right />}
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--clr-text-3)' }}>
              📅 {format(new Date(event.start_date), 'MMM d, yyyy')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--clr-text-3)' }}>
              🕐 {format(new Date(event.start_date), 'h:mm a')}
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-3)', marginBottom: 14 }}>by {event.organizer_name}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: event.is_free ? 'var(--clr-success)' : 'var(--clr-primary)' }}>
              {event.is_free ? 'FREE' : `KES ${Number(event.base_price).toLocaleString()}`}
            </div>
            <div style={{ fontSize: '0.8rem', color: isLow ? 'var(--clr-warning)' : 'var(--clr-text-3)' }}>
              {event.available_tickets > 0 ? (isLow ? `🔥 ${event.available_tickets} left` : `${event.available_tickets} available`) : 'Sold Out'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function Badge({ label, color, left, right }) {
  return (
    <span style={{
      position: 'absolute', top: 12,
      ...(left ? { left: 12 } : {}), ...(right ? { right: 12 } : {}),
      background: color, color: 'white', padding: '4px 12px',
      borderRadius: 40, fontSize: '0.75rem', fontWeight: 600,
      backdropFilter: 'blur(4px)',
    }}>{label}</span>
  )
}
