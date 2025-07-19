# FineScholar Smart Contracts

Smart contracts for the FineScholar dApp - a decentralized scholarship platform on Sei blockchain.

## Contracts

### ScholarshipFund.sol

Main contract that manages:

- Scholarship fund deposits from donors
- Student verification and merit score assignment
- Scholarship distribution based on AI-calculated merit scores
- Transparent fund management

### EnrollmentNFT.sol

NFT contract for enrollment verification:

- Mints non-transferable enrollment proof NFTs
- Stores university and student ID data
- Manages enrollment status (active/inactive)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**

   Edit `.env` and add your private key:

   ```
   PRIVATE_KEY=your_private_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Compile contracts:**

   ```bash
   npx hardhat compile
   ```

4. **Run tests:**
   ```bash
   npx hardhat test
   ```

## Deployment

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-to-sei.ts --network localhost
```

### Sei Testnet

1. **Get SEI testnet tokens:**
   - Visit [Sei Faucet](https://faucet.sei-apis.com/)
   - Add Sei testnet to MetaMask:
     - Network Name: Sei Testnet
     - RPC URL: https://evm-rpc-testnet.sei-apis.com
     - Chain ID: 713715
     - Currency Symbol: SEI
     - Block Explorer: https://seitrace.com

2. **Deploy contracts:**

   ```bash
   npx hardhat run scripts/deploy-to-sei.ts --network sei-testnet
   ```

3. **Verify deployment:**
   ```bash
   npx hardhat run scripts/verify-deployment.ts --network sei-testnet
   ```

## Contract Interaction

### Verify Students

```bash
# Edit student addresses in verify-students.ts first
npx hardhat run scripts/verify-students.ts --network sei-testnet
```

### Manual Interaction

```javascript
// Get contract instance
const scholarshipFund = await ethers.getContractAt(
  'ScholarshipFund',
  'CONTRACT_ADDRESS',
);

// Deposit funds
await scholarshipFund.depositFunds({ value: ethers.parseEther('1') });

// Verify student
await scholarshipFund.verifyStudent('STUDENT_ADDRESS');

// Set merit score (AI-generated)
const proofHash = ethers.keccak256(ethers.toUtf8Bytes('AI_PROOF_DATA'));
await scholarshipFund.setMeritScore('STUDENT_ADDRESS', 85, proofHash);

// Distribute scholarship
await scholarshipFund.distributeScholarship('STUDENT_ADDRESS');
```

## Contract Addresses (Sei Testnet)

After deployment, addresses will be saved in `deployments/sei-testnet-latest.json`

## Security Features

- **Access Control**: Admin-only functions for critical operations
- **Verification Required**: Students must be verified before receiving merit scores
- **Single Distribution**: Prevents double-spending of scholarships
- **Non-transferable NFTs**: Enrollment proofs cannot be transferred
- **Emergency Withdrawal**: Admin can recover funds if needed

## Testing

The test suite covers:

- Contract deployment and initialization
- Fund management (deposits, withdrawals)
- Student verification workflows
- Merit score assignment and validation
- Scholarship distribution logic
- NFT minting and management
- Access control and security measures

Run tests with gas reporting:

```bash
REPORT_GAS=true npx hardhat test
```

## Integration with Frontend

Contract ABIs are automatically generated in `typechain-types/` after compilation. Import them in your frontend:

```typescript
import {
  ScholarshipFund__factory,
  EnrollmentNFT__factory,
} from './typechain-types';
```

## AI Integration

The contracts are designed to work with AI-calculated merit scores:

1. AI processes student data (GPA, financial need, volunteer hours)
2. Generates merit score (0-100) and proof hash
3. Admin calls `setMeritScore()` with score and proof
4. Proof hash enables verification of AI calculations

## Network Configuration

The contracts are configured for:

- **Sei Testnet (Atlantic-2)**: Chain ID 1328
- **EVM Compatible**: Uses standard Solidity and OpenZeppelin contracts
- **Fast Transactions**: <400ms finality on Sei blockchain

## Support

For issues or questions:

1. Check contract events and error messages
2. Verify network configuration and gas settings
3. Ensure sufficient SEI balance for transactions
4. Review deployment logs in `deployments/` directory
