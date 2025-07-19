import { configDotenv } from 'dotenv';
configDotenv();

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    'sei-testnet': {
      url: 'https://evm-rpc-testnet.sei-apis.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1328,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      'sei-testnet': 'placeholder', // Sei doesn't use etherscan
    },
    customChains: [
      {
        network: 'sei-testnet',
        chainId: 1328,
        urls: {
          apiURL: 'https://seitrace.com/api',
          browserURL: 'https://seitrace.com',
        },
      },
    ],
  },
};

export default config;
