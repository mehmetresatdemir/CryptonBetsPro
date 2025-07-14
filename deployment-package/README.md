# CryptonBets Production Deployment Package

## 📋 Genel Bakış

Bu paket, CryptonBets platformunun production ortamına deploymentı için gereken tüm dosyaları ve yapılandırmaları içerir.

## 🚀 Hızlı Başlangıç

### Sistem Gereksinimleri

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Node.js 18+
- PostgreSQL 13+
- Nginx 1.18+
- En az 4GB RAM
- En az 20GB disk alanı
- SSL sertifikası (Let's Encrypt önerili)

### 1. Sunucu Hazırlığı

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Gerekli paketleri yükle
sudo apt install curl wget git unzip -y
```

### 2. Deployment

```bash
# Deployment package'ını çıkart
unzip cryptonbets-production-package.zip
cd cryptonbets-production

# Environment dosyasını düzenle
cp .env.example .env.production
nano .env.production  # Güvenlik anahtarlarını ve API bilgilerini güncelle

# Deployment script'ini çalıştır
chmod +x deploy.sh
sudo ./deploy.sh
```

### 3. SSL Sertifikası Kurulumu

```bash
# SSL sertifikalarını kur
sudo ./setup-ssl.sh
```

## 📁 Dosya Yapısı

```
deployment-package/
├── 📄 package.json              # Proje dependencies
├── 📄 .env.example              # Environment variables örneği
├── 📄 .env.production           # Production environment
├── 🐳 Dockerfile               # Docker yapılandırması
├── 🐳 docker-compose.yml       # Docker Compose
├── 🌐 nginx.conf               # Nginx yapılandırması
├── ⚙️ ecosystem.config.js      # PM2 yapılandırması
├── 🗄️ database-export.sql      # Veritabanı şeması ve veriler
├── 🔧 deploy.sh                # Ana deployment script
├── 🔐 setup-ssl.sh             # SSL kurulum script
├── 💾 backup-database.sh       # Veritabanı yedekleme
├── 🔄 restore-database.sh      # Veritabanı geri yükleme
├── 📊 health-check.sh          # Sistem izleme
└── 📖 README.md                # Bu dosya
```

## ⚙️ Yapılandırma

### Environment Variables

Kritik environment variables'ları mutlaka değiştirin:

```env
# GÜVENLİK ANAHTARLARI (MUTLAKA DEĞİŞTİRİN!)
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars
SESSION_SECRET=your_super_secure_session_secret_here
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# VERİTABANI
DATABASE_URL=postgresql://cryptonbets_user:secure_password@localhost:5432/cryptonbets_production

# API ANAHTARLARI
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
OPENAI_API_KEY=sk-your_openai_api_key_here
SLOTEGRATOR_API_KEY=your_slotegrator_api_key
```

### Nginx Yapılandırması

- SSL/TLS yapılandırması
- Rate limiting
- Gzip compression
- Security headers
- Static file serving

### PM2 Yapılandırması

- Cluster mode (tüm CPU çekirdekleri)
- Auto restart
- Log rotation
- Memory monitoring
- Health checks

## 🔄 Yönetim Komutları

### Application Management

```bash
# Uygulamayı başlat
pm2 start ecosystem.config.js --env production

# Uygulamayı durdur
pm2 stop cryptonbets

# Uygulamayı yeniden başlat
pm2 restart cryptonbets

# Uygulamayı sil
pm2 delete cryptonbets

# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs cryptonbets

# Monitoring dashboard
pm2 monit
```

### Database Management

```bash
# Veritabanı yedeği al
./backup-database.sh

# Veritabanını geri yükle
./restore-database.sh backup_file.sql.gz

# Veritabanı bağlantısını test et
psql -U cryptonbets_user -d cryptonbets_production -c "SELECT version();"
```

### SSL Certificate Management

```bash
# Sertifika durumunu kontrol et
sudo certbot certificates

# Sertifikaları yenile
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## 📊 İzleme ve Bakım

### Health Check

```bash
# Manuel health check çalıştır
./health-check.sh

# Health check loglarını görüntüle
tail -f logs/health-check.log
```

### Log Files

```bash
# Application logs
tail -f logs/combined.log
tail -f logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

### Performance Monitoring

```bash
# System resources
htop
iotop
df -h
free -h

# Database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Nginx status
sudo systemctl status nginx
```

## 🔒 Güvenlik

### Firewall Configuration

```bash
# UFW firewall kuralları
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw status
```

### Security Best Practices

1. **Güçlü şifreler kullanın**
2. **SSH key authentication kullanın**
3. **Düzenli güvenlik güncellemeleri yapın**
4. **Fail2ban kurun**
5. **Log monitoring yapın**
6. **Düzenli backup alın**

### Fail2ban Setup

```bash
# Fail2ban kur
sudo apt install fail2ban -y

# Nginx için jail oluştur
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

# Fail2ban'ı başlat
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🆘 Sorun Giderme

### Yaygın Sorunlar

1. **Uygulama başlamıyor**
   ```bash
   pm2 logs cryptonbets
   ```

2. **Veritabanı bağlantı hatası**
   ```bash
   sudo systemctl status postgresql
   pg_isready -h localhost -U cryptonbets_user
   ```

3. **Nginx yapılandırma hatası**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **SSL sertifika sorunları**
   ```bash
   sudo certbot certificates
   openssl x509 -in /etc/letsencrypt/live/cryptonbets.com/cert.pem -text -noout
   ```

### Debug Mode

```bash
# Debug mode ile çalıştır
NODE_ENV=development pm2 start ecosystem.config.js
```

### Performance Issues

```bash
# Memory usage
free -h
ps aux --sort=-%mem | head

# CPU usage
top
ps aux --sort=-%cpu | head

# Disk I/O
iotop
df -h
```

## 📞 Destek

### Loglar ve Bilgi Toplama

Destek için aşağıdaki bilgileri toplayın:

```bash
# Sistem bilgisi
uname -a
cat /etc/os-release

# Application logs
pm2 logs cryptonbets --lines 100

# System resources
free -h
df -h
ps aux | grep node

# Database status
sudo systemctl status postgresql
```

### Acil Durum Prosedürleri

1. **Site erişilemez durumda**
   ```bash
   sudo systemctl restart nginx
   pm2 restart cryptonbets
   ```

2. **Veritabanı sorunu**
   ```bash
   sudo systemctl restart postgresql
   ```

3. **Tam sistem restart**
   ```bash
   sudo reboot
   ```

## 📝 Changelog

- **v1.0.0** - Initial production release
- **v1.0.1** - Added SSL auto-renewal
- **v1.0.2** - Enhanced monitoring scripts
- **v1.0.3** - Improved security configurations

## 📄 Lisans

Bu yazılım ticari lisans altındadır. Yetkisiz kullanım yasaktır.

© 2025 CryptonBets. Tüm hakları saklıdır.