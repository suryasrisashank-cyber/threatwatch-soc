# SentinelLab — SOC L1 Project Case Study

A comprehensive, engineering-focused case study documenting the design, implementation, and operational workflows of **SentinelLab** — an offline SOC Tier 1 attack detection and incident response training platform.

---

## Problem
Aspiring Security Operations Center (SOC) Tier 1 analysts and blue team learners face a steep barrier when transitioning from security certifications (e.g., CompTIA Security+, CySA+, BTL1) to hands-on alert triage. 
1. **Commercial SIEM Barriers**: Enterprise platforms like Splunk Cloud, Microsoft Sentinel, or IBM QRadar are expensive, difficult to configure for individual practice, and enforce cloud consumption limits.
2. **Virtualization Overhead**: Popular home lab projects (such as DetectionLab) require 32GB+ RAM to run multiple virtual machines (Domain Controllers, WEF collectors, Splunk forwarders), putting them out of reach for learners on standard workstations.
3. **Static Portfolio Projects**: Most junior portfolios consist of static screenshots or read-only dashboards with pre-baked charts, offering recruiters zero evidence of actual triage, correlation, or incident response capability.

---

## Objective
To design and build an open-source, deterministic, zero-cloud SOC Tier 1 simulation platform that runs locally in seconds while authentically modeling the end-to-end security operations workflow:
- Ingesting multi-source synthetic telemetry (Windows Event Logs, firewall drops, email gateways, DNS, web access logs).
- Evaluating events against signature and threshold detection rules in real time.
- Providing an interactive SIEM log explorer with deep filtering and full-text search.
- Enabling forensic entity correlation across Users, Hosts, IPs, IOCs, and Incidents.
- Mapping threats directly to the MITRE ATT&CK Enterprise matrix.
- Guiding step-by-step incident containment and compiling formal post-incident debrief reports.

---

## Architecture
SentinelLab separates presentation, business logic, and persistence into three decoupled tiers:

```text
  [Next.js 15 App Router] (React 19, TypeScript, Tailwind CSS)
            │  ▲
   REST API │  │ WebSocket (/ws/simulation)
            ▼  │
  [FastAPI Backend Engine] (Python 3.11+, Pydantic, Uvicorn)
      ├── Background Simulation Service (Asyncio Event Stream)
      ├── In-Memory Detection Engine (7 Correlation Rules)
      └── Automated Lab Grading Engine
            │
            ▼ SQLAlchemy ORM
  [Local SQLite Datastore] (sentinellab.db)
```

- **Next.js Rewrites**: Built-in rewrites in `next.config.js` route `/api/*` and `/ws/*` traffic to the FastAPI backend on port 8000, eliminating browser CORS issues during local execution.
- **WebSocket Streaming**: Asynchronous event broadcasting pushes live telemetry directly into client state hooks without requiring database polling or page refreshes.

---

## Security Scenarios Implemented
SentinelLab simulates 5 complete incident scenarios and 7 interactive training labs:
1. **RDP Brute Force & Account Lockout**: External attacker attempts dictionary password guessing against port 3389, generating Windows Security Event ID 4625 bursts and triggering Event ID 4740 (Account Lockout).
2. **Spearphishing with Malicious Attachment**: Spoofed email from lookalike domain (`bankofamer1ca-notice.com`) failing SPF verification and delivering a double-extension dropper (`invoice_2026.pdf.exe`).
3. **Obfuscated PowerShell Execution**: Execution of `powershell.exe` with stealth bypass flags (`-NoP -W Hidden -Exec Bypass -Enc`) and a Base64-encoded download cradle fetching external staging payloads.
4. **Command & Control (C2) Beaconing**: Compromised endpoint initiating periodic outbound HTTP/HTTPS beacons to threat actor IP `45.33.32.156` on port 443.
5. **Web Application SQL Injection**: Automated `sqlmap` probing on an external e-commerce portal generating HTTP 500 error logs with `UNION SELECT` and sleep payloads.

---

## Detection Engineering
The custom detection engine (`backend/app/services/detection_engine.py`) implements an object-oriented rule catalog with 7 active rules:
- `RULE-AUTH-001` (Brute Force): Flags 3+ failed logins from a single source IP within 300 seconds.
- `RULE-NET-002` (Port Scan): Detects connection drops across 4+ unique destination ports.
- `RULE-ENDPOINT-003` (Suspicious PowerShell): Catches obfuscated execution, `-enc` flags, and web download cradles.
- `RULE-EMAIL-004` (Phishing): Identifies `spf=fail` combined with invoice/credential keywords.
- `RULE-IOC-005` (Malware IOC Match): Flags matches against known threat intelligence indicators.
- `RULE-WEB-006` (SQL Injection): Detects SQL metacharacters and error-inducing payloads.
- `RULE-NET-007` (DDoS Anomaly): Identifies volumetric SYN surges exceeding normal connection baselines.

---

## SIEM Investigation
The SIEM explorer (`/siem`) provides analysts with a responsive log investigation interface:
- **Filtering**: Multi-faceted filtering across Log Source, Severity, Hostname, and Username.
- **Search**: Full-text searching across raw messages and structured payloads.
- **Payload Inspection**: Side-by-side display of normalized metadata (event types, IPs, ports) alongside authentic raw logs (Windows XML events, Postfix milter logs, and Nginx access lines).

---

## IOC Correlation
The Threat Intelligence repository (`/iocs`) catalogs indicators categorized by type (IP, Domain, URL, Hash, Filename, Email, Username). Each indicator features a confidence score and source attribution.
- In the **Visual Investigation Workspace** (`/investigations`), IOCs are linked directly to affected host nodes and alert triggers, allowing analysts to immediately understand whether an attacker's infrastructure has been observed elsewhere in the network.

---

## MITRE ATT&CK Mapping
Every detection rule and scenario is mapped directly to the MITRE ATT&CK Enterprise matrix:
- **Initial Access**: `T1566.001` (Spearphishing Attachment), `T1190` (Exploit Public-Facing Application)
- **Execution**: `T1059.001` (PowerShell)
- **Credential Access**: `T1110.001` (Password Guessing)
- **Discovery**: `T1046` (Network Service Scanning)
- **Command and Control**: `T1071.001` (Web Protocols C2)
- **Impact**: `T1498.001` (Direct Network Flood)

---

## Incident Response & Containment
SentinelLab models the incident lifecycle using the **NIST SP 800-61** standard:
1. **Triage & Classification**: Claiming alerts, assigning analyst ownership, and verifying True Positives.
2. **Containment Actions**: Interactive execution of containment measures:
   - *Host Quarantine*: Disconnecting network adapters to isolate endpoints.
   - *IP Perimeter Block*: Pushing drop rules to perimeter firewalls.
   - *Credential Revocation*: Resetting compromised domain passwords.
3. **Audit Trail**: Every action is stamped with UTC timestamps and appended to the incident timeline.
4. **Post-Incident Debrief**: Automated generation of comprehensive incident debrief reports.

---

## Technical Challenges & How I Solved Them

### Challenge 1: Eliminating Frontend/Backend CORS Friction
- *Problem*: In a local development environment running Next.js on port 3000 and FastAPI on port 8000, cross-origin restrictions and WebSocket handshakes frequently fail or require brittle CORS wildcards.
- *Solution*: Configured Next.js reverse proxy rewrites in `next.config.js` to proxy `/api/*` and `/ws/*` requests to port 8000. All client requests are made to relative endpoints (`/api/...`), resolving CORS completely and simplifying deployment.

### Challenge 2: Temporal Multi-Event Sliding Windows
- *Problem*: Detecting brute force or port scanning requires correlating multiple events across time, but querying the full database for each incoming log creates significant I/O latency.
- *Solution*: Implemented a sliding window query in `simulation_service.py` that retrieves only the 20 most recent events for the active source IP. The detection engine iterates backward through this list, stopping as soon as the 300-second window is exceeded.

### Challenge 3: Realistic Telemetry Without System Instability
- *Problem*: Running real malware or live port scans on a home computer triggers local antivirus alerts, risks network security, and requires virtualization.
- *Solution*: Constructed authentic synthetic log templates modeled directly on genuine Windows Security XML EventLogs (Event IDs 4624, 4625, 4688) and RFC 822 email headers. The telemetry is visually indistinguishable from production logs while remaining completely safe and offline.

---

## Testing & Verification
- **Automated Backend Tests**: Pytest test suite (`tests/test_backend.py`) verifying API health, event querying, alert generation, incident workflows, lab grading, and report generation (8/8 tests passing).
- **Frontend Production Build**: Clean static generation and dynamic route validation across all 18 routes (`npm.cmd run build` passing with 0 TypeScript/ESLint errors).

---

## Security & Privacy Considerations
- **Zero Real Credentials**: No production passwords, API tokens, or secrets exist in the codebase.
- **Sanitized Network Addresses**: All external attacker IPs adhere to RFC 5737 (`198.51.100.0/24`, `203.0.113.0/24`, `192.0.2.0/24`) and RFC 1918 private subnets.
- **Fictional Entities**: Replaced references to real commercial entities with fictional names (`ExampleBank`, `AcmeCorp`).

---

## Limitations
- Telemetry is generated from synthetic templates rather than live operating system kernels.
- SentinelLab uses an in-memory rule engine rather than a distributed commercial SIEM cluster (e.g. Splunk indexers or Elasticsearch clusters).
- The platform does not currently ingest logs from external physical agents or live virtual machines.

---

## Future Improvements
- **Splunk HEC / Syslog Forwarder**: Export SentinelLab synthetic telemetry to external enterprise SIEM platforms.
- **Live Windows Event Forwarding (WEF)**: Build a lightweight Windows agent to harvest real events from virtual testbeds.
- **Threat Intelligence API Integration**: Connect IOC validation to live AbuseIPDB and VirusTotal APIs.
- **Multi-Tenant RBAC**: Implement role-based access control with separate Student and Instructor profiles.

---

## What I Learned
- **Detection Engineering**: Building threshold rules taught me the critical importance of sliding windows, event deduplication, and tuning to prevent alert fatigue.
- **SOC Workflow Discipline**: Designing the investigation workspace solidified my understanding of the relationship between raw logs, alerts, asset criticality, and containment actions.
- **Full-Stack Security Tooling**: Combining Next.js, FastAPI, WebSockets, and SQLite demonstrated how modern web technologies can be leveraged to build responsive, professional blue team tools.
