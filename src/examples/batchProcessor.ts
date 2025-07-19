import dotenv from 'dotenv';
import SeiMCPService from '../services/seiMCP';
import { mockStudentsData } from '../data/mockStudents';
import { validateConfig } from '../config/mcpConfig';

// Load environment variables
dotenv.config();

/**
 * Batch process multiple student applications
 * Demonstrates scalable AI-driven merit score calculation and blockchain integration
 */
async function batchProcessStudents() {
  console.log('🏭 Starting Batch Student Processing');
  console.log('=====================================\n');

  try {
    // Step 1: Validate configuration
    console.log('🔧 Validating configuration...');
    validateConfig();
    console.log('✅ Configuration valid\n');

    // Step 2: Initialize Sei MCP Service
    console.log('🤖 Initializing Sei MCP Service...');
    const mcpService = await SeiMCPService.fromEnvironment();

    // Test connectivity
    const connected = await mcpService.testConnectivity();
    if (!connected) {
      throw new Error('Failed to connect to Sei network');
    }
    console.log('✅ Service initialized successfully\n');

    // Step 3: Get network info
    const networkInfo = await mcpService.getNetworkInfo();
    console.log('📊 Network Information:');
    console.log('  Chain ID:', networkInfo.chainId);
    console.log('  Block Number:', networkInfo.blockNumber);
    console.log('  Admin Balance:', networkInfo.adminBalance, 'SEI');
    console.log('  Contract Address:', networkInfo.contractAddress);
    console.log();

    // Step 4: Display students to be processed
    console.log(
      `👥 Processing ${mockStudentsData.length} Student Applications:`,
    );
    mockStudentsData.forEach((student, index) => {
      console.log(
        `  ${index + 1}. ${student.studentId} (${student.major}, ${student.academicYear})`,
      );
      console.log(
        `     GPA: ${student.gpa}, Financial Need: ${student.financialNeed}, Volunteer Hours: ${student.volunteerHours}`,
      );
    });
    console.log();

    // Step 5: Check current fund balance
    const currentFunds = await mcpService.getTotalFunds();
    console.log(`💰 Current Scholarship Fund Balance: ${currentFunds} SEI\n`);

    // Step 6: Process all students in batch
    console.log('🚀 Starting batch processing...\n');
    const startTime = Date.now();

    const results = await mcpService.batchProcessStudents(mockStudentsData);

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    // Step 7: Display results summary
    console.log('\n📊 BATCH PROCESSING RESULTS');
    console.log('============================');
    console.log(
      `⏱️  Total Processing Time: ${processingTime.toFixed(2)} seconds`,
    );
    console.log(`👥 Students Processed: ${results.length}`);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log();

    // Step 8: Display individual results
    if (successful.length > 0) {
      console.log('✅ SUCCESSFUL APPLICATIONS:');
      console.log('---------------------------');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.studentId}`);
        console.log(`   Merit Score: ${result.score}/100`);
        console.log(`   Transaction: ${result.transactionHash}`);
        if (result.meritResult?.breakdown) {
          console.log(
            `   Breakdown: GPA(${result.meritResult.breakdown.gpaScore}), Need(${result.meritResult.breakdown.financialNeedScore}), Volunteer(${result.meritResult.breakdown.volunteerScore})`,
          );
        }
        console.log();
      });
    }

    if (failed.length > 0) {
      console.log('❌ FAILED APPLICATIONS:');
      console.log('-----------------------');
      failed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.studentId}`);
        console.log(`   Error: ${result.error}`);
        console.log();
      });
    }

    // Step 9: Calculate merit score statistics
    if (successful.length > 0) {
      const scores = successful.map(r => r.score!);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      console.log('📈 MERIT SCORE STATISTICS:');
      console.log('--------------------------');
      console.log(`📊 Average Score: ${avgScore.toFixed(1)}/100`);
      console.log(`🏆 Highest Score: ${maxScore}/100`);
      console.log(`📉 Lowest Score: ${minScore}/100`);
      console.log();
    }

    // Step 10: Show updated fund balance
    const finalFunds = await mcpService.getTotalFunds();
    console.log(`💰 Final Scholarship Fund Balance: ${finalFunds} SEI`);

    // Step 11: Performance metrics
    console.log('\n⚡ PERFORMANCE METRICS:');
    console.log('----------------------');
    console.log(
      `🔄 Processing Rate: ${(results.length / processingTime).toFixed(2)} students/second`,
    );
    console.log(`⛽ Average Gas per Transaction: ~31,000 gas`);
    console.log(
      `💸 Estimated Total Gas Cost: ~${(successful.length * 31000 * 20).toLocaleString()} gwei`,
    );

    console.log('\n🎉 Batch Processing Complete!');
    console.log('===============================');
  } catch (error) {
    console.error('❌ Batch Processing Error:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

/**
 * Parse command line arguments for batch size limits
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const batchSize = args
    .find(arg => arg.startsWith('--batch-size='))
    ?.split('=')[1];
  const startIndex = args
    .find(arg => arg.startsWith('--start='))
    ?.split('=')[1];
  const endIndex = args.find(arg => arg.startsWith('--end='))?.split('=')[1];

  return {
    batchSize: batchSize ? parseInt(batchSize) : undefined,
    startIndex: startIndex ? parseInt(startIndex) : 0,
    endIndex: endIndex ? parseInt(endIndex) : undefined,
  };
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const { batchSize, startIndex, endIndex } = parseArgs();

  // Limit batch size if specified
  if (batchSize || startIndex !== 0 || endIndex) {
    const end = endIndex || startIndex + (batchSize || mockStudentsData.length);
    mockStudentsData.splice(0, startIndex);
    mockStudentsData.splice(end - startIndex);

    console.log(`🎯 Processing subset: indices ${startIndex} to ${end - 1}`);
  }

  batchProcessStudents()
    .then(() => {
      console.log('🏁 Process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Process failed:', error);
      process.exit(1);
    });
}

export default batchProcessStudents;
