import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// Checkout is handled inline on EventDetailPage — this redirects back
export default function CheckoutPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  useEffect(() => { navigate(`/events/${slug}`) }, [])
  return null
}
