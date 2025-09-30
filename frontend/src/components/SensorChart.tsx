import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SensorReading } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorChartProps {
  data: SensorReading[];
  sensorType: 'vibration' | 'distance' | 'acceleration';
  title: string;
  height?: number;
}

const SensorChart: React.FC<SensorChartProps> = ({ data, sensorType, title, height = 300 }) => {
  const getChartData = () => {
    const labels = data.map(reading => {
      const date = new Date(reading.timestamp);
      return date.toLocaleTimeString();
    }).reverse(); // Reverse to show chronological order

    let datasets: any[] = [];

    switch (sensorType) {
      case 'vibration':
        datasets = [{
          label: 'Vibration (Raw)',
          data: data.map(reading => reading.vibration_raw).reverse(),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        }];
        break;
      
      case 'distance':
        datasets = [{
          label: 'Distance (cm)',
          data: data.map(reading => reading.distance_adjusted).reverse(),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
        }];
        break;
      
      case 'acceleration':
        datasets = [
          {
            label: 'X-axis',
            data: data.map(reading => reading.acceleration_x).reverse(),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.1,
          },
          {
            label: 'Y-axis',
            data: data.map(reading => reading.acceleration_y).reverse(),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.1,
          },
          {
            label: 'Z-axis',
            data: data.map(reading => reading.acceleration_z).reverse(),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.1,
          }
        ];
        break;
    }

    return {
      labels,
      datasets,
    };
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: sensorType === 'vibration' ? 'Raw Value' : 
                sensorType === 'distance' ? 'Distance (cm)' : 'Acceleration',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      <Line data={getChartData()} options={options} />
    </div>
  );
};

export default SensorChart;