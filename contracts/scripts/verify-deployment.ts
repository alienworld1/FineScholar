import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const network = await ethers.provider.getNetwork();
  const deploymentPath = path.join(
    __dirname,
    `../deployments/${network.name}-latest.json`,
  );

  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ No deployment found for this network');
    console.log(
      '💡 Deploy contracts first using: npx hardhat run scripts/deploy-to-sei.ts --network sei-testnet',
    );
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('📋 Verifying deployment on', network.name);

  // Get contract instances
  const enrollmentNFT = await ethers.getContractAt(
    'EnrollmentNFT',
    deployment.contracts.EnrollmentNFT.address,
  );
  const scholarshipFund = await ethers.getContractAt(
    'ScholarshipFund',
    deployment.contracts.ScholarshipFund.address,
  );

  console.log('\n🔍 Contract Verification:');
  console.log('='.repeat(40));

  // Verify EnrollmentNFT
  try {
    const name = await enrollmentNFT.name();
    const symbol = await enrollmentNFT.symbol();
    const owner = await enrollmentNFT.owner();
    console.log('✅ EnrollmentNFT:');
    console.log('   Name:', name);
    console.log('   Symbol:', symbol);
    console.log('   Owner:', owner);
  } catch (error) {
    console.log('❌ EnrollmentNFT verification failed:', error);
  }

  // Verify ScholarshipFund
  try {
    const admin = await scholarshipFund.admin();
    const totalFunds = await scholarshipFund.totalFunds();
    const balance = await ethers.provider.getBalance(
      deployment.contracts.ScholarshipFund.address,
    );

    console.log('✅ ScholarshipFund:');
    console.log('   Admin:', admin);
    console.log('   Total Funds:', ethers.formatEther(totalFunds), 'ETH');
    console.log('   Contract Balance:', ethers.formatEther(balance), 'ETH');
  } catch (error) {
    console.log('❌ ScholarshipFund verification failed:', error);
  }

  console.log('\n🎯 Ready for use!');
  console.log('🔗 Contract addresses:');
  console.log('   EnrollmentNFT:', deployment.contracts.EnrollmentNFT.address);
  console.log(
    '   ScholarshipFund:',
    deployment.contracts.ScholarshipFund.address,
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
