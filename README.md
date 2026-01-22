# TimeVault - Private Digital Time Capsule on Aleo

> Send messages to the future with Zero-Knowledge privacy. A decentralized time-locked vault system built on the Aleo blockchain.

## Overview

TimeVault is a privacy-first digital time capsule platform that allows users to create encrypted messages, notes, and digital assets that can only be unlocked at a specific future date. Using Aleo's zero-knowledge proof technology, all time-lock conditions are verified on-chain without revealing any private data.



### Key Features

- **Privacy First**: End-to-end encryption with client-side key management
- **Time-Locked Security**: Immutable unlock conditions enforced by smart contracts
- **Zero-Knowledge Proofs**: Verify unlock conditions without exposing private data
- **Digital Legacy**: Pass on secrets, messages, and assets to loved ones
- **AI Enhancement**: Optional AI-powered message enhancement using Google Gemini
- **IPFS Storage**: Decentralized content storage via Pinata

## Live Deployed Contracts

Both smart contracts are deployed and verified on **Aleo Testnet**:

| Contract | Program ID | Explorer Link |
|----------|------------|---------------|
| **Main Vault** | `timevault_main_9482.aleo` | [View on Explorer](https://testnet.explorer.provable.com/program/timevault_main_9482.aleo) |
| **Subscription** | `timevault_subscription_9483.aleo` | [View on Explorer](https://testnet.explorer.provable.com/program/timevault_subscription_9483.aleo) |

### Contract Addresses

```
Main Vault Contract:      timevault_main_9482.aleo
Subscription Contract:    timevault_subscription_9483.aleo
Network:                  Aleo Testnet
RPC Endpoint:             https://api.explorer.provable.com/v2
```

## How It Works

### 1. Create & Encrypt
Users write their message or upload content, which is encrypted locally in the browser using AES-256 encryption. The encryption key is derived from the user's wallet address + vault ID.

### 2. Store on IPFS
The encrypted content is uploaded to IPFS via Pinata, providing decentralized, immutable storage. Only the IPFS hash (CID) is stored on-chain.

### 3. Lock on Aleo
A time-lock is created on the Aleo blockchain by calling the `create_vault` function. This stores:
- Creator and recipient addresses
- IPFS hash (split into two field elements)
- Unlock timestamp
- Vault metadata

### 4. Zero-Knowledge Unlock
When the unlock time arrives, users can call `unlock_vault` which generates a ZK proof verifying:
- The caller is the authorized recipient or creator
- The current time is >= unlock time
- The vault hasn't already been unlocked

No private data is revealed during verification.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Create  │  │Dashboard │  │  Vault   │  │  Subscription    │ │
│  │  Page    │  │  Page    │  │  Detail  │  │  Page            │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Wallet Integration                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Puzzle Wallet (@puzzlehq/sdk-core)          │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Backend Services                            │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────────┐    │
│  │  Supabase  │  │   Pinata   │  │     Google Gemini       │    │
│  │  Database  │  │   (IPFS)   │  │     (AI Enhance)        │    │
│  └────────────┘  └────────────┘  └─────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                   Aleo Blockchain (Testnet)                      │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │  timevault_main_9482    │  │  timevault_subscription     │   │
│  │  - create_vault()       │  │  - subscribe_pro()          │   │
│  │  - unlock_vault()       │  │  - check_subscription()     │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Smart Contract Functions

### timevault_main_9482.aleo

| Function | Description | Inputs |
|----------|-------------|--------|
| `create_vault` | Creates a new time-locked vault | recipient, ipfs_hash, unlock_time, unlock_type, vault_type, current_time |
| `unlock_vault` | Unlocks a vault after time passes | vault_id, current_time |

### Data Structures

```leo
struct VaultData {
    creator: address,
    recipient: address,
    ipfs_hash_part1: field,
    ipfs_hash_part2: field,
    unlock_time: u64,
    unlock_type: u8,
    vault_type: u8,
    is_unlocked: bool,
    created_at: u64,
}
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animations | Framer Motion |
| Blockchain | Aleo (Leo Language) |
| Wallet | Puzzle Wallet SDK |
| Database | Supabase (PostgreSQL) |
| Storage | IPFS (Pinata) |
| AI | Google Gemini API |
| Payments | Stripe |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Puzzle Wallet browser extension
- Aleo testnet credits (for transactions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/timevault.git
cd timevault
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
```env
# Aleo Configuration
NEXT_PUBLIC_ALEO_NETWORK=testnet
NEXT_PUBLIC_ALEO_RPC_URL=https://api.explorer.provable.com/v2
NEXT_PUBLIC_PROGRAM_ID=timevault_main_9482.aleo
NEXT_PUBLIC_SUBSCRIPTION_PROGRAM_ID=timevault_subscription_9483.aleo

# Puzzle Wallet
NEXT_PUBLIC_PUZZLE_WALLET_URL=https://puzzle.online

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_secret
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_JWT=your_jwt_token

# Google Gemini
GEMINI_API_KEY=your_gemini_key
MODEL_NAME=gemini-2.5-flash

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (for subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
```

5. Run the development server:
```bash
bun dev
# or
npm run dev
```
 
 

## Usage Guide

### Creating a TimeVault

1. Connect your Puzzle Wallet
2. Click "Create TimeVault"
3. Enter your message or content
4. Set the unlock date and time
5. Optionally specify a recipient address
6. Click "Lock Vault" to submit the transaction

### Unlocking a TimeVault

1. Navigate to your Dashboard
2. Find a vault marked as "Ready to Unlock"
3. Click on the vault to open details
4. Click "Unlock Vault"
5. Sign the transaction to generate a ZK proof
6. View your decrypted content

## Security Considerations

- **Client-side Encryption**: All encryption happens in the browser
- **No Key Storage**: Encryption keys are derived from wallet address + vault ID
- **Zero-Knowledge**: Unlock conditions verified without revealing data
- **Immutable**: Once created, vault conditions cannot be changed
- **Decentralized Storage**: Content stored on IPFS, not centralized servers

## Roadmap

- [x] Core vault creation and unlocking
- [x] Puzzle Wallet integration
- [x] IPFS storage integration
- [x] AI message enhancement
- [x] Subscription system
- [ ] Multi-recipient vaults
- [ ] File attachment support
- [ ] Mobile app (React Native)
- [ ] Mainnet deployment

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Aleo Foundation for the ZK technology
- Puzzle Wallet team for wallet integration
- Built for the Aleo Privacy Buildathon 2026

---

**TimeVault** - Your secrets, delivered on time.
