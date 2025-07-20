import express from 'express';
import { ethers } from 'ethers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Sei Testnet configuration
const SEI_RPC_URL =
  process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com';
const SCHOLARSHIP_FUND_ADDRESS =
  process.env.VITE_SCHOLARSHIP_FUND_ADDRESS ||
  '0x25c21f7472c1110f073EA3e1A850cBf395D194d1';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

console.log('🔧 ProcessApplication Route Config:');
console.log('   SEI_RPC_URL:', SEI_RPC_URL);
console.log('   SCHOLARSHIP_FUND_ADDRESS:', SCHOLARSHIP_FUND_ADDRESS);
console.log(
  '   ADMIN_PRIVATE_KEY:',
  ADMIN_PRIVATE_KEY ? 'Set ✅' : 'Missing ❌',
);
console.log('');

// Contract ABI (simplified for the functions we need)
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
    name: 'verifyStudent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

interface StudentData {
  studentId: string;
  gpa: number;
  financialNeed: number;
  volunteerHours: number;
  academicYear: string;
  major: string;
  university: string;
  additionalInfo?: string;
  address: string;
}

interface MeritScoreResult {
  score: number;
  reasoning: string;
  breakdown: {
    gpaScore: number;
    financialNeedScore: number;
    volunteerScore: number;
    totalScore: number;
  };
  proofHash: string;
}

// Calculate merit score using Gemini AI
async function calculateMeritScore(
  studentData: StudentData,
): Promise<MeritScoreResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI scholarship assessment system for FineScholar. Calculate a fair merit score (0-100) for this student based on their academic and personal data.

SCORING CRITERIA:
- GPA Score (0-50 points): Based on GPA out of 4.0 scale
- Financial Need Score (0-30 points): Higher need = higher score (0-100 scale)  
- Volunteer Score (0-20 points): Based on volunteer hours

Student Data:
- Student ID: ${studentData.studentId}
- GPA: ${studentData.gpa}/4.0
- Financial Need: ${studentData.financialNeed}/100
- Volunteer Hours: ${studentData.volunteerHours}
- Academic Year: ${studentData.academicYear}
- Major: ${studentData.major}
- University: ${studentData.university}
- Additional Info: ${studentData.additionalInfo || 'None'}

Please respond with a JSON object in this exact format:
{
  "score": [final score 0-100],
  "reasoning": "[2-3 sentence explanation of the score]",
  "breakdown": {
    "gpaScore": [0-50],
    "financialNeedScore": [0-30], 
    "volunteerScore": [0-20],
    "totalScore": [sum of above]
  }
}

Be fair, consistent, and consider the holistic profile. Higher financial need should result in higher financial need scores.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to extract JSON from the response
    let parsedResult;
    try {
      // Look for JSON block in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // Fallback calculation
      parsedResult = {
        score: Math.min(
          100,
          Math.round(
            (studentData.gpa / 4.0) * 50 +
              (studentData.financialNeed / 100) * 30 +
              Math.min(studentData.volunteerHours / 5, 20),
          ),
        ),
        reasoning:
          'Score calculated using fallback algorithm due to AI parsing error.',
        breakdown: {
          gpaScore: Math.round((studentData.gpa / 4.0) * 50),
          financialNeedScore: Math.round(
            (studentData.financialNeed / 100) * 30,
          ),
          volunteerScore: Math.min(
            Math.round(studentData.volunteerHours / 5),
            20,
          ),
          totalScore: Math.min(
            100,
            Math.round(
              (studentData.gpa / 4.0) * 50 +
                (studentData.financialNeed / 100) * 30 +
                Math.min(studentData.volunteerHours / 5, 20),
            ),
          ),
        },
      };
    }

    // Generate proof hash for blockchain verification
    const dataForHash = JSON.stringify({
      ...studentData,
      score: parsedResult.score,
      timestamp: Date.now(),
    });
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes(dataForHash));

    return {
      ...parsedResult,
      proofHash,
    };
  } catch (error) {
    console.error('Error calculating merit score:', error);

    // Fallback calculation if AI fails
    const fallbackScore = Math.min(
      100,
      Math.round(
        (studentData.gpa / 4.0) * 50 +
          (studentData.financialNeed / 100) * 30 +
          Math.min(studentData.volunteerHours / 5, 20),
      ),
    );

    const dataForHash = JSON.stringify({
      ...studentData,
      score: fallbackScore,
      timestamp: Date.now(),
    });

    return {
      score: fallbackScore,
      reasoning:
        'Merit score calculated using backup algorithm. Based on weighted GPA (50%), financial need (30%), and volunteer hours (20%).',
      breakdown: {
        gpaScore: Math.round((studentData.gpa / 4.0) * 50),
        financialNeedScore: Math.round((studentData.financialNeed / 100) * 30),
        volunteerScore: Math.min(
          Math.round(studentData.volunteerHours / 5),
          20,
        ),
        totalScore: fallbackScore,
      },
      proofHash: ethers.keccak256(ethers.toUtf8Bytes(dataForHash)),
    };
  }
}

// Submit merit score to blockchain
async function submitToBlockchain(
  studentAddress: string,
  meritResult: MeritScoreResult,
): Promise<string> {
  if (!ADMIN_PRIVATE_KEY) {
    throw new Error('Admin private key not configured');
  }

  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    // Create contract instance
    const contract = new ethers.Contract(
      SCHOLARSHIP_FUND_ADDRESS,
      SCHOLARSHIP_FUND_ABI,
      adminWallet,
    );

    // First verify the student
    console.log('Verifying student:', studentAddress);
    const verifyTx = await contract.verifyStudent(studentAddress);
    await verifyTx.wait();
    console.log('Student verified:', verifyTx.hash);

    // Then set merit score
    console.log(
      'Setting merit score:',
      meritResult.score,
      'for',
      studentAddress,
    );
    const scoreTx = await contract.setMeritScore(
      studentAddress,
      meritResult.score,
      meritResult.proofHash,
    );

    const receipt = await scoreTx.wait();
    console.log('Merit score set on blockchain:', receipt.hash);

    return receipt.hash;
  } catch (error) {
    console.error('Blockchain submission error:', error);
    throw new Error(
      `Failed to submit to blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Main route handler
router.post('/process-application', async (req, res) => {
  try {
    console.log('Processing application for:', req.body.address);

    // Validate request data
    const studentData: StudentData = req.body;

    if (!studentData.address || !ethers.isAddress(studentData.address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student address',
      });
    }

    if (
      !studentData.studentId ||
      !studentData.gpa ||
      !studentData.major ||
      !studentData.university
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required student data',
      });
    }

    if (studentData.gpa < 0 || studentData.gpa > 4) {
      return res.status(400).json({
        success: false,
        error: 'GPA must be between 0 and 4.0',
      });
    }

    // Calculate merit score using AI
    console.log('Calculating merit score...');
    const meritResult = await calculateMeritScore(studentData);
    console.log('Merit score calculated:', meritResult.score);

    // Submit to blockchain
    console.log('Submitting to blockchain...');
    const transactionHash = await submitToBlockchain(
      studentData.address,
      meritResult,
    );
    console.log('Blockchain submission successful:', transactionHash);

    // Return success response
    res.json({
      success: true,
      transactionHash,
      meritScore: meritResult.score,
      breakdown: meritResult.breakdown,
      reasoning: meritResult.reasoning,
      proofHash: meritResult.proofHash,
      message: 'Application processed successfully',
    });
  } catch (error) {
    console.error('Application processing error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to process application',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

export { router as processApplicationRoute };
