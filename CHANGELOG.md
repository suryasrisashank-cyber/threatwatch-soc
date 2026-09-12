# Changelog

All notable changes to ThreatWatch will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-12

### Initial Public Release — ThreatWatch Platform

#### Added
- **Command Center Dashboard**: Real-time SOC dashboard featuring 8 metric cards, 6 interactive Recharts graphs, and a live security activity feed.
- **Modular Detection Engine**: Built-in rule correlation engine evaluating synthetic logs against MITRE ATT&CK techniques:
  - Brute Force Authentication (`T1110.001`)
  - Port Scan Reconnaissance (`T1046`)
  - Suspicious Obfuscated PowerShell (`T1059.001`)
  - Spearphishing with Attachment (`T1566.001`)
  - Malware IOC Matching (`T1071.001`)
  - Web SQL Injection (`T1190`)
  - DDoS Volumetric Flood Anomaly (`T1498.001`)
- **Simulated SIEM Explorer**: Query and search interface across Windows, Linux, Firewall, DNS, and Web access logs with raw payload views.
- **Alert Triage Interface**: Full alert management drawer with multi-status transitions (`New`, `Investigating`, `Escalated`, `Resolved`, `False Positive`).
- **Visual Investigation Workspace**: Entity relationship graph linking Alert $\rightarrow$ Event $\rightarrow$ User $\rightarrow$ Host $\rightarrow$ IP $\rightarrow$ IOC $\rightarrow$ MITRE $\rightarrow$ Incident with chronological attack timelines.
- **Threat Intelligence IOC Manager**: Catalog for tracking IPs, domains, hashes, and files with confidence ratings.
- **7-Stage Incident Response Workflow**: NIST SP 800-61 / SANS lifecycle with simulated containment triggers (*Isolate Host*, *Block IP*, *Reset Credentials*).
- **7 Hands-On Learning Labs**:
  - Lab 01: Brute Force Authentication Detection
  - Lab 02: Network Port Scan Reconnaissance
  - Lab 03: Suspicious PowerShell Command-Line Investigation
  - Lab 04: Spearphishing Email Header & Attachment Analysis
  - Lab 05: Malware Indicator of Compromise (IOC) Extraction
  - Lab 06: Web Server SQL Injection (SQLi) Log Analysis
  - Lab 07: DDoS Volumetric Traffic Anomaly & Mitigation
- **3 Learning Modes**: Beginner (guided concept explainers), Practice (scenario investigation), and Assessment (graded examination).
- **Automated Backend Lab Grading Engine**: Scoring calculation (0–100), hint penalties, and a 10-domain blue team skill matrix.
- **Incident Report Generator**: Automated post-incident debrief report builder with Markdown export and printable PDF layout.
- **Real-Time Simulation Engine**: In-process background runner streaming synthetic security events via WebSockets at `/ws/simulation` with REST polling fallback.
- **Local-First Database Setup**: Zero-config SQLite database with automated startup seeding (105+ events, 20+ alerts, 5 incidents, 15+ IOCs).
