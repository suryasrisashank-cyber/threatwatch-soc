from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base, SessionLocal
from app.database.seed import reset_and_seed_database
from app.models.event import Event
from app.api import health, events, alerts, incidents, iocs, labs, investigations, mitre, playbooks, reports, simulation

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Check if database has data, if not seed it automatically
    db = SessionLocal()
    try:
        count = db.query(Event).count()
        if count == 0:
            print("[SentinelLab] Empty database detected. Seeding initial demo SOC environment...")
            reset_and_seed_database(db)
        else:
            print(f"[SentinelLab] Database connected with {count} existing events.")
    finally:
        db.close()
    yield
    # Cleanup on shutdown
    simulation.simulation_service.stop()

app = FastAPI(
    title="SentinelLab — SOC L1 Attack Detection & Incident Response Platform",
    description="Authorized educational cybersecurity home lab platform for blue team training.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local lab environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(iocs.router, prefix="/api")
app.include_router(labs.router, prefix="/api")
app.include_router(investigations.router, prefix="/api")
app.include_router(mitre.router, prefix="/api")
app.include_router(playbooks.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(simulation.router)  # Also allows /ws/simulation and /simulation/...

@app.get("/")
def root_info():
    return {
        "platform": "SentinelLab",
        "description": "SOC L1 Attack Detection & Incident Response Platform",
        "notice": "AUTHORIZED LAB ENVIRONMENT ONLY",
        "status": "ONLINE",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
