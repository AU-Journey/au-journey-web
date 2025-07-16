import redis
import json
import time
from datetime import datetime, timezone

# Configuration
TRAM_ID = "tram_1"
UPDATE_INTERVAL = 2  # seconds between updates
MAX_ACCEPTABLE_GAP = 300  # same as original code

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
    {"lat": 13.613009, "lon": 100.831551},
    {"lat": 13.613034, "lon": 100.831459},
    {"lat": 13.613068, "lon": 100.831338},
    {"lat": 13.613114, "lon": 100.831223},
    {"lat": 13.613205, "lon": 100.831203},
    {"lat": 13.613314, "lon": 100.831234},
    {"lat": 13.613409, "lon": 100.831262},
    {"lat": 13.613503, "lon": 100.831290},
    {"lat": 13.613596, "lon": 100.831317},
    {"lat": 13.613692, "lon": 100.831346},
    {"lat": 13.613789, "lon": 100.831373},
    {"lat": 13.613881, "lon": 100.831400},
    {"lat": 13.613968, "lon": 100.831425},
    {"lat": 13.614096, "lon": 100.831462},
    {"lat": 13.614223, "lon": 100.831500},
    {"lat": 13.614341, "lon": 100.831533},
    {"lat": 13.614444, "lon": 100.831560},
    {"lat": 13.614511, "lon": 100.831654},
    {"lat": 13.614485, "lon": 100.831764},
    {"lat": 13.614458, "lon": 100.831869},
    {"lat": 13.614430, "lon": 100.831970},
    {"lat": 13.614375, "lon": 100.832160},
    {"lat": 13.614337, "lon": 100.832286},
    {"lat": 13.614310, "lon": 100.832388},
    {"lat": 13.614277, "lon": 100.832501},
    {"lat": 13.614220, "lon": 100.832695},
    {"lat": 13.614193, "lon": 100.832788},
    {"lat": 13.614158, "lon": 100.832906},
    {"lat": 13.614128, "lon": 100.833007},
    {"lat": 13.614067, "lon": 100.833220},
    {"lat": 13.614040, "lon": 100.833315},
    {"lat": 13.614005, "lon": 100.833436},
    {"lat": 13.613983, "lon": 100.833545},
    {"lat": 13.613884, "lon": 100.833614},
    {"lat": 13.613775, "lon": 100.833604},
    {"lat": 13.613670, "lon": 100.833580},
    {"lat": 13.613572, "lon": 100.833552},
    {"lat": 13.613482, "lon": 100.833526},
    {"lat": 13.613395, "lon": 100.833500},
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

class TestTramTracker:
    def __init__(self):
        self.redis_client = self._connect_redis()
        self.current_point = None
        self.previous_point = None
        self.last_update_time = time.time()
        
    def _connect_redis(self):
        try:
            client = redis.StrictRedis(
                host="redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com",
                port=15238,
                password="HOwS9Ta53CidWxys59VlS51v2yp88tY9",
                decode_responses=True
            )
            client.ping()
            print("Successfully connected to Redis")
            return client
        except Exception as e:
            print(f"Redis Connection Failed: {e}")
            exit(1)

    def get_utc_timestamp(self):
        return datetime.now(timezone.utc).isoformat() + 'Z'

    def update_redis(self, point):
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
            
            # Use the key that JavaScript expects
            self.redis_client.set("gps_data", json.dumps(tram_data))
            self.last_update_time = time.time()
            print(f"Updated position: Lat: {point['lat']}, Lon: {point['lon']}")

    def run(self, loop=True):
        print(f"Starting test tram tracker simulation for Tram {TRAM_ID}")
        
        while True:
            for point in GPS_ROUTE:
                self.update_redis(point)
                time.sleep(UPDATE_INTERVAL)
            
            if not loop:
                break
            
            print("Route completed, starting over...")

if __name__ == "__main__":
    tracker = TestTramTracker()
    try:
        # Set loop=True to continuously repeat the route, or False to run once
        tracker.run(loop=True)
    except KeyboardInterrupt:
        print("\nSimulation stopped by user")