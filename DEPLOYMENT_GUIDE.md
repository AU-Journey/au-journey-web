# Production Deployment Guide

This guide explains how to deploy your Redis GPS tram tracker to production so it automatically fetches GPS data from Redis.

## 🌐 Architecture Overview

### Local Development
```
Browser → Local Proxy (localhost:3001) → Redis
```

### Production
```
Browser → Vercel API → Redis
GitHub Pages ← Build ← GitHub Actions
```

## 🚀 Deployment Options

### Option 1: GitHub Pages + Vercel (Recommended)

**Frontend**: GitHub Pages (free static hosting)
**Backend API**: Vercel (free serverless functions)
**Database**: Your existing Redis Cloud

### Option 2: Full Vercel Deployment

Deploy both frontend and API to Vercel.

### Option 3: Other Cloud Platforms

Use Netlify, Railway, or any platform that supports Node.js.

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Make sure everything is committed
git add .
git commit -m "Add Redis GPS integration with production deployment"
git push origin main
```

### 2. Deploy API to Vercel

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com)
2. **Connect GitHub**: Link your GitHub account
3. **Import Project**: Import your repository
4. **Configure Environment Variables**:
   - `REDIS_HOST`: `redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com`
   - `REDIS_PORT`: `15238`
   - `REDIS_PASSWORD`: `HOwS9Ta53CidWxys59VlS51v2yp88tY9`
   - `REDIS_DB`: `0`

5. **Deploy**: Vercel will automatically build and deploy

### 3. Configure GitHub Pages

1. **Go to Repository Settings**
2. **Pages Section**
3. **Source**: GitHub Actions
4. **The workflow will automatically deploy on push to main**

### 4. Update API URL

After Vercel deployment, update the API URL:

1. **Get your Vercel URL**: `https://your-app-name.vercel.app`
2. **Update environment**: The app will automatically detect production URLs

### 5. Test Production Deployment

**Check API health**:
```bash
curl https://your-app-name.vercel.app/api/health
```

**Test GPS data**:
```bash
curl https://your-app-name.vercel.app/api/redis/gps_data
```

**Set test data**:
```bash
curl -X POST https://your-app-name.vercel.app/api/redis/gps_data \
  -H "Content-Type: application/json" \
  -d '{
    "c": {"lat": 13.612441, "lon": 100.836478, "t": "2025-01-15T10:30:00Z"},
    "p": {"lat": 13.612412, "lon": 100.836585, "t": "2025-01-15T10:29:55Z"},
    "s": "active"
  }'
```

## 🔧 Configuration Files Created

### `vercel.json`
Configures Vercel to handle API routes as serverless functions.

### `api/redis/gps_data.js`
Serverless function that handles GPS data fetching/storing.

### `api/health.js`
Health check endpoint for monitoring.

### `.github/workflows/deploy.yml`
Automated deployment workflow.

## 🌍 Environment Variables

### For Vercel (API)
Set these in Vercel Dashboard → Settings → Environment Variables:

```
REDIS_HOST=redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=15238
REDIS_PASSWORD=HOwS9Ta53CidWxys59VlS51v2yp88tY9
REDIS_DB=0
```

### For GitHub Actions (Optional)
Set these in GitHub → Settings → Secrets and Variables → Actions:

```
VERCEL_TOKEN=your-vercel-token
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
REDIS_DB=your-redis-db
```

## 🔄 How It Works in Production

### 1. Automatic URL Detection
```javascript
// RedisGPSService automatically detects environment
getDefaultProxyUrl() {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';  // Local development
  }
  return `${window.location.origin}/api`; // Production
}
```

### 2. CORS Handling
All API endpoints include proper CORS headers for browser access.

### 3. Error Handling
- **API Unavailable**: Falls back to simulation mode
- **Redis Down**: Returns cached data or error messages
- **Network Issues**: Graceful degradation

### 4. Performance
- **Serverless**: Only runs when needed
- **Cached**: GPS data cached for efficiency
- **Fast**: Direct Redis access from API

## 📱 Production URLs

After deployment, your app will be available at:

- **Frontend**: `https://yourusername.github.io/au-journey-web`
- **API**: `https://your-app-name.vercel.app/api`
- **Health Check**: `https://your-app-name.vercel.app/api/health`
- **GPS Data**: `https://your-app-name.vercel.app/api/redis/gps_data`

## 🧪 Testing Production

### 1. Check Frontend
Visit your GitHub Pages URL and verify:
- ✅ Tram model loads
- ✅ Console shows Redis GPS service starting
- ✅ No CORS errors
- ✅ Tram moves when GPS data changes

### 2. Check API
```bash
# Test health
curl https://your-app.vercel.app/api/health

# Get GPS data
curl https://your-app.vercel.app/api/redis/gps_data

# Set GPS data
curl -X POST https://your-app.vercel.app/api/redis/gps_data \
  -H "Content-Type: application/json" \
  -d '{"c":{"lat":13.612441,"lon":100.836478,"t":"2025-01-15T10:30:00Z"},"p":{"lat":13.612412,"lon":100.836585,"t":"2025-01-15T10:29:55Z"},"s":"active"}'
```

### 3. Monitor Logs
- **Vercel**: Functions → View logs
- **GitHub**: Actions → Deployment logs
- **Browser**: Developer console

## 🔒 Security Considerations

### 1. Environment Variables
- ✅ Redis credentials stored securely in Vercel
- ✅ Not exposed in frontend code
- ✅ Separate development/production configs

### 2. API Access
- ✅ CORS properly configured
- ✅ Rate limiting (Vercel default)
- ✅ HTTPS only in production

### 3. Redis Security
- ✅ Password protected
- ✅ SSL/TLS connection
- ✅ Firewall rules (if needed)

## 🚨 Troubleshooting

### Common Issues

**1. API Not Found (404)**
- Check Vercel deployment status
- Verify `api/` folder structure
- Check function logs in Vercel

**2. CORS Errors**
- Verify CORS headers in API functions
- Check browser network tab
- Ensure HTTPS in production

**3. Redis Connection Fails**
- Check environment variables in Vercel
- Test Redis connectivity
- Verify firewall/network settings

**4. Tram Not Moving**
- Check GPS data format
- Verify API returns valid data
- Check browser console for errors

### Debug Commands

```bash
# Test local API
curl http://localhost:3001/api/health

# Test production API
curl https://your-app.vercel.app/api/health

# Check GPS data format
curl https://your-app.vercel.app/api/redis/gps_data | jq

# Set test data
curl -X POST https://your-app.vercel.app/api/redis/gps_data \
  -H "Content-Type: application/json" \
  -d '{"c":{"lat":13.612441,"lon":100.836478,"t":"2025-01-15T10:30:00Z"},"p":{"lat":13.612412,"lon":100.836585,"t":"2025-01-15T10:29:55Z"},"s":"active"}'
```

## ✅ Final Checklist

Before going live:

- [ ] Redis credentials set in Vercel
- [ ] API health check passes
- [ ] GPS data endpoint works
- [ ] Frontend builds successfully
- [ ] GitHub Pages deployment works
- [ ] Tram moves in production
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

## 🎯 Next Steps

1. **Deploy to staging first** for testing
2. **Set up monitoring** for API endpoints
3. **Configure custom domain** (optional)
4. **Set up automated testing** for deployments
5. **Add analytics** to track usage
6. **Implement caching** for better performance

Your GPS tram tracker will now automatically fetch real-time data from Redis in production! 🚊🌐 