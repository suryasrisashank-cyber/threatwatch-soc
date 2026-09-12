from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.connection import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String(50), nullable=False, index=True)  # Windows, Linux, Firewall, DNS, Web Server, Auth, Endpoint
    event_type = Column(String(80), nullable=False, index=True)
    severity = Column(String(20), default="LOW", index=True)  # CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL
    source_ip = Column(String(45), nullable=True, index=True)
    destination_ip = Column(String(45), nullable=True, index=True)
    source_host = Column(String(100), nullable=True)
    destination_host = Column(String(100), nullable=True)
    username = Column(String(80), nullable=True, index=True)
    process = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    raw_log = Column(Text, nullable=False)
    mitre_technique = Column(String(50), nullable=True, index=True)
    metadata_json = Column(Text, default="{}")
