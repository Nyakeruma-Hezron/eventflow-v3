import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import LoadingScreen from './components/common/LoadingScreen'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import EventCreatePage from './pages/EventCreatePage'
import EventEditPage from './pages/EventEditPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import DashboardPage from './pages/DashboardPage'
import OrganizerDashboardPage from './pages/OrganizerDashboardPage'
import ProfilePage from './pages/ProfilePage'
import BecomeOrganizerPage from './pages/BecomeOrganizerPage'
import NotFoundPage from './pages/NotFoundPage'

// Route guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return !user ? children : <Navigate to="/" replace />
}

function OrganizerRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_organizer) return <Navigate to="/become-organizer" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
        <Route path="/events/:slug" element={<PrivateRoute><EventDetailPage /></PrivateRoute>} />
        <Route path="/events/:slug/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/payment/:reference" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
        <Route path="/bookings/:reference" element={<PrivateRoute><BookingDetailPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/become-organizer" element={<PrivateRoute><BecomeOrganizerPage /></PrivateRoute>} />

        {/* Organizer routes */}
        <Route path="/organizer/dashboard" element={<OrganizerRoute><OrganizerDashboardPage /></OrganizerRoute>} />
        <Route path="/events/create" element={<OrganizerRoute><EventCreatePage /></OrganizerRoute>} />
        <Route path="/events/:slug/edit" element={<OrganizerRoute><EventEditPage /></OrganizerRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
