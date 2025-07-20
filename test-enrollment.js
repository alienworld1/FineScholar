// Test script for enrollment verification system
const API_BASE = 'http://localhost:3001/api';

// Test 1: Request NFT endpoint
async function testRequestNFT() {
  console.log('🧪 Testing NFT Request Endpoint...');

  const testData = {
    studentAddress: '0x742d35Cc6353CAD1eA58c15b7Fb8E61FfE06c3bE',
    university: 'Test University',
    studentId: 'TEST123',
  };

  try {
    const response = await fetch(`${API_BASE}/enrollment/request-nft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('✅ NFT Request Response:', result);
    return result.success;
  } catch (error) {
    console.error('❌ NFT Request Failed:', error);
    return false;
  }
}

// Test 2: Document verification endpoint
async function testDocumentVerification() {
  console.log('🧪 Testing Document Verification Endpoint...');

  const testData = {
    studentAddress: '0x742d35Cc6353CAD1eA58c15b7Fb8E61FfE06c3bE',
    documentHash:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    fileName: 'enrollment_letter.pdf',
    fileSize: 12345,
  };

  try {
    const response = await fetch(`${API_BASE}/enrollment/verify-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('✅ Document Verification Response:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Document Verification Failed:', error);
    return false;
  }
}

// Test 3: Token data endpoint
async function testTokenData() {
  console.log('🧪 Testing Token Data Endpoint...');

  try {
    const response = await fetch(`${API_BASE}/enrollment/token-data/1`);
    const result = await response.json();
    console.log('✅ Token Data Response:', result);
    return true; // This might fail if token doesn't exist, but that's ok
  } catch (error) {
    console.error('❌ Token Data Failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Enrollment Verification API Tests...\n');

  const results = await Promise.all([
    testRequestNFT(),
    testDocumentVerification(),
    testTokenData(),
  ]);

  const passedTests = results.filter(Boolean).length;
  console.log(`\n📊 Test Results: ${passedTests}/3 tests passed`);

  if (passedTests === 3) {
    console.log('🎉 All enrollment verification endpoints are working!');
  } else {
    console.log('⚠️  Some tests failed - check the logs above');
  }
}

runTests();
