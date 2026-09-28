# EcoScrap — Comprehensive SIH Jury Q&A Defense Guide

> **Core Philosophy:** Factual, technically honest answers based strictly on the actual codebase. Never exaggerate or invent metrics.

---

## Part 1: Problem & Target Audience

### 1. What problem are you solving?
India generates over 1.7 million tonnes of e-waste annually, and over 80% flows through the informal sector (waste pickers, local *kabadiwalas*). These collectors lack daily market transparency, face arbitrary price exploitation, cannot easily discover authorized recyclers, and cannot participate in Extended Producer Responsibility (EPR) credit systems because their transactions are paperless and untraced. Additionally, conventional enterprise applications exclude low-literacy collectors.

### 2. Who are the target users?
Two primary user roles:
1. **Informal Waste Collectors (*kabadiwalas*)**: Individuals aggregating e-waste from households, small businesses, and repair shops. They need voice-first navigation, visual cards, instant material identification, and indicative prices.
2. **Authorized Recyclers & Aggregators**: Formal recycling facilities requiring steady, sorted e-waste streams with verifiable digital handover trails for EPR compliance.

### 3. Why focus on informal e-waste collectors instead of consumers?
Informal collectors are the primary operational backbone of waste aggregation in India. While consumer awareness campaigns collect minimal volume, *kabadiwalas* aggregate tons of material daily. Empowering them with price transparency and direct authorized recycler access formalizes the largest volume of e-waste at the lowest operational cost.

---

## Part 2: AI & Material Identification

### 4. Why MobileNetV3? Why not a larger model like ResNet-50 or ViT?
MobileNetV3-Small was selected for its balance of high accuracy and computational efficiency. With depthwise separable convolutions and squeeze-and-excitation blocks:
- **Model weight is only 6.28 MB** (`backend/ai/model/e_waste_mobilenetv3.pth`).
- Inference latency is under 50ms on CPU, making it cost-effective to serve without requiring expensive GPU clusters.
- It can easily be converted to ONNX or TensorFlow Lite for future on-device edge execution.

### 5. What is your model accuracy and evaluation dataset?
The model is trained on 23,960 images and evaluated on a balanced test set of 1,800 images (100 per class across 18 classes).
- **Overall Test Accuracy: 93.72%**
- **Macro Average F1-score: 0.9382**
- High-volume category recall: PCB 90%, Battery 95%, Mobile 96%, Laptop 97%, Mouse 99%, Keyboard 99%.

### 6. What happens when AI confidence is low?
In `AIResultPage.jsx`, if the model confidence is `< 70%`, a visual warning banner appears: *"Low confidence prediction. Please verify the category before proceeding."* The user can select the correct category manually or retake the photo. The AI provides decision support, not an infallible final decision.

### 7. What are the current model limitations?
The model is trained on 18 defined classes. It struggles with heavily burnt, severely crushed, or mixed composite scrap. Lighting conditions and background clutter also affect confidence.

### 8. How will you improve the model?
We plan to implement active learning: low-confidence or manually corrected predictions submitted by collectors can be anonymized and flagged for retraining, expanding domain diversity across Indian scrap variations.

---

## Part 3: Pricing Engine

### 9. How does price estimation work?
Price estimation combines two layers:
1. **Machine Learning Regressor**: A scikit-learn `RandomForestRegressor` pipeline (200 estimators) trained on scrap transaction records factoring in material category, subcategory, location, and weight.
2. **Baseline Floor Rates**: Configured base rates per kg ensuring estimates never drop below regional floor prices.

### 10. Where does price data come from?
Historical scrap trade records in the pilot region (`datasets/prices/price_dataset.csv`) supplemented by periodic recycler rate updates from authorized recyclers in Gorakhpur, Deoria, and Lucknow.

### 11. Is the price guaranteed?
**No.** We explicitly present the output as an **Indicative Value** (अनुमानित मूल्य). The actual settlement depends on physical inspection by the recycler (purity, grade, contamination, and current day metal spot prices).

### 12. How will you improve price accuracy?
By integrating with secondary commodities market indices (MCX copper/aluminum/gold scrap spot rates) and dynamically adjusting regional price multipliers based on recycler transaction logs.

---

## Part 4: Recycler Discovery & Matching

### 13. How does recycler matching work? Is it AI-based?
Recycler matching is **deterministic multi-criteria ranking**, not black-box ML. It calculates a composite suitability score based on:
- Authorization status (+40 points for CPCB/SPCB authorized recyclers)
- Exact location match (+30 points)
- Service area coverage (+20 points)
- Pickup capability (+20 points)
- Material acceptance (+10 points)
Recyclers are sorted by descending composite score.

### 14. How do you determine authorization?
The `authorization_status` field in the recycler profile is verified against state pollution control board (SPCB) registration registers during onboarding. In this prototype, the records are maintained in `datasets/recyclers/recyclers.csv` and seeded into MongoDB.

---

## Part 5: Handover Lifecycle & Traceability

### 15. What is the handover lifecycle?
A strict 5-step finite state machine:
`Request Sent` → `Confirmed` (by recycler) → `E-Waste Handed Over` (physical transfer) → `Payment Received` (settlement) → `Completed`.

### 16. What is the Digital Handover Record?
Accessible at `/handover/:id/record`, it generates an auditable record containing: Lot ID, Handover ID, collector name, recycler name, material category, verified weight, transaction timestamp, and a `Verified` status seal upon completion. This digital trail directly supports EPR reporting.

### 17. Is this on blockchain?
No. EcoScrap uses an append-only MongoDB document structure with state transition validation in FastAPI. Blockchain was not introduced in this phase to prevent unnecessary complexity and gas fees for low-margin informal collectors. Cryptographic hashing of completed records is planned for the next phase.


---

## Part 6: Voice Assistant & Safety

### 18. Why voice assistance?
Many informal collectors have limited functional literacy and struggle with dense form inputs, but are fluent in regional spoken dialects. Voice bridges this literacy divide.

### 19. Which technology powers the voice assistant?
Browser-native **Web Speech API** (`window.SpeechRecognition` and `window.speechSynthesis`). This requires zero third-party cloud audio subscriptions, keeps latency minimal, and works natively across modern browsers.

### 20. Which languages are supported?
English (`en-US`), Hindi (`hi-IN`), and Marathi (`mr-IN`), with phonetic aliases matching common scrap terminology (e.g., *"mera maal"*, *"bhaav dekho"*, *"paisa"*).

### 21. Can a user perform financial actions by voice alone?
**Absolutely not.** Voice is strictly restricted to navigation and assistive queries. Any transactional or destructive command (`submit lot`, `pay`, `confirm`, `delete`) is intercepted by `src/utils/voiceCommands.js` and blocked with spoken feedback directing the user to confirm via on-screen buttons. This is a deliberate safety-by-design architectural decision.

### 22. What happens if microphone access is denied?
The application functions completely via visual cards and buttons without degradation. As the tagline states: *"Bolkar bhi chala sakte ho, buttons se bhi."*

---

## Part 7: Security & Scalability

### 23. How does authentication and authorization work?
- Password hashing using PBKDF2-style random salting and SHA-256 with constant-time digest comparison (`auth.py`).
- Signed JWT bearer tokens with 60-minute expiration.
- FastAPI dependency injection (`get_current_user`, `require_role`) enforces role-based access control (RBAC). Collectors cannot update recycler statuses; recyclers cannot create lots.

### 24. What happens if the internet goes down?
The application implements graceful network-failure normalization via `src/api/request.js`. If the server is unreachable, a human-friendly connection notice is displayed with retry options instead of raw technical exceptions (`TypeError: Failed to fetch`).

### 25. How would you scale this to 100,000 collectors?
1. Deploy FastAPI horizontally behind an NGINX / Cloudflare load balancer with stateless JWT tokens.
2. Serve the PyTorch model via TorchServe or Triton Inference Server with batching.
3. Migrate MongoDB to a replica set with sharding on `collector_id`.
4. Cache daily price boards and recycler directories in Redis.


---

## Part 8: Tough Jury Challenge Questions

### 26. "Is this really AI, or just a React template with an API?"
The core classification is a genuinely trained PyTorch MobileNetV3 convolutional neural network fine-tuned on 27,000+ e-waste images with verified 93.72% test accuracy. The price estimation uses a scikit-learn RandomForest regression pipeline. Deterministic logic is intentionally used for recycler ranking and voice safety where explainability and strict safety are paramount.

### 27. "Why would an authorized recycler trust your AI's weight or classification?"
The AI provides preliminary intake categorization for sorting and aggregation. Final settlement is always confirmed by the recycler at the physical handover step, where the recycler enters verified weights before marking the transaction completed.

### 28. "Where is your live real-time scrap market feed?"
India currently lacks an automated public REST API for informal scrap market spot prices. Our prototype uses regional historical transaction datasets and recycler base rate matrices. Production integration with secondary metals exchanges (MCX scrap indices) is part of our future roadmap.

### 29. "Is real money transferred during the demo?"
No. The current prototype models the payment lifecycle (`Pending` → `Paid`) through state machine transitions. Real financial settlement would be integrated via UPI AutoPay, Razorpay, or escrow accounts in a production deployment.

### 30. "What if a collector uploads a photo of their dog or an apple?"
The model will output a prediction based on its 18 trained classes with a low confidence score (<70%). The system flags this with a low-confidence warning card, alerting the user to re-verify or re-take the photo. Out-of-distribution rejection (energy-based or temperature scaling) is planned for the next model iteration.

### 31. "What makes EcoScrap uniquely suited for SIH?"
It tackles an urgent environmental problem (unregulated e-waste dumping and toxic burning) by directly empowering the most marginalized stakeholder in the value chain (informal collectors) through practical low-literacy technology (voice + AI + fair pricing + digital traceability).

### 32. "What are the top 3 things you will build after the hackathon?"
1. UPI / Escrow payment gateway integration upon physical handover completion.
2. Offline-first Progressive Web App (PWA) with on-device SQLite sync.
3. Direct automated export of Digital Handover Records to state pollution control board (SPCB) EPR portals.

