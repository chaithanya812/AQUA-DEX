'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { useStore } from '@/store/useStore';
import { useCreatePool } from '@/hooks/usePool';
import { Token } from '@/types';
import { Loader2, Plus, AlertTriangle } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { cn } from '@/lib/utils';

const FEE_TIERS = [
    { value: 1, label: '0.01%', description: 'Best for stable pairs' },
    { value: 5, label: '0.05%', description: 'Best for stable pairs' },
    { value: 30, label: '0.3%', description: 'Best for most pairs' },
    { value: 100, label: '1%', description: 'Best for exotic pairs' },
];

export function CreatePoolForm() {
    const account = useCurrentAccount();
    const { tokens } = useStore();
    const { mutate: createPool, isPending } = useCreatePool();

    const [tokenA, setTokenA] = useState<Token | null>(null);
    const [tokenB, setTokenB] = useState<Token | null>(null);
    const [feeTier, setFeeTier] = useState<number>(30);

    const handleCreatePool = () => {
        if (!tokenA || !tokenB) return;

        createPool({
            tokenAType: tokenA.address,
            tokenBType: tokenB.address,
            feeTier,
        });
    };

    const isValid = tokenA && tokenB && tokenA.address !== tokenB.address;

    return (
        <Card className="max-w-xl mx-auto border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-xl">
            <CardHeader>
                <CardTitle className="text-black dark:text-white">Create New Pool</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                    Select a token pair and fee tier to initialize a new liquidity pool.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Token Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-black dark:text-white">Token A</label>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <TokenSelector
                                selectedToken={tokenA}
                                onSelect={setTokenA}
                                otherToken={tokenB}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-black dark:text-white">Token B</label>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            <TokenSelector
                                selectedToken={tokenB}
                                onSelect={setTokenB}
                                otherToken={tokenA}
                            />
                        </div>
                    </div>
                </div>

                {/* Fee Tier Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-black dark:text-white">Fee Tier</label>
                    <div className="grid grid-cols-2 gap-3">
                        {FEE_TIERS.map((tier) => (
                            <button
                                key={tier.value}
                                onClick={() => setFeeTier(tier.value)}
                                className={cn(
                                    'flex flex-col items-start p-3 rounded-xl border transition-all',
                                    feeTier === tier.value
                                        ? 'bg-black dark:bg-white border-black dark:border-white'
                                        : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                )}
                            >
                                <span
                                    className={cn(
                                        'font-bold',
                                        feeTier === tier.value ? 'text-white dark:text-black' : 'text-black dark:text-white'
                                    )}
                                >
                                    {tier.label}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs mt-1',
                                        feeTier === tier.value ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
                                    )}
                                >
                                    {tier.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        <p className="font-semibold">Initial Liquidity Required</p>
                        <p className="mt-1">
                            After creating the pool, you must add liquidity to initialize the price. The first liquidity provider sets the initial exchange rate.
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-lg"
                    onClick={handleCreatePool}
                    disabled={!isValid || isPending || !account}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Creating Pool...
                        </>
                    ) : !account ? (
                        'Connect Wallet'
                    ) : !isValid ? (
                        'Select Tokens'
                    ) : (
                        <>
                            <Plus className="w-5 h-5 mr-2" />
                            Create Pool
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
