# FineScholar API Server

This is the backend API server for the FineScholar scholarship management system. It provides AI-powered merit score calculations and blockchain integration for student applications.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Gemini API key from Google AI Studio
- A Sei testnet wallet private key (for admin functions)

### Environment Setup

1. Fill in your environment variables in `.env`:

```bash
# API Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Gemini AI Configuration - Get from https://aistudio.google.com/
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Admin wallet private key (testnet only!)
ADMIN_PRIVATE_KEY=your_actual_admin_private_key_here
```

### Running the Server

#### Development (with auto-reload)

```bash
npm run server:dev
```

#### Production

```bash
npm run server
```

#### Full Stack (Frontend + Backend)

```bash
npm run dev:full
```

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

Returns server status and version information.

**Response:**

```json
{
  "success": true,
  "message": "FineScholar API is healthy",
  "timestamp": "2025-07-20T05:48:52.460Z",
  "version": "1.0.0"
}
```

### Process Student Application

```
POST /api/process-application
```

Processes a student scholarship application using AI merit score calculation and submits to blockchain.

**Request Body:**

```json
{
  "studentId": "STU001",
  "gpa": 3.8,
  "financialNeed": 75,
  "volunteerHours": 120,
  "academicYear": "Junior",
  "major": "Computer Science",
  "university": "Tech University",
  "additionalInfo": "Active in coding clubs and community service",
  "address": "0x742d35Cc6075Ae5D15aDfF5A81Fd1EdCa98c12f8"
}
```

**Request Validation:**

- `address`: Valid Ethereum address
- `studentId`: Required string
- `gpa`: Number between 0-4.0
- `financialNeed`: Number between 0-100
- `volunteerHours`: Number >= 0
- `major`, `university`, `academicYear`: Required strings

**Success Response:**

```json
{
  "success": true,
  "transactionHash": "0x1234567890abcdef...",
  "meritScore": 85,
  "breakdown": {
    "gpaScore": 47.5,
    "financialNeedScore": 22.5,
    "volunteerScore": 15,
    "totalScore": 85
  },
  "reasoning": "Strong academic performance with high GPA and significant community involvement through volunteer work.",
  "proofHash": "0xabcdef1234567890...",
  "message": "Application processed successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid student address",
  "message": "Detailed error message"
}
```

## 🧠 AI Merit Score Calculation

The system uses Google's Gemini AI to calculate fair and consistent merit scores based on:

### Scoring Components

- **GPA Score (0-50 points)**: Based on 4.0 scale performance
- **Financial Need Score (0-30 points)**: Higher need = higher score
- **Volunteer Score (0-20 points)**: Community service hours

### AI Features

- Contextual analysis of student profile
- Reasoning explanations for scores
- Fallback calculation if AI unavailable
- Proof hash generation for blockchain verification

## 🔗 Blockchain Integration

### Smart Contract Functions

- **Student Verification**: Marks student as verified in system
- **Merit Score Storage**: Stores AI-calculated scores on-chain
- **Proof Hash Verification**: Links AI reasoning to blockchain record

### Sei Testnet Details

- **Network**: Sei Arctic-1 Testnet
- **Chain ID**: 1328
- **RPC**: https://evm-rpc-testnet.sei-apis.com

## 🔐 Security Features

### Authentication

- Admin-only blockchain functions
- Address validation for all operations
- Request validation and sanitization

### Data Protection

- Environment variable isolation
- Error message sanitization in production
- Blockchain proof verification

## 🛠 Development

### Project Structure

```
server/
├── index.ts              # Main server file
└── routes/
    ├── health.ts          # Health check endpoint
    └── processApplication.ts # Main application processing logic
```

### Key Dependencies

- **Express**: Web server framework
- **Ethers.js**: Blockchain interaction
- **@google/generative-ai**: Gemini AI integration
- **CORS**: Cross-origin request handling
- **dotenv**: Environment variable management

### Error Handling

- Comprehensive try-catch blocks
- Fallback calculations for AI failures
- Blockchain transaction error recovery
- Detailed logging for debugging

## 🧪 Testing

### API Testing with curl

```bash
# Health check
curl http://localhost:3001/api/health

# Application processing (replace with real data)
curl -X POST http://localhost:3001/api/process-application \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "gpa": 3.8,
    "financialNeed": 75,
    "volunteerHours": 120,
    "academicYear": "Junior",
    "major": "Computer Science",
    "university": "Tech University",
    "address": "0x742d35Cc6075Ae5D15aDfF5A81Fd1EdCa98c12f8"
  }'
```

### Frontend Integration

The frontend automatically proxies `/api/*` requests to the backend server when running in development mode.

## 📝 Environment Variables Reference

| Variable                        | Description              | Required | Example                              |
| ------------------------------- | ------------------------ | -------- | ------------------------------------ |
| `PORT`                          | Server port              | No       | 3001                                 |
| `NODE_ENV`                      | Environment              | No       | development                          |
| `FRONTEND_URL`                  | Frontend URL for CORS    | No       | http://localhost:5173                |
| `GEMINI_API_KEY`                | Google AI Studio API key | Yes      | AIzaSy...                            |
| `ADMIN_PRIVATE_KEY`             | Admin wallet private key | Yes      | 0x123...                             |
| `SEI_RPC_URL`                   | Sei network RPC endpoint | No       | https://evm-rpc-testnet.sei-apis.com |
| `VITE_SCHOLARSHIP_FUND_ADDRESS` | Smart contract address   | No       | 0x25c21f...                          |

## 🚨 Important Notes

1. **Never use mainnet private keys** - Only use testnet keys for development
2. **Secure your Gemini API key** - Don't commit it to version control
3. **Test thoroughly** - Verify all blockchain transactions on testnet first
4. **Monitor resources** - AI API calls have usage limits and costs

## 🆘 Troubleshooting

### Common Issues

**Server won't start:**

- Check if port 3001 is available
- Verify all required environment variables are set
- Ensure Node.js version is 18+

**AI calculation fails:**

- Verify Gemini API key is valid and has quota
- Check internet connection for API calls
- System will fall back to mathematical calculation

**Blockchain submission fails:**

- Verify admin private key is valid
- Check Sei testnet RPC is accessible
- Ensure contract addresses are correct
- Confirm wallet has sufficient testnet SEI for gas

**CORS errors:**

- Check FRONTEND_URL matches your frontend port
- Verify cors middleware is properly configured
- Test with direct API calls first

For additional support, check the main project README or open an issue.
