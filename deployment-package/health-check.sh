#!/bin/bash

# CryptonBets Monitoring and Health Check Script

PROJECT_DIR="/var/www/cryptonbets"
LOG_FILE="$PROJECT_DIR/logs/health-check.log"
EMAIL="admin@cryptonbets.com"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Function to send alert
send_alert() {
    echo "$1" | mail -s "CryptonBets Alert" $EMAIL
    log_message "ALERT: $1"
}

# Check if application is running
check_app() {
    if ! pm2 show cryptonbets | grep -q "online"; then
        send_alert "CryptonBets application is not running!"
        pm2 restart cryptonbets
        return 1
    fi
    return 0
}

# Check database connection
check_database() {
    if ! pg_isready -h localhost -p 5432 -U cryptonbets_user; then
        send_alert "Database connection failed!"
        return 1
    fi
    return 0
}

# Check disk space
check_disk_space() {
    local USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $USAGE -gt 80 ]; then
        send_alert "Disk usage is high: ${USAGE}%"
        return 1
    fi
    return 0
}

# Check memory usage
check_memory() {
    local USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $USAGE -gt 80 ]; then
        send_alert "Memory usage is high: ${USAGE}%"
        return 1
    fi
    return 0
}

# Check SSL certificate expiry
check_ssl() {
    local EXPIRY=$(echo | openssl s_client -servername cryptonbets.com -connect cryptonbets.com:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    local EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    local CURRENT_EPOCH=$(date +%s)
    local DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 30 ]; then
        send_alert "SSL certificate expires in $DAYS_LEFT days!"
        return 1
    fi
    return 0
}

# Check website response
check_website() {
    local HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://cryptonbets.com)
    if [ $HTTP_CODE -ne 200 ]; then
        send_alert "Website is not responding correctly (HTTP $HTTP_CODE)"
        return 1
    fi
    return 0
}

# Main health check
main() {
    log_message "Starting health check..."
    
    local FAILED=0
    
    check_app || ((FAILED++))
    check_database || ((FAILED++))
    check_disk_space || ((FAILED++))
    check_memory || ((FAILED++))
    check_ssl || ((FAILED++))
    check_website || ((FAILED++))
    
    if [ $FAILED -eq 0 ]; then
        log_message "All health checks passed"
    else
        log_message "Health check completed with $FAILED failures"
    fi
}

# Run main function
main