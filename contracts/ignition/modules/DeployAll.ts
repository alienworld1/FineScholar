import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployAllModule = buildModule('DeployAllModule', m => {
  // Deploy EnrollmentNFT first
  const enrollmentNFT = m.contract('EnrollmentNFT');

  // Deploy ScholarshipFund with EnrollmentNFT address
  const scholarshipFund = m.contract('ScholarshipFund', [enrollmentNFT]);

  // Set ScholarshipFund as owner of EnrollmentNFT (optional, for admin functions)
  // This allows ScholarshipFund to mint NFTs and update statuses
  // m.call(enrollmentNFT, "transferOwnership", [scholarshipFund]);

  return { enrollmentNFT, scholarshipFund };
});

export default DeployAllModule;
