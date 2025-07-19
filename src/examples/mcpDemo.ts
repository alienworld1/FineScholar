import { SeiMCPService } from '../services/seiMCP';
import {
  MCP_CONFIG,
  getNetworkConfig,
  validateConfig,
} from '../config/mcpConfig';
import { mockStudentsData, testScenarios } from '../data/mockStudents';

/**
 * Complete example demonstrating Sei MCP Kit integration
 * This shows how to:
 * 1. Set up the MCP service
 * 2. Calculate merit scores with Gemini AI
 * 3. Submit scores to Sei blockchain
 * 4. Process multiple students
 */
async function demonstrateMCPIntegration() {
  console.log('🚀 Starting Sei MCP Kit Demonstration');
  console.log('=====================================');

  try {
    // Step 1: Debug configuration
    console.log('🔧 Validating configuration...');
    console.log('Environment variables:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  USE_LOCAL_NETWORK:', process.env.USE_LOCAL_NETWORK);
    console.log('  NETWORK:', process.env.NETWORK);
    console.log(
      '  GEMINI_API_KEY:',
      process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
    );
    console.log(
      '  PRIVATE_KEY:',
      process.env.PRIVATE_KEY ? '✅ Set' : '❌ Missing',
    );
    console.log(
      '  SCHOLARSHIP_FUND_ADDRESS:',
      process.env.SCHOLARSHIP_FUND_ADDRESS || '❌ Not set',
    );

    validateConfig();

    // Step 2: Get network configuration
    const networkConfig = getNetworkConfig();
    console.log('🌐 Network:', networkConfig.name);
    console.log('🔗 RPC:', networkConfig.rpcEndpoint);
    console.log('🆔 Chain ID:', networkConfig.chainId);

    // Step 3: Test network connectivity first
    console.log('\n🌐 Testing network connectivity...');
    const { ethers } = await import('ethers');
    const testProvider = new ethers.JsonRpcProvider(networkConfig.rpcEndpoint);

    try {
      const blockNumber = await testProvider.getBlockNumber();
      console.log(
        '✅ Network connection successful! Latest block:',
        blockNumber,
      );
    } catch (error) {
      console.error('❌ Network connection failed:', error);
      console.log(
        '💡 Make sure the RPC endpoint is accessible:',
        networkConfig.rpcEndpoint,
      );
      return;
    }

    // Step 4: Initialize MCP service
    console.log('\n🤖 Initializing Sei MCP Service...');
    const mcpService = new SeiMCPService({
      rpcEndpoint: networkConfig.rpcEndpoint,
      chainId: networkConfig.chainId,
      scholarshipFundAddress:
        MCP_CONFIG.CONTRACTS.SCHOLARSHIP_FUND ||
        '0x0000000000000000000000000000000000000000',
      enrollmentNFTAddress: MCP_CONFIG.CONTRACTS.ENROLLMENT_NFT,
      geminiApiKey: MCP_CONFIG.GEMINI_API_KEY,
      adminPrivateKey: MCP_CONFIG.ADMIN_PRIVATE_KEY,
    });

    // Step 5: Check network information
    console.log('\n📊 Network Information:');
    const networkInfo = await mcpService.getNetworkInfo();
    console.log('  Chain ID:', networkInfo.chainId);
    console.log('  Block Number:', networkInfo.blockNumber);
    console.log('  Admin Balance:', networkInfo.adminBalance, 'SEI');
    console.log('  Contract Address:', networkInfo.contractAddress);

    // Step 6: Test AI-only merit score calculation
    console.log('\n🧮 Testing AI Merit Score Calculation (No Blockchain)');
    console.log('---------------------------------------------------');

    const testStudent = testScenarios.perfectStudent;
    const meritResult = await mcpService.calculateMeritScoreOnly(testStudent);

    console.log('📊 Merit Score Result:');
    console.log('  Student:', testStudent.studentId);
    console.log('  Score:', meritResult.score, '/100');
    console.log('  Breakdown:');
    console.log('    GPA Score:', meritResult.breakdown.gpaScore);
    console.log(
      '    Financial Need Score:',
      meritResult.breakdown.financialNeedScore,
    );
    console.log('    Volunteer Score:', meritResult.breakdown.volunteerScore);
    console.log('  Reasoning:', meritResult.reasoning);

    // Step 7: Check if contract is properly deployed
    if (
      !MCP_CONFIG.CONTRACTS.SCHOLARSHIP_FUND ||
      MCP_CONFIG.CONTRACTS.SCHOLARSHIP_FUND ===
        '0x0000000000000000000000000000000000000000'
    ) {
      console.log(
        '\n⚠️ Contract not deployed yet. Skipping blockchain integration.',
      );
      console.log('💡 Deploy contracts first using:');
      console.log('   cd contracts && npm run deploy:sei');
      console.log('   npm run sync:deployment');
      return;
    }

    // Step 8: Process a single student application (AI + Blockchain)
    console.log('\n⛓️ Processing Single Student Application (AI + Blockchain)');
    console.log('--------------------------------------------------------');

    const singleResult = await mcpService.processStudentApplication(
      mockStudentsData[0],
    );
    if (singleResult.success) {
      console.log('✅ Application processed successfully!');
      console.log('  Transaction Hash:', singleResult.transactionHash);
      console.log('  Merit Score:', singleResult.meritScore);
    } else {
      console.log('❌ Application processing failed:', singleResult.error);
    }

    console.log('\n🎉 MCP Integration Demonstration Complete!');
  } catch (error) {
    console.error('❌ MCP Integration Error:', error);
    if (error instanceof Error) {
      console.log('Error details:', error.message);
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Network connection troubleshooting:');
        console.log('1. Check if the RPC endpoint is accessible');
        console.log('2. Verify internet connection');
        console.log('3. Try switching to a different RPC endpoint');
      }
    }
  }
}

/**
 * Quick test function for development
 */
async function quickTest() {
  console.log('⚡ Quick MCP Test');

  try {
    console.log('Debug info:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  USE_LOCAL_NETWORK:', process.env.USE_LOCAL_NETWORK);

    validateConfig();
    const networkConfig = getNetworkConfig();

    console.log(
      'Network config:',
      networkConfig.name,
      networkConfig.rpcEndpoint,
    );

    const mcpService = new SeiMCPService({
      rpcEndpoint: networkConfig.rpcEndpoint,
      chainId: networkConfig.chainId,
      scholarshipFundAddress: '0x0000000000000000000000000000000000000000', // Dummy for AI-only test
      geminiApiKey: MCP_CONFIG.GEMINI_API_KEY,
      adminPrivateKey: MCP_CONFIG.ADMIN_PRIVATE_KEY,
    });

    // Test AI calculation only
    const result = await mcpService.calculateMeritScoreOnly(
      testScenarios.improvedStudent,
    );
    console.log('✅ AI Test Result:', result.score, '/100');
    console.log('🧠 Reasoning:', result.reasoning.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

/**
 * Test with different student scenarios
 */
async function testScenarioComparisons() {
  console.log('🔄 Testing Different Student Scenarios');
  console.log('=====================================');

  try {
    validateConfig();
    const networkConfig = getNetworkConfig();

    console.log('Using network:', networkConfig.name);

    const mcpService = new SeiMCPService({
      rpcEndpoint: networkConfig.rpcEndpoint,
      chainId: networkConfig.chainId,
      scholarshipFundAddress: '0x0000000000000000000000000000000000000000', // Dummy for AI-only test
      geminiApiKey: MCP_CONFIG.GEMINI_API_KEY,
    });

    for (const [scenarioName, studentData] of Object.entries(testScenarios)) {
      console.log(`\n📊 Testing ${scenarioName}:`);
      console.log(
        `   GPA: ${studentData.gpa}, Need: ${studentData.financialNeed}, Volunteer: ${studentData.volunteerHours}`,
      );

      const result = await mcpService.calculateMeritScoreOnly(studentData);
      console.log(`   Merit Score: ${result.score}/100`);
      console.log(
        `   Breakdown: GPA(${result.breakdown.gpaScore}) + Need(${result.breakdown.financialNeedScore}) + Vol(${result.breakdown.volunteerScore})`,
      );
    }
  } catch (error) {
    console.error('❌ Scenario testing failed:', error);
  }
}

// Export functions for use
export { demonstrateMCPIntegration, quickTest, testScenarioComparisons };

// Run demonstration if this file is executed directly
const isMain = process.argv[1] === new URL(import.meta.url).pathname;

if (isMain) {
  console.log('🎯 Choose test mode:');
  console.log('1. Full demonstration (with blockchain)');
  console.log('2. Quick AI test only');
  console.log('3. Scenario comparisons');

  const testMode = process.argv[2] || '1';

  switch (testMode) {
    case '1':
      demonstrateMCPIntegration();
      break;
    case '2':
      quickTest();
      break;
    case '3':
      testScenarioComparisons();
      break;
    default:
      console.log('Invalid test mode. Use 1, 2, or 3.');
  }
}
