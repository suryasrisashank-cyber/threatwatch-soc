from fastapi import APIRouter, Depends, Body, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.seed import reset_and_seed_database
from app.services.simulation_service import simulation_service
from app.websocket.manager import ws_manager

router = APIRouter(tags=["Simulation"])

@router.get("/simulation/status")
def get_simulation_status():
    return simulation_service.get_status()

@router.post("/simulation/start")
async def start_simulation(difficulty: str = Body("BEGINNER", embed=True)):
    status = await simulation_service.start(difficulty)
    return {"message": "Simulation started", "status": status}

@router.post("/simulation/pause")
def pause_simulation():
    status = simulation_service.pause()
    return {"message": "Simulation paused", "status": status}

@router.post("/simulation/stop")
def stop_simulation():
    status = simulation_service.stop()
    return {"message": "Simulation stopped", "status": status}

@router.post("/simulation/generate-single")
async def generate_single_event():
    result = await simulation_service.generate_single_event()
    return {"message": "Generated single event", "data": result}

@router.post("/simulation/reset")
def reset_simulation_environment(db: Session = Depends(get_db)):
    simulation_service.stop()
    simulation_service.reset_stats()
    reset_and_seed_database(db)
    return {"message": "Demo environment reset and seeded successfully", "status": simulation_service.get_status()}

# WebSocket live stream
@router.websocket("/ws/simulation")
async def websocket_simulation_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial status on connection
        await websocket.send_json({
            "type": "connection_established",
            "status": simulation_service.get_status(),
            "message": "Connected to SentinelLab Real-Time Security Event Stream"
        })
        while True:
            # Keep connection alive; accept any client pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
