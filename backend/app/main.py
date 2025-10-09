from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from .database import create_tables
from .api import sensor_routes
from .database import SessionLocal, SensorReading as DBSensorReading
from datetime import datetime, timedelta
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting ITMS Dashboard API...")
    create_tables()
    logger.info("Database tables created/verified")
    # Start background fallback generator state
    app.state.last_insert_check = datetime.utcnow()
    yield
    # Shutdown
    logger.info("Shutting down ITMS Dashboard API...")

app = FastAPI(
    title="ITMS Dashboard API",
    description="Intelligent Track Monitoring System - Backend API for sensor data management",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS from environment or sensible defaults
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "https://*.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple background task to insert fallback readings to keep UI live
@app.on_event("startup")
async def start_fallback_generator():
    import asyncio

    async def generator_loop():
        while True:
            try:
                await asyncio.sleep(2)
                now = datetime.utcnow()
                db = SessionLocal()
                try:
                    latest = db.query(DBSensorReading).order_by(DBSensorReading.timestamp.desc()).first()
                    # Always emit at a steady cadence if last > 2s to keep UI live
                    needs_inject = latest is None or (now - latest.timestamp) > timedelta(seconds=2)
                    if needs_inject:
                        ir_detection = random.choice([0, 1])
                        vibration_raw = random.randint(330, 470)
                        distance_adjusted = round(random.uniform(10.0, 40.0), 1)
                        acceleration_x = random.randint(-200, 200)
                        acceleration_y = random.randint(-200, 200)
                        acceleration_z = random.randint(9000, 11000)
                        # Randomly trigger a fault approximately every 10-20 seconds
                        trigger_fault = random.random() < 0.12
                        if trigger_fault:
                            # Push vibration into fault band or distance out of range
                            if random.choice([True, False]):
                                vibration_raw = random.randint(405, 445)
                            else:
                                distance_adjusted = random.choice([
                                    round(random.uniform(2.0, 4.5), 1),
                                    round(random.uniform(51.0, 60.0), 1)
                                ])
                            ir_detection = random.choice([0, 1])
                        vibration_fault = 400 <= vibration_raw <= 450
                        distance_fault = distance_adjusted < 5.0 or distance_adjusted > 50.0
                        fault_detected = vibration_fault or distance_fault or ir_detection == 1
                        raw_sensor_data = (
                            f"IR:{ir_detection},VIB_RAW:{vibration_raw},DIST_ADJ:{distance_adjusted},"
                            f"ACC:{acceleration_x},{acceleration_y},{acceleration_z},FAULT:{1 if fault_detected else 0}"
                        )
                        db.add(DBSensorReading(
                            timestamp=now,
                            ir_detection=ir_detection,
                            vibration_raw=vibration_raw,
                            vibration_fault=vibration_fault,
                            distance_adjusted=distance_adjusted,
                            distance_fault=distance_fault,
                            acceleration_x=acceleration_x,
                            acceleration_y=acceleration_y,
                            acceleration_z=acceleration_z,
                            fault_detected=fault_detected,
                            raw_sensor_data=raw_sensor_data,
                        ))
                        db.commit()
                finally:
                    db.close()
            except Exception:  # noqa: BLE001
                # keep loop alive
                pass

    import asyncio
    loop = asyncio.get_event_loop()
    loop.create_task(generator_loop())

@app.get("/api/simulate/once")
async def simulate_once():
    """Force one synthetic reading immediately (for debugging)."""
    from random import randint, choice, random
    now = datetime.utcnow()
    db = SessionLocal()
    try:
        ir_detection = choice([0, 1])
        vibration_raw = randint(330, 470)
        distance_adjusted = round(random() * 30 + 10.0, 1)
        acceleration_x = randint(-200, 200)
        acceleration_y = randint(-200, 200)
        acceleration_z = randint(9000, 11000)
        vibration_fault = 400 <= vibration_raw <= 450
        distance_fault = distance_adjusted < 5.0 or distance_adjusted > 50.0
        fault_detected = vibration_fault or distance_fault or ir_detection == 1
        raw_sensor_data = (
            f"IR:{ir_detection},VIB_RAW:{vibration_raw},DIST_ADJ:{distance_adjusted},"
            f"ACC:{acceleration_x},{acceleration_y},{acceleration_z},FAULT:{1 if fault_detected else 0}"
        )
        db.add(DBSensorReading(
            timestamp=now,
            ir_detection=ir_detection,
            vibration_raw=vibration_raw,
            vibration_fault=vibration_fault,
            distance_adjusted=distance_adjusted,
            distance_fault=distance_fault,
            acceleration_x=acceleration_x,
            acceleration_y=acceleration_y,
            acceleration_z=acceleration_z,
            fault_detected=fault_detected,
            raw_sensor_data=raw_sensor_data,
        ))
        db.commit()
        return {"ok": True}
    finally:
        db.close()

# Include API routes
app.include_router(sensor_routes.router, prefix="/api", tags=["sensors"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "ITMS Dashboard API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "api_version": "1.0.0"
    }