from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=True)
    alert_id = Column(Integer, ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(30), default="Active")  # Active, Completed, Archived
    nodes_json = Column(Text, default="[]")  # Visual graph nodes
    edges_json = Column(Text, default="[]")  # Visual graph edges
    timeline_json = Column(Text, default="[]")  # Chronological timeline items
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident = relationship("Incident", back_populates="investigations")
    alert = relationship("Alert")
