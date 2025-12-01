'use client';

import { PoolList } from '@/components/pool/PoolList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PoolsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                        Liquidity Pools
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Provide liquidity to earn trading fees. Each position is an NFT.
                    </p>
                </div>
                <Link href="/create-pool" className="mt-4 md:mt-0">
                    <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Pool
                    </Button>
                </Link>
            </div>

            {/* Pool List */}
            <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
                <PoolList />
            </div>
        </div>
    );
}
