#!/bin/bash

# CryptonBets Database Backup Script

BACKUP_DIR="/var/backups/cryptonbets"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="cryptonbets_production"
DB_USER="cryptonbets_user"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
echo "🔄 Veritabanı yedeği oluşturuluyor..."
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Create uploads backup
echo "🔄 Dosya yedekleri oluşturuluyor..."
tar -czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" -C /var/www/cryptonbets uploads/

# Create logs backup
echo "🔄 Log dosyaları yedekleniyor..."
tar -czf "$BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz" -C /var/www/cryptonbets logs/

# Remove old backups
echo "🧹 Eski yedekler temizleniyor..."
find $BACKUP_DIR -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Yedekleme tamamlandı! Dosya: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Upload to remote backup (optional)
# rsync -avz $BACKUP_DIR/ user@backup-server:/backups/cryptonbets/
