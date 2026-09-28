# EcoScrap — Smart E-Waste Collection & Recycling Platform

> **Official Tagline:** Smart E-Waste Collection & Recycling Platform  
> **Core UX Principle:** *"Bolkar bhi chala sakte ho, buttons se bhi."* (Use by speaking or with buttons)  
> Designed for informal scrap collectors (*kabadiwalas*), authorized recyclers, and live hackathon demonstration.

EcoScrap bridges the informal waste collection sector with authorized recyclers through multi-lingual voice navigation, on-device/server-side AI material classification, fair indicative pricing, GPS/city matching, auditable digital handover records, and anomaly detection.

---

## Problem & Solution

### The Problem
- **80%+ of India's e-waste** flows through the informal sector (scrap pickers / *kabadiwalas*).
- **Price Opacity**: Informal collectors frequently receive arbitrary, below-market rates because they lack daily scrap-market transparency.
- **Discovery Bottleneck**: Authorized recyclers struggle to source aggregated e-waste, while collectors lack access to verified recycling facilities.
- **Weak Digital Traceability**: Informal transactions leave zero digital audit trail, hindering Extended Producer Responsibility (EPR) compliance.
- **Literacy & Language Barriers**: Conventional enterprise applications exclude low-literacy collectors who rely on regional spoken dialects.

### The Solution: EcoScrap
EcoScrap combines **5 core capabilities** into an accessible, low-literacy workflow:
1. **AI-Powered Material Identification**: MobileNetV3 image classification identifying 18 categories of e-waste with dynamic confidence scoring.
2. **Indicative Price Transparency**: Explainable, rule-and-regression-backed pricing engine showing estimated market value (never arbitrary guarantees).
3. **Authorized Recycler Discovery**: Location, material, and service-area ranking connecting collectors directly with authorized recyclers.
4. **Digital Handover Traceability**: Auditable 5-step lifecycle (`Request Sent` → `Confirmed` → `E-Waste Handed Over` → `Payment Received` → `Completed`) with immutable digital records.
5. **Multilingual Voice Accessibility**: Trilingual voice interface (English, Hindi, Marathi) with built-in safety guards that refuse destructive actions by voice.

---

## Technology Stack

| Layer | Technologies | Role / Notes |
|---|---|---|
| **Frontend** | React 19, JavaScript / JSX, Vite 8, React Router 7, Recharts | Fast SPA, trilingual context, responsive (320px–1440px) |
| **Voice Layer** | Browser Web Speech API (`SpeechRecognition`, `SpeechSynthesis`) | Trilingual spoken interaction (EN, HI, MR) with safety parser |
| **Backend** | Python 3.10+, FastAPI, Pydantic, Uvicorn | High-throughput async REST API, JWT auth, RBAC |
| **AI / Classification** | PyTorch, torchvision, MobileNetV3-Small | 18 e-waste classes, 224x224 input, 93.72% test accuracy |
| **Price Engine** | scikit-learn (`RandomForestRegressor` + `Pipeline`) | Indicative price estimation based on category, subcategory, location, weight |
| **Recycler Matching** | Deterministic weighted scoring algorithm | Ranked by authorization status, location, service area, pickup availability |
| **Persistence** | MongoDB (default db: `ewaste`), PyMongo | Collections: `users`, `lots`, `recyclers`, `handovers`, `anomalies` |
| **Security** | PBKDF2-style salted hashing, JWT (HS256), CORS, voice safety | Role-based isolation (collector vs. recycler), no destructive voice actions |

---

## AI System & Model Performance

- **Model Architecture**: MobileNetV3-Small fine-tuned on e-waste imagery (`backend/ai/model/e_waste_mobilenetv3.pth`).
- **Input Preprocessing**: RGB conversion → Resize to 224×224 → PyTorch Tensor → ImageNet Normalization (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`).
- **Classes (18)**: Air-Conditioner, Battery, Keyboard, Laptop, Microchip-IC, Microwave, Mobile, Mouse, PCB, Passive-Component, Printer, Refrigerator, Resistor, Television, Washing Machine, heat-sink, light bulbs, transistor.
- **Dataset Size**:
  - Training: 23,960 images
  - Validation: 1,800 images
  - Test: 1,800 images (100 per class)
- **Verified Metrics (Test Set)**:
  - **Overall Accuracy**: **93.72%** (Macro Avg F1: 0.9382, Weighted Avg F1: 0.9382)
  - Selected class recall: PCB (90%), Battery (95%), Mobile (96%), Laptop (97%), Mouse (99%), Keyboard (99%)
- **Confidence Safeguard**: Dynamic visual caution banner appears whenever AI confidence is `< 70%`, requiring manual collector confirmation before creating lots.

---

## Voice Accessibility & Safety

- **Browser-Native**: Powered by the Web Speech API with zero third-party cloud audio dependencies.
- **Trilingual Dictionary**: English, Hindi (*हिंदी*), and Marathi (*मराठी*) support with phonetic aliases.
- **Safety-by-Design Guard**: Destructive or irreversible transactional commands (`submit lot`, `pay`, `confirm handover`, `delete lot`) are intercepted at the parser level (`src/utils/voiceCommands.js`).
  - Spoken response: *"Voice safety: submit action blocked. Please confirm on screen."*
  - **Zero database mutation** can be triggered by voice alone.

---

## Project Structure

```
e-waste/
├── backend/
│   ├── ai/                 # PyTorch classifier, price model, matcher, anomaly detector
│   │   ├── model/          # Pretrained MobileNetV3 (.pth) & price model (.pkl)
│   │   ├── results/        # Classification report (18 classes) & confusion matrix
│   │   ├── classifier.py   # MobileNetV3 loader & transforms
│   │   ├── predictor.py    # Prediction entry point
│   │   ├── price_model.py  # RandomForest price regressor pipeline
│   │   ├── price_board.py  # Daily price rates per material
│   │   └── recycler_matcher.py # Multi-criteria ranking engine
│   ├── routes/             # FastAPI routers (auth, lots, handovers, recyclers, prices, anomalies)
│   ├── uploads/            # Uploaded lot images (temp files automatically cleaned)
│   ├── database.py         # MongoDB connection helper
│   ├── main.py             # FastAPI entry point, CORS, and health check
│   ├── models.py           # Pydantic schemas and input validation
│   └── seed_recyclers.py   # Recycler CSV seeder (idempotent upsert)
├── datasets/
│   ├── recyclers/          # Authorized recyclers directory CSV
│   └── prices/             # Scrap market price dataset CSV
├── docs/                   # Demonstration, Jury Q&A, and Pitch documentation
│   ├── demo-assets/        # Verified sample demo image (demo-pcb-sample.jpg)
│   ├── SIH_JURY_QA.md      # Comprehensive 32-question jury defense guide
│   ├── PPT_CONTENT.md      # 6-slide presentation deck outline
│   └── DEMO_BACKUP_PLAN.md # Failure recovery playbook for live pitches
├── frontend/
│   ├── public/             # Static assets, SVG icons, and favicon
│   ├── scripts/
│   │   ├── voice-command-tests.mjs  # 44/44 automated voice parser test suite
│   │   └── e2e-smoke-test.mjs       # 12/12 automated end-to-end API smoke test
│   └── src/
│       ├── api/            # Centralized API modules with normalized network error handling
│       ├── components/     # UI widgets (voice button, ledger, handover timeline, cards)
│       ├── pages/          # Application routes (AI result, lots, handovers, record, profile)
│       ├── utils/          # Voice parser, speech synthesizer, audio cues
│       └── LanguageContext.jsx # Trilingual dictionary provider (EN / HI / MR)
├── ARCHITECTURE.md         # Full system architecture, subsystems, and threat model
└── README.md               # This file
```


---

## Setup & Startup Runbook

### Prerequisites
- Python 3.10+
- Node.js 20+
- MongoDB running on `localhost:27017` (default database: `ewaste`)

### 1. Start Backend

```bash
cd backend

# Activate virtual environment (if using existing venv)
venv\Scripts\activate       # Windows PowerShell / CMD
# source venv/bin/activate  # Linux / macOS

# (Optional first run) Install dependencies
pip install -r requirements.txt

# Seed authorized recyclers (idempotent upsert)
python seed_recyclers.py

# Launch FastAPI server on http://127.0.0.1:8000
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend health:
```bash
curl http://127.0.0.1:8000/health
# Expected: {"status":"healthy","database":"connected"}
```

### 2. Start Frontend

```bash
cd frontend

# (Optional first run) Install dependencies
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

---

## Verified Demo Credentials

The database contains pre-configured demonstration accounts for both roles:

| Role | Email | Password | Notes |
|---|---|---|---|
| **Collector (Primary)** | `collector@test.com` | `123456` | Standard demo collector |
| **Collector (QA)** | `qa.ecoscrap.collector@example.com` | `qa-pass-1234` | Managed by automated E2E test |
| **Recycler (QA)** | `qa.ecoscrap.recycler@example.com` | `qa-pass-1234` | Linked to recycler `R001` (GreenTech Recycling) |

---

## Testing & Verification

EcoScrap includes automated test suites covering both the voice parser and the live API:

```bash
# 1. Voice Command Parser Test Suite (44 unit tests)
npm --prefix frontend run test:voice
# Result: 44/44 tests passed (navigation 31, safety 12, unknown fallback 1)

# 2. End-to-End API Smoke Test (12 full-stack checks against :8000)
npm --prefix frontend run test:e2e
# Result: 12/12 checks passed (auth, AI, lot, price, match, handover, ledger, record)

# 3. Production Bundle Build
npm --prefix frontend run build
# Result: 0 errors, 661 modules transformed
```


---

## 5–7 Minute SIH Demonstration Flow

| Time | Stage | Action / Speech | What to Show on Screen |
|---|---|---|---|
| **0:00–0:45** | **Problem** | Explain informal sector challenges: price opacity, difficulty reaching authorized recyclers, zero digital records, language/literacy exclusion. | Landing page hero (*"Bolkar bhi chala sakte ho, buttons se bhi"*). Toggle language EN → हिंदी → मराठी. |
| **0:45–1:15** | **Solution** | Introduce EcoScrap as an end-to-end bridge: AI material classification, fair indicative pricing, recycler discovery, digital handover records, and voice assistance. | Landing page feature cards and role selection. |
| **1:15–2:00** | **Login & Dashboard** | Log in as collector (`collector@test.com` / `123456`). Point out the clear visual icon cards for low-literacy users. | Collector dashboard: Add E-Waste, My Lots, Price Board, Find Recycler, Handover, My Earnings. |
| **2:00–3:00** | **AI Classification** | Click "Add E-Waste" (or use voice). Upload `docs/demo-assets/demo-pcb-sample.jpg`. Point out the MobileNetV3 prediction. | AI Result page showing `PCB` with `99.21%` confidence. Explain the `<70%` caution badge safeguard. |
| **3:00–3:40** | **Indicative Price** | Enter weight (`12.5 kg`), location (`Gorakhpur`). Review the calculated value (`₹4,893`). | Emphasize this is an *indicative* estimate for decision support, not an arbitrary guarantee. |
| **3:40–4:20** | **Recycler Matching** | Click "Find Recycler". Point out the matched recyclers ranked by authorization, location, and rates. | List of recyclers showing GreenTech Recycling (`Authorized`, `₹410/kg`, pickup available). |
| **4:20–5:00** | **Handover Tracking** | Create handover request. Switch to recycler view to advance status: Confirmed → Handed Over → Completed (Paid). | 5-step handover timeline showing real-time stage progression. |
| **5:00–5:30** | **Digital Record** | Open `/handover/:id/record`. Show the generated digital handover record. | Immutable handover record with Lot ID, Handover ID, weights, and `Verified` seal for EPR audit. |
| **5:30–6:00** | **Earnings** | Navigate to My Earnings. Show the earnings ledger breakdown. | Ledger showing Total Earnings (Paid) vs. Pending settlements. |
| **6:00–6:40** | **Voice Assistant & Safety** | Click mic. Speak *"ई वेस्ट जोड़ो"* → opens Create Lot. Speak *"Submit lot"* → voice safety intercepts and guides user to screen. | Voice assistant modal, spoken guidance, on-screen safety notification. |

---

## Limitations & Honest Disclosure

- **AI Dataset Scope**: The classifier is trained on 18 specific e-waste categories. Unseen, heavily deformed, or mixed scrap items should be manually confirmed.
- **Indicative Pricing**: Current pricing uses a trained regression model combined with baseline scrap rates. It does not ingest live stock-exchange or commodities feeds. Actual payouts depend on recycler inspection.
- **Voice Hardware & Platform**: Voice interaction relies on the browser's Web Speech API implementation. Speech accuracy depends on ambient noise and microphone hardware.
- **Payment Gateway**: Current payout statuses (`Pending`, `Paid`) reflect prototype workflow state transitions; a production deployment would integrate a licensed payment gateway (UPI/Razorpay/escrow).
- **Network Resilience**: The application features graceful network failure handling with localized user notices; it does not claim offline-first database synchronization.

---

## Future Scope

- **Production Payment Gateway**: Direct UPI / Escrow payout integration upon recycler handover completion.
- **Offline-First PWA**: Service Worker caching and local SQLite/IndexedDB queue for poor connectivity zones.
- **Expanded Classification**: Active learning pipeline incorporating field imagery from collectors across more diverse e-waste subclasses.
- **Direct EPR Portal Integration**: Direct automated export of digital handover records to CPCB (Central Pollution Control Board) portals for EPR credit verification.
- **On-Device Whisper Lite**: On-device multilingual voice recognition for environments with zero network coverage.

---

## Team & Credits

Developed for the **Smart India Hackathon (SIH)**.  
Built with FastAPI, React, PyTorch, MongoDB, and the Web Speech API.

