import fetch from 'node-fetch';

// 🧪 Callback Test Script
async function testCallback() {
  const BASE_URL = 'https://pay.cryptonbets1.com';
  const TRANSACTION_ID = 'pub_1752743884757';
  
  console.log('🚀 Callback Test Script Başlatılıyor...');
  console.log('📊 Transaction ID:', TRANSACTION_ID);
  console.log('🌐 Base URL:', BASE_URL);
  console.log('=' .repeat(50));

  try {
    // 1. Transaction debug - mevcut durumu kontrol et
    console.log('\n🔍 1. Transaction mevcut durumunu kontrol ediliyor...');
    const debugResponse = await fetch(`${BASE_URL}/api/public/callback/debug/${TRANSACTION_ID}`);
    const debugResult = await debugResponse.json();
    
    console.log('📊 Debug Sonucu:', JSON.stringify(debugResult, null, 2));
    
    if (!debugResult.success) {
      console.log('❌ Transaction bulunamadı!');
      return;
    }

    const currentBalance = debugResult.user?.balance || 0;
    console.log(`💰 Mevcut Bakiye: ${currentBalance} TL`);

    // 2. Manuel callback test et
    console.log('\n🧪 2. Manuel callback test çalıştırılıyor...');
    
    const testData = {
      amount: 2500,
      payment_method: 'havale',
      user_id: '1'
    };

    const callbackResponse = await fetch(`${BASE_URL}/api/public/test-callback/${TRANSACTION_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const callbackResult = await callbackResponse.json();
    console.log('🧪 Callback Test Sonucu:', JSON.stringify(callbackResult, null, 2));

    // 3. Callback sonrası durumu kontrol et
    console.log('\n🔍 3. Callback sonrası durum kontrol ediliyor...');
    
    // 2 saniye bekle, database güncellenmesi için
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalDebugResponse = await fetch(`${BASE_URL}/api/public/callback/debug/${TRANSACTION_ID}`);
    const finalDebugResult = await finalDebugResponse.json();
    
    console.log('📊 Final Durum:', JSON.stringify(finalDebugResult, null, 2));

    if (finalDebugResult.success) {
      const newBalance = finalDebugResult.user?.balance || 0;
      const balanceChange = newBalance - currentBalance;
      
      console.log('\n' + '=' .repeat(50));
      console.log('📈 CALLBACK TEST SONUÇLARI:');
      console.log('=' .repeat(50));
      console.log(`💰 Eski Bakiye: ${currentBalance} TL`);
      console.log(`💰 Yeni Bakiye: ${newBalance} TL`);
      console.log(`📊 Bakiye Değişimi: ${balanceChange} TL`);
      console.log(`🏆 Transaction Status: ${finalDebugResult.transaction?.status}`);
      
      if (balanceChange === 2500 && finalDebugResult.transaction?.status === 'completed') {
        console.log('✅ CALLBACK SİSTEMİ TAMAMEN ÇALIŞIYOR! 🎉');
      } else if (balanceChange === 2500) {
        console.log('⚠️ Bakiye güncellendi ama transaction status sorunlu');
      } else if (finalDebugResult.transaction?.status === 'completed') {
        console.log('⚠️ Transaction completed ama bakiye güncellenmedi');
      } else {
        console.log('❌ Callback sistemi düzgün çalışmıyor');
      }
    }

  } catch (error) {
    console.error('❌ Test Hatası:', error.message);
    console.error('🔧 Detaylar:', error);
  }
}

// 4. Gerçek callback simülasyonu
async function simulateRealCallback() {
  const BASE_URL = 'https://pay.cryptonbets1.com';
  const TRANSACTION_ID = 'pub_1752743884757';
  
  console.log('\n🎯 4. Gerçek MetaPay callback simülasyonu...');
  
  const realCallbackData = {
    transaction_id: TRANSACTION_ID,
    status: 'completed', // MetaPay'in göndereceği format
    amount: 2500,
    payment_method: 'havale',
    user_id: 1,
    gateway_reference: 'ORDER_1752743880029',
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(`${BASE_URL}/api/public/deposit/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MetaPay-Webhook/1.0',
      },
      body: JSON.stringify(realCallbackData)
    });

    const result = await response.json();
    console.log('🎯 Gerçek Callback Simülasyon Sonucu:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Gerçek callback simülasyonu hatası:', error.message);
  }
}

// Script'i çalıştır
async function main() {
  await testCallback();
  await simulateRealCallback();
  
  console.log('\n🏁 Test tamamlandı!');
  console.log('💡 Server loglarını kontrol edin: npm run dev terminal\'inde');
}

main().catch(console.error); 