import { useState, useEffect, useCallback } from 'react';
import { sensorAPI } from '../services/api';
import type { DashboardData, SensorReading, FaultLog, SensorStats } from '../types';

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  isConnected: boolean;
}

// Generate random sensor reading
const generateRandomReading = (id: number, timestamp: string): SensorReading => {
  const irDetection = Math.random() > 0.8 ? 1 : 0; // 20% chance of IR detection
  const vibrationRaw = Math.floor(Math.random() * 200) + 300; // Between 300-500
  const vibrationFault = vibrationRaw >= 400 && vibrationRaw <= 450;
  const distanceAdjusted = parseFloat((Math.random() * 50 + 5).toFixed(1)); // Between 5-55
  const distanceFault = distanceAdjusted < 5.0 || distanceAdjusted > 50.0;
  const accelerationX = Math.floor(Math.random() * 400) - 200; // Between -200 to 200
  const accelerationY = Math.floor(Math.random() * 400) - 200; // Between -200 to 200
  const accelerationZ = Math.floor(Math.random() * 2000) + 9000; // Between 9000-11000
  const faultDetected = vibrationFault || distanceFault || irDetection === 1;
  
  const rawData = `IR:${irDetection},VIB_RAW:${vibrationRaw},DIST_ADJ:${distanceAdjusted},ACC:${accelerationX},${accelerationY},${accelerationZ},FAULT:${faultDetected ? 1 : 0}`;
  
  return {
    id,
    timestamp,
    ir_detection: irDetection,
    vibration_raw: vibrationRaw,
    vibration_fault: vibrationFault,
    distance_adjusted: distanceAdjusted,
    distance_fault: distanceFault,
    acceleration_x: accelerationX,
    acceleration_y: accelerationY,
    acceleration_z: accelerationZ,
    fault_detected: faultDetected,
    raw_sensor_data: rawData
  };
};

// Generate random fault log
const generateRandomFault = (id: number, readingId: number, timestamp: string): FaultLog => {
  const faultTypes = ['vibration', 'distance', 'ir', 'acceleration'];
  const severities: ('minor' | 'major' | 'critical')[] = ['minor', 'major', 'critical'];
  const descriptions = [
    'Vibration threshold exceeded',
    'Distance out of range',
    'Track obstruction detected',
    'Unusual acceleration detected'
  ];
  
  const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const description = descriptions[faultTypes.indexOf(faultType)];
  
  return {
    id,
    timestamp,
    fault_type: faultType,
    severity,
    description,
    sensor_reading_id: readingId,
    resolved: false
  };
};

// Generate random stats
const generateRandomStats = (): SensorStats => {
  return {
    total_readings: Math.floor(Math.random() * 1000) + 100,
    total_faults: Math.floor(Math.random() * 100) + 10,
    fault_rate: parseFloat((Math.random() * 15).toFixed(2)),
    avg_vibration: parseFloat((Math.random() * 200 + 300).toFixed(2)),
    avg_distance: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    last_reading_time: new Date().toISOString(),
    ir_detections_today: Math.floor(Math.random() * 20),
    active_faults: Math.floor(Math.random() * 15)
  };
};

// Generate fallback dashboard data
const generateFallbackData = (): DashboardData => {
  const now = new Date().toISOString();
  const latestReading = generateRandomReading(1, now);
  
  // Generate 20 recent readings
  const recentReadings: SensorReading[] = [];
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(Date.now() - i * 2000).toISOString(); // 2 seconds apart
    recentReadings.push(generateRandomReading(i + 1, timestamp));
  }
  
  // Generate 10 recent faults
  const recentFaults: FaultLog[] = [];
  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(Date.now() - i * 5000).toISOString(); // 5 seconds apart
    recentFaults.push(generateRandomFault(i + 1, Math.floor(Math.random() * 20) + 1, timestamp));
  }
  
  return {
    latest_reading: latestReading,
    recent_readings: recentReadings,
    recent_faults: recentFaults,
    stats: generateRandomStats(),
    connection_status: 'disconnected'
  };
};

export const useDashboardData = (refreshInterval: number = 5000): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const dashboardData = await sensorAPI.getDashboardData();
      setData(dashboardData);
      setIsConnected(true);
    } catch (err) {
      // If API call fails, use fallback data
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Error fetching dashboard data:', err);
      
      // Generate fallback data
      const fallbackData = generateFallbackData();
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refreshData,
    isConnected
  };
};