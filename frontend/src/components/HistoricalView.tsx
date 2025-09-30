import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { sensorAPI } from '../services/api';
import type { SensorReading, FaultLog } from '../types';

const HistoricalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'readings' | 'faults'>('readings');
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [faultData, setFaultData] = useState<FaultLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'readings') {
      fetchSensorData();
    } else {
      fetchFaultData();
    }
  }, [activeTab, dateFilter, severityFilter]);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      
      if (dateFilter) {
        const startDate = new Date(dateFilter);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        params.start_date = startDate.toISOString();
        params.end_date = endDate.toISOString();
      }
      
      const data = await sensorAPI.getSensorData(params);
      setSensorData(data);
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaultData = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      
      if (severityFilter) {
        params.severity = severityFilter;
      }
      
      const data = await sensorAPI.getFaults(params);
      setFaultData(data);
    } catch (error) {
      console.error('Failed to fetch fault data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportData = () => {
    const data = activeTab === 'readings' ? sensorData : faultData;
    const csvContent = [
      activeTab === 'readings' 
        ? 'Timestamp,IR Detection,Vibration Raw,Distance,Acc X,Acc Y,Acc Z,Fault'
        : 'Timestamp,Type,Severity,Description,Resolved',
      ...data.map(row => 
        activeTab === 'readings' 
          ? `${(row as SensorReading).timestamp},${(row as SensorReading).ir_detection},${(row as SensorReading).vibration_raw},${(row as SensorReading).distance_adjusted},${(row as SensorReading).acceleration_x},${(row as SensorReading).acceleration_y},${(row as SensorReading).acceleration_z},${(row as SensorReading).fault_detected}`
          : `${(row as FaultLog).timestamp},${(row as FaultLog).fault_type},${(row as FaultLog).severity},${(row as FaultLog).description},${(row as FaultLog).resolved}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itms-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = activeTab === 'readings' 
    ? sensorData.filter(reading => 
        searchTerm === '' || 
        reading.raw_sensor_data.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faultData.filter(fault =>
        searchTerm === '' ||
        fault.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.fault_type.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Historical Data</h2>
        <button
          onClick={exportData}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('readings')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'readings'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sensor Readings
        </button>
        <button
          onClick={() => setActiveTab('faults')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'faults'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fault Logs
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
          />
        </div>
        
        {activeTab === 'readings' ? (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
        ) : (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full appearance-none"
            >
              <option value="">All Severities</option>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'readings' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vibration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acceleration (X,Y,Z)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.slice(0, 50).map((reading) => {
                    const sensorReading = reading as SensorReading;
                    return (
                      <tr key={sensorReading.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(sensorReading.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sensorReading.ir_detection === 1 
                              ? 'bg-danger-100 text-danger-800' 
                              : 'bg-success-100 text-success-800'
                          }`}>
                            {sensorReading.ir_detection === 1 ? 'DETECTED' : 'CLEAR'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={sensorReading.vibration_fault ? 'text-danger-600 font-semibold' : ''}>
                            {sensorReading.vibration_raw}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={sensorReading.distance_fault ? 'text-warning-600 font-semibold' : ''}>
                            {sensorReading.distance_adjusted.toFixed(1)} cm
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sensorReading.acceleration_x.toFixed(1)}, {sensorReading.acceleration_y.toFixed(1)}, {sensorReading.acceleration_z.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sensorReading.fault_detected 
                              ? 'bg-danger-100 text-danger-800' 
                              : 'bg-success-100 text-success-800'
                          }`}>
                            {sensorReading.fault_detected ? 'FAULT' : 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((fault) => {
                    const faultLog = fault as FaultLog;
                    return (
                      <tr key={faultLog.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(faultLog.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-warning-500" />
                            {faultLog.fault_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            faultLog.severity === 'critical' ? 'bg-danger-100 text-danger-800' :
                            faultLog.severity === 'major' ? 'bg-warning-100 text-warning-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {faultLog.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {faultLog.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {faultLog.resolved ? (
                              <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-danger-600 mr-2" />
                            )}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              faultLog.resolved ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                            }`}>
                              {faultLog.resolved ? 'Resolved' : 'Active'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {!faultLog.resolved && (
                            <button
                              onClick={async () => {
                                try {
                                  await sensorAPI.resolveFault(faultLog.id);
                                  await fetchFaultData();
                                } catch (error) {
                                  console.error('Failed to resolve fault:', error);
                                }
                              }}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {/* Results count */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing {filteredData.length} {activeTab === 'readings' ? 'sensor readings' : 'fault logs'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoricalView;