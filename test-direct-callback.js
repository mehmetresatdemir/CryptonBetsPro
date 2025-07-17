import fetch from 'node-fetch';

async function testDirectCallback() {
  const BASE_URL = 'https://pay.cryptonbets1.com';
  const TRANSACTION_ID = 'pub_1752743884757';
  
  console.log('🎯 Direkt Callback Test');
  console.log('📊 Transaction ID:', TRANSACTION_ID);
  console.log('=' .repeat(50));
  
  // 1. Normal callback endpoint test - success
  console.log('\n1. Success Callback Test...');
  const successCallbackData = {
    transaction_id: TRANSACTION_ID,
    status: 'success',
    amount: 2500,
    payment_method: 'havale',
    user_id: 1,
    gateway_reference: 'ORDER_1752743880029'
  };
  
  try {
    const successResponse = await fetch(`${BASE_URL}/api/public/deposit/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MetaPay-Test/1.0'
      },
      body: JSON.stringify(successCallbackData)
    });
    
    console.log('Success Response Status:', successResponse.status);
    const successText = await successResponse.text();
    console.log('Success Response:', successText);
    
    try {
      const successJson = JSON.parse(successText);
      console.log('Success JSON:', JSON.stringify(successJson, null, 2));
    } catch (e) {
      console.log('Success response is not JSON');
    }
    
  } catch (error) {
    console.error('❌ Success callback hatası:', error.message);
  }
  
  // 2. Completed status test
  console.log('\n2. Completed Callback Test...');
  const completedCallbackData = {
    transaction_id: TRANSACTION_ID,
    status: 'completed',
    amount: 2500,
    payment_method: 'havale',
    user_id: 1,
    gateway_reference: 'ORDER_1752743880029'
  };
  
  try {
    const completedResponse = await fetch(`${BASE_URL}/api/public/deposit/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MetaPay-Test/1.0'
      },
      body: JSON.stringify(completedCallbackData)
    });
    
    console.log('Completed Response Status:', completedResponse.status);
    const completedText = await completedResponse.text();
    console.log('Completed Response:', completedText);
    
    try {
      const completedJson = JSON.parse(completedText);
      console.log('Completed JSON:', JSON.stringify(completedJson, null, 2));
      
      if (completedJson.success && completedJson.new_balance) {
        console.log('\n✅ CALLBACK BAŞARILI!');
        console.log(`💰 Yeni Bakiye: ${completedJson.new_balance} TL`);
        console.log(`👤 User ID: ${completedJson.user_id}`);
      }
      
    } catch (e) {
      console.log('Completed response is not JSON');
    }
    
  } catch (error) {
    console.error('❌ Completed callback hatası:', error.message);
  }
  
  console.log('\n🏁 Direkt callback test tamamlandı!');
  console.log('💡 Server loglarını kontrol edin callback mesajları için');
}

testDirectCallback(); 