Here is the fully formatted Markdown code for your `README.md`. I have applied the proper syntax for tables, code blocks, lists, and headings so it will render perfectly on GitHub.

You can just copy the entire block below and paste it directly into your `README.md` file!

---

```markdown
# ⚡ EventFlow

A highly scalable, full-stack event management and ticketing platform designed for the Kenyan ecosystem.

EventFlow simplifies the complete lifecycle of event management. Built with a modern, decoupled architecture, it offers seamless user authentication via Google OAuth, dynamic role-based access control (User vs. Organizer), real-time ticket generation, and integrated mobile money payments via Safaricom's M-Pesa Daraja API.

## ✨ Key Features

* **Role-Based Workflows**: Distinct dashboards and permissions for standard users (attendees) and verified organizers.
* **Modern Authentication**: Secure JWT-based authentication coupled with Google Identity Services (OAuth 2.0).
* **Frictionless Payments**: Native integration with Safaricom M-Pesa (STK Push) for instant mobile checkout and automated callback processing.
* **Full-Stack Observability**: Integrated Prometheus & Grafana stack for real-time tracking of HTTP requests, database queries, and system health.
* **Containerized Infrastructure**: Fully Dockerized environments (Frontend, Backend, Database, Reverse Proxy, Telemetry) ensuring parity across development and production.

## 🏗️ Architecture & Tech Stack

EventFlow utilizes a decoupled micro-service approach, reverse-proxied through Nginx for routing and security.

### 🛠 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios |
| **Backend API** | Django 4.2, Django REST Framework (DRF) |
| **Database** | MySQL 8.0 |
| **Authentication** | SimpleJWT + Google OAuth 2.0 (ID Token Verification) |
| **Payments Integration** | Safaricom M-Pesa Daraja API |
| **Telemetry & Monitoring** | Prometheus, Grafana, django-prometheus |
| **Infrastructure & DevOps** | Docker, Docker Compose, Nginx |

### 📂 System Topology

```text
eventflow_v3/
├── backend/          # Django REST API (Business logic & Models)
├── frontend/         # React SPA (Client interface)
├── database/         # MySQL persistence layer
├── nginx/            # Reverse proxy & routing configurations
├── monitoring/       # Prometheus config & Grafana provisioning
├── docker-compose.yml
└── .env

```

## 🚀 Quick Start (Development Environment)

### Prerequisites

* Docker Desktop installed and running
* Git

### 1. Clone & Configure

```bash
git clone [https://github.com/Nyakeruma-Hezron/eventflow.git](https://github.com/Nyakeruma-Hezron/eventflow.git)
cd eventflow
cp .env.example .env

```

### 2. Environment Variables

Populate the newly created `.env` file with your specific credentials:

```env
# Database
MYSQL_DATABASE=eventflow
MYSQL_USER=eventflow_user
MYSQL_PASSWORD=secure_password
MYSQL_ROOT_PASSWORD=secure_root_password

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Payments
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379

# Telemetry
GRAFANA_ADMIN_PASSWORD=your_secure_password

```

### 3. Build & Initialize Containers

```bash
docker compose up --build -d

```

*(Note: Initial build will take a few minutes as it pulls base images and resolves dependencies).*

### 4. Database Migrations & Setup

Run the following commands to apply the database schema and create an administrative user:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser

```

### 5. Access the Platform

| Service | Local URL |
| --- | --- |
| **Frontend Application** | `http://localhost:5173` |
| **Backend API** | `http://localhost:8000/api` |
| **Django Admin Panel** | `http://localhost:8000/admin` |
| **Grafana Dashboard** | `http://localhost/grafana/` (If Nginx configured) |

## 📡 Core API Endpoints

The API is structured around RESTful principles. Below is a high-level overview of the primary modules.

### Authentication (`/api/auth/`)

* `POST /login/` - Standard Email/Password login (Returns JWT)
* `POST /registration/` - Create a new user account
* `POST /google/` - Verifies Google ID token and issues system JWT
* `POST /token/refresh/` - Refresh expired access tokens

### Event Management (`/api/events/`)

* `GET /` - List and filter public events
* `POST /` - Create a new event (Requires Verified Organizer Role)
* `GET /{slug}/` - Retrieve deep event details
* `POST /{slug}/tickets/` - Define ticket tiers for an event

### Booking & Ticketing (`/api/bookings/`)

* `POST /create/` - Reserve tickets
* `GET /` - Retrieve current user's booking history
* `GET /{ref}/` - Booking details and QR validation data

### Payment Processing (`/api/payments/`)

* `POST /initiate/` - Triggers M-Pesa STK push to the user's phone
* `POST /mpesa/callback/` - Webhook endpoint for Safaricom transaction confirmation

## 🔑 Authentication Flow (Google OAuth)

EventFlow utilizes Google Identity Services alongside a custom JWT implementation for a seamless, SPA-friendly auth flow:

1. Client interacts with the Google Sign-In widget.
2. Google authenticates the user and returns a secure ID Token directly to the React frontend.
3. React securely transmits this token to the backend (`/api/auth/google/`).
4. Django validates the cryptographic signature of the token against Google's public keys.
5. Upon verification, Django creates (or retrieves) the user and issues standard Access and Refresh JWTs.
6. The frontend stores these tokens to authorize subsequent API requests.

## 🔧 Developer Workflow & Commands

**Manage Containers:**

```bash
docker compose up -d        # Start detached
docker compose down         # Stop containers
docker compose down -v      # Stop containers and wipe volumes (Hard Reset)

```

**View Live Logs:**

```bash
docker compose logs -f backend
docker compose logs -f nginx

```

**Execute Backend Commands:**

```bash
docker compose exec backend python manage.py shell
docker compose exec backend pip install <package_name>

```

## 🌐 Production Considerations

When deploying to a production environment (VPS / Cloud Provider), ensure the following:

* **Security Settings**: Set `DEBUG=False` and configure secure `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.
* **Reverse Proxy**: Configure Nginx to enforce SSL/TLS (HTTPS). *Note: Safaricom M-Pesa callbacks require a valid HTTPS endpoint.*
* **Secrets Management**: Keep the `.env` file strictly out of version control. Rotate the Django `SECRET_KEY` and database credentials.
* **Static Assets**: Build the React frontend (`npm run build`) and serve the static files via Nginx or a CDN, rather than the Vite development server.

```

```
