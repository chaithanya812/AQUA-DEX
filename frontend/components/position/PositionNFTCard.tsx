'use client';

import { TrendingUp, TrendingDown, Clock, Download, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPercent, formatTimestamp, shortenAddress } from '@/lib/utils';
import { LPPosition } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PositionNFTCardProps {
    position: LPPosition;
    viewMode: 'grid' | 'list';
    onClick: () => void;
}

export function PositionNFTCard({ position, viewMode, onClick }: PositionNFTCardProps) {
    const pool = position.pool;
    const isProfitable = position.pnlPercent >= 0;
    const hasIL = position.impermanentLoss < -0.5;

    // Calculate total value (simplified)
    const totalValueA = parseFloat(position.currentValueA);
    const totalValueB = parseFloat(position.currentValueB);
    const totalUnclaimedFees =
        parseFloat(position.unclaimedFeesA) + parseFloat(position.unclaimedFeesB);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast.success('Downloading High-Res NFT Card...');
        // In a real app, use html2canvas here
    };

    if (viewMode === 'list') {
        return (
            <Card
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-black"
                onClick={onClick}
            >
                <div className="flex items-center justify-between p-4">
                    {/* Left: Pool Info */}
                    <div className="flex items-center gap-4">
                        {/* NFT Visual */}
                        <div
                            className={cn(
                                'w-16 h-16 rounded-xl flex items-center justify-center border-2 relative overflow-hidden',
                                isProfitable
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20'
                                    : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20'
                            )}
                        >
                            {/* Holographic Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex -space-x-2 relative z-10">
                                <div className="w-7 h-7 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black flex items-center justify-center">
                                    <span className="text-white dark:text-black text-xs font-bold">
                                        {pool?.tokenA.symbol.charAt(0) || '?'}
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-gray-500 dark:bg-gray-400 border-2 border-white dark:border-black flex items-center justify-center">
                                    <span className="text-white dark:text-black text-xs font-bold">
                                        {pool?.tokenB.symbol.charAt(0) || '?'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pool Details */}
                        <div>
                            <h3 className="font-bold text-black dark:text-white">
                                {pool ? `${pool.tokenA.symbol}/${pool.tokenB.symbol}` : 'Unknown Pool'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{pool ? `${pool.feeTier / 100}% fee` : ''}</span>
                                <span>•</span>
                                <span>{position.shareOfPool.toFixed(4)}% share</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: Values */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Value</p>
                            <p className="font-semibold text-black dark:text-white">
                                ${(totalValueA + totalValueB).toFixed(2)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Fees</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">${totalUnclaimedFees.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">IL</p>
                            <p
                                className={cn(
                                    'font-semibold',
                                    hasIL ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                                )}
                            >
                                {position.impermanentLoss.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Right: PnL */}
                    <div className="flex items-center gap-2">
                        {isProfitable ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <span
                            className={cn(
                                'font-bold text-lg',
                                isProfitable ? 'text-green-500' : 'text-red-500'
                            )}
                        >
                            {formatPercent(position.pnlPercent)}
                        </span>
                    </div>
                </div>
            </Card>
        );
    }

    // Grid View (Premium NFT Card)
    return (
        <Card
            className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-black relative"
            onClick={onClick}
        >
            {/* Premium Border Glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* NFT Header */}
            <div
                className={cn(
                    'h-40 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black border-b border-gray-200 dark:border-gray-800'
                )}
            >
                {position.url && (
                    <img
                        src={position.url}
                        alt={position.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 z-0"
                    />
                )}

                {/* Abstract Background Pattern (only if no URL) */}
                {!position.url && (
                    <div className="absolute inset-0 opacity-10 dark:opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                    </div>
                )}

                {/* Token Icons */}
                <div className="absolute top-6 left-6 flex -space-x-4 z-10">
                    <div className="w-14 h-14 rounded-full bg-black dark:bg-white border-4 border-white dark:border-black flex items-center justify-center shadow-xl transform group-hover:-translate-y-1 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white dark:text-black">
                            {pool?.tokenA.symbol.charAt(0) || '?'}
                        </span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gray-500 dark:bg-gray-400 border-4 border-white dark:border-black flex items-center justify-center shadow-xl transform group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                        <span className="text-2xl font-bold text-white dark:text-black">
                            {pool?.tokenB.symbol.charAt(0) || '?'}
                        </span>
                    </div>
                </div>

                {/* PnL Badge */}
                <div className="absolute top-6 right-6 z-10">
                    <div
                        className={cn(
                            'px-3 py-1 rounded-full text-sm font-bold border backdrop-blur-md shadow-sm',
                            isProfitable
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'
                        )}
                    >
                        {isProfitable ? '+' : ''}
                        {position.pnlPercent.toFixed(2)}%
                    </div>
                </div>

                {/* Position ID & Label */}
                <div className="absolute bottom-4 left-6 z-10">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/5 dark:bg-white/10 text-black dark:text-white uppercase tracking-wider backdrop-blur-sm">
                            LP NFT
                        </span>
                        <p className="text-black/60 dark:text-white/60 font-mono text-xs backdrop-blur-sm px-1 rounded">#{shortenAddress(position.id, 6)}</p>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 relative z-10">
                {/* Pool Name */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-black dark:text-white">
                        {pool ? `${pool.tokenA.symbol} / ${pool.tokenB.symbol}` : 'Unknown Pool'}
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                        {pool ? `${pool.feeTier / 100}% Fee` : ''}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Position Value</p>
                        <p className="font-bold text-black dark:text-white text-lg">
                            ${(totalValueA + totalValueB).toFixed(2)}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Pool Share</p>
                        <p className="font-bold text-black dark:text-white text-lg">
                            {position.shareOfPool.toFixed(4)}%
                        </p>
                    </div>
                    <div className="px-3">
                        <p className="text-xs text-gray-500 mb-1">Unclaimed Fees</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">${totalUnclaimedFees.toFixed(2)}</p>
                    </div>
                    <div className="px-3">
                        <p className="text-xs text-gray-500 mb-1">Impermanent Loss</p>
                        <p
                            className={cn(
                                'font-semibold',
                                hasIL ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                            )}
                        >
                            {position.impermanentLoss.toFixed(2)}%
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimestamp(position.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                            title="Download NFT Card"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
