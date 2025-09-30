from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from .database import create_tables
from .api import sensor_routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting ITMS Dashboard API...")
    create_tables()
    logger.info("Database tables created/verified")
    yield
    # Shutdown
    logger.info("Shutting down ITMS Dashboard API...")

app = FastAPI(
    title="ITMS Dashboard API",
    description="Intelligent Track Monitoring System - Backend API for sensor data management",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",  # React dev server
        "http://localhost:5173", "http://127.0.0.1:5173",  # Vite dev server
        "http://localhost:5174", "http://127.0.0.1:5174",  # Vite dev server (alt port)
        "http://localhost:5175", "http://127.0.0.1:5175",  # Vite dev server (alt port)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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