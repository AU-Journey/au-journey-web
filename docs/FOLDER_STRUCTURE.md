# 📁 Recommended Folder Structure

## 🎯 Option 1: Current Node.js Backend (Recommended)

```
au-journey-web/
├── 📂 frontend/                    # Three.js frontend
│   ├── 📂 public/
│   │   ├── 📂 models/
│   │   │   ├── background.glb
│   │   │   ├── school_map.glb
│   │   │   ├── Tram.fbx
│   │   │   └── tram.glb
│   │   └── favicon.ico
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── GPSpoints.js
│   │   │   ├── LoadingUI.js
│   │   │   ├── SchoolMap.js
│   │   │   ├── TramMovement.js
│   │   │   ├── TramStatusDisplay.js
│   │   │   ├── TramTracker.js
│   │   │   ├── WeatherDisplay.js
│   │   │   └── WeatherSystem.js
│   │   ├── 📂 config/
│   │   │   └── gpsRoute.js
│   │   ├── 📂 services/
│   │   │   └── RedisGPSService.js
│   │   ├── 📂 utils/
│   │   │   └── renderingOptimizations.js
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.js
│   └── .env.frontend              # Frontend env vars
│
├── 📂 backend/                     # Node.js/Express API
│   ├── 📂 src/
│   │   ├── 📂 routes/
│   │   │   ├── health.js
│   │   │   ├── gps.js
│   │   │   └── index.js
│   │   ├── 📂 services/
│   │   │   ├── redisService.js
│   │   │   └── gpsService.js
│   │   ├── 📂 middleware/
│   │   │   ├── cors.js
│   │   │   ├── error.js
│   │   │   └── validation.js
│   │   ├── 📂 config/
│   │   │   ├── database.js
│   │   │   └── redis.js
│   │   └── app.js
│   ├── server.js                  # Entry point
│   ├── package.json               # Backend dependencies
│   ├── healthcheck.js
│   └── .env.backend               # Backend env vars
│
├── 📂 docker/                      # Docker configuration
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
│
├── 📂 scripts/                     # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── test.sh
│
├── 📂 tests/                       # Testing files
│   ├── 📂 backend/
│   │   └── api.test.js
│   ├── 📂 frontend/
│   │   └── components.test.js
│   └── 📂 integration/
│       └── e2e.test.js
│
├── 📂 docs/                        # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
├── .gitignore
├── .dockerignore
├── README.md
└── docker-compose.yml              # Main compose file
```

## 🐍 Option 2: Future Python Backend + Node.js Frontend

```
au-journey-web/
├── 📂 frontend/                    # Three.js frontend (same as above)
│   ├── 📂 public/
│   ├── 📂 src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.frontend
│
├── 📂 backend/                     # Python FastAPI/Flask
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   ├── 📂 v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── gps.py
│   │   │   │   └── health.py
│   │   │   └── __init__.py
│   │   ├── 📂 core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── 📂 services/
│   │   │   ├── __init__.py
│   │   │   ├── redis_service.py
│   │   │   └── gps_service.py
│   │   ├── 📂 models/
│   │   │   ├── __init__.py
│   │   │   └── gps.py
│   │   ├── 📂 utils/
│   │   │   ├── __init__.py
│   │   │   └── helpers.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── requirements.txt
│   ├── Pipfile (or pyproject.toml)
│   ├── .env.backend
│   └── healthcheck.py
│
├── 📂 docker/                      # Docker configuration
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.prod.yml
│
├── 📂 scripts/                     # Cross-platform scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── test.sh
│
├── 📂 tests/                       # Testing files
│   ├── 📂 backend/
│   │   ├── test_api.py
│   │   └── test_services.py
│   ├── 📂 frontend/
│   │   └── components.test.js
│   └── 📂 integration/
│       └── test_e2e.py
│
├── .gitignore
├── .dockerignore
├── README.md
└── docker-compose.yml
```

## 🔄 Migration Steps (Current → Recommended)

### Step 1: Reorganize Current Structure
```bash
# Create new directory structure
mkdir -p frontend/src frontend/public
mkdir -p backend/src/routes backend/src/services backend/src/middleware backend/src/config
mkdir -p docker scripts tests docs

# Move frontend files
mv src/* frontend/src/
mv public/* frontend/public/
mv index.html frontend/
mv vite.config.js frontend/
mv package.json frontend/

# Move backend files
mv server.js backend/
mv healthcheck.js backend/

# Move Docker files
mv Dockerfile docker/Dockerfile.backend
mv docker-compose.yml docker/
```

### Step 2: Create Separate Package.json Files

**Frontend package.json:**
```json
{
  "name": "au-journey-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^6.3.5"
  },
  "dependencies": {
    "gsap": "^3.13.0",
    "three": "^0.177.0"
  }
}
```

**Backend package.json:**
```json
{
  "name": "au-journey-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "ioredis": "^5.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Step 3: Update Docker Configuration

**docker/docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3001

  backend:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "3001:3001"
    env_file:
      - ../.env
    environment:
      - NODE_ENV=production
      - PORT=3001
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

## 📋 Benefits of This Structure

### ✅ Separation of Concerns
- **Frontend**: Pure Three.js application
- **Backend**: Dedicated API service
- **Docker**: Centralized container configuration

### ✅ Independent Development
- Teams can work on frontend/backend separately
- Different deployment strategies
- Technology-specific tooling

### ✅ Scalability
- Scale frontend and backend independently
- Add microservices easily
- Technology migration flexibility

### ✅ Maintenance
- Clear boundaries between components
- Easier testing and debugging
- Better dependency management

## 🚀 Deployment Strategies

### Development
```bash
# Start all services
docker-compose -f docker/docker-compose.dev.yml up

# Frontend only
cd frontend && npm run dev

# Backend only
cd backend && npm run dev
```

### Production
```bash
# Build and deploy
docker-compose -f docker/docker-compose.prod.yml up -d

# With load balancer
docker-compose -f docker/docker-compose.prod.yml up -d --scale backend=3
```

### CI/CD Integration
```yaml
# .github/workflows/deploy.yml
- name: Build Frontend
  run: cd frontend && npm run build

- name: Build Backend
  run: cd backend && npm install

- name: Docker Build
  run: docker-compose -f docker/docker-compose.prod.yml build
``` 