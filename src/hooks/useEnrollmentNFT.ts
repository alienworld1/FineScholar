import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

const ENROLLMENT_NFT_ABI = [
  // Read functions
  {
    inputs: [{ internalType: 'address', name: 'student', type: 'address' }],
    name: 'hasActiveEnrollment',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'getTokensByOwner',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
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
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Write functions (admin only)
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
];

const ENROLLMENT_NFT_ADDRESS =
  import.meta.env.VITE_ENROLLMENT_NFT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

export function useEnrollmentNFT() {
  const { authenticated, user } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Read user's NFT balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: ENROLLMENT_NFT_ADDRESS as `0x${string}`,
    abi: ENROLLMENT_NFT_ABI,
    functionName: 'balanceOf',
    args: user?.wallet?.address
      ? [user.wallet.address as `0x${string}`]
      : undefined,
    query: {
      enabled: !!user?.wallet?.address && authenticated,
    },
  });

  // Read user's tokens
  const { data: tokens, refetch: refetchTokens } = useReadContract({
    address: ENROLLMENT_NFT_ADDRESS as `0x${string}`,
    abi: ENROLLMENT_NFT_ABI,
    functionName: 'getTokensByOwner',
    args: user?.wallet?.address
      ? [user.wallet.address as `0x${string}`]
      : undefined,
    query: {
      enabled: !!user?.wallet?.address && authenticated,
    },
  });

  // Check if user has active enrollment
  const { data: hasActiveEnrollment, refetch: refetchActiveEnrollment } =
    useReadContract({
      address: ENROLLMENT_NFT_ADDRESS as `0x${string}`,
      abi: ENROLLMENT_NFT_ABI,
      functionName: 'hasActiveEnrollment',
      args: user?.wallet?.address
        ? [user.wallet.address as `0x${string}`]
        : undefined,
      query: {
        enabled: !!user?.wallet?.address && authenticated,
      },
    });

  // Request enrollment NFT from admin
  const requestEnrollmentNFT = async (
    university: string,
    studentId: string,
  ) => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enrollment/request-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentAddress: user.wallet.address,
          university,
          studentId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to request enrollment NFT');
      }

      // Refetch data after successful request
      await Promise.all([
        refetchBalance(),
        refetchTokens(),
        refetchActiveEnrollment(),
      ]);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to request NFT';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Upload and verify document hash
  const uploadEnrollmentDocument = async (file: File) => {
    if (!user?.wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Create file hash
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex =
        '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const response = await fetch('/api/enrollment/verify-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentAddress: user.wallet.address,
          documentHash: hashHex,
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to verify document');
      }

      return { ...result, documentHash: hashHex };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload document';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get enrollment data for user's tokens
  const getEnrollmentData = async (tokenId: number) => {
    if (!tokenId) return null;

    try {
      const response = await fetch(`/api/enrollment/token-data/${tokenId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get enrollment data');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to get enrollment data:', error);
      return null;
    }
  };

  return {
    // State
    loading,
    error,

    // Data
    balance: balance ? Number(balance) : 0,
    tokens: tokens ? (tokens as bigint[]).map(t => Number(t)) : [],
    hasActiveEnrollment: !!hasActiveEnrollment,

    // Functions
    requestEnrollmentNFT,
    uploadEnrollmentDocument,
    getEnrollmentData,

    // Refetch functions
    refetchBalance,
    refetchTokens,
    refetchActiveEnrollment,
  };
}
