import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, ChevronDown, LayoutDashboard, Ticket, User, Briefcase, LogOut, Plus, BarChart2 } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserOpen(false) }, [location])

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span>
          <span className={styles.brandText}>EventFlow</span>
        </Link>

        <div className={styles.links}>
          <Link to="/events" className={styles.link}>Explore</Link>
          {/* FIXED: is_organizer changed to is_verified_organizer */}
          {user?.is_verified_organizer && <>
            <Link to="/organizer/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/events/create" className={styles.link}>+ Create</Link>
          </>}
        </div>

        <div className={styles.actions}>
          <div className={styles.userMenu} ref={dropRef}>
            <button className={styles.avatarBtn} onClick={() => setUserOpen(!userOpen)}>
              <div className={styles.avatar}>{user?.first_name?.[0]?.toUpperCase() || '?'}</div>
              <span className={styles.userName}>{user?.first_name}</span>
              <ChevronDown size={14} />
            </button>
            {userOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropHeader}>
                  <div className={styles.dropName}>{user?.first_name} {user?.last_name}</div>
                  <div className={styles.dropEmail}>{user?.email}</div>
                  {/* It is fine to check role='organizer' here since the backend explicitly sends it */}
                  <span className={`badge badge-${user?.role === 'organizer' ? 'primary' : 'info'}`}>{user?.role}</span>
                </div>
                <div className={styles.dropLinks}>
                  {/* FIXED: is_organizer changed to is_verified_organizer */}
                  {user?.is_verified_organizer ? <>
                    <Link to="/organizer/dashboard" className={styles.dropItem}><LayoutDashboard size={15} /> Organizer Dashboard</Link>
                    <Link to="/events/create" className={styles.dropItem}><Plus size={15} /> Create Event</Link>
                  </> : <>
                    <Link to="/dashboard" className={styles.dropItem}><LayoutDashboard size={15} /> My Dashboard</Link>
                    <Link to="/bookings" className={styles.dropItem}><Ticket size={15} /> My Bookings</Link>
                    <Link to="/become-organizer" className={styles.dropItem}><Briefcase size={15} /> Become Organizer</Link>
                  </>}
                  <Link to="/profile" className={styles.dropItem}><User size={15} /> Profile</Link>
                  <hr className={styles.divider} />
                  <button onClick={handleLogout} className={`${styles.dropItem} ${styles.danger}`}><LogOut size={15} /> Sign Out</button>
                </div>
              </div>
            )}
          </div>
          <button className={styles.mobileToggle} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/events" className={styles.mobileLink}>Explore Events</Link>
          {/* FIXED: is_organizer changed to is_verified_organizer */}
          {user?.is_verified_organizer ? <>
            <Link to="/organizer/dashboard" className={styles.mobileLink}>Dashboard</Link>
            <Link to="/events/create" className={styles.mobileLink}>+ Create Event</Link>
          </> : <>
            <Link to="/dashboard" className={styles.mobileLink}>My Dashboard</Link>
            <Link to="/bookings" className={styles.mobileLink}>My Bookings</Link>
            <Link to="/become-organizer" className={styles.mobileLink}>Become Organizer</Link>
          </>}
          <Link to="/profile" className={styles.mobileLink}>Profile</Link>
          <button onClick={handleLogout} className={styles.mobileLink} style={{color:'var(--danger)',textAlign:'left',background:'none',border:'none',cursor:'pointer',padding:'12px 16px',width:'100%',fontFamily:'var(--font-body)',fontSize:'1rem'}}>Sign Out</button>
        </div>
      )}
    </nav>
  )
}