import { Transaction } from '@mysten/sui/transactions';

export const PACKAGE_ID = '0x6ad530465f5991187fe961a06547a8e0ccceff80be3fa2767e94e3e3382698a0';

export const MODULES = {
    LIQUIDITY_POOL: 'liquidity_pool',
    LP_POSITION_NFT: 'lp_position_nft',
    FEE_DISTRIBUTOR: 'fee_distributor',
    STABLE_SWAP_POOL: 'stable_swap_pool',
    SLIPPAGE_PROTECTION: 'slippage_protection',
};

// Create a new swap transaction
export function createSwapTransaction(
    poolId: string,
    coinIn: string,
    amountIn: number,
    minAmountOut: number,
    deadline: number,
    isAtoB: boolean
) {
    const tx = new Transaction();

    const functionName = isAtoB ? 'swap_a_to_b' : 'swap_b_to_a';

    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::${functionName}`,
        arguments: [
            tx.object(poolId),
            tx.object(coinIn),
            tx.pure.u64(minAmountOut),
            tx.object('0x6'), // Clock object
        ],
    });

    return tx;
}

// Calculate swap output (view function simulation)
export function calculateSwapOutput(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    feeTier: number = 30 // Default 0.3% (30 basis points)
): number {
    const feePercent = feeTier / 10000;
    const amountInWithFee = amountIn * (1 - feePercent);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    return numerator / denominator;
}

// Calculate price impact
export function calculatePriceImpact(
    amountIn: number,
    amountOut: number,
    reserveIn: number,
    reserveOut: number
): number {
    const spotPrice = reserveOut / reserveIn;
    const effectivePrice = amountOut / amountIn;
    return Math.abs((spotPrice - effectivePrice) / spotPrice) * 100;
}
