# Security Policy & Educational Boundary

> **MANDATORY NOTICE: AUTHORIZED LAB ENVIRONMENT ONLY**  
> ThreatWatch is strictly an educational cybersecurity simulation platform designed for blue team instruction, log analysis, threat detection, and defensive incident response training.

---

## 1. Educational Safety Boundary

ThreatWatch enforces strict architectural boundaries to guarantee safety:

1. **Purely Synthetic Telemetry**: All logs, alerts, network traffic captures, email headers, file hashes, and threat actor artifacts are 100% simulated, synthetic, or generated within localhost mock environments.
2. **No Real Attack Capabilities**: ThreatWatch contains **zero offensive exploitation tools**, no automated port scanners targeting the internet, no password crackers, no vulnerability scanners directed at external hosts, and no denial-of-service weapons.
3. **No Malicious Payloads**: The platform does not host, compile, or execute functional malware, ransomware, or weaponized exploits. Educational scripts (such as Base64-encoded strings in Lab 3) are strictly parsed as text and are **never executed** by the operating system.
4. **No Real Credentials**: All usernames (`sarah.finance`, `alex.executive`), passwords, and Active Directory domains (`corp.local`, `threatwatch.local`) are fictional training placeholders.
5. **No Third-Party Exploitation**: Users must never attempt to point or adapt ThreatWatch utilities against public internet IP addresses, domains, cloud services, or systems without explicit prior written authorization.

---

## 2. Safe Local-First Design

- **Localhost Isolation**: ThreatWatch is configured out-of-the-box to bind to private network interfaces (`127.0.0.1` and private local Wi-Fi RFC 1918 subnets).
- **Zero Cloud Leakage**: No telemetry, student lab answers, or simulation events are transmitted to external third-party servers or telemetry collectors.
- **No Hardcoded Secrets**: No sensitive API keys, cloud provider tokens, or database passwords are embedded in source code. All configuration values utilize safe environment variables with offline defaults.

---

## 3. Reporting a Vulnerability

If you discover a security concern within ThreatWatch (such as an unintentional code execution vulnerability or an insecure component):

1. Do not file a public GitHub issue.
2. Submit a private security advisory report detailing:
   - Component affected (frontend, backend, or database layer)
   - Steps to reproduce the issue locally
   - Suggested remediation or patch
3. The maintainers will triage and resolve security issues within 48 hours.
