import axios from 'axios';
import type { DashboardData, SensorReading, FaultLog, SensorStats, SensorDataInput } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const sensorAPI = {
  // Get complete dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/dashboard');
    return response.data;
  },

  // Get latest sensor reading
  getLatestReading: async (): Promise<SensorReading | null> => {
    const response = await apiClient.get<SensorReading | null>('/sensor-data/latest');
    return response.data;
  },

  // Get historical sensor data
  getSensorData: async (params?: {
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<SensorReading[]> => {
    const response = await apiClient.get<SensorReading[]>('/sensor-data', { params });
    return response.data;
  },

  // Get fault logs
  getFaults: async (params?: {
    limit?: number;
    resolved?: boolean;
    severity?: string;
  }): Promise<FaultLog[]> => {
    const response = await apiClient.get<FaultLog[]>('/faults', { params });
    return response.data;
  },

  // Get sensor statistics
  getStats: async (): Promise<SensorStats> => {
    const response = await apiClient.get<SensorStats>('/stats');
    return response.data;
  },

  // Submit sensor data (for testing)
  submitSensorData: async (data: SensorDataInput): Promise<any> => {
    const response = await apiClient.post('/sensor-data', data);
    return response.data;
  },

  // Resolve a fault
  resolveFault: async (faultId: number): Promise<any> => {
    const response = await apiClient.put(`/faults/${faultId}/resolve`);
    return response.data;
  },
};

export default sensorAPI;