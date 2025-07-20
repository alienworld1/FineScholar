import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState } from 'react';
import api from '../utils/api';

// Import contract ABIs and addresses
const SCHOLARSHIP_FUND_ADDRESS =
  import.meta.env.VITE_SCHOLARSHIP_FUND_ADDRESS ||
  '0x25c21f7472c1110f073EA3e1A850cBf395D194d1';
const ENROLLMENT_NFT_ADDRESS =
  import.meta.env.VITE_ENROLLMENT_NFT_ADDRESS ||
  '0xE6CEFb918b3770305219D4eA32AB7589306e9Fa5';

const SCHOLARSHIP_FUND_ABI = [
  {
    inputs: [],
    name: 'admin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'isStudentVerified',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'getStudentMeritScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'hasStudentReceivedScholarship',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'depositFunds',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const ENROLLMENT_NFT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'hasActiveEnrollment',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface StudentData {
  studentId: string;
  gpa: number;
  financialNeed: number;
  volunteerHours: number;
  academicYear: string;
  major: string;
  university: string;
  additionalInfo?: string;
}

export interface MeritScoreResult {
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

export function useScholarshipContract() {
  const { authenticated } = usePrivy();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read contract data using wagmi hooks
  const { data: isVerified, refetch: refetchVerification } = useReadContract({
    address: SCHOLARSHIP_FUND_ADDRESS as `0x${string}`,
    abi: SCHOLARSHIP_FUND_ABI,
    functionName: 'isStudentVerified',
    args: address ? [address] : undefined,
  });

  const { data: meritScore, refetch: refetchMeritScore } = useReadContract({
    address: SCHOLARSHIP_FUND_ADDRESS as `0x${string}`,
    abi: SCHOLARSHIP_FUND_ABI,
    functionName: 'getStudentMeritScore',
    args: address ? [address] : undefined,
  });

  const { data: hasReceivedScholarship, refetch: refetchScholarshipStatus } =
    useReadContract({
      address: SCHOLARSHIP_FUND_ADDRESS as `0x${string}`,
      abi: SCHOLARSHIP_FUND_ABI,
      functionName: 'hasStudentReceivedScholarship',
      args: address ? [address] : undefined,
    });

  const { data: totalFunds, refetch: refetchTotalFunds } = useReadContract({
    address: SCHOLARSHIP_FUND_ADDRESS as `0x${string}`,
    abi: SCHOLARSHIP_FUND_ABI,
    functionName: 'totalFunds',
  });

  const { data: hasEnrollmentNFT } = useReadContract({
    address: ENROLLMENT_NFT_ADDRESS as `0x${string}`,
    abi: ENROLLMENT_NFT_ABI,
    functionName: 'hasActiveEnrollment',
    args: address ? [address] : undefined,
  });

  // Student functions
  const checkVerificationStatus = async (): Promise<boolean> => {
    await refetchVerification();
    return Boolean(isVerified);
  };

  const getMeritScore = async (): Promise<number> => {
    await refetchMeritScore();
    return Number(meritScore || 0);
  };

  const checkScholarshipStatus = async (): Promise<boolean> => {
    await refetchScholarshipStatus();
    return Boolean(hasReceivedScholarship);
  };

  const submitStudentApplication = async (
    studentData: StudentData,
  ): Promise<string | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Call our backend API to process the application with AI
      const response = await api.post('/process-application', {
        studentData: {
          ...studentData,
          address,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process application');
      }

      const result = await response.json();
      return result.transactionHash;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit application',
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Donor functions
  const getTotalFunds = async (): Promise<string> => {
    await refetchTotalFunds();
    return formatEther(totalFunds || BigInt(0));
  };

  const depositFunds = async (amount: string): Promise<string> => {
    if (!address) {
      setError('Wallet not connected');
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Write the transaction and get the hash
      const hash = await writeContractAsync({
        address: SCHOLARSHIP_FUND_ADDRESS as `0x${string}`,
        abi: SCHOLARSHIP_FUND_ABI,
        functionName: 'depositFunds',
        value: parseEther(amount),
      });

      // Wait for transaction confirmation with a simple polling approach
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout

      while (!confirmed && attempts < maxAttempts) {
        try {
          const response = await fetch(`https://evm-rpc-testnet.sei-apis.com`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionReceipt',
              params: [hash],
              id: 1,
            }),
          });

          const result = await response.json();

          if (result.result && result.result.status === '0x1') {
            confirmed = true;
            // Refetch total funds after successful confirmation
            await refetchTotalFunds();
            break;
          }
        } catch (pollError) {
          console.warn('Error checking transaction status:', pollError);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!confirmed) {
        throw new Error('Transaction confirmation timeout');
      }

      return hash;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit funds');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentNFT = async (): Promise<boolean> => {
    return Boolean(hasEnrollmentNFT);
  };

  return {
    // State
    loading,
    error,
    isConnected: authenticated && isConnected,
    address,

    // Contract data
    isVerified: Boolean(isVerified),
    meritScore: Number(meritScore || 0),
    hasReceivedScholarship: Boolean(hasReceivedScholarship),
    totalFunds: formatEther(totalFunds || BigInt(0)),
    hasEnrollmentNFT: Boolean(hasEnrollmentNFT),

    // Student functions
    checkVerificationStatus,
    getMeritScore,
    checkScholarshipStatus,
    submitStudentApplication,
    checkEnrollmentNFT,

    // Donor functions
    getTotalFunds,
    depositFunds,

    // Utility functions
    clearError: () => setError(null),
  };
}
