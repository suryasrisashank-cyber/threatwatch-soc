from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.models.event import Event
from app.models.alert import Alert
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    events_count = 0
    alerts_count = 0
    try:
        db.execute(text("SELECT 1"))
        events_count = db.query(Event).count()
        alerts_count = db.query(Alert).count()
    except Exception as e:
        db_status = f"error: {str(e)}"

    sim_status = simulation_service.get_status()

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "simulation": "running" if sim_status["is_running"] and not sim_status["is_paused"] else ("paused" if sim_status["is_paused"] else "stopped"),
        "version": "1.0.0",
        "events_count": events_count,
        "alerts_count": alerts_count,
        "lab_status": "AUTHORIZED LAB ENVIRONMENT ONLY",
        "lab_mode": "ONLINE"
    }
