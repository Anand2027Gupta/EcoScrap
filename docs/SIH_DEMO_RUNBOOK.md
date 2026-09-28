# EcoScrap — Live SIH Demonstration Runbook & Failure Recovery

This runbook specifies the step-by-step procedures for live presenter execution, failure recovery, screenshot verification, and presentation checklists.

---

## 1. Quick Startup Sequence

### Terminal 1: Backend
```bash
cd backend
venv\Scripts\activate
python seed_recyclers.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend:
```bash
curl http://127.0.0.1:8000/health
# Expected: {"status":"healthy","database":"connected"}
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 2. Live Demo Failure Matrix & Recovery Procedures

| Failure Scenario | Primary Symptom | Immediate Spoken Recovery | Action to Fix on System |
|---|---|---|---|
| **Backend Unreachable** | Human-friendly banner: *"Could not reach the server"* | *"Notice how the interface handles network disconnects gracefully with human-friendly guidance rather than crashing."* | Restart backend terminal: `uvicorn main:app --reload --port 8000`. Refresh browser tab. |
| **Microphone Permission Denied** | Voice modal displays "Microphone not available" | *"This demonstrates our core philosophy: 'Bolkar bhi chala sakte ho, buttons se bhi.' When microphone access is restricted, the user seamlessly taps on-screen touch buttons."* | Click on-screen button ("Add E-Waste" / "Create Lot") and proceed without interruption. |
| **Webcam Live Feed Black / Unavailable** | Camera modal fails to stream | *"In scrap yards, collectors often select existing snapshots from their phone gallery."* | Click 'Choose Photo' and select `docs/demo-assets/demo-pcb-sample.jpg`. |
| **AI Prediction Times Out** | Server 500 or timeout error | *"In edge deployments, when server connection fluctuates, our audit reports verify exact model weights."* | Pivot to `backend/ai/results/classification_report.txt` and `confusion_matrix.png` to show verified 93.72% test accuracy. |
| **MongoDB Service Drops** | Health endpoint shows degraded | *"Our database driver isolates failure states cleanly."* | Run PowerShell: `net start MongoDB` or restart local mongod instance. |

---

## 3. Demo Account Credentials (Pre-Seeded)

| Role | Email | Password | Primary Purpose |
|---|---|---|---|
| **Collector (Primary)** | `collector@test.com` | `123456` | Primary presenter login for full 5–7 min walk-through |
| **Collector (QA)** | `qa.ecoscrap.collector@example.com` | `qa-pass-1234` | Clean QA account used by automated smoke test |
| **Recycler (QA)** | `qa.ecoscrap.recycler@example.com` | `qa-pass-1234` | Recycler view (GreenTech Recycling, R001) to advance handovers |

---

## 4. Screenshot Checklist for SIH Presentation & PPT

| # | Screen Name | URL / Path | State Required | Presenter Point to Highlight |
|---|---|---|---|---|
| 1 | **Landing Page** | `/` | Language toggled to Hindi or English | Tagline *"Bolkar bhi chala sakte ho, buttons se bhi"* and role cards |
| 2 | **Login Screen** | `/login` | Collector credentials filled | Simple single-column login with minimal cognitive load |
| 3 | **Collector Dashboard** | `/dashboard` | Logged in as Collector | Oversized icon cards for low-literacy scrap collectors |
| 4 | **Create Lot / Upload** | `/create-lot` | Camera capture or file selected | Clear choice between camera snapshot and file upload |
| 5 | **AI Classification Result** | `/ai-result` | `demo-pcb-sample.jpg` processed | MobileNetV3 prediction (**PCB**, **99.21%**) & `< 70%` caution badge safeguard |
| 6 | **Indicative Price Board** | `/prices` | Weight `12.5 kg` entered | Explicitly labeled **Indicative Value** (₹4,893) and regional scrap rates |
| 7 | **Recycler Matching List** | `/recyclers` | Matched results | Weighted ranking: GreenTech Recycling (`Authorized`, `₹410/kg`, pickup) |
| 8 | **Handover Timeline** | `/handovers` | Active handover | 5-step status machine: `Requested` → `Confirmed` → `Handed Over` → `Completed` |
| 9 | **Digital Handover Record** | `/handover/:id/record` | Completed handover | Auditable record with Lot ID, Handover ID, verified weights, and `Verified` seal |
| 10 | **Collector Earnings Ledger**| `/earnings` | Completed transactions | Distinct separation between Total Paid earnings and Pending settlements |
| 11 | **Voice Assistant Modal** | Any page (mic icon) | Listening modal active | Spoken command transcript and trilingual feedback prompt |
| 12 | **Voice Safety Intercept** | Modal after "Submit lot" | Red warning banner | Safety alert: *"Submit action blocked by voice. Please tap button on screen."* |

---

## 5. Printable 10-Minute Pre-Pitch Checklist

- [ ] Power adapter plugged into demo laptop (prevents CPU throttling during AI inference).
- [ ] MongoDB service verified active on port `27017`.
- [ ] FastAPI backend running on port `8000` (`/health` returns `{"status":"healthy","database":"connected"}`).
- [ ] Frontend running on port `5173`.
- [ ] Browser permissions for microphone set to **Allow** on `http://localhost:5173`.
- [ ] Audio speaker volume set to 70%+ so judges hear the speech synthesis confirmation.
- [ ] Pre-verified test image `docs/demo-assets/demo-pcb-sample.jpg` placed on Desktop for instant selection.
- [ ] Collector account (`collector@test.com` / `123456`) verified by test login.
- [ ] Recycler account (`qa.ecoscrap.recycler@example.com` / `qa-pass-1234`) open in secondary tab.
- [ ] Browser zoom level set to 100%.
