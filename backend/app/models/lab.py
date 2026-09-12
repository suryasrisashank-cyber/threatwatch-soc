from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Lab(Base):
    __tablename__ = "labs"

    id = Column(Integer, primary_key=True, index=True)
    lab_number = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(80), nullable=False)
    difficulty = Column(String(30), default="Beginner")  # Beginner, Intermediate, Advanced
    scenario = Column(Text, nullable=False)
    learning_objectives_json = Column(Text, default="[]")
    evidence_json = Column(Text, default="[]")  # Logs, emails, network packets, etc.
    questions_json = Column(Text, default="[]")  # Questions, choices, correct_answers, explanation
    hints_json = Column(Text, default="[]")
    explanations_json = Column(Text, default="{}")
    skills_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("LabAttempt", back_populates="lab")

class LabAttempt(Base):
    __tablename__ = "lab_attempts"

    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("labs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    mode = Column(String(30), default="BEGINNER")  # BEGINNER, PRACTICE, ASSESSMENT
    score = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    hints_used = Column(Integer, default=0)
    answers_json = Column(Text, default="{}")
    feedback_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    lab = relationship("Lab", back_populates="attempts")
    user = relationship("User")
