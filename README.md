# Ghonsi Proof

**The On-Chain Trust Engine for the Web3 Workforce.**

Ghonsi Proof is a decentralized platform built on Solana that transforms scattered professional contributions into a single verifiable on-chain identity. We help Web3 professionals prove their skills, authenticate their work, and showcase verified credentials through blockchain-anchored NFT certificates.

---

## 📋 Table of Contents

* [Overview](https://www.google.com/search?q=%23overview)
* [Features](https://www.google.com/search?q=%23features)
* [Architecture](https://www.google.com/search?q=%23architecture)
* [Tech Stack](https://www.google.com/search?q=%23tech-stack)
* [Project Structure](https://www.google.com/search?q=%23project-structure)
* [Prerequisites](https://www.google.com/search?q=%23prerequisites)
* [Installation](https://www.google.com/search?q=%23installation)
* [Configuration](https://www.google.com/search?q=%23configuration)
* [Running the Application](https://www.google.com/search?q=%23running-the-application)
* [Smart Contract](https://www.google.com/search?q=%23smart-contract)
* [Backend API](https://www.google.com/search?q=%23backend-api)
* [Extraction API](https://www.google.com/search?q=%23extraction-api)
* [Frontend Application](https://www.google.com/search?q=%23frontend-application)
* [Deployment](https://www.google.com/search?q=%23deployment)
* [API Documentation](https://www.google.com/search?q=%23api-documentation)
* [Contributing](https://www.google.com/search?q=%23contributing)
* [Team](https://www.google.com/search?q=%23team)
* [License](https://www.google.com/search?q=%23license)

---

## 🎯 Overview

Ghonsi Proof solves the trust problem in Web3 by providing:

* **Verifiable Credentials**: Upload certificates, work history, skills, and achievements
* **Blockchain Anchoring**: All proofs are minted as soulbound NFTs on Solana
* **AI-Powered Extraction**: Automatic data extraction from documents using Claude AI
* **Automated CRE Verification**: Chainlink CRE Agents silently verify document authenticity in the background
* **IPFS Storage**: Decentralized file storage via Pinata
* **Public Portfolios**: Shareable on-chain professional profiles
* **Peer Verification**: Request verification from colleagues and organizations

---

## ✨ Features

### Core Features

* **Multi-Wallet Support**: Phantom, Solflare, Backpack, Glow wallet integration
* **Email Authentication**: Magic link authentication via Supabase
* **Proof Types**: Certificates, Job History, Skills, Milestones, Community Contributions
* **Document Upload**: Support for PDF, JPG, PNG, DOC, DOCX (up to 2MB)
* **AI Extraction**: Automatic field extraction from uploaded documents
* **Background Validation**: Chainlink CRE agent verifies document data accuracy post-upload
* **Blockchain Minting**: Soulbound NFT certificates on Solana
* **IPFS Storage**: Dual upload (file + metadata) to IPFS via Pinata
* **Admin Dashboard**: Proof verification and management system
* **Public Profiles**: Shareable portfolio pages with verified credentials
* **Verification Requests**: Request proof verification from peers
* **Real-time Notifications**: Toast notifications for user actions and background status changes
* **Responsive Design**: Mobile-first design with Tailwind CSS

### Security Features

* **Row Level Security (RLS)**: Database-level access control
* **Soulbound NFTs**: Non-transferable proof certificates
* **Wallet Signatures**: Cryptographic proof of ownership
* **Admin Multi-Sig**: Support for up to 10 program admins
* **Encrypted Storage**: Secure file storage on Supabase

---

## 🏗 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  - User Interface                                           │
│  - Wallet Integration                                       │
│  - Form Management                                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase     │ │   Backend    │ │ Extraction   │ │   Solana     │
│   Database     │ │     API      │ │     API      │ │   Blockchain │
│                │ │              │ │              │ │              │
│ - PostgreSQL   │ │ - Messages   │ │ - AI OCR     │ │ - Smart      │
│ - Auth         │ │ - Blockchain │ │ - Document   │ │   Contract   │
│ - Storage      │ │   Submit     │ │   Processing │ │ - NFT Mint   │
│ - RLS          │ │ - CRE Webhook│ │              │ │ - Verify     │
└───────┬────────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
        │                 │                │                │
        │                 ▼                │                │
        │          ┌──────────────┐        │                │
        │          │  Chainlink   │        │                │
        └─────────>│  CRE Agent   │<───────┘                │
                   │ (Background) │                         │
                   └──────┬───────┘                         │
                          │                                 │
                          ▼                                 ▼
                   ┌──────────────┐                  ┌──────────────┐
                   │    IPFS      │                  │    IPFS      │
                   │   (Pinata)   │                  │   (Pinata)   │
                   │              │                  │              │
                   │ - Files      │                  │ - Files      │
                   │ - Metadata   │                  │ - Metadata   │
                   └──────────────┘                  └──────────────┘

```

---

## 🛠 Tech Stack

### Frontend

* **React** 18.2.0 - UI library
* **React Router DOM** 6.28.0 - Client-side routing
* **Tailwind CSS** 3.4.18 - Utility-first CSS
* **Framer Motion** 12.31.0 - Animations
* **Lucide React** 0.555.0 - Icons
* **FontAwesome** 7.1.0 - Additional icons

### Blockchain

* **Solana Web3.js** 1.98.4 - Solana JavaScript API
* **Wallet Adapter** 0.15.39 - Multi-wallet support
* **Anchor Framework** 0.32.1 - Solana smart contract framework
* **SPL Token** 0.4.14 - Token program integration
* **Chainlink CRE** - Cross-Chain verification agent

### Backend

* **Node.js** 18+ - Runtime environment
* **Express** 4.18.2 - Web framework
* **Supabase JS** 2.89.0 - Database client
* **CORS** 2.8.5 - Cross-origin resource sharing

### Extraction API

* **Django** 6.0.2 - Python web framework
* **Django REST Framework** 3.16.1 - API framework
* **Anthropic Claude** - AI document extraction
* **Tesseract OCR** 0.3.13 - Optical character recognition
* **PyPDF2** 3.0.1 - PDF processing
* **Pillow** 12.1.1 - Image processing

### Database & Storage

* **Supabase** - PostgreSQL database + Auth + Storage
* **IPFS (Pinata)** - Decentralized file storage

### Deployment

* **Vercel** - Frontend hosting
* **Render** - Backend API hosting
* **Render** - Extraction API hosting
* **Solana Devnet** - Smart contract deployment

---

## 📁 Project Structure

```text
ghonsi-proof/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── header/              # Navigation header
│   │   ├── footer/              # Footer component
│   │   ├── Toast.jsx            # Toast notifications
│   │   └── TransactionSignerModal.jsx  # Wallet transaction modal
│   ├── pages/                    # Page components
│   │   ├── home/                # Landing page
│   │   ├── login/               # Authentication
│   │   ├── dashboard/           # User dashboard
│   │   ├── upload/              # Proof upload
│   │   ├── portfolio/           # User portfolio
│   │   ├── publicProfile/       # Public profile view
│   │   ├── request/             # Verification requests
│   │   ├── createProfile/       # Profile creation
│   │   ├── about/               # About page
│   │   ├── faq/                 # FAQ page
│   │   ├── contact/             # Contact page
│   │   ├── terms/               # Terms of service
│   │   └── policy/              # Privacy policy
│   ├── utils/                    # Utility functions
│   │   ├── supabaseAuth.js      # Authentication utilities
│   │   ├── profileApi.js        # Profile management
│   │   ├── proofsApi.js         # Proof management
│   │   ├── verificationApi.js   # Verification requests
│   │   ├── extractionApi.js     # Document extraction
│   │   ├── pinataUpload.js      # IPFS upload
│   │   ├── blockchainSubmission.js  # Blockchain integration
│   │   └── formPersistence.js   # Form state management
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.js           # Authentication hook
│   │   └── useWallet.js         # Wallet connection hook
│   ├── config/                   # Configuration files
│   │   └── supabaseClient.js    # Supabase client setup
│   ├── assets/                   # Static assets
│   │   ├── ghonsi-proof-logos/  # Brand logos
│   │   ├── team/                # Team photos
│   │   └── wallet-icons/        # Wallet icons
│   ├── App.js                    # Main app component
│   └── index.js                  # Entry point
│
├── backend/                      # Node.js backend API
│   ├── server.js                 # Express server
│   ├── package.json              # Backend dependencies
│   └── .env                      # Backend environment variables
│
├── extraction_api/               # Django extraction API
│   ├── extraction/               # Main app
│   │   ├── views.py             # API endpoints
│   │   ├── ocr.py               # OCR processing
│   │   ├── extractor.py         # AI extraction logic
│   │   ├── document_processor.py # Document handling
│   │   └── urls.py              # URL routing
│   ├── config/                   # Django settings
│   ├── requirements.txt          # Python dependencies
│   └── manage.py                 # Django management
│
├── ghonsi_proof/                 # Solana smart contract
│   ├── programs/                 # Anchor programs
│   │   └── ghonsi_proof/
│   │       └── src/
│   │           └── lib.rs       # Smart contract code
│   ├── tests/                    # Contract tests
│   ├── idl/                      # Interface definition
│   ├── Anchor.toml               # Anchor configuration
│   └── Cargo.toml                # Rust dependencies
│
├── public/                       # Static files
├── scripts/                      # Database migration scripts
├── package.json                  # Frontend dependencies
├── tailwind.config.js            # Tailwind configuration
├── craco.config.js               # CRACO configuration
└── README.md                     # This file

```

---

## 📦 Prerequisites

### Required Software

* **Node.js** 18.x or higher - [Download](https://nodejs.org/)
* **npm** 8.x or higher (comes with Node.js)
* **Git** - [Download](https://git-scm.com/)
* **Rust** 1.70+ (for smart contract development) - [Install](https://rustup.rs/)
* **Solana CLI** 1.18+ (for smart contract deployment) - [Install](https://docs.solana.com/cli/install-solana-cli-tools)
* **Anchor CLI** 0.32+ (for smart contract framework) - [Install](https://www.anchor-lang.com/docs/installation)
* **Python** 3.11+ (for extraction API) - [Download](https://www.python.org/)

### Required Accounts

* **Supabase Account** - [Sign up](https://supabase.com)
* **Pinata Account** - [Sign up](https://pinata.cloud)
* **Anthropic API Key** - [Get key](https://console.anthropic.com/)
* **Solana Wallet** - Phantom, Solflare, or any Solana wallet

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof/ghonsi-proof

```

### 2. Install Frontend Dependencies

```bash
npm install

```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..

```

### 4. Install Extraction API Dependencies

```bash
cd extraction_api
pip install -r requirements.txt
cd ..

```

### 5. Install Smart Contract Dependencies

```bash
cd ghonsi_proof
npm install
anchor build
cd ..

```

---

## ⚙️ Configuration

### Frontend Environment Variables

Create `.env` in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Backend API (Render)
REACT_APP_API_URL=https://your-render-app.onrender.com

# API URL FOR PROOF EXTRACTION
STANDARD_API_KEY=https://your-extraction-api.onrender.com

# Solana Configuration
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=your_solana_program_id_here
SOLANA_BACKEND_PRIVATE_KEY=[your_solana_backend_private_key_array_here]

# Pinata Configuration (for IPFS storage)
REACT_APP_PINATA_JWT=your_pinata_jwt_here
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_API_SECRET=your_pinata_api_secret_here

# Treasury Wallet Configuration (for document proof payments)
REACT_APP_TREASURY_WALLET=EKGNwqNBUBtH5Fnmcjjoj4Tci6dCXdcCrxcjTaWm5bLf

# CRE Agent Configuration
REACT_APP_CRE_ENDPOINT=https://your-cre-webhook.com

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id

```

### Backend Environment Variables

Create `backend/.env`:

```env
# Supabase Service Role (Admin Access)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_BACKEND_PRIVATE_KEY=[1,2,3,...]  # Array format
PROGRAM_ID=5N6CH3GTndpqdiTHrqPutaypu5Zxy4BDVMwnq88LckNv
COLLECTION_MINT_ADDRESS=your-collection-mint

# Server Configuration
PORT=3001

```

### Extraction API Environment Variables

Create `extraction_api/.env`:

```env
# Anthropic API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Django Settings
DEBUG=False
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://ghonsi-proof.vercel.app

```

---

## 🏃 Running the Application

### Development Mode (All Services)

#### Terminal 1: Frontend

```bash
npm start
# Runs on http://localhost:3000

```

#### Terminal 2: Backend API

```bash
cd backend
npm start
# Runs on http://localhost:3001

```

#### Terminal 3: Extraction API

```bash
cd extraction_api
python manage.py runserver
# Runs on http://localhost:8000

```

#### Terminal 4: Solana Localnet (Optional)

```bash
cd ghonsi_proof
solana-test-validator
# Runs local Solana validator

```

### Production Build

```bash
# Build frontend
npm run build

# Build output in /build directory

```

---

## 🔗 Smart Contract

### Overview

The Ghonsi Proof smart contract is built with Anchor Framework on Solana. It handles:

* NFT minting for proof certificates
* Admin management (up to 10 admins)
* Proof verification and rejection
* Soulbound token implementation (non-transferable)

### Key Features

* **Soulbound NFTs**: Proofs are minted as frozen (non-transferable) NFTs
* **Multi-Admin System**: Primary admin can add/remove up to 10 secondary admins
* **Proof States**: Pending → Verified/Rejected
* **Mint Fee**: 0.01 SOL per proof mint
* **Metaplex Integration**: Full NFT metadata support

### Program ID

```text
5N6CH3GTndpqdiTHrqPutaypu5Zxy4BDVMwnq88LckNv

```

### Instructions

1. **initialize**: Initialize program authority
2. **add_admin**: Add secondary admin (primary admin only)
3. **remove_admin**: Remove secondary admin (primary admin only)
4. **mint_proof**: Mint proof NFT certificate
5. **verify_proof**: Verify pending proof (admin only)
6. **reject_proof**: Reject pending proof with reason (admin only)

### Building & Deploying

```bash
cd ghonsi_proof

# Build program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet

```

### Testing

```bash
# Run all tests
anchor test

# Run specific test
anchor test --skip-local-validator

```

---

## 🔌 Backend API

### Overview

Node.js/Express backend handling:

* Message system between users
* Blockchain proof submission
* Supabase service role operations
* Background webhooks for CRE Agent

### Endpoints

#### Health Check

```text
GET /health

```

#### Messages

```text
POST   /api/messages                    # Send message
GET    /api/messages/:userId            # Get user messages
PATCH  /api/messages/:messageId/read    # Mark as read
DELETE /api/messages/:messageId         # Delete message
PATCH  /api/messages/:messageId/respond # Respond to message

```

#### Blockchain & Verification

```text
POST /api/submit-proof                  # Submit proof to blockchain
POST /api/cre/trigger                   # Trigger CRE Agent webhook

```

### Running Backend

```bash
cd backend
npm install
npm start

```

### Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `backend/.env`

---

## 🤖 Extraction API

### Overview

Django REST API using Claude AI for intelligent document extraction:

* Automatic field extraction from certificates, job letters, etc.
* OCR for image-based documents
* PDF text extraction
* Confidence scoring and validation

### Supported Proof Types

* **job**: Job history/work experience
* **certificate**: Certificates and training
* **skill**: Skills and competencies
* **milestone**: Career milestones (promotions, awards)
* **contribution**: Community contributions (talks, articles, open source)

### Endpoints

```text
POST /api/extract/

```

**Request:**

```bash
curl -X POST http://localhost:8000/api/extract/ \
  -F "file=@certificate.pdf" \
  -F "proof_type=certificate"

```

**Response:**

```json
{
  "proof_type": "certificate",
  "extracted_data": {
    "certificate_title": "React Advanced Course",
    "issuer": "Udemy",
    "completion_date": "2024-01-15",
    "credential_type": "Course",
    "confidence": {
      "certificate_title": 0.95,
      "issuer": 0.95
    },
    "needs_review": false
  },
  "validation_hash": "3a9244f13222...",
  "cached": false
}

```

### Running Extraction API

```bash
cd extraction_api
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```

### Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set root directory: `extraction_api`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn config.wsgi:application`
6. Add environment variables

---

## 💻 Frontend Application

### Key Pages

#### Home (`/`)

Landing page with hero section, features, and call-to-action

#### Login (`/login`)

* Email magic link authentication
* Multi-wallet connection (Phantom, Solflare, Backpack, Glow)

#### Dashboard (`/dashboard`)

User dashboard showing:

* Proof statistics
* Recent proofs
* Verification requests
* Quick actions

#### Upload Workflow & CRE Verification (`/upload`)

The core proof submission pipeline happens here seamlessly:

1. **Details:** User selects proof type and fills details.
2. **Extraction:** User uploads document; the Extraction API auto-fills fields via Claude AI.
3. **Sign Transaction:** User connects wallet & signs the upload transaction.
4. **Anchor:** Document uploaded to IPFS (File + Metadata) and NFT minted on Solana. Initial status is set to `pending`.
5. **Background CRE Validation:** The Chainlink CRE Agent is silently triggered via webhook to cross-reference and verify data accuracy without blocking the user interface.
6. **Portfolio Auto-Update:** Once the CRE Agent confirms the proof is valid, the UI automatically updates the user's Portfolio page from `pending` to `verified`.

#### Portfolio (`/portfolio`)

User's proof collection with:

* Filter by type and status (Pending/Verified/Rejected)
* Search functionality
* Proof cards with details
* View on Solscan links

#### Public Profile (`/publicProfile`)

Shareable portfolio page:

* Public proof display
* Verification badges
* Social links
* Contact form

### Wallet Integration

```javascript
import { useWallet } from './hooks/useWallet';

function Component() {
  const { publicKey, connected, connectWallet, disconnect } = useWallet();
  
  return (
    <button onClick={connectWallet}>
      {connected ? publicKey.toString() : 'Connect Wallet'}
    </button>
  );
}

```

### Authentication

```javascript
import { getCurrentUser, logout } from './utils/supabaseAuth';

// Get current user
const user = await getCurrentUser();

// Logout
await logout();

```

---

## 🌐 Deployment

### Frontend (Vercel)

**Live URL**: [https://ghonsi-proof.vercel.app](https://ghonsi-proof.vercel.app)

1. Connect GitHub repository to Vercel
2. Configure build settings:
* Framework: Create React App
* Build command: `npm run build`
* Output directory: `build`


3. Add environment variables
4. Deploy

### Backend (Render)

1. Create Web Service
2. Root directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables

### Extraction API (Render)

1. Create Web Service
2. Root directory: `extraction_api`
3. Build: `pip install -r requirements.txt`
4. Start: `gunicorn config.wsgi:application`
5. Add environment variables

### Smart Contract (Solana)

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <PROGRAM_ID> --url devnet

```

---

## 📚 API Documentation

### Supabase Database Schema

#### Tables

**users**

* `id` (uuid, primary key)
* `email` (text, unique)
* `wallet_address` (text, unique)
* `created_at` (timestamp)

**profiles**

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key)
* `display_name` (text)
* `bio` (text)
* `profession` (text)
* `is_public` (boolean)
* `avatar_url` (text)

**proofs**

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key)
* `proof_type` (text)
* `proof_name` (text)
* `summary` (text)
* `reference_link` (text)
* `status` (text: pending/verified/rejected) *— Transitions handled silently by CRE Agent*
* `ai_confidence_score` (numeric)
* `ipfs_hash` (text)
* `ipfs_url` (text)
* `file_ipfs_hash` (text)
* `file_ipfs_url` (text)
* `transaction_hash` (text)
* `extracted_data` (jsonb)
* `created_at` (timestamp)

**verification_requests**

* `id` (uuid, primary key)
* `proof_id` (uuid, foreign key)
* `requester_id` (uuid, foreign key)
* `verifier_email` (text)
* `verifier_name` (text)
* `relationship` (text)
* `message` (text)
* `status` (text: pending/approved/rejected)
* `created_at` (timestamp)

**messages**

* `id` (uuid, primary key)
* `sender_id` (uuid, foreign key)
* `receiver_id` (uuid, foreign key)
* `portfolio_id` (uuid)
* `message` (text)
* `sender_name` (text)
* `sender_email` (text)
* `type` (text)
* `read` (boolean)
* `status` (text)
* `created_at` (timestamp)

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open Pull Request

### Commit Convention

```text
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies

```

### Code Style

* Use ESLint and Prettier
* Follow React best practices
* Write meaningful commit messages
* Add comments for complex logic
* Update documentation

---

## 👥 Team

* **Prosper Ayere** - Founder & Product Lead
* **Godwin Adakonye John** - Blockchain Engineer
* **Progress Ayere** - Lead Frontend Engineer
* **Gunduor Victor** - Frontend Engineer 
* **Nie Osaoboh** - Product Designer
* **Success Ola-Ojo** - Advisor

---

## 📞 Support

* **Email**: support@ghonsiproof.com
* **Twitter**: [@Ghonsiproof](https://x.com/Ghonsiproof)
* **Discord**: [Join community](https://discord.com/)
* **Website**: [ghonsiproof.com](https://ghonsi-proof.vercel.app)

---

## 📄 License

This project is proprietary and confidential. All rights reserved by Ghonsi Proof.

---

## 🙏 Acknowledgments

* Solana Foundation
* Anchor Framework Team
* Supabase Team
* Anthropic (Claude AI)
* Chainlink Build
* Web3 Community
* All contributors and supporters

---

**Built with ❤️ by the Ghonsi Proof Team**

*Making Web3 professional verification accessible to everyone.*
