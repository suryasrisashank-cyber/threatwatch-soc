from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String(20), default="MEDIUM", index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    source_ip = Column(String(45), nullable=True)
    destination_ip = Column(String(45), nullable=True)
    source_host = Column(String(100), nullable=True)
    destination_host = Column(String(100), nullable=True)
    username = Column(String(80), nullable=True)
    event_type = Column(String(80), nullable=False)
    description = Column(Text, nullable=False)
    detection_rule = Column(String(100), nullable=False, index=True)
    mitre_technique = Column(String(50), nullable=True)
    status = Column(String(30), default="New", index=True)  # New, Investigating, Escalated, Resolved, False Positive
    assigned_analyst = Column(String(80), default="Unassigned")
    notes = Column(Text, default="")
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="alerts")
