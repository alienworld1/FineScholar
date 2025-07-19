import { ethers } from 'hardhat';

async function main() {
  console.log('Starting deployment to Sei testnet...');

  // Deploy EnrollmentNFT first
  console.log('Deploying EnrollmentNFT...');
  const EnrollmentNFT = await ethers.getContractFactory('EnrollmentNFT');
  const enrollmentNFT = await EnrollmentNFT.deploy();
  await enrollmentNFT.waitForDeployment();
  const enrollmentNFTAddress = await enrollmentNFT.getAddress();
  console.log('EnrollmentNFT deployed to:', enrollmentNFTAddress);

  // Deploy ScholarshipFund
  console.log('Deploying ScholarshipFund...');
  const ScholarshipFund = await ethers.getContractFactory('ScholarshipFund');
  const scholarshipFund = await ScholarshipFund.deploy();
  await scholarshipFund.waitForDeployment();
  const scholarshipFundAddress = await scholarshipFund.getAddress();
  console.log('ScholarshipFund deployed to:', scholarshipFundAddress);

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log('Deployed by:', deployer.address);
  console.log(
    'Account balance:',
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // Display deployment summary
  console.log('\n=== DEPLOYMENT SUMMARY ===');
  console.log('Network:', await ethers.provider.getNetwork());
  console.log('EnrollmentNFT Contract:', enrollmentNFTAddress);
  console.log('ScholarshipFund Contract:', scholarshipFundAddress);
  console.log('Transaction gas used and cost will be displayed above');

  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: 'sei-testnet',
    chainId: 713715,
    deploymentDate: new Date().toISOString(),
    contracts: {
      EnrollmentNFT: {
        address: enrollmentNFTAddress,
        deployer: deployer.address,
      },
      ScholarshipFund: {
        address: scholarshipFundAddress,
        deployer: deployer.address,
      },
    },
  };

  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\nDeployment info saved to deployment.json');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
