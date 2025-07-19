import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Check if we're deploying to sei-testnet
  const network = await ethers.provider.getNetwork();
  console.log('📡 Deploying to network:', network.name);
  console.log('🔗 Chain ID:', network.chainId);

  // Check environment variables
  if (network.chainId === 713715n) {
    if (!process.env.PRIVATE_KEY) {
      console.error(
        '❌ PRIVATE_KEY environment variable is required for Sei testnet deployment',
      );
      console.log('💡 Create a .env file with your private key:');
      console.log('   PRIVATE_KEY=your_private_key_here');
      process.exit(1);
    }
  }

  console.log('🚀 Starting deployment...');

  try {
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log('👤 Deploying contracts with account:', deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');

    // Deploy EnrollmentNFT first
    console.log('\n📄 Deploying EnrollmentNFT...');
    const EnrollmentNFT = await ethers.getContractFactory('EnrollmentNFT');
    const enrollmentNFT = await EnrollmentNFT.deploy();
    await enrollmentNFT.waitForDeployment();
    const enrollmentNFTAddress = await enrollmentNFT.getAddress();
    console.log('✅ EnrollmentNFT deployed to:', enrollmentNFTAddress);

    // Deploy ScholarshipFund
    console.log('\n💰 Deploying ScholarshipFund...');
    const ScholarshipFund = await ethers.getContractFactory('ScholarshipFund');
    const scholarshipFund = await ScholarshipFund.deploy();
    await scholarshipFund.waitForDeployment();
    const scholarshipFundAddress = await scholarshipFund.getAddress();
    console.log('✅ ScholarshipFund deployed to:', scholarshipFundAddress);

    // Verify deployment
    console.log('\n🔍 Verifying deployments...');
    console.log('EnrollmentNFT admin:', await enrollmentNFT.owner());
    console.log('ScholarshipFund admin:', await scholarshipFund.admin());

    // Create deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      deploymentDate: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        EnrollmentNFT: {
          address: enrollmentNFTAddress,
          name: 'EnrollmentProof',
          symbol: 'ENFT',
        },
        ScholarshipFund: {
          address: scholarshipFundAddress,
          admin: await scholarshipFund.admin(),
        },
      },
    };

    // Save deployment info
    const outputDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `${network.name}-${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    // Also save as latest
    const latestFilepath = path.join(outputDir, `${network.name}-latest.json`);
    fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('='.repeat(50));
    console.log('📍 Network:', network.name);
    console.log('🔗 Chain ID:', network.chainId);
    console.log('👤 Deployer:', deployer.address);
    console.log('📄 EnrollmentNFT:', enrollmentNFTAddress);
    console.log('💰 ScholarshipFund:', scholarshipFundAddress);
    console.log('📁 Deployment info saved to:', filepath);
    console.log('='.repeat(50));

    if (network.chainId === 713715n) {
      console.log('\n🔗 View on Sei Explorer:');
      console.log(
        'EnrollmentNFT:',
        `https://seitrace.com/address/${enrollmentNFTAddress}`,
      );
      console.log(
        'ScholarshipFund:',
        `https://seitrace.com/address/${scholarshipFundAddress}`,
      );
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Update your frontend with these contract addresses');
    console.log('2. Verify students using verifyStudent() function');
    console.log('3. Set up AI integration to calculate merit scores');
    console.log('4. Accept donations via depositFunds() function');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
