# CryptonBets Payment Integration API Documentation

## Overview
Complete API documentation for finance company integration with CryptonBets payment system supporting 11 payment methods.

## Base Configuration
```
Base URL: https://cryptonbets1.com/api/payment
Environment: Production
Authentication: API Key + HMAC Signature
Content-Type: application/json
```

## Payment Methods Supported

| Method ID | Name | Type | Min Deposit | Max Deposit | Min Withdraw | Max Withdraw | Processing Time |
|-----------|------|------|-------------|-------------|--------------|--------------|-----------------|
| havale | Havale/EFT | bank_transfer | 50 TRY | 50,000 TRY | 100 TRY | 25,000 TRY | 5-30 dakika |
| kart | Kredi/Banka Kartı | card | 20 TRY | 10,000 TRY | 50 TRY | 5,000 TRY | Anında |
| payco | PayCo | ewallet | 25 TRY | 15,000 TRY | 100 TRY | 10,000 TRY | 1-5 dakika |
| pep | Pep | digital_wallet | 30 TRY | 8,000 TRY | 50 TRY | 5,000 TRY | 2-10 dakika |
| paratim | Paratim | payment_provider | 50 TRY | 20,000 TRY | 100 TRY | 15,000 TRY | 5-15 dakika |
| kripto | Kripto Para | cryptocurrency | 100 TRY | 100,000 TRY | 200 TRY | 50,000 TRY | 10-60 dakika |
| papara | Papara | digital_wallet | 20 TRY | 25,000 TRY | 50 TRY | 20,000 TRY | Anında |
| parolapara | ParolaPara | ewallet | 25 TRY | 12,000 TRY | 75 TRY | 8,000 TRY | 1-10 dakika |
| popy | Popy | mobile_payment | 30 TRY | 5,000 TRY | 50 TRY | 3,000 TRY | 2-5 dakika |
| paybol | PayBol | payment_gateway | 40 TRY | 15,000 TRY | 100 TRY | 10,000 TRY | 3-15 dakika |
| papel | Papel | digital_payment | 25 TRY | 10,000 TRY | 75 TRY | 7,500 TRY | 1-8 dakika |

## API Endpoints for Finance Company Integration

### 1. Process Deposit Request
```http
POST /api/finance/deposit
```

**Request Headers:**
```
Authorization: Bearer {FINANCE_API_KEY}
X-Signature: {HMAC_SHA256_SIGNATURE}
Content-Type: application/json
```

**Request Body:**
```json
{
  "transaction_id": 12345,
  "reference": "DEP-12345-1703123456789",
  "user_id": 1001,
  "payment_method": "papara",
  "amount": 1000,
  "currency": "TRY",
  "type": "deposit",
  "callback_url": "https://cryptonbets1.com/api/payment/callback",
  "webhook_url": "https://cryptonbets1.com/api/payment/webhook",
  "metadata": {
    "user_ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2025-06-19T11:30:00.000Z"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "finance_transaction_id": "FIN-67890",
    "status": "pending",
    "payment_url": "https://finance-gateway.com/pay/FIN-67890",
    "qr_code": "data:image/png;base64,iVBOR...",
    "expires_at": "2025-06-19T12:00:00.000Z",
    "instructions": {
      "papara_number": "1234567890",
      "amount": 1000,
      "description": "CryptonBets Para Yatırma - DEP-12345"
    }
  }
}
```

### 2. Process Withdrawal Request
```http
POST /api/finance/withdraw
```

**Request Body:**
```json
{
  "transaction_id": 12346,
  "reference": "WTH-12346-1703123456790",
  "user_id": 1001,
  "payment_method": "havale",
  "amount": 2500,
  "currency": "TRY",
  "type": "withdrawal",
  "account_details": {
    "bank_name": "Türkiye İş Bankası",
    "iban": "TR12 0006 4000 0011 2233 4455 66",
    "account_holder": "Ahmet Yılmaz",
    "identity_number": "12345678901"
  },
  "callback_url": "https://cryptonbets1.com/api/payment/callback",
  "webhook_url": "https://cryptonbets1.com/api/payment/webhook"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "finance_transaction_id": "FIN-67891",
    "status": "processing",
    "estimated_completion": "2025-06-19T13:30:00.000Z",
    "processing_fee": 15.00,
    "net_amount": 2485.00
  }
}
```

### 3. Transaction Status Update (Callback)
```http
POST https://cryptonbets1.com/api/payment/callback
```

**Request from Finance Company:**
```json
{
  "transaction_id": 12345,
  "finance_transaction_id": "FIN-67890",
  "status": "completed",
  "reference": "DEP-12345-1703123456789",
  "amount": 1000,
  "fee": 25.00,
  "net_amount": 975.00,
  "completion_time": "2025-06-19T11:45:00.000Z",
  "payment_proof": "https://finance-gateway.com/receipt/FIN-67890"
}
```

## Status Flow

### Deposit Status Flow:
1. `pending` - İşlem oluşturuldu, ödeme bekleniyor
2. `processing` - Ödeme alındı, doğrulanıyor  
3. `completed` - İşlem tamamlandı, bakiye yüklendi
4. `failed` - İşlem başarısız
5. `cancelled` - İşlem iptal edildi
6. `expired` - İşlem süresi doldu

### Withdrawal Status Flow:
1. `pending` - Çekim talebi oluşturuldu
2. `approved` - Çekim onaylandı
3. `processing` - Ödeme gönderiliyor
4. `completed` - Ödeme tamamlandı
5. `rejected` - Çekim reddedildi
6. `failed` - Transfer başarısız

## Webhook Integration

### Webhook Endpoint for Real-time Updates:
```http
POST https://cryptonbets1.com/api/payment/webhook
```

**Webhook Payload:**
```json
{
  "event": "transaction.completed",
  "transaction_id": 12345,
  "finance_transaction_id": "FIN-67890",
  "timestamp": "2025-06-19T11:45:00.000Z",
  "data": {
    "status": "completed",
    "amount": 1000,
    "net_amount": 975.00,
    "fee": 25.00
  }
}
```

## Security Implementation

### HMAC Signature Generation:
```javascript
const crypto = require('crypto');
const message = JSON.stringify(payload) + timestamp;
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(message)
  .digest('hex');
```

### Required Headers:
```
X-Timestamp: 1703123456
X-Signature: a1b2c3d4e5f6...
Authorization: Bearer {API_KEY}
```

## Error Handling

### Standard Error Response:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Yetersiz bakiye",
    "details": "Kullanıcı bakiyesi: 500 TRY, Talep edilen: 1000 TRY"
  }
}
```

### Error Codes:
- `INVALID_PAYMENT_METHOD` - Geçersiz ödeme yöntemi
- `AMOUNT_LIMIT_EXCEEDED` - Tutar limiti aşıldı
- `INSUFFICIENT_BALANCE` - Yetersiz bakiye
- `DUPLICATE_TRANSACTION` - Tekrar eden işlem
- `EXPIRED_TRANSACTION` - Süresi dolmuş işlem
- `INVALID_ACCOUNT_DETAILS` - Geçersiz hesap bilgileri
- `KYC_REQUIRED` - KYC doğrulaması gerekli
- `DAILY_LIMIT_EXCEEDED` - Günlük limit aşıldı

## Rate Limiting
- API calls: 100 requests/minute per API key
- Webhook delivery: 3 retry attempts with exponential backoff
- Transaction timeout: 30 minutes for deposits, 24 hours for withdrawals

## Testing Credentials

### Sandbox Environment:
```
Base URL: https://sandbox.cryptonbets1.com/api/payment
API Key: test_sk_1234567890abcdef
Secret Key: test_sk_abcdef1234567890
```

### Test Payment Methods:
- Test Card: 4242424242424242 (Success)
- Test Card: 4000000000000002 (Decline)
- Test Papara: 1111111111 (Success)
- Test IBAN: TR330006100519786457841326 (Success)

## Production Configuration

### Required Environment Variables:
```env
FINANCE_API_KEY=live_sk_...
FINANCE_SECRET_KEY=live_sk_...
FINANCE_WEBHOOK_SECRET=whsec_...
PAYMENT_CALLBACK_URL=https://cryptonbets1.com/api/payment/callback
PAYMENT_WEBHOOK_URL=https://cryptonbets1.com/api/payment/webhook
```

### Database Schema Updates Required:
```sql
-- Add to transactions table
ALTER TABLE transactions ADD COLUMN finance_transaction_id VARCHAR(255);
ALTER TABLE transactions ADD COLUMN processing_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN net_amount DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN payment_proof_url TEXT;

-- Add payment method limits table  
CREATE TABLE payment_method_limits (
  id SERIAL PRIMARY KEY,
  method_id VARCHAR(50) NOT NULL,
  min_deposit DECIMAL(10,2) NOT NULL,
  max_deposit DECIMAL(10,2) NOT NULL,
  min_withdraw DECIMAL(10,2) NOT NULL,
  max_withdraw DECIMAL(10,2) NOT NULL,
  daily_limit DECIMAL(10,2) NOT NULL,
  processing_fee_percent DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Support & Monitoring

### Health Check Endpoint:
```http
GET /api/payment/health
```

### Transaction Analytics:
```http
GET /api/finance/analytics
```

For technical support and integration assistance:
- Email: tech@cryptonbets1.com
- Phone: +90 212 xxx xxxx
- Documentation: https://docs.cryptonbets1.com/payment-api