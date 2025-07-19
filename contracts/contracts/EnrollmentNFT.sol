// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnrollmentNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to enrollment data
    mapping(uint256 => EnrollmentData) public enrollmentData;
    
    struct EnrollmentData {
        string university;
        string studentId;
        uint256 enrollmentDate;
        bool isActive;
    }
    
    event EnrollmentNFTMinted(
        address indexed student,
        uint256 indexed tokenId,
        string university,
        string studentId
    );
    
    event EnrollmentStatusUpdated(
        uint256 indexed tokenId,
        bool isActive
    );

    constructor() ERC721("EnrollmentProof", "ENFT") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start from 1
    }

    /**
     * @dev Mint an enrollment NFT to a student
     * @param to Student's address
     * @param university Name of the university
     * @param studentId Student's ID at the university
     */
    function mintEnrollmentNFT(
        address to,
        string memory university,
        string memory studentId
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _mint(to, tokenId);
        
        enrollmentData[tokenId] = EnrollmentData({
            university: university,
            studentId: studentId,
            enrollmentDate: block.timestamp,
            isActive: true
        });
        
        emit EnrollmentNFTMinted(to, tokenId, university, studentId);
        return tokenId;
    }

    /**
     * @dev Update enrollment status (for graduation or withdrawal)
     * @param tokenId The NFT token ID
     * @param isActive New status
     */
    function updateEnrollmentStatus(uint256 tokenId, bool isActive) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        enrollmentData[tokenId].isActive = isActive;
        emit EnrollmentStatusUpdated(tokenId, isActive);
    }

    /**
     * @dev Get enrollment data for a token
     * @param tokenId The NFT token ID
     */
    function getEnrollmentData(uint256 tokenId) external view returns (
        string memory university,
        string memory studentId,
        uint256 enrollmentDate,
        bool isActive
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        EnrollmentData memory data = enrollmentData[tokenId];
        return (data.university, data.studentId, data.enrollmentDate, data.isActive);
    }

    /**
     * @dev Check if an address owns an active enrollment NFT
     * @param student The student's address
     */
    function hasActiveEnrollment(address student) external view returns (bool) {
        uint256 balance = balanceOf(student);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(student, i);
            if (enrollmentData[tokenId].isActive) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner The owner's address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokens;
    }

    /**
     * @dev Override transfer to prevent transfers (enrollment is non-transferable)
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Enrollment NFTs are non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override _increaseBalance for ERC721Enumerable compatibility
     */
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Override supportsInterface for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Get next token ID to be minted
     */
    function getNextTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
