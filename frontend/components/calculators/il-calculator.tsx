'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ILCalculatorProps {
    initialValueA: number;
    initialValueB: number;
    currentPriceA: number;
}

export function ILCalculator({ initialValueA, initialValueB, currentPriceA }: ILCalculatorProps) {
    const [priceChange, setPriceChange] = useState(0);

    const calculateIL = (priceChangePercent: number) => {
        const priceRatio = 1 + (priceChangePercent / 100);
        const il = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
        return il;
    };

    const calculatePositionValue = (priceChangePercent: number) => {
        const newPriceA = currentPriceA * (1 + priceChangePercent / 100);
        const initialTotal = initialValueA * currentPriceA + initialValueB;
        const priceRatio = 1 + (priceChangePercent / 100);

        // Constant product formula
        const k = initialValueA * initialValueB;
        const newAmountA = Math.sqrt(k / priceRatio);
        const newAmountB = k / newAmountA;

        const lpValue = newAmountA * newPriceA + newAmountB;
        const hodlValue = initialValueA * newPriceA + initialValueB;

        return { lpValue, hodlValue, il: calculateIL(priceChangePercent) };
    };

    const { lpValue, hodlValue, il } = calculatePositionValue(priceChange);
    const ilAmount = lpValue - hodlValue;

    const priceChangeOptions = [-50, -25, 0, 25, 50, 100, 200];

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    📊 Impermanent Loss Simulator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Price Change Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">If price changes by:</span>
                        <span className="text-2xl font-bold text-white">
                            {priceChange >= 0 ? '+' : ''}{priceChange}%
                        </span>
                    </div>

                    <Slider
                        value={[priceChange]}
                        onValueChange={(value) => setPriceChange(value[0])}
                        min={-50}
                        max={200}
                        step={5}
                        className="w-full"
                    />

                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {priceChangeOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setPriceChange(option)}
                                className={`px-3 py-1 text-xs rounded-md border transition-colors ${priceChange === option
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                                    }`}
                            >
                                {option >= 0 ? '+' : ''}{option}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* IL Visualization */}
                <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                    <div className="text-center mb-4">
                        <div className="text-xs text-gray-500 mb-2">Impermanent Loss</div>
                        <div className={`text-3xl font-bold ${il < 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {il.toFixed(2)}%
                        </div>
                    </div>

                    {/* Simple Chart */}
                    <div className="relative h-32 flex items-end justify-center">
                        <div className="absolute bottom-0 w-full h-0.5 bg-gray-800" />
                        <div className="relative w-full max-w-md h-full flex items-end justify-around">
                            {priceChangeOptions.map((change) => {
                                const height = Math.abs(calculateIL(change));
                                const isSelected = change === priceChange;
                                return (
                                    <div key={change} className="flex flex-col items-center gap-1">
                                        <div
                                            className={`w-8 rounded-t transition-all ${isSelected ? 'bg-yellow-400' : 'bg-yellow-600/30'
                                                }`}
                                            style={{ height: `${(height / 6) * 100}%` }}
                                        />
                                        <span className="text-[10px] text-gray-600">
                                            {change >= 0 ? '+' : ''}{change}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Results Comparison */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>HODL Value</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${hodlValue.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span>LP Value</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${lpValue.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* IL Amount */}
                <div className={`rounded-lg p-4 border ${ilAmount >= 0
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-yellow-500/10 border-yellow-500/20'
                    }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {ilAmount >= 0 ? 'LP wins!' : 'Impermanent Loss'}
                        </span>
                        <div className="flex items-center gap-2">
                            {ilAmount >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-yellow-400" />}
                            <span className={`font-bold ${ilAmount >= 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {ilAmount >= 0 ? '+' : ''}${ilAmount.toFixed(2)} ({il.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="text-xs text-gray-500 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    💡 Add estimated fee earnings to see if LP is profitable despite IL
                </div>
            </CardContent>
        </Card>
    );
}
