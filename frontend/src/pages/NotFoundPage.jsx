import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'24px'}}>
      <div>
        <div style={{fontSize:'5rem',marginBottom:'24px'}}>🔍</div>
        <h1 style={{fontSize:'2rem',marginBottom:'12px'}}>Page Not Found</h1>
        <p style={{marginBottom:'28px'}}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
      </div>
    </div>
  )
}
