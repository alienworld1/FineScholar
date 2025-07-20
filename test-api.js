#!/usr/bin/env node

/**
 * Test script for FineScholar API
 * Usage: node test-api.js
 */

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing FineScholar API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log('📊 Status:', healthData.success ? 'Healthy' : 'Unhealthy');
    console.log('⏰ Timestamp:', healthData.timestamp);
    console.log('🔢 Version:', healthData.version);
    console.log('');

    // Test 2: Process Application (with mock data)
    console.log('2️⃣ Testing Application Processing...');
    console.log('📝 Submitting sample student application...');

    const applicationData = {
      studentId: 'TEST001',
      gpa: 3.8,
      financialNeed: 75,
      volunteerHours: 120,
      academicYear: 'Junior',
      major: 'Computer Science',
      university: 'Tech University',
      additionalInfo: 'Active in coding clubs and community service',
      address: '0xa78f8A1B665245DB0Ccc703166e85b994C31e9dE',
    };

    console.log('📋 Application Data:', {
      student: applicationData.studentId,
      gpa: applicationData.gpa,
      need: applicationData.financialNeed,
      volunteer: applicationData.volunteerHours,
      major: applicationData.major,
    });

    const startTime = Date.now();
    const appResponse = await fetch(`${API_BASE}/process-application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    const processingTime = Date.now() - startTime;
    const appData = await appResponse.json();

    if (appData.success) {
      console.log('✅ Application processed successfully!');
      console.log('⭐ Merit Score:', appData.meritScore);
      console.log('🧮 Score Breakdown:');
      console.log('   - GPA Score:', appData.breakdown.gpaScore + '/50');
      console.log(
        '   - Financial Need:',
        appData.breakdown.financialNeedScore + '/30',
      );
      console.log(
        '   - Volunteer Score:',
        appData.breakdown.volunteerScore + '/20',
      );
      console.log('🧠 AI Reasoning:', appData.reasoning);
      console.log('🔗 Transaction Hash:', appData.transactionHash);
      console.log('🔐 Proof Hash:', appData.proofHash.slice(0, 20) + '...');
      console.log('⏱️  Processing Time:', processingTime + 'ms');
    } else {
      console.log('❌ Application processing failed:', appData.error);
      console.log('💬 Message:', appData.message);
    }
  } catch (error) {
    console.error('🚨 API Test Error:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run server');
  }

  console.log('\n🎯 Test completed!');
}

testAPI();
