import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const router = express.Router();

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Sei Testnet configuration
const SEI_RPC_URL =
  process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const SCHOLARSHIP_FUND_ADDRESS = process.env.VITE_SCHOLARSHIP_FUND_ADDRESS;

// Smart contract ABI
const SCHOLARSHIP_FUND_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'student', type: 'address' },
      { internalType: 'uint256', name: 'score', type: 'uint256' },
      { internalType: 'bytes32', name: 'proofHash', type: 'bytes32' },
    ],
    name: 'setMeritScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'distributeScholarship',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalFunds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
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
    ],
    name: 'Payout',
    type: 'event',
  },
];

// In-memory storage for demo (in production, use a proper database)
const applicationStorage = {
  pending: new Map(),
  approved: new Map(),
  rejected: new Map(),
  distributed: new Map(),
};

// Load applications from file system (simple persistence)
const STORAGE_FILE = path.join(__dirname, '..', 'data', 'applications.json');

async function loadApplicationsFromStorage() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    applicationStorage.pending = new Map(parsed.pending || []);
    applicationStorage.approved = new Map(parsed.approved || []);
    applicationStorage.rejected = new Map(parsed.rejected || []);
    applicationStorage.distributed = new Map(parsed.distributed || []);
  } catch (error) {
    // File doesn't exist or is invalid, start with empty storage
    console.log('Starting with empty application storage');
  }
}

async function saveApplicationsToStorage() {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });

    const data = {
      pending: Array.from(applicationStorage.pending.entries()),
      approved: Array.from(applicationStorage.approved.entries()),
      rejected: Array.from(applicationStorage.rejected.entries()),
      distributed: Array.from(applicationStorage.distributed.entries()),
    };

    await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save applications to storage:', error);
  }
}

// Initialize storage on startup
loadApplicationsFromStorage();

// Helper function to safely convert merit score to blockchain-compatible integer
function safeConvertMeritScore(score: number): number {
  // Ensure score is a valid number
  if (typeof score !== 'number' || isNaN(score)) {
    throw new Error('Merit score must be a valid number');
  }

  // Clamp score to valid range (0-100) and convert to integer
  const clampedScore = Math.max(0, Math.min(100, score));
  return Math.floor(clampedScore);
}

// Helper function to calculate estimated scholarship amount based on contract logic
async function calculateEstimatedAmount(meritScore: number): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS!,
      SCHOLARSHIP_FUND_ABI,
      provider,
    );

    // Get current total funds from contract
    const totalFunds = await contract.totalFunds();
    const totalFundsInEther = parseFloat(ethers.formatEther(totalFunds));

    // Use the same calculation as the smart contract
    // amount = (totalFunds * meritScore) / 10000
    const meritScoreInt = safeConvertMeritScore(meritScore);
    const estimatedAmount = (totalFundsInEther * meritScoreInt) / 10000;

    return estimatedAmount.toFixed(3);
  } catch (error) {
    console.error('Failed to calculate estimated amount:', error);
    // Fallback to a basic estimation if contract call fails
    return ((meritScore / 100) * 0.001).toFixed(3); // More conservative fallback
  }
}

// Helper function to parse the actual distribution amount from transaction receipt
function parsePayoutAmount(receipt: any): string | null {
  try {
    // Find the Payout event in the transaction receipt
    const contract = new ethers.Interface(SCHOLARSHIP_FUND_ABI);

    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.parseLog(log);
        if (parsedLog && parsedLog.name === 'Payout') {
          // Return the amount in ETH format
          return ethers.formatEther(parsedLog.args.amount);
        }
      } catch (e) {
        // Skip logs that don't match our contract
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to parse payout amount from receipt:', error);
    return null;
  }
}

// Get all applications for admin review
router.get('/admin/applications', async (req, res) => {
  try {
    const pending = Array.from(applicationStorage.pending.values());
    const approved = Array.from(applicationStorage.approved.values());
    const rejected = Array.from(applicationStorage.rejected.values());
    const distributed = Array.from(applicationStorage.distributed.values());

    // Recalculate estimated amounts for pending applications based on current funds
    for (const application of pending) {
      try {
        const newEstimate = await calculateEstimatedAmount(
          application.meritScore,
        );
        application.estimatedAmount = newEstimate;
      } catch (error) {
        // Keep existing estimate if calculation fails
        console.warn(
          `Failed to update estimate for application ${application.id}:`,
          error,
        );
      }
    }

    // Also update estimates for approved applications that haven't been distributed
    for (const application of approved) {
      try {
        const newEstimate = await calculateEstimatedAmount(
          application.meritScore,
        );
        application.estimatedAmount = newEstimate;
      } catch (error) {
        console.warn(
          `Failed to update estimate for application ${application.id}:`,
          error,
        );
      }
    }

    res.json({
      success: true,
      data: {
        pending: pending.sort(
          (a, b) =>
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime(),
        ),
        approved: approved.sort(
          (a, b) =>
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime(),
        ),
        rejected: rejected.sort(
          (a, b) =>
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime(),
        ),
        distributed: distributed.sort(
          (a, b) =>
            new Date(b.submissionDate).getTime() -
            new Date(a.submissionDate).getTime(),
        ),
        summary: {
          totalPending: pending.length,
          totalApproved: approved.length,
          totalRejected: rejected.length,
          totalDistributed: distributed.length,
        },
      },
    });
  } catch (error) {
    console.error('Failed to get applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applications',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Approve scholarship application
router.post('/admin/approve-scholarship', async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Application ID is required',
      });
    }

    const application = applicationStorage.pending.get(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    if (!ADMIN_PRIVATE_KEY || !SCHOLARSHIP_FUND_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    // Connect to blockchain and set merit score
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS,
      SCHOLARSHIP_FUND_ABI,
      adminWallet,
    );

    // Convert merit score to integer for blockchain (smart contracts expect uint256)
    const meritScoreInt = safeConvertMeritScore(application.meritScore);

    // Create proof hash for the approval
    const proofData = {
      applicationId,
      studentAddress: application.studentAddress,
      meritScore: meritScoreInt,
      timestamp: Date.now(),
      approvedBy: 'admin',
    };
    const proofHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(proofData)),
    );

    // Set merit score on blockchain (use integer version)
    const tx = await contract.setMeritScore(
      application.studentAddress,
      meritScoreInt,
      proofHash,
    );
    await tx.wait();

    // Move application from pending to approved
    application.status = 'approved';
    application.approvalDate = new Date().toISOString();
    application.approvalTxHash = tx.hash;
    application.proofHash = proofHash;
    application.blockchainMeritScore = meritScoreInt; // Store the integer version used on blockchain

    applicationStorage.approved.set(applicationId, application);
    applicationStorage.pending.delete(applicationId);

    // Save to persistent storage
    await saveApplicationsToStorage();

    res.json({
      success: true,
      message: 'Scholarship approved successfully',
      transactionHash: tx.hash,
      proofHash: proofHash,
      application: application,
    });
  } catch (error) {
    console.error('Failed to approve scholarship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve scholarship',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Reject scholarship application
router.post('/admin/reject-scholarship', async (req, res) => {
  try {
    const { applicationId, reason } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Application ID is required',
      });
    }

    const application = applicationStorage.pending.get(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Move application from pending to rejected
    application.status = 'rejected';
    application.rejectionDate = new Date().toISOString();
    application.rejectionReason = reason || 'No reason provided';

    applicationStorage.rejected.set(applicationId, application);
    applicationStorage.pending.delete(applicationId);

    // Save to persistent storage
    await saveApplicationsToStorage();

    res.json({
      success: true,
      message: 'Application rejected',
      application: application,
    });
  } catch (error) {
    console.error('Failed to reject application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject application',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Distribute scholarship to approved student
router.post('/admin/distribute-scholarship', async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Application ID is required',
      });
    }

    const application = applicationStorage.approved.get(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Approved application not found',
      });
    }

    if (!ADMIN_PRIVATE_KEY || !SCHOLARSHIP_FUND_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    // Connect to blockchain and distribute scholarship
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS,
      SCHOLARSHIP_FUND_ABI,
      adminWallet,
    );

    // Distribute scholarship
    const tx = await contract.distributeScholarship(application.studentAddress);
    const receipt = await tx.wait();

    // Get the actual amount distributed from the transaction receipt
    const actualAmount = parsePayoutAmount(receipt);
    const distributedAmount = actualAmount || application.estimatedAmount; // Fallback to estimated if parsing fails

    // Move application from approved to distributed
    application.status = 'distributed';
    application.distributionDate = new Date().toISOString();
    application.distributionTxHash = tx.hash;
    application.actualAmount = distributedAmount;

    applicationStorage.distributed.set(applicationId, application);
    applicationStorage.approved.delete(applicationId);

    // Save to persistent storage
    await saveApplicationsToStorage();

    res.json({
      success: true,
      message: 'Scholarship distributed successfully',
      transactionHash: tx.hash,
      amount: distributedAmount,
      application: application,
    });
  } catch (error) {
    console.error('Failed to distribute scholarship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to distribute scholarship',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get public scholarship distributions (for transparency)
router.get('/scholarships/distributions', async (req, res) => {
  try {
    const distributed = Array.from(applicationStorage.distributed.values());

    // Return public information only (anonymize personal details)
    const publicDistributions = distributed.map(app => ({
      id: app.id,
      university: app.university,
      major: app.major,
      meritScore: app.meritScore,
      amount: app.actualAmount || app.estimatedAmount,
      distributionDate: app.distributionDate,
      transactionHash: app.distributionTxHash,
      studentAddress:
        app.studentAddress.slice(0, 6) + '...' + app.studentAddress.slice(-4), // Anonymize
    }));

    res.json({
      success: true,
      data: {
        distributions: publicDistributions.sort(
          (a, b) =>
            new Date(b.distributionDate || 0).getTime() -
            new Date(a.distributionDate || 0).getTime(),
        ),
        totalDistributed: publicDistributions.reduce(
          (sum, dist) => sum + parseFloat(dist.amount || '0'),
          0,
        ),
        studentsHelped: publicDistributions.length,
      },
    });
  } catch (error) {
    console.error('Failed to get distributions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve distributions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Store application (called when student submits)
export async function storeApplication(applicationData: any) {
  const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Calculate estimated amount using the same logic as the smart contract
  const estimatedAmount = await calculateEstimatedAmount(
    applicationData.meritScore,
  );

  const application = {
    ...applicationData,
    id: applicationId,
    status: 'pending',
    submissionDate: new Date().toISOString(),
    estimatedAmount: estimatedAmount,
  };

  applicationStorage.pending.set(applicationId, application);
  saveApplicationsToStorage(); // Save asynchronously

  return applicationId;
}

export { router as adminRoute };
