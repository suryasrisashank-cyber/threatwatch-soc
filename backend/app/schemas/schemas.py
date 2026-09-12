from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    role: str = "SOC L1 Analyst"

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Host Schemas
class HostBase(BaseModel):
    hostname: str
    ip_address: str
    os_type: str
    status: str = "Healthy"
    role: str = "Workstation"
    monitored: bool = True

class HostOut(HostBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Event Schemas
class EventBase(BaseModel):
    source: str
    event_type: str
    severity: str = "LOW"
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_host: Optional[str] = None
    destination_host: Optional[str] = None
    username: Optional[str] = None
    process: Optional[str] = None
    message: str
    raw_log: str
    mitre_technique: Optional[str] = None
    metadata_json: Optional[str] = "{}"

class EventCreate(EventBase):
    pass

class EventOut(EventBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    title: str
    severity: str = "MEDIUM"
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_host: Optional[str] = None
    destination_host: Optional[str] = None
    username: Optional[str] = None
    event_type: str
    description: str
    detection_rule: str
    mitre_technique: Optional[str] = None
    status: str = "New"
    assigned_analyst: str = "Unassigned"
    notes: Optional[str] = ""
    incident_id: Optional[int] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    assigned_analyst: Optional[str] = None
    notes: Optional[str] = None
    incident_id: Optional[int] = None

class AlertOut(AlertBase):
    id: int
    timestamp: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# IOC Schemas
class IOCBase(BaseModel):
    value: str
    ioc_type: str
    confidence: int = 85
    source: str = "SentinelLab Detection Engine"
    related_incident_id: Optional[int] = None
    notes: Optional[str] = ""

class IOCCreate(IOCBase):
    pass

class IOCOut(IOCBase):
    id: int
    first_seen: datetime
    last_seen: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# Incident Schemas
class IncidentBase(BaseModel):
    title: str
    severity: str = "HIGH"
    status: str = "Open"
    stage: str = "Detection"
    summary: str
    affected_host: Optional[str] = None
    affected_user: Optional[str] = None
    timeline_json: Optional[str] = "[]"
    analyst_notes: Optional[str] = ""
    actions_json: Optional[str] = "[]"
    conclusion: Optional[str] = ""

class IncidentCreate(IncidentBase):
    alert_ids: Optional[List[int]] = []

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    stage: Optional[str] = None
    summary: Optional[str] = None
    affected_host: Optional[str] = None
    affected_user: Optional[str] = None
    timeline_json: Optional[str] = None
    analyst_notes: Optional[str] = None
    actions_json: Optional[str] = None
    conclusion: Optional[str] = None

class IncidentOut(IncidentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    alerts: List[AlertOut] = []
    iocs: List[IOCOut] = []
    class Config:
        from_attributes = True

# Investigation Schemas
class InvestigationBase(BaseModel):
    title: str
    incident_id: Optional[int] = None
    alert_id: Optional[int] = None
    status: str = "Active"
    nodes_json: Optional[str] = "[]"
    edges_json: Optional[str] = "[]"
    timeline_json: Optional[str] = "[]"
    notes: Optional[str] = ""

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationUpdate(BaseModel):
    status: Optional[str] = None
    nodes_json: Optional[str] = None
    edges_json: Optional[str] = None
    timeline_json: Optional[str] = None
    notes: Optional[str] = None

class InvestigationOut(InvestigationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Lab Schemas
class LabBase(BaseModel):
    lab_number: int
    title: str
    category: str
    difficulty: str = "Beginner"
    scenario: str
    learning_objectives_json: str = "[]"
    evidence_json: str = "[]"
    questions_json: str = "[]"
    hints_json: str = "[]"
    explanations_json: str = "{}"
    skills_json: str = "[]"

class LabOut(LabBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class LabSubmission(BaseModel):
    mode: str = "BEGINNER"  # BEGINNER, PRACTICE, ASSESSMENT
    answers: Dict[str, Any]  # question_id -> user answer
    hints_used: int = 0

class LabAttemptOut(BaseModel):
    id: int
    lab_id: int
    mode: str
    score: int
    completed: bool
    hints_used: int
    feedback: Dict[str, Any]
    created_at: datetime

# MITRE Schemas
class MitreTechniqueBase(BaseModel):
    technique_id: str
    name: str
    tactic: str
    description: str
    detection_approach: str
    data_sources: str = "Process, Network, Authentication"
    related_labs_json: str = "[]"
    related_playbooks_json: str = "[]"

class MitreTechniqueOut(MitreTechniqueBase):
    id: int
    class Config:
        from_attributes = True

# Playbook Schemas
class PlaybookBase(BaseModel):
    title: str
    category: str
    trigger_condition: str
    initial_validation: str
    steps_json: str = "[]"
    evidence_checklist_json: str = "[]"
    escalation_criteria: str
    containment_actions: str
    documentation_requirements: str
    mitre_technique_id: Optional[str] = None

class PlaybookOut(PlaybookBase):
    id: int
    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    incident_id: int
    title: str
    executive_summary: str
    technical_details: str
    affected_assets_json: str = "[]"
    timeline_json: str = "[]"
    iocs_json: str = "[]"
    mitre_mapping_json: str = "[]"
    findings: str
    actions_taken: str
    recommendations: str
    conclusion: str

class ReportCreate(BaseModel):
    incident_id: int
    title: Optional[str] = None

class ReportOut(ReportBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Simulation Controls
class SimulationStatus(BaseModel):
    is_running: bool
    is_paused: bool
    difficulty: str
    events_generated: int
    alerts_triggered: int
    last_event_time: Optional[datetime] = None
