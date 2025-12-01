'use client';

import { useState } from 'react';
import { Plus, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddLiquidityModal } from './AddLiquidityModal';
import { formatUSD, formatNumber, formatPercent } from '@/lib/utils';
import { Pool } from '@/types';
import Link from 'next/link';

interface PoolCardProps {
    pool: Pool;
}

const FEE_TIER_LABELS: Record<number, string> = {
    100: '0.01%',
    500: '0.05%',
    3000: '0.3%',
    10000: '1%',
};

export function PoolCard({ pool }: PoolCardProps) {
    const [showAddLiquidity, setShowAddLiquidity] = useState(false);

    return (
        <>
            <Card className="hover:shadow-xl transition-shadow duration-300 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <CardContent className="p-6">
                    {/* Pool Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* Token Icons */}
                            <div className="flex -space-x-2">
                                <div className="w-10 h-10 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black flex items-center justify-center z-10">
                                    <span className="text-white dark:text-black font-bold text-sm">
                                        {pool.tokenA.symbol.charAt(0)}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-500 dark:bg-gray-400 border-2 border-white dark:border-black flex items-center justify-center">
                                    <span className="text-white dark:text-black font-bold text-sm">
                                        {pool.tokenB.symbol.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-black dark:text-white">
                                    {pool.tokenA.symbol}/{pool.tokenB.symbol}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${pool.type === 'stable'
                                                ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800'
                                                : 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white'
                                            }`}
                                    >
                                        {pool.type === 'stable' ? 'Stable' : 'Standard'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {FEE_TIER_LABELS[pool.feeTier] || `${pool.feeTier / 10000}%`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pool Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TVL</p>
                            <p className="font-semibold text-black dark:text-white">
                                {formatUSD(pool.tvl)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">24h Volume</p>
                            <p className="font-semibold text-black dark:text-white">
                                {formatUSD(pool.volume24h)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">APR</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                                {formatPercent(pool.apr)}
                            </p>
                        </div>
                    </div>

                    {/* Reserve Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reserves</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                                {formatNumber(parseFloat(pool.reserveA) / Math.pow(10, pool.tokenA.decimals))} {pool.tokenA.symbol}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                                {formatNumber(parseFloat(pool.reserveB) / Math.pow(10, pool.tokenB.decimals))} {pool.tokenB.symbol}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
                            onClick={() => setShowAddLiquidity(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                        <Link href={`/?from=${pool.tokenA.symbol}&to=${pool.tokenB.symbol}`} className="flex-1">
                            <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Swap
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <AddLiquidityModal
                open={showAddLiquidity}
                onOpenChange={setShowAddLiquidity}
                pool={pool}
            />
        </>
    );
}
