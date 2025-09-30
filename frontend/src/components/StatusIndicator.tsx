import React from 'react';
import { AlertCircle, CheckCircle, Clock, WifiOff } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'connected' | 'warning' | 'disconnected' | 'no_data';
  label?: string;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label = 'Status', 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-success-600',
          bgColor: 'bg-success-100',
          text: 'Connected',
          pulse: 'status-indicator connected'
        };
      case 'warning':
        return {
          icon: Clock,
          color: 'text-warning-600',
          bgColor: 'bg-warning-100',
          text: 'Warning',
          pulse: 'status-indicator warning'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-danger-600',
          bgColor: 'bg-danger-100',
          text: 'Disconnected',
          pulse: 'status-indicator error'
        };
      case 'no_data':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'No Data',
          pulse: ''
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: 'Unknown',
          pulse: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bgColor}`}>
        <div className={config.pulse}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;