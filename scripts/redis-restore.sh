#!/bin/bash

# Redis Restore Script for AU Journey Web
# Restores Redis data from a backup file

BACKUP_DIR="./backups/redis"

echo "🔄 Starting Redis restore..."

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "📋 Available backups:"
ls -la "$BACKUP_DIR"/redis_backup_*.rdb 2>/dev/null || {
    echo "❌ No backup files found in $BACKUP_DIR"
    exit 1
}

# Get the latest backup if no specific file provided
if [ -z "$1" ]; then
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/redis_backup_*.rdb | head -n 1)
    echo "🔍 Using latest backup: $(basename $BACKUP_FILE)"
else
    BACKUP_FILE="$BACKUP_DIR/$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

# Stop Redis container
echo "🛑 Stopping Redis container..."
docker-compose -f docker/docker-compose.yml stop redis

# Copy backup to Redis data volume
echo "📥 Restoring backup: $(basename $BACKUP_FILE)"
docker-compose -f docker/docker-compose.yml run --rm -v "$(pwd)/$BACKUP_FILE:/backup.rdb" redis cp /backup.rdb /data/dump.rdb

# Start Redis container
echo "🚀 Starting Redis container..."
docker-compose -f docker/docker-compose.yml up -d redis

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 5

# Verify restore
KEYS_COUNT=$(docker-compose -f docker/docker-compose.yml exec redis redis-cli dbsize | tr -d '\r')
echo "✅ Redis restored successfully! Keys in database: $KEYS_COUNT"

echo "🎉 Redis restore completed!" 