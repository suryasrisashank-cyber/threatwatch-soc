from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    severity = Column(String(20), default="HIGH", index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="Open", index=True)  # Open, Investigating, Contained, Resolved, Closed
    stage = Column(String(50), default="Detection")  # 1. Detection, 2. Triage, 3. Investigation, 4. Containment, 5. Eradication, 6. Recovery, 7. Lessons Learned
    summary = Column(Text, nullable=False)
    affected_host = Column(String(100), nullable=True)
    affected_user = Column(String(80), nullable=True)
    timeline_json = Column(Text, default="[]")  # list of {time, event, description, author}
    analyst_notes = Column(Text, default="")
    actions_json = Column(Text, default="[]")  # list of containment/eradication actions taken
    conclusion = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    alerts = relationship("Alert", back_populates="incident")
    iocs = relationship("IOC", back_populates="incident")
    investigations = relationship("Investigation", back_populates="incident")
    reports = relationship("Report", back_populates="incident")
