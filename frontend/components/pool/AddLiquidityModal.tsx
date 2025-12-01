'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddLiquidity } from '@/hooks/usePool';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { calculateLPTokens, calculatePoolShare, formatTokenAmount, parseTokenAmount } from '@/lib/math';
import { Pool } from '@/types';
import { Info } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface AddLiquidityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pool: Pool;
}

export function AddLiquidityModal({ open, onOpenChange, pool }: AddLiquidityModalProps) {
    const account = useCurrentAccount();
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');

    const { data: balanceA } = useTokenBalance(pool.tokenA);
    const { data: balanceB } = useTokenBalance(pool.tokenB);
    const { mutate: addLiquidity, isPending } = useAddLiquidity();

    // Calculate the required amount B when amount A changes
    const handleAmountAChange = (value: string) => {
        setAmountA(value);
        // Only calculate if pool has reserves (not first liquidity)
        if (value && parseFloat(value) > 0 && parseFloat(pool.reserveA) > 0 && parseFloat(pool.reserveB) > 0) {
            const amountARaw = parseTokenAmount(value, pool.tokenA.decimals);
            const requiredB = (
                (BigInt(amountARaw) * BigInt(pool.reserveB)) /
                BigInt(pool.reserveA)
            ).toString();
            setAmountB(formatTokenAmount(requiredB, pool.tokenB.decimals, 6));
        }
        // If reserves are 0, we let the user enter whatever they want for the initial ratio
    };

    // Calculate the required amount A when amount B changes
    const handleAmountBChange = (value: string) => {
        setAmountB(value);
        // Only calculate if pool has reserves (not first liquidity)
        if (value && parseFloat(value) > 0 && parseFloat(pool.reserveA) > 0 && parseFloat(pool.reserveB) > 0) {
            const amountBRaw = parseTokenAmount(value, pool.tokenB.decimals);
            const requiredA = (
                (BigInt(amountBRaw) * BigInt(pool.reserveA)) /
                BigInt(pool.reserveB)
            ).toString();
            setAmountA(formatTokenAmount(requiredA, pool.tokenA.decimals, 6));
        }
        // If reserves are 0, we let the user enter whatever they want for the initial ratio
    };

    // Calculate LP tokens to receive
    const lpTokensToReceive = useMemo(() => {
        if (!amountA || !amountB) return '0';
        const amountARaw = parseTokenAmount(amountA, pool.tokenA.decimals);
        const amountBRaw = parseTokenAmount(amountB, pool.tokenB.decimals);
        return calculateLPTokens(
            amountARaw,
            amountBRaw,
            pool.reserveA,
            pool.reserveB,
            pool.lpSupply
        );
    }, [amountA, amountB, pool]);

    // Calculate new pool share
    const newPoolShare = useMemo(() => {
        if (lpTokensToReceive === '0') return 0;
        // Ensure lpTokensToReceive is an integer string before converting to BigInt
        const lpTokensInt = lpTokensToReceive.split('.')[0];
        const newTotalSupply = BigInt(pool.lpSupply) + BigInt(lpTokensInt);
        return calculatePoolShare(lpTokensInt, newTotalSupply.toString());
    }, [lpTokensToReceive, pool.lpSupply]);

    const insufficientA =
        balanceA && amountA
            ? BigInt(parseTokenAmount(amountA, pool.tokenA.decimals)) > BigInt(balanceA)
            : false;

    const insufficientB =
        balanceB && amountB
            ? BigInt(parseTokenAmount(amountB, pool.tokenB.decimals)) > BigInt(balanceB)
            : false;

    const canAdd =
        account &&
        amountA &&
        amountB &&
        parseFloat(amountA) > 0 &&
        parseFloat(amountB) > 0 &&
        !insufficientA &&
        !insufficientB;

    const handleAddLiquidity = () => {
        if (!canAdd) return;

        addLiquidity(
            {
                poolId: pool.id,
                tokenAType: pool.tokenA.address,
                tokenBType: pool.tokenB.address,
                amountA: parseTokenAmount(amountA, pool.tokenA.decimals),
                amountB: parseTokenAmount(amountB, pool.tokenB.decimals),
                minLiquidity: '0',
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setAmountA('');
                    setAmountB('');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">Add Liquidity</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        {pool.tokenA.symbol}/{pool.tokenB.symbol} Pool
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Token A Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-black dark:text-white">
                                {pool.tokenA.symbol}
                            </span>
                            {balanceA && (
                                <span className="text-sm text-gray-500">
                                    Balance: {formatTokenAmount(balanceA, pool.tokenA.decimals, 4)}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amountA}
                                onChange={(e) => handleAmountAChange(e.target.value)}
                                className={insufficientA ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            <button
                                onClick={() =>
                                    balanceA &&
                                    handleAmountAChange(formatTokenAmount(balanceA, pool.tokenA.decimals, pool.tokenA.decimals))
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-black dark:text-white bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Plus Icon */}
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-400">+</span>
                        </div>
                    </div>

                    {/* Token B Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-black dark:text-white">
                                {pool.tokenB.symbol}
                            </span>
                            {balanceB && (
                                <span className="text-sm text-gray-500">
                                    Balance: {formatTokenAmount(balanceB, pool.tokenB.decimals, 4)}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amountB}
                                onChange={(e) => handleAmountBChange(e.target.value)}
                                className={insufficientB ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            <button
                                onClick={() =>
                                    balanceB &&
                                    handleAmountBChange(formatTokenAmount(balanceB, pool.tokenB.decimals, pool.tokenB.decimals))
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-black dark:text-white bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    {parseFloat(amountA) > 0 && parseFloat(amountB) > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500">LP Tokens to Receive</span>
                                    <Info className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="font-semibold text-black dark:text-white">
                                    {formatTokenAmount(lpTokensToReceive, 9, 4)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Share of Pool</span>
                                <span className="font-semibold text-black dark:text-white">
                                    {newPoolShare.toFixed(4)}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Current Pool Rate</span>
                                <span className="font-semibold text-black dark:text-white">
                                    1 {pool.tokenA.symbol} = {
                                        parseFloat(pool.reserveA) > 0
                                            ? (parseFloat(pool.reserveB) / parseFloat(pool.reserveA)).toFixed(6)
                                            : amountA && parseFloat(amountA) > 0
                                                ? (parseFloat(amountB) / parseFloat(amountA)).toFixed(6)
                                                : '0.000000'
                                    }{' '}
                                    {pool.tokenB.symbol}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button
                        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                        size="lg"
                        onClick={handleAddLiquidity}
                        disabled={!canAdd || isPending}
                    >
                        {!account
                            ? 'Connect Wallet'
                            : insufficientA || insufficientB
                                ? 'Insufficient Balance'
                                : !amountA || !amountB
                                    ? 'Enter Amounts'
                                    : 'Add Liquidity'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
