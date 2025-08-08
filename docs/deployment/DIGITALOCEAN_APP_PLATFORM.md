# DigitalOcean App Platform Deployment Guide

## 🏗️ **Architecture Overview**

### **Separate Deployment (Recommended)**
```
Raspberry Pi → Redis Cloud ← Backend (DO App Platform) ← Frontend (DO Static)
     ↓                           ↓                           ↓
   GPS Data              WebSocket Server              3D Tram Viewer
```

### **Benefits of Separation:**
- ✅ **Independent scaling** and pricing
- ✅ **Frontend CDN** for global performance  
- ✅ **API security** isolation
- ✅ **Easy maintenance** and updates
- ✅ **Cost optimization** ($3 frontend + $5 backend vs $12 combined)

---

## 📋 **Step 1: Prepare Backend for Deployment**

### **1.1 Environment Variables Setup**

Create production environment configuration:

```bash
# In your backend directory
touch .env.production
```

Add to `.env.production`:
```env
NODE_ENV=production
PORT=8080
REDIS_HOST=redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=15238
REDIS_PASSWORD=HOwS9Ta53CidWxys59VlS51v2yp88tY9
REDIS_DB=0
FRONTEND_URL=https://your-frontend-app.ondigitalocean.app
```

### **1.2 Update Backend Package.json**

Ensure your backend has the correct start scripts:

```json
{
  "name": "au-journey-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build needed for Node.js'"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "ioredis": "^5.6.1",
    "socket.io": "^4.7.5"
  }
}
```

### **1.3 Add App Platform Configuration**

Create `.do/app.yaml` in your project root:

```yaml
name: au-journey-backend
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/au-journey-web
    branch: main
    deploy_on_push: true
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "8080"
  - key: REDIS_HOST
    value: redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
  - key: REDIS_PORT
    value: "15238"
  - key: REDIS_PASSWORD
    value: HOwS9Ta53CidWxys59VlS51v2yp88tY9
    type: SECRET
  - key: REDIS_DB
    value: "0"
  health_check:
    http_path: /health
```

---

## 📋 **Step 2: Prepare Frontend for Deployment**

### **2.1 Update Frontend Configuration**

Update `frontend/src/services/WebSocketGPSService.js` to handle production URLs:

```javascript
getDefaultServerUrl() {
  // Detect environment and use appropriate server URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost') {
      return 'ws://localhost:3000';
    } else {
      // Production: Use your backend App Platform URL
      return 'wss://your-backend-app.ondigitalocean.app';
    }
  }
  return 'ws://localhost:3000';
}
```

### **2.2 Update Vite Config for Production**

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  return {
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
      sourcemap: true,
      emptyOutDir: true
    },
    publicDir: 'public',
    server: {
      port: 5173,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    },
    preview: {
      port: 4173,
    }
  }
})
```

### **2.3 Create Frontend App Platform Config**

Create `.do/frontend.yaml`:

```yaml
name: au-journey-frontend
static_sites:
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/au-journey-web
    branch: main
    deploy_on_push: true
  build_command: npm run build
  output_dir: dist
  index_document: index.html
  error_document: index.html
  environment_slug: node-js
```

---

## 🚀 **Step 3: Deploy to DigitalOcean**

### **3.1 Deploy Backend First**

1. **Login to DigitalOcean**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"

2. **Connect Repository**
   - Choose "GitHub" as source
   - Select your `au-journey-web` repository
   - Choose `main` branch

3. **Configure Backend Service**
   - **Service Type**: Web Service
   - **Source Directory**: `/backend`
   - **Build Phase**: Skip (not needed for Node.js)
   - **Run Command**: `npm start`
   - **HTTP Port**: 8080

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=8080
   REDIS_HOST=redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
   REDIS_PORT=15238
   REDIS_PASSWORD=HOwS9Ta53CidWxys59VlS51v2yp88tY9
   REDIS_DB=0
   ```

5. **Deploy**
   - Review settings
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-backend-app.ondigitalocean.app`

### **3.2 Deploy Frontend**

1. **Create New App for Frontend**
   - Go back to App Platform
   - Click "Create App"

2. **Configure Static Site**
   - **Source**: Same GitHub repository
   - **Service Type**: Static Site
   - **Source Directory**: `/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Update Frontend WebSocket URL**
   - Before deploying frontend, update the WebSocket URL in your code
   - Replace `your-backend-app` with your actual backend URL

4. **Deploy Frontend**
   - Click "Create Resources"
   - Note your frontend URL: `https://your-frontend-app.ondigitalocean.app`

---

## 🔧 **Step 4: Configure Production Settings**

### **4.1 Update Backend CORS**

Update `backend/server.js` CORS configuration:

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://your-frontend-app.ondigitalocean.app"
    ],
    methods: ["GET", "POST"]
  }
});
```

### **4.2 Update Frontend WebSocket URL**

Create `frontend/.env.production`:

```env
VITE_BACKEND_URL=https://your-backend-app.ondigitalocean.app
```

Update WebSocket service to use environment variable:

```javascript
getDefaultServerUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost') {
      return 'ws://localhost:3000';
    } else {
      // Use environment variable or fallback
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'wss://your-backend-app.ondigitalocean.app';
      return backendUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    }
  }
  return 'ws://localhost:3000';
}
```

---

## 🧪 **Step 5: Test Production Deployment**

### **5.1 Test Backend**

```bash
# Test health endpoint
curl https://your-backend-app.ondigitalocean.app/health

# Test WebSocket with wscat (install: npm install -g wscat)
wscat -c wss://your-backend-app.ondigitalocean.app
```

### **5.2 Test Frontend**

1. Visit `https://your-frontend-app.ondigitalocean.app`
2. Open browser dev tools
3. Check console for WebSocket connection
4. Verify tram model loads
5. Test with your Python GPS script

### **5.3 Test Full Pipeline**

```python
# Run your Python GPS script to send data to Redis
# Check that:
# 1. Backend logs show "GPS data changed in Redis"
# 2. Frontend receives WebSocket updates
# 3. Tram moves in real-time
```

---

## 💰 **Pricing Estimate**

### **Separate Deployment (Recommended)**
- **Backend**: $5/month (Basic plan)
- **Frontend**: $3/month (Static site)
- **Total**: ~$8/month

### **Combined Deployment**
- **Full App**: $12/month (Professional plan needed)

### **Existing Services**
- **Redis Cloud**: Your existing plan
- **Domain**: Optional (~$12/year)

---

## 🔄 **Continuous Deployment**

### **Auto-deploy on Git Push**
Both apps will automatically redeploy when you push to `main` branch:

```bash
git add .
git commit -m "Update for production"
git push origin main
# Apps will auto-deploy in 5-10 minutes
```

### **Manual Deploy**
In DigitalOcean dashboard:
1. Go to your app
2. Click "Deploy" tab
3. Click "Force Rebuild and Deploy"

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. WebSocket Connection Failed**
- Check CORS settings in backend
- Verify frontend is using correct WSS URL
- Check browser console for errors

**2. Build Failed**
- Check build logs in DigitalOcean
- Verify package.json scripts
- Check Node.js version compatibility

**3. Redis Connection Issues**
- Verify environment variables
- Check Redis Cloud firewall settings
- Test Redis connection from backend logs

**4. CORS Errors**
- Update backend CORS to include frontend URL
- Ensure HTTPS/WSS protocol consistency

### **Debug Commands**

```bash
# Check backend logs
# (View in DigitalOcean dashboard → Apps → Backend → Runtime Logs)

# Test WebSocket locally
wscat -c ws://localhost:3000

# Test WebSocket production
wscat -c wss://your-backend-app.ondigitalocean.app

# Check frontend build
cd frontend && npm run build
```

---

## ✅ **Final Checklist**

Before going live:

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly  
- [ ] WebSocket connection works in production
- [ ] Redis GPS monitoring active
- [ ] Python GPS script tested with production
- [ ] Tram moves in real-time
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Custom domain configured (optional)

---

## 🎯 **Production URLs**

After deployment:

- **Frontend**: `https://your-frontend-app.ondigitalocean.app`
- **Backend API**: `https://your-backend-app.ondigitalocean.app`
- **WebSocket**: `wss://your-backend-app.ondigitalocean.app`
- **Health Check**: `https://your-backend-app.ondigitalocean.app/health`

Your GPS tram tracker will now run in production with real-time updates from your Raspberry Pi! 🚊🌐
