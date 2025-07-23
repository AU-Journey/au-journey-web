# AU Journey Web 🚋

A Three.js-based interactive 3D school map with real-time tram tracking functionality, featuring a self-hosted Redis database and containerized deployment.

## 🏗️ Architecture

- **Frontend**: Three.js + Vite (Port 3000)
- **Backend**: Node.js + Express (Port 3001) 
- **Database**: Redis 7 (Port 6379)
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd au-journey-web
```

### 2. Environment Configuration
```bash
# Copy environment template
cp docker.env.example .env

# The default .env is configured for local Redis
# No additional changes needed for development
```

### 3. Start Development Environment
```bash
# Start all services (frontend, backend, Redis)
npm run docker:dev

# Or start production environment
npm run docker:prod
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001  
- **Health Check**: http://localhost:3001/health
- **Redis**: localhost:6379 (internal Docker network)

## 🐳 Docker Commands

```bash
# Development mode with hot reload
npm run docker:dev

# Production mode (optimized builds)
npm run docker:prod

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Redis backup
npm run redis:backup

# Redis restore (uses latest backup)
npm run redis:restore
```

## 🔧 Project Structure

```
au-journey-web/
├── frontend/           # Three.js frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets (3D models)
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js Express API
│   ├── src/          # Source code  
│   ├── server.js     # Entry point
│   └── package.json  # Backend dependencies
├── docker/           # Docker configuration
│   ├── docker-compose.yml       # Production
│   ├── docker-compose.dev.yml   # Development
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── redis.conf    # Redis configuration
│   └── nginx.conf    # Nginx proxy config
├── scripts/          # Build and deployment scripts
├── docs/            # Documentation
└── .env             # Environment variables
```

## 📊 Redis Configuration

### Why Self-Hosted Redis?
- **No Storage Limits**: Unlike Redis Cloud's 30MB free tier
- **Full Control**: Custom configuration and optimization
- **Data Persistence**: Automatic backups and recovery
- **Cost Effective**: No monthly fees
- **Development Friendly**: Easy local testing

### Data Persistence
- **RDB Snapshots**: Automatic saves every 15min/5min/1min
- **AOF (Append Only File)**: Real-time write logging
- **Docker Volumes**: Persistent storage across container restarts
- **Backup Scripts**: Manual backup/restore capabilities

### Memory Configuration
- **Memory Limit**: 256MB (adjustable in `redis.conf`)
- **Eviction Policy**: `allkeys-lru` (removes least recently used)
- **Optimized for GPS Data**: Custom hash/list configurations

## 🔄 Data Backup & Recovery

### Automatic Backups
Redis automatically creates snapshots based on:
- 1 key change in 15 minutes
- 10 key changes in 5 minutes  
- 10,000 key changes in 1 minute

### Manual Backup
```bash
# Create timestamped backup
npm run redis:backup

# Backups stored in ./backups/redis/
# Automatically keeps last 10 backups
```

### Restore Data
```bash
# Restore from latest backup
npm run redis:restore

# Restore from specific backup
./scripts/redis-restore.sh redis_backup_20241220_143000.rdb
```

## 🌐 API Endpoints

- `GET /health` - Health check with Redis connectivity
- `GET /api/redis/gps_data` - Fetch GPS tracking data
- `POST /api/redis/gps_data` - Store GPS tracking data
- `POST /api/test/set-sample-gps` - Set sample data for testing

## 🔒 Security & Production

### Environment Variables
- Keep `.env` files secure and never commit with real credentials
- Use Docker secrets for sensitive production data
- Redis is configured with authentication disabled for local development

### Production Deployment
- Enable Redis AUTH in production
- Use SSL/TLS for Redis connections
- Configure proper firewall rules
- Set up monitoring and alerting

## 🧪 Development

### Local Development (without Docker)
```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Start backend
cd backend && npm install && npm run dev

# Start frontend  
cd frontend && npm install && npm run dev
```

### Adding New Features
1. Backend changes go in `backend/src/`
2. Frontend changes go in `frontend/src/`
3. Update API documentation
4. Test with both development and production Docker environments

## 🚨 Troubleshooting

### Common Issues

**Redis Connection Failed**
```bash
# Check Redis container status
docker-compose -f docker/docker-compose.yml ps redis

# View Redis logs
docker-compose -f docker/docker-compose.yml logs redis

# Restart Redis service
docker-compose -f docker/docker-compose.yml restart redis
```

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000  # or :3001, :6379

# Stop conflicting services or change ports in .env
```

**Build Failures**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
npm run docker:down
npm run docker:prod
```

### Debug Mode
```bash
# Run with verbose output
docker-compose -f docker/docker-compose.dev.yml up --build --verbose

# Shell into containers
docker-compose -f docker/docker-compose.yml exec backend sh
docker-compose -f docker/docker-compose.yml exec redis redis-cli
```

## 📈 Monitoring

### Redis Monitoring
```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# Check memory usage
INFO memory

# Monitor commands in real-time
MONITOR

# Check database size
DBSIZE
```

### Application Monitoring
- Health check endpoint: `/health`
- Docker container stats: `docker stats`
- Logs: `npm run docker:logs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker development environment
5. Submit a pull request

---

## 📝 Migration Notes

This project was recently restructured to use:
- ✅ Self-hosted Redis instead of Redis Cloud
- ✅ Separate frontend/backend containers
- ✅ Optimized Docker configuration
- ✅ Automated backup/restore system
- ✅ Clean project structure 