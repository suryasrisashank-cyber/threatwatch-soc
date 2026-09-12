# SOC Incident Case Study 01: Targeted RDP Brute Force Attempt

- **Incident ID**: `INC-2026-001`
- **Severity**: `HIGH`
- **Lead Analyst**: Junior SOC Analyst (`sarah.blue`)
- **Target Host**: `SRV-RDP-GATEWAY.corp.local` (`192.168.1.50`)
- **Attacker Source IP**: `198.51.100.23` (Reserved Documentation IP Range)
- **Framework Mapping**: MITRE ATT&CK `T1110.001 - Brute Force: Password Guessing`

---

## 1. Incident Summary

On September 12, 2026, at 05:48 UTC, the ThreatWatch automated detection engine triggered a high-severity alert (`RULE-AUTH-001`) indicating a rapid burst of failed logon attempts against the internal remote desktop jump server `SRV-RDP-GATEWAY`. Telemetry analysis revealed 45 sequential logon failures (Windows Security Event ID 4625) originating from external IP `198.51.100.23` targeting the local `administrator` account within a 3-minute window. The automated Windows Active Directory lockout policy engaged after threshold failure, preventing unauthorized access. Subsequent queries confirmed no successful authentications (Event ID 4624) occurred. The source IP was contained via an automated firewall deny rule.

---

## 2. Detection

- **Detection Rule**: `RULE-AUTH-001` (`BRUTE_FORCE_DETECTION`)
- **Trigger Logic**: The ThreatWatch correlation engine monitors an in-memory sliding window of authentication telemetry. A threshold of $\ge 3$ consecutive failed logins (Event ID 4625 or Linux auth failures) from the same source IP within 300 seconds triggers a high-severity alert.
- **Alert Dispatched**:
  ```json
  {
    "alert_id": "ALT-001",
    "title": "Brute Force Authentication Burst Detected from 198.51.100.23",
    "severity": "HIGH",
    "rule_id": "RULE-AUTH-001",
    "mitre_technique": "T1110.001",
    "source_ip": "198.51.100.23",
    "destination_host": "SRV-RDP-GATEWAY.corp.local",
    "username": "administrator"
  }
  ```

---

## 3. Initial Triage

1. **Alert Acknowledgement**: Analyst acknowledged the alert in the ThreatWatch Alerts dashboard (`/alerts`) and transitioned status from `New` to `Investigating`.
2. **Scoping**: Verified whether the destination host was an external perimeter system or internal server. `SRV-RDP-GATEWAY` handles remote management sessions.
3. **Escalation**: Due to the target being the privileged `administrator` account and the velocity exceeding 15 attempts/minute, the alert was formally escalated to Incident `INC-2026-001`.

---

## 4. Evidence Collected

Telemetry extracted from the ThreatWatch SIEM Log Explorer (`/siem`):

| Timestamp (UTC) | Event ID | Source IP | Destination IP / Host | Account | Status Code / Detail |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `05:48:15` | `4625` | `198.51.100.23` | `192.168.1.50` (`SRV-RDP-GATEWAY`) | `administrator` | `0xC000006D` / `0xC000006A` (Bad Password) |
| `05:48:19` | `4625` | `198.51.100.23` | `192.168.1.50` (`SRV-RDP-GATEWAY`) | `administrator` | `0xC000006D` / `0xC000006A` (Bad Password) |
| `05:48:22` | `4625` | `198.51.100.23` | `192.168.1.50` (`SRV-RDP-GATEWAY`) | `administrator` | `0xC000006D` / `0xC000006A` (Bad Password) |
| `05:48:38` | `4740` | `192.168.1.1` | `SRV-RDP-GATEWAY` | `administrator` | A user account was locked out |

Raw Windows Event Log snippet:
```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <EventID>4625</EventID>
    <TimeCreated SystemTime="2026-09-12T05:48:15Z"/>
    <Computer>SRV-RDP-GATEWAY.corp.local</Computer>
  </System>
  <EventData>
    <Data Name="TargetUserName">administrator</Data>
    <Data Name="IpAddress">198.51.100.23</Data>
    <Data Name="Status">0xC000006D</Data>
    <Data Name="SubStatus">0xC000006A</Data>
    <Data Name="LogonType">10</Data> <!-- RemoteInteractive (RDP) -->
  </EventData>
</Event>
```

---

## 5. Investigation

1. **Failure Velocity Analysis**: Filtering SIEM logs for `source_ip == "198.51.100.23"` confirmed a total of 45 attempts over 180 seconds, characteristic of an automated password dictionary script rather than human typographical errors.
2. **Compromise Verification**: Executed SIEM search:
   `source == "Windows" AND event_type == "SUCCESSFUL_LOGIN" AND source_ip == "198.51.100.23"`
   **Result**: 0 matches. No logon session was established.
3. **Account Status Check**: Correlated Event ID 4740 confirmed that Active Directory locked the account at attempt #10, causing all subsequent attempts to fail immediately with substatus `0xC0000234` (Account Locked).

---

## 6. IOC Analysis

Pivot to ThreatWatch Threat Intelligence Manager (`/iocs`):

| Indicator Value | Type | Confidence | Context / Notes | Action Taken |
| :--- | :---: | :---: | :--- | :--- |
| `198.51.100.23` | IPv4 | 85% | External source IP conducting automated RDP brute force | Blocked at perimeter firewall |
| `administrator` | Username | 50% | Default privileged account targeted by automated spray | Account lockout confirmed; verified complex password policy |

---

## 7. MITRE ATT&CK Mapping

- **Tactic**: Credential Access (`TA0006`)
- **Technique**: `T1110.001 - Brute Force: Password Guessing`
- **Sub-Technique Context**: Attacker attempted systematically guessing passwords against remote desktop service port 3389 without prior credential disclosure.

---

## 8. Analyst Reasoning

- **True Positive Assessment**: The high frequency of failed attempts (every 2–4 seconds) with identical source IP and RemoteInteractive (LogonType 10) leaves zero ambiguity: this is an automated brute-force attack.
- **Impact Assessment**: Minimal. The account lockout threshold functioned as designed. Because no successful login (Event 4624) was recorded from `198.51.100.23` prior to or after lockout, no lateral movement or system compromise occurred.

---

## 9. Response / Containment

Executed containment playbooks via ThreatWatch Incident Response console (`/incidents`):

1. **Boundary Containment**: Triggered automated firewall block rule for `198.51.100.23` on perimeter gateway.
2. **Network Access Control**: Restricted inbound RDP (port 3389) on `SRV-RDP-GATEWAY` to authorized internal management subnets (`192.168.1.0/24`) only.
3. **Identity Verification**: Unlocked `administrator` account after confirming domain controller integrity and required an immediate administrative passphrase rotation.

---

## 10. Final Conclusion

The attack was identified, triaged, and contained in the **Containment** stage. Zero unauthorized sessions were created, and zero data leakage was detected. Incident status transitioned to `Resolved`.

---

## 11. Lessons Learned

1. **Perimeter Exposure**: Management ports such as RDP (3389) and SSH (22) should never be exposed directly to untrusted networks. Require VPN or jump-hosts with multi-factor authentication (MFA).
2. **Detection Thresholds**: Detection rule `RULE-AUTH-001` successfully caught the activity within 3 attempts. Recommended adding rate-limiting at the reverse proxy to throttle connection velocity prior to application-level authentication.
3. **Documentation**: Investigation debrief report generated and archived via `/reports` for audit records.
