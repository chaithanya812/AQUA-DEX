'use client';

import { useState } from 'react';
import { Grid, List, Wallet, Plus } from 'lucide-react';
import { PositionNFTCard } from './PositionNFTCard';
import { PositionDetailModal } from './PositionDetailModal';
import { useUserPositions, useEnrichedPositions } from '@/hooks/usePosition';
import { usePools } from '@/hooks/usePool';
import { Button } from '@/components/ui/button';
import { LPPosition } from '@/types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PositionGrid() {
    const account = useCurrentAccount();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedPosition, setSelectedPosition] = useState<LPPosition | null>(null);

    const { data: positions, isLoading: positionsLoading } = useUserPositions();
    const { data: pools, isLoading: poolsLoading } = usePools();

    const enrichedPositions = useEnrichedPositions(positions || [], pools || []);

    const isLoading = positionsLoading || poolsLoading;

    if (!account) {
        return (
            <div className="text-center py-20">
                <Wallet className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    Connect Your Wallet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Connect your wallet to view your LP positions
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    if (!enrichedPositions || enrichedPositions.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-black dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    No Positions Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start earning fees by providing liquidity to pools. Each position is represented as a unique NFT.
                </p>
                <Link href="/pools">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Liquidity
                    </Button>
                </Link>
            </div>
        );
    }

    // Calculate totals
    const totalValue = enrichedPositions.reduce((sum, p) => {
        const valueA = parseFloat(p.currentValueA) || 0;
        const valueB = parseFloat(p.currentValueB) || 0;
        return sum + valueA + valueB;
    }, 0);

    const totalFees = enrichedPositions.reduce((sum, p) => {
        const feesA = parseFloat(p.unclaimedFeesA) || 0;
        const feesB = parseFloat(p.unclaimedFeesB) || 0;
        return sum + feesA + feesB;
    }, 0);

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black dark:bg-white rounded-2xl p-6 text-white dark:text-black">
                    <p className="text-sm opacity-80">Total Position Value</p>
                    <p className="text-3xl font-bold mt-1">${totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-black dark:text-white">
                    <p className="text-sm opacity-80 text-gray-500 dark:text-gray-400">Unclaimed Fees</p>
                    <p className="text-3xl font-bold mt-1">${totalFees.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-black dark:text-white">
                    <p className="text-sm opacity-80 text-gray-500 dark:text-gray-400">Total Positions</p>
                    <p className="text-3xl font-bold mt-1">{enrichedPositions.length}</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black dark:text-white">Your Positions</h2>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            'p-2 rounded-lg transition-colors',
                            viewMode === 'grid'
                                ? 'bg-white dark:bg-black shadow-sm text-black dark:text-white'
                                : 'text-gray-500 hover:text-black dark:hover:text-white'
                        )}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            'p-2 rounded-lg transition-colors',
                            viewMode === 'list'
                                ? 'bg-white dark:bg-black shadow-sm text-black dark:text-white'
                                : 'text-gray-500 hover:text-black dark:hover:text-white'
                        )}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Position Cards */}
            <div
                className={cn(
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                )}
            >
                {enrichedPositions.map((position) => (
                    <PositionNFTCard
                        key={position.id}
                        position={position}
                        viewMode={viewMode}
                        onClick={() => setSelectedPosition(position)}
                    />
                ))}
            </div>

            {selectedPosition && selectedPosition.pool && (
                <PositionDetailModal
                    open={!!selectedPosition}
                    onOpenChange={(open) => !open && setSelectedPosition(null)}
                    position={selectedPosition}
                    pool={selectedPosition.pool}
                />
            )}
        </div>
    );
}
