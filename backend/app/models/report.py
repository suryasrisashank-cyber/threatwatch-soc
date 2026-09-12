from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    executive_summary = Column(Text, nullable=False)
    technical_details = Column(Text, nullable=False)
    affected_assets_json = Column(Text, default="[]")
    timeline_json = Column(Text, default="[]")
    iocs_json = Column(Text, default="[]")
    mitre_mapping_json = Column(Text, default="[]")
    findings = Column(Text, nullable=False)
    actions_taken = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=False)
    conclusion = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="reports")
