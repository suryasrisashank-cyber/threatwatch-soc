from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database.connection import get_db
from app.models.report import Report
from app.schemas.schemas import ReportOut, ReportCreate
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportOut])
def get_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(desc(Report.created_at)).all()

@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@router.post("/generate/{incident_id}", response_model=ReportOut)
def generate_report_for_incident(incident_id: int, payload: ReportCreate = None, db: Session = Depends(get_db)):
    title = payload.title if payload else None
    try:
        new_report = report_service.generate_incident_report(db, incident_id, title)
        return new_report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
