const https = require('https');
const http = require('http');

// API configuration
const API_CONFIG = {
  hostname: 'pay.cryptonbets1.com',
  port: 443,
  path: '/api/services/withdrawal',
  apiKey: '863bb2a8ca4790bd1f2d0fbd506f5ec5cffa0f9bfe50fed26490656c72dbc7dd'
};

// Generic API request function
async function makeWithdrawalRequest(paymentData) {
  const postData = JSON.stringify(paymentData);
  
  console.log('📤 Request Data:', postData);

  const options = {
    hostname: API_CONFIG.hostname,
    port: API_CONFIG.port,
    path: API_CONFIG.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'X-API-Key': API_CONFIG.apiKey
    }
  };

  console.log('📡 Request Options:', {
    hostname: options.hostname,
    port: options.port,
    path: options.path,
    method: options.method,
    headers: options.headers
  });

  const response = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });

  console.log('📊 Response Status:', response.statusCode);
  console.log('📊 Response Headers:', response.headers);
  console.log('📊 Response Body:', response.body);
  
  if (response.statusCode === 200) {
    const result = JSON.parse(response.body);
    console.log('✅ Success!');
    console.log('🎯 Token:', result.token);
    console.log('🎯 Status:', result.status);
    console.log('🎯 Message:', result.message);
  } else {
    console.log('❌ Error:', response.statusCode);
    try {
      const errorResult = JSON.parse(response.body);
      console.log('🔍 Error details:', errorResult);
    } catch (e) {
      console.log('🔍 Raw error:', response.body);
    }
  }
}

// 1. Havale/EFT Test
async function testHavaleWithdrawal() {
  try {
    console.log('🧪 Testing Havale Withdrawal...');
    
         const paymentData = {
       payment_method_id: 'havale',
       amount: 100,
       user: 'Test User',
       user_name: 'testuser',
       user_id: '12345',
       site_reference_number: 'WD' + Date.now(),
       return_url: 'https://example.com/return',
       // Havale için gerekli alanlar - farklı field isimleri deniyoruz
       iban: 'TR320010009999901234567890', // 26 haneli IBAN
       bank_name: 'Ziraat Bankası',
       user_full_name: 'Test User',
       account_name: 'Test User', // API'nin beklediği field olabilir
       account_holder_name: 'Test User' // Alternatif field ismi
     };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Havale test failed:', error);
  }
}

// 2. Papara Test
async function testPaparaWithdrawal() {
  try {
    console.log('🧪 Testing Papara Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'papara',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Papara için gerekli alanlar
      papara_id: '1234567890' // 10 haneli Papara ID
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Papara test failed:', error);
  }
}

// 3. Pay-Co Test
async function testPaycoWithdrawal() {
  try {
    console.log('🧪 Testing Pay-Co Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'payco',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Pay-Co için gerekli alanlar
      pay_co_id: '1234567890',
      pay_co_full_name: 'Test User'
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Pay-Co test failed:', error);
  }
}

// 4. PEP Test
async function testPepWithdrawal() {
  try {
    console.log('🧪 Testing PEP Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'pep',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // PEP için gerekli alanlar
      pep_id: '123456789', // 9 haneli PEP ID
      tc_number: '12345678901' // 11 haneli TC kimlik
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ PEP test failed:', error);
  }
}

// 5. Paratim Test
async function testParatimWithdrawal() {
  try {
    console.log('🧪 Testing Paratim Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'paratim',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Paratim için gerekli alanlar
      paratim_id: '1234567890' // 10 haneli Paratim ID
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Paratim test failed:', error);
  }
}

// 6. Crypto Test
async function testCryptoWithdrawal() {
  try {
    console.log('🧪 Testing Crypto Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'crypto',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Crypto için gerekli alanlar
      crypto_address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' // Bitcoin adresi örneği
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Crypto test failed:', error);
  }
}

// 7. Popy Test
async function testPopyWithdrawal() {
  try {
    console.log('🧪 Testing Popy Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'popy',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Popy için gerekli alanlar
      popy_id: '1234567890' // 10 haneli Popy ID
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Popy test failed:', error);
  }
}

// 8. Papel Test
async function testPapelWithdrawal() {
  try {
    console.log('🧪 Testing Papel Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'papel',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Papel için gerekli alanlar
      papel_id: '1234567890' // 10 haneli Papel ID
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Papel test failed:', error);
  }
}

// 9. Parolapara Test
async function testParolaparaWithdrawal() {
  try {
    console.log('🧪 Testing Parolapara Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'parolapara',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Parolapara için gerekli alanlar
      parolapara_id: '1234567890' // 10 haneli Parolapara ID
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Parolapara test failed:', error);
  }
}

// 10. Paybol Test
async function testPaybolWithdrawal() {
  try {
    console.log('🧪 Testing Paybol Withdrawal...');
    
    const paymentData = {
      payment_method_id: 'paybol',
      amount: 100,
      user: 'Test User',
      user_name: 'testuser',
      user_id: '12345',
      site_reference_number: 'WD' + Date.now(),
      return_url: 'https://example.com/return',
      // Paybol için gerekli alanlar
      paybol_id: '1234567890' // 10 haneli Paybol ID
    };

    await makeWithdrawalRequest(paymentData);
  } catch (error) {
    console.error('❌ Paybol test failed:', error);
  }
}

// Ana test fonksiyonu
async function runAllTests() {
  console.log('🚀 Starting All Withdrawal API Tests...\n');
  
  await testHavaleWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testPaparaWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testPaycoWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testPepWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testParatimWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testCryptoWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testPopyWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testPapelWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testParolaparaWithdrawal();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testPaybolWithdrawal();
  
  console.log('\n🎉 All tests completed!');
}

// Tek bir test çalıştırmak için:
testPaparaWithdrawal();

// Tüm testleri çalıştırmak için:
// runAllTests(); 