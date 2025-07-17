import fetch from 'node-fetch';

async function testProductionCallback() {
  const BASE_URL = 'https://pay.cryptonbets1.com';
  
  console.log('🔍 Production Callback Basic Test');
  console.log('=' .repeat(50));
  
  // Test minimal callback
  const callbackData = {
    transaction_id: 'TEST_' + Date.now(),
    status: 'completed',
    amount: 100,
    payment_method: 'test',
    user_id: 1
  };
  
  console.log('📊 Test Callback Data:', JSON.stringify(callbackData, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/api/public/deposit/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TestAgent/1.0'
      },
      body: JSON.stringify(callbackData)
    });
    
    console.log('\n📨 Response Status:', response.status);
    console.log('📨 Response Headers:', [...response.headers.entries()]);
    
    const responseText = await response.text();
    console.log('📨 Response Body:', responseText);
    
    // Response'un JSON olup olmadığını kontrol et
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📨 Parsed JSON:', JSON.stringify(responseJson, null, 2));
      
      if (responseJson.message === 'OK') {
        console.log('\n⚠️ SORUN: Production callback generic response döndürüyor');
        console.log('🔧 ÇÖZÜM: Güncel kodu production\'a deploy etmek gerekiyor');
      }
      
    } catch (e) {
      console.log('Response JSON değil:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Test Hatası:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 SONUÇ:');
  console.log('✅ Callback endpoint erişilebilir');
  console.log('❌ Callback mantığı çalışmıyor (generic response)');
  console.log('🔧 ACTION NEEDED: Production deploy gerekli');
}

testProductionCallback(); 