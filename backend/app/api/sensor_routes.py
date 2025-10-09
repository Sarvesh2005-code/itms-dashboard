from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..database import get_db, SensorReading as DBSensorReading, FaultLog as DBFaultLog
from ..models import (
    SensorDataInput, SensorReading, FaultLog, DashboardData, 
    SensorStats, FaultResponse
)
from ..utils.sensor_parser import SensorDataParser

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/sensor-data", response_model=dict)
async def receive_sensor_data(
    data: SensorDataInput,
    db: Session = Depends(get_db)
):
    """
    Receive sensor data from NodeMCU
    Expected payload: {"sensorData": "IR:1,VIB_RAW:435,DIST_ADJ:18,ACC:123,456,789,FAULT:1", "timestamp": "2025-09-28T12:00:00"}
    """
    try:
        # Process the sensor data
        processed_data = SensorDataParser.process_sensor_input(
            data.sensorData, 
            data.timestamp
        )
        
        if not processed_data:
            raise HTTPException(status_code=400, detail="Invalid sensor data format")
        
        # Create database record
        db_reading = DBSensorReading(
            timestamp=processed_data['timestamp'],
            ir_detection=processed_data['ir_detection'],
            vibration_raw=processed_data['vibration_raw'],
            vibration_fault=processed_data['vibration_fault'],
            distance_adjusted=processed_data['distance_adjusted'],
            distance_fault=processed_data['distance_fault'],
            acceleration_x=processed_data['acceleration_x'],
            acceleration_y=processed_data['acceleration_y'],
            acceleration_z=processed_data['acceleration_z'],
            fault_detected=processed_data['fault_detected'],
            raw_sensor_data=processed_data['raw_sensor_data']
        )
        
        db.add(db_reading)
        db.commit()
        db.refresh(db_reading)
        
        # Create fault logs if any faults detected
        fault_logs = []
        if processed_data['vibration_fault']:
            fault_log = DBFaultLog(
                fault_type='vibration',
                severity='major',
                description=f'Vibration threshold exceeded: {processed_data["vibration_raw"]}',
                sensor_reading_id=db_reading.id
            )
            db.add(fault_log)
            fault_logs.append('vibration')
        
        if processed_data['distance_fault']:
            fault_log = DBFaultLog(
                fault_type='distance',
                severity='minor',
                description=f'Distance out of range: {processed_data["distance_adjusted"]}cm',
                sensor_reading_id=db_reading.id
            )
            db.add(fault_log)
            fault_logs.append('distance')
        
        if processed_data['ir_detection']:
            fault_log = DBFaultLog(
                fault_type='ir',
                severity='critical',
                description='Track obstruction detected',
                sensor_reading_id=db_reading.id
            )
            db.add(fault_log)
            fault_logs.append('ir')
        
        if processed_data.get('acceleration_fault'):
            fault_log = DBFaultLog(
                fault_type='acceleration',
                severity='major',
                description='Unusual acceleration detected',
                sensor_reading_id=db_reading.id
            )
            db.add(fault_log)
            fault_logs.append('acceleration')
        
        db.commit()
        
        logger.info(f"Stored sensor reading {db_reading.id} with faults: {fault_logs}")
        
        return {
            "success": True,
            "message": "Sensor data received and stored",
            "reading_id": db_reading.id,
            "faults_detected": fault_logs,
            "timestamp": processed_data['timestamp'].isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing sensor data: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing sensor data: {str(e)}")

@router.get("/sensor-data/latest", response_model=Optional[SensorReading])
async def get_latest_reading(db: Session = Depends(get_db)):
    """Get the most recent sensor reading"""
    reading = db.query(DBSensorReading).order_by(desc(DBSensorReading.timestamp)).first()
    return reading

@router.get("/sensor-data", response_model=List[SensorReading])
async def get_sensor_data(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get historical sensor data with pagination and filtering"""
    query = db.query(DBSensorReading).order_by(desc(DBSensorReading.timestamp))
    
    if start_date:
        query = query.filter(DBSensorReading.timestamp >= start_date)
    if end_date:
        query = query.filter(DBSensorReading.timestamp <= end_date)
    
    readings = query.offset(offset).limit(limit).all()
    return readings

@router.get("/faults", response_model=List[FaultLog])
async def get_faults(
    limit: int = Query(50, ge=1, le=500),
    resolved: Optional[bool] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get fault logs with filtering options"""
    query = db.query(DBFaultLog).order_by(desc(DBFaultLog.timestamp))
    
    if resolved is not None:
        query = query.filter(DBFaultLog.resolved == resolved)
    if severity:
        query = query.filter(DBFaultLog.severity == severity)
    
    faults = query.limit(limit).all()
    return faults

@router.put("/faults/{fault_id}/resolve", response_model=FaultResponse)
async def resolve_fault(fault_id: int, db: Session = Depends(get_db)):
    """Mark a fault as resolved"""
    fault = db.query(DBFaultLog).filter(DBFaultLog.id == fault_id).first()
    if not fault:
        raise HTTPException(status_code=404, detail="Fault not found")
    
    fault.resolved = True
    fault.resolved_at = datetime.utcnow()
    db.commit()
    
    return FaultResponse(
        success=True,
        message="Fault marked as resolved",
        fault_id=fault_id
    )

@router.get("/stats", response_model=SensorStats)
async def get_sensor_stats(db: Session = Depends(get_db)):
    """Get sensor statistics for dashboard"""
    # Total readings
    total_readings = db.query(DBSensorReading).count()
    
    # Total faults
    total_faults = db.query(DBFaultLog).count()
    
    # Fault rate
    fault_rate = (total_faults / total_readings * 100) if total_readings > 0 else 0
    
    # Average vibration and distance
    avg_stats = db.query(
        func.avg(DBSensorReading.vibration_raw).label('avg_vibration'),
        func.avg(DBSensorReading.distance_adjusted).label('avg_distance')
    ).first()
    
    avg_vibration = float(avg_stats.avg_vibration) if avg_stats.avg_vibration else 0
    avg_distance = float(avg_stats.avg_distance) if avg_stats.avg_distance else 0
    
    # Last reading time
    last_reading = db.query(DBSensorReading).order_by(desc(DBSensorReading.timestamp)).first()
    last_reading_time = last_reading.timestamp if last_reading else None
    
    # IR detections today
    today = datetime.utcnow().date()
    ir_detections_today = db.query(DBSensorReading).filter(
        func.date(DBSensorReading.timestamp) == today,
        DBSensorReading.ir_detection == 1
    ).count()
    
    # Active (unresolved) faults
    active_faults = db.query(DBFaultLog).filter(DBFaultLog.resolved == False).count()
    
    return SensorStats(
        total_readings=total_readings,
        total_faults=total_faults,
        fault_rate=round(fault_rate, 2),
        avg_vibration=round(avg_vibration, 2),
        avg_distance=round(avg_distance, 2),
        last_reading_time=last_reading_time,
        ir_detections_today=ir_detections_today,
        active_faults=active_faults
    )

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Get complete dashboard data in one request"""
    # Latest reading
    latest_reading = db.query(DBSensorReading).order_by(desc(DBSensorReading.timestamp)).first()
    
    # Recent readings (last 20)
    recent_readings = db.query(DBSensorReading).order_by(desc(DBSensorReading.timestamp)).limit(20).all()
    
    # Recent faults (last 10)
    recent_faults = db.query(DBFaultLog).order_by(desc(DBFaultLog.timestamp)).limit(10).all()
    
    # Stats
    stats_data = await get_sensor_stats(db)
    
    # Connection status with tighter thresholds
    connection_status = "connected"
    if latest_reading:
        time_since_last = datetime.utcnow() - latest_reading.timestamp
        if time_since_last > timedelta(seconds=10):
            connection_status = "disconnected"
        elif time_since_last > timedelta(seconds=5):
            connection_status = "warning"
    else:
        connection_status = "no_data"
    
    return DashboardData(
        latest_reading=latest_reading,
        recent_readings=recent_readings,
        recent_faults=recent_faults,
        stats=stats_data,
        connection_status=connection_status
    )

@router.get("/export", response_model=dict)
async def export_csv(db: Session = Depends(get_db)):
    """Export last 6 hours of readings as CSV string (inline)."""
    import csv
    import io
    cutoff = datetime.utcnow() - timedelta(hours=6)
    readings = (
        db.query(DBSensorReading)
        .filter(DBSensorReading.timestamp >= cutoff)
        .order_by(desc(DBSensorReading.timestamp))
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'id','timestamp','ir_detection','vibration_raw','vibration_fault','distance_adjusted','distance_fault',
        'acceleration_x','acceleration_y','acceleration_z','fault_detected','raw_sensor_data'
    ])
    for r in readings:
        writer.writerow([
            r.id, r.timestamp.isoformat() if r.timestamp else '', r.ir_detection, r.vibration_raw, r.vibration_fault,
            r.distance_adjusted, r.distance_fault, r.acceleration_x, r.acceleration_y, r.acceleration_z,
            r.fault_detected, r.raw_sensor_data
        ])
    return {"filename": "itms_export.csv", "csv": output.getvalue()}