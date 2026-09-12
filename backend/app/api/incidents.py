import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.database.connection import get_db
from app.models.incident import Incident
from app.models.alert import Alert
from app.schemas.schemas import IncidentOut, IncidentCreate, IncidentUpdate

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentOut])
def get_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity.upper())
    if stage:
        query = query.filter(Incident.stage.ilike(f"%{stage}%"))
    return query.order_by(desc(Incident.created_at)).all()

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("", response_model=IncidentOut)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    new_inc = Incident(
        title=payload.title,
        severity=payload.severity,
        status=payload.status,
        stage=payload.stage,
        summary=payload.summary,
        affected_host=payload.affected_host,
        affected_user=payload.affected_user,
        timeline_json=payload.timeline_json or "[]",
        analyst_notes=payload.analyst_notes or "",
        actions_json=payload.actions_json or "[]",
        conclusion=payload.conclusion or ""
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)

    if payload.alert_ids:
        for a_id in payload.alert_ids:
            alert = db.query(Alert).filter(Alert.id == a_id).first()
            if alert:
                alert.incident_id = new_inc.id
                alert.status = "Escalated"
        db.commit()
        db.refresh(new_inc)

    return new_inc

@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(incident_id: int, payload: IncidentUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(inc, field, val)

    inc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(inc)
    return inc

@router.post("/{incident_id}/add-timeline-entry", response_model=IncidentOut)
def add_timeline_entry(incident_id: int, entry: dict, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        timeline = json.loads(inc.timeline_json or "[]")
    except Exception:
        timeline = []

    if "timestamp" not in entry:
        entry["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    timeline.append(entry)
    inc.timeline_json = json.dumps(timeline)
    inc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(inc)
    return inc
