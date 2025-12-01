'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreatePoolPage() {
    const [poolType, setPoolType] = useState('standard');
    const [feeTier, setFeeTier] = useState('0.3');
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');

    const handleCreatePool = () => {
        if (!tokenA || !tokenB || !amountA || !amountB) {
            toast.error('Please fill in all fields');
            return;
        }

        toast.success('Pool created successfully! 🎉');
    };

    const startingPrice = amountA && amountB ? (parseFloat(amountB) / parseFloat(amountA)).toFixed(6) : '0';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/pools">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Create New Pool
                    </h1>
                    <p className="text-gray-400 mt-1">Deploy a new liquidity pool</p>
                </div>
            </div>

            {/* Create Pool Form */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle>Pool Configuration</CardTitle>
                    <CardDescription>Set up your liquidity pool parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Pool Type */}
                    <div className="space-y-3">
                        <Label>Pool Type</Label>
                        <RadioGroup value={poolType} onValueChange={setPoolType}>
                            <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors cursor-pointer">
                                <RadioGroupItem value="standard" id="standard" />
                                <label htmlFor="standard" className="flex-1 cursor-pointer">
                                    <div className="font-semibold">Standard AMM (x*y=k)</div>
                                    <div className="text-sm text-gray-400">Best for most token pairs with different values</div>
                                </label>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                                    Recommended
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2 p-4 rounded-lg border border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer">
                                <RadioGroupItem value="stable" id="stable" />
                                <label htmlFor="stable" className="flex-1 cursor-pointer">
                                    <div className="font-semibold">StableSwap (optimized for stables)</div>
                                    <div className="text-sm text-gray-400">Optimized for pairs with similar values (e.g., USDC/USDT)</div>
                                </label>
                                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                    Low Slippage
                                </Badge>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Token Pair Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Token A</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Select token"
                                    value={tokenA}
                                    onChange={(e) => setTokenA(e.target.value)}
                                    className="bg-gray-950 border-gray-800"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Button size="sm" variant="ghost" className="text-xs text-blue-400">
                                        Select ▼
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Token B</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Select token"
                                    value={tokenB}
                                    onChange={(e) => setTokenB(e.target.value)}
                                    className="bg-gray-950 border-gray-800"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Button size="sm" variant="ghost" className="text-xs text-blue-400">
                                        Select ▼
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fee Tier */}
                    <div className="space-y-3">
                        <Label>Fee Tier</Label>
                        <RadioGroup value={feeTier} onValueChange={setFeeTier}>
                            <div className="grid grid-cols-3 gap-3">
                                <div className={`p-4 rounded-lg border cursor-pointer transition-colors ${feeTier === '0.05' ? 'border-green-500 bg-green-500/10' : 'border-gray-800 hover:border-gray-700'
                                    }`} onClick={() => setFeeTier('0.05')}>
                                    <RadioGroupItem value="0.05" id="fee-005" className="sr-only" />
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">0.05%</div>
                                        <div className="text-xs text-gray-400 mt-1">Best for stables</div>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg border cursor-pointer transition-colors ${feeTier === '0.3' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 hover:border-gray-700'
                                    }`} onClick={() => setFeeTier('0.3')}>
                                    <RadioGroupItem value="0.3" id="fee-03" className="sr-only" />
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">0.3%</div>
                                        <div className="text-xs text-gray-400 mt-1">Standard pairs</div>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg border cursor-pointer transition-colors ${feeTier === '1' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 hover:border-gray-700'
                                    }`} onClick={() => setFeeTier('1')}>
                                    <RadioGroupItem value="1" id="fee-1" className="sr-only" />
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">1%</div>
                                        <div className="text-xs text-gray-400 mt-1">Exotic pairs</div>
                                    </div>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Initial Liquidity */}
                    <div className="space-y-3">
                        <Label>Initial Liquidity</Label>
                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={amountA}
                                    onChange={(e) => setAmountA(e.target.value)}
                                    className="bg-gray-950 border-gray-800 pr-24"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                        {tokenA || 'Token A'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={amountB}
                                    onChange={(e) => setAmountB(e.target.value)}
                                    className="bg-gray-950 border-gray-800 pr-24"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                        {tokenB || 'Token B'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Starting Price */}
                    {amountA && amountB && (
                        <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Starting Price</span>
                                <span className="font-semibold">
                                    1 {tokenA || 'A'} = {startingPrice} {tokenB || 'B'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Create Button */}
                    <Button
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={handleCreatePool}
                        disabled={!tokenA || !tokenB || !amountA || !amountB}
                    >
                        Create Pool amp; Add Liquidity
                    </Button>

                    {/* Info */}
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                        <Info className="w-4 h-4 mt-0.5 text-blue-400" />
                        <p>
                            By creating a pool, you'll be the first liquidity provider. The ratio of tokens you add will set the initial price.
                            You'll receive LP tokens representing your share of the pool.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
