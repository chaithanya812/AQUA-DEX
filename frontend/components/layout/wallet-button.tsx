'use client';

import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shortenAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function WalletButton() {
    const account = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();

    const copyAddress = () => {
        if (account?.address) {
            navigator.clipboard.writeText(account.address);
            toast.success('Address copied!');
        }
    };

    const openExplorer = () => {
        if (account?.address) {
            window.open(
                `https://suiscan.xyz/testnet/account/${account.address}`,
                '_blank'
            );
        }
    };

    if (!account) {
        return (
            <ConnectButton
                connectText="Connect Wallet"
                className="!bg-black dark:!bg-white !text-white dark:!text-black !px-6 !py-2.5 !rounded-xl !font-semibold hover:!opacity-90 transition-opacity"
            />
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center">
                        <Wallet className="w-3 h-3 text-white dark:text-black" />
                    </div>
                    <span className="font-medium text-black dark:text-white">
                        {shortenAddress(account.address)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="min-w-[200px] bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-2 z-50"
                align="end"
            >
                <DropdownMenuItem
                    onClick={copyAddress}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer outline-none"
                >
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Copy Address</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={openExplorer}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer outline-none"
                >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">View on Explorer</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

                <DropdownMenuItem
                    onClick={() => disconnect()}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer outline-none"
                >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">Disconnect</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
