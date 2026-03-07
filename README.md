# ❗ Problem

Professionals often struggle to prove their contributions across multiple ecosystems.

Certificates, job records, community contributions, and project work are often scattered across different platforms and are difficult to verify.

Traditional resumes and centralized platforms do not provide **tamper-resistant verification of professional achievements**.

Because of this:

* Credentials can be falsified
* Contributions are hard to validate
* Professional reputation becomes fragmented across platforms

---

# 💡 Solution

Ghonsi Proof provides decentralized infrastructure where professional credentials become **verifiable digital proofs**.

Users can:

* Upload evidence of their work
* Automatically extract metadata using AI
* Store documents on decentralized storage
* Anchor proof records permanently on blockchain

This creates a **portable and verifiable Web3 professional identity**.

---

# 🚀 Live Demo

**Application**

[https://ghonsi-proof.vercel.app](https://ghonsi-proof.vercel.app)

**Example Public Portfolio**

[https://ghonsi-proof.vercel.app/publicProfile](https://ghonsi-proof.vercel.app/publicProfile)

---

### Demo Flow

1. Create account using wallet or email
2. Upload a professional proof document
3. AI extraction parses the document
4. File + metadata stored on IPFS
5. Verification record anchored on Solana
6. Portfolio updates with verifiable credential

---

# ✨ Features

## Core Platform Features

* Wallet + Email authentication
* Multi-wallet support (Phantom, Solflare, Backpack, Glow)
* Professional proof uploads
* AI document extraction using Claude
* Confidence scoring for extracted metadata
* CRE workflow orchestration
* IPFS storage using Pinata
* Blockchain anchoring on Solana
* Soulbound NFT credentials
* Public professional portfolios
* Peer verification requests
* Admin verification dashboard

---

## Security Features

* Row Level Security via Supabase
* Wallet signature authentication
* Soulbound credentials
* Decentralized file storage
* Secure backend verification pipeline

---

# 🏗 Architecture

Ghonsi Proof uses an **event-driven verification pipeline** where CRE orchestrates the processing of uploaded proofs.

```
User Upload
     │
     ▼
Supabase Database
     │
     ▼
CRE Workflow Trigger
     │
     ▼
AI Extraction (Claude)
     │
     ▼
Pinata IPFS Storage
     │
     ▼
Solana Blockchain Anchor
     │
     ▼
Portfolio Update
```
---

## 🏗 Architecture diagram

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
│ - RLS          │ │ - CRE Webhook│ │ - Confidence │ │ - Verify     │
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


*### *Workflow Explanation*

**1 Upload**

User submits a document and metadata.

**2 Database Record**

Proof is stored in Supabase with status:

```
pending
```

**3 CRE Workflow**

Chainlink CRE orchestrates the verification pipeline.

**4 AI Extraction**

Claude extracts structured metadata and assigns confidence scores.

**5 IPFS Storage**

Evidence file and metadata are uploaded to IPFS via Pinata.

**6 Blockchain Anchoring**

Proof metadata hash is anchored on Solana.

**7 Portfolio Update**

User portfolio displays:

* Raw document
* Extracted metadata JSON
* IPFS link
* Blockchain transaction ID

---

# 🔐 Why Blockchain

Blockchain ensures credentials become:

### Tamper Resistant

Once anchored on-chain, proof metadata cannot be altered.

### Verifiable

Anyone can verify the transaction on-chain.

### Portable

Users own their credentials instead of relying on centralized platforms.

### Trustless

Verification does not depend on a single platform.

---

# 🛠 Tech Stack

## Frontend

* React
* React Router
* Tailwind CSS
* Framer Motion
* Lucide Icons

---

## Blockchain

* Solana Web3.js
* Anchor Framework
* SPL Token

---

## Backend

* Node.js
* Express
* Supabase JS

---

## AI Extraction

* Django
* Django REST Framework
* Anthropic Claude
* Tesseract OCR
* PyPDF2
* Pillow

---

## Infrastructure

* Supabase (Database + Auth)
* Pinata (IPFS)
* Vercel (Frontend)
* Render (Backend)

---

# 📁 Project Structure

```
ghonsi-proof/

src/                React frontend
backend/            Node backend API
extraction_api/     Django AI extraction service
ghonsi_proof/       Solana smart contract
cre-agent/          CRE orchestration scripts
public/
scripts/
```

---

# 📦 Prerequisites

Required software:

* Node.js 18+
* Python 3.11+
* Rust
* Solana CLI
* Anchor CLI
* Git

Required accounts:

* Supabase
* Pinata
* Anthropic API
* Solana wallet

---

# 🚀 Installation

### Clone repository

```
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof
```

---

### Install frontend

```
npm install
```

---

### Install backend

```
cd backend
npm install
```

---

### Install extraction API

```
cd extraction_api
pip install -r requirements.txt
```

---

### Build smart contract

```
cd ghonsi_proof
anchor build
```

---

# ⚙️ Configuration

Environment variables required:

```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_API_URL=
REACT_APP_PINATA_JWT=
REACT_APP_SOLANA_NETWORK=devnet
```

---

# 🏃 Running the Application

### Frontend

```
npm start
```

Runs at:

```
http://localhost:3000
```

---

### Backend

```
cd backend
npm start
```

Runs at:

```
http://localhost:3001
```

---

### Extraction API

```
cd extraction_api
python manage.py runserver
```

Runs at:

```
http://localhost:8000
```

---

# 🔄 CRE Workflow Simulation

For development and demonstration, the CRE pipeline can be simulated locally.

Navigate to the CRE agent directory:

```
cd cre-agent
```

Run the workflow simulation:

```
node simulate.js
```

---

### Simulation Flow

```
Step 1 → Fetch pending proofs from Supabase
Step 2 → Run AI extraction on uploaded documents
Step 3 → Upload metadata to IPFS via Pinata
Step 4 → Anchor proof record on Solana
Step 5 → Update status from pending → verified
```

---

# 🔗 Smart Contract

The Solana smart contract manages proof credentials.

Capabilities:

* Mint proof NFTs
* Verify proofs
* Reject proofs
* Manage admins
* Enforce soulbound tokens

---

### Program ID

```
5N6CH3GTndpqdiTHrqPutaypu5Zxy4BDVMwnq88LckNv
```

---

### Instructions

```
initialize
add_admin
remove_admin
mint_proof
verify_proof
reject_proof
```

---

# 🔌 Backend API

Handles:

* Messaging system
* Blockchain submission
* CRE webhook triggers
* Supabase service operations

Example endpoints:

```
GET /health
POST /api/messages
POST /api/submit-proof
POST /api/cre/trigger
```

---

# 🤖 Extraction API

AI document extraction service.

Capabilities:

* OCR processing
* Document parsing
* Claude AI extraction
* Confidence scoring

---

### Endpoint

```
POST /api/extract/
```

Example response:

```
{
  "proof_type": "certificate",
  "extracted_data": {
    "title": "Advanced React",
    "issuer": "Udemy",
    "completion_date": "2024-01-15"
  },
  "confidence": 0.95
}
```

---

# 💻 Frontend Application

Key pages:

```
/
login
dashboard
upload
portfolio
publicProfile
```

---

### Upload Pipeline

```
1 Upload document
2 AI extraction runs
3 File stored on IPFS
4 Metadata anchored on Solana
5 CRE pipeline processes verification
6 Portfolio updates with proof record
```

---

# 🌐 Deployment

### Frontend

Vercel

[https://ghonsi-proof.vercel.app](https://ghonsi-proof.vercel.app)

---

### Backend

Render

---

### Extraction API

Render

---

### Blockchain

Solana Devnet

---

# 👥 Team

Prosper Ayere — Founder & Product Lead
Godwin Adakonye John — Blockchain Engineer
Progress Ayere — Lead Frontend Engineer
Gunduor Victor — Frontend Engineer
Nie Osaoboh — Product Designer
Success Ola-Ojo — Advisor

---

# 📄 License

Proprietary — All rights reserved by Ghonsi Proof.

---  

# 🙏 Acknowledgments

Solana Foundation
Supabase
Anthropic
Pinata
Open Source Community

---

**Built with ❤️ by the Ghonsi Proof Team**
