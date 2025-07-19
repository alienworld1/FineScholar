import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration for Sei MCP Kit integration
 */
export const MCP_CONFIG = {
  // Sei Testnet Configuration
  SEI_TESTNET: {
    rpcEndpoint: 'https://evm-rpc-testnet.sei-apis.com',
    chainId: 1328, // Updated to match actual Sei testnet chain ID
    blockExplorer: 'https://seitrace.com',
    name: 'Sei Testnet',
  },

  // Local Development Configuration
  SEI_LOCAL: {
    rpcEndpoint: 'http://localhost:8545',
    chainId: 1337,
    blockExplorer: 'http://localhost',
    name: 'Local Testnet',
  },

  // Environment Variables
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ADMIN_PRIVATE_KEY: process.env.PRIVATE_KEY || '',

  // Contract Addresses (will be updated after deployment)
  CONTRACTS: {
    SCHOLARSHIP_FUND: process.env.SCHOLARSHIP_FUND_ADDRESS || '',
    ENROLLMENT_NFT: process.env.ENROLLMENT_NFT_ADDRESS || '',
  },

  // AI Configuration
  AI_CONFIG: {
    model: 'gemini-1.5-flash',
    maxRetries: 3,
    timeoutMs: 30000,
  },

  // Blockchain Configuration
  BLOCKCHAIN_CONFIG: {
    gasLimit: 500000,
    gasPrice: '20000000000', // 20 gwei
    confirmations: 1,
    timeoutMs: 60000,
  },
};

/**
 * Get the current network configuration
 */
export function getNetworkConfig() {
  // Use Sei testnet by default, only use local if explicitly configured
  const useLocal =
    process.env.USE_LOCAL_NETWORK === 'true' || process.env.NETWORK === 'local';
  return useLocal ? MCP_CONFIG.SEI_LOCAL : MCP_CONFIG.SEI_TESTNET;
}

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors: string[] = [];

  if (!MCP_CONFIG.GEMINI_API_KEY) {
    errors.push('GEMINI_API_KEY is required in environment variables');
  }

  if (!MCP_CONFIG.ADMIN_PRIVATE_KEY) {
    errors.push(
      'PRIVATE_KEY is required in environment variables for admin functions',
    );
  }

  if (!MCP_CONFIG.CONTRACTS.SCHOLARSHIP_FUND) {
    console.warn(
      '⚠️ SCHOLARSHIP_FUND_ADDRESS not set - will need to deploy contracts first',
    );
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}
