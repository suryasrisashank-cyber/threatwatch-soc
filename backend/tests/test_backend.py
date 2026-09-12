import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.database.seed import reset_and_seed_database
from app.services.detection_engine import detection_engine
from app.services.lab_service import lab_grader
from app.models.lab import Lab

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    db = SessionLocal()
    reset_and_seed_database(db)
    db.close()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["events_count"] >= 80
    assert data["alerts_count"] >= 15

def test_events_list_and_filter():
    response = client.get("/api/events?limit=10")
    assert response.status_code == 200
    events = response.json()
    assert len(events) == 10

    # Filter by source
    response_win = client.get("/api/events?source=Windows&limit=5")
    assert response_win.status_code == 200
    assert all("Windows" in e["source"] for e in response_win.json())

def test_alerts_list_and_escalate():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0

    first_alert = alerts[0]
    alert_id = first_alert["id"]

    # Patch status
    patch_res = client.patch(f"/api/alerts/{alert_id}", json={"status": "Investigating", "notes": "Test triage note"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Investigating"

    # Escalate to incident
    esc_res = client.post(f"/api/alerts/{alert_id}/escalate")
    assert esc_res.status_code == 200
    assert esc_res.json()["status"] == "Escalated"
    assert esc_res.json()["incident_id"] is not None

def test_detection_engine_brute_force_rule():
    event = {
        "event_type": "FAILED_LOGIN",
        "source_ip": "10.0.0.99",
        "username": "admin",
        "message": "Event ID 4625 failed password",
        "destination_host": "DC-PRIMARY"
    }
    history = [
        {"event_type": "FAILED_LOGIN", "source_ip": "10.0.0.99", "message": "4625"},
        {"event_type": "FAILED_LOGIN", "source_ip": "10.0.0.99", "message": "4625"},
        {"event_type": "FAILED_LOGIN", "source_ip": "10.0.0.99", "message": "4625"},
    ]
    alerts = detection_engine.analyze_event(event, history)
    assert len(alerts) >= 1
    assert alerts[0]["detection_rule"] == "BRUTE_FORCE_DETECTION"
    assert "T1110.001" in alerts[0]["mitre_technique"]

def test_detection_engine_powershell_rule():
    event = {
        "event_type": "SUSPICIOUS_PROCESS",
        "source_ip": "192.168.1.50",
        "message": "powershell.exe -w hidden -enc SQBFAFgAIAAoAE4AZQB3...",
        "process": "powershell.exe",
        "raw_log": "powershell.exe -enc SQBFAFgA"
    }
    alerts = detection_engine.analyze_event(event, [])
    assert len(alerts) >= 1
    assert alerts[0]["detection_rule"] == "SUSPICIOUS_POWERSHELL"

def test_iocs_crud():
    res = client.get("/api/iocs")
    assert res.status_code == 200
    assert len(res.json()) >= 10

    # Create new IOC
    create_res = client.post("/api/iocs", json={
        "value": "198.51.100.250",
        "ioc_type": "IP",
        "confidence": 90,
        "source": "Manual Test Submission",
        "notes": "Test IP"
    })
    assert create_res.status_code == 200
    ioc_id = create_res.json()["id"]

    # Delete IOC
    del_res = client.delete(f"/api/iocs/{ioc_id}")
    assert del_res.status_code == 200

def test_learning_labs_and_grading():
    labs_res = client.get("/api/labs")
    assert labs_res.status_code == 200
    labs = labs_res.json()
    assert len(labs) == 7

    # Submit Lab 1 with correct answers
    submit_res = client.post("/api/labs/1/submit", json={
        "mode": "BEGINNER",
        "answers": {
            "q1": "198.51.100.23",
            "q2": "administrator",
            "q3": "no",
            "q4": "T1110.001"
        },
        "hints_used": 0
    })
    assert submit_res.status_code == 200
    feedback = submit_res.json()
    assert feedback["score"] == 100
    assert feedback["tier"] == "SOC Ready"
    assert feedback["correct_count"] == 4

def test_simulation_status():
    status_res = client.get("/api/simulation/status")
    assert status_res.status_code == 200
    data = status_res.json()
    assert "is_running" in data
    assert "difficulty" in data
