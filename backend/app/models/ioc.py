from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class IOC(Base):
    __tablename__ = "iocs"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(String(255), nullable=False, index=True)
    ioc_type = Column(String(30), nullable=False, index=True)  # IP, Domain, URL, Hash, Filename, Email, Username
    confidence = Column(Integer, default=85)  # 0-100 percentage
    source = Column(String(100), default="SentinelLab Detection Engine")
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    related_incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="iocs")
