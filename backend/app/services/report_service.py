import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.report import Report
from app.models.alert import Alert
from app.models.ioc import IOC

class ReportService:
    @staticmethod
    def generate_incident_report(db: Session, incident_id: int, custom_title: Optional[str] = None) -> Report:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident with ID {incident_id} does not exist.")

        # Aggregate associated alerts
        alerts = db.query(Alert).filter(Alert.incident_id == incident_id).all()
        # Aggregate associated IOCs
        iocs = db.query(IOC).filter(IOC.related_incident_id == incident_id).all()

        # Build affected assets list
        affected_assets = []
        if incident.affected_host:
            affected_assets.append({"type": "Host", "identifier": incident.affected_host, "status": "Quarantined/Monitored"})
        if incident.affected_user:
            affected_assets.append({"type": "User Account", "identifier": incident.affected_user, "status": "Credentials Reset"})

        # Collect unique MITRE techniques
        mitre_set = set()
        for a in alerts:
            if a.mitre_technique:
                mitre_set.add(a.mitre_technique)

        # Parse timeline
        try:
            timeline_data = json.loads(incident.timeline_json or "[]")
        except Exception:
            timeline_data = []

        if not timeline_data:
            timeline_data = [
                {"timestamp": incident.created_at.strftime("%Y-%m-%d %H:%M:%S"), "stage": "Detection", "action": f"Incident opened: {incident.title}", "analyst": "SOC L1 Team"}
            ]

        # IOC list
        ioc_data = [
            {"type": i.ioc_type, "value": i.value, "confidence": f"{i.confidence}%", "source": i.source}
            for i in iocs
        ]

        title = custom_title or f"Incident Investigation Report: {incident.title}"
        exec_summary = (
            f"On {incident.created_at.strftime('%B %d, %Y')}, the ThreatWatch Security Operations Center "
            f"triaged and contained a {incident.severity} severity security incident: '{incident.title}'. "
            f"Current status: {incident.status} (Stage: {incident.stage}). "
            f"{incident.summary}"
        )

        tech_details = (
            f"Root cause investigation determined compromise telemetry targeting endpoint '{incident.affected_host or 'N/A'}' "
            f"and user identity '{incident.affected_user or 'N/A'}'. A total of {len(alerts)} correlated alerts were processed "
            f"and {len(iocs)} indicators of compromise were mapped across defensive firewalls and endpoint agents."
        )

        findings = (
            f"Correlated investigation confirmed threat actor activity mapping to techniques: {', '.join(mitre_set) if mitre_set else 'Standard Threat Vector'}. "
            f"Analyst notes state: {incident.analyst_notes or 'Investigation steps followed standard defensive playbook protocol.'}"
        )

        actions = (
            f"Containment and remediation actions logged: {incident.actions_json if incident.actions_json != '[]' else 'Asset isolation, credential revocation, and firewall ACL enforcement.'}"
        )

        recommendations = (
            "1. Implement enforced Multi-Factor Authentication (MFA) across all administrative and user accounts.\n"
            "2. Enforce PowerShell Constrained Language Mode (CLM) and Script Block Logging (Event ID 4104).\n"
            "3. Add all documented IP and hash indicators to perimeter boundary firewall deny-lists and EDR blocklists.\n"
            "4. Conduct end-user cybersecurity phishing awareness training."
        )

        conclusion = incident.conclusion or "The threat has been fully contained and eradicated. System telemetry has returned to normal baseline operations."

        report = Report(
            incident_id=incident_id,
            title=title,
            executive_summary=exec_summary,
            technical_details=tech_details,
            affected_assets_json=json.dumps(affected_assets),
            timeline_json=json.dumps(timeline_data),
            iocs_json=json.dumps(ioc_data),
            mitre_mapping_json=json.dumps(list(mitre_set)),
            findings=findings,
            actions_taken=actions,
            recommendations=recommendations,
            conclusion=conclusion
        )

        db.add(report)
        db.commit()
        db.refresh(report)
        return report

report_service = ReportService()
