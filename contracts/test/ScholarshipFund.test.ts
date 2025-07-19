import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ScholarshipFund, EnrollmentNFT } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('ScholarshipFund', function () {
  let scholarshipFund: ScholarshipFund;
  let enrollmentNFT: EnrollmentNFT;
  let admin: SignerWithAddress;
  let student1: SignerWithAddress;
  let student2: SignerWithAddress;
  let donor: SignerWithAddress;

  beforeEach(async function () {
    [admin, student1, student2, donor] = await ethers.getSigners();

    // Deploy EnrollmentNFT
    const EnrollmentNFTFactory =
      await ethers.getContractFactory('EnrollmentNFT');
    enrollmentNFT = await EnrollmentNFTFactory.deploy();
    await enrollmentNFT.waitForDeployment();

    // Deploy ScholarshipFund
    const ScholarshipFundFactory =
      await ethers.getContractFactory('ScholarshipFund');
    scholarshipFund = await ScholarshipFundFactory.deploy();
    await scholarshipFund.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right admin', async function () {
      expect(await scholarshipFund.admin()).to.equal(admin.address);
    });

    it('Should start with zero total funds', async function () {
      expect(await scholarshipFund.totalFunds()).to.equal(0);
    });
  });

  describe('Fund Management', function () {
    it('Should accept fund deposits', async function () {
      const depositAmount = ethers.parseEther('1');

      await expect(
        scholarshipFund.connect(donor).depositFunds({ value: depositAmount }),
      )
        .to.emit(scholarshipFund, 'FundsDeposited')
        .withArgs(donor.address, depositAmount);

      expect(await scholarshipFund.totalFunds()).to.equal(depositAmount);
    });

    it('Should reject zero deposits', async function () {
      await expect(
        scholarshipFund.connect(donor).depositFunds({ value: 0 }),
      ).to.be.revertedWith('Must deposit some funds');
    });
  });

  describe('Student Verification', function () {
    it('Should allow admin to verify students', async function () {
      await expect(scholarshipFund.verifyStudent(student1.address))
        .to.emit(scholarshipFund, 'StudentVerified')
        .withArgs(student1.address);

      expect(await scholarshipFund.isStudentVerified(student1.address)).to.be
        .true;
    });

    it('Should not allow non-admin to verify students', async function () {
      await expect(
        scholarshipFund.connect(student1).verifyStudent(student2.address),
      ).to.be.revertedWith('Only admin can perform this action');
    });

    it('Should allow batch verification', async function () {
      const students = [student1.address, student2.address];

      await scholarshipFund.batchVerifyStudents(students);

      expect(await scholarshipFund.isStudentVerified(student1.address)).to.be
        .true;
      expect(await scholarshipFund.isStudentVerified(student2.address)).to.be
        .true;
    });
  });

  describe('Merit Score Management', function () {
    beforeEach(async function () {
      // Verify student first
      await scholarshipFund.verifyStudent(student1.address);
    });

    it('Should allow admin to set merit scores for verified students', async function () {
      const score = 85;
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes('test-proof'));

      await expect(
        scholarshipFund.setMeritScore(student1.address, score, proofHash),
      )
        .to.emit(scholarshipFund, 'ScoreProof')
        .withArgs(student1.address, score, proofHash);

      expect(
        await scholarshipFund.getStudentMeritScore(student1.address),
      ).to.equal(score);
    });

    it('Should not allow merit scores above 100', async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes('test-proof'));

      await expect(
        scholarshipFund.setMeritScore(student1.address, 101, proofHash),
      ).to.be.revertedWith('Invalid score - must be 0-100');
    });

    it('Should not allow setting scores for unverified students', async function () {
      const score = 85;
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes('test-proof'));

      await expect(
        scholarshipFund.setMeritScore(student2.address, score, proofHash),
      ).to.be.revertedWith('Student not verified');
    });
  });

  describe('Scholarship Distribution', function () {
    beforeEach(async function () {
      // Set up verified student with merit score
      await scholarshipFund.verifyStudent(student1.address);
      await scholarshipFund.setMeritScore(
        student1.address,
        80,
        ethers.keccak256(ethers.toUtf8Bytes('test-proof')),
      );

      // Add funds
      await scholarshipFund
        .connect(donor)
        .depositFunds({ value: ethers.parseEther('10') });
    });

    it('Should distribute scholarship based on merit score', async function () {
      const initialBalance = await ethers.provider.getBalance(student1.address);

      await expect(
        scholarshipFund.distributeScholarship(student1.address),
      ).to.emit(scholarshipFund, 'Payout');

      const finalBalance = await ethers.provider.getBalance(student1.address);
      expect(finalBalance).to.be.gt(initialBalance);
      expect(
        await scholarshipFund.hasStudentReceivedScholarship(student1.address),
      ).to.be.true;
    });

    it('Should not allow double distribution', async function () {
      await scholarshipFund.distributeScholarship(student1.address);

      await expect(
        scholarshipFund.distributeScholarship(student1.address),
      ).to.be.revertedWith('Student already received scholarship');
    });

    it('Should not distribute without merit score', async function () {
      await scholarshipFund.verifyStudent(student2.address);

      await expect(
        scholarshipFund.distributeScholarship(student2.address),
      ).to.be.revertedWith('No merit score assigned');
    });
  });

  describe('Enrollment Proof', function () {
    it('Should allow storing enrollment proof', async function () {
      const proofHash = ethers.keccak256(
        ethers.toUtf8Bytes('enrollment-document'),
      );

      await expect(
        scholarshipFund
          .connect(student1)
          .storeEnrollmentProof(student1.address, proofHash),
      )
        .to.emit(scholarshipFund, 'EnrollmentProof')
        .withArgs(student1.address, proofHash);
    });
  });
});

describe('EnrollmentNFT', function () {
  let enrollmentNFT: EnrollmentNFT;
  let owner: SignerWithAddress;
  let student: SignerWithAddress;

  beforeEach(async function () {
    [owner, student] = await ethers.getSigners();

    const EnrollmentNFTFactory =
      await ethers.getContractFactory('EnrollmentNFT');
    enrollmentNFT = await EnrollmentNFTFactory.deploy();
    await enrollmentNFT.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await enrollmentNFT.owner()).to.equal(owner.address);
    });

    it('Should have correct name and symbol', async function () {
      expect(await enrollmentNFT.name()).to.equal('EnrollmentProof');
      expect(await enrollmentNFT.symbol()).to.equal('ENFT');
    });
  });

  describe('Minting', function () {
    it('Should mint enrollment NFT with correct data', async function () {
      const university = 'Test University';
      const studentId = 'STU123456';

      await expect(
        enrollmentNFT.mintEnrollmentNFT(student.address, university, studentId),
      )
        .to.emit(enrollmentNFT, 'EnrollmentNFTMinted')
        .withArgs(student.address, 1, university, studentId);

      expect(await enrollmentNFT.ownerOf(1)).to.equal(student.address);
      expect(await enrollmentNFT.balanceOf(student.address)).to.equal(1);
    });

    it('Should not allow non-owner to mint', async function () {
      await expect(
        enrollmentNFT
          .connect(student)
          .mintEnrollmentNFT(student.address, 'Test Uni', 'STU123'),
      ).to.be.revertedWithCustomError(
        enrollmentNFT,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Enrollment Data', function () {
    beforeEach(async function () {
      await enrollmentNFT.mintEnrollmentNFT(
        student.address,
        'Test University',
        'STU123456',
      );
    });

    it('Should return correct enrollment data', async function () {
      const [university, studentId, enrollmentDate, isActive] =
        await enrollmentNFT.getEnrollmentData(1);

      expect(university).to.equal('Test University');
      expect(studentId).to.equal('STU123456');
      expect(isActive).to.be.true;
      expect(enrollmentDate).to.be.gt(0);
    });

    it('Should update enrollment status', async function () {
      await expect(enrollmentNFT.updateEnrollmentStatus(1, false))
        .to.emit(enrollmentNFT, 'EnrollmentStatusUpdated')
        .withArgs(1, false);

      const [, , , isActive] = await enrollmentNFT.getEnrollmentData(1);
      expect(isActive).to.be.false;
    });

    it('Should check for active enrollment', async function () {
      expect(await enrollmentNFT.hasActiveEnrollment(student.address)).to.be
        .true;

      await enrollmentNFT.updateEnrollmentStatus(1, false);
      expect(await enrollmentNFT.hasActiveEnrollment(student.address)).to.be
        .false;
    });
  });

  describe('Transfer Restrictions', function () {
    beforeEach(async function () {
      await enrollmentNFT.mintEnrollmentNFT(
        student.address,
        'Test University',
        'STU123456',
      );
    });

    it('Should prevent transfers between addresses', async function () {
      const [, otherUser] = await ethers.getSigners();

      await expect(
        enrollmentNFT
          .connect(student)
          .transferFrom(student.address, otherUser.address, 1),
      ).to.be.revertedWith('Enrollment NFTs are non-transferable');
    });
  });
});
