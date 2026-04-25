import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingsAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Smartphone, ShieldCheck } from 'lucide-react'

export default function PaymentPage() {
  const { reference } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentId, setPaymentId] = useState(null)
  const [status, setStatus] = useState('idle') // idle | waiting | success | failed
  const [error, setError] = useState('')
  const pollRef = useRef(null)

  useEffect(() => {
    bookingsAPI.detail(reference).then(({ data }) => {
      setBooking(data)
      setPhone(user?.phone || '')
    }).catch(() => navigate('/bookings')).finally(() => setLoading(false))
    return () => clearInterval(pollRef.current)
  }, [reference])

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setPaying(true)
    try {
      const { data } = await paymentsAPI.initiate({ booking_reference: reference, phone })
      setPaymentId(data.payment_id)
      setStatus('waiting')
      pollRef.current = setInterval(async () => {
        try {
          const { data: s } = await paymentsAPI.status(data.payment_id)
          if (s.status === 'completed') {
            clearInterval(pollRef.current)
            setStatus('success')
            setTimeout(() => navigate(`/bookings/${reference}`), 2000)
          } else if (s.status === 'failed') {
            clearInterval(pollRef.current)
            setStatus('failed')
          }
        } catch {}
      }, 5000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.')
      setPaying(false)
    }
  }

  if (loading) return <div className="page-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"></div></div>
  if (!booking) return null

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'860px'}}>
        <h1 style={{marginBottom:'32px',fontSize:'1.75rem'}}>Complete Payment</h1>

        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'28px',alignItems:'start'}}>
          <div>
            {status === 'idle' && (
              <div className="card">
                <div className="card-header">
                  <h3 style={{margin:0}}>M-Pesa Payment</h3>
                  <p style={{marginTop:'6px',fontSize:'0.875rem'}}>Enter your Safaricom M-Pesa number to receive the payment prompt.</p>
                </div>
                <div className="card-body">
                  <div style={{display:'flex',alignItems:'center',gap:'14px',background:'var(--surface-2)',borderRadius:'var(--radius)',padding:'14px',marginBottom:'22px'}}>
                    <div style={{width:'48px',height:'48px',background:'#00a651',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>💚</div>
                    <div>
                      <div style={{fontWeight:700,color:'var(--text)'}}>M-Pesa STK Push</div>
                      <div style={{fontSize:'0.82rem',color:'var(--text-3)'}}>Powered by Safaricom Daraja API · Instant & Secure</div>
                    </div>
                  </div>

                  {error && <div className="alert alert-error">{error}</div>}

                  <form onSubmit={handlePay}>
                    <div className="form-group">
                      <label className="form-label">M-Pesa Phone Number *</label>
                      <input type="tel" className="form-control" placeholder="0712 345 678" value={phone}
                        onChange={e => setPhone(e.target.value)} required />
                      <p className="form-hint">Enter any Kenyan format: 07XX, 254XX, or +254XX</p>
                    </div>
                    <div style={{background:'var(--surface-2)',borderRadius:'var(--radius)',padding:'16px',marginBottom:'20px'}}>
                      <p style={{fontWeight:600,color:'var(--text)',marginBottom:'10px',fontSize:'0.9rem'}}>How it works:</p>
                      {['Click "Pay Now" below','You will receive a pop-up prompt on your phone','Enter your M-Pesa PIN to authorise','Booking is confirmed automatically 🎉'].map((s,i) => (
                        <div key={i} style={{display:'flex',gap:'10px',fontSize:'0.85rem',color:'var(--text-2)',marginBottom:'7px'}}>
                          <span style={{color:'var(--primary)',fontWeight:700}}>{i+1}.</span><span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={paying}>
                      <Smartphone size={18} /> Pay KES {Number(booking.grand_total).toLocaleString()} via M-Pesa
                    </button>
                  </form>
                </div>
              </div>
            )}

            {status === 'waiting' && (
              <div className="card card-body" style={{textAlign:'center',padding:'48px'}}>
                <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'rgba(249,115,22,0.1)',border:'2px solid var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',margin:'0 auto 24px',animation:'pulse 2s infinite'}}>📱</div>
                <h2 style={{marginBottom:'12px'}}>Waiting for M-Pesa…</h2>
                <p>Check your phone for the payment prompt and enter your M-Pesa PIN.</p>
                <div style={{display:'flex',gap:'10px',justifyContent:'center',marginTop:'24px'}}>
                  {[...Array(4)].map((_,i) => <div key={i} style={{width:'10px',height:'10px',borderRadius:'50%',background:'var(--primary)',opacity:0.3,animation:`fade 1.2s ${i*0.3}s infinite`}}></div>)}
                </div>
                <p style={{marginTop:'24px',fontSize:'0.82rem',color:'var(--text-3)'}}>This page checks automatically every 5 seconds.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="card card-body" style={{textAlign:'center',padding:'48px'}}>
                <div style={{fontSize:'4rem',marginBottom:'20px'}}>✅</div>
                <h2 style={{marginBottom:'10px'}}>Payment Successful!</h2>
                <p>Your booking is confirmed. Redirecting to your ticket…</p>
                <div className="spinner" style={{margin:'20px auto'}}></div>
              </div>
            )}

            {status === 'failed' && (
              <div className="card card-body" style={{textAlign:'center',padding:'48px'}}>
                <div style={{fontSize:'4rem',marginBottom:'20px'}}>❌</div>
                <h2 style={{marginBottom:'10px'}}>Payment Failed</h2>
                <p style={{marginBottom:'24px'}}>The payment was not completed. Please try again.</p>
                <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                  <button className="btn btn-primary" onClick={() => { setStatus('idle'); setPaying(false) }}>Try Again</button>
                  <button className="btn btn-secondary" onClick={() => navigate('/bookings')}>My Bookings</button>
                </div>
              </div>
            )}
          </div>

          <div className="card card-body">
            <h3 style={{marginBottom:'18px',fontSize:'1rem'}}>Order Summary</h3>
            <div style={{fontWeight:600,color:'var(--text)',marginBottom:'6px'}}>{booking.event_detail?.title}</div>
            <div style={{fontSize:'0.82rem',color:'var(--text-3)',marginBottom:'18px',paddingBottom:'16px',borderBottom:'1px solid var(--border)'}}>{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.875rem',marginBottom:'8px'}}><span style={{color:'var(--text-2)'}}>Subtotal</span><span>KES {Number(booking.total_amount).toLocaleString()}</span></div>
            {booking.service_fee > 0 && <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.875rem',marginBottom:'14px',paddingBottom:'14px',borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--text-2)'}}>Service fee</span><span>KES {Number(booking.service_fee).toFixed(2)}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'1.05rem'}}><span>Total</span><span style={{color:'var(--primary)'}}>KES {Number(booking.grand_total).toLocaleString()}</span></div>
            <div style={{marginTop:'18px',display:'flex',alignItems:'center',gap:'7px',fontSize:'0.78rem',color:'var(--text-3)'}}><ShieldCheck size={13} style={{color:'var(--success)'}} /> Secured by Safaricom</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)}50%{box-shadow:0 0 0 12px rgba(249,115,22,0)}}@keyframes fade{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )
}
