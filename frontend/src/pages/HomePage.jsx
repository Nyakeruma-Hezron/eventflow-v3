import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsAPI } from '../services/api'
import EventCard from '../components/common/EventCard'
import { Search, Zap, ArrowRight } from 'lucide-react'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      eventsAPI.featured(),
      eventsAPI.list({ ordering: 'start_date', page_size: 8 }),
      eventsAPI.categories(),
    ]).then(([f, u, c]) => {
      setFeatured(f.data.results || f.data)
      setUpcoming(u.data.results || [])
      setCategories(c.data.results || c.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{paddingTop:'var(--nav-height)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner"></div>
    </div>
  )

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {featured[0]?.banner_url && <img src={featured[0].banner_url} alt="" className={styles.heroBgImg} />}
          <div className={styles.heroGrad}></div>
          <div className={styles.heroGradBottom}></div>
        </div>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}><Zap size={14} /> Kenya's #1 Event Platform</div>
            <h1 className={styles.heroTitle}>
              Find Your Next<br />
              <span className={styles.highlight}>Unforgettable Experience</span>
            </h1>
            <p className={styles.heroDesc}>
              Concerts, conferences, workshops, festivals — discover and book tickets to thousands of events. Secure M-Pesa payments, instant confirmation.
            </p>
            <div className={styles.heroCta}>
              <Link to="/events" className="btn btn-primary btn-lg"><Search size={18} /> Explore Events</Link>
              <Link to="/become-organizer" className="btn btn-secondary btn-lg">Host an Event</Link>
            </div>
            <div className={styles.heroStats}>
              <div><div className={styles.statVal}>500+</div><div className={styles.statLabel}>Events</div></div>
              <div><div className={styles.statVal}>12K+</div><div className={styles.statLabel}>Attendees</div></div>
              <div><div className={styles.statVal}>M-Pesa</div><div className={styles.statLabel}>Payments</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{padding:'24px 0',borderBottom:'1px solid var(--border)'}}>
          <div className="container">
            <div className={styles.catStrip}>
              <Link to="/events" className={styles.catPill}>All Events</Link>
              {categories.map(c => (
                <Link key={c.id} to={`/events?category=${c.id}`} className={styles.catPill}>
                  {c.name}
                  <span className={styles.catCount}>{c.event_count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Featured Events</h2>
                <p>Hand-picked experiences worth your time</p>
              </div>
              <Link to="/events?featured=true" className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
            </div>
            <div className="events-grid">
              {featured.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className={styles.section} style={{paddingTop:0}}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>🔥 Upcoming Events</h2>
                <p>Don't miss what's coming up</p>
              </div>
              <Link to="/events" className="btn btn-ghost">All events <ArrowRight size={16} /></Link>
            </div>
            <div className="events-grid">
              {upcoming.slice(0,8).map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={styles.section} style={{paddingTop:0}}>
        <div className="container">
          <div className={styles.ctaBanner}>
            <div className={styles.ctaGlow}></div>
            <div style={{position:'relative',zIndex:1}}>
              <h2 style={{marginBottom:'10px'}}>Ready to Host Your Own Event?</h2>
              <p style={{maxWidth:'480px'}}>Join 200+ organizers on EventFlow. Create events, sell tickets, manage bookings — all in one place.</p>
            </div>
            <Link to="/become-organizer" className="btn btn-primary btn-lg" style={{position:'relative',zIndex:1}}>
              Become an Organizer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
