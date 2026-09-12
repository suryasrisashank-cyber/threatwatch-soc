# ThreatWatch — Screen Recording & Privacy Checklist

Follow this pre-flight checklist before capturing video demonstrations for recruiters, GitHub, or LinkedIn.

---

## 1. Pre-Recording System Verification

- [ ] **Backend Server Active**:
  - Run `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` inside `backend/`.
  - Verify endpoint `http://127.0.0.1:8000/api/health` returns `{"status": "ok", "database": "connected"}`.
- [ ] **Frontend Dev Server Active**:
  - Run `npm.cmd run dev` inside `frontend/`.
  - Navigate to `http://localhost:3000` and confirm clean page load.
- [ ] **Confirm Core Application Routes**:
  - [ ] **Dashboard** (`/dashboard`): Metrics cards load, WebSocket status indicator is green.
  - [ ] **Synthetic Events**: Live event stream increments every 3–6 seconds.
  - [ ] **Alerts Engine** (`/alerts`): Detection rules generate alerts; filtering works.
  - [ ] **SIEM Explorer** (`/siem`): Log table populates, search bar and severity filters operate.
  - [ ] **Investigations** (`/investigations`): Entity correlation graph and timeline render correctly.
  - [ ] **Windows Forensics** (`/windows`): Event 4688 Base64 decoder button functions properly.
  - [ ] **MITRE ATT&CK** (`/mitre`): Techniques display with tactic badges and details.
  - [ ] **Incident Response** (`/incidents`): Playbook containment triggers (quarantine/block) append to timeline.
  - [ ] **Reports** (`/reports`): Executive report renders and print/export preview functions.

---

## 2. Privacy & Information Security Audit

- [ ] **Zero Private LAN IPs**:
  - Ensure no local private subnets or internal network addresses (such as `10.x.x.x`, `192.168.x.x` home/office LAN IPs) appear in the browser address bar, terminal prompt, or UI.
- [ ] **Zero Real Secrets or Tokens**:
  - No `.env` files, API keys, JWT secrets, OAuth client secrets, or cloud tokens displayed.
- [ ] **Zero Passwords or Credentials**:
  - Browser autocomplete / saved password popups disabled.
- [ ] **Zero Personal Information**:
  - Hide local Windows user profiles (e.g. `C:\Users\MAHADEV\...`) by using clean browser full-screen mode (F11) or cropping terminal paths.
- [ ] **Clean Browser Profile**:
  - Close personal tabs, personal bookmarks bar, extension icons, and notification popups.
  - Use Incognito / Guest mode or a clean developer profile.
- [ ] **Fictional Brand Verification**:
  - Confirm all simulated entities use fictional names (`ExampleBank`, `AcmeCorp`) and reserved IP ranges (RFC 5737 `198.51.100.0/24`, `203.0.113.0/24`, `192.0.2.0/24`).

---

## 3. Recommended Recording Settings

| Parameter | Recommended Setting | Alternative |
| :--- | :--- | :--- |
| **Resolution** | **1920 × 1080 (1080p FHD)** | 2560 × 1440 (1440p QHD) |
| **Aspect Ratio** | **16:9** | 16:9 |
| **Frame Rate** | **60 FPS** (fluid UI scrolling) | 30 FPS |
| **Container Format** | **MP4 (H.264 / AAC)** | WebM |
| **Target Bitrate** | **8,000 – 12,000 kbps** | 6,000 kbps minimum |
| **Target Duration** | **60 – 90 seconds** | Max 120 seconds |
| **Browser Zoom** | **100% or 110%** (for optimal readability) | 100% |
| **Display Mode** | **F11 Fullscreen** (hides taskbar & tabs) | Dedicated Window Capture |

---

## 4. OBS Studio Configuration Guide

1. **Source Setup**: Add a `Window Capture` source targeting Chrome/Edge on `localhost:3000`.
2. **Audio Setup**:
   - Mute desktop system audio / notifications.
   - Use noise suppression filter on microphone input (RNNoise).
3. **Hotkeys**:
   - `F9`: Start/Stop Recording.
   - `F10`: Pause/Resume Recording.
4. **Output Destination**: Save raw video file to `docs/demo/threatwatch-demo.mp4`.
