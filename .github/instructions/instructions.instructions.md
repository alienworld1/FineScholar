---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

FineScholar MVP Development Instructions
This document provides detailed instructions for building FineScholar, a decentralized application (dApp) for the Sei MCP Kit hackathon. FineScholar uses the Sei blockchain to allocate micro-scholarships to university students based on AI-calculated merit scores, leveraging the Sei Model Context Protocol (MCP) Kit and Gemini API for AI integration, and a Vite + React + TypeScript + TailwindCSS + React Router front-end for a polished user interface. These instructions are tailored for Copilot to assist in rapid development, ensuring the MVP is functional, innovative, and competitive for a $10k grand prize.

Project Overview

Goal: Build a dApp that enables students to register, prove university enrollment, and receive scholarships based on AI-calculated merit scores (using GPA, financial need, and volunteer hours). Donors can view fund usage transparently.
Tech Stack:
Blockchain: Sei (testnet, Atlantic-2), EVM-compatible, for smart contracts and fast transactions (<400ms).
AI Integration: Sei MCP Kit to connect Gemini API with Sei blockchain for merit score calculation.
AI: Gemini API (gemini-1.5-flash) to process student data and generate merit scores.
Front-End: Vite, React, TypeScript, TailwindCSS, React Router for a responsive, navigable dApp.
Wallet: MetaMask for Sei EVM interactions.


Key Features:
Smart contract to manage scholarship funds and payouts.
AI-driven merit score calculation (0–100) based on mock student data.
Enrollment verification via NFT or signed document hash on Sei.
Front-end with routes: / (home), /student (student portal), /donor (donor dashboard).
Transparent AI decision proofs stored on Sei.


Success Criteria: A functional MVP showcasing Sei’s speed, MCP’s AI integration, and a polished UI to impress judges with a novel education use case.

Development Instructions
1. Project Setup

Objective: Set up the development environment for Sei, Vite, and Gemini API.
Steps:
Clone Sei MCP Kit:git clone https://github.com/sei-protocol/sei-mcp-server
cd sei-mcp-server

Follow the README to set up the MCP server.
Set Up Sei Testnet:
Access Sei Atlantic-2 testnet (https://www.sei.io/developers).
Install Rust and Node.js for Sei compatibility.
Configure a Sei node or use a testnet endpoint.


Initialize Vite Project:npm create vite@latest finescholar -- --template react-ts
cd finescholar
npm install


Install Dependencies:npm install ethers @tanstack/react-router tailwindcss postcss autoprefixer @google/generative-ai
npx tailwindcss init -p


Configure TailwindCSS:Update tailwind.config.js:/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

Add to src/index.css:@tailwind base;
@tailwind components;
@tailwind utilities;


Set Up Hardhat for Smart Contracts:npx hardhat init

Configure hardhat.config.js for Sei testnet (use endpoint from Sei docs).
Get Gemini API Key:
Sign up at https://ai.google.dev/gemini-api/docs.
Store the key in a .env file: GEMINI_API_KEY=your_key_here.





2. Smart Contract Development

Objective: Create and deploy a Solidity smart contract on Sei to manage scholarship funds, verify students, and distribute payouts.
File: contracts/ScholarshipFund.sol
Code:// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ScholarshipFund {
    address public admin;
    mapping(address => uint256) public meritScores;
    mapping(address => bool) public verifiedStudents;
    uint256 public totalFunds;

    event ScoreProof(address indexed student, bytes32 proofHash);
    event Payout(address indexed student, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    function depositFunds() external payable {
        totalFunds += msg.value;
    }

    function setMeritScore(address student, uint256 score, bytes32 proofHash) external {
        require(msg.sender == admin, "Only admin can set scores");
        require(verifiedStudents[student], "Student not verified");
        require(score <= 100, "Invalid score");
        meritScores[student] = score;
        emit ScoreProof(student, proofHash);
    }

    function distributeScholarship(address student) external {
        require(msg.sender == admin, "Only admin can distribute");
        require(meritScores[student] > 0, "No merit score");
        uint256 amount = (totalFunds * meritScores[student]) / 10000;
        require(amount <= totalFunds, "Insufficient funds");
        totalFunds -= amount;
        payable(student).transfer(amount);
        emit Payout(student, amount);
    }

    function verifyStudent(address student) external {
        require(msg.sender == admin, "Only admin can verify");
        verifiedStudents[student] = true;
    }
}


Enrollment NFT Contract:
File: contracts/EnrollmentNFT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EnrollmentNFT is ERC721 {
    constructor() ERC721("EnrollmentProof", "ENFT") {}



 Namespaces      function mint(address to, uint256 tokenId) external {          _mint(to, tokenId);      }  }
- **Tasks for AI IDE**:
- Autocomplete Solidity functions (e.g., `verifyStudent` with NFT checks).
- Suggest error handling for edge cases (e.g., insufficient funds).
- Generate deployment scripts for Hardhat:
  ```javascript
  const hre = require("hardhat");

  async function main() {
    const ScholarshipFund = await hre.ethers.getContractFactory("ScholarshipFund");
    const scholarship = await ScholarshipFund.deploy();
    await scholarship.deployed();
    console.log("ScholarshipFund deployed to:", scholarship.address);

    const EnrollmentNFT = await hre.ethers.getContractFactory("EnrollmentNFT");
    const enrollment = await EnrollmentNFT.deploy();
    await enrollment.deployed();
    console.log("EnrollmentNFT deployed to:", enrollment.address);
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  ```
- Deploy to Sei testnet: `npx hardhat run scripts/deploy.js --network sei-testnet`.

### 3. Gemini AI Integration
- **Objective**: Use the Gemini API to calculate merit scores and integrate with Sei via the MCP Kit.
- **File**: `src/server/ai.ts`
- **Code**:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ethers } from "ethers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function calculateMeritScore(studentData: {
  studentId: string;
  gpa: number;
  volunteerHours: number;
  financialNeed: number;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Calculate a merit score (0-100) for a student based on:
    - GPA (0-4.0, 50% weight)
    - Financial Need (0-100, 30% weight)
    - Volunteer Hours (0-100, 20% weight)
    Student Data: ${JSON.stringify(studentData)}
    Return only the score as a number.
  `;
  const result = await model.generateContent(prompt);
  const score = parseInt(result.response.text());
  const proofHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(studentData) + score)
  );
  return { score, proofHash };
}


MCP Integration:
Configure the Sei MCP Kit to call the smart contract’s setMeritScore function.
Example MCP setup (refer to https://github.com/sei-protocol/sei-mcp-server):node mcp-server.js --contract-address <SCHOLARSHIP_CONTRACT_ADDRESS> --endpoint <SEI_TESTNET_ENDPOINT>


Use MCP to send the score and proofHash to the smart contract.


Mock Data:
File: src/data/students.json

[
  { "studentId": "0x123...", "gpa": 3.8, "volunteerHours": 50, "financialNeed": 80 },
  { "studentId": "0x456...", "gpa": 3.2, "volunteerHours": 20, "financialNeed": 90 }
]


Tasks for AI IDE:
Autocomplete Gemini API calls and error handling.
Suggest TypeScript interfaces for studentData.
Generate mock data parsing logic.



4. Front-End Development

Objective: Build a responsive dApp with Vite, React, TypeScript, TailwindCSS, and React Router.
Directory Structure:src/
├── components/
│   ├── Home.tsx
│   ├── StudentPortal.tsx
│   ├── DonorPortal.tsx
├── data/
│   ├── students.json
├── server/
│   ├── ai.ts
├── index.css
├── main.tsx


Main App:
File: src/main.tsx

import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from '@tanstack/react-router';
import Home from './components/Home';
import StudentPortal from './components/StudentPortal';
import DonorPortal from './components/DonorPortal';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/student', element: <StudentPortal /> },
  { path: '/donor', element: <DonorPortal /> },
]);

const root = createRoot(document.getElementById('root')!);
root.render(<RouterProvider router={router} />);


Components:
File: src/components/Home.tsx

import { Link } from '@tanstack/react-router';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">FineScholar</h1>
        <p className="text-lg mb-6">A Sei-powered dApp for AI-driven scholarships</p>
        <div className="space-x-4">
          <Link to="/student" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Student Portal
          </Link>
          <Link to="/donor" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Donor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


File: src/components/StudentPortal.tsx

import { useState } from 'react';
import { ethers } from 'ethers';

export default function StudentPortal() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [meritScore, setMeritScore] = useState<number | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const accounts = await provider.listAccounts();
      setWallet(accounts[0]);
    }
  };

  const fetchMeritScore = async () => {
    if (!wallet) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      'YOUR_CONTRACT_ADDRESS',
      ['function meritScores(address) view returns (uint256)'],
      provider
    );
    const score = await contract.meritScores(wallet);
    setMeritScore(score.toNumber());
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Student Portal</h2>
        <button
          onClick={connectWallet}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
        >
          {wallet ? `Connected: ${wallet.slice(0, 6)}...` : 'Connect Wallet'}
        </button>
        <button
          onClick={fetchMeritScore}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
          disabled={!wallet}
        >
          View Merit Score
        </button>
        {meritScore !== null && (
          <p className="text-lg">Your Merit Score: <span className="font-bold">{meritScore}</span></p>
        )}
        <p className="text-sm text-gray-600 mt-4">
          Upload enrollment proof to qualify for scholarships.
        </p>
      </div>
    </div>
  );
}


File: src/components/DonorPortal.tsx

import { useState } from 'react';
import { ethers } from 'ethers';

export default function DonorPortal() {
  const [totalFunds, setTotalFunds] = useState<string | null>(null);

  const fetchFunds = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      'YOUR_CONTRACT_ADDRESS',
      ['function totalFunds() view returns (uint256)'],
      provider
    );
    const funds = await contract.totalFunds();
    setTotalFunds(ethers.utils.formatEther(funds));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Donor Dashboard</h2>
        <button
          onClick={fetchFunds}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
        >
          View Total Funds
        </button>
        {totalFunds !== null && (
          <p className="text-lg">Total Funds: <span className="font-bold">{totalFunds} SEI</span></p>
        )}
      </div>
    </div>
  );
}


Tasks for AI IDE:
Autocomplete React components with TailwindCSS classes.
Generate ABI JSON for ScholarshipFund.sol to integrate with ethers.js.
Suggest TypeScript types for contract interactions.
Add loading states and error handling for wallet connections.



5. Enrollment Verification

Objective: Implement a mechanism for students to prove university enrollment.
Approach:
Use EnrollmentNFT.sol to mint NFTs for enrollment proof.
Add a function to ScholarshipFund.sol to verify NFT ownership:function verifyStudent(address student, uint256 tokenId) external {
    require(EnrollmentNFT(ENFT_ADDRESS).ownerOf(tokenId) == student, "Not enrolled");
    verifiedStudents[student] = true;
}


Alternative: Store a signed document hash:event EnrollmentProof(address indexed student, bytes32 proofHash);
function storeEnrollmentProof(address student, bytes32 proofHash) external {
    emit EnrollmentProof(student, proofHash);
}




Front-End Integration:
Add an upload button in StudentPortal.tsx to mint an NFT or submit a document hash.
Example:const mintNFT = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    'ENFT_ADDRESS',
    ['function mint(address to, uint256 tokenId) external'],
    signer
  );
  await contract.mint(wallet, Date.now());
};




Tasks for AI IDE:
Generate NFT minting UI components.
Suggest document hashing logic with ethers.js.
Autocomplete contract interaction code.



6. Testing and Deployment

Objective: Ensure the MVP is functional and deployable.
Steps:
Test Smart Contracts:
Use Hardhat to test ScholarshipFund.sol and EnrollmentNFT.sol:const { expect } = require("chai");

describe("ScholarshipFund", function () {
  it("should deposit funds", async function () {
    const ScholarshipFund = await ethers.getContractFactory("ScholarshipFund");
    const scholarship = await ScholarshipFund.deploy();
    await scholarship.deployed();
    await scholarship.depositFunds({ value: ethers.utils.parseEther("1") });
    expect(await scholarship.totalFunds()).to.equal(ethers.utils.parseEther("1"));
  });
});


Run: npx hardhat test.


Test Gemini AI:
Test ai.ts with mock data:const studentData = { studentId: "0x123...", gpa: 3.8, volunteerHours: 50, financialNeed: 80 };
calculateMeritScore(studentData).then(console.log);




Test Front-End:
Run: npm run dev to test locally.
Verify wallet connection, merit score display, and fund balance retrieval.


Deploy:
Deploy smart contracts to Sei testnet.
Deploy front-end to Vercel: npm run build && vercel.




Tasks for AI IDE:
Generate test cases for smart contracts.
Suggest error handling for API and blockchain calls.
Autocomplete deployment scripts.



7. Presentation and Demo

Objective: Create a compelling demo to win the $10k prize.
Demo Video (3–5 minutes):
Show student registration, NFT minting, AI scoring, and payout execution.
Highlight Sei’s <400ms transaction speed.
Display TailwindCSS-styled UI and React Router navigation.


Slide Deck:
Problem: Students need transparent scholarship funding.
Solution: FineScholar, a Sei-powered AI-driven dApp.
Tech Stack: Sei, MCP, Gemini, Vite, React, TypeScript, TailwindCSS.
Sei’s Role: High throughput, low latency, AI integration.
Impact: Scalable, global scholarship platform.
Demo Screenshots and Enrollment Proof.


Tasks for AI IDE:
Generate demo script snippets.
Suggest TailwindCSS styles for a polished UI.
Create markdown for slide deck content.



8. Enrollment Verification for Hackathon

Objective: Prove university enrollment for prize eligibility.
Steps:
NFT-Based Proof:
Mint an EnrollmentNFT with metadata linking to your student ID or enrollment letter.
Submit the NFT’s token ID and contract address to organizers.


Signed Document:
Hash a signed enrollment letter:const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(letter));


Store via storeEnrollmentProof in ScholarshipFund.sol.
Submit the letter and transaction ID.


University Email:
If allowed, submit a .edu email with an on-chain signed message.




Tasks for AI IDE:
Generate NFT minting or document hashing code.
Suggest UI for proof submission.



Best Practices

TypeScript: Use strict types for all React components and API calls.
Error Handling: Add try-catch blocks for blockchain and API interactions.
UI Polish: Use TailwindCSS for responsive, clean design (e.g., flex, grid, rounded-lg, shadow-lg).
Testing: Test all components (contracts, AI, UI) individually and end-to-end.
Documentation: Comment code thoroughly for clarity.
Sei Focus: Highlight Sei’s speed (<400ms) and MCP’s AI integration in the demo.

Resources

Sei MCP Kit: https://github.com/sei-protocol/sei-mcp-server
Sei Docs: https://www.sei.io/developers
Gemini API: https://ai.google.dev/gemini-api/docs
Vite: https://vitejs.dev/guide/
TailwindCSS: https://tailwindcss.com/docs
React Router: https://reactrouter.com/en/main
OpenZeppelin: https://openzeppelin.com
Hardhat: https://hardhat.org

Notes for AI IDE

Autocomplete Solidity, TypeScript, and React code with context-aware suggestions.
Suggest TailwindCSS classes for responsive design.
Generate test cases and error handling.
Provide inline comments for complex logic (e.g., contract interactions, AI calls).
Optimize for Sei’s EVM compatibility and fast transaction finality.
