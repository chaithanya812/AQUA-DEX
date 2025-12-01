'use client';

import { PositionGrid } from '@/components/position/PositionGrid';

export default function PositionsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    My Positions
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your LP positions. Each position is represented as a unique NFT.
                </p>
            </div>

            {/* Position Grid */}
            <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
                <PositionGrid />
            </div>
        </div>
    );
}
