# AU Journey Web - Docker Deployment

A Three.js-based interactive 3D school map with tram tracking functionality, containerized with Docker.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Redis Cloud account (or local Redis instance)

### 1. Environment Setup
```bash
# Copy environment template
cp docker.env.example .env

# Edit .env with your Redis credentials
nano .env
```

### 2. Build and Run
```bash
# Build and start the application
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access Application
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **GPS API**: http://localhost:3000/api/redis/gps_data

## 🐳 Docker Commands

```bash
# Build image only
npm run docker:build

# Run container directly
npm run docker:run

# Development mode with auto-rebuild
npm run docker:dev

# Production mode (background)
npm run docker:prod

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `REDIS_HOST` | Redis server host | `your-redis-host.com` |
| `REDIS_PORT` | Redis server port | `15238` |
| `REDIS_PASSWORD` | Redis password | `your-password` |
| `REDIS_DB` | Redis database number | `0` |

### Health Monitoring
The application includes built-in health checks:
- Docker health check every 30 seconds
- Redis connection monitoring
- Graceful shutdown handling

## 📱 API Endpoints

- `GET /health` - Health check with Redis status
- `GET /api/redis/gps_data` - Fetch GPS data from Redis
- `POST /api/redis/gps_data` - Store GPS data in Redis
- `POST /api/test/set-sample-gps` - Set sample GPS data for testing

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use environment-specific Redis credentials
- Enable Redis AUTH and SSL in production
- Consider using Docker secrets for sensitive data

## 📊 Monitoring

```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f app

# Check resource usage
docker stats
```

## 🚨 Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env or stop conflicting services
2. **Redis connection failed**: Verify credentials and network connectivity
3. **Build failures**: Clear Docker cache with `docker system prune`
4. **Health check failing**: Check application logs and Redis connectivity

### Debug Mode
```bash
# Run with debug output
docker-compose up --build --verbose

# Shell into running container
docker-compose exec app sh
``` 