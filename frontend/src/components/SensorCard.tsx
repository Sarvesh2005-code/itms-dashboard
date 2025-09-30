import React from 'react';
import { AlertTriangle, Activity, Ruler, Eye, Gauge } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: 'vibration' | 'distance' | 'ir' | 'acceleration';
  status: 'normal' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ 
  title, 
  value, 
  unit = '', 
  icon, 
  status, 
  trend,
  className = '' 
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'vibration':
        return Activity;
      case 'distance':
        return Ruler;
      case 'ir':
        return Eye;
      case 'acceleration':
        return Gauge;
      default:
        return Activity;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'border-success-200 bg-success-50';
      case 'warning':
        return 'border-warning-200 bg-warning-50';
      case 'danger':
        return 'border-danger-200 bg-danger-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getValueColor = () => {
    switch (status) {
      case 'normal':
        return 'text-success-700';
      case 'warning':
        return 'text-warning-700';
      case 'danger':
        return 'text-danger-700';
      default:
        return 'text-gray-700';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'normal':
        return 'text-success-600';
      case 'warning':
        return 'text-warning-600';
      case 'danger':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const Icon = getIcon();

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon className={`h-5 w-5 ${getIconColor()}`} />
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold ${getValueColor()}`}>
            {value}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </p>
        </div>
        
        {status === 'danger' && (
          <AlertTriangle className="h-5 w-5 text-danger-600" />
        )}
      </div>
      
      {trend && (
        <div className="mt-2 text-xs text-gray-500">
          Trend: {trend}
        </div>
      )}
    </div>
  );
};

export default SensorCard;