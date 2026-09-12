# ThreatWatch — 75-Second Walkthrough Video Script

Follow this exact chronological sequence to record a smooth, professional demonstration of ThreatWatch's live SOC L1 investigation workflow.

---

### ⏱️ Timeline & Action Script

| Timestamp | Interface View | Screen Action | Voiceover / Description |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:10** | **SOC Command Center** (`/dashboard`) | Hover over KPI metric cards (Critical Alerts, Events Processed), point to live telemetry area chart, and highlight the active simulation indicator. | *"ThreatWatch is a portfolio SOC Tier 1 detection and incident response platform that simulates security operations in a safe offline environment. We start at the Command Center with live event streaming and telemetry."* |
| **00:10 – 00:20** | **Alert Generation & Feed** (`/dashboard` & `/alerts`) | Scroll down to the live alert feed as a new alert triggers (`High: Brute Force Authentication Burst`). Click **View in Alerts** or click the alert drawer. | *"Our automated detection engine correlates synthetic telemetry in real-time, triggering a prioritized brute force alert with MITRE mapping."* |
| **00:20 – 00:30** | **SIEM Explorer** (`/siem`) | Navigate to `/siem`. Type `EventID 4625` or filter by `Windows` and `High` severity. | *"Switching to the SIEM Log Explorer, we query telemetry across Windows, Firewall, and Web sources with sub-second filtering."* |
| **00:30 – 00:40** | **Event Investigation** (`/siem` & `/investigations`) | Click on a failed login event to view the parsed schema and raw XML log. Then open `/investigations`. | *"Inspecting the event reveals repeated logon failures from IP 198.51.100.23 against user administrator. In Investigations, we see the correlated attack chain."* |
| **00:40 – 00:50** | **IOC Inspection** (`/iocs` or entity card) | Click the suspicious IP / domain card on the entity graph or navigate to `/iocs`. Filter by `IP` to show confidence ratings and threat intelligence metadata. | *"We pivot to the Threat Intelligence IOC catalog to verify the attacker's source IP address and identify associated threat artifacts."* |
| **00:50 – 01:00** | **MITRE ATT&CK Mapping** (`/mitre`) | Open `/mitre`. Locate `T1110.001 - Password Guessing` or `T1059.001` in the Credential Access / Execution column and preview the detection criteria. | *"Every alert maps directly to the MITRE ATT&CK framework, providing tactical context and defensive detection playbooks."* |
| **01:00 – 01:10** | **Incident Response Workflow** (`/incidents`) | Open `/incidents`, select the active incident, and advance through NIST stages (Detection → Triage → Containment). Click **Block IP** or **Isolate Host**. | *"We escalate the alert into a full 7-stage NIST incident response workflow, executing simulated containment actions with one click."* |
| **01:10 – 01:20** | **Post-Incident Report** (`/reports`) | Navigate to `/reports`, select the incident, and click **Generate Debrief Report**. Scroll through executive summary, timeline, and click **Export PDF / Print**. | *"Finally, ThreatWatch compiles an executive and technical post-incident debrief report ready for stakeholders or portfolio presentation."* |

---

## 💡 Presenter Tips

- Keep mouse movements deliberate, smooth, and steady.
- Avoid rapid clicking; let each screen render completely before moving to the next.
- Total recorded duration should stay strictly between **60 and 90 seconds** (ideal: 75 seconds).
- When exported, save the final video as `docs/demo/threatwatch-demo.mp4`.
