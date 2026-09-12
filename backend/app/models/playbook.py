from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.connection import Base

class Playbook(Base):
    __tablename__ = "playbooks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(80), nullable=False)  # Authentication, Malware, Phishing, Network, Web
    trigger_condition = Column(Text, nullable=False)
    initial_validation = Column(Text, nullable=False)
    steps_json = Column(Text, default="[]")  # Ordered procedure steps
    evidence_checklist_json = Column(Text, default="[]")
    escalation_criteria = Column(Text, nullable=False)
    containment_actions = Column(Text, nullable=False)
    documentation_requirements = Column(Text, nullable=False)
    mitre_technique_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
