# JECRC University Alumni Diwali Get-Together 2026
## Production Deployment Guide: Render & Neon PostgreSQL

This guide provides step-by-step instructions to deploy the complete **JECRC Alumni QR-Based Registration & Gate Entry System** using:
1. **Frontend**: Render Static Site (React + Vite + Tailwind CSS) — *Free Tier*
2. **Backend**: Render Web Service (Node.js + Express + Prisma) — *Always-on Starter Plan (~$7/mo)*
3. **Database**: Neon Managed PostgreSQL — *Free Tier (1 GB storage)*

---

## 🏛 System Architecture & Topology

```
                         ┌──────────────────────────────────────────────┐
                         │      Alumni & Gate Volunteer Devices         │
                         │    (Android, iPhone, Laptops, Tablets)       │
                         └──────────────────────┬───────────────────────┘
                                                │
                                    HTTPS Traffic / Cameras
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND: Render Static Site (React + Vite)                          │
│  • Public URL: https://jecrc-alumni-qr.onrender.com                                     │
│  • Features: Public Registration Portal, QR Pass Generator, Gate Scanner, Admin Portal  │
│  • SPA Routing Rewrite: /* -> /index.html                                               │
│  • Environment Variable: VITE_API_URL=https://jecrc-alumni-api.onrender.com/api         │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                          REST API (CORS + Authorization: Bearer JWT)
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     BACKEND: Render Web Service (Node.js + Express)                     │
│  • API Base URL: https://jecrc-alumni-api.onrender.com                                  │
│  • Host / Binding: 0.0.0.0:${PORT}                                                      │
│  • Health Check: /health -> { "status": "OK", "service": "JECRC Alumni API" }           │
│  • Build Command: npm install && npx prisma generate && npm run build                   │
│  • Start Command: npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/app.js│
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                        Pooled SQL / Direct Compute Connections
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE: Neon Managed PostgreSQL                             │
│  • Engine: PostgreSQL 16 (Serverless)                                                   │
│  • DATABASE_URL (Pooled): PgBouncer pooled connection (-pooler string)                  │
│  • DIRECT_URL (Direct): Direct connection for migrations                                │
│  • Tables: users, events, alumni_registrations, check_ins                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Set Up PostgreSQL on Neon

1. Navigate to the [Neon Console](https://console.neon.tech/) and sign in.
2. Click **Create Project**:
   - **Project Name**: `jecrc-alumni`
   - **Database Name**: `jecrc_alumni`
   - **Region**: Choose the region closest to your target audience (e.g. `ap-southeast-1` Singapore or `eu-central-1` Frankfurt).
   - **PostgreSQL Version**: `16` (Default)
3. Under **Connection Details** on the project dashboard:
   - Select **Pooled connection**: Copy the connection string. This is your `DATABASE_URL`.
     *(Example: `postgresql://username:password@ep-sample-pooler.region.aws.neon.tech/jecrc_alumni?sslmode=require`)*
   - Uncheck "Pooled connection" to view the **Direct connection**: Copy this string. This is your `DIRECT_URL`.
     *(Example: `postgresql://username:password@ep-sample.region.aws.neon.tech/jecrc_alumni?sslmode=require`)*

---

## Step 2: Deploy the Backend on Render (Web Service)

1. Open the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`jecrc-alumni-qr` / your repo name).
4. Configure the Web Service settings:
   - **Name**: `jecrc-alumni-api`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/app.js
     ```
   - **Instance Type**: **Starter** ($7/month paid plan)
     > [!IMPORTANT]
     > Use the paid **Starter** tier for the backend to prevent the instance from sleeping after 15 minutes of inactivity. This ensures zero latency during event gate check-in.
   - **Health Check Path**: `/health`

5. Under **Environment Variables**, add:

| Key | Value / Source |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Your Neon pooled connection string* (with `-pooler`) |
| `DIRECT_URL` | *Your Neon direct connection string* (without `-pooler`) |
| `CLIENT_URL` | `https://jecrc-alumni-qr.onrender.com` *(adjust if your Static Site name differs)* |
| `PUBLIC_APP_URL`| `https://jecrc-alumni-qr.onrender.com` *(base URL encoded into alumni QR passes)* |
| `APP_BASE_URL` | `https://jecrc-alumni-qr.onrender.com` |
| `JWT_SECRET` | *Click "Generate" or enter a 32+ character random string* |
| `SESSION_COOKIE_SECRET` | *Click "Generate" or enter a 32+ character random string* |
| `INITIAL_ADMIN_USERNAME` | `admin` |
| `INITIAL_ADMIN_PASSWORD` | `Admin@JECRC2026!` *(Change to a strong password)* |
| `INITIAL_VOLUNTEER_USERNAME`| `volunteer1` |
| `INITIAL_VOLUNTEER_PASSWORD`| `Volunteer@JECRC2026!` *(Change to a strong password)* |

6. Click **Create Web Service**.
7. Once deployed, verify your backend health check by visiting:
   `https://jecrc-alumni-api.onrender.com/health`
   Expected response:
   ```json
   {
     "status": "OK",
     "healthy": true,
     "service": "JECRC Alumni API",
     "timestamp": "2026-11-01T..."
   }
   ```

---

## Step 3: Deploy the Frontend on Render (Static Site)

1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** → **Static Site**.
2. Connect the same GitHub repository.
3. Configure the Static Site settings:
   - **Name**: `jecrc-alumni-qr`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`
4. Add the Frontend **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://jecrc-alumni-api.onrender.com/api` |

5. Configure **React Router Fallback (Rewrite Rule)**:
   In the Static Site settings, scroll to **Redirects / Rewrites** and click **Add Rule**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   > [!NOTE]
   > This rule ensures that direct page navigation and browser reloads on `/register`, `/admin/dashboard`, `/admin/scanner`, and `/registration/success` render the React SPA seamlessly without returning a 404 error.

6. Click **Create Static Site**.

---

## Step 4: Synchronize & Final Verification

1. Once the frontend is live at `https://jecrc-alumni-qr.onrender.com`:
   - If your assigned Render URL differs (e.g. `jecrc-alumni-qr-abc.onrender.com`), go back to your Backend Web Service settings on Render.
   - Update `CLIENT_URL`, `PUBLIC_APP_URL`, and `APP_BASE_URL` to match your actual frontend URL.
   - Click **Save Changes** (Render will redeploy the backend in ~30 seconds).

---

## 🧪 Production Readiness & Verification Checklist

Complete this verification checklist before distributing the registration link to alumni:

- [ ] **1. Public Registration Form**: Open `https://jecrc-alumni-qr.onrender.com/register` on a mobile device and desktop. Submit a test alumnus registration.
- [ ] **2. Database Record in Neon**: Confirm the registration record appears in your Neon database under `alumni_registrations`.
- [ ] **3. Unique Registration ID**: Verify the registration format matches `JECRC-DIWALI-2026-XXXX`.
- [ ] **4. QR Code Generation**: Verify the generated QR code contains `https://jecrc-alumni-qr.onrender.com/checkin/verify?token=...` and no raw personal data.
- [ ] **5. Download & Print Pass**: Test the "Download QR Pass" (.png) and "Print QR Pass" buttons.
- [ ] **6. Admin Login**: Navigate to `/admin/login` and log in with your configured admin credentials.
- [ ] **7. Volunteer Login**: Log in with volunteer credentials; confirm volunteers can access the scanner but cannot view sensitive exports or settings.
- [ ] **8. Camera Scanner on Android**: Open `/admin/scanner` on Android Chrome over HTTPS, accept camera permissions, and scan the test pass.
- [ ] **9. Camera Scanner on iPhone**: Open `/admin/scanner` on iOS Safari, accept camera permissions, and test scan.
- [ ] **10. Successful Entry**: Verify green confirmation badge, audio chime, and check-in timestamp.
- [ ] **11. Duplicate Scan Prevention**: Scan the same pass a second time. Verify the amber warning ("Already Checked In") and that no duplicate check-in is recorded.
- [ ] **12. Invalid QR Handling**: Scan an unrelated QR code. Verify the red "Invalid QR" result.
- [ ] **13. Dashboard Metrics**: Verify "Total Registered", "Total Checked-In", and "Pending Entries" cards update in real-time.
- [ ] **14. CSV Export**: Download the alumni database from `/admin/registrations` and verify clean formatting.

---

## ⚡ Event Day Gate Checklist

1. **Gate Connectivity**: Ensure gate coordinators test entry points on both university Wi-Fi and mobile data (hotspot).
2. **Device Preparation**: Keep at least two smartphones and one laptop per gate station.
3. **Pre-Event Export**: Export a full CSV backup of all registrations 2 hours before gates open.
4. **Post-Event Archival**: Do not immediately shut down the Render backend after the event. Export the final attendance records first to maintain a permanent official record for the JECRC Alumni Association.
