# 🚀 Sei Testnet Deployment Guide

## Prerequisites

1. **Node.js and npm** installed
2. **MetaMask** wallet extension
3. **SEI testnet tokens** for gas fees

## Step 1: Add Sei Testnet to MetaMask

Add the following network to MetaMask:

- **Network Name**: Sei Testnet
- **RPC URL**: `https://evm-rpc-testnet.sei-apis.com`
- **Chain ID**: `713715`
- **Currency Symbol**: `SEI`
- **Block Explorer**: `https://seitrace.com`

## Step 2: Get Testnet Tokens

Visit the [Sei Faucet](https://faucet.sei-apis.com/) and get some SEI tokens for gas fees.

## Step 3: Set Up Environment

1. **Create `.env` file**:

   ```bash
   cp .env.example .env
   ```

2. **Add your private key** (from MetaMask):

   ```env
   PRIVATE_KEY=your_private_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > ⚠️ **Security**: Never commit your `.env` file to version control!

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Compile Contracts

```bash
npm run compile
```

## Step 6: Run Tests (Optional)

```bash
npm test
```

## Step 7: Deploy to Sei Testnet

```bash
npm run deploy:sei
```

This will:

- Deploy `EnrollmentNFT` contract
- Deploy `ScholarshipFund` contract
- Save deployment info to `deployments/sei-testnet-latest.json`
- Display contract addresses and explorer links

## Step 8: Verify Deployment

```bash
npm run verify
```

This confirms that the contracts are deployed and working correctly.

## 📋 Contract Addresses

After deployment, you'll get output like:

```
✅ EnrollmentNFT deployed to: 0x1234...
✅ ScholarshipFund deployed to: 0x5678...
```

**Save these addresses** - you'll need them for:

- Frontend integration
- AI service configuration
- Manual contract interactions

## 🔧 Manual Contract Interaction

You can interact with deployed contracts using Hardhat console:

```bash
npx hardhat console --network sei-testnet
```

Then in the console:

```javascript
// Get contract instances
const ScholarshipFund = await ethers.getContractFactory('ScholarshipFund');
const fund = await ScholarshipFund.attach('YOUR_CONTRACT_ADDRESS');

// Check admin
await fund.admin();

// Verify a student (admin only)
await fund.verifyStudent('0x...');

// Deposit funds
await fund.depositFunds({ value: ethers.parseEther('1') });
```

## 🆘 Troubleshooting

### "Insufficient funds" error

- Ensure your account has SEI tokens from the faucet
- Check that you're using the correct network (Chain ID: 713715)

### "Invalid private key" error

- Verify your private key in `.env` is correct
- Remove any `0x` prefix from the private key

### "Network not found" error

- Check your `hardhat.config.ts` network configuration
- Ensure RPC URL is accessible: `https://evm-rpc-testnet.sei-apis.com`

### Deployment failed

- Check gas limit and gas price settings
- Verify contract compilation completed successfully
- Ensure account has sufficient balance

## 🎯 Next Steps

Once deployed:

1. **Update Frontend**: Add contract addresses to your React app
2. **Set up AI Integration**: Connect Gemini API with deployed contracts
3. **Test Workflows**: Verify students, set scores, distribute scholarships
4. **Monitor Transactions**: Use Sei explorer to track contract interactions

## 📱 View on Sei Explorer

After deployment, view your contracts on:
`https://seitrace.com/address/YOUR_CONTRACT_ADDRESS`

## 🔐 Security Reminders

- Never share your private key
- Use a separate wallet for testnet
- Keep deployment info secure
- Test thoroughly before mainnet deployment

---

Happy deploying! 🎉
