import { ethers } from 'ethers';
import {
  GeminiMeritCalculator,
  type StudentData,
  type MeritScoreResult,
} from './geminiAI';

// Import configuration
import { getNetworkConfig } from '../config/mcpConfig';

// Simplified ABI (you'll need to copy this from your compiled contracts)
const SCHOLARSHIP_FUND_ABI = [
  'function admin() view returns (address)',
  'function setMeritScore(address student, uint256 score, bytes32 proofHash) external',
  'function verifyStudent(address student) external',
  'function distributeScholarship(address student) external',
  'function isStudentVerified(address student) view returns (bool)',
  'function getStudentMeritScore(address student) view returns (uint256)',
  'function totalFunds() view returns (uint256)',
  'function depositFunds() payable external',
  'event ScoreProof(address indexed student, uint256 score, bytes32 proofHash)',
  'event Payout(address indexed student, uint256 amount)',
];

export interface SeiMCPConfig {
  rpcEndpoint: string;
  chainId: number;
  scholarshipFundAddress: string;
  enrollmentNFTAddress?: string;
  geminiApiKey: string;
  adminPrivateKey?: string;
}

export interface ProcessingResult {
  success: boolean;
  studentId: string;
  score?: number;
  error?: string;
  transactionHash?: string;
  meritResult?: MeritScoreResult;
}

/**
 * Main service class for integrating Sei MCP Kit with Gemini AI
 * Orchestrates the complete scholarship allocation workflow
 */
export class SeiMCPService {
  private provider: ethers.JsonRpcProvider;
  private adminWallet?: ethers.Wallet;
  private scholarshipContract: ethers.Contract;
  private geminiCalculator: GeminiMeritCalculator;
  private config: SeiMCPConfig;

  constructor(config: SeiMCPConfig) {
    this.config = config;

    // Initialize blockchain provider
    this.provider = new ethers.JsonRpcProvider(config.rpcEndpoint);

    // Initialize admin wallet if private key provided
    if (config.adminPrivateKey) {
      this.adminWallet = new ethers.Wallet(
        config.adminPrivateKey,
        this.provider,
      );
    }

    // Initialize scholarship contract
    this.scholarshipContract = new ethers.Contract(
      config.scholarshipFundAddress,
      SCHOLARSHIP_FUND_ABI,
      this.adminWallet || this.provider,
    );

    // Initialize Gemini AI calculator
    this.geminiCalculator = new GeminiMeritCalculator(config.geminiApiKey);

    console.log('🔗 Connected to Sei RPC:', config.rpcEndpoint);
    if (this.adminWallet) {
      console.log('👤 Admin wallet connected:', this.adminWallet.address);
    }
    console.log('🤖 Gemini AI calculator initialized');
  }

  /**
   * Factory method to create SeiMCPService from environment
   */
  static async fromEnvironment(): Promise<SeiMCPService> {
    const networkConfig = getNetworkConfig();

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const privateKey = process.env.PRIVATE_KEY;
    const scholarshipFundAddress = process.env.SCHOLARSHIP_FUND_ADDRESS;

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    if (!scholarshipFundAddress) {
      throw new Error('SCHOLARSHIP_FUND_ADDRESS is required');
    }

    const config: SeiMCPConfig = {
      rpcEndpoint: networkConfig.rpcEndpoint,
      chainId: networkConfig.chainId,
      scholarshipFundAddress: scholarshipFundAddress,
      geminiApiKey: geminiApiKey,
      adminPrivateKey: privateKey,
    };

    return new SeiMCPService(config);
  }

  /**
   * Main workflow: Process a student application end-to-end
   * 1. Validate student data
   * 2. Verify student on blockchain
   * 3. Calculate merit score with Gemini AI
   * 4. Submit score to blockchain
   */
  async processStudentApplication(
    studentData: StudentData,
  ): Promise<ProcessingResult> {
    console.log(
      '🚀 Processing student application for:',
      studentData.studentId,
    );

    try {
      // Step 1: Validate student data
      this.geminiCalculator.validateStudentData(studentData);

      // Step 2: Check if student is verified on blockchain
      const isVerified = await this.isStudentVerified(studentData.address);
      if (!isVerified) {
        console.log('⚠️ Student not verified, verifying now...');
        await this.verifyStudent(studentData.address);
      }

      // Step 3: Calculate merit score using Gemini AI
      console.log('🧮 Calculating merit score with Gemini AI...');
      const meritResult =
        await this.geminiCalculator.calculateMeritScore(studentData);

      // Step 4: Submit merit score to blockchain
      console.log('⛓️ Submitting merit score to Sei blockchain...');
      const txResult = await this.setMeritScoreOnChain(
        studentData.address,
        meritResult.score,
        meritResult.proofHash,
      );

      console.log('✅ Student application processed successfully!');
      return {
        success: true,
        studentId: studentData.studentId,
        score: meritResult.score,
        transactionHash: txResult.hash,
        meritResult,
      };
    } catch (error) {
      console.error('❌ Error processing student application:', error);
      return {
        success: false,
        studentId: studentData.studentId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if a student is verified on the blockchain
   */
  async isStudentVerified(studentAddress: string): Promise<boolean> {
    try {
      // Ensure address is valid and properly formatted
      if (!ethers.isAddress(studentAddress)) {
        console.error('Invalid address format:', studentAddress);
        return false;
      }

      // Use getAddress to ensure proper checksum format
      const checksumAddress = ethers.getAddress(studentAddress);
      return await this.scholarshipContract.isStudentVerified(checksumAddress);
    } catch (error) {
      console.error('Error checking student verification:', error);
      return false;
    }
  }

  /**
   * Verify a student on the blockchain (admin only)
   */
  async verifyStudent(
    studentAddress: string,
  ): Promise<ethers.TransactionResponse> {
    if (!this.adminWallet) {
      throw new Error('Admin wallet required for student verification');
    }

    // Validate and format address
    if (!ethers.isAddress(studentAddress)) {
      throw new Error(`Invalid address format: ${studentAddress}`);
    }

    const checksumAddress = ethers.getAddress(studentAddress);
    console.log('📋 Verifying student on blockchain:', checksumAddress);

    const tx = await this.scholarshipContract.verifyStudent(checksumAddress);
    await tx.wait();
    console.log('✅ Student verified:', tx.hash);
    return tx;
  }

  /**
   * Set merit score on the blockchain with proof hash
   */
  async setMeritScoreOnChain(
    studentAddress: string,
    score: number,
    proofHash: string,
  ): Promise<ethers.TransactionResponse> {
    if (!this.adminWallet) {
      throw new Error('Admin wallet required for setting merit scores');
    }

    // Validate and format address
    if (!ethers.isAddress(studentAddress)) {
      throw new Error(`Invalid address format: ${studentAddress}`);
    }

    const checksumAddress = ethers.getAddress(studentAddress);

    console.log(
      `📊 Setting merit score: ${score} for student: ${checksumAddress}`,
    );

    // Convert proof hash to bytes32 format if needed
    const proofHashBytes32 = proofHash.startsWith('0x')
      ? proofHash.padEnd(66, '0')
      : `0x${proofHash.padEnd(64, '0')}`;

    const tx = await this.scholarshipContract.setMeritScore(
      checksumAddress,
      score,
      proofHashBytes32,
    );

    const receipt = await tx.wait();
    console.log('✅ Merit score set on blockchain:', tx.hash);
    console.log('⛽ Gas used:', receipt?.gasUsed.toString());

    return tx;
  }

  /**
   * Distribute scholarship to student (admin only)
   */
  async distributeScholarship(
    studentAddress: string,
  ): Promise<ethers.TransactionResponse> {
    if (!this.adminWallet) {
      throw new Error('Admin wallet required for scholarship distribution');
    }

    // Validate and format address
    if (!ethers.isAddress(studentAddress)) {
      throw new Error(`Invalid address format: ${studentAddress}`);
    }

    const checksumAddress = ethers.getAddress(studentAddress);

    console.log('💰 Distributing scholarship to:', checksumAddress);
    const tx =
      await this.scholarshipContract.distributeScholarship(checksumAddress);
    await tx.wait();
    console.log('✅ Scholarship distributed:', tx.hash);
    return tx;
  }

  /**
   * Get student's current merit score from blockchain
   */
  async getStudentMeritScore(studentAddress: string): Promise<number> {
    try {
      // Validate and format address
      if (!ethers.isAddress(studentAddress)) {
        console.error('Invalid address format:', studentAddress);
        return 0;
      }

      const checksumAddress = ethers.getAddress(studentAddress);
      const score =
        await this.scholarshipContract.getStudentMeritScore(checksumAddress);
      return Number(score);
    } catch (error) {
      console.error('Error getting student merit score:', error);
      return 0;
    }
  }

  /**
   * Get total funds available in the scholarship pool
   */
  async getTotalFunds(): Promise<string> {
    try {
      const funds = await this.scholarshipContract.totalFunds();
      return ethers.formatEther(funds);
    } catch (error) {
      console.error('Error getting total funds:', error);
      return '0';
    }
  }

  /**
   * Deposit funds to the scholarship pool
   */
  async depositFunds(amount: string): Promise<ethers.TransactionResponse> {
    if (!this.adminWallet) {
      throw new Error('Wallet required for depositing funds');
    }

    const amountWei = ethers.parseEther(amount);
    console.log('💳 Depositing funds:', amount, 'SEI');

    const tx = await this.scholarshipContract.depositFunds({
      value: amountWei,
    });
    await tx.wait();
    console.log('✅ Funds deposited:', tx.hash);
    return tx;
  }

  /**
   * Batch process multiple student applications
   */
  async batchProcessStudents(
    studentsData: StudentData[],
  ): Promise<ProcessingResult[]> {
    console.log('📦 Batch processing', studentsData.length, 'students');
    const results: ProcessingResult[] = [];

    for (const studentData of studentsData) {
      try {
        const result = await this.processStudentApplication(studentData);
        results.push(result);

        // Add delay between transactions to avoid rate limiting
        if (result.success) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(
          `❌ Failed to process student ${studentData.studentId}:`,
          error,
        );
        results.push({
          success: false,
          studentId: studentData.studentId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.log(`📊 Batch processing complete: ${results.length} results`);
    return results;
  }

  /**
   * Get network information and admin balance
   */
  async getNetworkInfo(): Promise<{
    chainId: number;
    blockNumber: number;
    adminBalance?: string;
    contractAddress: string;
  }> {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();

    let adminBalance: string | undefined;
    if (this.adminWallet) {
      const balance = await this.provider.getBalance(this.adminWallet.address);
      adminBalance = ethers.formatEther(balance);
    }

    return {
      chainId: Number(network.chainId),
      blockNumber,
      adminBalance,
      contractAddress: this.config.scholarshipFundAddress,
    };
  }

  /**
   * Listen for blockchain events
   */
  async startEventListening(): Promise<void> {
    console.log('🎧 Starting event listener for scholarship contract...');

    this.scholarshipContract.on(
      'ScoreProof',
      (student, score, proofHash, event) => {
        console.log('🎯 ScoreProof Event:', {
          student,
          score: score.toString(),
          proofHash,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      },
    );

    this.scholarshipContract.on('Payout', (student, amount, event) => {
      console.log('💰 Payout Event:', {
        student,
        amount: ethers.formatEther(amount),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      });
    });
  }

  /**
   * Stop event listening
   */
  stopEventListening(): void {
    console.log('🔇 Stopping event listeners...');
    this.scholarshipContract.removeAllListeners();
  }

  /**
   * Calculate merit score using AI only (no blockchain interaction)
   */
  async calculateMeritScoreOnly(
    studentData: StudentData,
  ): Promise<MeritScoreResult> {
    this.geminiCalculator.validateStudentData(studentData);
    return await this.geminiCalculator.calculateMeritScore(studentData);
  }

  /**
   * Test network connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      console.log(
        '✅ Network connection successful! Latest block:',
        blockNumber,
      );
      return true;
    } catch (error) {
      console.error('❌ Network connection failed:', error);
      return false;
    }
  }
}

export default SeiMCPService;
