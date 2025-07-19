// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ScholarshipFund {
    address public admin;
    mapping(address => uint256) public meritScores;
    mapping(address => bool) public verifiedStudents;
    mapping(address => bool) public hasReceivedScholarship;
    uint256 public totalFunds;
    uint256 public totalDistributed;
    
    event FundsDeposited(address indexed donor, uint256 amount);
    event ScoreProof(address indexed student, uint256 score, bytes32 proofHash);
    event StudentVerified(address indexed student);
    event Payout(address indexed student, uint256 amount);
    event EnrollmentProof(address indexed student, bytes32 proofHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyVerifiedStudent(address student) {
        require(verifiedStudents[student], "Student not verified");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Allows donors to deposit funds into the scholarship pool
     */
    function depositFunds() external payable {
        require(msg.value > 0, "Must deposit some funds");
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Sets merit score for a verified student with AI-generated proof
     * @param student The student's address
     * @param score The merit score (0-100)
     * @param proofHash Hash of the AI calculation proof
     */
    function setMeritScore(address student, uint256 score, bytes32 proofHash) external onlyAdmin onlyVerifiedStudent(student) {
        require(score <= 100, "Invalid score - must be 0-100");
        meritScores[student] = score;
        emit ScoreProof(student, score, proofHash);
    }

    /**
     * @dev Distributes scholarship based on merit score
     * @param student The student's address
     */
    function distributeScholarship(address student) external onlyAdmin {
        require(meritScores[student] > 0, "No merit score assigned");
        require(!hasReceivedScholarship[student], "Student already received scholarship");
        require(totalFunds > 0, "No funds available");
        
        // Calculate scholarship amount based on merit score (proportional distribution)
        uint256 amount = (totalFunds * meritScores[student]) / 10000; // Score out of 100, so divide by 10000 for percentage
        require(amount <= totalFunds, "Insufficient funds");
        
        totalFunds -= amount;
        totalDistributed += amount;
        hasReceivedScholarship[student] = true;
        
        payable(student).transfer(amount);
        emit Payout(student, amount);
    }

    /**
     * @dev Verifies a student's enrollment status
     * @param student The student's address to verify
     */
    function verifyStudent(address student) external onlyAdmin {
        verifiedStudents[student] = true;
        emit StudentVerified(student);
    }

    /**
     * @dev Stores enrollment proof hash on-chain
     * @param student The student's address
     * @param proofHash Hash of enrollment document
     */
    function storeEnrollmentProof(address student, bytes32 proofHash) external {
        require(msg.sender == student || msg.sender == admin, "Only student or admin can store proof");
        emit EnrollmentProof(student, proofHash);
    }

    /**
     * @dev Batch verify multiple students
     * @param students Array of student addresses to verify
     */
    function batchVerifyStudents(address[] calldata students) external onlyAdmin {
        for (uint256 i = 0; i < students.length; i++) {
            verifiedStudents[students[i]] = true;
            emit StudentVerified(students[i]);
        }
    }

    /**
     * @dev Emergency withdrawal function (only admin)
     */
    function emergencyWithdraw() external onlyAdmin {
        uint256 balance = address(this).balance;
        totalFunds = 0;
        payable(admin).transfer(balance);
    }

    /**
     * @dev Transfer admin rights
     * @param newAdmin The new admin address
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Check if student has received scholarship
     * @param student The student's address
     */
    function hasStudentReceivedScholarship(address student) external view returns (bool) {
        return hasReceivedScholarship[student];
    }

    /**
     * @dev Get student's merit score
     * @param student The student's address
     */
    function getStudentMeritScore(address student) external view returns (uint256) {
        return meritScores[student];
    }

    /**
     * @dev Check if student is verified
     * @param student The student's address
     */
    function isStudentVerified(address student) external view returns (bool) {
        return verifiedStudents[student];
    }
}
