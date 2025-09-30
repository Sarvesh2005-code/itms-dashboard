from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class SensorDataInput(BaseModel):
    """Input model for sensor data from NodeMCU"""
    sensorData: str = Field(..., description="Raw sensor data string from NodeMCU")
    timestamp: str = Field(..., description="ISO timestamp from NodeMCU")

class ParsedSensorData(BaseModel):
    """Parsed sensor data model"""
    ir_detection: int = Field(..., ge=0, le=1, description="IR sensor detection (0 or 1)")
    vibration_raw: int = Field(..., ge=0, description="Raw vibration sensor value")
    distance_adjusted: float = Field(..., ge=0, description="Adjusted distance in cm")
    acceleration_x: float = Field(..., description="X-axis acceleration")
    acceleration_y: float = Field(..., description="Y-axis acceleration")
    acceleration_z: float = Field(..., description="Z-axis acceleration")
    fault_detected: int = Field(..., ge=0, le=1, description="Overall fault flag")

class SensorReading(BaseModel):
    """Output model for sensor readings"""
    id: int
    timestamp: datetime
    ir_detection: int
    vibration_raw: int
    vibration_fault: bool
    distance_adjusted: float
    distance_fault: bool
    acceleration_x: float
    acceleration_y: float
    acceleration_z: float
    fault_detected: bool
    raw_sensor_data: str
    
    class Config:
        from_attributes = True

class FaultLog(BaseModel):
    """Output model for fault logs"""
    id: int
    timestamp: datetime
    fault_type: str
    severity: str
    description: str
    sensor_reading_id: int
    resolved: bool
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SensorStats(BaseModel):
    """Model for sensor statistics"""
    total_readings: int
    total_faults: int
    fault_rate: float
    avg_vibration: float
    avg_distance: float
    last_reading_time: Optional[datetime]
    ir_detections_today: int
    active_faults: int

class DashboardData(BaseModel):
    """Complete dashboard data model"""
    latest_reading: Optional[SensorReading]
    recent_readings: List[SensorReading]
    recent_faults: List[FaultLog]
    stats: SensorStats
    connection_status: str = "connected"

class FaultResponse(BaseModel):
    """Response model for fault operations"""
    success: bool
    message: str
    fault_id: Optional[int] = None