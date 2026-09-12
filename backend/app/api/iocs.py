from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.database.connection import get_db
from app.models.ioc import IOC
from app.schemas.schemas import IOCOut, IOCCreate

router = APIRouter(prefix="/iocs", tags=["IOCs"])

@router.get("", response_model=List[IOCOut])
def get_iocs(
    ioc_type: Optional[str] = Query(None, description="Filter by type (IP, Domain, URL, Hash, Filename, Email, Username)"),
    search: Optional[str] = Query(None, description="Search keyword in IOC value or notes"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(IOC)
    if ioc_type:
        query = query.filter(IOC.ioc_type.ilike(f"%{ioc_type}%"))
    if search:
        query = query.filter(IOC.value.ilike(f"%{search}%") | IOC.notes.ilike(f"%{search}%"))
    return query.order_by(desc(IOC.confidence)).limit(limit).all()

@router.post("", response_model=IOCOut)
def create_ioc(payload: IOCCreate, db: Session = Depends(get_db)):
    existing = db.query(IOC).filter(IOC.value == payload.value).first()
    if existing:
        return existing
    ioc = IOC(**payload.dict())
    db.add(ioc)
    db.commit()
    db.refresh(ioc)
    return ioc

@router.delete("/{ioc_id}")
def delete_ioc(ioc_id: int, db: Session = Depends(get_db)):
    ioc = db.query(IOC).filter(IOC.id == ioc_id).first()
    if not ioc:
        raise HTTPException(status_code=404, detail="IOC not found")
    db.delete(ioc)
    db.commit()
    return {"message": "IOC deleted successfully"}
