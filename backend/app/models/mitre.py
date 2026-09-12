from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.connection import Base

class MitreTechnique(Base):
    __tablename__ = "mitre_techniques"

    id = Column(Integer, primary_key=True, index=True)
    technique_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., T1110, T1059.001
    name = Column(String(150), nullable=False)
    tactic = Column(String(100), nullable=False, index=True)  # Initial Access, Execution, Credential Access, etc.
    description = Column(Text, nullable=False)
    detection_approach = Column(Text, nullable=False)
    data_sources = Column(String(255), default="Process, Network, Authentication")
    related_labs_json = Column(Text, default="[]")
    related_playbooks_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
