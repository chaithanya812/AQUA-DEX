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
*   `next`: 16.0.5
*   `react`: 19.2.0
*   `react-dom`: 19.2.0
*   `typescript`: ^5 (Dev Dependency)

### Sui Integration
*   `@mysten/dapp-kit`: ^0.19.9
*   `@mysten/sui`: ^1.45.0
*   `@tanstack/react-query`: ^5.90.11

### UI Components & Styling
*   `tailwindcss`: ^4.0.0 (Dev Dependency)
*   `lucide-react`: ^0.555.0
*   `class-variance-authority`: ^0.7.1
*   `clsx`: ^2.1.1
*   `tailwind-merge`: ^3.4.0
*   `sonner`: ^2.0.7 (Toast notifications)
*   `recharts`: ^3.5.1 (Charts)
*   `next-themes`: ^0.4.6

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
*   `@radix-ui/react-radio-group`

### State Management
*   `zustand`: ^5.0.8

## 3. Smart Contract Dependencies (`contracts/amm/Move.toml`)
These are handled by the Sui Move compiler.

*   `Sui Framework`: testnet (git: https://github.com/MystenLabs/sui.git)
*   `Move Edition`: 2024.beta

## 4. Browser Extensions
*   **Sui Wallet**: Required for interacting with the application.
