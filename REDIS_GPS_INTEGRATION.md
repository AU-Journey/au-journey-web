# Redis GPS Integration for Tram Movement

This document explains how the tram movement system has been upgraded to use real-time GPS data from Redis instead of static test data.

## Overview

The tram movement system now fetches real-time GPS coordinates from Redis, where:
- `c` (current) - The current GPS position 
- `p` (previous) - The previous GPS position

This allows the tram to move based on actual GPS data rather than predetermined test routes.

## Architecture

### Components

1. **RedisGPSService** (`src/services/RedisGPSService.js`)
   - Handles Redis connection and GPS data fetching
   - Fetches `gps:current` and `gps:previous` keys from Redis
   - Provides connection resilience and fallback mechanisms

2. **TramMovement** (`src/components/TramMovement.js`)
   - Updated to use Redis GPS data instead of static GPS points
   - Calculates movement and rotation based on current and previous GPS coordinates
   - Falls back to static GPS points if Redis is unavailable

3. **SchoolMap** (`src/components/SchoolMap.js`)
   - Integrates Redis-based tram movement into the 3D scene
   - Handles initialization and cleanup of Redis connections

## Redis Data Format

The system expects GPS data in Redis with the following format:

### Key
- `gps_data` - Combined GPS data object

### Data Format
```json
{
  "c": {"lat": 13.612441, "lon": 100.836478, "t": "2025-07-15 07:39:12"},
  "p": {"lat": 13.612412, "lon": 100.836585, "t": "2025-07-15 07:39:10"},
  "s": "active"
}
```

Where:
- `c` = Current GPS position
- `p` = Previous GPS position  
- `s` = Status (active/inactive)
- `t` = Timestamp in ISO format

## Configuration

### Environment Variables

You can configure Redis connection using environment variables:

```bash
REDIS_HOST=localhost        # Redis server host
REDIS_PORT=6379            # Redis server port  
REDIS_PASSWORD=password    # Redis password (optional)
REDIS_DB=0                 # Redis database number
```

### Default Configuration

If no environment variables are set, the system uses your Redis Cloud instance:
- Host: `redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com`
- Port: `15238` 
- Password: `HOwS9Ta53CidWxys59VlS51v2yp88tY9`
- Database: `0`

## Features

### Real-time Movement
- Fetches GPS data every 1 second by default
- Smoothly animates tram between GPS positions
- Calculates rotation based on movement direction

### Connection Resilience
- Automatic reconnection on connection failure
- Exponential backoff retry strategy
- Graceful fallback to cached data

### Fallback System
- Falls back to static GPS points if Redis is unavailable
- Maintains last known position as backup
- Visual indicators show real-time vs fallback mode

### Visual Indicators
- **Cyan target indicator**: Real-time mode active
- **Yellow target indicator**: Fallback mode active
- Console logs provide detailed status information

## Setup Instructions

### 1. Install Dependencies
The required Redis client (`ioredis`) is already installed.

### 2. Configure Redis Server
Ensure your Redis Cloud instance contains GPS data in the expected format:

```bash
# Connect to your Redis Cloud instance
redis-cli -h redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com -p 15238 -a HOwS9Ta53CidWxys59VlS51v2yp88tY9

# Set GPS data in the new format
SET gps_data '{"c": {"lat": 13.612441, "lon": 100.836478, "t": "2025-07-15 07:39:12"}, "p": {"lat": 13.612412, "lon": 100.836585, "t": "2025-07-15 07:39:10"}, "s": "active"}'
```

### 3. Start Application
The tram movement will automatically connect to Redis and begin using real-time data.

## Monitoring

### Console Logs
The system provides detailed logging:
- `🔗 Redis GPS Service: Connected to Redis`
- `📍 Tram moving to new GPS position`
- `⏹️ GPS coordinates unchanged - keeping tram stationary`
- `⏰ GPS data is stale - keeping tram stationary`
- `🛑 Tram movement stopped - stationary`
- `🔄 Tram rotation updated`

### Status Information
You can check the Redis connection status:
```javascript
const status = tramMovement.getRedisStatus();
console.log(status);
// Output: { isConnected: true, retryCount: 0, hasCurrentGPS: true, ... }
```

## Development Notes

### Movement Behavior
The tram movement system includes intelligent behavior:

1. **Movement Detection**: Tram only moves when GPS coordinates actually change
2. **Stale Data Handling**: Stops movement if GPS data is older than 30 seconds
3. **Stability**: Tram remains stationary when GPS coordinates are identical
4. **Automatic Movement**: Tram moves smoothly when new GPS data indicates position change

### Environment Support

The system now supports both Node.js and browser environments:

#### **Node.js Environment (Direct Redis)**
- Connects directly to Redis using `ioredis` library
- Fastest performance and lowest latency
- Best for server-side applications

#### **Browser Environment (HTTP Proxy)**
- Uses HTTP API to communicate with Redis through a proxy server
- Requires running the Redis proxy server (`redis-proxy-example.js`)
- Enables browser-based applications to access Redis data

### Setting Up Browser Support

1. **Install proxy dependencies**:
   ```bash
   npm install express cors ioredis
   ```

2. **Run the Redis proxy server**:
   ```bash
   node redis-proxy-example.js
   ```

3. **Access GPS data via HTTP API**:
   - GET `http://localhost:3001/api/gps` - Fetch GPS data
   - GET `http://localhost:3001/api/health` - Check proxy status

## Troubleshooting

### Connection Issues
- Check Redis server is running and accessible
- Verify network connectivity to Redis host
- Check Redis authentication credentials
- Review console logs for detailed error messages

### No GPS Data
- Verify GPS data exists in Redis using:
  ```bash
  redis-cli -h redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com -p 15238 -a HOwS9Ta53CidWxys59VlS51v2yp88tY9 GET gps_data
  ```
- Check data format matches expected JSON structure
- Ensure GPS coordinates are valid (lat: -90 to 90, lon: -180 to 180)
- Verify the status field "s" is set to "active"

### Performance Issues
- Adjust fetch interval: `redisGPS.setFetchInterval(2000)` for 2-second intervals
- Monitor Redis server performance
- Check network latency to Redis server

## Future Enhancements

Potential improvements for the Redis GPS integration:
- WebSocket integration for real-time updates
- GPS data validation and smoothing
- Speed calculation based on GPS movement
- Historical GPS data tracking
- Multiple tram support with different Redis keys 