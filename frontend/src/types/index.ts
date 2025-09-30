export interface SensorReading {
  id: number;
  timestamp: string;
  ir_detection: number;
  vibration_raw: number;
  vibration_fault: boolean;
  distance_adjusted: number;
  distance_fault: boolean;
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
  fault_detected: boolean;
  raw_sensor_data: string;
}

export interface FaultLog {
  id: number;
  timestamp: string;
  fault_type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  sensor_reading_id: number;
  resolved: boolean;
  resolved_at?: string;
}

export interface SensorStats {
  total_readings: number;
  total_faults: number;
  fault_rate: number;
  avg_vibration: number;
  avg_distance: number;
  last_reading_time?: string;
  ir_detections_today: number;
  active_faults: number;
}

export interface DashboardData {
  latest_reading?: SensorReading;
  recent_readings: SensorReading[];
  recent_faults: FaultLog[];
  stats: SensorStats;
  connection_status: 'connected' | 'warning' | 'disconnected' | 'no_data';
}

export type SensorDataInput = {
  sensorData: string;
  timestamp: string;
};