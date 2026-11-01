# Deployment Guide: JECRC University Alumni Diwali 2026

## QR-Based Registration & Entry Management System

This guide provides end-to-end instructions for deploying the production application with the **Frontend on Vercel** and the **Backend & Database on Render**.

---

## 🏛 Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │             User / Gate Browser         │
                      └────────────────────┬────────────────────┘
                                           │
                        HTTPS / HTML5 Camera Scanner / UI
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          VERCEL (Frontend Host)                                 │
│  • Domain: https://<your-project>.vercel.app                                    │
│  • Stack: Vite + React 18 + TypeScript + Tailwind CSS                           │
│  • Routing: SPA fallback rewrite via client/vercel.json                         │
│  • Env: VITE_API_URL = https://<your-backend>.onrender.com/api                   │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                         REST API Requests (CORS & Bearer JWT)
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          RENDER (Backend Host)                                  │
│  • Web Service: https://<your-backend>.onrender.com                             │
│  • Stack: Node.js 18+ / 20+ + Express + TypeScript + Prisma ORM                 │
│  • Health Check: /health                                                        │
│  • Build: npm install && npm run build                                          │
│  • Start: npx prisma db push && npx tsx prisma/seed.ts && node dist/app.js      │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                               SQL Wire Protocol
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      RENDER POSTGRESQL (Database Host)                          │
│  • Managed PostgreSQL 15/16 Instance                                            │
│  • Tables: Event, User, AlumniRegistration, CheckIn                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Backend & Database Deployment on Render

### Step 1.1: Deploy PostgreSQL Database on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **PostgreSQL**.
3. Fill in the database details:
   - **Name**: `jecrc-diwali-db`
   - **Database**: `jecrc_diwali`
   - **User**: `jecrc_admin`
   - **Region**: Choose the region closest to you (e.g., `Singapore` or `Frankfurt`).
   - **Plan**: `Free` (or `Starter`).
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (if deploying the backend on the same Render account) or **External Database URL**.

---

### Step 1.2: Deploy the Backend Web Service on Render

#### Option A: Quick Blueprint Deploy (`render.yaml`)
A ready-to-use `render.yaml` blueprint is included in the root of this repository.
1. In Render, click **Blueprints** → **New Blueprint Instance**.
2. Connect your GitHub repository.
3. Render will automatically configure the PostgreSQL database and Web Service based on `render.yaml`.

#### Option B: Manual Web Service Setup
1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the following settings:
   - **Name**: `jecrc-diwali-api`
   - **Region**: Same region as your database.
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npx prisma db push && npx tsx prisma/seed.ts && node dist/app.js
     ```
   - **Health Check Path**: `/health`

4. Add the **Environment Variables** in the Render settings:

| Variable Key | Description | Example / Recommended Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://jecrc_admin:PASSWORD@dpg-.../jecrc_diwali` |
| `CLIENT_URL` | Your Vercel frontend URL | `https://your-frontend.vercel.app` |
| `APP_BASE_URL` | Base URL encoded in QR codes | `https://your-frontend.vercel.app` |
| `JWT_SECRET` | Secret key for JWT signing | `Generate a 32+ character random string` |
| `SESSION_COOKIE_SECRET`| Cookie encryption secret | `Generate a 32+ character random string` |
| `INITIAL_ADMIN_USERNAME` | Default admin username | `admin` |
| `INITIAL_ADMIN_PASSWORD` | Default admin password | `Admin@JECRC2026!` |
| `INITIAL_VOLUNTEER_USERNAME` | Default volunteer username | `volunteer1` |
| `INITIAL_VOLUNTEER_PASSWORD` | Default volunteer password | `Volunteer@JECRC2026!` |

5. Click **Create Web Service**.
6. Wait for the build and deployment to complete. Once deployed, note down your Render Web Service URL (e.g., `https://jecrc-diwali-api.onrender.com`).

---

## Part 2: Frontend Deployment on Vercel

### Step 2.1: Import Project into Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository.

### Step 2.2: Configure Project Settings

In the **Configure Project** screen:

1. **Framework Preset**: `Vite`
2. **Root Directory**: Click *Edit* and select `client`.
   *(Note: Both root directory configurations are supported thanks to `client/vercel.json` and root `vercel.json`)*
3. **Build and Output Settings**:
   - **Build Command**: `npm run build` (or `tsc -b && vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
   Add the following environment variable:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://jecrc-diwali-api.onrender.com/api` | Point to your Render backend URL + `/api` |

5. Click **Deploy**.

---

### Step 2.3: Update Backend `CLIENT_URL` (if needed)

Once Vercel assigns your production domain (e.g., `https://jecrc-alumni-diwali.vercel.app`):
1. Go back to your Render Dashboard → `jecrc-diwali-api` → **Environment**.
2. Update `CLIENT_URL` and `APP_BASE_URL` to match your Vercel URL:
   ```env
   CLIENT_URL=https://jecrc-alumni-diwali.vercel.app
   APP_BASE_URL=https://jecrc-alumni-diwali.vercel.app
   ```
3. Save changes. Render will automatically redeploy the backend with the new allowed CORS origin.
*(Note: The backend CORS configuration also automatically permits all `*.vercel.app` subdomains).*

---

## Part 3: Verification & Smoke Testing Checklist

### 1. Health Checks
- [ ] Open `https://<your-backend>.onrender.com/health` in your browser. Verify you receive:
  ```json
  { "status": "HEALTHY", "service": "JECRC Alumni Diwali 2026 API" }
  ```

### 2. Frontend Connectivity
- [ ] Open your Vercel app URL `https://<your-frontend>.vercel.app/register`.
- [ ] Verify that university branding and alumni logos load cleanly.
- [ ] Open Browser DevTools (F12) → Console to confirm no CORS or mixed-content errors.

### 3. Public Alumni Registration
- [ ] Submit a test registration form on `/register`.
- [ ] Confirm you are redirected to `/registration/success`.
- [ ] Verify that:
  - Unique Registration ID is shown (e.g. `JECRC-DIWALI-2026-0001`).
  - High-resolution QR code renders clearly.
  - "Download QR Pass" button downloads a clean `.png`.
  - "Print QR Pass" opens the browser print preview in official JECRC institutional layout.

### 4. Admin Portal & Authentication
- [ ] Navigate to `/admin/login`.
- [ ] Log in with initial credentials:
  - **Username**: `admin`
  - **Password**: `Admin@JECRC2026!` (or your custom password set in Render env).
- [ ] Verify Dashboard loads with 4 live metric cards and recent check-in table.

### 5. Camera QR Scanner at Gate
- [ ] Navigate to `/admin/scanner`.
- [ ] Confirm the browser prompts for camera permission (HTTPS is enabled automatically by Vercel).
- [ ] Test scanning a registered QR pass on a mobile device or screen:
  - **Valid Pass**: Green card with audio chime and alumni entry confirmation.
  - **Second Scan**: Amber duplicate entry warning banner ("Already Checked In").
  - **Unregistered QR**: Red invalid badge.
- [ ] Test the **Manual Check-In** fallback tab using the Registration ID.

### 6. Export Alumni Database
- [ ] Navigate to `/admin/registrations`.
- [ ] Click **Export Data (CSV)**.
- [ ] Verify the CSV downloads cleanly with complete alumni and check-in timestamp records.

---

## 🔒 Security Best Practices for Event Day

1. **Change Default Admin Passwords**:
   In the Admin portal or via environment variables, update the initial admin and volunteer passwords before event day.
2. **Gate Volunteer Accounts**:
   Create dedicated volunteer accounts with the `VOLUNTEER` role from the portal. Volunteers can only scan and verify entries; they cannot view private contact details, export data, or edit registrations.
3. **Camera Permissions**:
   Ensure gate check-in laptops, tablets, or smartphones run Chrome, Safari, or Edge over HTTPS so camera access is immediately granted without restrictions.
4. **Render Free Tier Sleep Prevention**:
   On the Render Free tier, web services spin down after 15 minutes of inactivity. For the evening of the event, consider upgrading the web service to the **Starter** tier ($7/month) to eliminate cold-start delays at the entry gates.
