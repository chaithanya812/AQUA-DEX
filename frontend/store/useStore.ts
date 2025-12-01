import { create } from 'zustand';
import { Token } from '@/types';

interface SlippageSettings {
    tolerance: number; // in basis points, e.g. 50 = 0.5%
    deadline: number; // in minutes
}

interface StoreState {
    selectedTokenA: Token | null;
    selectedTokenB: Token | null;
    tokens: Token[];
    slippageSettings: SlippageSettings;
    isSwapSettingsOpen: boolean;

    setSelectedTokenA: (token: Token) => void;
    setSelectedTokenB: (token: Token) => void;
    swapTokens: () => void;
    setSlippageSettings: (settings: Partial<SlippageSettings>) => void;
    setIsSwapSettingsOpen: (isOpen: boolean) => void;
    setTokens: (tokens: Token[]) => void;
}

// Mock tokens for initial state
// Real Testnet Tokens
// Real Testnet Tokens
const MOCK_TOKENS: Token[] = [
    {
        symbol: 'SUI',
        name: 'Sui',
        decimals: 9,
        address: '0x2::sui::SUI'
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        address: '0xb08c7879852a3c12bffe1f326ebb1746a622f00bac179f1f832b5199e88c3e23::usdc::USDC'
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 8,
        address: '0xb08c7879852a3c12bffe1f326ebb1746a622f00bac179f1f832b5199e88c3e23::eth::ETH'
    }
];

export const useStore = create<StoreState>((set) => ({
    selectedTokenA: MOCK_TOKENS[0],
    selectedTokenB: null,
    tokens: MOCK_TOKENS,
    slippageSettings: { tolerance: 50, deadline: 20 },
    isSwapSettingsOpen: false,

    setSelectedTokenA: (token) => set({ selectedTokenA: token }),
    setSelectedTokenB: (token) => set({ selectedTokenB: token }),
    swapTokens: () => set((state) => ({
        selectedTokenA: state.selectedTokenB,
        selectedTokenB: state.selectedTokenA,
    })),
    setSlippageSettings: (settings) => set((state) => ({
        slippageSettings: { ...state.slippageSettings, ...settings }
    })),
    setIsSwapSettingsOpen: (isOpen) => set({ isSwapSettingsOpen: isOpen }),
    setTokens: (tokens) => set({ tokens }),
}));
