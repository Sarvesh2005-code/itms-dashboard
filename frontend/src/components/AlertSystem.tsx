import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, Bell } from 'lucide-react';
import { sensorAPI } from '../services/api';
import type { FaultLog } from '../types';

interface AlertSystemProps {
  onNewAlert?: (alert: FaultLog) => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ onNewAlert }) => {
  const [alerts, setAlerts] = useState<FaultLog[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const faults = await sensorAPI.getFaults({ resolved: false, limit: 10 });
        setAlerts(faults);
        
        // Check for new alerts
        if (onNewAlert && faults.length > alerts.length) {
          const newAlerts = faults.filter(fault => 
            !alerts.some(existing => existing.id === fault.id)
          );
          newAlerts.forEach(alert => onNewAlert(alert));
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [alerts.length, onNewAlert]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-danger-50 border-danger-200',
          textColor: 'text-danger-800',
          iconColor: 'text-danger-600',
          icon: AlertTriangle,
        };
      case 'major':
        return {
          bgColor: 'bg-warning-50 border-warning-200',
          textColor: 'text-warning-800',
          iconColor: 'text-warning-600',
          icon: AlertTriangle,
        };
      case 'minor':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Clock,
        };
      default:
        return {
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          icon: Bell,
        };
    }
  };

  const dismissAlert = (alertId: number) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const resolveAlert = async (alertId: number) => {
    try {
      await sensorAPI.resolveFault(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {activeAlerts.map((alert) => {
        const config = getSeverityConfig(alert.severity);
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-2 shadow-lg animate-slide-in ${config.bgColor}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-semibold ${config.textColor}`}>
                    {alert.fault_type.toUpperCase()} Alert
                  </p>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className={`${config.iconColor} hover:opacity-70`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <p className={`text-sm ${config.textColor} mb-2`}>
                  {alert.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${config.textColor} opacity-75`}>
                    {formatTimestamp(alert.timestamp)}
                  </span>
                  
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className={`text-xs px-2 py-1 rounded-md bg-white ${config.textColor} hover:bg-opacity-80 transition-colors`}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertSystem;