from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database.connection import get_db
from app.models.investigation import Investigation
from app.schemas.schemas import InvestigationOut, InvestigationCreate, InvestigationUpdate

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.get("", response_model=List[InvestigationOut])
def get_investigations(db: Session = Depends(get_db)):
    return db.query(Investigation).order_by(desc(Investigation.updated_at)).all()

@router.get("/{inv_id}", response_model=InvestigationOut)
def get_investigation(inv_id: int, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@router.post("", response_model=InvestigationOut)
def create_investigation(payload: InvestigationCreate, db: Session = Depends(get_db)):
    inv = Investigation(**payload.dict())
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@router.patch("/{inv_id}", response_model=InvestigationOut)
def update_investigation(inv_id: int, payload: InvestigationUpdate, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(inv, field, val)

    db.commit()
    db.refresh(inv)
    return inv
