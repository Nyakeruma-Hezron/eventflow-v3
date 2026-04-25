import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Flame } from 'lucide-react'
import { format } from 'date-fns'
import styles from './EventCard.module.css'

export default function EventCard({ event }) {
  const start = new Date(event.start_date)
  const isLow = event.available_tickets > 0 && event.available_tickets <= 20

  return (
    <Link to={`/events/${event.slug}`} className={styles.card}>
      <div className={styles.imgWrap}>
        {event.poster_url
          ? <img src={event.poster_url} alt={event.title} className={styles.img} loading="lazy" />
          : <div className={styles.imgPlaceholder}>🎪</div>
        }
        {event.featured && <span className={`${styles.badge} ${styles.featured}`}>⭐ Featured</span>}
        {event.is_free && <span className={`${styles.badge} ${styles.free}`} style={event.featured?{left:'auto',right:'12px'}:{}}>FREE</span>}
        {event.available_tickets === 0 && <span className={`${styles.badge} ${styles.soldOut}`}>Sold Out</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.metaItem}><Calendar size={13} />{format(start,'MMM d, yyyy')}</span>
          <span className={styles.metaItem}><Clock size={13} />{format(start,'h:mm a')}</span>
          {event.venue && <span className={styles.metaItem}><MapPin size={13} />{event.venue.city}</span>}
        </div>

        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.organizer}>by {event.organizer_name}</p>

        <div className={styles.footer}>
          <div className={event.is_free ? styles.priceFree : styles.price}>
            {event.is_free ? 'FREE' : `KES ${Number(event.base_price).toLocaleString()}`}
          </div>
          <div>
            {event.available_tickets === 0
              ? <span className="badge badge-default">Sold Out</span>
              : isLow
              ? <span className={styles.low}><Flame size={12} /> {event.available_tickets} left</span>
              : <span className={styles.avail}>{event.available_tickets} available</span>
            }
          </div>
        </div>
      </div>
    </Link>
  )
}
