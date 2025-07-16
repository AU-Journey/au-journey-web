# Vercel Deployment Instructions

## Environment Variables to Add in Vercel

Go to: https://vercel.com/au-journeys-projects/au-journey-web/settings/environment-variables

Add these variables for **Production**, **Preview**, and **Development**:

```
REDIS_HOST=redis-15238.crce178.ap-east-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=15238
REDIS_PASSWORD=HOwS9Ta53CidWxys59VlS51v2yp88tY9
REDIS_DB=0
```

## Disable Authentication Protection

1. Go to: https://vercel.com/au-journeys-projects/au-journey-web/settings
2. Navigate to "Security" or "Protection" section
3. Disable "Vercel Authentication" to make your app publicly accessible

## Test URLs After Setup

- **Main App**: https://au-journey-4rr7ppgi1-au-journeys-projects.vercel.app
- **Health Check API**: https://au-journey-4rr7ppgi1-au-journeys-projects.vercel.app/api/health
- **GPS Data API**: https://au-journey-4rr7ppgi1-au-journeys-projects.vercel.app/api/redis/gps_data

## Python Script Update

Update your Python script to use the production API:

```python
# Change the Redis key and endpoint
api_url = "https://au-journey-4rr7ppgi1-au-journeys-projects.vercel.app/api/redis/gps_data"

# POST GPS data to Vercel API instead of direct Redis
import requests
response = requests.post(api_url, json=tram_data)
``` 