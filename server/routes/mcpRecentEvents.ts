import { Request, Response } from 'express';
import { ethers } from 'ethers';

interface BlockchainEvent {
  type: 'Payout' | 'ScoreProof' | 'Deposit';
  id: string;
  student?: string;
  amount?: string;
  score?: number;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

const SCHOLARSHIP_FUND_ADDRESS =
  process.env.VITE_SCHOLARSHIP_FUND_ADDRESS ||
  '0x25c21f7472c1110f073EA3e1A850cBf395D194d1';
const SEI_RPC_URL =
  process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com';

const EVENT_ABI = [
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
    ],
    name: 'Payout',
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
        internalType: 'bytes32',
        name: 'proofHash',
        type: 'bytes32',
      },
    ],
    name: 'ScoreProof',
    type: 'event',
  },
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
];

export async function mcpRecentEvents(req: Request, res: Response) {
  try {
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS,
      EVENT_ABI,
      provider,
    );

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(1, currentBlock - 1000); // Last 1000 blocks

    const events: BlockchainEvent[] = [];

    try {
      // Get Payout events
      const payoutFilter = contract.filters.Payout();
      const payoutEvents = await contract.queryFilter(
        payoutFilter,
        fromBlock,
        currentBlock,
      );

      for (const event of payoutEvents) {
        if ('args' in event && event.args) {
          const block = await provider.getBlock(event.blockNumber);
          events.push({
            type: 'Payout',
            id: `payout-${event.transactionHash}-${event.index || 0}`,
            student: event.args[0] || 'Unknown',
            amount: event.args[1] ? ethers.formatEther(event.args[1]) : '0',
            timestamp: new Date(block!.timestamp * 1000),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      }

      // Get ScoreProof events
      const scoreFilter = contract.filters.ScoreProof();
      const scoreEvents = await contract.queryFilter(
        scoreFilter,
        fromBlock,
        currentBlock,
      );

      for (const event of scoreEvents) {
        if ('args' in event && event.args) {
          const block = await provider.getBlock(event.blockNumber);
          events.push({
            type: 'ScoreProof',
            id: `score-${event.transactionHash}-${event.index || 0}`,
            student: event.args[0] || 'Unknown',
            timestamp: new Date(block!.timestamp * 1000),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      }

      // Get FundsDeposited events
      const depositFilter = contract.filters.FundsDeposited();
      const depositEvents = await contract.queryFilter(
        depositFilter,
        fromBlock,
        currentBlock,
      );

      for (const event of depositEvents) {
        if ('args' in event && event.args) {
          const block = await provider.getBlock(event.blockNumber);
          events.push({
            type: 'Deposit',
            id: `deposit-${event.transactionHash}-${event.index || 0}`,
            amount: event.args[1] ? ethers.formatEther(event.args[1]) : '0',
            timestamp: new Date(block!.timestamp * 1000),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      }
    } catch (eventError) {
      console.warn('Error fetching some events:', eventError);
      // Continue with whatever events we got
    }

    // Sort events by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Return last 20 events
    const recentEvents = events.slice(0, 20);

    res.json(recentEvents);
  } catch (error) {
    console.error('Recent events error:', error);

    // Return empty array as fallback
    res.json([]);
  }
}
