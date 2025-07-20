import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

interface StudentData {
  studentId: string;
  address: string;
  gpa: number;
  financialNeed: number;
  volunteerHours: number;
  academicYear: string;
  major: string;
  university: string;
  additionalInfo?: string;
}

interface ProcessingResult {
  success: boolean;
  studentId: string;
  score?: number;
  error?: string;
  transactionHash?: string;
  meritResult?: any;
}

// Initialize AI and blockchain
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const SCHOLARSHIP_FUND_ADDRESS =
  process.env.VITE_SCHOLARSHIP_FUND_ADDRESS ||
  '0x25c21f7472c1110f073EA3e1A850cBf395D194d1';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const SEI_RPC_URL =
  process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com';

const CONTRACT_ABI = [
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

export async function mcpProcessStudent(req: Request, res: Response) {
  try {
    const studentData: StudentData = req.body;

    // Validate required fields
    if (!studentData.address || !studentData.gpa || !studentData.studentId) {
      return res.status(400).json({
        success: false,
        studentId: studentData.studentId,
        error: 'Missing required fields: address, gpa, studentId',
      });
    }

    // Validate address format
    try {
      // First check if it's a valid hex address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(studentData.address)) {
        throw new Error('Invalid address format');
      }
      // Try to get checksum address
      ethers.getAddress(studentData.address);
    } catch (addressError) {
      return res.status(400).json({
        success: false,
        studentId: studentData.studentId,
        error: `Invalid address format: ${studentData.address}. Please ensure it's a valid Ethereum address.`,
      });
    }

    // Step 1: Calculate merit score using the same logic as the calculate-merit endpoint
    const meritResult = await calculateMeritScore(studentData);

    // Step 2: Submit to blockchain (if admin key is available)
    let transactionHash: string | undefined;
    let blockchainError: string | undefined;

    if (ADMIN_PRIVATE_KEY && meritResult.score > 0) {
      try {
        const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(
          SCHOLARSHIP_FUND_ADDRESS,
          CONTRACT_ABI,
          wallet,
        );

        // Ensure address is properly checksummed
        const checksummedAddress = ethers.getAddress(studentData.address);

        // First verify the student
        const verifyTx = await contract.verifyStudent(checksummedAddress);
        await verifyTx.wait();

        // Then set merit score
        const scoreTx = await contract.setMeritScore(
          checksummedAddress,
          Math.floor(meritResult.score),
          meritResult.proofHash,
        );

        const receipt = await scoreTx.wait();
        transactionHash = receipt.hash;

        console.log(
          `Student application processed: ${studentData.studentId}, Score: ${meritResult.score}, TX: ${transactionHash}`,
        );
      } catch (error) {
        console.error('Blockchain submission failed:', error);
        blockchainError =
          error instanceof Error
            ? error.message
            : 'Blockchain submission failed';
      }
    }

    // Determine if application was truly successful
    const applicationSuccess = transactionHash !== undefined;

    const result: ProcessingResult = {
      success: applicationSuccess,
      studentId: studentData.studentId,
      score: meritResult.score,
      transactionHash,
      meritResult,
      error:
        blockchainError && !applicationSuccess ? blockchainError : undefined,
    };

    // Return appropriate HTTP status based on success
    if (!applicationSuccess && blockchainError) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Student processing error:', error);
    res.status(500).json({
      success: false,
      studentId: req.body.studentId,
      error: error instanceof Error ? error.message : 'Processing failed',
    });
  }
}

async function calculateMeritScore(studentData: StudentData) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Calculate a comprehensive merit score (0-100) for a scholarship application with detailed breakdown.
        
        Student Profile:
        - GPA: ${studentData.gpa}/4.0
        - Financial Need: ${studentData.financialNeed}/100
        - Volunteer Hours: ${studentData.volunteerHours}
        - Academic Year: ${studentData.academicYear}
        - Major: ${studentData.major}
        - University: ${studentData.university}
        - Additional Info: ${studentData.additionalInfo || 'None'}
        
        Scoring Criteria:
        - GPA Score: 0-50 points (50% weight) - Higher GPA = higher score
        - Financial Need: 0-30 points (30% weight) - Higher need = higher score  
        - Volunteer Experience: 0-20 points (20% weight) - More hours = higher score
        
        Please provide:
        1. Individual component scores
        2. Total merit score (0-100)
        3. Detailed reasoning explaining the assessment
        
        Format your response as JSON with this structure:
        {
          "gpaScore": number,
          "financialNeedScore": number,
          "volunteerScore": number, 
          "totalScore": number,
          "reasoning": "detailed explanation"
        }
      `;

      const aiResult = await model.generateContent(prompt);
      const response = aiResult.response.text();

      // Parse AI response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiScores = JSON.parse(cleanResponse);

      return {
        score: Math.min(100, Math.max(0, aiScores.totalScore)),
        reasoning: aiScores.reasoning,
        breakdown: {
          gpaScore: Math.min(50, Math.max(0, aiScores.gpaScore)),
          financialNeedScore: Math.min(
            30,
            Math.max(0, aiScores.financialNeedScore),
          ),
          volunteerScore: Math.min(20, Math.max(0, aiScores.volunteerScore)),
          totalScore: Math.min(100, Math.max(0, aiScores.totalScore)),
        },
        proofHash: generateProofHash(studentData, aiScores.totalScore),
      };
    } catch (aiError) {
      console.warn('AI calculation failed, using fallback:', aiError);
      return calculateFallbackMerit(studentData);
    }
  } else {
    return calculateFallbackMerit(studentData);
  }
}

function calculateFallbackMerit(studentData: StudentData) {
  // Calculate component scores using mathematical formulas
  const gpaScore = Math.round((studentData.gpa / 4.0) * 50);
  const financialNeedScore = Math.round((studentData.financialNeed / 100) * 30);
  const volunteerScore = Math.round(
    Math.min(studentData.volunteerHours / 200, 1) * 20,
  );
  const totalScore = gpaScore + financialNeedScore + volunteerScore;

  let reasoning = `Merit score calculated using academic and financial criteria: `;
  reasoning += `GPA score: ${gpaScore}/50 (${studentData.gpa.toFixed(1)}/4.0), `;
  reasoning += `Financial need: ${financialNeedScore}/30 (${studentData.financialNeed}% need), `;
  reasoning += `Volunteer service: ${volunteerScore}/20 (${studentData.volunteerHours} hours). `;

  if (totalScore >= 80) {
    reasoning += `Excellent candidate with strong academic performance and significant need/service.`;
  } else if (totalScore >= 60) {
    reasoning += `Good candidate with solid qualifications for scholarship support.`;
  } else {
    reasoning += `Potential candidate who could benefit from scholarship assistance.`;
  }

  return {
    score: totalScore,
    reasoning,
    breakdown: {
      gpaScore,
      financialNeedScore,
      volunteerScore,
      totalScore,
    },
    proofHash: generateProofHash(studentData, totalScore),
  };
}

function generateProofHash(studentData: StudentData, score: number): string {
  // Generate a deterministic hash for the proof
  const dataString = JSON.stringify({
    studentId: studentData.studentId,
    gpa: studentData.gpa,
    financialNeed: studentData.financialNeed,
    volunteerHours: studentData.volunteerHours,
    score,
    timestamp: Math.floor(Date.now() / 1000),
  });

  return '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
}
