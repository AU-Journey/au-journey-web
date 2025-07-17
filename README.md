# School Map Viewer

A Three.js-based interactive 3D school map with tram tracking functionality.

## Deployment

This project is configured to deploy to multiple platforms with different base path requirements:

### Vercel Deployment
```bash
npm run build:vercel
```
- Uses root path (`/`) for assets
- Automatically triggered when deploying to Vercel

### GitHub Pages Deployment  
```bash
npm run build:github
```
- Uses repository path (`/au-journey-web/`) for assets
- Required for GitHub Pages deployment

### Local Development
```bash
npm run dev
```
- Uses repository path for consistency with GitHub Pages

### Production Preview
```bash
npm run preview
```
- Serves the built application locally

## Features

- Interactive 3D school map
- Real-time tram tracking
- GPS position updates
- Redis integration for live data
- Weather system integration

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. For Redis integration:
```bash
npm run start-with-proxy
```

## Architecture

- **Frontend**: Vite + Three.js
- **3D Models**: GLB/FBX format
- **Real-time Data**: Redis + WebSockets
- **Deployment**: Vercel (production) + GitHub Pages (demo)

## Troubleshooting

- **404 errors on Vercel**: Ensure you're using `npm run build:vercel` for deployment
- **White screen**: Check browser console for asset loading errors
- **Model loading issues**: Verify model files are in the `public/models/` directory 