const http = require('http');

// Doğru formatta kripto deposit isteği
const correctRequest = {
  amount: 500,
  payment_method_id: "crypto",
  user_id: 1, // Tam sayı olarak (string değil)
  user_name: "Admin User",
  user: "Admin User",
  user_email: "admin@cryptonbets.com",
  site_reference_number: "ORDER_1752448079963",
  return_url: "https://www.cryptonbets1.com/payment/return",
  callback_url: "https://www.cryptonbets1.com/api/public/deposit/callback",
  crypto_type: "trc20",
  crypto_address: "TRX7JWzUiZfb2h1C8Q3WUNvXfKJ9P5L2wX1234567890" // Gerekli alan
};

const postData = JSON.stringify(correctRequest);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/public/deposit/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json'
  }
};

console.log('✅ DOĞRU FORMATTA KRİPTO DEPOSIT İSTEĞİ');
console.log('=====================================');
console.log('📋 İstek Verisi:');
console.log(JSON.stringify(correctRequest, null, 2));
console.log('');

const req = http.request(options, (res) => {
  console.log(`📊 HTTP Status: ${res.statusCode}`);
  console.log('');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('📦 Response:');
      console.log(JSON.stringify(parsedData, null, 2));
      console.log('');
      
      if (res.statusCode === 200 && parsedData.success) {
        console.log('🎉 DOĞRU FORMAT TESTİ BAŞARILI!');
        console.log(`   Transaction ID: ${parsedData.data?.transaction_id}`);
        console.log(`   Amount: ${parsedData.data?.amount} TL`);
        console.log(`   Status: ${parsedData.data?.status}`);
        console.log(`   XPay Status: ${parsedData.data?.xpay_status}`);
      } else {
        console.log('❌ TEST BAŞARISIZ!');
        console.log(`   Error: ${parsedData.error}`);
      }
    } catch (e) {
      console.log('❌ JSON Parse Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('💥 Request Error:', e.message);
});

req.write(postData);
req.end();

console.log('⏳ Test başlatılıyor...');

// Orijinal vs Doğru format karşılaştırması
console.log('\n🔍 KARŞILAŞTIRMA:');
console.log('================');
console.log('❌ Orijinal İstek Sorunları:');
console.log('   - user_id: "1" (string) → XPay tam sayı istiyor');
console.log('   - crypto_address eksik → Kripto işlemler için zorunlu');
console.log('   - payment_method_id duplicate');
console.log('   - user duplicate');
console.log('   - Gereksiz alanlar: firstName, lastName, fullName, pay_co_full_name');
console.log('');
console.log('✅ Düzeltilmiş İstek:');
console.log('   - user_id: 1 (number)');
console.log('   - crypto_address eklendi');
console.log('   - Duplicate alanlar temizlendi');
console.log('   - Gereksiz alanlar kaldırıldı');
console.log('   - TRC20 için doğru adres formatı kullanıldı'); 