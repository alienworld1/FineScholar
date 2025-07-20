import { usePrivy } from '@privy-io/react-auth';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState } from 'react';

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
  const { writeContract } = useWriteContract();

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
      const response = await fetch('/api/process-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentData,
          address,
        }),
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

  const depositFunds = async (amount: string): Promise<void> => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await writeContract({
        address: SCHOLARSHIP_FUND_ADDRESS as `0x${string}`,
        abi: SCHOLARSHIP_FUND_ABI,
        functionName: 'depositFunds',
        value: parseEther(amount),
      });

      // Refetch total funds after deposit
      setTimeout(() => refetchTotalFunds(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit funds');
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
