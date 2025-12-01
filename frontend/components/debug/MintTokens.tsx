'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'sonner';
import { Coins, Loader2 } from 'lucide-react';

const FAUCET_PACKAGE_ID = '0xb08c7879852a3c12bffe1f326ebb1746a622f00bac179f1f832b5199e88c3e23';

export function MintTokens() {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const client = useSuiClient();
    const [isRequestingSui, setIsRequestingSui] = useState(false);

    const requestSui = async () => {
        if (!account) return;

        try {
            setIsRequestingSui(true);
            toast.info('Requesting SUI from faucet...');
            const res = await fetch('https://faucet.testnet.sui.io/gas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    FixedAmountRequest: {
                        recipient: account.address,
                    },
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Faucet request failed');
            }

            toast.success('SUI requested! It should arrive in a few seconds.');
        } catch (error: any) {
            console.error('SUI Faucet Error:', error);
            toast.error(`Failed to get SUI: ${error.message}. Try Discord if this persists.`);
        } finally {
            setIsRequestingSui(false);
        }
    };

    const handleMint = async (symbol: 'USDC' | 'ETH' | 'BTC') => {
        if (!account) return;

        try {
            const tx = new Transaction();

            // Note: We only deployed USDC and ETH. BTC is not in this package.
            if (symbol === 'BTC') {
                toast.error('BTC minting not available in this test package');
                return;
            }

            // TreasuryCap Object IDs from deployment transaction
            const TREASURY_CAPS = {
                USDC: '0x3216c99a196f1bc729dfe5a312be927796186e737cd889acbfa042474792204d',
                ETH: '0x3170333a46e8a914242515eb1c229d652cb127e281ade58de4a6d59dc9855e3b'
            };

            const treasuryCapId = symbol === 'USDC' ? TREASURY_CAPS.USDC : TREASURY_CAPS.ETH;

            tx.moveCall({
                target: `${FAUCET_PACKAGE_ID}::${symbol.toLowerCase()}::mint`,
                arguments: [
                    tx.object(treasuryCapId),
                    tx.pure.u64('1000000000000'), // 1000 tokens (assuming 9 decimals)
                    tx.pure.address(account.address) // Recipient
                ]
            });

            const response = await signAndExecute({ transaction: tx });
            await client.waitForTransaction({ digest: response.digest });

            toast.success(`Minted 1000 ${symbol}!`);
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to mint ${symbol}: ${error.message}`);
        }
    };

    if (!account) return null;

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => handleMint('USDC')} className="gap-2">
                    <Coins className="w-4 h-4" /> Mint USDC
                </Button>
                <Button variant="outline" onClick={() => handleMint('ETH')} className="gap-2">
                    <Coins className="w-4 h-4" /> Mint ETH
                </Button>
                <Button
                    onClick={requestSui}
                    disabled={isRequestingSui}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isRequestingSui ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Requesting...
                        </>
                    ) : (
                        <>
                            <Coins className="w-4 h-4" />
                            Get SUI (Faucet)
                        </>
                    )}
                </Button>
            </div>
            <div className="flex justify-center">
                <Button
                    onClick={() => window.open('https://discord.gg/sui', '_blank')}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                    Or use Discord Faucet
                </Button>
            </div>
        </div>
    );
}
