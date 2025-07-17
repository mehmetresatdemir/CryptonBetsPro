import fetch from 'node-fetch';

async function testAPI() {
  const BASE_URL = 'https://pay.cryptonbets1.com';
  const TRANSACTION_ID = 'pub_1752743884757';
  
  console.log('🔍 API Test Başlıyor...');
  console.log('📊 Transaction ID:', TRANSACTION_ID);
  
  try {
    // 1. Basit API test
    console.log('\n1. Root API test...');
    const rootResponse = await fetch(`${BASE_URL}/api/public/deposit/callback`);
    console.log('Root Response Status:', rootResponse.status);
    console.log('Root Response Headers:', [...rootResponse.headers.entries()]);
    
    // 2. Debug endpoint test
    console.log('\n2. Debug endpoint test...');
    const debugUrl = `${BASE_URL}/api/public/callback/debug/${TRANSACTION_ID}`;
    console.log('Debug URL:', debugUrl);
    
    const debugResponse = await fetch(debugUrl);
    console.log('Debug Response Status:', debugResponse.status);
    console.log('Debug Response Headers:', [...debugResponse.headers.entries()]);
    
    const debugText = await debugResponse.text();
    console.log('Debug Response Body (raw):', debugText);
    
    try {
      const debugJson = JSON.parse(debugText);
      console.log('Debug Response Body (JSON):', JSON.stringify(debugJson, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
    // 3. Test manual callback
    console.log('\n3. Manuel callback test...');
    const testCallbackUrl = `${BASE_URL}/api/public/test-callback/${TRANSACTION_ID}`;
    console.log('Test Callback URL:', testCallbackUrl);
    
    const testResponse = await fetch(testCallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 2500,
        payment_method: 'havale',
        user_id: '1'
      })
    });
    
    console.log('Test Response Status:', testResponse.status);
    const testText = await testResponse.text();
    console.log('Test Response Body:', testText);
    
  } catch (error) {
    console.error('❌ API Test Hatası:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPI(); 