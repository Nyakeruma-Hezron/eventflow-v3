# ⚡ EventFlow v3 — Full-Stack Event Booking Platform

A modern, production-ready event booking platform with separate **Frontend**, **Backend**, and **Database** layers, fully containerized with Docker.

## 🏗️ Architecture

```
eventflow_v3/
├── backend/          # Django REST API
├── frontend/         # React 18 + Vite SPA
├── database/         # MySQL init scripts
├── nginx/            # Reverse proxy config
├── docker-compose.yml
└── .env
```

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) + Google OAuth (ID token verification) |
| Database | MySQL 8.0 |
| Payments | Safaricom M-Pesa Daraja API (STK Push) |
| Proxy | Nginx |
| DevOps | Docker + Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone and configure
```bash
git clone <your-repo>
cd eventflow_v3
cp .env .env.local   # Keep a backup
```

### 2. Add your credentials to `.env`
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
```

### 3. Start everything
```bash
docker compose up --build
```

First run takes 3–5 minutes (downloads images, installs packages).

### 4. Set up the database
```bash
# In a new terminal:
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 5. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| Django Admin | http://localhost:8000/admin |
| Via Nginx | http://localhost |

---

## 🔑 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable "Google Identity"
3. OAuth Consent Screen → External → Fill details
4. Credentials → Create OAuth 2.0 Client ID → Web application
5. Add Authorized JavaScript Origins:
   ```
   http://localhost:5173
   http://localhost
   ```
6. Add Authorized Redirect URIs:
   ```
   http://localhost:5173
   ```
   > React handles the redirect — no backend callback needed with the ID token approach
7. Copy Client ID and Secret to `.env`

### How Google Auth Works (v3 approach)
Unlike the old approach (allauth redirects), v3 uses **Google Identity Services**:
```
User clicks "Sign in with Google"
  → Google pops up, user signs in
  → Google returns an ID token to the browser
  → Frontend sends token to /api/auth/google/
  → Backend verifies token using google-auth library
  → Backend returns JWT tokens
  → Frontend stores JWT and user is logged in
```
This is simpler, faster, and works perfectly with a React SPA.

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/login/              Email + password login → JWT
POST   /api/auth/registration/       Register new user → JWT
POST   /api/auth/google/             Google ID token → JWT
POST   /api/auth/logout/             Invalidate refresh token
POST   /api/auth/token/refresh/      Get new access token
```

### Users
```
GET    /api/users/me/                Get current user profile
PATCH  /api/users/me/                Update profile
POST   /api/users/become-organizer/  Upgrade to organizer role
```

### Events
```
GET    /api/events/                  List events (filterable)
POST   /api/events/                  Create event (organizer only)
GET    /api/events/featured/         Featured events
GET    /api/events/my-events/        Organizer's own events
GET    /api/events/categories/       List categories
GET    /api/events/venues/           List venues
GET    /api/events/{slug}/           Event detail
PATCH  /api/events/{slug}/           Update event (organizer only)
DELETE /api/events/{slug}/           Cancel event (organizer only)
POST   /api/events/{slug}/tickets/   Add ticket type
```

### Bookings
```
GET    /api/bookings/                My bookings
POST   /api/bookings/create/         Create booking
GET    /api/bookings/{ref}/          Booking detail
POST   /api/bookings/{ref}/cancel/   Cancel booking
```

### Payments
```
POST   /api/payments/initiate/           Start M-Pesa STK Push
GET    /api/payments/status/{id}/        Check payment status
POST   /api/payments/mpesa/callback/     M-Pesa webhook (Safaricom)
```

---

## 🔧 Development Commands

```bash
# Start all services
docker compose up

# Run in background
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Run Django management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell

# Install new Python package
docker compose exec backend pip install <package>
# Then add to backend/requirements.txt

# Install new npm package
docker compose exec frontend npm install <package>

# Rebuild a single service
docker compose up --build backend

# Stop everything
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v
```

---

## 📁 Project Structure Details

### Backend (`/backend`)
```
backend/
├── eventflow/          # Django project config
│   ├── settings.py     # All settings
│   └── urls.py         # Root URL config
├── apps/
│   ├── users/          # Custom user model, Google auth, JWT
│   ├── events/         # Event CRUD, categories, venues
│   ├── bookings/       # Booking engine, QR codes
│   └── payments/       # M-Pesa Daraja integration
├── Dockerfile
└── requirements.txt
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/       # GoogleButton
│   │   └── common/     # Navbar, EventCard, LoadingScreen
│   ├── context/
│   │   └── AuthContext.jsx   # JWT auth state + Google login
│   ├── pages/          # All page components
│   ├── services/
│   │   └── api.js      # Axios with JWT interceptors
│   └── styles/
│       └── global.css  # Design system
├── public/
│   └── index.html      # Loads Google Identity Services script
├── Dockerfile
├── vite.config.js
└── package.json
```

---

## 🌐 Production Deployment

To deploy to a VPS/cPanel:

1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```
   Deploy `dist/` folder to your static file server.

2. Configure backend environment:
   ```
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com
   MYSQL_HOST=localhost   # (not 'db' in production)
   ```

3. Update Google OAuth in Google Console:
   - Add production domain to Authorized Origins
   - Update `VITE_GOOGLE_CLIENT_ID` in frontend `.env`

4. Update M-Pesa:
   ```
   MPESA_ENVIRONMENT=production
   MPESA_SHORTCODE=your_real_shortcode
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback/
   ```

---

## 🔐 Security Notes

- Never commit `.env` to version control — it's in `.gitignore`
- Change all default passwords before production
- Set `DEBUG=False` in production
- Use HTTPS in production (SSL required for M-Pesa callbacks)
- Rotate `SECRET_KEY` in production

---

Built with ❤️ for the Kenyan events ecosystem.
