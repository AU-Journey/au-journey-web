# DigitalOcean Docker Deployment Guide

## Prerequisites
- DigitalOcean account
- Docker installed locally for testing
- DigitalOcean App Platform or Droplet

## Option 1: DigitalOcean App Platform (Recommended)

### 1. Prepare your repository
```bash
# Build the app locally to test
npm run build
docker build -t au-journey-web .
docker run -p 3000:3000 au-journey-web
```

### 2. Deploy to App Platform
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Select your repository and branch
5. Configure the app:
   - **Type**: Web Service
   - **Dockerfile Path**: `Dockerfile`
   - **HTTP Port**: 3000
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=3000
     REDIS_HOST=your-redis-host
     REDIS_PORT=your-redis-port
     REDIS_PASSWORD=your-redis-password
     REDIS_DB=0
     ```

### 3. App Platform will automatically:
- Build your Docker image
- Deploy to their managed infrastructure
- Provide HTTPS
- Handle scaling
- Monitor health checks

## Option 2: DigitalOcean Droplet

### 1. Create a Droplet
- Choose Ubuntu 22.04 LTS
- At least 1GB RAM (recommended: 2GB)
- Enable Docker in marketplace apps or install manually

### 2. Deploy via SSH
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Clone your repository
git clone https://github.com/your-username/au-journey-web.git
cd au-journey-web

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
EOF

# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 3. Set up Nginx reverse proxy (optional but recommended)
```bash
# Install Nginx
apt update && apt install nginx

# Create Nginx config
cat > /etc/nginx/sites-available/au-journey << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/au-journey /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## Environment Variables

Set these environment variables for production:

```bash
NODE_ENV=production
PORT=3000
REDIS_HOST=your-redis-cloud-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
```

## Monitoring and Maintenance

### Health Check
Your app includes a health check endpoint at `/health`

### Logs
```bash
# Docker Compose logs
docker-compose logs -f

# Or specific container logs
docker logs au-journey-web_app_1 -f
```

### Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Cost Comparison

### App Platform
- ~$5-10/month for basic app
- Automatic scaling
- Managed infrastructure
- HTTPS included

### Droplet + Docker
- ~$6/month for 1GB droplet
- Manual scaling
- You manage infrastructure
- Need to set up SSL/HTTPS

## Benefits of This Setup

1. **No Edge Function Limits**: Your Express server handles all API requests
2. **Better Performance**: Persistent connections to Redis
3. **Cost Effective**: Predictable monthly costs
4. **Full Control**: Can optimize and monitor as needed
5. **WebSocket Support**: If you need real-time features later

## Migration Steps from Vercel

1. Test the Docker setup locally
2. Deploy to DigitalOcean
3. Update your frontend API calls (if needed)
4. Update DNS to point to new server
5. Monitor for 24-48 hours
6. Decommission Vercel deployment 