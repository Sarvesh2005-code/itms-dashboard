#!/usr/bin/env python3
"""
Simple API Test Script for ITMS Backend
Tests all the API endpoints to ensure they're working correctly.
"""

import requests
import json
from datetime import datetime

def test_api_endpoints():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing ITMS Backend API Endpoints")
    print("=" * 40)
    
    # Test 1: Root endpoint
    print("\n1️⃣ Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print(f"✅ Root endpoint: {response.json()}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False
    
    # Test 2: Send sensor data
    print("\n2️⃣ Testing sensor data endpoint...")
    test_data = {
        "sensorData": "IR:1,VIB_RAW:435,DIST_ADJ:18.5,ACC:123,456,789,FAULT:1",
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/sensor-data",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            print(f"✅ Sensor data sent: {response.json()}")
        else:
            print(f"❌ Sensor data failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Sensor data error: {e}")
    
    # Test 3: Get recent sensor data
    print("\n3️⃣ Testing get recent sensor data...")
    try:
        response = requests.get(f"{base_url}/api/sensor-data")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Recent data retrieved: {len(data)} records")
            if data:
                print(f"   Latest record: {data[0]}")
        else:
            print(f"❌ Recent data failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Recent data error: {e}")
    
    # Test 4: Get alerts
    print("\n4️⃣ Testing alerts endpoint...")
    try:
        response = requests.get(f"{base_url}/api/faults")
        if response.status_code == 200:
            alerts = response.json()
            print(f"✅ Alerts retrieved: {len(alerts)} alerts")
            if alerts:
                print(f"   Latest alert: {alerts[0]}")
        else:
            print(f"❌ Alerts failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Alerts error: {e}")
    
    # Test 5: Get statistics
    print("\n5️⃣ Testing statistics endpoint...")
    try:
        response = requests.get(f"{base_url}/api/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statistics retrieved: {stats}")
        else:
            print(f"❌ Statistics failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Statistics error: {e}")
    
    print("\n🏁 API testing completed!")

if __name__ == "__main__":
    test_api_endpoints()