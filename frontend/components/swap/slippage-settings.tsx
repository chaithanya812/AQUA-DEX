'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface SlippageSettingsProps {
    slippage: number;
    onSlippageChange: (value: number) => void;
    deadline: number;
    onDeadlineChange: (value: number) => void;
}

export function SlippageSettings({ slippage, onSlippageChange, deadline, onDeadlineChange }: SlippageSettingsProps) {
    const [customSlippage, setCustomSlippage] = useState('');
    const [customDeadline, setCustomDeadline] = useState('');

    const presetSlippages = [0.1, 0.5, 1.0];
    const presetDeadlines = [5, 10, 30];

    const setSlippage = (value: number) => {
        onSlippageChange(value);
        setCustomSlippage('');
    };

    const setDeadline = (value: number) => {
        onDeadlineChange(value);
        setCustomDeadline('');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                    <DialogTitle>Transaction Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    {/* Slippage Tolerance */}
                    <div className="space-y-3">
                        <Label className="text-gray-400">Slippage Tolerance</Label>
                        <div className="flex gap-2">
                            {presetSlippages.map((preset) => (
                                <Button
                                    key={preset}
                                    variant={slippage === preset ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSlippage(preset)}
                                    className={slippage === preset ? 'bg-blue-600' : 'border-gray-700'}
                                >
                                    {preset}%
                                </Button>
                            ))}
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Custom"
                                    value={customSlippage}
                                    onChange={(e) => {
                                        setCustomSlippage(e.target.value);
                                        if (e.target.value) {
                                            onSlippageChange(parseFloat(e.target.value));
                                        }
                                    }}
                                    className="bg-gray-950 border-gray-800 h-9"
                                    step="0.1"
                                    min="0.1"
                                    max="50"
                                />
                                <span className="text-sm text-gray-500">%</span>
                            </div>
                        </div>
                        {slippage > 5 && (
                            <p className="text-xs text-yellow-400">⚠️ High slippage tolerance may result in unfavorable trades</p>
                        )}
                    </div>

                    {/* Transaction Deadline */}
                    <div className="space-y-3">
                        <Label className="text-gray-400">Transaction Deadline</Label>
                        <div className="flex gap-2">
                            {presetDeadlines.map((preset) => (
                                <Button
                                    key={preset}
                                    variant={deadline === preset ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setDeadline(preset)}
                                    className={deadline === preset ? 'bg-blue-600' : 'border-gray-700'}
                                >
                                    {preset} min
                                </Button>
                            ))}
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Custom"
                                    value={customDeadline}
                                    onChange={(e) => {
                                        setCustomDeadline(e.target.value);
                                        if (e.target.value) {
                                            onDeadlineChange(parseInt(e.target.value));
                                        }
                                    }}
                                    className="bg-gray-950 border-gray-800 h-9"
                                    step="1"
                                    min="1"
                                    max="60"
                                />
                                <span className="text-sm text-gray-500">min</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Transaction will revert if not executed within {deadline} minutes
                        </p>
                    </div>

                    {/* Interface Settings */}
                    <div className="space-y-3 border-t border-gray-800 pt-4">
                        <Label className="text-gray-400">Interface Settings</Label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">Show price impact warnings</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">Auto-refresh prices</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm text-red-400">Expert mode (disable warnings)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
