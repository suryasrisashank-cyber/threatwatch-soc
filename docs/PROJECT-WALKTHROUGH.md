# SentinelLab Project Walkthrough

A practical, technical guide to understanding the architecture, mechanics, and design of **SentinelLab** — an offline SOC Tier 1 attack detection and incident response training platform.

---

## 1. What SentinelLab Does

1. **SentinelLab** is an offline, synthetic Security Operations Center (SOC) training environment built to simulate real-world Tier 1 analyst workflows.
2. It generates realistic multi-source security telemetry, including Windows Security Event Logs (4624, 4625, 4688, 4740), Linux Syslog, Perimeter Firewall denials, DNS standard queries, and Email Gateway logs.
3. A built-in Python detection engine evaluates incoming telemetry against 7 signature and threshold rules in real time.
4. When suspicious activity exceeds detection criteria, the system automatically fires alerts categorized by severity (Critical, High, Medium, Low).
5. Analysts triage alerts within an interactive SIEM interface, filtering by source, severity, host, username, and time range.
6. A dedicated Visual Investigation Workspace reconstructs end-to-end incident relationships linking Alerts, Events, Users, Hosts, IP Addresses, and IOCs.
7. The platform maps all detections directly to MITRE ATT&CK Enterprise techniques (such as T1110, T1059.001, and T1566.001).
8. Analysts execute containment actions (such as host quarantine, IP blocking, or credential revocation) aligned with standardized NIST SP 800-61 / SANS incident response playbooks.
9. An automated reporting engine compiles formal executive summaries and technical root cause debriefs exportable to print or PDF.
10. All data, indicators, and events are 100% synthetic and execute locally, ensuring a completely safe, zero-risk learning environment.

---

## 2. Overall Architecture

```text
               ┌──────────────────────────────────────────────┐
               │          SOC Analyst / Recruiter             │
               │   (Browser: Chrome, Edge, Safari, Firefox)   │
               └───────────────────────┬──────────────────────┘
                                       │
                                       ▼ HTTP / WebSocket
               ┌──────────────────────────────────────────────┐
               │            Next.js 15 Frontend               │
               │   React 19 • TypeScript • Tailwind CSS       │
               │   • Dashboard        • SIEM Explorer         │
               │   • Visual Graph     • Incident Triage       │
               │   • Windows Analyzer • MITRE Navigator       │
               │   • Threat Intel IOC • Guided Labs (1–7)     │
               └───────────────────────┬──────────────────────┘
                                       │
                        API Proxy Rewrites (/api/*, /ws/*)
                                       ▼
               ┌──────────────────────────────────────────────┐
               │             FastAPI Backend                  │
               │   Python 3.11+ • Uvicorn • Pydantic          │
               │                                              │
               │   ┌──────────────────────────────────────┐   │
               │   │      Background Simulation Loop      │   │
               │   │  Generates Synthetic Telemetry Pool  │   │
               │   └──────────────────┬───────────────────┘   │
               │                      ▼                       │
               │   ┌──────────────────────────────────────┐   │
               │   │      In-Memory Detection Engine      │   │
               │   │   7 Detection Rules • Sliding Window │   │
               │   └──────────────────┬───────────────────┘   │
               │                      ▼                       │
               │   ┌──────────────────────────────────────┐   │
               │   │       WebSocket Event Manager        │   │
               │   │   Broadcasts live events & alerts    │   │
               │   └──────────────────────────────────────┘   │
               └───────────────────────┬──────────────────────┘
                                       │
                              SQLAlchemy ORM
                                       ▼
               ┌──────────────────────────────────────────────┐
               │           SQLite Database (Local)            │
               │   • events           • alerts                │
               │   • incidents        • iocs                  │
               │   • investigations   • labs & attempts       │
               │   • playbooks        • mitre_techniques      │
               │   • hosts            • users                 │
               └──────────────────────────────────────────────┘
```

### Architectural Flow Summary
1. **User / Analyst** interacts with the responsive Next.js web application.
2. **Next.js Frontend** presents the SOC interface and forwards API/WebSocket requests through built-in Next.js rewrites to eliminate cross-origin complexity.
3. **FastAPI Backend** hosts REST endpoints and runs an asynchronous background simulation loop (`simulation_service.py`).
4. **Detection Engine** monitors newly committed events, correlates recent event history in sliding windows, and triggers alert records.
5. **Synthetic Security Events** are persisted in SQLite and pushed over WebSockets to live UI counters and log tables.
6. **Alerts & Incidents** are cataloged with assigned analysts, statuses, and severities.
7. **Visual Investigation Workspace** renders entity graph nodes (Alert $\rightarrow$ Event $\rightarrow$ User $\rightarrow$ Host $\rightarrow$ IP $\rightarrow$ IOC $\rightarrow$ Incident).
8. **Threat Intelligence / IOC Analysis** cross-references indicators (IPs, hashes, domains, filenames) with confidence scores.
9. **MITRE ATT&CK Integration** aligns tactical adversary techniques with SOC findings.
10. **Incident Response Playbooks** guide step-by-step containment, eradication, and recovery.
11. **Incident Reports** summarize the timeline, affected assets, and root causes for leadership.

---

## 3. Frontend Structure

The frontend is located under `frontend/` and built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide React** icons.

```text
frontend/
├── next.config.js               # Reverse proxy rewrites for /api and /ws
├── package.json                 # Next.js 15, React 19, Tailwind dependencies
├── src/
│   ├── app/                     # Next.js App Router routes
│   │   ├── layout.tsx           # Global layout with persistent Sidebar and Navbar
│   │   ├── page.tsx             # Landing hero and quick-launch portal
│   │   ├── dashboard/page.tsx   # SOC Command Center overview & high-level telemetry
│   │   ├── siem/page.tsx        # Multi-source log search & filtering engine
│   │   ├── alerts/page.tsx      # Alert queue with triage status transitions
│   │   ├── incidents/page.tsx   # Incident management & 7-stage NIST lifecycle
│   │   ├── investigations/page.tsx # Visual node-link investigation graph
│   │   ├── windows/page.tsx     # Windows Event Log (4624/4625/4688) & Base64 decoder
│   │   ├── phishing/page.tsx    # RFC 822 email header analyzer & attachment inspector
│   │   ├── network/page.tsx     # Network flow metrics, port scan & DDoS analyzer
│   │   ├── iocs/page.tsx        # Threat intelligence indicator database
│   │   ├── mitre/page.tsx       # MITRE ATT&CK Matrix tactical navigator
│   │   ├── playbooks/page.tsx   # Step-by-step incident response operational playbooks
│   │   ├── reports/page.tsx     # Post-incident report generator & PDF preview
│   │   ├── labs/page.tsx        # Interactive guided lab catalog (Labs 1–7)
│   │   ├── labs/[id]/page.tsx   # Interactive lab workspace with evidence & scoring
│   │   └── settings/page.tsx    # Simulation speed, database reset, and lab controls
│   ├── components/
│   │   ├── Navbar.tsx           # Header bar with live simulation status & controls
│   │   └── Sidebar.tsx          # Collapsible navigation menu categorized by SOC phase
│   └── lib/
│       ├── api.ts               # Typed client fetch wrapper for all backend routes
│       └── utils.ts             # Date formatters, severity badges, and class helper
```

### Key Frontend Files Detailed

| File | Purpose | What It Does | Why It Exists |
| :--- | :--- | :--- | :--- |
| `next.config.js` | API / WebSocket Proxy | Rewrites `/api/:path*` to `http://127.0.0.1:8000/api/:path*` and `/ws/:path*` to port 8000. | Allows the client browser to make requests without CORS restrictions or hardcoded hostnames. |
| `src/lib/api.ts` | Centralized API Client | Provides typed async functions (`api.getEvents()`, `api.getAlerts()`, etc.) wrapping native `fetch()`. | Keeps network logic cleanly separated from UI components and enforces error handling. |
| `src/app/layout.tsx` | Root Shell Layout | Wraps every route in a dark-themed SOC shell with `Sidebar` and top `Navbar`. | Ensures persistent navigation and real-time status across all analyst views. |
| `src/app/dashboard/page.tsx` | Executive SOC Dashboard | Displays total events, open alerts, active incidents, severity distribution charts, and recent activity. | Gives recruiters and analysts an instant 10-second overview of security posture. |
| `src/app/siem/page.tsx` | SIEM Log Explorer | Renders searchable table of all raw and parsed events with filters for severity, source, host, user, and text search. | Mirrors production SIEM tools (Splunk, Elastic, QRadar) for raw log hunting. |
| `src/app/investigations/page.tsx` | Visual Investigation Workspace | Parses `nodes_json` and `edges_json` into an entity graph and chronological timeline. | Demonstrates an analyst's ability to correlate disparate alerts into a unified threat narrative. |
| `src/app/windows/page.tsx` | Windows Security Forensics | Dedicated viewer for Event IDs 4624, 4625, 4688, and 4740 with an interactive Base64 command decoder. | Essential for practicing endpoint triage and understanding obfuscated PowerShell commands. |
| `src/app/phishing/page.tsx` | Email Header & Lure Analyzer | Renders raw RFC 822 email headers, SPF/DKIM verification tags, and attachment hash inspection. | Simulates email gateway triage for spearphishing and malicious droppers. |
| `src/app/labs/[id]/page.tsx` | Interactive Lab Engine | Displays scenario background, authentic evidence artifacts, interactive questions, hints, and automated 0–100 scoring. | Provides structured, hands-on learning with measurable proficiency assessment. |

---

## 4. Backend Structure

The backend is located under `backend/` and built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic**, and **Uvicorn**.

```text
backend/
├── app/
│   ├── main.py                  # FastAPI entry point, lifespan handler, router mounting
│   ├── api/                     # REST API endpoints
│   │   ├── alerts.py            # List, filter, get by ID, patch status, escalate alert
│   │   ├── events.py            # Query logs, filter by host/user/time, get log stats
│   │   ├── health.py            # Application health, database status, system metrics
│   │   ├── incidents.py         # Incident creation, status/stage updates, timeline events
│   │   ├── investigations.py    # Visual investigation entity graph and timeline notes
│   │   ├── iocs.py              # Query, filter, and register threat intelligence indicators
│   │   ├── labs.py              # List labs, get lab details, grade submissions
│   │   ├── mitre.py             # MITRE ATT&CK techniques, tactics, and data sources
│   │   ├── playbooks.py         # Standardized SOC response playbooks
│   │   ├── reports.py           # Generate and retrieve post-incident reports
│   │   └── simulation.py        # Control background simulation, WebSocket connection
│   ├── database/
│   │   ├── connection.py        # SQLAlchemy engine and SQLite session factory
│   │   └── seed.py              # Database seeder (events, alerts, labs, playbooks, IOCs)
│   ├── models/                  # SQLAlchemy ORM database models
│   │   ├── alert.py             # Alert model
│   │   ├── event.py             # SecurityEvent model
│   │   ├── host.py              # Host inventory model
│   │   ├── incident.py          # Incident model (NIST stages & actions)
│   │   ├── investigation.py     # Visual graph nodes/edges model
│   │   ├── ioc.py               # Threat intelligence IOC model
│   │   ├── lab.py               # Lab scenarios & user attempts model
│   │   ├── mitre.py             # MITRE ATT&CK technique model
│   │   ├── playbook.py          # Response playbook model
│   │   ├── report.py            # Formal incident debrief report model
│   │   └── user.py              # User account inventory model
│   ├── schemas/
│   │   └── schemas.py           # Pydantic request/response validation schemas
│   ├── services/                # Business logic engines
│   │   ├── detection_engine.py  # 7 detection rules with sliding-window correlation
│   │   ├── lab_service.py       # Automated grading and tier classification
│   │   ├── report_service.py    # Automated incident debrief compiler
│   │   └── simulation_service.py # Background event generator and WebSocket broadcaster
│   └── websocket/
│       └── manager.py           # Connection manager for broadcasting live events
└── tests/
    └── test_backend.py          # Comprehensive pytest suite covering all endpoints
```

---

## 5. Event Flow

Here is the exact lifecycle of how an event travels through SentinelLab:

```text
[1. Synthetic Event Generated]
    Simulation Service picks template from SYNTHETIC_EVENT_POOL or generates custom event.
              │
              ▼
[2. Database Persistence]
    Event is saved into SQLite table 'events' via SQLAlchemy SessionLocal.
              │
              ▼
[3. Detection Engine Evaluation]
    Detection Engine fetches recent event history (limit 20) for the source IP/host.
    Evaluates all 7 registered DetectionRules against (current_event, history).
              │
              ├──► [No Match] ──► Event remains in SIEM log table.
              │
              ▼ [Rule Match!]
[4. Alert Generation & Deduplication]
    Engine verifies no un-resolved identical alert exists within 1 minute.
    Creates new Alert record in table 'alerts' with severity, description, and MITRE ID.
              │
              ▼
[5. WebSocket Broadcast]
    Payload { type: "security_event", event: {...}, alerts: [...] } broadcast to all connected browsers.
              │
              ▼
[6. Analyst Dashboard / SIEM]
    Frontend UI updates live counters (Events, Alerts) and appends row to SIEM / Alerts table.
              │
              ▼
[7. Investigation & MITRE Correlation]
    Analyst opens Visual Investigation Workspace.
    Graph connects Alert ──► Event ──► User ──► Host ──► IP ──► IOC ──► MITRE.
              │
              ▼
[8. Incident Response Playbook]
    Analyst opens Incident #, follows Playbook steps (e.g. Host Quarantine, IP Block).
    Actions recorded in incident timeline.
              │
              ▼
[9. Incident Report Generation]
    Report Service aggregates alerts, IOCs, timeline, and produces formal post-incident report.
```

---

## 6. Detection Engine

The detection engine (`backend/app/services/detection_engine.py`) implements an object-oriented rule architecture with a base class `DetectionRule` and 7 concrete rules:

| Rule ID | Rule Name | Input Event Source | Detection Condition | Severity | Alert Generated | MITRE Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RULE-AUTH-001` | `BRUTE_FORCE_DETECTION` | Windows Security / Linux Auth | 3 or more failed logins (`FAILED_LOGIN` or Event ID 4625) from same source IP within 300 seconds (5 mins). | **HIGH** | `Brute Force Authentication Burst Detected from {src_ip}` | `T1110.001` (Password Guessing) |
| `RULE-NET-002` | `PORT_SCAN_DETECTION` | Perimeter Firewall Logs | Rapid connection drops across 4 or more distinct destination ports from same source IP. | **MEDIUM** | `Network Port Scan / Reconnaissance from {src_ip}` | `T1046` (Network Service Scanning) |
| `RULE-ENDPOINT-003` | `SUSPICIOUS_POWERSHELL` | Windows Security (Event 4688) / Sysmon | PowerShell command line containing flags: `-enc`, `-encodedcommand`, `bypass`, `invoke-webrequest`, `downloadstring`, `iex`. | **HIGH** | `Suspicious Obfuscated PowerShell Execution on {host}` | `T1059.001` (PowerShell) |
| `RULE-EMAIL-004` | `PHISHING_DETECTION` | Email Gateway / Postfix | Inbound message with `spf=fail` combined with keywords `invoice`, `password`, or `verify`. | **MEDIUM** | `Inbound Spearphishing / Spoofed Lure Targeting {username}` | `T1566.001` (Spearphishing Attachment) |
| `RULE-IOC-005` | `MALWARE_IOC_MATCH` | Endpoint / DNS / Network | Event message or log matching known threat indicators (`malicious-c2.net`, `45.33.32.156`, `evil_dropper.exe`, hash `e3b0c4...`). | **CRITICAL** | `Malware Indicator of Compromise (IOC) Detected on {host}` | `T1071.001` (Web Protocols C2) |
| `RULE-WEB-006` | `SQL_INJECTION_DETECTION` | Web Server / Nginx Logs | HTTP request URI or query containing SQL metacharacters (`union select`, `' or 1=1`, `sleep(`, `information_schema`). | **HIGH** | `SQL Injection Attack Attempt Against Web Server from {src_ip}` | `T1190` (Exploit Public-Facing Application) |
| `RULE-NET-007` | `DDOS_TRAFFIC_ANOMALY` | Router / NetFlow Telemetry | Event log indicating volumetric SYN flood, traffic spikes, or abnormal connection rate surge. | **CRITICAL** | `DDoS Volumetric Traffic Spike Directed at {host}` | `T1498.001` (Direct Network Flood) |

---

## 7. Investigation Workflow

In SentinelLab, an investigation is modeled as a connected relational entity graph:

```text
[ALERT] (e.g. Suspicious Obfuscated PowerShell)
   │
   ├──► [EVENT] (Windows Security Event ID 4688: Process Creation)
   │       │
   │       ├──► [USER] (alex.executive)
   │       │
   │       └──► [HOST] (WORKSTATION-CEO.corp.local)
   │
   ├──► [IP] (External C2 IP: 45.33.32.156)
   │       │
   │       └──► [IOC] (Domain: malicious-c2.net | Hash: e3b0c442...)
   │
   └──► [MITRE ATT&CK] (T1059.001: Execution via PowerShell)
           │
           └──► [INCIDENT] (INC-2026-002: Executive Phishing & C2 Dropper)
```

### Implementation Details:
- **Storage**: Table `investigations` holds `nodes_json` (array of typed entities `{ id, label, type }`) and `edges_json` (array of relationships `{ from, to, label }`).
- **Frontend Visualization**: `frontend/src/app/investigations/page.tsx` maps each node type to distinct visual icons (`ShieldAlert` for alerts, `Server` for hosts, `Network` for IPs, `Fingerprint` for IOCs, `Layers` for MITRE techniques).
- **Correlation**: Analysts can inspect raw timestamps, see how the attacker moved across systems, and persist analyst notes directly into the database.

---

## 8. Incident Response

SentinelLab implements a 7-stage incident response lifecycle adhering to **NIST SP 800-61 Rev. 2** and **SANS Institute** guidelines:

1. **Detection**: Alert triggered by detection engine or reported by user.
2. **Triage**: Analyst verifies True Positive vs. False Positive, assigns severity, and claims ticket.
3. **Investigation**: Pivoting across logs, decoding payloads, correlating IOCs, and scoping affected hosts.
4. **Containment**: Taking immediate action to stop lateral movement and data exfiltration:
   - **Host Isolation / Quarantine**: Disabling network adapters to isolate endpoints.
   - **IP Perimeter Block**: Adding temporary firewall drop rules for attacker IP addresses.
   - **Account Lockout / Password Reset**: Invalidating compromised Active Directory sessions.
5. **Eradication**: Removing malware droppers, persistence registry keys, and terminating malicious processes.
6. **Recovery**: Restoring services, validating clean baseline telemetry, and unlocking accounts.
7. **Lessons Learned**: Compiling final incident debrief report and updating detection engineering rules.

All containment actions are logged chronologically into the incident's `actions_json` and `timeline_json` fields.

---

## 9. Database

- **Technology**: **SQLite** via **SQLAlchemy 2.0 ORM** (file `sentinellab.db`).
- **Design Rationale**: Zero configuration, no external Docker or PostgreSQL setup required, instant 5-second initial startup for recruiters and learners.

### Primary Tables & Models

| Model | Table Name | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `Event` | `events` | `id`, `timestamp`, `source`, `event_type`, `severity`, `source_ip`, `destination_ip`, `username`, `process`, `message`, `raw_log`, `mitre_technique` | Referenced by SIEM and Detection Engine |
| `Alert` | `alerts` | `id`, `title`, `severity`, `status`, `event_type`, `source_ip`, `detection_rule`, `mitre_technique`, `incident_id` | Belongs to `Incident` |
| `Incident` | `incidents` | `id`, `title`, `severity`, `status`, `stage`, `summary`, `affected_host`, `affected_user`, `timeline_json`, `actions_json` | Has many `Alert`, `IOC`, `Investigation`, `Report` |
| `Investigation` | `investigations` | `id`, `title`, `incident_id`, `status`, `nodes_json`, `edges_json`, `timeline_json`, `notes` | Belongs to `Incident` |
| `IOC` | `iocs` | `id`, `value`, `ioc_type`, `confidence`, `source`, `related_incident_id`, `notes` | Belongs to `Incident` |
| `Lab` | `labs` | `id`, `lab_number`, `title`, `category`, `difficulty`, `scenario`, `evidence_json`, `questions_json` | Has many `LabAttempt` |
| `LabAttempt` | `lab_attempts` | `id`, `lab_id`, `mode`, `score`, `completed`, `hints_used`, `answers_json`, `feedback_json` | Belongs to `Lab` and `User` |
| `Playbook` | `playbooks` | `id`, `title`, `category`, `trigger_condition`, `steps_json`, `containment_actions`, `mitre_technique_id` | Mapped to MITRE |
| `MitreTechnique`| `mitre_techniques`| `id`, `technique_id`, `name`, `tactic`, `description`, `detection_approach`, `data_sources` | Referenced across Alerts/Labs |
| `Host` | `hosts` | `id`, `hostname`, `ip_address`, `os`, `role`, `status` | Referenced by Events |
| `User` | `users` | `id`, `username`, `full_name`, `email`, `department`, `role` | Referenced by Events |
| `Report` | `reports` | `id`, `incident_id`, `title`, `executive_summary`, `technical_details`, `timeline_json` | Belongs to `Incident` |

---

## 10. API Communication

The frontend interacts with the backend through two channels:

1. **REST API over HTTP**:
   - Next.js defines reverse-proxy rewrites in `frontend/next.config.js`:
     ```javascript
     { source: "/api/:path*", destination: "http://127.0.0.1:8000/api/:path*" }
     ```
   - Client requests are made via `src/lib/api.ts` which performs standard `fetch()` calls to `/api/events`, `/api/alerts`, `/api/incidents`, etc.
   - Data payloads are validated with Pydantic schemas in `backend/app/schemas/schemas.py`.

2. **WebSockets for Real-Time Telemetry**:
   - Next.js proxies `/ws/:path*` to `ws://127.0.0.1:8000/ws/:path*`.
   - The frontend connects to `/ws/simulation` on page load.
   - When new events are generated by `simulation_service.py`, the backend broadcasts a JSON payload. The client updates state hooks instantly without page reloads.

---

## 11. Real-Time Simulation

- **Service**: `backend/app/services/simulation_service.py`.
- **Mechanics**:
  - Runs an asynchronous background task `_simulation_loop` managed by FastAPI's `lifespan` handler.
  - Generates events at configurable intervals depending on difficulty:
    - `BEGINNER`: 6.0 seconds per event
    - `INTERMEDIATE`: 3.5 seconds per event
    - `ADVANCED`: 1.8 seconds per event
  - Templates are randomly selected from `SYNTHETIC_EVENT_POOL` (benign logins, DNS queries, firewall drops, brute force spikes, port scans, obfuscated PowerShell, phishing, malware C2 beacons).
  - Every generated event is written to the database and submitted to `detection_engine.analyze_event()`.
  - Triggered alerts are deduplicated to avoid flooding the analyst view.
  - Broadcast is transmitted via `ConnectionManager` in `backend/app/websocket/manager.py`.

---

## 12. Security Model & Safe Execution

1. **Synthetic Telemetry**: All events, logs, and artifacts are 100% synthetic. No real networks or production hosts are ever touched.
2. **Safe Payloads**: Malicious command strings (e.g. Base64 PowerShell) are non-functional mock commands designed for inspection and decoding only.
3. **No External Network Calls**: Detections, threat intel lookups, and grading occur entirely offline within the local Python runtime.
4. **Reserved IP Ranges**: All simulated external attacker addresses use RFC 5737 (`198.51.100.0/24`, `203.0.113.0/24`, `192.0.2.0/24`) and RFC 1918 private blocks.
5. **No Real Secrets**: No hardcoded API keys, passwords, authentication tokens, or sensitive credentials exist in the codebase.
