from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List
from app.database.connection import get_db
from app.models.event import Event
from app.schemas.schemas import EventOut, EventCreate

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventOut])
def get_events(
    search: Optional[str] = Query(None, description="Search keyword in message or raw log"),
    source: Optional[str] = Query(None, description="Filter by source (Windows, Linux, Firewall, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    username: Optional[str] = Query(None, description="Filter by username"),
    source_ip: Optional[str] = Query(None, description="Filter by source IP"),
    destination_ip: Optional[str] = Query(None, description="Filter by destination IP"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Event)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Event.message.ilike(search_pattern),
                Event.raw_log.ilike(search_pattern),
                Event.process.ilike(search_pattern),
                Event.username.ilike(search_pattern),
                Event.source_ip.ilike(search_pattern)
            )
        )
    if source:
        query = query.filter(Event.source.ilike(f"%{source}%"))
    if severity:
        query = query.filter(Event.severity == severity.upper())
    if username:
        query = query.filter(Event.username.ilike(f"%{username}%"))
    if source_ip:
        query = query.filter(Event.source_ip == source_ip)
    if destination_ip:
        query = query.filter(Event.destination_ip == destination_ip)
    if event_type:
        query = query.filter(Event.event_type.ilike(f"%{event_type}%"))

    return query.order_by(desc(Event.timestamp)).offset(offset).limit(limit).all()

@router.get("/stats")
def get_events_stats(db: Session = Depends(get_db)):
    total = db.query(Event).count()
    by_source = {}
    for src in ["Windows", "Linux", "Firewall", "DNS", "Web Server", "Authentication", "Endpoint"]:
        by_source[src] = db.query(Event).filter(Event.source == src).count()

    by_severity = {
        "CRITICAL": db.query(Event).filter(Event.severity == "CRITICAL").count(),
        "HIGH": db.query(Event).filter(Event.severity == "HIGH").count(),
        "MEDIUM": db.query(Event).filter(Event.severity == "MEDIUM").count(),
        "LOW": db.query(Event).filter(Event.severity == "LOW").count(),
        "INFORMATIONAL": db.query(Event).filter(Event.severity == "INFORMATIONAL").count(),
    }
    return {
        "total_events": total,
        "by_source": by_source,
        "by_severity": by_severity
    }

@router.get("/{event_id}", response_model=EventOut)
def get_event_by_id(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
