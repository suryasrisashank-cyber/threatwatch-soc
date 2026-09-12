# ThreatWatch — Resume Bullets & Elevator Pitches

Professional resume descriptions and elevator pitches tailored for SOC Tier 1, Junior Security Analyst, and Blue Team roles.

---

## 3 Tailored Resume Bullets

* **Engineered ThreatWatch**, an offline SOC Tier 1 attack detection and incident response training platform using Next.js, FastAPI, and SQLite to simulate end-to-end security operations workflows in a safe local environment.
* **Developed an in-memory threat detection engine** with 7 custom rules mapped to MITRE ATT&CK techniques (T1110, T1059.001, T1566.001), automating real-time alert correlation across Windows Security Event Logs (4624, 4625, 4688, 4740), perimeter firewall logs, and email headers.
* **Implemented an interactive SIEM and incident response framework** featuring 7 guided investigation labs, 5 response playbooks, and automated forensic containment triggers (host quarantine, IP blocking, credential revocation) adhering to NIST SP 800-61 standards.

---

## 30-Second Interview Explanation

> **Question:** *"Can you tell me about your ThreatWatch project?"*

> **Answer:**
> *"ThreatWatch is an offline SOC Tier 1 simulation and incident response platform that I built using Next.js, FastAPI, and SQLite. It models the complete operational workflow of a security operations center—from ingesting multi-source telemetry like Windows Event Logs and firewall drops to evaluating custom detection rules, correlating entities in a visual investigation graph, and executing containment playbooks aligned with NIST SP 800-61. I designed it to be 100% deterministic, safe, and runnable out-of-the-box on a single laptop without needing complex cloud infrastructure."*

---

## 60-Second Interview Explanation

> **Question:** *"Walk me through the design and technical capabilities of ThreatWatch."*

> **Answer:**
> *"I built ThreatWatch to solve a common problem: most cybersecurity portfolio projects are static dashboards that don't demonstrate real analyst investigation skills. 
> 
> ThreatWatch operates on a three-tier architecture: a Next.js 15 frontend, a FastAPI backend, and an SQLite database. In the backend, a background asyncio service continuously streams synthetic security events—including Windows Security Event IDs 4624, 4625, and 4688, alongside email gateway and firewall telemetry. 
> 
> An in-memory detection engine evaluates incoming telemetry against 7 signature and threshold rules in real time, detecting scenarios like RDP brute force bursts, obfuscated PowerShell execution, and spearphishing lures. Detections generate alerts mapped directly to the MITRE ATT&CK framework.
> 
> In the frontend, an analyst can explore raw logs in a simulated SIEM, correlate events with threat intelligence IOCs in a visual graph workspace, safely decode Base64 command lines, and trigger simulated containment actions—like host isolation or firewall IP blocks. It demonstrates the full SOC lifecycle: Detect, Triage, Investigate, Correlate, Respond, and Report."*
