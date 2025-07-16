import requests
import json
import time
from datetime import datetime, timezone

# Configuration
TRAM_ID = "tram_1"
UPDATE_INTERVAL = 2  # seconds between updates
MAX_ACCEPTABLE_GAP = 300  # same as original code

# Production API endpoint (your Vercel deployment)
API_URL = "https://au-journey-4rr7ppgi1-au-journeys-projects.vercel.app/api/redis/gps_data"

# GPS test route
GPS_ROUTE = [
    {"lat": 13.612263, "lon": 100.836828},
    {"lat": 13.612389, "lon": 100.836676},
    {"lat": 13.612412, "lon": 100.836585},
    {"lat": 13.612441, "lon": 100.836478},
    {"lat": 13.612473, "lon": 100.836363},
    {"lat": 13.612508, "lon": 100.836238},
    {"lat": 13.612534, "lon": 100.836147},
    {"lat": 13.612633, "lon": 100.835787},
    {"lat": 13.612686, "lon": 100.835602},
    {"lat": 13.612740, "lon": 100.835415},
    {"lat": 13.612796, "lon": 100.835222},
    {"lat": 13.612860, "lon": 100.835001},
    {"lat": 13.612950, "lon": 100.834689},
    {"lat": 13.613051, "lon": 100.834310},
    {"lat": 13.613115, "lon": 100.833858},
    {"lat": 13.613170, "lon": 100.833660},
    {"lat": 13.613202, "lon": 100.833545},
    {"lat": 13.613137, "lon": 100.833424},
    {"lat": 13.613034, "lon": 100.833390},
    {"lat": 13.612942, "lon": 100.833365},
    {"lat": 13.612815, "lon": 100.833320},
    {"lat": 13.612710, "lon": 100.833239},
    {"lat": 13.612659, "lon": 100.833162},
    {"lat": 13.612630, "lon": 100.833066},
    {"lat": 13.612630, "lon": 100.832969},
    {"lat": 13.612650, "lon": 100.832864},
    {"lat": 13.612673, "lon": 100.832775},
    {"lat": 13.612708, "lon": 100.832643},
    {"lat": 13.612734, "lon": 100.832550},
    {"lat": 13.612763, "lon": 100.832447},
    {"lat": 13.612791, "lon": 100.832348},
    {"lat": 13.612818, "lon": 100.832253},
    {"lat": 13.612844, "lon": 100.832160},
    {"lat": 13.612869, "lon": 100.832071},
    {"lat": 13.612906, "lon": 100.831941},
    {"lat": 13.612937, "lon": 100.831829},
    {"lat": 13.612962, "lon": 100.831739},
    {"lat": 13.612986, "lon": 100.831645},
    {"lat": 13.613007, "lon": 100.831560},
    {"lat": 13.613032, "lon": 100.831466},
    {"lat": 13.613053, "lon": 100.831380},
    {"lat": 13.613075, "lon": 100.831292},
    {"lat": 13.613095, "lon": 100.831208},
    {"lat": 13.613115, "lon": 100.831125},
    {"lat": 13.613134, "lon": 100.831045},
    {"lat": 13.613152, "lon": 100.830968},
    {"lat": 13.613170, "lon": 100.830893},
    {"lat": 13.613187, "lon": 100.830820},
    {"lat": 13.613203, "lon": 100.830749},
    {"lat": 13.613218, "lon": 100.830681},
    {"lat": 13.613232, "lon": 100.830615},
    {"lat": 13.613246, "lon": 100.830551},
    {"lat": 13.613258, "lon": 100.830489},
    {"lat": 13.613270, "lon": 100.830429},
    {"lat": 13.613282, "lon": 100.830371},
    {"lat": 13.613293, "lon": 100.830315},
    {"lat": 13.613303, "lon": 100.830261},
    {"lat": 13.613298, "lon": 100.830298},
    {"lat": 13.613304, "lon": 100.830376},
    {"lat": 13.613298, "lon": 100.830472},
    {"lat": 13.613309, "lon": 100.833474},
    {"lat": 13.613202, "lon": 100.833545},
    {"lat": 13.613141, "lon": 100.833766},
    {"lat": 13.613044, "lon": 100.834096},
    {"lat": 13.613051, "lon": 100.834310},
    {"lat": 13.613028, "lon": 100.834406},
    {"lat": 13.612269, "lon": 100.836708},
    {"lat": 13.612305, "lon": 100.836591},
    {"lat": 13.612336, "lon": 100.836485},
    {"lat": 13.612364, "lon": 100.836388},
    {"lat": 13.612392, "lon": 100.836290},
    {"lat": 13.612420, "lon": 100.836193},
    {"lat": 13.612449, "lon": 100.836096},
    {"lat": 13.612505, "lon": 100.835902},
    {"lat": 13.612560, "lon": 100.835712},
    {"lat": 13.612586, "lon": 100.835620},
    {"lat": 13.612612, "lon": 100.835529},
    {"lat": 13.612663, "lon": 100.835346},
    {"lat": 13.612688, "lon": 100.835254},
    {"lat": 13.612738, "lon": 100.835072},
    {"lat": 13.612763, "lon": 100.834983},
    {"lat": 13.612802, "lon": 100.834851},
    {"lat": 13.612840, "lon": 100.834719},
    {"lat": 13.612877, "lon": 100.834590},
    {"lat": 13.612913, "lon": 100.834469},
    {"lat": 13.612950, "lon": 100.834343},
    {"lat": 13.612989, "lon": 100.834218},
    {"lat": 13.613077, "lon": 100.833994},
    {"lat": 13.613077, "lon": 100.837091},
    {"lat": 13.613279, "lon": 100.837156},
    {"lat": 13.613257, "lon": 100.837379},
    {"lat": 13.613170, "lon": 100.837694},
    {"lat": 13.613046, "lon": 100.838149},
    {"lat": 13.612858, "lon": 100.838805},
    {"lat": 13.612714, "lon": 100.839304},
    {"lat": 13.612734, "lon": 100.839536},
    {"lat": 13.612683, "lon": 100.839619},
    {"lat": 13.612557, "lon": 100.839575},
    {"lat": 13.612595, "lon": 100.839452},
    {"lat": 13.612612, "lon": 100.839687},
    {"lat": 13.612574, "lon": 100.839796},
    {"lat": 13.612548, "lon": 100.839886},
    {"lat": 13.612485, "lon": 100.839503},
    {"lat": 13.612376, "lon": 100.839465},
    {"lat": 13.612515, "lon": 100.840012},
    {"lat": 13.612460, "lon": 100.840202},
    {"lat": 13.612423, "lon": 100.840328},
    {"lat": 13.612397, "lon": 100.840418},
    {"lat": 13.612330, "lon": 100.840650},
    {"lat": 13.612613, "lon": 100.840080},
    {"lat": 13.612721, "lon": 100.840114},
    {"lat": 13.612847, "lon": 100.840148},
    {"lat": 13.612956, "lon": 100.840176},
    {"lat": 13.612992, "lon": 100.840298},
    {"lat": 13.612943, "lon": 100.840410},
    {"lat": 13.612824, "lon": 100.840404},
    {"lat": 13.612731, "lon": 100.840379},
    {"lat": 13.612615, "lon": 100.840347},
    {"lat": 13.612527, "lon": 100.840321}
]


class ProductionTramTracker:
    def __init__(self):
        self.current_point = None
        self.previous_point = None
        self.last_update_time = time.time()
        self._test_api_connection()
        
    def _test_api_connection(self):
        """Test if the API endpoint is accessible"""
        try:
            response = requests.get(f"{API_URL.replace('/redis/gps_data', '/health')}", timeout=10)
            if response.status_code == 200:
                print("✅ Successfully connected to Vercel API")
            else:
                print(f"⚠️  API returned status {response.status_code}")
        except Exception as e:
            print(f"❌ API Connection Test Failed: {e}")
            print("🔧 Note: Make sure to disable Vercel Authentication in your dashboard")

    def get_utc_timestamp(self):
        return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    def update_api(self, point):
        current_time = self.get_utc_timestamp()
        
        new_point = {
            "lat": point["lat"],
            "lon": point["lon"],
            "t": current_time
        }
        
        if self.current_point is None:
            self.current_point = new_point
            self.previous_point = new_point
            self.last_update_time = time.time()
            return

        if time.time() - self.last_update_time >= UPDATE_INTERVAL:
            self.previous_point = self.current_point
            self.current_point = new_point
            
            tram_data = {
                "c": self.current_point,
                "p": self.previous_point,
                "s": "active"
            }
            
            try:
                # Send data to Vercel API
                response = requests.post(API_URL, json=tram_data, timeout=10)
                
                if response.status_code == 200:
                    print(f"✅ Updated position: Lat: {point['lat']:.6f}, Lon: {point['lon']:.6f}")
                else:
                    print(f"❌ API Error {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"❌ Failed to send data to API: {e}")
            
            self.last_update_time = time.time()

    def run(self, loop=True):
        print(f"🚋 Starting production tram tracker simulation for Tram {TRAM_ID}")
        print(f"📍 API Endpoint: {API_URL}")
        print("🔄 Press Ctrl+C to stop")
        
        while True:
            for i, point in enumerate(GPS_ROUTE):
                self.update_api(point)
                print(f"📍 Point {i+1}/{len(GPS_ROUTE)} - Next update in {UPDATE_INTERVAL}s...")
                time.sleep(UPDATE_INTERVAL)
            
            if not loop:
                break
            
            print("🔄 Route completed, starting over...")

if __name__ == "__main__":
    tracker = ProductionTramTracker()
    try:
        # Set loop=True to continuously repeat the route, or False to run once
        tracker.run(loop=True)
    except KeyboardInterrupt:
        print("\n🛑 Simulation stopped by user") 