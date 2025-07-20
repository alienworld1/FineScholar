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
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const ENROLLMENT_NFT_ADDRESS = process.env.VITE_ENROLLMENT_NFT_ADDRESS;
const SCHOLARSHIP_FUND_ADDRESS = process.env.VITE_SCHOLARSHIP_FUND_ADDRESS;

// Contract ABIs
const ENROLLMENT_NFT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'string', name: 'university', type: 'string' },
      { internalType: 'string', name: 'studentId', type: 'string' },
    ],
    name: 'mintEnrollmentNFT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'getEnrollmentData',
    outputs: [
      { internalType: 'string', name: 'university', type: 'string' },
      { internalType: 'string', name: 'studentId', type: 'string' },
      { internalType: 'uint256', name: 'enrollmentDate', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const SCHOLARSHIP_FUND_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'student', type: 'address' },
      { internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
    ],
    name: 'verifyStudentByDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Store pending NFT requests (in production, use a database)
const pendingNFTRequests = new Map();

// Request enrollment NFT
router.post('/enrollment/request-nft', async (req, res) => {
  try {
    const { studentAddress, university, studentId } = req.body;

    if (!studentAddress || !university || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: studentAddress, university, studentId',
      });
    }

    if (!ethers.isAddress(studentAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student address',
      });
    }

    // Store the request for admin review
    const requestId = `${studentAddress}-${Date.now()}`;
    pendingNFTRequests.set(requestId, {
      studentAddress,
      university,
      studentId,
      timestamp: new Date(),
      status: 'pending',
    });

    // In production, this would trigger an admin notification
    // For demo purposes, we'll auto-approve after a short delay
    setTimeout(async () => {
      try {
        await mintEnrollmentNFT(studentAddress, university, studentId);
        pendingNFTRequests.set(requestId, {
          ...pendingNFTRequests.get(requestId),
          status: 'approved',
        });
      } catch (error) {
        console.error('Auto-mint failed:', error);
        pendingNFTRequests.set(requestId, {
          ...pendingNFTRequests.get(requestId),
          status: 'failed',
        });
      }
    }, 2000); // 2 second delay for demo

    res.json({
      success: true,
      message: 'NFT request submitted successfully',
      requestId,
    });
  } catch (error) {
    console.error('NFT request failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit NFT request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Verify document hash
router.post('/enrollment/verify-document', async (req, res) => {
  try {
    const { studentAddress, documentHash, fileName, fileSize } = req.body;

    if (!studentAddress || !documentHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: studentAddress, documentHash',
      });
    }

    if (!ethers.isAddress(studentAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student address',
      });
    }

    if (!documentHash.startsWith('0x') || documentHash.length !== 66) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document hash format',
      });
    }

    if (!ADMIN_PRIVATE_KEY || !SCHOLARSHIP_FUND_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS,
      SCHOLARSHIP_FUND_ABI,
      adminWallet,
    );

    // Verify student by document hash
    const tx = await contract.verifyStudentByDocument(
      studentAddress,
      documentHash,
    );
    await tx.wait();

    res.json({
      success: true,
      message: 'Document verified and student approved',
      transactionHash: tx.hash,
      documentInfo: {
        fileName,
        fileSize,
        hash: documentHash,
      },
    });
  } catch (error) {
    console.error('Document verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get enrollment data for a token
router.get('/enrollment/token-data/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId || isNaN(Number(tokenId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID',
      });
    }

    if (!ENROLLMENT_NFT_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'Enrollment NFT address not configured',
      });
    }

    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const contract = new ethers.Contract(
      ENROLLMENT_NFT_ADDRESS,
      ENROLLMENT_NFT_ABI,
      provider,
    );

    const [university, studentId, enrollmentDate, isActive] =
      await contract.getEnrollmentData(tokenId);

    res.json({
      success: true,
      data: {
        university,
        studentId,
        enrollmentDate: new Date(Number(enrollmentDate) * 1000).toISOString(),
        isActive,
        tokenId: Number(tokenId),
      },
    });
  } catch (error) {
    console.error('Failed to get enrollment data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get enrollment data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin function to mint NFT
async function mintEnrollmentNFT(
  studentAddress: string,
  university: string,
  studentId: string,
) {
  if (!ADMIN_PRIVATE_KEY || !ENROLLMENT_NFT_ADDRESS) {
    throw new Error('Missing configuration for NFT minting');
  }

  const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    ENROLLMENT_NFT_ADDRESS,
    ENROLLMENT_NFT_ABI,
    adminWallet,
  );

  const tx = await contract.mintEnrollmentNFT(
    studentAddress,
    university,
    studentId,
  );
  await tx.wait();

  return tx.hash;
}

export { router as enrollmentRoute };
