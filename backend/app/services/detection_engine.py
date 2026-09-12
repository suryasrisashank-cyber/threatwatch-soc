import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict

class DetectionRule:
    def __init__(
        self,
        rule_id: str,
        name: str,
        description: str,
        severity: str,
        mitre_technique: str,
        evidence_requirements: str
    ):
        self.rule_id = rule_id
        self.name = name
        self.description = description
        self.severity = severity
        self.mitre_technique = mitre_technique
        self.evidence_requirements = evidence_requirements

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

class BruteForceRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-AUTH-001",
            name="BRUTE_FORCE_DETECTION",
            description="Detects multiple failed logins (3 or more within 5 minutes) from the same source IP, or failed logins followed by a successful login.",
            severity="HIGH",
            mitre_technique="T1110.001 - Brute Force: Password Guessing",
            evidence_requirements="Windows Event ID 4625 (Failed) / 4624 (Success) or Linux SSH failed authentication."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        evt_type = current_event.get("event_type", "").upper()
        src_ip = current_event.get("source_ip")
        if not src_ip or ("FAILED_LOGIN" not in evt_type and "4625" not in str(current_event.get("message", ""))):
            return None

        # Count recent failed logins from the same source IP within 5 minutes
        now = current_event.get("timestamp") or datetime.utcnow()
        failed_count = 1
        for past in reversed(event_history):
            p_type = past.get("event_type", "").upper()
            p_ip = past.get("source_ip")
            p_time = past.get("timestamp") or datetime.utcnow()
            if p_ip == src_ip and ("FAILED_LOGIN" in p_type or "4625" in str(past.get("message", ""))):
                if (now - p_time).total_seconds() <= 300:
                    failed_count += 1
            if failed_count >= 3:
                return {
                    "rule_id": self.rule_id,
                    "title": f"Brute Force Authentication Burst Detected from {src_ip}",
                    "severity": self.severity,
                    "event_type": "BRUTE_FORCE",
                    "description": f"Observed {failed_count} consecutive failed login attempts targeting user '{current_event.get('username', 'administrator')}' from source IP {src_ip}.",
                    "detection_rule": self.name,
                    "mitre_technique": self.mitre_technique,
                    "source_ip": src_ip,
                    "destination_ip": current_event.get("destination_ip"),
                    "source_host": current_event.get("source_host"),
                    "destination_host": current_event.get("destination_host"),
                    "username": current_event.get("username")
                }
        return None

class PortScanRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-NET-002",
            name="PORT_SCAN_DETECTION",
            description="Detects rapid connection attempts across 4 or more distinct destination ports from a single source IP.",
            severity="MEDIUM",
            mitre_technique="T1046 - Network Service Scanning",
            evidence_requirements="Firewall connection deny / drop logs with sequential destination ports."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        evt_type = current_event.get("event_type", "").upper()
        src_ip = current_event.get("source_ip")
        if not src_ip or ("PORT_SCAN" not in evt_type and "FIREWALL_DENY" not in evt_type and "CONNECTION_DROPPED" not in evt_type):
            return None

        ports_seen = set()
        msg = current_event.get("message", "")
        # Extract port if in message
        port_match = re.search(r"DPT=(\d+)|port\s+(\d+)", msg, re.IGNORECASE)
        if port_match:
            ports_seen.add(port_match.group(1) or port_match.group(2))

        now = current_event.get("timestamp") or datetime.utcnow()
        for past in reversed(event_history):
            if past.get("source_ip") == src_ip:
                p_msg = past.get("message", "")
                p_match = re.search(r"DPT=(\d+)|port\s+(\d+)", p_msg, re.IGNORECASE)
                if p_match:
                    ports_seen.add(p_match.group(1) or p_match.group(2))
                if len(ports_seen) >= 4 or "PORT_SCAN" in evt_type:
                    return {
                        "rule_id": self.rule_id,
                        "title": f"Network Port Scan / Reconnaissance from {src_ip}",
                        "severity": self.severity,
                        "event_type": "PORT_SCAN",
                        "description": f"Source IP {src_ip} attempted rapid scanning across multiple destination ports ({', '.join(list(ports_seen)[:5])}...).",
                        "detection_rule": self.name,
                        "mitre_technique": self.mitre_technique,
                        "source_ip": src_ip,
                        "destination_ip": current_event.get("destination_ip"),
                        "source_host": current_event.get("source_host"),
                        "destination_host": current_event.get("destination_host"),
                        "username": current_event.get("username")
                    }
        return None

class SuspiciousPowerShellRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-ENDPOINT-003",
            name="SUSPICIOUS_POWERSHELL",
            description="Detects suspicious PowerShell execution containing base64 encoded commands, bypass flags, or download cradles.",
            severity="HIGH",
            mitre_technique="T1059.001 - Command and Scripting Interpreter: PowerShell",
            evidence_requirements="Windows Security Event ID 4688 / Sysmon Event ID 1 process creation with encoded arguments."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        raw = (current_event.get("raw_log", "") + " " + current_event.get("message", "") + " " + (current_event.get("process") or "")).lower()
        patterns = ["-enc", "-encodedcommand", "bypass", "invoke-webrequest", "iwr", "downloadstring", "downloadfile", "iex"]
        if "powershell" in raw and any(p in raw for p in patterns):
            return {
                "rule_id": self.rule_id,
                "title": f"Suspicious Obfuscated PowerShell Execution on {current_event.get('destination_host', 'workstation')}",
                "severity": self.severity,
                "event_type": "SUSPICIOUS_POWERSHELL",
                "description": f"PowerShell executed with stealth/bypass flags or download cradle: {current_event.get('message')[:160]}",
                "detection_rule": self.name,
                "mitre_technique": self.mitre_technique,
                "source_ip": current_event.get("source_ip"),
                "destination_ip": current_event.get("destination_ip"),
                "source_host": current_event.get("source_host"),
                "destination_host": current_event.get("destination_host"),
                "username": current_event.get("username")
            }
        return None

class PhishingRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-EMAIL-004",
            name="PHISHING_DETECTION",
            description="Detects inbound emails with spoofed headers, lookalike domains, or weaponized invoice attachments.",
            severity="MEDIUM",
            mitre_technique="T1566.001 - Phishing: Spearphishing Attachment",
            evidence_requirements="Email gateway log with SPF/DKIM failure or urgent credential lure."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        raw = (current_event.get("raw_log", "") + " " + current_event.get("message", "")).lower()
        if "phishing" in current_event.get("event_type", "").lower() or ("spf=fail" in raw and ("invoice" in raw or "password" in raw or "verify" in raw)):
            return {
                "rule_id": self.rule_id,
                "title": f"Inbound Spearphishing / Spoofed Lure Targeting {current_event.get('username', 'user')}",
                "severity": self.severity,
                "event_type": "PHISHING",
                "description": f"Suspicious email detected with failed SPF/DKIM verification or malicious attachment: {current_event.get('message')[:160]}",
                "detection_rule": self.name,
                "mitre_technique": self.mitre_technique,
                "source_ip": current_event.get("source_ip"),
                "destination_ip": current_event.get("destination_ip"),
                "source_host": current_event.get("source_host"),
                "destination_host": current_event.get("destination_host"),
                "username": current_event.get("username")
            }
        return None

class MalwareIOCRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-IOC-005",
            name="MALWARE_IOC_MATCH",
            description="Detects execution or network communication matching known threat actor indicators of compromise.",
            severity="CRITICAL",
            mitre_technique="T1071.001 - Application Layer Protocol: Web Protocols",
            evidence_requirements="Endpoint hash calculation or DNS query matching threat intelligence database."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        raw = (current_event.get("raw_log", "") + " " + current_event.get("message", "")).lower()
        known_bad = ["malicious-c2.net", "45.33.32.156", "evil_dropper.exe", "e3b0c44298fc1c149afbf4c8996fb924", "c2-beacon.corp-sec.internal", "mimikatz"]
        if "malware" in current_event.get("event_type", "").lower() or any(bad in raw for bad in known_bad):
            return {
                "rule_id": self.rule_id,
                "title": f"Malware Indicator of Compromise (IOC) Detected on {current_event.get('destination_host', 'host')}",
                "severity": self.severity,
                "event_type": "MALWARE_IOC",
                "description": f"Identified threat intelligence IOC match in event stream: {current_event.get('message')[:160]}",
                "detection_rule": self.name,
                "mitre_technique": self.mitre_technique,
                "source_ip": current_event.get("source_ip"),
                "destination_ip": current_event.get("destination_ip"),
                "source_host": current_event.get("source_host"),
                "destination_host": current_event.get("destination_host"),
                "username": current_event.get("username")
            }
        return None

class SQLInjectionRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-WEB-006",
            name="SQL_INJECTION_DETECTION",
            description="Detects SQL injection payload patterns in HTTP request URIs and POST parameters.",
            severity="HIGH",
            mitre_technique="T1190 - Exploit Public-Facing Application",
            evidence_requirements="Web server access logs with SQL metacharacters (UNION SELECT, OR 1=1, --, SLEEP)."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        raw = (current_event.get("raw_log", "") + " " + current_event.get("message", "")).lower()
        sql_patterns = ["union%20select", "union select", "' or 1=1", "%27%20or%201=1", "sleep(", "waitfor delay", "information_schema", "admin'--"]
        if "sql" in current_event.get("event_type", "").lower() or any(p in raw for p in sql_patterns):
            return {
                "rule_id": self.rule_id,
                "title": f"SQL Injection Attack Attempt Against Web Server from {current_event.get('source_ip', 'unknown')}",
                "severity": self.severity,
                "event_type": "SQL_INJECTION",
                "description": f"Suspicious SQL syntax observed in web request parameter: {current_event.get('message')[:160]}",
                "detection_rule": self.name,
                "mitre_technique": self.mitre_technique,
                "source_ip": current_event.get("source_ip"),
                "destination_ip": current_event.get("destination_ip"),
                "source_host": current_event.get("source_host"),
                "destination_host": current_event.get("destination_host"),
                "username": current_event.get("username")
            }
        return None

class DDoSAnomalyRule(DetectionRule):
    def __init__(self):
        super().__init__(
            rule_id="RULE-NET-007",
            name="DDOS_TRAFFIC_ANOMALY",
            description="Detects volumetric traffic anomalies and SYN flood patterns exceeding normal baseline thresholds.",
            severity="CRITICAL",
            mitre_technique="T1498.001 - Network Denial of Service: Direct Network Flood",
            evidence_requirements="Network traffic telemetry with abnormal packet/second spike towards target host."
        )

    def evaluate(self, current_event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        raw = (current_event.get("raw_log", "") + " " + current_event.get("message", "")).lower()
        if "ddos" in current_event.get("event_type", "").lower() or "flood" in raw or "traffic spike" in raw:
            return {
                "rule_id": self.rule_id,
                "title": f"DDoS Volumetric Traffic Spike Directed at {current_event.get('destination_host', 'Gateway')}",
                "severity": self.severity,
                "event_type": "DDOS_ANOMALY",
                "description": f"Extreme connection rate anomaly observed: {current_event.get('message')[:160]}",
                "detection_rule": self.name,
                "mitre_technique": self.mitre_technique,
                "source_ip": current_event.get("source_ip"),
                "destination_ip": current_event.get("destination_ip"),
                "source_host": current_event.get("source_host"),
                "destination_host": current_event.get("destination_host"),
                "username": current_event.get("username")
            }
        return None

class DetectionEngine:
    def __init__(self):
        self.rules: List[DetectionRule] = [
            BruteForceRule(),
            PortScanRule(),
            SuspiciousPowerShellRule(),
            PhishingRule(),
            MalwareIOCRule(),
            SQLInjectionRule(),
            DDoSAnomalyRule(),
        ]

    def register_rule(self, rule: DetectionRule):
        self.rules.append(rule)

    def analyze_event(self, event: Dict[str, Any], event_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        alerts = []
        for rule in self.rules:
            result = rule.evaluate(event, event_history)
            if result:
                alerts.append(result)
        return alerts

# Global Detection Engine Singleton
detection_engine = DetectionEngine()
