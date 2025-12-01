'use client';

import { useState } from 'react';
import { Search, TrendingUp, Droplets } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PoolCard } from './PoolCard';
import { usePools } from '@/hooks/usePool';
import { Pool } from '@/types';
import { cn } from '@/lib/utils';

type SortOption = 'tvl' | 'volume' | 'apr';

export function PoolList() {
    const { data: pools, isLoading } = usePools();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('tvl');
    const [filterType, setFilterType] = useState<'all' | 'standard' | 'stable'>('all');

    const filteredPools = pools
        ?.filter((pool) => {
            const matchesSearch =
                pool.tokenA.symbol.toLowerCase().includes(search.toLowerCase()) ||
                pool.tokenB.symbol.toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === 'all' || pool.type === filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'tvl':
                    return b.tvl - a.tvl;
                case 'volume':
                    return b.volume24h - a.volume24h;
                case 'apr':
                    return b.apr - a.apr;
                default:
                    return 0;
            }
        });

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search pools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Pool Type Filter */}
                <div className="flex gap-2">
                    {(['all', 'standard', 'stable'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={cn(
                                'px-4 py-2 rounded-xl font-medium transition-colors capitalize border',
                                filterType === type
                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                    : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex gap-2">
                    {([
                        { key: 'tvl', label: 'TVL', icon: Droplets },
                        { key: 'volume', label: 'Volume', icon: TrendingUp },
                        { key: 'apr', label: 'APR', icon: TrendingUp },
                    ] as const).map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setSortBy(key)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors border',
                                sortBy === key
                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                    : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pool Grid */}
            {filteredPools && filteredPools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {filteredPools.map((pool) => (
                        <PoolCard key={pool.id} pool={pool} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Droplets className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                        No pools found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {search ? 'Try a different search term' : 'Be the first to create a pool!'}
                    </p>
                </div>
            )}
        </div>
    );
}
