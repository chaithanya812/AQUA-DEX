# AquaSwap - Next-Gen AMM on Sui

AquaSwap is a cutting-edge Decentralized Exchange (DEX) and Automated Market Maker (AMM) built on the Sui blockchain. It features a modern, responsive frontend and a robust Move smart contract backend, offering users a seamless trading and liquidity provision experience with NFT-based positions.

## � Features

*   **Instant Swaps**: Trade tokens instantly with low fees and minimal slippage.
*   **Liquidity Management**: Easily add and remove liquidity from pools.
*   **NFT Positions**: Liquidity Provider (LP) positions are represented as dynamic NFTs, displaying real-time metadata and custom visuals using the Sui Object Display standard.
*   **Real-Time Data**: View pool statistics, reserves, and your position details in real-time.
*   **Sleek UI**: A premium, dark-mode optimized interface built with Next.js and Tailwind CSS.
*   **Wallet Integration**: Seamless connection with Sui Wallet and other standard wallets.

## �️ Technology Stack

*   **Blockchain**: Sui Network (Testnet)
*   **Smart Contracts**: Sui Move
*   **Frontend**: Next.js 14, React, TypeScript
*   **Styling**: Tailwind CSS, Shadcn UI
*   **State Management**: Zustand, TanStack Query
*   **SDK**: @mysten/dapp-kit, @mysten/sui

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18 or later) & **npm**
2.  **Sui CLI**: [Install Guide](https://docs.sui.io/guides/developer/getting-started/sui-install)
3.  **Sui Wallet**: Browser extension for interacting with the app.

## ⚙️ Installation & Setup

### 1. Smart Contracts (Optional if using deployed version)

If you want to deploy your own version of the contracts:

```bash
# Navigate to the contracts directory
cd contracts/amm

# Build the contracts
sui move build

# Publish to Sui Testnet
sui client publish --gas-budget 100000000 --json > publish_output.json
```

*Note: After publishing, you need to update the `PACKAGE_ID` in `frontend/lib/sui/config.ts` with your new package ID.*

### 2. Frontend Application

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📖 How to Use

1.  **Connect Wallet**: Click the "Connect Wallet" button in the top right corner.
2.  **Request Test Tokens**: Use the "Faucet" button (if available) or your wallet to get SUI testnet tokens.
3.  **Swap**: Go to the "Swap" tab to exchange assets.
4.  **Add Liquidity**:
    *   Navigate to the "Pools" tab.
    *   Select a pool or create a new one.
    *   Enter amounts and confirm to mint your LP Position NFT.
5.  **Manage Positions**:


## 🏆 Hackathon Submission Details

### 🌐 Deployment Information (Sui Testnet)

*   **Package ID**: `0x01e8a2098a6ad53f95679263837ff5f1a46c7795283b213fb471b66a4d50480a`
*   **Upgrade Cap ID**: `0x3ae6814b18d390baf96b8a3a3851b1a3fe449740a68cfad8808de9084962bb1e`
*   **Network**: Sui Testnet

### 🧪 Proof of Functionality

The following core AMM features have been fully implemented and verified on the Sui Testnet:

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Publish Package** | ✅ Functional | Contract deployed successfully. |
| **Create Pool** | ✅ Functional | Users can create new trading pairs. |
| **Add Liquidity** | ✅ Functional | LPs can mint positions and receive NFTs. |
| **Swap Tokens** | ✅ Functional | Instant token swaps with slippage protection. |
| **Remove Liquidity** | ✅ Functional | LPs can burn NFTs to reclaim assets. |
| **Claim Fees** | ✅ Functional | Trading fees are distributed to LPs. |

### 🛠️ Tech Stack & Tools Used

*   **Blockchain Framework**: `Sui Move`
*   **Frontend Framework**: `Next.js 14` (App Router)
*   **Language**: `TypeScript`, `Move`
*   **Styling**: `Tailwind CSS`, `Shadcn UI`
*   **State Management**: `Zustand`, `TanStack Query`
*   **SDKs**: `@mysten/dapp-kit`, `@mysten/sui`
*   **Development Tools**: `VS Code`, `Sui CLI`

---

Built with 💙 for the Sui Hackathon.
