# EcoScrap — Production Deployment & Release Engineering Guide

This runbook documents the deployment architecture, configuration steps, security guidelines, and verification procedures for deploying EcoScrap to cloud infrastructure:
- **Frontend:** Vercel (React 19 + Vite SPA)
- **Backend:** Render (FastAPI + PyTorch MobileNetV3 + scikit-learn on Python 3.11)
- **Database:** MongoDB Atlas (M0 Free Tier or Dedicated Cluster)

---

## 1. Production Architecture Overview

```text
┌─────────────────────────┐
│  End User Web Browser   │
│  (Desktop / Mobile)     │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│      Vercel Edge        │
│  React 19 Vite Frontend │
│  (SPA with rewrites)    │
└────────────┬────────────┘
             │ HTTPS API Calls (Bearer JWT)
             ▼
┌─────────────────────────┐
│     Render Web Svc      │
│     FastAPI Backend     │
│   (Port: $PORT, 0.0.0.0)│
│  ┌───────────────────┐  │
│  │ MobileNetV3 Model │  │
│  │ Price Model (PKL) │  │
│  └───────────────────┘  │
└────────────┬────────────┘
             │ TLS (mongodb+srv://)
             ▼
┌─────────────────────────┐
│      MongoDB Atlas      │
│  Cluster (DB: ewaste)   │
│  - users (unique email) │
│  - lots                 │
│  - recyclers            │
│  - handovers            │
│  - anomalies            │
└─────────────────────────┘
```

---

## 2. MongoDB Atlas Setup

1. **Create Atlas Cluster:**
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
   - Create an **M0 (Shared Free Tier)** or dedicated cluster in your target region (e.g., AWS `ap-south-1` Mumbai).
2. **Database User:**
   - Navigate to **Security → Database Access → Add New Database User**.
   - Create a user (e.g., `ecoscrap-app`) with password authentication.
   - Assign built-in role: **Read and write to any database**.
3. **Network Access / IP Allowlist:**
   - Navigate to **Security → Network Access → Add IP Address**.
   - For Render serverless/container instances whose outbound IPs fluctuate, add `0.0.0.0/0` (Allow Access from Anywhere) with a description (e.g., `Render FastAPI backend`).
4. **Retrieve Connection String:**
   - Under **Clusters → Connect → Drivers (Python 3.11+)**, copy the URI:
     ```text
     mongodb+srv://<username>:<password>@<cluster-host>.mongodb.net/?retryWrites=true&w=majority
     ```
5. **Initial Data Seeding (Recyclers):**
   - Once the database URI is ready, run the idempotent seeder:
     ```bash
     cd backend
     MONGO_URI="<YOUR_ATLAS_URI>" DATABASE_NAME="ewaste" python seed_recyclers.py
     ```
   - This populates verified authorized recycler entries into the Atlas `recyclers` collection.
---

## 3. Render Backend Deployment

Render hosts the FastAPI service via native Python environment using the repository's `backend/requirements.txt` and `render.yaml`.

### Option A: Blueprint Deployment (Fastest)
1. In Render Dashboard, select **New → Blueprint**.
2. Connect your GitHub repository.
3. Render automatically picks up `render.yaml`:
   - Service Name: `ecoscrap-api`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/health`

### Option B: Manual Web Service Setup
1. **New → Web Service → Connect Git Repo**.
2. Configure runtime parameters:
   - **Environment:** `Python 3`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
3. Configure Environment Variables in Render:

| Variable | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Matches tested production Python release |
| `MONGO_URI` | `mongodb+srv://...` | Atlas connection string |
| `DATABASE_NAME` | `ewaste` | Target production database name |
| `SECRET_KEY` | *(Generate 32-byte secret)* | HMAC secret for signing JWTs |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token validity duration |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` | Production frontend domain for CORS |
| `ENVIRONMENT` | `production` | Deployment environment flag |

*Note: Generate a 32-byte secret with:* `python -c "import secrets; print(secrets.token_urlsafe(32))"`

---

## 4. Vercel Frontend Deployment

Vercel hosts the single-page React 19 application built via Vite.

1. **New Project in Vercel:**
   - Log into [Vercel](https://vercel.com/) and click **Add New → Project**.
   - Import your EcoScrap GitHub repository.
2. **Framework & Directory Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Environment Variables:**
   - In the project settings, add:
     - `VITE_API_URL`: `https://ecoscrap-api.onrender.com` (your Render backend URL)
4. **SPA Rewrite Verification (`vercel.json`):**
   - The repository includes `frontend/vercel.json` configured with rewrites to `/index.html`.
   - This ensures direct browser visits to `/dashboard`, `/create-lot`, `/my-lots`, and `/handover/:id` route correctly without 404 errors.

---

## 5. Security & Isolation Checklist

- [x] **No hardcoded secrets:** `SECRET_KEY` and `MONGO_URI` are loaded dynamically from environment variables with startup guard validation.
- [x] **Client variables isolated:** Only `VITE_API_URL` is exposed in frontend build bundles. No database strings or private tokens exist in frontend code.
- [x] **CORS allowlist:** FastAPI `CORSMiddleware` restricts origins to development ports (`localhost:5173`, `localhost:3000`), explicit production origins (`FRONTEND_URL`), and verified preview instances (`r"^https://.*\.vercel\.app$"`).
- [x] **Voice destruction barrier:** Web Speech API voice assistant strictly denies destructive (`Delete lot`), mutating (`Submit lot`), and financial (`Pay now`, `Confirm handover`) actions. Spoken user intents are redirected to manual on-screen button confirmations.
- [x] **Ephemeral image inference:** Image classifications (`POST /predict`) execute inference via temporary files that are unlinked from disk in a `finally` block immediately after prediction completes.

---

## 6. Pre-Flight Verification & Smoke Testing

Run the local verification suite prior to tagging any release:

```bash
# 1. Frontend production compilation
npm --prefix frontend run build

# 2. Voice parser unit and safety guard suite (44 tests)
npm --prefix frontend run test:voice

# 3. Live end-to-end API integration smoke suite (12 tests)
npm --prefix frontend run test:e2e
```

### Production Health Check
Once Render service is active:
```bash
curl -I https://<your-render-backend>.onrender.com/health
# Expected: HTTP/2 200 OK
# Body: {"status":"healthy","database":"connected"}
```

---

## 7. Known Production Limitations & Notes

1. **Free Tier Cold Starts (Render):** On Render's free tier, the backend web service spins down after 15 minutes of inactivity. Initial requests may take 45–60 seconds to spin up and load the PyTorch weights into memory. For production/demo continuity, consider Render's Starter instance or a scheduled health-ping.
2. **Local Upload Storage:** Production lot image uploads (`POST /upload-image`) are persisted to `backend/uploads/` on the local container filesystem. Container restarts will purge uploaded inspection images unless mounted to an external disk or object store (e.g. S3). The AI classification flow (`POST /predict`) is unaffected because it analyzes images in-memory and cleans up temp files immediately.
3. **Voice Recognition Browser Compatibility:** The voice assistant uses native browser `webkitSpeechRecognition` / `SpeechRecognition` available in Chromium-based browsers (Google Chrome, Microsoft Edge, Brave) and Safari. Browsers lacking the API fallback gracefully to tactile button controls.

---

## 8. Rollback Procedure

If a production release encounters unexpected defects, follow this protocol:

1. **Identify the Last Known-Good Checkpoint:**
   - Baseline Git Tag: `v1.0.0-sih-demo` (commit: `c3bf08ba`)
2. **Git Rollback:**
   ```bash
   git checkout v1.0.0-sih-demo
   ```
3. **Vercel Instant Rollback:**
   - In the Vercel Dashboard, go to **Deployments**.
   - Locate the previous successful deployment and click **Redeploy / Promote to Production**.
4. **Render Rollback:**
   - In the Render Dashboard, open the web service **Events** tab.
   - Click **Rollback** on the preceding healthy deploy.

