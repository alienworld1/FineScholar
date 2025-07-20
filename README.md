# 🎓 FineScholar

## AI-Driven Scholarship Platform on Sei Blockchain

FineScholar is a decentralized application (dApp) that revolutionizes scholarship allocation by combining artificial intelligence with blockchain transparency. Built for the Sei MCP Kit hackathon, it leverages the Sei blockchain's lightning-fast transaction speeds (<400ms) to provide fair, transparent, and AI-calculated merit-based scholarships to university students worldwide.

## 🌟 Key Features

- **🤖 AI-Powered Merit Scoring**: Uses Google Gemini AI to calculate fair merit scores based on GPA, financial need, and volunteer hours
- **⚡ Lightning Fast**: Built on Sei blockchain with <400ms transaction finality
- **🔍 Transparent Distribution**: All scholarship allocations are publicly verifiable on the blockchain
- **🎨 Polished UI**: A polished UI for an engaging user experience
- **🔐 Enrollment Verification**: NFT-based or document hash verification to ensure student authenticity
- **📊 Real-time Analytics**: Live dashboard for donors to track their impact

## 🏗️ Architecture

### Tech Stack

- **Blockchain**: Sei Testnet (EVM-compatible) for smart contracts and fast transactions
- **AI Integration**: Sei MCP Kit + Google Gemini API for merit calculations
- **Frontend**: Vite + React + TypeScript + TailwindCSS + React Router
- **Wallet Integration**: Privy for seamless authentication and wallet management
- **Backend**: Express.js API with TypeScript for AI and blockchain orchestration

### Smart Contracts

- **ScholarshipFund.sol**: Main contract managing fund deposits, student verification, and scholarship distribution
- **EnrollmentNFT.sol**: NFT-based enrollment verification system

### Deployed Contracts (Sei Testnet)

- **ScholarshipFund**: `0xe030608b66a578C80623baB32670B01c3CDf988f`
- **EnrollmentNFT**: `0xDd84E5C0432D0C3a929bF0892850dd613A0325Be`

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FineScholar

# Install dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..

# Set up environment variables
# Add your API keys and configuration
touch .env

```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Blockchain Configuration
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
VITE_SCHOLARSHIP_FUND_ADDRESS=0xe030608b66a578C80623baB32670B01c3CDf988f
VITE_ENROLLMENT_NFT_ADDRESS=0xDd84E5C0432D0C3a929bF0892850dd613A0325Be

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Admin Configuration (for scholarship approval)
ADMIN_PRIVATE_KEY=your_admin_private_key_here
PRIVATE_KEY=your_deployment_private_key_here

# Application Configuration
NODE_ENV=development
PORT=3001

# Wallet Integration
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

### Development

```bash
# Start both frontend and backend
npm run dev:full

# Or run separately:
# Backend API server
npm run server

# Frontend development server
npm run dev
```

## 📱 User Interfaces

### 🏠 Home Page (`/`)

- Welcome landing page with cafe-inspired design
- Navigation to student and donor portals
- Project overview and features

### 🎓 Student Portal (`/student`)

- **Enrollment Verification**: NFT minting or document upload
- **Merit Score Preview**: AI-powered assessment before submission
- **Application Form**: Comprehensive scholarship application
- **Status Dashboard**: View verification status and awards

### 💰 Donor Portal (`/donor`)

- **Fund Management**: Deposit SEI tokens for scholarships
- **Impact Tracking**: View total donations and students helped
- **Transparency Dashboard**: See exactly which students received funding
- **Real-time Statistics**: Live fund utilization and distribution metrics

### 👨‍💼 Admin Dashboard (`/admin`)

- **Application Review**: Manage pending scholarship applications
- **AI Score Verification**: Review and approve AI-calculated merit scores
- **Fund Distribution**: Execute scholarship payments to approved students
- **Analytics**: Comprehensive platform statistics

## 🔄 How It Works

### For Students

1. **Connect Wallet** → Sign in with Privy authentication
2. **Verify Enrollment** → Upload documents or mint enrollment NFT
3. **Submit Application** → Fill out comprehensive scholarship form
4. **AI Assessment** → Gemini AI calculates merit score based on:
   - GPA (50% weight)
   - Financial Need (30% weight)
   - Volunteer Hours (20% weight)
5. **Admin Review** → Applications reviewed and approved by administrators
6. **Receive Scholarship** → Funds distributed directly to wallet upon approval

### For Donors

1. **Connect Wallet** → Authenticate with Privy
2. **Deposit Funds** → Send SEI tokens to scholarship pool
3. **Track Impact** → Monitor how funds are distributed to students
4. **View Transparency** → See detailed breakdown of scholarship recipients

### For Administrators

1. **Review Applications** → Access admin dashboard with pending applications
2. **Verify AI Scores** → Review Gemini AI merit calculations and reasoning
3. **Approve/Reject** → Make final decisions on scholarship awards
4. **Distribute Funds** → Execute blockchain transactions to send scholarships

## 🧠 AI Integration

### Merit Score Calculation

The system uses Google Gemini AI with sophisticated prompt engineering to calculate fair and transparent merit scores:

```typescript
// Example merit score calculation
const prompt = `
Calculate a merit score (0-100) for a student based on:
- GPA: ${gpa}/4.0 (50% weight)
- Financial Need: ${financialNeed}/100 (30% weight) 
- Volunteer Hours: ${volunteerHours} hours (20% weight)
- Academic Year: ${academicYear}
- Major: ${major}
- University: ${university}

Provide detailed reasoning and score breakdown.
`;
```

### Transparency Features

- **AI Reasoning**: Every score includes detailed explanation
- **Proof Hashes**: Cryptographic verification of AI calculations
- **Audit Trail**: All decisions recorded on blockchain
- **Score Breakdown**: Component-wise merit analysis

## ⛓️ Blockchain Integration

### Sei Network Benefits

- **Speed**: <400ms transaction finality
- **Low Costs**: Minimal gas fees for transactions
- **EVM Compatibility**: Full Ethereum tooling support
- **Parallel Processing**: High throughput for scaling

### Smart Contract Features

- **Fund Management**: Secure handling of donation pools
- **Student Verification**: Multiple verification methods
- **Merit Scoring**: On-chain score storage with proof hashes
- **Transparent Distribution**: Public scholarship allocation
- **Access Control**: Admin-only sensitive operations

## 🛠️ Development Scripts

```bash
# Frontend Development
npm run dev                    # Start Vite development server
npm run build                  # Build for production
npm run preview               # Preview production build

# Backend Development
npm run server                 # Start Express API server
npm run server:dev            # Start with hot reload

# Smart Contracts
cd contracts
npm run compile               # Compile Solidity contracts
npm run test                  # Run contract tests
npm run deploy:sei            # Deploy to Sei testnet

# MCP Integration
npm run mcp:demo              # Test full AI + blockchain workflow
npm run mcp:batch             # Process multiple students
npm run mcp:events            # Monitor blockchain events
npm run fund:scholarship      # Fund scholarship pool

# Utilities
npm run sync:deployment       # Update contract addresses
npm run lint                  # Run ESLint
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npm test
```

### API Integration Tests

```bash
# Test AI merit calculation
npm run mcp:test

# Test different student scenarios
npm run mcp:scenarios

# Test full integration workflow
npm run mcp:demo
```

## 📊 System Statistics

### Current Platform Status

- **Total Scholarships Distributed**: Real-time tracking
- **Students Helped**: Verified recipient count
- **Average Merit Score**: Platform-wide analysis
- **Fund Utilization**: Transparent allocation metrics
- **Transaction Speed**: <400ms confirmation times

## 🔒 Security Features

- **Multi-signature Admin**: Secure administrative controls
- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: API abuse prevention
- **Audit Trails**: Complete transaction history
- **Enrollment Verification**: Anti-fraud measures

## 🌍 Deployment

### Production Deployment

```bash
# Build frontend
npm run build

# Deploy to Vercel/Netlify
vercel --prod

# Deploy contracts to Sei Mainnet
cd contracts
npm run deploy:mainnet
```

## 📈 Roadmap

### Phase 1 (Current)

- ✅ Core scholarship distribution system
- ✅ AI-powered merit scoring
- ✅ Enrollment verification
- ✅ Admin approval workflow

### Phase 2 (Planned)

- 🔄 Multi-university partnerships
- 🔄 Advanced AI scoring models
- 🔄 Mobile application
- 🔄 Governance token integration

### Phase 3 (Future)

- 📋 Cross-chain compatibility
- 📋 DeFi yield farming for fund growth
- 📋 Alumni donation tracking
- 📋 Academic achievement NFTs

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Innovation Highlights

- **Novel Use Case**: First AI-driven scholarship platform on Sei
- **Technical Excellence**: Full-stack implementation with polished UI
- **Social Impact**: Democratizing education funding globally
