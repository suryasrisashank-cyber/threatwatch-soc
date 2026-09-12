# SentinelLab Demo Recording Guide (60–90s)

This guide details how to record a concise, high-impact **60–90 second portfolio walkthrough video** of SentinelLab for recruiters and security hiring managers.

> **Video Destination**: Place your finished MP4 video file at:  
> `docs/demo/sentinellab-demo.mp4`

---

## 🎥 Recommended Recording Settings

| Setting | Recommendation |
| :--- | :--- |
| **Tool** | OBS Studio, Screen Studio, Loom, or Windows Game Bar (`Win + Alt + R`) |
| **Resolution** | 1920×1080 (1080p) or 2560×1440 (1440p) |
| **Frame Rate** | 60 fps or 30 fps |
| **Browser** | Chrome or Edge maximized in full screen (`F11`) with bookmarks hidden |
| **Format** | MP4 (H.264 video codec, AAC audio) |
| **Target Length** | 70–80 seconds (strictly between 60 and 90 seconds) |

---

## 🔒 Security & Privacy Rules for Recording

- **Never display personal private LAN IPs** (e.g. `10.x.x.x` or `192.168.x.x` Wi-Fi addresses). Use `http://localhost:3000` in the browser URL bar.
- **Never expose credentials or `.env` files** during the video.
- Ensure browser tabs, personal bookmarks, and taskbar notifications are closed.
- Only synthetic entities (`alex.analyst`, `SRV-RDP-GATEWAY`, `198.51.100.23`) should be visible.

---

## 📋 Pre-Recording Checklist

1. **Start Backend Server**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Start Frontend Client**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Reset Sandbox to Clean State**:
   - Navigate to `http://localhost:3000/settings`.
   - Click **Reset Demo Environment** to ensure fresh baseline metrics and alerts.
4. **Activate Simulation**:
   - Click **Start** in the top navigation bar to begin live synthetic telemetry generation.
5. **Review the Walkthrough Script**:
   - Read [`docs/demo/DEMO-SCRIPT.md`](DEMO-SCRIPT.md) for the exact 10-second stage transitions.
