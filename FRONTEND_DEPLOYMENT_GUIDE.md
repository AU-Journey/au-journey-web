# Frontend Deployment Guide for DigitalOcean

## 🚀 Quick Start

Your backend is already deployed at: **https://au-journey-web-backend-gk6n3.ondigitalocean.app/**

Now let's deploy the frontend as a static site on DigitalOcean App Platform.

## 📋 Deployment Steps

### 1. Commit and Push Changes

First, commit the changes we made:

```bash
git add .
git commit -m "Configure frontend for DigitalOcean deployment"
git push origin main
```

### 2. Deploy Frontend to DigitalOcean

#### Option A: Using DigitalOcean Dashboard (Recommended)

1. **Go to DigitalOcean App Platform**
   - Visit: https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Connect Repository**
   - Choose "GitHub" as source
   - Select your repository (likely `codysecret1/au-journey-web`)
   - Choose `main` branch

3. **Configure Static Site**
   - **Service Type**: Static Site
   - **Source Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **HTTP Routes**: `/` (default)

4. **Set Environment Variables**
   ```
   VITE_BACKEND_URL=https://au-journey-web-backend-gk6n3.ondigitalocean.app
   ```

5. **Configure Build Settings**
   - **Node.js Version**: 18.x or later
   - **Build Phase**: Will automatically run `npm install` then `npm run build`

6. **Deploy**
   - Review settings
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)

#### Option B: Using App Spec YAML

If you prefer using the YAML configuration:

1. Go to DigitalOcean App Platform
2. Click "Create App"
3. Choose "Edit your App Spec"
4. Copy and paste the contents of `.do/frontend.yaml`
5. Update the GitHub repo path to match your username
6. Deploy

### 3. Update Repository Reference

Before deploying, update the GitHub repository reference in `.do/frontend.yaml`:

```yaml
  github:
    repo: your-username/au-journey-web  # Replace with your actual GitHub username
```

## 🔧 Configuration Files Created

- **`.do/frontend.yaml`**: DigitalOcean App Platform configuration
- **Vite config updated**: Optimized for static site deployment
- **WebSocket service updated**: Uses your backend URL
- **Environment variables**: Set for production

## 📱 Expected Result

After deployment, you'll get:

- **Frontend URL**: `https://your-frontend-app.ondigitalocean.app`
- **Auto-deployment**: Pushes to `main` branch will auto-deploy
- **Cost**: ~$3/month for static site

## 🧪 Testing

After deployment:

1. **Visit your frontend URL**
2. **Check browser console** - should see:
   ```
   🔌 WebSocket GPS Service: Initializing...
   🌐 Server URL: wss://au-journey-web-backend-gk6n3.ondigitalocean.app
   ✅ WebSocket connected: [socket-id]
   ```

3. **Test GPS data flow**:
   - Your Python script should send GPS data to Redis
   - Backend should broadcast to WebSocket clients
   - Frontend should receive updates and move the tram

## 🔄 Auto-Deployment

Both frontend and backend will auto-deploy when you push to `main`:

```bash
git add .
git commit -m "Your changes"
git push origin main
# Both apps will redeploy automatically
```

## 🚨 Troubleshooting

### WebSocket Connection Issues
- Check browser console for connection errors
- Verify backend URL is correct
- Ensure backend is running and healthy

### Build Failures
- Check build logs in DigitalOcean dashboard
- Verify Node.js version compatibility
- Check that all dependencies are in package.json

### CORS Errors
- Backend is already configured for *.ondigitalocean.app domains
- If issues persist, check browser network tab

## 🎯 Final Architecture

```
Raspberry Pi → Redis Cloud ← Backend (WebSocket) ← Frontend (Static)
     ↓                           ↓                      ↓
   GPS Data               Real-time Server         3D Tram Viewer
```

- **Raspberry Pi**: Sends GPS to Redis
- **Redis**: Stores current GPS data
- **Backend**: Monitors Redis, broadcasts via WebSocket
- **Frontend**: Receives real-time updates, moves tram

## 💰 Cost Breakdown

- **Backend**: $5/month (Basic plan)
- **Frontend**: $3/month (Static site)
- **Redis**: Your existing plan
- **Total**: ~$8/month

## ✅ Deployment Checklist

- [ ] Frontend build works locally
- [ ] WebSocket URL points to backend
- [ ] Environment variables configured
- [ ] Repository connected to DigitalOcean
- [ ] Frontend deployed and accessible
- [ ] WebSocket connection works
- [ ] GPS data updates in real-time
- [ ] No console errors

Your GPS tram tracker is now ready for production! 🚊🌐
