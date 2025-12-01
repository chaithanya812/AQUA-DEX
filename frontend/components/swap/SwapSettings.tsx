'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SwapSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SLIPPAGE_PRESETS = [10, 50, 100]; // 0.1%, 0.5%, 1%
const DEADLINE_PRESETS = [5, 10, 30]; // minutes

export function SwapSettings({ open, onOpenChange }: SwapSettingsProps) {
    const { slippageSettings, setSlippageSettings } = useStore();
    const [customSlippage, setCustomSlippage] = useState('');
    const [customDeadline, setCustomDeadline] = useState('');

    const handleSlippagePreset = (value: number) => {
        setSlippageSettings({ tolerance: value });
        setCustomSlippage('');
    };

    const handleCustomSlippage = (value: string) => {
        setCustomSlippage(value);
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
            setSlippageSettings({ tolerance: Math.round(parsed * 100) });
        }
    };

    const handleDeadlinePreset = (value: number) => {
        setSlippageSettings({ deadline: value });
        setCustomDeadline('');
    };

    const handleCustomDeadline = (value: string) => {
        setCustomDeadline(value);
        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
            setSlippageSettings({ deadline: parsed });
        }
    };

    const slippagePercent = slippageSettings.tolerance / 100;
    const isHighSlippage = slippageSettings.tolerance > 100;
    const isLowSlippage = slippageSettings.tolerance < 10;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">Transaction Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Slippage Tolerance */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium text-black dark:text-white">
                                Slippage Tolerance
                            </span>
                            <Info className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-2">
                            {SLIPPAGE_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => handleSlippagePreset(preset)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl font-medium transition-colors border',
                                        slippageSettings.tolerance === preset && !customSlippage
                                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                            : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                                    )}
                                >
                                    {preset / 100}%
                                </button>
                            ))}
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    placeholder="Custom"
                                    value={customSlippage}
                                    onChange={(e) => handleCustomSlippage(e.target.value)}
                                    className="text-right pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                        </div>

                        {/* Slippage Warnings */}
                        {isHighSlippage && (
                            <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-yellow-700 dark:text-yellow-400">
                                    High slippage increases the risk of front-running
                                </span>
                            </div>
                        )}

                        {isLowSlippage && (
                            <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-yellow-700 dark:text-yellow-400">
                                    Low slippage may cause transaction to fail
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Transaction Deadline */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-medium text-black dark:text-white">
                                Transaction Deadline
                            </span>
                            <Info className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-2">
                            {DEADLINE_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => handleDeadlinePreset(preset)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl font-medium transition-colors border',
                                        slippageSettings.deadline === preset && !customDeadline
                                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                            : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                                    )}
                                >
                                    {preset}m
                                </button>
                            ))}
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    placeholder="Custom"
                                    value={customDeadline}
                                    onChange={(e) => handleCustomDeadline(e.target.value)}
                                    className="text-right pr-10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">min</span>
                            </div>
                        </div>
                    </div>

                    {/* Current Settings Display */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Current Slippage</span>
                            <span className="font-medium text-black dark:text-white">
                                {slippagePercent}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500 dark:text-gray-400">Current Deadline</span>
                            <span className="font-medium text-black dark:text-white">
                                {slippageSettings.deadline} minutes
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
