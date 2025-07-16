# Redis GPS Integration Setup Guide

This guide explains how to connect your tram visualization to Redis and make the tram move according to real GPS data.

## Overview

Your application now supports fetching GPS data from Redis in the format:
```json
{"c": {"lat": 13.612441, "lon": 100.836478, "t": "2025-07-15 07:39:12"}, "p": {"lat": 13.612412, "lon": 100.836585, "t": "2025-07-15 07:39:10"}, "s": "active"}
```

Where:
- `c` = Current GPS position
- `p` = Previous GPS position
- `s` = Status (active/inactive)
- `t` = Timestamp

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `express` - HTTP server
- `cors` - Cross-origin requests
- `ioredis` - Redis client
- `concurrently` - Run multiple commands

### 2. Test Redis Connection

First, test that you can connect to your Redis database:

```bash
npm run test-redis
```

This will:
- Connect to your Redis database
- Set sample GPS data in the correct format
- Verify the data was stored correctly
- Set some moving GPS data to test movement

### 3. Start the HTTP Proxy Server

Since browsers can't connect directly to Redis, we need a proxy server:

```bash
npm run redis-proxy
```

This starts an HTTP server on `http://localhost:3001` that acts as a bridge between your browser and Redis.

### 4. Start the Application

In a new terminal, start your main application:

```bash
npm run dev
```

Or run both the proxy and the main app together:

```bash
npm run start-with-proxy
```

## How It Works

### Architecture

```
Browser App → HTTP Proxy Server → Redis Database
     ↑              ↑                    ↑
   Vite Dev      Port 3001          Your Redis Cloud
```

### Data Flow

1. **Browser Application**: Fetches GPS data via HTTP requests to the proxy
2. **HTTP Proxy Server**: Connects to Redis and serves GPS data as JSON
3. **Redis Database**: Stores GPS data in the specified format
4. **Tram Movement**: Updates tram position based on current/previous GPS coordinates

### Key Components

1. **RedisGPSService** (`src/services/RedisGPSService.js`)
   - Handles fetching GPS data from Redis (via HTTP proxy in browser)
   - Falls back to simulation if Redis is unavailable
   - Parses your GPS data format

2. **TramMovement** (`src/components/TramMovement.js`)
   - Uses GPS data to calculate tram position and movement
   - Smoothly animates tram between GPS coordinates
   - Handles rotation based on movement direction

3. **HTTP Proxy Server** (`redis-proxy-server.js`)
   - Connects to your Redis database
   - Provides HTTP endpoints for browser access
   - Handles CORS and error cases

## API Endpoints

The proxy server provides these endpoints:

- `GET /health` - Check Redis connection status
- `GET /api/redis/gps_data` - Fetch current GPS data
- `POST /api/redis/gps_data` - Store GPS data (for testing)
- `POST /api/test/set-sample-gps` - Set sample test data
- `GET /api/redis/keys` - List all Redis keys (debugging)

## Testing GPS Movement

### Option 1: Using the Test Script

```bash
npm run test-redis
```

This will set moving GPS data that you can see in your application.

### Option 2: Using HTTP API

Set GPS data via the HTTP API:

```bash
curl -X POST http://localhost:3001/api/redis/gps_data \
  -H "Content-Type: application/json" \
  -d '{
    "c": {"lat": 13.612441, "lon": 100.836478, "t": "2025-01-15T10:30:00Z"},
    "p": {"lat": 13.612412, "lon": 100.836585, "t": "2025-01-15T10:29:55Z"},
    "s": "active"
  }'
```

### Option 3: Set Sample Data

```bash
curl -X POST http://localhost:3001/api/test/set-sample-gps
```

## Environment Variables

You can customize Redis connection with environment variables:

```bash
export REDIS_HOST=your-redis-host.com
export REDIS_PORT=6379
export REDIS_PASSWORD=your-password
export REDIS_DB=0
export REDIS_PROXY_URL=http://localhost:3001/api
```

## Troubleshooting

### Redis Connection Issues

1. **Check credentials**: Verify host, port, and password
2. **Test connection**: Run `npm run test-redis`
3. **Check firewall**: Ensure Redis port is accessible
4. **Check logs**: Look at console output for error messages

### Tram Not Moving

1. **Check GPS data**: Visit `http://localhost:3001/api/redis/gps_data`
2. **Check console**: Look for GPS update logs in browser console
3. **Check movement**: Ensure current and previous GPS coordinates are different
4. **Check timestamps**: GPS data shouldn't be stale (older than 30 seconds)

### Proxy Server Issues

1. **Port conflict**: Change port in `redis-proxy-server.js` if needed
2. **CORS errors**: Proxy should handle CORS automatically
3. **Network issues**: Ensure proxy can reach Redis

## Production Deployment

For production deployment:

1. **Environment Variables**: Set proper Redis credentials
2. **HTTPS**: Use HTTPS for production proxy server
3. **Security**: Restrict proxy access to authorized clients
4. **Monitoring**: Add logging and monitoring for GPS data flow
5. **Backup**: Consider Redis backup strategies

## GPS Data Format Details

Your GPS data should follow this exact format:

```json
{
  "c": {
    "lat": 13.612441,    // Current latitude (required)
    "lon": 100.836478,   // Current longitude (required) 
    "t": "2025-01-15T10:30:00Z"  // Timestamp (ISO format)
  },
  "p": {
    "lat": 13.612412,    // Previous latitude (required)
    "lon": 100.836585,   // Previous longitude (required)
    "t": "2025-01-15T10:29:55Z"  // Timestamp (ISO format)
  },
  "s": "active"          // Status: "active" or "inactive"
}
```

**Important Notes:**
- Coordinates must be valid GPS coordinates (lat: -90 to 90, lon: -180 to 180)
- Current and previous coordinates should be different for movement
- Timestamps should be recent (not older than 30 seconds by default)
- Status affects whether tram movement is active

## Real-time Updates

The system fetches GPS data every 500ms by default. To change this:

```javascript
// In your application initialization
const redisConfig = {
  // ... other config
};

const tramMovement = new TramMovement(tram, null, gpsPoints, new Vector3(0, 0, 0), redisConfig);
tramMovement.redisGPS.setFetchInterval(1000); // 1 second updates
```

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Redis connection with the test script
3. Ensure proxy server is running and accessible
4. Check that GPS data format matches exactly

Your tram should now move smoothly based on real GPS data from your Redis database! 🚊 