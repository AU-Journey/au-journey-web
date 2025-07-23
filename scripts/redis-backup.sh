#!/bin/bash

# Redis Backup Script for AU Journey Web
# Creates a backup of Redis data with timestamp

BACKUP_DIR="./backups/redis"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="redis_backup_${TIMESTAMP}.rdb"

echo "🔄 Starting Redis backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if Redis container is running
if ! docker-compose -f docker/docker-compose.yml ps redis | grep -q "Up"; then
    echo "❌ Redis container is not running. Starting it..."
    docker-compose -f docker/docker-compose.yml up -d redis
    sleep 5
fi

# Create Redis backup
echo "📦 Creating Redis backup: $BACKUP_FILE"
docker-compose -f docker/docker-compose.yml exec redis redis-cli --rdb /data/backup.rdb BGSAVE

# Wait for background save to complete
echo "⏳ Waiting for background save to complete..."
while [ "$(docker-compose -f docker/docker-compose.yml exec redis redis-cli lastsave)" = "$(docker-compose -f docker/docker-compose.yml exec redis redis-cli lastsave)" ]; do
    sleep 1
done

# Copy backup from container
docker cp $(docker-compose -f docker/docker-compose.yml ps -q redis):/data/dump.rdb "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t redis_backup_*.rdb | tail -n +11 | xargs -r rm
    echo "🧹 Cleaned up old backups (keeping last 10)"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "🎉 Redis backup completed!" 