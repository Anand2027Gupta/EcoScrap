# EcoScrap System Architecture

## 1. System Context & Overview

EcoScrap connects informal e-waste collectors, authorized recyclers, and regulatory bodies on a single transparent platform. The platform is designed specifically for low-literacy informal collectors via multi-lingual voice navigation while preserving strict transactional safety, fair dynamic pricing, and auditable EPR-ready handover traceability.

```
+---------------------------------------------------------------------------------+
|                                    USERS                                        |
|  [ Informal Waste Collectors ]   [ Authorized Recyclers ]   [ Auditors / Regulators ]
+----------------------+-------------------+-----------------------+--------------+
                       |                   |                       |
                       +-------------------+-----------------------+
                                           | HTTPS
                                           v
+---------------------------------------------------------------------------------+
|                             CLIENT APPLICATION                                  |
|   React 19 + Vite + React Router 7 + Lucide Icons + Web Speech API              |
|                                                                                 |
|   +-----------------------+  +----------------------+  +---------------------+  |
|   | Trilingual UI         |  | Voice Assistant      |  | Centralized API     |  |
|   | (EN / HI / MR)        |  | (Safety Parser Guard)|  | (Error Normalizer)  |  |
|   +-----------------------+  +----------------------+  +---------------------+  |
+------------------------------------------+--------------------------------------+
                                           | REST JSON (JWT Bearer)
                                           v
+---------------------------------------------------------------------------------+
|                             FASTAPI APPLICATION                                 |
|                                                                                 |
|  +--------------------+  +--------------------+  +----------------------------+ |
|  | Auth & RBAC        |  | Handover FSM       |  | Dynamic Pricing Engine     | |
|  | - JWT verification |  | - 5-step lifecycle |  | - Category multipliers     | |
|  | - Collector/Recycler|  | - Verification seal|  | - Subcategory rules        | |
|  +--------------------+  +--------------------+  +----------------------------+ |
|                                                                                 |
|  +--------------------------------------------+  +----------------------------+ |
|  | PyTorch AI Classification Service          |  | Anomaly Detection Service  | |
|  | - MobileNetV3 / ResNet                     |  | - Weight / Price outlier   | |
|  | - 8 Material classes + confidence scoring   |  |   flagging                 | |
|  +--------------------------------------------+  +----------------------------+ |
+------------------------------------------+--------------------------------------+
                                           | PyMongo
                                           v
+---------------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                                  |
|   MongoDB (default db: 'ewaste')                                                |
|   - collections: users, lots, recyclers, handovers, anomalies                   |
+---------------------------------------------------------------------------------+

---

## 2. Core Subsystems

### 2.1 Voice Assistant & Safety Architecture
- **Web Speech API**: Uses browser-native `SpeechRecognition` and `SpeechSynthesis`.
- **Phonetic & Multilingual Parsing**: Supports English, Hindi, and Marathi phonetics, numbers, and informal-collector vocabulary (e.g., *"mera maal"*, *"bhaav dekho"*, *"paisa"*).
- **Safety Parser Guard (`src/utils/voiceCommands.js`)**: Destructive or irreversible transactional actions (`submit lot`, `pay`, `confirm`, `delete`) are strictly intercepted at the parser level:
  - Input: *"Submit lot"* or *"Payment kar do"*
  - Parser: Matches `SAFETY_RULES`
  - Action: Returns `{ blocked: true, spokenFeedback: "..." }`
  - Result: Speech synthesis delivers clear refusal guidance; **zero** database mutation occurs.

### 2.2 Material Classification & Confidence Safeguards
- **Model**: PyTorch-trained computer vision model predicting 8 classes: PCB, Battery, Mobile, Laptop, Keyboard, Mouse, Printer, Television.
- **Low-Confidence Safeguard**: Results with `< 70%` confidence trigger visual caution banners in `AIResultPage`, requiring manual confirmation before lot creation.

### 2.3 Handover Lifecycle & State Machine
The handover moves through 5 immutable sequential states:
```
[ Handover Requested ]
        │ (Recycler confirms)
        ▼
    [ Confirmed ]
        │ (Collector hands over e-waste)
        ▼
[ E-Waste Handed Over ]
        │ (Recycler releases payout)
        ▼
 [ Payment Received ]
        │ (Recycler marks completed)
        ▼
    [ Completed ]  ──► Generates immutable Digital Handover Record
```

### 2.4 Error Normalization & Resilience
All client network requests pass through `src/api/request.js`:
- Technical `TypeError: Failed to fetch` errors (offline backend, DNS failures) are normalized into localized, human-friendly connection notices.
- Server error payloads (`detail` strings from FastAPI) are preserved and surfaced directly to UI alerts.

---

## 3. Threat Model & Security Posture

1. **Authentication**: SHA-256 password hashing with random salt; short-lived signed JWT bearer tokens (`HS256`).
2. **Role-Based Access Control**:
   - Only collectors can create lots and initiate handovers.
   - Only authorized recyclers can advance handover statuses and mark payments.
   - Collectors and recyclers can only view records they own.
3. **Voice Safety**: Zero voice-driven financial execution; voice acts exclusively as a navigation and assistive tool.
4. **Data Isolation**: Mongo queries scope all private records by `collector_id` or `recycler_id`.

```
