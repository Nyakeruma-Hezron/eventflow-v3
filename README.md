⚡ EventFlowA highly scalable, full-stack event management and ticketing platform designed for the Kenyan ecosystem.EventFlow simplifies the complete lifecycle of event management. Built with a modern, decoupled architecture, it offers seamless user authentication via Google OAuth, dynamic role-based access control (User vs. Organizer), real-time ticket generation, and integrated mobile money payments via Safaricom's M-Pesa Daraja API.✨ Key FeaturesRole-Based Workflows: Distinct dashboards and permissions for standard users (attendees) and verified organizers.Modern Authentication: Secure JWT-based authentication coupled with Google Identity Services (OAuth 2.0).Frictionless Payments: Native integration with Safaricom M-Pesa (STK Push) for instant mobile checkout and automated callback processing.Full-Stack Observability: Integrated Prometheus & Grafana stack for real-time tracking of HTTP requests, database queries, and system health.Containerized Infrastructure: Fully Dockerized environments (Frontend, Backend, Database, Reverse Proxy, Telemetry) ensuring parity across development and production.🏗️ Architecture & Tech StackEventFlow utilizes a decoupled micro-service approach, reverse-proxied through Nginx for routing and security.🛠 Technology StackLayerTechnologyFrontendReact 18, Vite, React Router v6, AxiosBackend APIDjango 4.2, Django REST Framework (DRF)DatabaseMySQL 8.0AuthenticationSimpleJWT + Google OAuth 2.0 (ID Token Verification)Payments IntegrationSafaricom M-Pesa Daraja APITelemetry & MonitoringPrometheus, Grafana, django-prometheusInfrastructure & DevOpsDocker, Docker Compose, Nginx📂 System TopologyPlaintexteventflow_v3/
├── backend/          # Django REST API (Business logic & Models)
├── frontend/         # React SPA (Client interface)
├── database/         # MySQL persistence layer
├── nginx/            # Reverse proxy & routing configurations
├── monitoring/       # Prometheus config & Grafana provisioning
├── docker-compose.yml
└── .env
🚀 Quick Start (Development Environment)PrerequisitesDocker Desktop installed and runningGit1. Clone & ConfigureBashgit clone https://github.com/yourusername/eventflow.git
cd eventflow
cp .env.example .env
2. Environment VariablesPopulate the newly created .env file with your specific credentials:Code snippet# Database
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
3. Build & Initialize ContainersBashdocker compose up --build -d
(Note: Initial build will take a few minutes as it pulls base images and resolves dependencies).4. Database Migrations & SetupRun the following commands to apply the database schema and create an administrative user:Bashdocker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
5. Access the PlatformServiceLocal URLFrontend Applicationhttp://localhost:5173Backend APIhttp://localhost:8000/apiDjango Admin Panelhttp://localhost:8000/adminGrafana Dashboardhttp://localhost/grafana/ (If Nginx configured)📡 Core API EndpointsThe API is structured around RESTful principles. Below is a high-level overview of the primary modules.Authentication (/api/auth/)POST /login/ - Standard Email/Password login (Returns JWT)POST /registration/ - Create a new user accountPOST /google/ - Verifies Google ID token and issues system JWTPOST /token/refresh/ - Refresh expired access tokensEvent Management (/api/events/)GET / - List and filter public eventsPOST / - Create a new event (Requires Verified Organizer Role)GET /{slug}/ - Retrieve deep event detailsPOST /{slug}/tickets/ - Define ticket tiers for an eventBooking & Ticketing (/api/bookings/)POST /create/ - Reserve ticketsGET / - Retrieve current user's booking historyGET /{ref}/ - Booking details and QR validation dataPayment Processing (/api/payments/)POST /initiate/ - Triggers M-Pesa STK push to the user's phonePOST /mpesa/callback/ - Webhook endpoint for Safaricom transaction confirmation🔑 Authentication Flow (Google OAuth)EventFlow utilizes Google Identity Services alongside a custom JWT implementation for a seamless, SPA-friendly auth flow:Client interacts with the Google Sign-In widget.Google authenticates the user and returns a secure ID Token directly to the React frontend.React securely transmits this token to the backend (/api/auth/google/).Django validates the cryptographic signature of the token against Google's public keys.Upon verification, Django creates (or retrieves) the user and issues standard Access and Refresh JWTs.The frontend stores these tokens to authorize subsequent API requests.🔧 Developer Workflow & CommandsManage Containers:Bashdocker compose up -d        # Start detached
docker compose down         # Stop containers
docker compose down -v      # Stop containers and wipe volumes (Hard Reset)
View Live Logs:Bashdocker compose logs -f backend
docker compose logs -f nginx
Execute Backend Commands:Bashdocker compose exec backend python manage.py shell
docker compose exec backend pip install <package_name>
🌐 Production ConsiderationsWhen deploying to a production environment (VPS / Cloud Provider), ensure the following:Security Settings: Set DEBUG=False and configure secure ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS.Reverse Proxy: Configure Nginx to enforce SSL/TLS (HTTPS). Note: Safaricom M-Pesa callbacks require a valid HTTPS endpoint.Secrets Management: Keep the .env file strictly out of version control. Rotate the Django SECRET_KEY and database credentials.Static Assets: Build the React frontend (npm run build) and serve the static files via Nginx or a CDN, rather than the Vite development server.Designed & Engineered by [Your Name / Alias] — [Portfolio Link / LinkedIn]