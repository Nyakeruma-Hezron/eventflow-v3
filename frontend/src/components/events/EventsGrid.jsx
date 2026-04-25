import EventCard from './EventCard'

export default function EventsGrid({ events, loading, emptyMessage = 'No events found.' }) {
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
      {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  if (!events?.length) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '4rem', marginBottom: 24 }}>🔍</div>
      <h3 style={{ marginBottom: 12 }}>No events found</h3>
      <p style={{ color: 'var(--clr-text-3)' }}>{emptyMessage}</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--clr-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
      <div style={{ aspectRatio: '16/9', background: 'var(--clr-surface-2)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 12, background: 'var(--clr-surface-2)', borderRadius: 6, width: '60%' }} />
        <div style={{ height: 16, background: 'var(--clr-surface-2)', borderRadius: 6 }} />
        <div style={{ height: 14, background: 'var(--clr-surface-2)', borderRadius: 6, width: '80%' }} />
      </div>
    </div>
  )
}
