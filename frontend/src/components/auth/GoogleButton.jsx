import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleButton({ onSuccess, label = 'Continue with Google' }) {
  const { googleLogin } = useAuth()
  const btnRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          await googleLogin(credential)
          if (onSuccess) onSuccess()
        } catch (err) {
          console.error('Google login error:', err)
        }
      },
    })

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 380,
      text: label.includes('up') ? 'signup_with' : 'signin_with',
    })
  }, [])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{padding:'12px',background:'var(--surface-2)',borderRadius:'var(--radius-sm)',textAlign:'center',color:'var(--text-3)',fontSize:'0.85rem',marginBottom:'4px'}}>
        Google OAuth not configured — add VITE_GOOGLE_CLIENT_ID to .env
      </div>
    )
  }

  return <div ref={btnRef} style={{marginBottom:'4px', display:'flex', justifyContent:'center'}}></div>
}
