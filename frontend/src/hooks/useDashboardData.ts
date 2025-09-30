import { useState, useEffect, useCallback } from 'react';
import { sensorAPI } from '../services/api';
import type { DashboardData } from '../types';

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  isConnected: boolean;
}

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Error fetching dashboard data:', err);
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
      const interval = setInterval(fetchData, refreshInterval);
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