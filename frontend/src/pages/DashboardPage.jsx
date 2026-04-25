import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (user?.is_organizer) navigate('/organizer/dashboard', { replace: true })
  }, [user])
  if (user?.is_organizer) return null
  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'900px'}}>
        <h1 style={{marginBottom:'8px'}}>Welcome back, {user?.first_name}! 👋</h1>
        <p style={{marginBottom:'32px'}}>Here's your EventFlow dashboard.</p>
        <div className="stats-grid" style={{marginBottom:'32px'}}>
          {[['🎟️','My Bookings','/bookings'],['👤','My Profile','/profile'],['🎪','Browse Events','/events'],['⭐','Become Organizer','/become-organizer']].map(([icon,label,href]) => (
            <a key={href} href={href} className="card card-body" style={{textAlign:'center',cursor:'pointer',transition:'all 0.2s',textDecoration:'none'}}>
              <div style={{fontSize:'2rem',marginBottom:'10px'}}>{icon}</div>
              <div style={{fontWeight:600,color:'var(--text)'}}>{label}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
