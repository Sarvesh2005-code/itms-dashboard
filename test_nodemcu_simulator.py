#!/usr/bin/env python3
"""
NodeMCU ESP8266MOD Simulator for ITMS Testing
This script simulates the NodeMCU sending sensor data to test the backend API.
"""

import requests
import json
import time
import random
import threading
from datetime import datetime

class NodeMCUSimulator:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.running = False
        
    def generate_sensor_data(self):
        """Generate realistic sensor data similar to what NodeMCU would send"""
        # Generate individual sensor values
        ir_sensor = random.choice([0, 1])  # 0 = no object, 1 = object detected
        vibration_raw = random.randint(300, 500)  # Raw ADC value
        distance_adj = round(random.uniform(5.0, 60.0), 1)  # Distance in cm
        acc_x = random.randint(-500, 500)  # Acceleration values as integers
        acc_y = random.randint(-500, 500)
        acc_z = random.randint(8000, 12000)  # Z-axis includes gravity
        
        # Determine overall fault status
        fault_detected = 1 if (ir_sensor == 1 or 
                              (400 <= vibration_raw <= 450) or 
                              (distance_adj < 5.0 or distance_adj > 50.0)) else 0
        
        # Create the sensor data string in the expected format
        sensor_data_string = f"IR:{ir_sensor},VIB_RAW:{vibration_raw},DIST_ADJ:{distance_adj},ACC:{acc_x},{acc_y},{acc_z},FAULT:{fault_detected}"
        
        return {
            "sensorData": sensor_data_string,
            "timestamp": datetime.now().isoformat()
        }
    
    def send_data(self, data):
        """Send data to the backend API"""
        try:
            response = requests.post(
                f"{self.base_url}/api/sensor-data",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Data sent successfully: {response.json()}")
                return True
            else:
                print(f"❌ Failed to send data. Status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Backend server is not running!")
            print("Please start the backend server first: cd backend && python -m uvicorn main:app --reload")
            return False
        except requests.exceptions.Timeout:
            print("❌ Timeout: Backend server is not responding")
            return False
        except Exception as e:
            print(f"❌ Error sending data: {str(e)}")
            return False
    
    def test_connection(self):
        """Test if the backend server is accessible"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                print("✅ Backend server is running and accessible")
                return True
            else:
                print(f"⚠️  Backend server responded with status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to backend server: {str(e)}")
            print("Please make sure the backend server is running on http://localhost:8000")
            return False
    
    def send_single_test(self):
        """Send a single test data packet"""
        print("\n🧪 Sending single test data packet...")
        data = self.generate_sensor_data()
        print(f"📤 Sending: {json.dumps(data, indent=2)}")
        
        success = self.send_data(data)
        return success
    
    def start_continuous_sending(self, interval=5):
        """Start sending data continuously"""
        print(f"\n🔄 Starting continuous data sending (every {interval} seconds)")
        print("Press Ctrl+C to stop...")
        
        self.running = True
        try:
            while self.running:
                data = self.generate_sensor_data()
                print(f"\n📤 [{datetime.now().strftime('%H:%M:%S')}] Sending sensor data...")
                success = self.send_data(data)
                
                if not success:
                    print("⚠️  Failed to send data, retrying in next cycle...")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping data transmission...")
            self.running = False
    
    def send_batch_test(self, count=5):
        """Send multiple test packets"""
        print(f"\n📦 Sending {count} test data packets...")
        successful = 0
        
        for i in range(count):
            print(f"\n📤 Packet {i+1}/{count}:")
            data = self.generate_sensor_data()
            if self.send_data(data):
                successful += 1
            time.sleep(1)  # Small delay between packets
        
        print(f"\n📊 Results: {successful}/{count} packets sent successfully")
        return successful == count

def main():
    print("🚀 NodeMCU ESP8266MOD Simulator for ITMS")
    print("=" * 50)
    
    simulator = NodeMCUSimulator()
    
    # Test connection first
    if not simulator.test_connection():
        print("\n❌ Cannot proceed without backend connection")
        return
    
    while True:
        print("\n📋 Select test mode:")
        print("1. Send single test packet")
        print("2. Send batch test (5 packets)")
        print("3. Start continuous sending")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            simulator.send_single_test()
            
        elif choice == "2":
            simulator.send_batch_test()
            
        elif choice == "3":
            try:
                interval = input("Enter interval in seconds (default 5): ").strip()
                interval = int(interval) if interval else 5
                simulator.start_continuous_sending(interval)
            except ValueError:
                print("❌ Invalid interval, using default 5 seconds")
                simulator.start_continuous_sending()
                
        elif choice == "4":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice, please try again")

if __name__ == "__main__":
    main()