'use client';

import { useState, useEffect } from 'react';
import { ArrowDownUp, Settings, Info, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenSelector } from './TokenSelector';
import { SwapSettings } from './SwapSettings';
import { PriceImpactWarning } from './PriceImpactWarning';
import { useStore } from '@/store/useStore';
import { useSwapQuote, useExecuteSwap } from '@/hooks/useSwap';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { usePools } from '@/hooks/usePool';
import { formatTokenAmount, parseTokenAmount, getPriceImpactColor, getPriceImpactBgColor, cn } from '@/lib/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

export function SwapCard() {
    const account = useCurrentAccount();
    const {
        selectedTokenA,
        selectedTokenB,
        swapTokens,
        slippageSettings,
        isSwapSettingsOpen,
        setIsSwapSettingsOpen,
        setSelectedTokenA,
        setSelectedTokenB,
        setTokens,
    } = useStore();

    const [amountIn, setAmountIn] = useState('');
    const [isAtoB, setIsAtoB] = useState(true);

    const { data: pools } = usePools();

    // Sync tokens from pools to store
    useEffect(() => {
        if (pools && pools.length > 0) {
            const uniqueTokens = new Map<string, any>();
            pools.forEach(pool => {
                uniqueTokens.set(pool.tokenA.address, pool.tokenA);
                uniqueTokens.set(pool.tokenB.address, pool.tokenB);
            });
            setTokens(Array.from(uniqueTokens.values()));
        }
    }, [pools, setTokens]);

    const { data: balanceA } = useTokenBalance(selectedTokenA);
    const { data: balanceB } = useTokenBalance(selectedTokenB);

    // Find matching pool
    const pool = pools?.find(
        (p) =>
            (p.tokenA.symbol === selectedTokenA?.symbol && p.tokenB.symbol === selectedTokenB?.symbol) ||
            (p.tokenA.symbol === selectedTokenB?.symbol && p.tokenB.symbol === selectedTokenA?.symbol)
    );

    // Calculate swap quote
    const amountInRaw = amountIn ? parseTokenAmount(amountIn, selectedTokenA?.decimals || 9) : '0';
    const { data: quote, isPending: quotePending } = useSwapQuote(amountInRaw, pool || null, isAtoB);

    const { mutate: executeSwap, isPending: swapPending } = useExecuteSwap();

    const handleSwapTokens = () => {
        swapTokens();
        setIsAtoB(!isAtoB);
        setAmountIn('');
    };

    const handleMaxClick = () => {
        if (balanceA && selectedTokenA) {
            setAmountIn(formatTokenAmount(balanceA, selectedTokenA.decimals, selectedTokenA.decimals));
        }
    };

    const handleSwap = () => {
        if (!pool || !quote || !account) return;

        const swapDirection = selectedTokenA?.address === pool.tokenA.address ? 'a_to_b' : 'b_to_a';

        executeSwap({
            poolId: pool.id,
            poolTokenAType: pool.tokenA.address,
            poolTokenBType: pool.tokenB.address,
            amountIn: amountInRaw,
            minAmountOut: quote.minimumReceived,
            swapDirection,
        });
    };

    const formattedAmountOut = quote
        ? formatTokenAmount(quote.amountOut, selectedTokenB?.decimals || 9, 6)
        : '0';

    const formattedMinReceived = quote
        ? formatTokenAmount(quote.minimumReceived, selectedTokenB?.decimals || 9, 6)
        : '0';

    const insufficientBalance =
        balanceA && amountInRaw ? BigInt(amountInRaw) > BigInt(balanceA) : false;

    const canSwap =
        account &&
        pool &&
        quote &&
        parseFloat(amountIn) > 0 &&
        !insufficientBalance &&
        quote.priceImpact < 15;

    return (
        <Card className="w-full max-w-md mx-auto border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-xl">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-black dark:text-white">Swap</h2>
                    <button
                        onClick={() => setIsSwapSettingsOpen(true)}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* From Token */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
                        {balanceA && selectedTokenA && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Balance: {formatTokenAmount(balanceA, selectedTokenA.decimals, 4)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={amountIn}
                            onChange={(e) => setAmountIn(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 bg-transparent text-2xl font-semibold text-black dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleMaxClick}
                                className="px-2 py-1 text-xs font-semibold text-black dark:text-white bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                MAX
                            </button>
                            <TokenSelector
                                selectedToken={selectedTokenA}
                                onSelect={setSelectedTokenA}
                                otherToken={selectedTokenB}
                            />
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-3 relative z-10">
                    <button
                        onClick={handleSwapTokens}
                        className="p-3 rounded-xl bg-white dark:bg-black border-4 border-gray-50 dark:border-gray-900 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    >
                        <ArrowDownUp className="w-5 h-5 text-black dark:text-white" />
                    </button>
                </div>

                {/* To Token */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mt-2 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">To (estimated)</span>
                        {balanceB && selectedTokenB && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Balance: {formatTokenAmount(balanceB, selectedTokenB.decimals, 4)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={formattedAmountOut}
                            readOnly
                            placeholder="0.00"
                            className="flex-1 bg-transparent text-2xl font-semibold text-black dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                        />
                        <TokenSelector
                            selectedToken={selectedTokenB}
                            onSelect={setSelectedTokenB}
                            otherToken={selectedTokenA}
                        />
                    </div>
                </div>

                {/* Swap Details */}
                {quote && parseFloat(amountIn) > 0 && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                        {/* Exchange Rate */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Rate</span>
                            <span className="text-black dark:text-white">
                                1 {selectedTokenA?.symbol} = {quote.exchangeRate ? quote.exchangeRate.toFixed(6) : '0'} {selectedTokenB?.symbol}
                            </span>
                        </div>

                        {/* Price Impact */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500 dark:text-gray-400">Price Impact</span>
                                <span title="The difference between market price and estimated price due to trade size">
                                    <Info className="w-4 h-4 text-gray-400" />
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'px-2 py-0.5 rounded-lg font-medium',
                                    getPriceImpactColor(quote.priceImpact),
                                    getPriceImpactBgColor(quote.priceImpact)
                                )}
                            >
                                {quote.priceImpact.toFixed(2)}%
                            </span>
                        </div>

                        {/* Minimum Received */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500 dark:text-gray-400">Min. Received</span>
                                <span title={`With ${slippageSettings.tolerance / 100}% slippage tolerance`}>
                                    <Info className="w-4 h-4 text-gray-400" />
                                </span>
                            </div>
                            <span className="text-black dark:text-white">
                                {formattedMinReceived} {selectedTokenB?.symbol}
                            </span>
                        </div>

                        {/* Fee */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Fee</span>
                            <span className="text-black dark:text-white">
                                {pool ? `${pool.feeTier / 100}%` : '-'}
                            </span>
                        </div>

                        {/* Price Impact Warning */}
                        {quote.priceImpact > 3 && <PriceImpactWarning impact={quote.priceImpact} />}
                    </div>
                )}

                {/* Swap Button */}
                <Button
                    className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    size="lg"
                    onClick={handleSwap}
                    disabled={!canSwap || swapPending}
                >
                    {swapPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : !account ? (
                        'Connect Wallet'
                    ) : !pool ? (
                        'No Pool Found'
                    ) : pool && (parseFloat(pool.reserveA) === 0 || parseFloat(pool.reserveB) === 0) ? (
                        'Insufficient Liquidity'
                    ) : insufficientBalance ? (
                        'Insufficient Balance'
                    ) : quote && quote.priceImpact > 15 ? (
                        'Price Impact Too High'
                    ) : !amountIn || parseFloat(amountIn) === 0 ? (
                        'Enter Amount'
                    ) : (
                        'Swap'
                    )}
                </Button>

                {/* Settings Modal */}
                <SwapSettings
                    open={isSwapSettingsOpen}
                    onOpenChange={setIsSwapSettingsOpen}
                />
            </CardContent>
        </Card>
    );
}
