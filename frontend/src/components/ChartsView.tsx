import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import SensorChart from './SensorChart';
import { sensorAPI } from '../services/api';
import type { SensorReading } from '../types';

const ChartsView: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const startDate = new Date();
        
        // Set start date based on time range
        switch (timeRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '6h':
            startDate.setHours(now.getHours() - 6);
            break;
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        }

        const data = await sensorAPI.getSensorData({
          limit: timeRange === '1h' ? 60 : timeRange === '6h' ? 180 : timeRange === '24h' ? 288 : 1008,
          start_date: startDate.toISOString(),
          end_date: now.toISOString(),
        });
        
        setSensorData(data);
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [timeRange]);

  const timeRangeOptions = [
    { value: '1h' as const, label: '1 Hour' },
    { value: '6h' as const, label: '6 Hours' },
    { value: '24h' as const, label: '24 Hours' },
    { value: '7d' as const, label: '7 Days' },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Historical Data</h2>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeRange === option.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}\n        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vibration Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SensorChart
            data={sensorData}
            sensorType="vibration"
            title="Vibration Sensor Readings"
            height={320}
          />
        </div>

        {/* Distance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <SensorChart
            data={sensorData}
            sensorType="distance"
            title="Distance Measurements"
            height={320}
          />
        </div>

        {/* Acceleration Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <SensorChart
            data={sensorData}
            sensorType="acceleration"
            title="Acceleration Data (3-Axis)"
            height={320}
          />
        </div>
      </div>

      {/* Data Summary */}
      {sensorData.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">{sensorData.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Vibration</p>
              <p className="text-2xl font-bold text-gray-900">
                {sensorData.length > 0 
                  ? (sensorData.reduce((sum, reading) => sum + reading.vibration_raw, 0) / sensorData.length).toFixed(0)
                  : '0'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Distance</p>
              <p className="text-2xl font-bold text-gray-900">
                {sensorData.length > 0 
                  ? (sensorData.reduce((sum, reading) => sum + reading.distance_adjusted, 0) / sensorData.length).toFixed(1)
                  : '0.0'
                } cm
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsView;