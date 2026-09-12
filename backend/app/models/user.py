from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(30), default="SOC L1 Analyst")
    created_at = Column(DateTime, default=datetime.utcnow)
