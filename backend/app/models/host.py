from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.connection import Base

class Host(Base):
    __tablename__ = "hosts"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(100), unique=True, index=True, nullable=False)
    ip_address = Column(String(45), nullable=False)
    os_type = Column(String(50), nullable=False)
    status = Column(String(30), default="Healthy")
    role = Column(String(50), default="Workstation")
    monitored = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
