import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pool, SwapQuote } from '@/types';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULES } from '@/lib/sui/config';
import { calculateSwapOutput, calculatePriceImpact } from '@/lib/sui/transactions';
import { toast } from 'sonner';

export function useSwapQuote(amountIn: string, pool: Pool | null, isAtoB: boolean) {
    return useQuery({
        queryKey: ['swapQuote', amountIn, pool?.id, isAtoB],
        queryFn: async () => {
            if (!pool || !amountIn || amountIn === '0') return null;

            const reserveIn = isAtoB ? Number(pool.reserveA) : Number(pool.reserveB);
            const reserveOut = isAtoB ? Number(pool.reserveB) : Number(pool.reserveA);
            const decimalsIn = isAtoB ? pool.tokenA.decimals : pool.tokenB.decimals;
            const decimalsOut = isAtoB ? pool.tokenB.decimals : pool.tokenA.decimals;

            // Parse input amount to raw units
            const amountInRaw = Number(amountIn);

            // Calculate output using constant product formula (x * y = k)
            // Use the pool's actual fee tier
            const amountOutRaw = calculateSwapOutput(amountInRaw, reserveIn, reserveOut, pool.feeTier);

            // Calculate price impact
            const priceImpact = calculatePriceImpact(amountInRaw, amountOutRaw, reserveIn, reserveOut);

            // Calculate exchange rate
            const exchangeRate = amountOutRaw / amountInRaw;

            // Minimum received (0.5% slippage default for quote display)
            const minimumReceived = amountOutRaw * 0.995;

            const quote: SwapQuote = {
                amountOut: Math.floor(amountOutRaw).toString(),
                minimumReceived: Math.floor(minimumReceived).toString(),
                priceImpact,
                exchangeRate,
                fee: `${(pool.feeTier / 100).toFixed(2)}%`,
            };

            return quote;
        },
        enabled: !!pool && !!amountIn && amountIn !== '0',
        // Refresh every 10 seconds
        refetchInterval: 10000,
    });
}

export function useExecuteSwap() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            poolId,
            poolTokenAType,
            poolTokenBType,
            amountIn,
            minAmountOut,
            swapDirection,
        }: {
            poolId: string;
            poolTokenAType: string;
            poolTokenBType: string;
            amountIn: string;
            minAmountOut: string;
            swapDirection: 'a_to_b' | 'b_to_a';
        }) => {
            if (!account) throw new Error('Wallet not connected');

            const tx = new Transaction();

            // Determine input token type based on direction
            const inputTokenType = swapDirection === 'a_to_b' ? poolTokenAType : poolTokenBType;

            let coinToSwap;

            // If input is SUI, use gas coin
            if (inputTokenType.endsWith('::sui::SUI')) {
                [coinToSwap] = tx.splitCoins(tx.gas, [tx.pure.u64(amountIn)]);
            } else {
                // Fetch coins for the input token
                const { data: coins } = await client.getCoins({
                    owner: account.address,
                    coinType: inputTokenType,
                });

                if (coins.length === 0) {
                    throw new Error('No coins found for input token');
                }

                // Strategy: Merge all coins into the first one to ensure we have enough balance
                // Then split the exact amount needed for the swap
                const primaryCoin = coins[0];

                if (coins.length > 1) {
                    tx.mergeCoins(
                        tx.object(primaryCoin.coinObjectId),
                        coins.slice(1).map((c) => tx.object(c.coinObjectId))
                    );
                }

                // Split the exact amount for the swap
                [coinToSwap] = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [tx.pure.u64(amountIn)]);
            }

            const functionName = swapDirection === 'a_to_b' ? 'swap_a_to_b' : 'swap_b_to_a';

            // Calculate deadline (20 minutes from now)
            const deadline = Date.now() + 20 * 60 * 1000;

            // Call the Move function
            // CRITICAL: typeArguments must match the Pool's defined order <TokenA, TokenB>
            const [coinOut] = tx.moveCall({
                target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::${functionName}`,
                typeArguments: [poolTokenAType, poolTokenBType],
                arguments: [
                    tx.object(poolId),
                    coinToSwap,
                    tx.pure.u64(minAmountOut),
                    tx.pure.u64(deadline),
                    tx.object('0x6'), // Clock object
                ],
            });

            // Transfer the output coin to the user
            tx.transferObjects([coinOut], tx.pure.address(account.address));

            // Execute the transaction
            const response = await signAndExecute({
                transaction: tx,
            });

            // Wait for the transaction to be indexed
            await client.waitForTransaction({ digest: response.digest });

            return response.digest;
        },
        onSuccess: async (digest) => {
            toast.success('Swap executed successfully!');
            console.log('Transaction digest:', digest);

            // Wait for indexer to update
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Refresh data
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            queryClient.invalidateQueries({ queryKey: ['coin-balance'] });
        },
        onError: (error) => {
            console.error('Swap failed:', error);
            toast.error(`Swap failed: ${error.message}`);
        },
    });
}
