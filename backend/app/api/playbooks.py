from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.playbook import Playbook
from app.schemas.schemas import PlaybookOut

router = APIRouter(prefix="/playbooks", tags=["Playbooks"])

@router.get("", response_model=List[PlaybookOut])
def get_playbooks(db: Session = Depends(get_db)):
    return db.query(Playbook).all()

@router.get("/{playbook_id}", response_model=PlaybookOut)
def get_playbook(playbook_id: int, db: Session = Depends(get_db)):
    pb = db.query(Playbook).filter(Playbook.id == playbook_id).first()
    if not pb:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return pb
