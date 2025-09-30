import React, { useState } from 'react';
import { RefreshCw, Settings, Download, Bell } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import StatusIndicator from './StatusIndicator';
import SensorCard from './SensorCard';
import AlertSystem from './AlertSystem';
import type { SensorReading, FaultLog } from '../types';

const Dashboard: React.FC = () => {
  const { data, loading, error, refreshData } = useDashboardData(5000);
  const [showNotifications, setShowNotifications] = useState(true);

  const handleNewAlert = (alert: FaultLog) => {
    // You can add sound notifications or other alert handling here
    console.log('New alert received:', alert);
  };

  const getSensorStatus = (reading: SensorReading | undefined, sensorType: 'vibration' | 'distance' | 'ir') => {
    if (!reading) return 'normal';
    
    switch (sensorType) {
      case 'vibration':
        return reading.vibration_fault ? 'danger' : 'normal';
      case 'distance':
        return reading.distance_fault ? 'warning' : 'normal';
      case 'ir':
        return reading.ir_detection === 1 ? 'danger' : 'normal';
      default:
        return 'normal';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-danger-600 mb-4 text-2xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const latestReading = data?.latest_reading;
  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ITMS Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Intelligent Track Monitoring System
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusIndicator 
                status={data?.connection_status || 'no_data'} 
                label="System Status"
              />
              
              <button
                onClick={refreshData}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-md ${
                  showNotifications 
                    ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={showNotifications ? 'Hide Notifications' : 'Show Notifications'}
              >
                <Bell className="h-5 w-5" />
              </button>
              
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Readings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_readings || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Faults</p>
                <p className="text-2xl font-bold text-danger-600">{stats?.active_faults || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Fault Rate</p>
                <p className="text-2xl font-bold text-warning-600">{stats?.fault_rate || 0}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">IR Detections Today</p>
                <p className="text-2xl font-bold text-primary-600">{stats?.ir_detections_today || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Sensor Readings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Live Sensor Readings</h2>
            <p className="text-sm text-gray-600">
              Last updated: {formatTimestamp(latestReading?.timestamp)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SensorCard
              title="IR Detection"
              value={latestReading?.ir_detection === 1 ? 'DETECTED' : 'CLEAR'}
              icon="ir"
              status={getSensorStatus(latestReading, 'ir')}
            />
            
            <SensorCard
              title="Vibration"
              value={latestReading?.vibration_raw || 0}
              unit="raw"
              icon="vibration"
              status={getSensorStatus(latestReading, 'vibration')}
            />
            
            <SensorCard
              title="Distance"
              value={latestReading?.distance_adjusted?.toFixed(1) || '0.0'}
              unit="cm"
              icon="distance"
              status={getSensorStatus(latestReading, 'distance')}
            />
            
            <SensorCard
              title="Acceleration"
              value={latestReading ? 
                Math.sqrt(
                  Math.pow(latestReading.acceleration_x, 2) + 
                  Math.pow(latestReading.acceleration_y, 2) + 
                  Math.pow(latestReading.acceleration_z, 2)
                ).toFixed(1) : '0.0'
              }
              unit="m/s²"
              icon="acceleration"
              status="normal"
            />
          </div>
        </div>

        {/* Recent Faults */}
        {data?.recent_faults && data.recent_faults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Faults</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.recent_faults.slice(0, 5).map((fault) => (
                      <tr key={fault.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(fault.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fault.fault_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            fault.severity === 'critical' ? 'bg-danger-100 text-danger-800' :
                            fault.severity === 'major' ? 'bg-warning-100 text-warning-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fault.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {fault.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            fault.resolved ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                          }`}>
                            {fault.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </main>
      
      {/* Alert System */}
      {showNotifications && (
        <AlertSystem onNewAlert={handleNewAlert} />
      )}
    </div>
  );
};

export default Dashboard;