#!/usr/bin/env python3
"""
Quick continuous NodeMCU data sender
Sends realistic sensor data every 3 seconds for testing
"""

import requests
import json
import time
import random
from datetime import datetime

def generate_sensor_data():
    """Generate realistic sensor data"""
    ir_sensor = random.choice([0, 1])
    vibration_raw = random.randint(300, 500)
    distance_adj = round(random.uniform(5.0, 60.0), 1)
    acc_x = random.randint(-500, 500)
    acc_y = random.randint(-500, 500)
    acc_z = random.randint(8000, 12000)
    
    # Determine fault status
    fault_detected = 1 if (ir_sensor == 1 or 
                          (400 <= vibration_raw <= 450) or 
                          (distance_adj < 5.0 or distance_adj > 50.0)) else 0
    
    sensor_data_string = f"IR:{ir_sensor},VIB_RAW:{vibration_raw},DIST_ADJ:{distance_adj},ACC:{acc_x},{acc_y},{acc_z},FAULT:{fault_detected}"
    
    return {
        "sensorData": sensor_data_string,
        "timestamp": datetime.now().isoformat()
    }

def send_data(data):
    """Send data to backend"""
    try:
        response = requests.post(
            "http://localhost:8000/api/sensor-data",
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            faults = result.get('faults_detected', [])
            fault_str = f" | Faults: {', '.join(faults)}" if faults else " | No faults"
            print(f"✅ [ID:{result.get('reading_id')}] {data['sensorData']}{fault_str}")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🔄 Continuous NodeMCU Data Sender")
    print("Sending data every 3 seconds. Press Ctrl+C to stop...")
    print("=" * 60)
    
    count = 0
    try:
        while True:
            count += 1
            print(f"\n📤 Packet {count} [{datetime.now().strftime('%H:%M:%S')}]:")
            
            data = generate_sensor_data()
            send_data(data)
            
            time.sleep(3)
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 Stopped after sending {count} packets.")

if __name__ == "__main__":
    main()