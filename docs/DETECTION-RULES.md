# ThreatWatch — Defensive Detection Rules Reference

> **AUTHORIZED LAB ENVIRONMENT ONLY**  
> All detection rules evaluate synthetic security logs within the ThreatWatch engine.

---

## Detection Engine Overview

The ThreatWatch Detection Engine continuously correlates incoming telemetry against an in-memory sliding window of the last 20 events. When an event pattern satisfies a rule condition, a prioritized alert is generated and dispatched via WebSockets.

---

### 1. `RULE-AUTH-001`: BRUTE_FORCE_DETECTION
- **Name**: Brute Force Authentication Burst Detection
- **Severity**: `HIGH`
- **MITRE ATT&CK**: `T1110.001 - Brute Force: Password Guessing`
- **Trigger Logic**: Evaluates when 3 or more failed logon attempts (Windows Event ID 4625 or SSH failure) occur from the same source IP address targeting the same account within a 5-minute sliding window.
- **Evidence Sources**: Windows Security Event Log, Active Directory Auditing, Linux `/var/log/auth.log`.
- **Sample Event**:
  ```json
  {
    "source": "Windows",
    "event_type": "FAILED_LOGIN",
    "source_ip": "198.51.100.23",
    "destination_host": "SRV-RDP-GATEWAY",
    "username": "administrator",
    "message": "An account failed to log on. Event ID: 4625. Status: 0xC000006D."
  }
  ```
- **Generated Alert**:
  - Title: *Brute Force Authentication Burst Detected from 198.51.100.23*
  - Severity: `HIGH`
  - Playbook: *Brute Force Response Playbook*

---

### 2. `RULE-NET-002`: PORT_SCAN_DETECTION
- **Name**: Network Service Reconnaissance Detection
- **Severity**: `MEDIUM`
- **MITRE ATT&CK**: `T1046 - Network Service Scanning`
- **Trigger Logic**: Identifies incoming connection attempts across 4 or more distinct destination ports (e.g. 21, 22, 80, 443, 3389) from a single external IP address within a 60-second window.
- **Evidence Sources**: Perimeter Firewall Drop Logs, NetFlow telemetry, IDS/IPS sensors.
- **Sample Event**:
  ```json
  {
    "source": "Firewall",
    "event_type": "PORT_SCAN",
    "source_ip": "203.0.113.88",
    "destination_ip": "192.168.1.10",
    "message": "PORT_SCAN detected: Multiple connection attempts to DPT=21, DPT=22, DPT=80, DPT=443, DPT=3389."
  }
  ```
- **Generated Alert**:
  - Title: *Network Port Scan / Reconnaissance from 203.0.113.88*
  - Severity: `MEDIUM`
  - Playbook: *Port Scan Investigation Playbook*

---

### 3. `RULE-ENDPOINT-003`: SUSPICIOUS_POWERSHELL
- **Name**: Obfuscated PowerShell & Execution Bypass
- **Severity**: `HIGH`
- **MITRE ATT&CK**: `T1059.001 - Command and Scripting Interpreter: PowerShell`
- **Trigger Logic**: Flags process creation events where `powershell.exe` is launched with suspicious flags including `-EncodedCommand`, `-Enc`, `-ExecutionPolicy Bypass`, `-WindowStyle Hidden`, or download cradles (`Net.WebClient`, `Invoke-WebRequest`, `IEX`).
- **Evidence Sources**: Windows Security Event ID 4688, Sysmon Event ID 1.
- **Sample Event**:
  ```json
  {
    "source": "Windows",
    "event_type": "SUSPICIOUS_PROCESS",
    "process": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgA...",
    "destination_host": "WORKSTATION-CEO",
    "username": "alex.executive"
  }
  ```
- **Generated Alert**:
  - Title: *Suspicious Obfuscated PowerShell Execution on WORKSTATION-CEO*
  - Severity: `HIGH`
  - Playbook: *Suspicious PowerShell Playbook*

---

### 4. `RULE-EMAIL-004`: PHISHING_DETECTION
- **Name**: Inbound Spearphishing & Spoofed Sender
- **Severity**: `MEDIUM`
- **MITRE ATT&CK**: `T1566.001 - Phishing: Spearphishing Attachment`
- **Trigger Logic**: Identifies incoming messages that fail SPF/DKIM verification (`spf=fail`) coupled with high-risk lure patterns (urgent financial demands, executable attachments with double extensions `.pdf.exe`).
- **Evidence Sources**: Mail Gateway Logs, Postfix/Exchange Milter Logs, Inbound Sandbox Detonation.
- **Sample Event**:
  ```json
  {
    "source": "Authentication",
    "event_type": "PHISHING_DETECTED",
    "source_ip": "185.220.101.5",
    "message": "Inbound email rejected: SPF=fail, From: billing@bankofamer1ca-notice.com, Attachment: urgent_invoice_2026.pdf.exe"
  }
  ```
- **Generated Alert**:
  - Title: *Inbound Spearphishing / Spoofed Lure Targeting alex.executive*
  - Severity: `MEDIUM`
  - Playbook: *Phishing Investigation Playbook*

---

### 5. `RULE-IOC-005`: MALWARE_IOC_MATCH
- **Name**: Threat Intelligence IOC Match
- **Severity**: `CRITICAL`
- **MITRE ATT&CK**: `T1071.001 - Application Layer Protocol: Web Protocols`
- **Trigger Logic**: Evaluates outbound HTTP/HTTPS connections and file execution hashes against the active Threat Intelligence catalog. Flags known C2 IPs (`45.33.32.156`), domains (`malicious-c2.net`), and malicious SHA-256 hashes.
- **Evidence Sources**: EDR Agent Telemetry, DNS Query Logs, Outbound Web Proxy.
- **Sample Event**:
  ```json
  {
    "source": "Endpoint",
    "event_type": "MALWARE_DETECTED",
    "source_ip": "192.168.1.140",
    "destination_ip": "45.33.32.156",
    "message": "Malware Beaconing Detected: Outbound HTTP POST to known C2 IP 45.33.32.156. Hash: e3b0c442..."
  }
  ```
- **Generated Alert**:
  - Title: *Malware Indicator of Compromise (IOC) Detected on WORKSTATION-CEO*
  - Severity: `CRITICAL`
  - Playbook: *Malware IOC Playbook*

---

### 6. `RULE-WEB-006`: SQL_INJECTION_DETECTION
- **Name**: Web Application SQL Injection Pattern
- **Severity**: `HIGH`
- **MITRE ATT&CK**: `T1190 - Exploit Public-Facing Application`
- **Trigger Logic**: Evaluates HTTP request URIs and query parameters for SQL metacharacters (`UNION SELECT`, `' OR 1=1`, `WAITFOR DELAY`, `--`) or automated tool signatures (`sqlmap`).
- **Evidence Sources**: Nginx/Apache Access Logs, ModSecurity WAF Telemetry.
- **Sample Event**:
  ```json
  {
    "source": "Web Server",
    "event_type": "SQL_INJECTION",
    "source_ip": "198.51.100.99",
    "message": "HTTP 500 GET /products.php?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20users-- User-Agent: sqlmap/1.7#dev"
  }
  ```
- **Generated Alert**:
  - Title: *SQL Injection Attack Attempt Against Web Server from 198.51.100.99*
  - Severity: `HIGH`
  - Playbook: *Web Application Attack Playbook*

---

### 7. `RULE-NET-007`: DDOS_TRAFFIC_ANOMALY
- **Name**: Volumetric Flood & Rate Anomaly
- **Severity**: `CRITICAL`
- **MITRE ATT&CK**: `T1498.001 - Network Denial of Service: Direct Network Flood`
- **Trigger Logic**: Flags traffic surges exceeding 10x normal baseline throughput (>50,000 packets per second TCP SYN flood).
- **Evidence Sources**: Edge Router NetFlow Counters, Perimeter Firewall Ingress Metrics.
- **Sample Event**:
  ```json
  {
    "source": "Firewall",
    "event_type": "DDOS_ANOMALY",
    "destination_host": "EDGE-ROUTER",
    "message": "SYN Flood Traffic Spike: 85,000 packets/sec received targeting port 80. CPU threshold exceeded on Edge Router."
  }
  ```
- **Generated Alert**:
  - Title: *DDoS Volumetric Traffic Spike Directed at EDGE-ROUTER*
  - Severity: `CRITICAL`
  - Playbook: *DDoS Mitigation Playbook*
