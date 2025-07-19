import dotenv from 'dotenv';
import SeiMCPService from '../services/seiMCP';
import { validateConfig } from '../config/mcpConfig';

// Load environment variables
dotenv.config();

/**
 * Fund the scholarship pool with SEI tokens
 * Supports different funding amounts and displays transaction details
 */
async function fundScholarshipPool() {
  console.log('💰 Scholarship Pool Funding Utility');
  console.log('====================================\n');

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    let fundingAmount = '1.0'; // Default 1 SEI

    // Check for --amount flag
    const amountArg = args.find(arg => arg.startsWith('--amount='));
    if (amountArg) {
      fundingAmount = amountArg.split('=')[1];
    } else if (args.length > 0 && !args[0].startsWith('--')) {
      // Use first argument as amount if no flag
      fundingAmount = args[0];
    }

    // Validate amount
    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        `Invalid funding amount: ${fundingAmount}. Please provide a positive number.`,
      );
    }

    console.log(`🎯 Funding Amount: ${amount} SEI`);
    console.log();

    // Step 1: Validate configuration
    console.log('🔧 Validating configuration...');
    validateConfig();
    console.log('✅ Configuration valid');

    // Step 2: Initialize Sei MCP Service
    console.log('🤖 Initializing Sei MCP Service...');
    const mcpService = await SeiMCPService.fromEnvironment();

    // Test connectivity
    const connected = await mcpService.testConnectivity();
    if (!connected) {
      throw new Error('Failed to connect to Sei network');
    }
    console.log('✅ Service initialized successfully');

    // Step 3: Display current status
    const networkInfo = await mcpService.getNetworkInfo();
    console.log('\n📊 Current Network Status:');
    console.log('  Chain ID:', networkInfo.chainId);
    console.log('  Block Number:', networkInfo.blockNumber);
    console.log('  Contract Address:', networkInfo.contractAddress);

    const adminBalance = networkInfo.adminBalance;
    console.log('  Admin Balance:', adminBalance, 'SEI');

    const currentFunds = await mcpService.getTotalFunds();
    console.log('  Current Pool Balance:', currentFunds, 'SEI');

    // Step 4: Check if admin has sufficient balance
    if (adminBalance && parseFloat(adminBalance) < amount) {
      console.warn(
        `⚠️  Warning: Admin balance (${adminBalance} SEI) is less than funding amount (${amount} SEI)`,
      );
      console.warn('   Transaction may fail due to insufficient funds');
    }

    // Step 5: Display funding details
    console.log('\n💳 FUNDING TRANSACTION DETAILS:');
    console.log('─'.repeat(40));
    console.log(`📤 From: Admin wallet`);
    console.log(`📥 To: Scholarship contract`);
    console.log(`💵 Amount: ${amount} SEI`);
    console.log(`⛽ Estimated Gas: ~50,000 gas`);
    console.log(`💸 Est. Gas Cost: ~0.001 SEI`);

    // Step 6: Confirmation
    if (process.env.NODE_ENV !== 'test') {
      console.log('\n❓ Confirm funding transaction?');
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('\n🚀 Executing funding transaction...');

    // Step 7: Execute the funding
    const startTime = Date.now();
    const tx = await mcpService.depositFunds(amount.toString());
    const endTime = Date.now();

    const executionTime = (endTime - startTime) / 1000;

    console.log('\n✅ FUNDING SUCCESSFUL!');
    console.log('══════════════════════');
    console.log(`🔗 Transaction Hash: ${tx.hash}`);
    console.log(`⏱️  Execution Time: ${executionTime.toFixed(2)} seconds`);
    console.log(`📦 Block Number: ${tx.blockNumber || 'Pending'}`);
    console.log(`⛽ Gas Used: ${(tx as any).gasUsed || 'Pending'}`);

    // Step 8: Display updated balances
    console.log('\n💰 UPDATED BALANCES:');
    console.log('────────────────────');

    const newNetworkInfo = await mcpService.getNetworkInfo();
    const newAdminBalance = newNetworkInfo.adminBalance;
    const newPoolBalance = await mcpService.getTotalFunds();

    console.log(
      `👤 Admin Balance: ${newAdminBalance} SEI (was ${adminBalance} SEI)`,
    );
    console.log(
      `💼 Pool Balance: ${newPoolBalance} SEI (was ${currentFunds} SEI)`,
    );

    const actualIncrease =
      parseFloat(newPoolBalance) - parseFloat(currentFunds);
    console.log(`📈 Pool Increase: +${actualIncrease.toFixed(6)} SEI`);

    // Step 9: Calculate pool statistics
    console.log('\n📊 SCHOLARSHIP POOL STATISTICS:');
    console.log('───────────────────────────────');

    const poolBalance = parseFloat(newPoolBalance);
    const estimatedStudents = Math.floor(poolBalance / 0.1); // Assuming ~0.1 SEI per scholarship
    const maxScore100Students = Math.floor(poolBalance / 0.2); // Students with 100 merit score

    console.log(
      `🎓 Est. Scholarships Available: ${estimatedStudents} (at avg 0.1 SEI each)`,
    );
    console.log(
      `🏆 Max Score (100) Students: ${maxScore100Students} (at 0.2 SEI each)`,
    );
    console.log(
      `💯 Pool Utilization Potential: ${(poolBalance * 100).toFixed(0)}% of 1 SEI`,
    );

    // Step 10: Success message
    console.log('\n🎉 Pool Funding Complete!');
    console.log('═════════════════════════');
    console.log(`✨ Successfully added ${amount} SEI to the scholarship pool`);
    console.log(
      `🚀 Ready to process student applications and distribute scholarships`,
    );

    // Step 11: Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('──────────────');
    console.log('• Process student applications: npm run mcp:batch');
    console.log('• Monitor real-time events: npm run mcp:events');
    console.log('• Run individual demo: npm run mcp:demo');
  } catch (error) {
    console.error('\n❌ Funding Error:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error),
    );

    // Provide helpful troubleshooting tips
    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    console.log('────────────────────────');
    console.log('• Ensure your admin wallet has sufficient SEI balance');
    console.log('• Check network connectivity to Sei testnet');
    console.log('• Verify contract address in environment variables');
    console.log('• Make sure PRIVATE_KEY is correctly set');

    process.exit(1);
  }
}

/**
 * Display usage instructions
 */
function displayUsage() {
  console.log('💰 Scholarship Pool Funding Utility');
  console.log('====================================');
  console.log();
  console.log('USAGE:');
  console.log(
    '  npm run fund:scholarship                    # Fund with 1.0 SEI (default)',
  );
  console.log(
    '  npm run fund:scholarship -- 2.5            # Fund with 2.5 SEI',
  );
  console.log(
    '  npm run fund:scholarship -- --amount=0.5   # Fund with 0.5 SEI',
  );
  console.log();
  console.log('OPTIONS:');
  console.log('  --amount=<number>  Amount of SEI to deposit (default: 1.0)');
  console.log('  --help            Show this help message');
  console.log();
  console.log('EXAMPLES:');
  console.log(
    '  npm run fund:scholarship -- 5.0           # Add 5 SEI to pool',
  );
  console.log(
    '  npm run fund:scholarship -- --amount=10   # Add 10 SEI to pool',
  );
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    displayUsage();
    process.exit(0);
  }

  fundScholarshipPool()
    .then(() => {
      console.log('\n🏁 Funding process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Funding process failed:', error);
      process.exit(1);
    });
}

export default fundScholarshipPool;
