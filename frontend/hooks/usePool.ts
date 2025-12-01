import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pool } from '@/types';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULES } from '@/lib/sui/config';
import { toast } from 'sonner';

export function usePools() {
    const client = useSuiClient();

    return useQuery({
        queryKey: ['pools'],
        queryFn: async () => {
            // Query for PoolCreated events
            const events = await client.queryEvents({
                query: {
                    MoveModule: {
                        package: PACKAGE_ID,
                        module: MODULES.LIQUIDITY_POOL,
                    },
                },
                limit: 50,
                order: 'descending',
            });

            // Extract unique pool IDs from events
            const poolIds = new Set<string>();
            events.data.forEach((event) => {
                if (event.type.includes('::PoolCreated')) {
                    const parsedJson = event.parsedJson as any;
                    if (parsedJson?.pool_id) {
                        poolIds.add(parsedJson.pool_id);
                    }
                }
            });

            if (poolIds.size === 0) return [];

            // Fetch the actual pool objects
            const poolObjects = await client.multiGetObjects({
                ids: Array.from(poolIds),
                options: {
                    showContent: true,
                    showType: true,
                },
            });

            // Extract all unique token types
            const tokenTypes = new Set<string>();
            poolObjects.forEach((obj) => {
                const type = obj.data?.type || '';
                const typeArgs = type.match(/<(.+), (.+)>/);
                if (typeArgs) {
                    tokenTypes.add(typeArgs[1]);
                    tokenTypes.add(typeArgs[2]);
                }
            });

            // Fetch metadata for all tokens
            const metadataMap = new Map<string, any>();
            await Promise.all(
                Array.from(tokenTypes).map(async (type) => {
                    try {
                        const metadata = await client.getCoinMetadata({ coinType: type });
                        if (metadata) {
                            metadataMap.set(type, metadata);
                        }
                    } catch (e) {
                        console.error(`Failed to fetch metadata for ${type}`, e);
                    }
                })
            );

            // Map to our Pool type
            const pools: Pool[] = poolObjects.map((obj) => {
                const content = obj.data?.content as any;
                const fields = content?.fields;
                const type = obj.data?.type || '';

                // Extract token types from the Pool type string: Pool<TokenA, TokenB>
                const typeArgs = type.match(/<(.+), (.+)>/);
                const tokenAType = typeArgs?.[1] || '';
                const tokenBType = typeArgs?.[2] || '';

                // Helper to get symbol from type (e.g. ...::sui::SUI -> SUI)
                const getSymbol = (t: string) => {
                    const metadata = metadataMap.get(t);
                    if (metadata?.symbol) return metadata.symbol;
                    return t.split('::').pop() || 'UNK';
                };

                const getDecimals = (t: string) => {
                    const metadata = metadataMap.get(t);
                    return metadata?.decimals || 9; // Fallback to 9 if fetch fails
                };

                const symbolA = getSymbol(tokenAType);
                const symbolB = getSymbol(tokenBType);
                const decimalsA = getDecimals(tokenAType);
                const decimalsB = getDecimals(tokenBType);

                // Mock prices for TVL calculation (since we don't have an oracle)
                const MOCK_PRICES: Record<string, number> = {
                    'USDC': 1,
                    'SUI': 1.5,
                    'ETH': 2000,
                    'BTC': 40000,
                };

                const reserveA = fields?.reserve_a?.fields?.value || fields?.reserve_a || '0';
                const reserveB = fields?.reserve_b?.fields?.value || fields?.reserve_b || '0';

                const priceA = MOCK_PRICES[symbolA] || 0;
                const priceB = MOCK_PRICES[symbolB] || 0;

                // Calculate TVL using real decimals
                const tvl = (Number(reserveA) / Math.pow(10, decimalsA) * priceA) + (Number(reserveB) / Math.pow(10, decimalsB) * priceB);

                return {
                    id: obj.data?.objectId || '',
                    tokenA: {
                        symbol: symbolA,
                        name: metadataMap.get(tokenAType)?.name || symbolA,
                        decimals: decimalsA,
                        address: tokenAType
                    },
                    tokenB: {
                        symbol: symbolB,
                        name: metadataMap.get(tokenBType)?.name || symbolB,
                        decimals: decimalsB,
                        address: tokenBType
                    },
                    feeTier: fields?.fee_tier || 30, // Default 0.3% (30 basis points)
                    tvl: tvl,
                    volume24h: 0, // Need indexer for this
                    apr: 0, // Need indexer for this
                    reserveA,
                    reserveB,
                    lpSupply: fields?.lp_supply?.fields?.value || fields?.lp_supply || '0',
                    type: 'standard',
                };
            });

            return pools;
        },
        refetchInterval: 10000,
    });
}

export function useAddLiquidity() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            poolId,
            tokenAType,
            tokenBType,
            amountA,
            amountB,
            minLiquidity,
        }: {
            poolId: string;
            tokenAType: string;
            tokenBType: string;
            amountA: string;
            amountB: string;
            minLiquidity: string;
        }) => {
            if (!account) throw new Error('Wallet not connected');

            const tx = new Transaction();

            // Helper to prepare coin input
            const prepareCoin = async (tokenType: string, amount: string) => {
                // If the token is SUI, use the gas coin directly
                // This prevents "No valid gas coins" error by letting the wallet handle gas
                if (tokenType.endsWith('::sui::SUI')) {
                    const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
                    return splitCoin;
                }

                const { data: coins } = await client.getCoins({
                    owner: account.address,
                    coinType: tokenType,
                });

                if (coins.length === 0) throw new Error(`No coins found for ${tokenType}`);

                const primaryCoin = coins[0];
                if (coins.length > 1) {
                    tx.mergeCoins(
                        tx.object(primaryCoin.coinObjectId),
                        coins.slice(1).map(c => tx.object(c.coinObjectId))
                    );
                }

                const [splitCoin] = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [tx.pure.u64(amount)]);
                return splitCoin;
            };

            const coinA = await prepareCoin(tokenAType, amountA);
            const coinB = await prepareCoin(tokenBType, amountB);

            // The add_liquidity function returns LPToken<TokenA, TokenB>
            const [lpToken] = tx.moveCall({
                target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::add_liquidity`,
                typeArguments: [tokenAType, tokenBType],
                arguments: [
                    tx.object(poolId),
                    coinA,
                    coinB,
                    tx.pure.u64(minLiquidity),
                    tx.object('0x6'), // Clock
                ],
            });

            // Transfer the LP token to the user
            tx.transferObjects([lpToken], tx.pure.address(account.address));

            const response = await signAndExecute({
                transaction: tx,
            });

            await client.waitForTransaction({ digest: response.digest });
            return response.digest;
        },
        onSuccess: async () => {
            toast.success('Liquidity added successfully!');
            // Wait a moment for the indexer/RPC to update
            await new Promise(resolve => setTimeout(resolve, 2000));
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            queryClient.invalidateQueries({ queryKey: ['positions'] });
        },
        onError: (error) => {
            console.error('Add liquidity failed:', error);
            toast.error(`Failed to add liquidity: ${error.message}`);
        },
    });
}

export function useRemoveLiquidity() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            poolId,
            tokenAType,
            tokenBType,
            lpTokenId,
            minAmountA,
            minAmountB,
        }: {
            poolId: string;
            tokenAType: string;
            tokenBType: string;
            lpTokenId: string;
            minAmountA: string;
            minAmountB: string;
        }) => {
            if (!account) throw new Error('Wallet not connected');

            const tx = new Transaction();

            const [coinA, coinB] = tx.moveCall({
                target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::remove_liquidity`,
                typeArguments: [tokenAType, tokenBType],
                arguments: [
                    tx.object(poolId),
                    tx.object(lpTokenId),
                    tx.pure.u64(minAmountA),
                    tx.pure.u64(minAmountB),
                    tx.object('0x6'), // Clock
                ],
            });

            tx.transferObjects([coinA, coinB], tx.pure.address(account.address));

            const response = await signAndExecute({
                transaction: tx,
            });

            await client.waitForTransaction({ digest: response.digest });
            return response.digest;
        },
        onSuccess: () => {
            toast.success('Liquidity removed successfully!');
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            queryClient.invalidateQueries({ queryKey: ['positions'] });
        },
        onError: (error) => {
            console.error('Remove liquidity failed:', error);
            toast.error(`Failed to remove liquidity: ${error.message}`);
        },
    });
}

export function useCreatePool() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tokenAType,
            tokenBType,
            feeTier,
        }: {
            tokenAType: string;
            tokenBType: string;
            feeTier: number;
        }) => {
            if (!account) throw new Error('Wallet not connected');

            const tx = new Transaction();

            // Note: This assumes a create_pool entry function exists in your module
            // You might need to adjust arguments based on your specific factory implementation
            // The create_pool function returns just the Pool<TokenA, TokenB> object
            // We need to share it so it can be used by others
            const [pool] = tx.moveCall({
                target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::create_pool`,
                typeArguments: [tokenAType, tokenBType],
                arguments: [
                    tx.pure.u64(feeTier),
                ],
            });

            // Share the pool object
            tx.moveCall({
                target: `0x2::transfer::public_share_object`,
                typeArguments: [`${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::Pool<${tokenAType}, ${tokenBType}>`],
                arguments: [pool],
            });

            const response = await signAndExecute({
                transaction: tx,
            });

            await client.waitForTransaction({ digest: response.digest });
            return response.digest;
        },
        onSuccess: () => {
            toast.success('Pool created successfully!');
            queryClient.invalidateQueries({ queryKey: ['pools'] });
        },
        onError: (error) => {
            console.error('Create pool failed:', error);
            toast.error(`Failed to create pool: ${error.message}`);
        },
    });
}
