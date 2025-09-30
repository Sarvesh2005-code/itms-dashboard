from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database configuration
DATABASE_URL = "sqlite:///./itms_data.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class SensorReading(Base):
    """Model for storing sensor readings from NodeMCU"""
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # IR sensor data
    ir_detection = Column(Integer)  # 0 or 1
    
    # Vibration sensor data
    vibration_raw = Column(Integer)
    vibration_fault = Column(Boolean, default=False)
    
    # Ultrasonic sensor data
    distance_adjusted = Column(Float)
    distance_fault = Column(Boolean, default=False)
    
    # MPU6050 accelerometer data
    acceleration_x = Column(Float)
    acceleration_y = Column(Float)
    acceleration_z = Column(Float)
    
    # Overall fault status
    fault_detected = Column(Boolean, default=False)
    
    # Raw sensor data string for debugging
    raw_sensor_data = Column(String)

class FaultLog(Base):
    """Model for storing fault events"""
    __tablename__ = "fault_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    fault_type = Column(String)  # 'vibration', 'distance', 'ir', 'acceleration'
    severity = Column(String)    # 'minor', 'major', 'critical'
    description = Column(String)
    sensor_reading_id = Column(Integer)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)

def create_tables():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()