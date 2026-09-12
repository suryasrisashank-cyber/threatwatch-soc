# ThreatWatch — 60 to 90-Second Recruiter Demo Guide

A second-by-second demonstration walkthrough designed for SOC hiring managers, technical recruiters, and senior security engineers.

---

## Demo Overview
- **Duration**: ~80 seconds (fits comfortably in 60–90 second window)
- **Target Audience**: Cybersecurity Recruiters, SOC Leads, Blue Team Managers
- **Core Message**: Demonstrates practical hands-on capability across the full SOC analyst lifecycle without exaggerated claims or simulated fluff.

---

## Second-by-Second Demo Timeline

```text
  00:00        00:18            00:42                01:02          01:20
    │            │                │                    │              │
    ▼            ▼                ▼                    ▼              ▼
[Dashboard]  [SIEM Explorer]   [Windows 4688]      [Playbook]     [Debrief Report]
  Overview    Log Triage &     PowerShell Decode   Containment    Lifecycle Summary
  & Metrics   Entity Filter    & C2 Beacon Triage  (Host Isolate) & Closing Pitch
```

---

### [00:00 – 00:08] Scene 1: Executive Dashboard & Problem Statement
* **On Screen**: `http://localhost:3000/dashboard` (Full screen, 1080p).
* **Visual Action**: Hover cursor smoothly over the telemetry cards (Total Events, Active Alerts, Open Incidents, Severity Breakdown).
* **Narration**:
  > *"ThreatWatch is a portfolio SOC Tier 1 detection and incident response platform that simulates security operations in a safe offline environment."*

---

### [00:08 – 00:18] Scene 2: Live Telemetry & Detection Engine
* **On Screen**: `http://localhost:3000/dashboard` (Live Event Stream ticker & Alerts breakdown).
* **Visual Action**: Point out the live WebSocket event counter ticking upward as synthetic telemetry streams in.
* **Narration**:
  > *"Security telemetry—spanning Windows Event Logs, perimeter firewalls, and mail gateways—is continuously simulated and evaluated in real time by an in-memory Python detection engine with zero cloud dependencies."*

---

### [00:18 – 00:30] Scene 3: SIEM Explorer & Multi-Source Log Triage
* **On Screen**: Click **SIEM Explorer** (`http://localhost:3000/siem`).
* **Visual Action**:
  1. Filter by `Source: Windows` or `Severity: High`.
  2. Click on a `FAILED_LOGIN` (Event ID 4625) or `SUSPICIOUS_PROCESS` (Event ID 4688) log row to expand raw JSON / parsed fields.
* **Narration**:
  > *"I can investigate incoming telemetry directly through the SIEM explorer. Here we inspect parsed timestamps, source IPs, affected usernames, and raw event data to distinguish True Positives from benign noise."*

---

### [00:30 – 00:42] Scene 4: Visual Investigation & Entity Correlation
* **On Screen**: Click **Investigations** (`http://localhost:3000/investigations`).
* **Visual Action**: Show the relational entity graph connecting nodes: **Alert $\rightarrow$ Event $\rightarrow$ User $\rightarrow$ Host $\rightarrow$ IP $\rightarrow$ IOC $\rightarrow$ Incident**.
* **Narration**:
  > *"In the Investigation Workspace, disparate alerts are correlated into a single contextual attack graph. Analysts can trace the relationship from an alert down to the specific user account, compromised workstation, external attacker IP, and threat intelligence indicators."*

---

### [00:42 – 00:52] Scene 5: Endpoint Forensics & Obfuscated PowerShell
* **On Screen**: Click **Windows Security** (`http://localhost:3000/windows`).
* **Visual Action**: Select Event ID 4688 (`powershell.exe -EncodedCommand ...`), click **Decode Base64**, revealing the hidden download cradle payload connecting to C2 IP `45.33.32.156`.
* **Narration**:
  > *"Here in the Windows Security view, we analyze Event ID 4688 process creation trees. Using the built-in decoder, we safely de-obfuscate Base64 PowerShell arguments to extract external staging URLs and command-and-control IPs without executing dangerous code."*

---

### [00:52 – 01:02] Scene 6: MITRE ATT&CK Framework Mapping
* **On Screen**: Click **MITRE ATT&CK** (`http://localhost:3000/mitre`).
* **Visual Action**: Click on technique **T1059.001 (PowerShell)** and **T1110.001 (Password Guessing)** showing tactical coverage and data sources.
* **Narration**:
  > *"Every alert and event maps directly to the MITRE ATT&CK framework. For example, our encoded command triggers T1059.001 under Execution, linking detection logic directly to standardized threat actor behavior."*

---

### [01:02 – 01:12] Scene 7: Incident Response Playbooks & Containment
* **On Screen**: Click **Incidents** (`http://localhost:3000/incidents/2`) or **Playbooks** (`http://localhost:3000/playbooks`).
* **Visual Action**: Click the simulated containment trigger: **Isolate Host (Quarantine Network)** and **Block Attacker IP**. Show the action appended to the chronological incident timeline.
* **Narration**:
  > *"Following NIST SP 800-61 response playbooks, analysts execute containment workflows—such as isolating the endpoint and dropping the attacker's IP at the firewall—with every action audited in the timeline."*

---

### [01:12 – 01:20] Scene 8: Post-Incident Debrief Report & Closing Pitch
* **On Screen**: Click **Reports** (`http://localhost:3000/reports`).
* **Visual Action**: Scroll through the generated executive summary and technical root-cause breakdown.
* **Narration**:
  > *"Finally, ThreatWatch compiles formal debrief reports for executive leadership. ThreatWatch demonstrates the complete SOC workflow: Detect $\rightarrow$ Triage $\rightarrow$ Investigate $\rightarrow$ Correlate $\rightarrow$ Respond $\rightarrow$ Report."*

---

## Presenter Delivery Tips
1. **Pacing**: Speak at a clear, measured pace (~130–140 words per minute).
2. **Mouse Movements**: Move the mouse smoothly without frantic clicking or circular twitches.
3. **Audio Quality**: Use a dedicated headset or USB microphone; eliminate room echo.
4. **Resolution**: Record at 1920×1080 (16:9), 60 FPS for crisp typography and smooth scrolling.
