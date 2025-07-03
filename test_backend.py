#!/usr/bin/env python3
"""
Comprehensive Backend API Test Script
Tests all Flask backend endpoints for the AU Tram Tracking system
"""

import requests
import json
import time
import sys

# Configuration
BASE_URL = 'http://localhost:5001'
API_BASE = f'{BASE_URL}/api'

def test_health_check():
    """Test the health check endpoint"""
    print("🏥 Testing health check endpoint...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   Service: {data['service']}")
            print(f"   Version: {data['version']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_tram_status():
    """Test the tram status endpoint"""
    print("\n🚋 Testing tram status endpoint...")
    try:
        response = requests.get(f'{API_BASE}/tram/status')
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Tram status endpoint working")
                print(f"   Status: {data['data']['currentStatus']}")
                print(f"   Tram ID: {data['data']['tram_id']}")
                print(f"   Buildings count: {data['metadata']['buildings_count']}")
                print(f"   Route points: {data['metadata']['route_points']}")
                return True
            else:
                print(f"❌ Tram status failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Tram status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Tram status error: {e}")
        return False

def test_position_update():
    """Test the position update endpoint"""
    print("\n📍 Testing position update endpoint...")
    test_lat = 13.612263
    test_lon = 100.836828
    
    try:
        response = requests.post(
            f'{API_BASE}/tram/position',
            headers={'Content-Type': 'application/json'},
            json={'lat': test_lat, 'lon': test_lon}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Position update successful")
                print(f"   Updated position: {test_lat}, {test_lon}")
                print(f"   Status: {data['data'].get('status', 'N/A')}")
                return True
            else:
                print(f"❌ Position update failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Position update failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Position update error: {e}")
        return False

def test_buildings_endpoint():
    """Test the buildings endpoint"""
    print("\n🏢 Testing buildings endpoint...")
    try:
        response = requests.get(f'{API_BASE}/buildings')
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Buildings endpoint working")
                print(f"   Buildings count: {data['count']}")
                for building in data['data']:
                    print(f"   - {building['name']} (ID: {building['id']})")
                return True
            else:
                print(f"❌ Buildings failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Buildings failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Buildings error: {e}")
        return False

def test_route_endpoint():
    """Test the route endpoint"""
    print("\n🗺️ Testing route endpoint...")
    try:
        response = requests.get(f'{API_BASE}/route')
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Route endpoint working")
                print(f"   Route points: {data['count']}")
                if data['count'] > 0:
                    first_point = data['data'][0]
                    last_point = data['data'][-1]
                    print(f"   First point: {first_point['lat']}, {first_point['lon']}")
                    print(f"   Last point: {last_point['lat']}, {last_point['lon']}")
                return True
            else:
                print(f"❌ Route failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Route failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Route error: {e}")
        return False

def test_simulation():
    """Test the simulation endpoints"""
    print("\n🎬 Testing simulation endpoints...")
    
    # Start simulation
    try:
        response = requests.post(
            f'{API_BASE}/tram/simulate',
            headers={'Content-Type': 'application/json'},
            json={'speed': 5.0}  # Fast simulation for testing
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Simulation started successfully")
                print(f"   Message: {data['message']}")
                
                # Wait a bit for simulation to run
                print("   Waiting 3 seconds for simulation to run...")
                time.sleep(3)
                
                # Check status during simulation
                status_response = requests.get(f'{API_BASE}/tram/status')
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    if status_data['success']:
                        tram_data = status_data['data']
                        print(f"   During simulation - Status: {tram_data['currentStatus']}")
                        print(f"   Speed: {tram_data['speed_kmh']} km/h")
                        if tram_data['location']['lat']:
                            print(f"   Position: {tram_data['location']['lat']}, {tram_data['location']['lng']}")
                
                # Stop simulation
                stop_response = requests.post(f'{API_BASE}/tram/simulate/stop')
                if stop_response.status_code == 200:
                    stop_data = stop_response.json()
                    if stop_data['success']:
                        print("✅ Simulation stopped successfully")
                        return True
                    else:
                        print(f"❌ Failed to stop simulation: {stop_data.get('error')}")
                        return False
                else:
                    print(f"❌ Failed to stop simulation: {stop_response.status_code}")
                    return False
            else:
                print(f"❌ Simulation start failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Simulation start failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Simulation error: {e}")
        return False

def test_stats_endpoint():
    """Test the stats endpoint"""
    print("\n📊 Testing stats endpoint...")
    try:
        response = requests.get(f'{API_BASE}/stats')
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Stats endpoint working")
                stats = data['data']
                print(f"   Total buildings: {stats['total_buildings']}")
                print(f"   Total route points: {stats['total_route_points']}")
                print(f"   Current position: {stats['current_position']}")
                print(f"   Uptime: {stats['uptime_seconds']:.1f} seconds")
                return True
            else:
                print(f"❌ Stats failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Stats failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stats error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid requests"""
    print("\n❌ Testing error handling...")
    
    # Test invalid position data
    try:
        response = requests.post(
            f'{API_BASE}/tram/position',
            headers={'Content-Type': 'application/json'},
            json={'lat': 'invalid', 'lon': 100.836828}
        )
        
        if response.status_code == 400:
            print("✅ Invalid coordinate handling works")
        else:
            print(f"⚠️ Unexpected response for invalid data: {response.status_code}")
        
        # Test missing data
        response = requests.post(
            f'{API_BASE}/tram/position',
            headers={'Content-Type': 'application/json'},
            json={'lat': 13.612263}  # Missing 'lon'
        )
        
        if response.status_code == 400:
            print("✅ Missing field handling works")
        else:
            print(f"⚠️ Unexpected response for missing data: {response.status_code}")
        
        # Test invalid endpoint
        response = requests.get(f'{API_BASE}/invalid/endpoint')
        if response.status_code == 404:
            print("✅ 404 handling works")
        else:
            print(f"⚠️ Unexpected response for invalid endpoint: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 AU Tram Tracking Backend API Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Tram Status", test_tram_status),
        ("Position Update", test_position_update),
        ("Buildings", test_buildings_endpoint),
        ("Route", test_route_endpoint),
        ("Simulation", test_simulation),
        ("Stats", test_stats_endpoint),
        ("Error Handling", test_error_handling)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 