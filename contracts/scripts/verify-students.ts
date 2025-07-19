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
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const scholarshipFund = await ethers.getContractAt(
    'ScholarshipFund',
    deployment.contracts.ScholarshipFund.address,
  );

  // Example student addresses (replace with real ones)
  const studentAddresses = [
    '0x1234567890123456789012345678901234567890', // Replace with actual addresses
    '0x2345678901234567890123456789012345678901',
  ];

  console.log('👥 Verifying students...');

  try {
    // Verify each student
    for (const studentAddress of studentAddresses) {
      if (ethers.isAddress(studentAddress)) {
        const tx = await scholarshipFund.verifyStudent(studentAddress);
        await tx.wait();
        console.log(`✅ Verified student: ${studentAddress}`);
      } else {
        console.log(`❌ Invalid address: ${studentAddress}`);
      }
    }

    // Batch verify (more gas efficient)
    // const tx = await scholarshipFund.batchVerifyStudents(studentAddresses);
    // await tx.wait();
    // console.log(`✅ Batch verified ${studentAddresses.length} students`);
  } catch (error) {
    console.error('❌ Error verifying students:', error);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
