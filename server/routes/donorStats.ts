import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Sei Testnet configuration
const SEI_RPC_URL =
  process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com';
const SCHOLARSHIP_FUND_ADDRESS =
  process.env.VITE_SCHOLARSHIP_FUND_ADDRESS ||
  '0x25c21f7472c1110f073EA3e1A850cBf395D194d1';

// Contract ABI for events
const SCHOLARSHIP_FUND_ABI = [
  // Events for monitoring donations and scholarships
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'donor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'FundsDeposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'student',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'score',
        type: 'uint256',
      },
    ],
    name: 'ScholarshipAwarded',
    type: 'event',
  },
];

// Get donor statistics from blockchain
router.get('/donor-stats', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS,
      SCHOLARSHIP_FUND_ABI,
      provider,
    );

    // Get recent donation events (last 1000 blocks)
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 1000);

    const donationFilter = contract.filters.FundsDeposited();
    const scholarshipFilter = contract.filters.ScholarshipAwarded();

    const [donationEvents, scholarshipEvents] = await Promise.all([
      contract.queryFilter(donationFilter, fromBlock),
      contract.queryFilter(scholarshipFilter, fromBlock),
    ]);

    // Process donation events
    let totalDonatedBigInt = BigInt(0);
    const recentDonations: Array<{
      id: string;
      donor: string;
      amount: string;
      timestamp: Date;
      blockNumber: number;
    }> = [];

    for (const event of donationEvents.slice(-10)) {
      // Last 10 donations
      if ('args' in event && event.args) {
        const block = await provider.getBlock(event.blockNumber);
        if (block) {
          totalDonatedBigInt += event.args.amount as bigint;

          recentDonations.push({
            id: event.transactionHash,
            donor: event.args.donor as string,
            amount: ethers.formatEther(event.args.amount as bigint),
            timestamp: new Date(block.timestamp * 1000),
            blockNumber: event.blockNumber,
          });
        }
      }
    }

    // Process scholarship events
    const recentScholarships: Array<{
      id: string;
      student: string;
      amount: string;
      timestamp: Date;
      score: number;
    }> = [];
    let totalScores = 0;
    let scoreCount = 0;

    for (const event of scholarshipEvents.slice(-10)) {
      // Last 10 scholarships
      if ('args' in event && event.args) {
        const block = await provider.getBlock(event.blockNumber);
        if (block) {
          const score = Number(event.args.score);

          totalScores += score;
          scoreCount++;

          const studentAddress = event.args.student as string;
          recentScholarships.push({
            id: event.transactionHash,
            student:
              studentAddress.slice(0, 6) + '...' + studentAddress.slice(-4), // Anonymize
            amount: ethers.formatEther(event.args.amount as bigint),
            timestamp: new Date(block.timestamp * 1000),
            score: score,
          });
        }
      }
    }

    const totalDonated = ethers.formatEther(totalDonatedBigInt);
    const averageScore =
      scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0;

    res.json({
      success: true,
      data: {
        totalDonated,
        studentsHelped: scholarshipEvents.length,
        averageScore,
        recentDonations,
        recentScholarships,
      },
    });
  } catch (error) {
    console.error('Error fetching donor stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donor statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as donorStatsRoute };
