# SentinelLab — LinkedIn Post

A professional, technically grounded LinkedIn announcement highlighting key engineering decisions, SOC capabilities, and lessons learned.

---

```text
Excited to share a project I've been working on: SentinelLab — an offline SOC Tier 1 attack detection and incident response training platform.

When preparing for security operations roles, I noticed a consistent challenge: enterprise SIEM platforms often require expensive cloud infrastructure, while traditional home labs demand 32GB+ of RAM to run multiple virtual machines. Most junior portfolio projects end up being static dashboards with pre-baked charts that don't demonstrate real analyst investigation workflows.

I built SentinelLab to provide a lightweight, deterministic, and instant-start security operations environment that models the complete defensive lifecycle:

Key Capabilities:
• Multi-Source Telemetry: Simulates realistic Windows Security Event Logs (Event IDs 4624, 4625, 4688, 4740), perimeter firewall drops, DNS queries, and email gateway logs.
• Detection Engineering: Features an in-memory Python detection engine with 7 custom rules detecting brute force bursts, port scanning, obfuscated PowerShell, spearphishing, and malware IOCs.
• Interactive SIEM & Investigation: Multi-criteria log explorer with full-text search, alongside a visual entity workspace that correlates Alerts → Events → Users → Hosts → IPs → IOCs.
• MITRE ATT&CK & Threat Intel: Tactical alignment with Enterprise techniques (T1110, T1059.001, T1566.001) and a cataloged IOC repository with confidence ratings.
• Response Playbooks: Practical containment workflows (host quarantine, firewall IP blocks, credential revocation) structured around NIST SP 800-61 guidelines.
• Automated Scoring: 7 guided scenario labs with automated scoring, hint penalties, and forensic explanations.

Tech Stack:
• Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
• Backend: FastAPI, Python 3.11+, Uvicorn, WebSockets
• Database: SQLite with SQLAlchemy ORM

Building SentinelLab gave me deep appreciation for detection engineering nuances—specifically sliding-window time thresholds, alert deduplication, and the importance of clear entity correlation during high-pressure triage.

The project runs completely locally with zero external cloud dependencies or real attack traffic.

Check out the project:
GitHub: https://github.com/suryasrisashank-cyber/sentinellab
Demo Video / Walkthrough: [INSERT DEMO LINK HERE]

Feedback and thoughts from SOC analysts, detection engineers, and blue teamers are welcome!

#Cybersecurity #BlueTeam #SOCAnalyst #InfoSec #DetectionEngineering #IncidentResponse #SIEM #Nextjs #FastAPI #Python
```
