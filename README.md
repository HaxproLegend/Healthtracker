# VITALS — Health Tracker & Analytics (v2.0, web)

Node/Express + PostgreSQL API, React (Vite) front end, styled to match
the portfolio design system (near-black `#0a0a0a`, acid-yellow `#e8ff00`,
Space Mono, zero border-radius, hard offset shadows).

```
backend/   Express API (auth, logs CRUD, analytics, CSV export) + Postgres
frontend/  React + Vite SPA (dashboard, log entry, analytics, history)
```

## Run locally

### 1. Install prerequisites
- **Node.js 18+** — https://nodejs.org (check: `node -v`)
- **PostgreSQL 14+** — https://www.postgresql.org/download/
  (Windows/macOS installer, or `brew install postgresql@16` / `sudo apt install postgresql`)
  Remember the password you set for the `postgres` user.

### 2. Create the database
```bash
psql -U postgres -c "CREATE DATABASE health_tracker;"
```
(Tables are created automatically when the backend starts.)

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edit .env -> set DB_PASSWORD (your postgres password) and JWT_SECRET
npm run dev               # http://localhost:4000
```

### 4. Frontend (second terminal)
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```
Open http://localhost:5173, click "Create an account", and log in.
Do NOT open index.html directly — it must be served by the Vite dev server.

## Deploy (auto-sleeping, wakes on visit)

**Database + backend → Render**
1. Push the repo to GitHub.
2. Render → New → PostgreSQL (free). Copy its *Internal Database URL*.
3. Render → New → Web Service → your repo, root directory `backend`,
   build command `npm install`, start command `npm start`, plan Free.
4. Environment variables: `DATABASE_URL` (from step 2), `JWT_SECRET`
   (long random string), `CORS_ORIGIN` (your Vercel URL, set after below).
5. Free web services sleep after ~15 min idle and wake automatically on the
   next request (first request takes ~30-60s).

**Frontend → Vercel**
1. Vercel → Add New → Project → same repo, root directory `frontend`.
2. Env var `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`.
3. Deploy, then put the Vercel URL into the backend's `CORS_ORIGIN` on Render.

Note: Render's free Postgres has historically expired after a limited period;
check current terms on Render's pricing page, and export your data (History → export csv) if you care about it.

## API
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | - | Create account, returns JWT |
| POST | /api/auth/login | - | Returns JWT |
| GET/PATCH | /api/auth/me | yes | Profile |
| GET/POST | /api/logs | yes | List / create log entry |
| PATCH/DELETE | /api/logs/:id | yes | Update / delete entry |
| GET | /api/analytics/summary | yes | Enriched logs + headline metrics |
| GET | /api/analytics/export?format=csv | yes | CSV export |
