import re
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SensorDataParser:
    """Parser for NodeMCU sensor data"""
    
    # Fault detection thresholds
    VIBRATION_THRESHOLD_MIN = 400
    VIBRATION_THRESHOLD_MAX = 450
    DISTANCE_MIN_THRESHOLD = 5.0   # cm - too close
    DISTANCE_MAX_THRESHOLD = 50.0  # cm - too far
    
    @staticmethod
    def parse_sensor_string(sensor_data: str) -> Optional[Dict[str, Any]]:
        """
        Parse the sensor data string from NodeMCU
        Expected format: "IR:1,VIB_RAW:435,DIST_ADJ:18,ACC:123,456,789,FAULT:1"
        """
        try:
            parsed_data = {}
            
            # Split by commas and parse each component
            components = sensor_data.strip().split(',')
            
            for component in components:
                if ':' not in component:
                    continue
                    
                key, value = component.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                if key == 'IR':
                    parsed_data['ir_detection'] = int(value)
                elif key == 'VIB_RAW':
                    parsed_data['vibration_raw'] = int(value)
                elif key == 'DIST_ADJ':
                    parsed_data['distance_adjusted'] = float(value)
                elif key == 'ACC':
                    # Parse acceleration data (x,y,z)
                    # Find the next two components for y and z values
                    try:
                        acc_x = float(value)
                        # Get y and z from next components
                        acc_y_idx = components.index(component) + 1
                        acc_z_idx = components.index(component) + 2
                        
                        if acc_y_idx < len(components) and acc_z_idx < len(components):
                            acc_y = float(components[acc_y_idx])
                            acc_z = float(components[acc_z_idx])
                            
                            parsed_data['acceleration_x'] = acc_x
                            parsed_data['acceleration_y'] = acc_y
                            parsed_data['acceleration_z'] = acc_z
                        else:
                            # Default values if not enough components
                            parsed_data['acceleration_x'] = acc_x
                            parsed_data['acceleration_y'] = 0.0
                            parsed_data['acceleration_z'] = 0.0
                    except (ValueError, IndexError):
                        parsed_data['acceleration_x'] = 0.0
                        parsed_data['acceleration_y'] = 0.0
                        parsed_data['acceleration_z'] = 0.0
                elif key == 'FAULT':
                    parsed_data['fault_detected'] = int(value)
            
            # Validate required fields
            required_fields = ['ir_detection', 'vibration_raw', 'distance_adjusted', 'fault_detected']
            for field in required_fields:
                if field not in parsed_data:
                    logger.warning(f"Missing required field: {field}")
                    return None
            
            # Set default acceleration values if not present
            if 'acceleration_x' not in parsed_data:
                parsed_data['acceleration_x'] = 0.0
                parsed_data['acceleration_y'] = 0.0
                parsed_data['acceleration_z'] = 0.0
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error parsing sensor data '{sensor_data}': {str(e)}")
            return None
    
    @classmethod
    def detect_faults(cls, parsed_data: Dict[str, Any]) -> Dict[str, bool]:
        """
        Detect faults based on sensor thresholds
        Returns dictionary of fault flags for each sensor type
        """
        faults = {
            'vibration_fault': False,
            'distance_fault': False,
            'ir_fault': False,
            'acceleration_fault': False
        }
        
        try:
            # Vibration fault detection
            vib_raw = parsed_data.get('vibration_raw', 0)
            if cls.VIBRATION_THRESHOLD_MIN <= vib_raw <= cls.VIBRATION_THRESHOLD_MAX:
                faults['vibration_fault'] = True
            
            # Distance fault detection
            distance = parsed_data.get('distance_adjusted', 0)
            if distance < cls.DISTANCE_MIN_THRESHOLD or distance > cls.DISTANCE_MAX_THRESHOLD:
                faults['distance_fault'] = True
            
            # IR detection (obstruction detected)
            ir_detection = parsed_data.get('ir_detection', 0)
            if ir_detection == 1:
                faults['ir_fault'] = True
            
            # Acceleration fault detection (basic threshold check)
            acc_x = abs(parsed_data.get('acceleration_x', 0))
            acc_y = abs(parsed_data.get('acceleration_y', 0))
            acc_z = abs(parsed_data.get('acceleration_z', 0))
            
            # Check for unusual acceleration values (threshold can be adjusted)
            ACC_THRESHOLD = 1000  # Adjust based on your sensor calibration
            if acc_x > ACC_THRESHOLD or acc_y > ACC_THRESHOLD or acc_z > ACC_THRESHOLD:
                faults['acceleration_fault'] = True
                
        except Exception as e:
            logger.error(f"Error detecting faults: {str(e)}")
        
        return faults
    
    @staticmethod
    def parse_timestamp(timestamp_str: str) -> datetime:
        """
        Parse timestamp string to datetime object
        Expected format: "2025-09-28T12:00:00"
        """
        try:
            # Try parsing with timezone info first
            if timestamp_str.endswith('Z'):
                return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            elif '+' in timestamp_str or timestamp_str.count('-') > 2:
                return datetime.fromisoformat(timestamp_str)
            else:
                return datetime.fromisoformat(timestamp_str)
        except ValueError:
            # Fallback to current time if parsing fails
            logger.warning(f"Failed to parse timestamp '{timestamp_str}', using current time")
            return datetime.utcnow()
    
    @classmethod
    def process_sensor_input(cls, sensor_data: str, timestamp_str: str) -> Optional[Dict[str, Any]]:
        """
        Complete processing of sensor input from NodeMCU
        Returns processed data ready for database storage
        """
        # Parse the sensor data string
        parsed_data = cls.parse_sensor_string(sensor_data)
        if not parsed_data:
            return None
        
        # Parse timestamp
        timestamp = cls.parse_timestamp(timestamp_str)
        
        # Detect faults
        faults = cls.detect_faults(parsed_data)
        
        # Combine all data
        result = {
            'timestamp': timestamp,
            'raw_sensor_data': sensor_data,
            **parsed_data,
            **faults
        }
        
        # Override overall fault status if any individual fault is detected
        if any(faults.values()):
            result['fault_detected'] = True
        
        return result