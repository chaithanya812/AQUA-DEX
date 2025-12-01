'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LPPosition, Pool } from '@/types';
import { useClaimFees } from '@/hooks/usePosition';
import { useRemoveLiquidity } from '@/hooks/usePool';
import { formatTokenAmount } from '@/lib/utils';
import { Loader2, TrendingUp, Wallet } from 'lucide-react';

interface PositionDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: LPPosition;
    pool: Pool;
}

export function PositionDetailModal({
    open,
    onOpenChange,
    position,
    pool,
}: PositionDetailModalProps) {
    const [removePercent, setRemovePercent] = useState([100]);
    const { mutate: removeLiquidity, isPending: isRemoving } = useRemoveLiquidity();
    const { mutate: claimFees, isPending: isClaiming } = useClaimFees();

    const percent = removePercent[0];
    const isRemovingAll = percent === 100;

    const handleRemoveLiquidity = () => {
        removeLiquidity({
            poolId: pool.id,
            tokenAType: pool.tokenA.address,
            tokenBType: pool.tokenB.address,
            lpTokenId: position.id,
            minAmountA: '0', // TODO: Add slippage protection
            minAmountB: '0',
        }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    const handleClaimFees = () => {
        claimFees({
            poolId: pool.id,
            tokenAType: pool.tokenA.address,
            tokenBType: pool.tokenB.address,
            positionId: position.id,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                        Manage Position
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-lg">
                            {pool.tokenA.symbol}/{pool.tokenB.symbol}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        View details, claim fees, or remove liquidity.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Position Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <p className="text-sm text-gray-500 mb-1">Liquidity</p>
                            <p className="font-semibold text-black dark:text-white">
                                {formatTokenAmount(position.lpTokens, 9, 2)} LP
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <p className="text-sm text-gray-500 mb-1">Share</p>
                            <p className="font-semibold text-black dark:text-white">
                                {position.shareOfPool.toFixed(4)}%
                            </p>
                        </div>
                    </div>

                    {/* Unclaimed Fees */}
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="font-medium text-black dark:text-white">Unclaimed Fees</span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleClaimFees}
                                disabled={isClaiming}
                                className="h-8"
                            >
                                {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
                            </Button>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{pool.tokenA.symbol}</span>
                                <span className="text-black dark:text-white font-medium">
                                    {formatTokenAmount(position.unclaimedFeesA, pool.tokenA.decimals)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{pool.tokenB.symbol}</span>
                                <span className="text-black dark:text-white font-medium">
                                    {formatTokenAmount(position.unclaimedFeesB, pool.tokenB.decimals)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Remove Liquidity */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-black dark:text-white flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            Remove Liquidity
                        </h4>

                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                Removing liquidity will burn your NFT position and return your tokens + fees.
                                <br />
                                <strong>Note: Currently only 100% removal is supported.</strong>
                            </p>

                            <Button
                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleRemoveLiquidity}
                                disabled={isRemoving}
                            >
                                {isRemoving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    'Remove 100% Liquidity'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
