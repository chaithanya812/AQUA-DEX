'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Info } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

export default function LiquidityPage() {
    const account = useCurrentAccount();
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [removePercent, setRemovePercent] = useState(25);

    const handleAddLiquidity = () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
            toast.error('Please enter valid amounts');
            return;
        }

        toast.success('Liquidity added successfully! 🎉 NFT position minted!');
        setAmountA('');
        setAmountB('');
    };

    const handleRemoveLiquidity = () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        toast.success(`Removed ${removePercent}% of liquidity successfully!`);
    };

    const calculateB = (valueA: string) => {
        setAmountA(valueA);
        if (valueA && parseFloat(valueA) > 0) {
            // Simulate 1:1 ratio for demo
            setAmountB(valueA);
        } else {
            setAmountB('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Manage Liquidity
                </h1>
                <p className="text-gray-400">Add or remove liquidity to earn trading fees</p>
            </div>

            {/* Liquidity Tabs */}
            <Tabs defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                    <TabsTrigger value="add">Add Liquidity</TabsTrigger>
                    <TabsTrigger value="remove">Remove Liquidity</TabsTrigger>
                </TabsList>

                {/* Add Liquidity Tab */}
                <TabsContent value="add" className="space-y-4">
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardHeader>
                            <CardTitle>Add Liquidity</CardTitle>
                            <CardDescription>Deposit tokens to earn 0.3% of all trades</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* Token A Input */}
                            <div className="space-y-2">
                                <Label className="text-gray-400">Token A</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={amountA}
                                        onChange={(e) => calculateB(e.target.value)}
                                        className="bg-gray-950 border-gray-800 text-xl h-16 pr-24"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                            SUI
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">Balance: 0.00 SUI</div>
                            </div>

                            {/* Plus Icon */}
                            <div className="flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-gray-950 border border-gray-800 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Token B Input */}
                            <div className="space-y-2">
                                <Label className="text-gray-400">Token B</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={amountB}
                                        readOnly
                                        className="bg-gray-950 border-gray-800 text-xl h-16 pr-24"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            USDC
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">Balance: 0.00 USDC</div>
                            </div>

                            {/* Pool Share Info */}
                            {amountA && amountB && (
                                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Pool Share</span>
                                        <span className="text-white">100%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">LP Tokens</span>
                                        <span className="text-white">{Math.sqrt(parseFloat(amountA) * parseFloat(amountB)).toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">NFT Position</span>
                                        <span className="text-green-400">Will be minted ✓</span>
                                    </div>
                                </div>
                            )}

                            {/* Add Button */}
                            <Button
                                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={handleAddLiquidity}
                                disabled={!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0}
                            >
                                {!account ? 'Connect Wallet' : 'Add Liquidity & Mint NFT'}
                            </Button>

                            {/* Info */}
                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                                <Info className="w-4 h-4 mt-0.5 text-blue-400" />
                                <p>
                                    By adding liquidity, you'll receive an NFT representing your position. This NFT tracks your value, fees earned, and impermanent loss in real-time.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Remove Liquidity Tab */}
                <TabsContent value="remove" className="space-y-4">
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardHeader>
                            <CardTitle>Remove Liquidity</CardTitle>
                            <CardDescription>Withdraw your tokens from the pool</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Percentage Slider */}
                            <div className="space-y-4">
                                <Label className="text-gray-400">Amount to Remove</Label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={removePercent}
                                        onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-2xl font-bold text-blue-400 min-w-[80px] text-right">
                                        {removePercent}%
                                    </div>
                                </div>

                                {/* Quick Percentages */}
                                <div className="flex gap-2">
                                    {[25, 50, 75, 100].map((percent) => (
                                        <Button
                                            key={percent}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setRemovePercent(percent)}
                                            className="flex-1 border-gray-700"
                                        >
                                            {percent}%
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Receive Estimate */}
                            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3">
                                <div className="text-sm text-gray-400 mb-2">You will receive:</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white">SUI</span>
                                    <span className="text-xl font-bold">0.00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white">USDC</span>
                                    <span className="text-xl font-bold">0.00</span>
                                </div>
                                <div className="border-t border-gray-800 pt-3 mt-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Fees Earned</span>
                                        <span className="text-green-400">+$0.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                                className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                                onClick={handleRemoveLiquidity}
                                disabled={removePercent === 0}
                            >
                                {!account ? 'Connect Wallet' : 'Remove Liquidity'}
                            </Button>

                            {/* Warning */}
                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                                <Info className="w-4 h-4 mt-0.5 text-yellow-400" />
                                <p>
                                    Removing liquidity will burn your NFT position if you withdraw 100%. Partial withdrawals will update your NFT.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Stats Card */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg">Your Liquidity Positions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Minus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No liquidity positions yet</p>
                        <p className="text-sm">Add liquidity to start earning fees</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
