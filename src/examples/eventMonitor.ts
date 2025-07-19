import dotenv from 'dotenv';
import SeiMCPService from '../services/seiMCP';
import { validateConfig } from '../config/mcpConfig';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

interface EventStats {
  scoreProofEvents: number;
  payoutEvents: number;
  totalVolume: number;
  uniqueStudents: Set<string>;
  startTime: number;
}

/**
 * Real-time event monitor for scholarship contract
 * Listens for ScoreProof and Payout events and displays analytics
 */
class ScholarshipEventMonitor {
  private mcpService?: SeiMCPService;
  private stats: EventStats = {
    scoreProofEvents: 0,
    payoutEvents: 0,
    totalVolume: 0,
    uniqueStudents: new Set<string>(),
    startTime: Date.now(),
  };
  private isRunning = false;

  async initialize() {
    console.log('🎧 Initializing Scholarship Event Monitor');
    console.log('==========================================\n');

    try {
      // Validate configuration
      console.log('🔧 Validating configuration...');
      validateConfig();
      console.log('✅ Configuration valid');

      // Initialize service
      console.log('🤖 Initializing Sei MCP Service...');
      this.mcpService = await SeiMCPService.fromEnvironment();

      // Test connectivity
      const connected = await this.mcpService.testConnectivity();
      if (!connected) {
        throw new Error('Failed to connect to Sei network');
      }
      console.log('✅ Service initialized successfully');

      // Display network info
      const networkInfo = await this.mcpService.getNetworkInfo();
      console.log('\n📊 Network Information:');
      console.log('  Chain ID:', networkInfo.chainId);
      console.log('  Block Number:', networkInfo.blockNumber);
      console.log('  Admin Balance:', networkInfo.adminBalance, 'SEI');
      console.log('  Contract Address:', networkInfo.contractAddress);

      // Display current fund status
      const totalFunds = await this.mcpService.getTotalFunds();
      console.log('  Total Funds:', totalFunds, 'SEI');

      console.log('\n🎯 Event Monitor Ready!');
      console.log('=======================');
    } catch (error) {
      console.error('❌ Initialization Error:', error);
      throw error;
    }
  }

  async startMonitoring() {
    if (!this.mcpService) {
      throw new Error('Service not initialized');
    }

    this.isRunning = true;
    this.stats.startTime = Date.now();

    console.log('\n🔴 LIVE EVENT MONITORING');
    console.log('========================');
    console.log('Press Ctrl+C to stop monitoring\n');

    // Listen for ScoreProof events
    const provider = (this.mcpService as any).provider;
    const contract = (this.mcpService as any).scholarshipContract;

    // Set up event listeners
    contract.on(
      'ScoreProof',
      async (student: string, score: bigint, proofHash: string, event: any) => {
        await this.handleScoreProofEvent(student, score, proofHash, event);
      },
    );

    contract.on(
      'Payout',
      async (student: string, amount: bigint, event: any) => {
        await this.handlePayoutEvent(student, amount, event);
      },
    );

    // Periodically display statistics
    const statsInterval = setInterval(() => {
      if (this.isRunning) {
        this.displayStats();
      } else {
        clearInterval(statsInterval);
      }
    }, 30000); // Every 30 seconds

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Stopping event monitor...');
      this.stopMonitoring();
      clearInterval(statsInterval);
      process.exit(0);
    });

    // Keep the process alive
    console.log(
      '⏳ Waiting for events... (monitoring will continue indefinitely)',
    );

    // Also check for missed events from the last few blocks
    await this.checkRecentEvents();
  }

  private async handleScoreProofEvent(
    student: string,
    score: bigint,
    proofHash: string,
    event: any,
  ) {
    this.stats.scoreProofEvents++;
    this.stats.uniqueStudents.add(student);

    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🎯 SCORE PROOF EVENT [${timestamp}]`);
    console.log('─'.repeat(50));
    console.log(`👤 Student: ${student.slice(0, 6)}...${student.slice(-4)}`);
    console.log(`📊 Merit Score: ${score.toString()}/100`);
    console.log(`🔐 Proof Hash: ${proofHash.slice(0, 10)}...`);
    console.log(`📦 Block: ${event.blockNumber}`);
    console.log(`🔗 Tx Hash: ${event.transactionHash}`);

    // Fetch additional details if possible
    try {
      const scoreNumber = Number(score);
      const performance = this.getPerformanceCategory(scoreNumber);
      console.log(`🏆 Performance: ${performance}`);
    } catch (error) {
      // Ignore errors in additional details
    }
  }

  private async handlePayoutEvent(student: string, amount: bigint, event: any) {
    this.stats.payoutEvents++;
    this.stats.uniqueStudents.add(student);

    const amountEth = parseFloat(ethers.formatEther(amount));
    this.stats.totalVolume += amountEth;

    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n💰 PAYOUT EVENT [${timestamp}]`);
    console.log('─'.repeat(50));
    console.log(`👤 Student: ${student.slice(0, 6)}...${student.slice(-4)}`);
    console.log(`💵 Amount: ${amountEth.toFixed(6)} SEI`);
    console.log(`📦 Block: ${event.blockNumber}`);
    console.log(`🔗 Tx Hash: ${event.transactionHash}`);
  }

  private getPerformanceCategory(score: number): string {
    if (score >= 90) return '🏆 Excellent';
    if (score >= 80) return '🥈 Very Good';
    if (score >= 70) return '🥉 Good';
    if (score >= 60) return '📈 Fair';
    return '📉 Needs Improvement';
  }

  private displayStats() {
    const uptime = ((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(1);

    console.log('\n📈 MONITORING STATISTICS');
    console.log('═'.repeat(50));
    console.log(`⏱️  Uptime: ${uptime} minutes`);
    console.log(`🎯 Score Proof Events: ${this.stats.scoreProofEvents}`);
    console.log(`💰 Payout Events: ${this.stats.payoutEvents}`);
    console.log(`👥 Unique Students: ${this.stats.uniqueStudents.size}`);
    console.log(`💵 Total Volume: ${this.stats.totalVolume.toFixed(6)} SEI`);
    console.log(
      `📊 Avg Payout: ${this.stats.payoutEvents > 0 ? (this.stats.totalVolume / this.stats.payoutEvents).toFixed(6) : '0'} SEI`,
    );
    console.log('═'.repeat(50));
  }

  private async checkRecentEvents() {
    if (!this.mcpService) return;

    try {
      console.log('🔍 Checking recent events from last 100 blocks...');

      const provider = (this.mcpService as any).provider;
      const contract = (this.mcpService as any).scholarshipContract;
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100);

      // Query ScoreProof events
      const scoreProofFilter = contract.filters.ScoreProof();
      const scoreProofEvents = await contract.queryFilter(
        scoreProofFilter,
        fromBlock,
        currentBlock,
      );

      // Query Payout events
      const payoutFilter = contract.filters.Payout();
      const payoutEvents = await contract.queryFilter(
        payoutFilter,
        fromBlock,
        currentBlock,
      );

      console.log(
        `📋 Found ${scoreProofEvents.length} ScoreProof and ${payoutEvents.length} Payout events in last 100 blocks`,
      );

      if (scoreProofEvents.length > 0 || payoutEvents.length > 0) {
        console.log('\n🕒 RECENT EVENTS:');
        console.log('─'.repeat(30));

        // Display recent events
        [...scoreProofEvents, ...payoutEvents]
          .sort((a, b) => b.blockNumber - a.blockNumber)
          .slice(0, 5)
          .forEach((event, index) => {
            const isScoreProof = event.eventName === 'ScoreProof';
            const emoji = isScoreProof ? '🎯' : '💰';
            const type = isScoreProof ? 'SCORE' : 'PAYOUT';
            console.log(
              `${emoji} Block ${event.blockNumber}: ${type} for ${event.args![0].slice(0, 8)}...`,
            );
          });
      }

      console.log();
    } catch (error) {
      console.warn(
        '⚠️ Could not fetch recent events:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  stopMonitoring() {
    this.isRunning = false;
    if (this.mcpService) {
      (this.mcpService as any).stopEventListening();
    }
    this.displayStats();
    console.log('\n✅ Event monitoring stopped');
  }
}

/**
 * Start the event monitoring
 */
async function startEventMonitoring() {
  const monitor = new ScholarshipEventMonitor();

  try {
    await monitor.initialize();
    await monitor.startMonitoring();
  } catch (error) {
    console.error('❌ Event Monitor Error:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  startEventMonitoring().catch(error => {
    console.error('💥 Monitor failed:', error);
    process.exit(1);
  });
}

export { ScholarshipEventMonitor, startEventMonitoring };
export default startEventMonitoring;
