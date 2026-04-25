import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (data) => api.post('/auth/registration/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  googleAuth: (credential) => api.post('/auth/google/', { credential }),
  me: () => api.get('/users/me/'),
}

// ─── Events ───────────────────────────────────────────────────
export const eventsAPI = {
  list: (params) => api.get('/events/', { params }),
  featured: () => api.get('/events/featured/'),
  detail: (slug) => api.get(`/events/${slug}/`),
  create: (data) => api.post('/events/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (slug, data) => api.patch(`/events/${slug}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (slug) => api.delete(`/events/${slug}/`),
  myEvents: () => api.get('/events/my-events/'),
  categories: () => api.get('/events/categories/'),
  venues: () => api.get('/events/venues/'),
  addTicketType: (slug, data) => api.post(`/events/${slug}/tickets/`, data),
}

// ─── Bookings ─────────────────────────────────────────────────
export const bookingsAPI = {
  list: () => api.get('/bookings/'),
  create: (data) => api.post('/bookings/create/', data),
  detail: (ref) => api.get(`/bookings/${ref}/`),
  cancel: (ref, reason) => api.post(`/bookings/${ref}/cancel/`, { reason }),
}

// ─── Payments ─────────────────────────────────────────────────
export const paymentsAPI = {
  initiate: (data) => api.post('/payments/initiate/', data),
  status: (id) => api.get(`/payments/status/${id}/`),
}

// ─── Users ────────────────────────────────────────────────────
export const usersAPI = {
  updateProfile: (data) => api.patch('/users/me/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  becomeOrganizer: (data) => api.post('/users/become-organizer/', data),
}

export default api
