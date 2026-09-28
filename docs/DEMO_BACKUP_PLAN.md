# EcoScrap — Live Demonstration Failure Recovery Plan

This playbook provides quick recovery actions if an unexpected failure occurs during a live SIH presentation or jury evaluation.

---

## 1. Backend Server Becomes Unreachable

### Symptoms
- Frontend shows a localized error message: *"Could not reach the server. Please check your internet connection and try again."*
- API calls fail with status code 500 or network connection errors.

### Immediate Action
1. Check terminal running the backend:
   ```bash
   curl http://127.0.0.1:8000/health
   ```
2. If the terminal process crashed, restart immediately:
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
3. Return to the browser, reload the page (`Ctrl + R`), and resume presentation.

---

## 2. Microphone or Voice Recognition Blocked

### Symptoms
- Clicking the microphone icon results in browser warning: *"Microphone access denied"* or Web Speech API error `not-allowed`.
- Voice button shows "Microphone not available".

### Recovery Action
1. **Explain the fallback gracefully:**
   > *"Notice that EcoScrap is built on our core philosophy: 'Bolkar bhi chala sakte ho, buttons se bhi.' When microphone permissions are restricted by strict browser policies or noisy auditorium acoustics, the user seamlessly switches to visual touchscreen buttons with zero friction."*
2. Tap the large visual icon button on screen (e.g. "Add E-Waste" / "Create Lot") to continue without delay.
3. If time allows to grant permission: Click the camera/microphone lock icon in the Chrome URL bar → Select **Allow** → Refresh page.

---

## 3. Camera / Live Webcam Capture Fails

### Symptoms
- Webcam modal shows black feed or permission denied.

### Recovery Action
1. Switch immediately to the **"Choose Photo"** (gallery file upload) option.
2. Select the pre-verified demo image:
   ```text
   docs/demo-assets/demo-pcb-sample.jpg
   ```
3. The image will process normally through the MobileNetV3 AI classifier, predicting **PCB** with **99.21%** confidence.

---

## 4. AI Prediction Fails or Model File Issue

### Symptoms
- Upload returns a 500 internal server error or unhandled model loading exception.

### Recovery Action
1. Verify model weights exist:
   ```bash
   Test-Path backend\ai\model\e_waste_mobilenetv3.pth
   ```
2. If corrupted or missing, confirm file path in `backend/ai/classifier.py`.
3. If live upload hangs, pivot to show the evaluated classification report:
   - Present `backend/ai/results/classification_report.txt` and `backend/ai/results/confusion_matrix.png` to demonstrate verified 93.72% test accuracy across 18 classes.

---

## 5. MongoDB Database Connection Interrupted

### Symptoms
- `/health` endpoint returns `{"status":"degraded","database":"disconnected"}`.

### Recovery Action
1. Start or restart the local MongoDB service:
   ```powershell
   net start MongoDB
   # Or launch mongod directly:
   mongod --dbpath <data-dir>
   ```
2. Verify connection via PowerShell:
   ```bash
   python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/health').read().decode())"
   ```

---

## 6. Demo Account Credentials Quick Reference

If a session expires or credentials are required:

| Role | Email | Password | Notes |
|---|---|---|---|
| **Collector (Primary)** | `collector@test.com` | `123456` | Main collector demo account |
| **Collector (QA)** | `qa.ecoscrap.collector@example.com` | `qa-pass-1234` | Clean QA account |
| **Recycler (QA)** | `qa.ecoscrap.recycler@example.com` | `qa-pass-1234` | Linked to R001 (GreenTech Recycling) |

---

## 7. Mandatory 12-Check Pre-Presentation Checklist (Run 10 Minutes Before Demo)

- [ ] MongoDB is running (`localhost:27017`).
- [ ] FastAPI backend running on port 8000 and `/health` returns `healthy`.
- [ ] Frontend Vite server running on port 5173.
- [ ] `docs/demo-assets/demo-pcb-sample.jpg` is present on desktop or easy-to-browse folder.
- [ ] Browser permissions for microphone allowed for `http://localhost:5173`.
- [ ] Audio volume is unmuted so speech synthesis audio cues can be heard clearly.
- [ ] Primary demo account `collector@test.com` tested and working.
- [ ] Secondary recycler account `qa.ecoscrap.recycler@example.com` ready in incognito/secondary tab for handover approval.
