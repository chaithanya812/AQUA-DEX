export function calculateLPTokens(
    amountA: string,
    amountB: string,
    reserveA: string,
    reserveB: string,
    lpSupply: string
): string {
    // Simplified mock calculation
    // In reality: sqrt(amountA * amountB) if initial, or proportional to supply
    if (lpSupply === '0') {
        return Math.sqrt(Number(amountA) * Number(amountB)).toString();
    }
    const shareA = (BigInt(amountA) * BigInt(lpSupply)) / BigInt(reserveA);
    const shareB = (BigInt(amountB) * BigInt(lpSupply)) / BigInt(reserveB);
    return (shareA < shareB ? shareA : shareB).toString();
}

export function calculatePoolShare(lpTokens: string, totalLpSupply: string): number {
    if (totalLpSupply === '0') return 100;
    return (Number(lpTokens) / Number(totalLpSupply)) * 100;
}

export function calculateRemoveLiquidity(
    lpTokens: string,
    reserveA: string,
    reserveB: string,
    totalLpSupply: string
): { amountA: string; amountB: string } {
    if (totalLpSupply === '0') return { amountA: '0', amountB: '0' };
    const amountA = (BigInt(lpTokens) * BigInt(reserveA)) / BigInt(totalLpSupply);
    const amountB = (BigInt(lpTokens) * BigInt(reserveB)) / BigInt(totalLpSupply);
    return { amountA: amountA.toString(), amountB: amountB.toString() };
}

export function calculateMinOutput(amount: string, slippageToleranceBps: number): string {
    const amountBig = BigInt(amount);
    const minAmount = amountBig - (amountBig * BigInt(slippageToleranceBps)) / BigInt(10000);
    return minAmount.toString();
}

export function calculateImpermanentLoss(initialRatio: number, currentRatio: number): number {
    // 2 * sqrt(ratio) / (1 + ratio) - 1
    const ratio = currentRatio / initialRatio;
    return (2 * Math.sqrt(ratio) / (1 + ratio) - 1) * 100;
}

export { formatTokenAmount, parseTokenAmount } from './utils';
