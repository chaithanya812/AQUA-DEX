'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

// Demo pool for UI demo
const DEMO_POOL = {
    reserveA: 100000,
    reserveB: 150000,
    tokenA: 'SUI',
    tokenB: 'USDC',
};

// Calculate swap output using x*y=k formula
function calculateSwapOutput(amountIn: number, reserveIn: number, reserveOut: number, fee = 0.003) {
    const amountInWithFee = amountIn * (1 - fee);
    return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
}

// Calculate price impact
function calculatePriceImpact(amountIn: number, amountOut: number, reserveIn: number, reserveOut: number) {
    const spotPrice = reserveOut / reserveIn;
    const effectivePrice = amountOut / amountIn;
    return Math.abs((spotPrice - effectivePrice) / spotPrice) * 100;
}

export default function SwapPage() {
    const account = useCurrentAccount();
    const [amountIn, setAmountIn] = useState('');
    const [amountOut, setAmountOut] = useState('');
    const [slippage, setSlippage] = useState(0.5);
    const [isSwapping, setIsSwapping] = useState(false);

    // Calculate output amount
    useEffect(() => {
        if (amountIn && parseFloat(amountIn) > 0) {
            const output = calculateSwapOutput(
                parseFloat(amountIn),
                DEMO_POOL.reserveA,
                DEMO_POOL.reserveB
            );
            setAmountOut(output.toFixed(6));
        } else {
            setAmountOut('');
        }
    }, [amountIn]);

    const handleSwap = async () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (!amountIn || parseFloat(amountIn) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSwapping(true);

        // Simulate transaction
        setTimeout(() => {
            toast.success('Swap would execute here with real contract integration!');
            toast.info('Next step: Connect to deployed pool contract');
            setIsSwapping(false);
        }, 2000);
    };

    const priceImpact = amountIn && amountOut
        ? calculatePriceImpact(parseFloat(amountIn), parseFloat(amountOut), DEMO_POOL.reserveA, DEMO_POOL.reserveB)
        : 0;

    const minReceived = amountOut ? parseFloat(amountOut) * (1 - slippage / 100) : 0;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Swap Tokens
                </h1>
                <p className="text-gray-400">Trade using constant product AMM (x × y = k)</p>
            </div>

            {/* Swap Card */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Swap</CardTitle>
                        {account && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                Wallet Connected
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* From Token */}
                    <div className="space-y-2">
                        <Label className="text-gray-400">From</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={amountIn}
                                onChange={(e) => setAmountIn(e.target.value)}
                                className="bg-gray-950 border-gray-800 text-2xl h-20 pr-32"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
                                    {DEMO_POOL.tokenA}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Flip Button */}
                    <div className="flex justify-center -my-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full border-gray-700 bg-gray-900 hover:bg-gray-800"
                        >
                            <ArrowDownUp className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* To Token */}
                    <div className="space-y-2">
                        <Label className="text-gray-400">To (estimated)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={amountOut}
                                readOnly
                                className="bg-gray-950 border-gray-800 text-2xl h-20 pr-32"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
                                    {DEMO_POOL.tokenB}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Price Impact & Details */}
                    {amountIn && amountOut && (
                        <>
                            {priceImpact > 1 && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg border ${priceImpact < 3
                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Price Impact: {priceImpact.toFixed(2)}%
                                    </span>
                                </div>
                            )}

                            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Exchange Rate</span>
                                    <span className="text-white">1 {DEMO_POOL.tokenA} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4)} {DEMO_POOL.tokenB}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Minimum Received</span>
                                    <span className="text-white">{minReceived.toFixed(6)} {DEMO_POOL.tokenB}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">LP Fee (0.3%)</span>
                                    <span className="text-white">{(parseFloat(amountIn) * 0.003).toFixed(6)} {DEMO_POOL.tokenA}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Slippage Tolerance</span>
                                    <span className="text-white">{slippage}%</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Swap Button */}
                    <Button
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={handleSwap}
                        disabled={!account || !amountIn || parseFloat(amountIn) <= 0 || isSwapping}
                    >
                        {isSwapping ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : !account ? (
                            'Connect Wallet to Swap'
                        ) : (
                            'Swap Tokens'
                        )}
                    </Button>

                    {/* Info */}
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                        <Info className="w-4 h-4 mt-0.5 text-blue-400" />
                        <p>
                            Calculations use the constant product formula (x × y = k). Ready to integrate with your deployed Sui contracts!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Pool Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg">Pool Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-400">Reserve A</div>
                            <div className="text-lg font-bold text-blue-400">{DEMO_POOL.reserveA.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{DEMO_POOL.tokenA}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400">Reserve B</div>
                            <div className="text-lg font-bold text-purple-400">{DEMO_POOL.reserveB.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{DEMO_POOL.tokenB}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400">K Constant</div>
                            <div className="text-lg font-bold text-green-400">{(DEMO_POOL.reserveA * DEMO_POOL.reserveB / 1000000).toFixed(1)}M</div>
                            <div className="text-xs text-gray-500">x × y = k</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-400">Fee Tier</div>
                            <div className="text-lg font-bold text-yellow-400">0.3%</div>
                            <div className="text-xs text-gray-500">Standard</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contract Info */}
            <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="py-4">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                        <Info className="w-4 h-4" />
                        <div>
                            <p className="font-semibold">Smart Contract Integration Ready</p>
                            <p className="text-xs text-blue-400/80 mt-1">
                                Package ID: 0x6ad530...98a0 (Deployed on Sui Testnet)
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
