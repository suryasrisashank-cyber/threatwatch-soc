import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any
from app.database.connection import get_db
from app.models.lab import Lab, LabAttempt
from app.schemas.schemas import LabOut, LabSubmission, LabAttemptOut
from app.services.lab_service import lab_grader

router = APIRouter(prefix="/labs", tags=["Labs"])

@router.get("", response_model=List[LabOut])
def get_all_labs(db: Session = Depends(get_db)):
    return db.query(Lab).order_by(Lab.lab_number).all()

@router.get("/progress/summary")
def get_progress_summary(db: Session = Depends(get_db)):
    total_labs = db.query(Lab).count()
    attempts = db.query(LabAttempt).order_by(desc(LabAttempt.created_at)).all()

    completed_labs = set()
    total_score = 0
    lab_scores = {}

    for att in attempts:
        if att.completed and att.lab_id not in completed_labs:
            completed_labs.add(att.lab_id)
            total_score += att.score
            lab_scores[att.lab_id] = att.score

    avg_score = int(total_score / len(completed_labs)) if completed_labs else 0

    # Skill domain calculations
    skill_domains = {
        "Networking": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.95 + 10)),
        "Windows Security": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.90 + 15)),
        "Linux & Web": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.85 + 20)),
        "SIEM & Log Analysis": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.95 + 15)),
        "Incident Response": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.90 + 10)),
        "Threat Detection": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.92 + 12)),
        "Phishing Triage": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.88 + 14)),
        "IOC Analysis": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.96 + 10)),
        "MITRE ATT&CK": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.89 + 15)),
        "Security Automation": min(100, int((len(completed_labs) / max(total_labs, 1)) * 100 * 0.80 + 10))
    }

    tier = "Beginner"
    if avg_score >= 85 and len(completed_labs) >= 5:
        tier = "SOC L1 Ready"
    elif avg_score >= 70 or len(completed_labs) >= 3:
        tier = "Junior Blue Team"
    elif len(completed_labs) >= 1:
        tier = "Developing Analyst"

    return {
        "total_labs": total_labs,
        "completed_count": len(completed_labs),
        "completion_percentage": int((len(completed_labs) / max(total_labs, 1)) * 100),
        "average_score": avg_score,
        "overall_tier": tier,
        "skills": skill_domains,
        "recent_attempts": [
            {
                "id": a.id,
                "lab_id": a.lab_id,
                "mode": a.mode,
                "score": a.score,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for a in attempts[:5]
        ]
    }

@router.get("/{lab_id}", response_model=LabOut)
def get_lab_by_id(lab_id: int, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter((Lab.id == lab_id) | (Lab.lab_number == lab_id)).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab

@router.post("/{lab_id}/submit")
def submit_lab(lab_id: int, submission: LabSubmission, db: Session = Depends(get_db)):
    lab = db.query(Lab).filter((Lab.id == lab_id) | (Lab.lab_number == lab_id)).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    result = lab_grader.evaluate_submission(
        lab=lab,
        submitted_answers=submission.answers,
        mode=submission.mode,
        hints_used=submission.hints_used
    )

    # Record attempt in database
    attempt = LabAttempt(
        lab_id=lab.id,
        user_id=1,  # Default demo analyst
        mode=submission.mode,
        score=result["score"],
        completed=True,
        hints_used=submission.hints_used,
        answers_json=json.dumps(submission.answers),
        feedback_json=json.dumps(result)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    result["attempt_id"] = attempt.id
    return result
