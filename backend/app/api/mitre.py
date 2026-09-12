from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.mitre import MitreTechnique
from app.schemas.schemas import MitreTechniqueOut

router = APIRouter(prefix="/mitre", tags=["MITRE ATT&CK"])

@router.get("", response_model=List[MitreTechniqueOut])
def get_mitre_techniques(db: Session = Depends(get_db)):
    return db.query(MitreTechnique).all()

@router.get("/{technique_id}", response_model=MitreTechniqueOut)
def get_technique(technique_id: str, db: Session = Depends(get_db)):
    tech = db.query(MitreTechnique).filter(MitreTechnique.technique_id == technique_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technique not found")
    return tech
