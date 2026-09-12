from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.database.connection import get_db
from app.models.alert import Alert
from app.models.incident import Incident
from app.schemas.schemas import AlertOut, AlertCreate, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    status: Optional[str] = Query(None, description="Filter by status (New, Investigating, Escalated, Resolved, False Positive)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    return query.order_by(desc(Alert.timestamp)).offset(offset).limit(limit).all()

@router.get("/summary")
def get_alerts_summary(db: Session = Depends(get_db)):
    critical = db.query(Alert).filter(Alert.severity == "CRITICAL").count()
    high = db.query(Alert).filter(Alert.severity == "HIGH").count()
    medium = db.query(Alert).filter(Alert.severity == "MEDIUM").count()
    low = db.query(Alert).filter(Alert.severity == "LOW").count()
    total = db.query(Alert).count()

    by_status = {
        "New": db.query(Alert).filter(Alert.status == "New").count(),
        "Investigating": db.query(Alert).filter(Alert.status == "Investigating").count(),
        "Escalated": db.query(Alert).filter(Alert.status == "Escalated").count(),
        "Resolved": db.query(Alert).filter(Alert.status == "Resolved").count(),
        "False Positive": db.query(Alert).filter(Alert.status == "False Positive").count(),
    }

    return {
        "total": total,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "by_status": by_status
    }

@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert(alert_id: int, payload: AlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if payload.status is not None:
        alert.status = payload.status
    if payload.severity is not None:
        alert.severity = payload.severity
    if payload.assigned_analyst is not None:
        alert.assigned_analyst = payload.assigned_analyst
    if payload.notes is not None:
        if alert.notes:
            alert.notes += f"\n[Update]: {payload.notes}"
        else:
            alert.notes = payload.notes
    if payload.incident_id is not None:
        alert.incident_id = payload.incident_id

    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/escalate", response_model=AlertOut)
def escalate_alert_to_incident(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "Escalated"
    if not alert.incident_id:
        new_inc = Incident(
            title=f"Incident: {alert.title}",
            severity=alert.severity,
            status="Open",
            stage="Triage",
            summary=f"Escalated from Alert #{alert.id} ({alert.detection_rule}): {alert.description}",
            affected_host=alert.destination_host or alert.source_host,
            affected_user=alert.username,
            timeline_json="[]",
            analyst_notes=f"Auto-escalated by analyst {alert.assigned_analyst or 'SOC L1'}.",
            actions_json="[]",
            conclusion=""
        )
        db.add(new_inc)
        db.commit()
        db.refresh(new_inc)
        alert.incident_id = new_inc.id

    db.commit()
    db.refresh(alert)
    return alert
