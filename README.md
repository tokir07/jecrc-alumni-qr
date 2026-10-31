# JECRC UNIVERSITY – ALUMNI DIWALI GET-TOGETHER 2026
## QR-Based Registration & Entry Management System

A production-ready, secure web application engineered for the **JECRC University Alumni Association's Diwali Get-Together 2026**.

The system streamlines the entire alumni lifecycle for the event:
1. **Public Alumni Registration**: Seamless registration collecting personal, academic, and professional details with duplicate prevention (normalized email and mobile numbers).
2. **Cryptographic QR Generation**: Generation of cryptographically secure random tokens, hashed via SHA-256 before storing in PostgreSQL. The QR payload contains only a secure verification URL—no personal alumni details are exposed in the QR code.
3. **Official Digital Pass**: Elegant, high-resolution printable and downloadable entry passes with JECRC branding and Diya motif styling.
4. **Camera-Based Gate Scanner**: Real-time scanner powered by `html5-qrcode` with live camera selection, manual Registration ID fallback, audio feedback (Web Audio chimes), and instantaneous detection of duplicate or invalid passes.
5. **Atomic Check-in Prevention**: PostgreSQL database constraints and Prisma `$transaction` guarantees that each registration is checked in strictly once, preventing race conditions even with simultaneous entry gates.
6. **Live Admin Dashboard & Directory**: Real-time metrics (Total Registered, Checked-In, Pending Entries, Entries Today), attendance time-series chart via Recharts, server-side pagination, advanced filtering, and one-click CSV export.

---

## 1. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom university Diwali theme (`#101A32` Deep Navy, `#493078` Royal Purple, `#D9AD56` Warm Gold, `#FFF9EE` Ivory)
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **QR Scanner**: `html5-qrcode`
- **Charts**: Recharts
- **HTTP Client**: Axios with credentials and interceptors
- **Audio Feedback**: Synthesized Web Audio API (zero external assets)

### Backend
- **Runtime**: Node.js (v20+) with TypeScript
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL with Prisma ORM (v5)
- **Validation**: Zod schema validation
- **Authentication**: JWT with secure HttpOnly cookies & Bearer fallback
- **Security**: SHA-256 token hashing, bcrypt password hashing, Helmet, CORS, and Express Rate Limiters
- **QR Engine**: `qrcode` npm package (High Error Correction Level)

---

## 2. Monorepo Project Structure

```
jecrc-alumni-diwali/
│
├── client/                     # Frontend React + Vite + TypeScript application
│   ├── public/
│   │   └── diwali-lamp.svg     # JECRC Diya vector branding
│   ├── src/
│   │   ├── components/         # PassCard, MetricCard, Navbar, Footer, StatusBadge, etc.
│   │   ├── context/            # AuthContext (Role-based access)
│   │   ├── layouts/            # PublicLayout, AdminLayout
│   │   ├── pages/              # RegisterPage, RegistrationSuccessPage, LoginPage, DashboardPage, ScannerPage, RegistrationsPage
│   │   ├── services/           # api, auth, registration, scanner, admin services
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── utils/              # Web Audio feedback, date formatters
│   │   ├── App.tsx             # Route definitions & guards
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind CSS directives & @media print styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Backend Express + TypeScript + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma       # User, Event, AlumniRegistration, CheckIn models
│   │   └── seed.ts             # Initial event & credential seeding
│   ├── src/
│   │   ├── config/             # Environment validation (Zod) & Prisma client
│   │   ├── controllers/        # registration, checkin, auth, admin controllers
│   │   ├── middleware/         # auth, role, rateLimiter, error handling
│   │   ├── routes/             # REST endpoints
│   │   ├── services/           # Business logic & atomic database transactions
│   │   ├── types/              # Request & token types
│   │   ├── utils/              # Crypto (SHA-256, bcrypt), ID generator, QR generator, IST formatter
│   │   ├── validators/         # Zod schemas (mobile, email, checkin)
│   │   └── app.ts              # Express application configuration
│   ├── test/
│   │   └── api.test.ts         # Automated integration test suite (30 scenarios)
│   ├── tsconfig.json
│   └── package.json
│
├── scripts/                    # PowerShell automation scripts
│   └── start-all.ps1
├── docker-compose.yml          # Optional local PostgreSQL container
├── package.json                # Monorepo root scripts
├── .env.example                # Sample environment variables
└── README.md
```

---

## 3. Database Architecture (Prisma & PostgreSQL)

### Data Models

```prisma
model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  role         Role     @default(VOLUNTEER) // ADMIN or VOLUNTEER
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Event {
  id            String               @id @default(uuid())
  name          String
  year          Int                  @default(2026)
  eventDate     DateTime
  venue         String
  isActive      Boolean              @default(true)
  registrations AlumniRegistration[]
}

model AlumniRegistration {
  id               String   @id @default(uuid())
  registrationId   String   @unique // e.g. JECRC-DIWALI-2026-0001
  fullName         String
  email            String
  normalizedEmail  String   @unique
  mobile           String
  normalizedMobile String   @unique
  currentCity      String?
  graduationYear   Int
  course           String
  branch           String
  companyName      String
  designation      String
  qrTokenHash      String   @unique // SHA-256 hash of random token
  eventId          String
  event            Event    @relation(fields: [eventId], references: [id])
  checkIn          CheckIn?
  createdAt        DateTime @default(now())
}

model CheckIn {
  id                   String             @id @default(uuid())
  alumniRegistrationId String             @unique // Guarantees 1 check-in per registration
  alumniRegistration   AlumniRegistration @relation(fields: [alumniRegistrationId], references: [id])
  checkedInAt          DateTime           @default(now())
  checkedInBy          String
  gateName             String             @default("Main Gate")
}
```

---

## 4. REST API Endpoints

### Public Endpoints
- `POST /api/registrations` – Register a new alumnus, returns unique registration ID & QR pass data URL.
- `GET /api/registrations/:registrationId` – Safe public pass lookup (no secret tokens or hashes returned).
- `GET /api/health` – System health check.

### Authentication Endpoints
- `POST /api/auth/login` – Login for Admin and Volunteers (sets HttpOnly cookie + Bearer token).
- `POST /api/auth/logout` – Clear authentication cookie.
- `GET /api/auth/me` – Inspect active user session.
- `GET /api/auth/volunteers` – (Admin only) List all volunteer accounts.
- `POST /api/auth/volunteers` – (Admin only) Create new volunteer account.

### Entry Gate Scanner Endpoints (ADMIN & VOLUNTEER)
- `POST /api/checkin/verify` – Verify scanned QR token and record check-in atomically:
  - `status: "SUCCESS"` (First-time entry approved)
  - `status: "ALREADY_CHECKED_IN"` (Duplicate entry attempt blocked)
  - `status: "INVALID"` (Unrecognized token rejected)
- `POST /api/checkin/manual` – Fallback gate entry by Registration ID (`JECRC-DIWALI-2026-XXXX`).

### Admin Management Endpoints (ADMIN only)
- `GET /api/admin/dashboard` – Live database statistics, hourly attendance timeline, and latest check-ins.
- `GET /api/admin/registrations` – Server-side paginated alumni directory with search and multi-criteria filters.
- `GET /api/admin/registrations/:id` – Detailed profile including gate check-in audit trail.
- `PUT /api/admin/registrations/:id` – Edit alumni registration information.
- `GET /api/admin/export` – Download complete registration and entry records as CSV.

---

## 5. Pre-Configured Test Accounts

| Role | Username | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin` | `Admin@JECRC2026!` | Full dashboard, scanner, edit registrations, CSV export, volunteer management |
| **Gate Volunteer** | `volunteer1` | `Volunteer@JECRC2026!` | Camera scanner, QR verification, manual ID check-in |

*(Configured securely via environment variables during seeding; no hardcoded passwords).*

---

## 6. Getting Started & Local Setup

### Prerequisites
- Node.js v20 or v22
- PostgreSQL (Local or Docker)

### Step 1: Environment Variables
Create `.env` file in the root or `server/` directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/jecrc_diwali_2026?schema=public"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=jecrc_diwali_2026_super_secret_jwt_key_alumni_pass_production_secure_789
SESSION_COOKIE_SECRET=jecrc_cookie_secret_diwali_key_2026
APP_BASE_URL=http://localhost:5173
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=Admin@JECRC2026!
INITIAL_VOLUNTEER_USERNAME=volunteer1
INITIAL_VOLUNTEER_PASSWORD=Volunteer@JECRC2026!
```

### Step 2: Database Initialization & Seeding
```bash
# Push Prisma schema to PostgreSQL
npm run prisma:push

# Seed active event and initial admin/volunteer accounts
npm run prisma:seed
```

### Step 3: Run the Application
```bash
# Start backend server (port 5000)
npm run dev:server

# Start frontend client (port 5173)
npm run dev:client
```

Open your browser at:
- **Alumni Registration Portal**: [http://localhost:5173/register](http://localhost:5173/register)
- **Admin / Volunteer Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 7. Verification & Automated Testing

A comprehensive integration test suite verifies all 30 core requirements:

```bash
npm run test:server
```

**Tested Scenarios**:
- [x] API Health status check
- [x] Admin authentication & role assignment
- [x] Volunteer authentication & role assignment
- [x] Invalid password rejection (401)
- [x] Missing required fields validation (400)
- [x] Invalid email format validation (400)
- [x] Invalid Indian mobile number validation (400)
- [x] Successful alumni registration (201)
- [x] Sequential registration ID generation (`JECRC-DIWALI-2026-XXXX`)
- [x] High-resolution QR code Data URL generation
- [x] Duplicate email registration prevention (409)
- [x] Duplicate mobile registration prevention (409)
- [x] Safe public lookup without token leakage
- [x] Gate QR check-in verification (SUCCESS, 200)
- [x] Duplicate QR scan detection (ALREADY_CHECKED_IN, 200)
- [x] Invalid QR token rejection (INVALID, 404)
- [x] Volunteer authorization enforcement (blocked from CSV export & admin directory, 403)
- [x] Admin dashboard real-time calculation
- [x] CSV data export with complete headers and audit info

---

© 2026 JECRC University Alumni Association. Built for Diwali Get-Together 2026.
