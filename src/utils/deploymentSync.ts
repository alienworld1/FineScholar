import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DeploymentInfo {
  network: string;
  chainId: number;
  timestamp: number;
  deployer: string;
  contracts: {
    ScholarshipFund: string;
    EnrollmentNFT: string;
  };
  blockNumbers?: {
    ScholarshipFund: number;
    EnrollmentNFT: number;
  };
  gasUsed?: {
    ScholarshipFund: string;
    EnrollmentNFT: string;
  };
}

/**
 * Sync deployment addresses to environment variables and configuration files
 */
async function syncDeployment() {
  console.log('🔄 Deployment Address Sync Utility');
  console.log('===================================\n');

  try {
    // Step 1: Find the latest deployment file
    console.log('🔍 Looking for latest deployment file...');

    const deploymentDir = path.join(process.cwd(), 'contracts', 'deployments');
    let deploymentFiles: string[] = [];

    try {
      deploymentFiles = await fs.readdir(deploymentDir);
    } catch (error) {
      console.error('❌ Could not read deployments directory:', deploymentDir);
      console.log(
        '   Make sure you have deployed contracts first: cd contracts && npm run deploy:sei',
      );
      process.exit(1);
    }

    // Filter for deployment JSON files
    const jsonFiles = deploymentFiles
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)

    if (jsonFiles.length === 0) {
      console.error('❌ No deployment files found in', deploymentDir);
      console.log(
        '   Deploy contracts first: cd contracts && npm run deploy:sei',
      );
      process.exit(1);
    }

    const latestFile = jsonFiles[0];
    console.log('✅ Found latest deployment:', latestFile);

    // Step 2: Read deployment data
    const deploymentPath = path.join(deploymentDir, latestFile);
    const deploymentData = JSON.parse(
      await fs.readFile(deploymentPath, 'utf-8'),
    ) as DeploymentInfo;

    console.log('\n📋 Deployment Information:');
    console.log('  Network:', deploymentData.network);
    console.log('  Chain ID:', deploymentData.chainId);
    console.log(
      '  Timestamp:',
      new Date(deploymentData.timestamp).toLocaleString(),
    );
    console.log('  Deployer:', deploymentData.deployer);
    console.log('  ScholarshipFund:', deploymentData.contracts.ScholarshipFund);
    console.log('  EnrollmentNFT:', deploymentData.contracts.EnrollmentNFT);

    // Step 3: Update .env file
    console.log('\n🔧 Updating .env file...');

    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      console.warn('⚠️  .env file not found, creating new one...');
    }

    // Update or add contract addresses
    const updateEnvVar = (
      content: string,
      key: string,
      value: string,
    ): string => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}="${value}"`);
      } else {
        return content + `\n${key}="${value}"\n`;
      }
    };

    envContent = updateEnvVar(
      envContent,
      'SCHOLARSHIP_FUND_ADDRESS',
      deploymentData.contracts.ScholarshipFund,
    );
    envContent = updateEnvVar(
      envContent,
      'ENROLLMENT_NFT_ADDRESS',
      deploymentData.contracts.EnrollmentNFT,
    );
    envContent = updateEnvVar(
      envContent,
      'CHAIN_ID',
      deploymentData.chainId.toString(),
    );

    await fs.writeFile(envPath, envContent);
    console.log('✅ Updated .env file with contract addresses');

    // Step 4: Update configuration file if it exists
    console.log('\n🔧 Updating configuration files...');

    const configPath = path.join(
      process.cwd(),
      'src',
      'config',
      'mcpConfig.ts',
    );
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');

      // Update contract addresses in config
      const updatedConfig = configContent
        .replace(
          /SCHOLARSHIP_FUND:.*$/m,
          `SCHOLARSHIP_FUND: process.env.SCHOLARSHIP_FUND_ADDRESS || '${deploymentData.contracts.ScholarshipFund}',`,
        )
        .replace(
          /ENROLLMENT_NFT:.*$/m,
          `ENROLLMENT_NFT: process.env.ENROLLMENT_NFT_ADDRESS || '${deploymentData.contracts.EnrollmentNFT}',`,
        );

      await fs.writeFile(configPath, updatedConfig);
      console.log('✅ Updated configuration file');
    } catch (error) {
      console.log('⚠️  Configuration file not found or could not be updated');
    }

    // Step 5: Create/update contract ABI exports
    console.log('\n🔧 Creating contract ABI exports...');

    const contractsDir = path.join(process.cwd(), 'src', 'contracts');

    try {
      // Ensure contracts directory exists
      await fs.mkdir(contractsDir, { recursive: true });

      // Create index file with contract addresses and ABIs
      const contractIndexContent = `// Auto-generated contract exports
// Last updated: ${new Date().toISOString()}

export const CONTRACTS = {
  SCHOLARSHIP_FUND: '${deploymentData.contracts.ScholarshipFund}',
  ENROLLMENT_NFT: '${deploymentData.contracts.EnrollmentNFT}',
} as const;

export const NETWORK_INFO = {
  CHAIN_ID: ${deploymentData.chainId},
  NETWORK: '${deploymentData.network}',
  DEPLOYED_AT: ${deploymentData.timestamp},
  DEPLOYER: '${deploymentData.deployer}',
} as const;

// Simplified ABIs for frontend integration
export const SCHOLARSHIP_FUND_ABI = [
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
] as const;

export const ENROLLMENT_NFT_ABI = [
  'function mint(address to, uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
] as const;
`;

      const contractIndexPath = path.join(contractsDir, 'index.ts');
      await fs.writeFile(contractIndexPath, contractIndexContent);
      console.log('✅ Created contract exports file');
    } catch (error) {
      console.warn(
        '⚠️  Could not create contract exports:',
        error instanceof Error ? error.message : String(error),
      );
    }

    // Step 6: Display summary
    console.log('\n✅ SYNC COMPLETE!');
    console.log('═════════════════');
    console.log('📁 Files updated:');
    console.log('  • .env (contract addresses)');
    console.log('  • src/config/mcpConfig.ts (configuration)');
    console.log('  • src/contracts/index.ts (ABI exports)');

    console.log('\n🎯 Contract Addresses:');
    console.log(
      `  📄 ScholarshipFund: ${deploymentData.contracts.ScholarshipFund}`,
    );
    console.log(
      `  🎫 EnrollmentNFT: ${deploymentData.contracts.EnrollmentNFT}`,
    );

    console.log('\n🚀 Ready for integration!');
    console.log('  • Test integration: npm run mcp:demo');
    console.log('  • Fund scholarship pool: npm run fund:scholarship');
    console.log('  • Process students: npm run mcp:batch');

    // Step 7: Validate sync by checking environment
    console.log('\n🔍 Validating sync...');

    // Reload environment variables
    dotenv.config({ override: true });

    if (
      process.env.SCHOLARSHIP_FUND_ADDRESS ===
      deploymentData.contracts.ScholarshipFund
    ) {
      console.log('✅ Environment variables updated successfully');
    } else {
      console.warn('⚠️  Environment variables may not have loaded properly');
      console.log(
        '    You may need to restart your process to see the changes',
      );
    }
  } catch (error) {
    console.error('\n❌ Sync Error:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error),
    );

    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('─────────────────');
    console.log(
      '• Make sure contracts are deployed: cd contracts && npm run deploy:sei',
    );
    console.log('• Check if deployment files exist in contracts/deployments/');
    console.log('• Ensure proper file permissions for .env and config files');

    process.exit(1);
  }
}

/**
 * Display usage instructions
 */
function displayUsage() {
  console.log('🔄 Deployment Address Sync Utility');
  console.log('===================================');
  console.log();
  console.log('USAGE:');
  console.log(
    '  npm run sync:deployment     # Sync latest deployment addresses',
  );
  console.log();
  console.log('DESCRIPTION:');
  console.log(
    '  This utility finds the latest contract deployment file and updates:',
  );
  console.log('  • .env file with contract addresses');
  console.log('  • Configuration files');
  console.log('  • Contract ABI exports for frontend integration');
  console.log();
  console.log('REQUIREMENTS:');
  console.log('  • Contracts must be deployed first (npm run deploy:sei)');
  console.log('  • Deployment files must exist in contracts/deployments/');
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    displayUsage();
    process.exit(0);
  }

  syncDeployment()
    .then(() => {
      console.log('\n🏁 Sync completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Sync failed:', error);
      process.exit(1);
    });
}

export default syncDeployment;
