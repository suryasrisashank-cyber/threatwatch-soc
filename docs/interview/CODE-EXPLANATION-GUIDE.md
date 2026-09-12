# SentinelLab — "Explain My Code" Architectural & Codebase Guide

A deep-dive technical reference guide explaining the core source code files of **SentinelLab**. Use this document before technical interviews to speak with absolute clarity and authority about how your application is built and why specific architectural decisions were made.

---

## 1. Detection Engine (`backend/app/services/detection_engine.py`)

### 1. What the File Does
Implements the core threat detection engine. It defines an extensible object-oriented rule framework (`DetectionRule`) and 7 concrete detection rules that inspect single events as well as multi-event sliding windows.

### 2. Main Classes & Functions
- `DetectionRule` (Base Class): Defines rule metadata (`rule_id`, `name`, `severity`, `mitre_technique`, `evidence_requirements`) and the abstract method `evaluate(current_event, event_history)`.
- `BruteForceRule` (`RULE-AUTH-001`): Counts failed logins (`FAILED_LOGIN` or Event ID 4625) from the same IP within 300 seconds.
- `PortScanRule` (`RULE-NET-002`): Tracks connection drops across $\ge 4$ unique destination ports.
- `SuspiciousPowerShellRule` (`RULE-ENDPOINT-003`): Detects PowerShell execution with `-enc`, `bypass`, or download cradles.
- `PhishingRule` (`RULE-EMAIL-004`): Detects `spf=fail` combined with social engineering keywords.
- `MalwareIOCRule` (`RULE-IOC-005`): Matches telemetry against known IOC values (C2 IPs, malicious hashes, dropper names).
- `SQLInjectionRule` (`RULE-WEB-006`): Detects SQL metacharacters (`union select`, `' or 1=1`, `sleep(`).
- `DDoSAnomalyRule` (`RULE-NET-007`): Detects volumetric floods and SYN surges.
- `DetectionEngine`: Manages the rule catalog and exposes `analyze_event(event, event_history)`.
- `detection_engine`: Singleton instance used throughout the backend.

### 3. Input
- `event`: Dictionary representation of the incoming security event.
- `event_history`: List of the 20 most recent events retrieved from SQLite for temporal correlation.

### 4. Processing
Iterates through all registered rules. For threshold rules (e.g. Brute Force), it iterates backward through `event_history` calculating timestamp differences and counting matching occurrences within the window.

### 5. Output
A list of alert dictionaries (`List[Dict[str, Any]]`) containing alert titles, severities, MITRE IDs, and associated entities.

### 6. How It Connects to Other Files
- Invoked by `simulation_service.py` every time a new event is generated.
- Generates `Alert` database records that feed `backend/app/api/alerts.py`.

### 7. Why This Implementation Was Chosen
An object-oriented rule architecture allows new detection rules to be added easily by subclassing `DetectionRule` without modifying the core engine loop. In-memory evaluation is lightweight and introduces zero external processing latency.

---

## 2. Event Simulation Service (`backend/app/services/simulation_service.py`)

### 1. What the File Does
Controls the synthetic telemetry generator. It runs an asynchronous loop in the background that emits realistic security events, persists them to SQLite, triggers the detection engine, and broadcasts results over WebSockets.

### 2. Main Classes & Functions
- `SYNTHETIC_EVENT_POOL`: Pre-defined templates for benign traffic (Windows 4624, DNS queries, firewall allows) and attack sequences (RDP brute force, port scans, obfuscated PowerShell, phishing, malware C2 beacons, SQLi, DDoS).
- `SimulationService`: Manages simulation state (`is_running`, `is_paused`, `difficulty`, `events_generated`, `alerts_triggered`).
- `generate_single_event()`: Selects a template, commits it to `events`, evaluates rules, saves new alerts, and broadcasts over WebSocket.
- `_simulation_loop()`: Asynchronous loop with configurable delays (6.0s Beginner, 3.5s Intermediate, 1.8s Advanced).

### 3. Input
Simulation settings from REST API calls (`/api/simulation/start`, `/api/simulation/speed`).

### 4. Processing
Randomly selects event templates, injects real-time UTC timestamps, commits records via `SessionLocal`, queries recent event history for the detection engine, and deduplicates alerts.

### 5. Output
Broadcasts a WebSocket JSON payload:
```json
{
  "type": "security_event",
  "event": { "id": 105, "source": "Windows", "event_type": "FAILED_LOGIN", ... },
  "alerts": [ { "id": 12, "title": "Brute Force Authentication Burst...", ... } ],
  "simulation_status": { "is_running": true, "events_generated": 105 }
}
```

### 6. How It Connects to Other Files
- Started and stopped during FastAPI startup/shutdown in `backend/app/main.py`.
- Uses `DetectionEngine` for real-time analysis and `ConnectionManager` (`ws_manager`) for live client delivery.

### 7. Why This Implementation Was Chosen
Asynchronous `asyncio` background tasks inside FastAPI allow long-running simulation without blocking incoming HTTP requests or requiring separate daemon worker processes (like Celery or Redis).

---

## 3. Application Entry Point (`backend/app/main.py`)

### 1. What the File Does
The main FastAPI application file. It configures the application lifespan, creates database tables, seeds initial data if the database is empty, configures CORS, and mounts all modular API routers.

### 2. Main Classes & Functions
- `lifespan(app: FastAPI)`: Asynchronous context manager that runs on server boot and shutdown. Executes `Base.metadata.create_all()` and triggers `reset_and_seed_database()` if zero events exist.
- `app = FastAPI(...)`: Configures application title, metadata, and middleware.
- Router mounts: Mounts 11 modular routers under `/api`.

### 3. Input
Incoming HTTP requests from Next.js and WebSocket handshakes from browser clients.

### 4. Processing
Directs requests to corresponding route handlers and handles global exception middleware.

### 5. Output
JSON HTTP responses and active WebSocket streams.

### 6. How It Connects to Other Files
Connects the presentation layer to all backend submodules (`api/`, `database/`, `services/`, `websocket/`).

### 7. Why This Implementation Was Chosen
The `lifespan` architecture (introduced in modern FastAPI) ensures database connections and background simulation threads are cleanly initialized and safely terminated upon shutdown.

---

## 4. Database Models (`backend/app/models/`)

### 1. What These Files Do
Define the relational schema using SQLAlchemy ORM.

### 2. Key Models & Relationships
- `Event` (`models/event.py`): Stores raw security telemetry, parsed fields, and MITRE IDs.
- `Alert` (`models/alert.py`): Stores triggered alerts, linked to an optional `Incident` via foreign key `incident_id`.
- `Incident` (`models/incident.py`): Encapsulates a multi-stage security incident, containing `timeline_json`, `actions_json`, and relationships to `alerts`, `iocs`, `investigations`, and `reports`.
- `Investigation` (`models/investigation.py`): Stores entity correlation graph data in `nodes_json` and `edges_json`.
- `IOC` (`models/ioc.py`): Threat intelligence indicators (IP, domain, hash, filename) with confidence ratings.
- `Lab` & `LabAttempt` (`models/lab.py`): Guided training scenarios, learning objectives, evidence artifacts, and user quiz attempts.
- `Playbook` (`models/playbook.py`): Codified incident response checklists and containment actions.
- `Report` (`models/report.py`): Post-incident executive summaries and technical root cause documentation.

### 3. Why This Implementation Was Chosen
SQLAlchemy provides clean object-relational mapping, automatic schema generation, and full transaction safety while remaining completely decoupled from the underlying SQL engine (SQLite in local lab, easily portable to PostgreSQL).

---

## 5. Lab Grading Engine (`backend/app/services/lab_service.py`)

### 1. What the File Does
Grades user submissions for Labs 1 through 7, calculates scores from 0 to 100, deducts hint penalties, classifies analyst proficiency tiers, and recommends next labs.

### 2. Main Classes & Functions
- `LabGradingEngine.evaluate_submission(lab, submitted_answers, mode, hints_used)`:
  - Compares answers against `accepted_answers` (case-insensitive trimming).
  - Calculates earned points based on question weights.
  - Applies hint penalties (5 points per hint, capped at 15 points in practice/assessment modes).
  - Classifies performance into tiers:
    - $\ge 85$: **SOC Ready** (Emerald)
    - $\ge 70$: **Intermediate** (Blue)
    - $\ge 40$: **Developing** (Amber)
    - $< 40$: **Beginner** (Rose)

### 3. Why This Implementation Was Chosen
Automated grading provides objective, measurable feedback for candidates practicing alert investigation.

---

## 6. Frontend API Client (`frontend/src/lib/api.ts`)

### 1. What the File Does
Acts as the single point of contact between Next.js React components and the FastAPI backend.

### 2. Main Functions
- `fetchJson<T>(endpoint, options)`: Wrapper around native `fetch` handling JSON serialization, base URL resolution, and structured error throwing.
- `api` object: Exposes strongly typed methods:
  - `api.getEvents(params)`: Queries SIEM logs.
  - `api.getAlerts(params)`: Queries alert queue.
  - `api.getAlertsSummary()`: Retrieves severity breakdown.
  - `api.getIncidents()` & `api.updateIncident()`: Manages incident tickets.
  - `api.getInvestigations()` & `api.updateInvestigation()`: Manages graph state.
  - `api.gradeLab(labId, payload)`: Submits lab answers for grading.

### 3. Why This Implementation Was Chosen
Centralizing API logic in `api.ts` eliminates duplicate `fetch` calls across React components and allows endpoint paths or base URLs to be updated in a single file.

---

## 7. Visual Investigation Workspace (`frontend/src/app/investigations/page.tsx`)

### 1. What the File Does
Renders a visual relational graph that correlates disparate security artifacts into a unified incident narrative.

### 2. Processing & Rendering
- Fetches investigation records from `/api/investigations`.
- Parses `nodes_json` (containing nodes for Alert, Event, User, Host, IP, IOC, MITRE, Incident) and `edges_json`.
- Dynamically assigns distinct visual badges and icons using `getNodeIcon()` (e.g. `ShieldAlert` for alerts, `Server` for hosts, `Network` for IPs, `Fingerprint` for IOCs).
- Renders a synchronized chronological timeline and an interactive analyst notes scratchpad.

### 3. Why This Implementation Was Chosen
SOC Tier 1 analysts must prove they can think beyond isolated log rows and correlate the full attack chain. This workspace visually demonstrates that competency.
