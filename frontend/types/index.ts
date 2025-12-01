export interface Token {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logoUrl?: string;
    balance?: string;
}

export interface Pool {
    id: string;
    tokenA: Token;
    tokenB: Token;
    feeTier: number;
    tvl: number;
    volume24h: number;
    apr: number;
    reserveA: string;
    reserveB: string;
    lpSupply: string;
    type: 'standard' | 'stable';
}

export interface LPPosition {
    id: string;
    pool: Pool;
    lpTokens: string;
    shareOfPool: number;
    currentValueA: string;
    currentValueB: string;
    unclaimedFeesA: string;
    unclaimedFeesB: string;
    impermanentLoss: number;
    pnlPercent: number;
    initialValueA: string;
    initialValueB: string;
    createdAt: number;
    name: string;
    description: string;
    url: string;
}

export interface SwapQuote {
    amountOut: string;
    minimumReceived: string;
    priceImpact: number;
    exchangeRate: number;
    fee: string;
}
