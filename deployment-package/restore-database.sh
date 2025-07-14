#!/bin/bash

# CryptonBets Database Restore Script

if [ $# -eq 0 ]; then
    echo "Kullanım: ./restore-database.sh backup_file.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="cryptonbets_production"
DB_USER="cryptonbets_user"

echo "⚠️  UYARI: Bu işlem mevcut veritabanını tamamen silecek!"
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Veritabanı geri yükleniyor..."
    
    # Drop existing database
    dropdb -U $DB_USER $DB_NAME
    
    # Create new database
    createdb -U $DB_USER $DB_NAME
    
    # Restore from backup
    gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME
    
    echo "✅ Veritabanı başarıyla geri yüklendi!"
else
    echo "❌ İşlem iptal edildi."
fi
