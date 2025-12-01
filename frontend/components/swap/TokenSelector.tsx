'use client';

import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { useAllTokenBalances } from '@/hooks/useTokenBalance';
import { formatTokenAmount } from '@/lib/utils';
import { Token } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TokenSelectorProps {
    selectedToken: Token | null;
    onSelect: (token: Token) => void;
    otherToken: Token | null;
}

export function TokenSelector({ selectedToken, onSelect, otherToken }: TokenSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { tokens } = useStore();
    const { data: balances } = useAllTokenBalances(tokens);

    const filteredTokens = tokens.filter(
        (token) =>
            token.symbol.toLowerCase().includes(search.toLowerCase()) ||
            token.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (token: Token) => {
        onSelect(token);
        setOpen(false);
        setSearch('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-gray-200 dark:border-gray-800"
                >
                    {selectedToken ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-black dark:bg-white" />
                            <span className="font-semibold text-black dark:text-white">
                                {selectedToken.symbol}
                            </span>
                        </>
                    ) : (
                        <span className="font-semibold text-gray-500">Select</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">Select Token</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search by name or symbol"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                    </div>

                    {/* Token List */}
                    <div className="max-h-80 overflow-y-auto space-y-1">
                        {filteredTokens.map((token) => {
                            const isSelected = selectedToken?.symbol === token.symbol;
                            const isDisabled = otherToken?.symbol === token.symbol;
                            const balance = balances?.[token.symbol] || '0';

                            return (
                                <button
                                    key={token.symbol}
                                    onClick={() => !isDisabled && handleSelect(token)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'w-full flex items-center justify-between p-3 rounded-xl transition-colors',
                                        isSelected
                                            ? 'bg-gray-100 dark:bg-gray-900'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-900',
                                        isDisabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
                                            <span className="text-white dark:text-black font-bold text-sm">
                                                {token.symbol.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-black dark:text-white">
                                                {token.symbol}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {token.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-black dark:text-white">
                                            {formatTokenAmount(balance, token.decimals, 4)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
