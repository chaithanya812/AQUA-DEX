# Project Requirements

This file lists all the dependencies and tools required to run the AquaSwap project.

## 1. System Requirements
*   **Node.js**: v18.17.0 or later (Recommended: v20 LTS)
*   **npm**: v9.0.0 or later
*   **Sui CLI**: v1.38.0 or later (for contract interaction/redeployment)
*   **Git**: v2.30.0 or later

## 2. Frontend Dependencies (`frontend/package.json`)
These are automatically installed when you run `npm install` in the `frontend` directory.

### Core Framework
*   `next`: 14.2.3
*   `react`: 18.3.1
*   `react-dom`: 18.3.1
*   `typescript`: 5.4.5

### Sui Integration
*   `@mysten/dapp-kit`: ^0.14.7
*   `@mysten/sui`: ^1.2.0
*   `@tanstack/react-query`: ^5.32.0

### UI Components & Styling
*   `tailwindcss`: ^3.4.1
*   `lucide-react`: ^0.378.0
*   `class-variance-authority`: ^0.7.0
*   `clsx`: ^2.1.1
*   `tailwind-merge`: ^2.3.0
*   `sonner`: ^1.4.41 (Toast notifications)
*   `recharts`: ^2.12.7 (Charts)

### Radix UI Primitives (Headless UI)
*   `@radix-ui/react-dialog`
*   `@radix-ui/react-label`
*   `@radix-ui/react-select`
*   `@radix-ui/react-slot`
*   `@radix-ui/react-switch`
*   `@radix-ui/react-tabs`
*   `@radix-ui/react-slider`
*   `@radix-ui/react-progress`
*   `@radix-ui/react-avatar`
*   `@radix-ui/react-separator`
*   `@radix-ui/react-dropdown-menu`

### State Management
*   `zustand`: ^4.5.2

## 3. Smart Contract Dependencies (`contracts/amm/Move.toml`)
These are handled by the Sui Move compiler.

*   `Sui Framework`: testnet (git: https://github.com/MystenLabs/sui.git)
*   `Move Edition`: 2024.beta

## 4. Browser Extensions
*   **Sui Wallet**: Required for interacting with the application.
