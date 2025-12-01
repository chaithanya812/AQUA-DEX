import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePools } from './usePool';
import { LPPosition, Pool } from '@/types';
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULES } from '@/lib/sui/config';
import { toast } from 'sonner';

export function useUserPositions() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { data: pools } = usePools();

    return useQuery({
        queryKey: ['positions', account?.address, pools?.length],
        queryFn: async () => {
            if (!account || !pools || pools.length === 0) return [];

            const lpTokenType = `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::LPToken`;

            try {
                const { data } = await client.getOwnedObjects({
                    owner: account.address,
                    filter: {
                        StructType: lpTokenType,
                    },
                    options: {
                        showContent: true,
                        showDisplay: true,
                        showType: true,
                    },
                });

                const allPositions = data.map((obj) => {
                    const content = obj.data?.content as any;
                    const fields = content?.fields;
                    const poolId = fields?.pool_id;
                    const pool = pools.find(p => p.id === poolId);

                    if (!pool) return null;

                    const lpBalance = Number(fields?.balance || '0');
                    const lpSupply = Number(pool.lpSupply || '1'); // Avoid division by zero

                    const share = lpSupply > 0 ? lpBalance / lpSupply : 0;

                    const amountA = share * Number(pool.reserveA);
                    const amountB = share * Number(pool.reserveB);

                    // Mock prices (same as usePools)
                    const MOCK_PRICES: Record<string, number> = {
                        'USDC': 1,
                        'SUI': 1.5,
                        'ETH': 2000,
                        'BTC': 40000,
                    };
                    const getSymbol = (t: string) => t.split('::').pop() || 'UNK';
                    const priceA = MOCK_PRICES[getSymbol(pool.tokenA.address)] || 0;
                    const priceB = MOCK_PRICES[getSymbol(pool.tokenB.address)] || 0;

                    // Value in USD
                    const valueA = (amountA / Math.pow(10, pool.tokenA.decimals)) * priceA;
                    const valueB = (amountB / Math.pow(10, pool.tokenB.decimals)) * priceB;

                    return {
                        id: obj.data?.objectId || '',
                        pool: pool,
                        lpTokens: fields?.balance || '0',
                        shareOfPool: share * 100, // Percentage
                        currentValueA: valueA.toString(),
                        currentValueB: valueB.toString(),
                        unclaimedFeesA: '0',
                        unclaimedFeesB: '0',
                        impermanentLoss: 0,
                        pnlPercent: 0,
                        initialValueA: '0',
                        initialValueB: '0',
                        createdAt: Date.now(),
                        name: fields?.name || 'AquaSwap LP Position',
                        description: fields?.description || '',
                        url: fields?.url || '',
                    };
                }).filter((p): p is LPPosition => p !== null);

                return allPositions;
            } catch (err) {
                console.error('Failed to fetch positions', err);
                return [];
            }
        },
        enabled: !!account && !!pools && pools.length > 0,
    });
}

export function useEnrichedPositions(positions: LPPosition[], pools: Pool[]) {
    // In a real app, you would merge pool data into the positions here
    // For example, calculating current value based on pool reserves and LP token amount
    return positions;
}

export function useClaimFees() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            poolId,
            tokenAType,
            tokenBType,
            positionId,
        }: {
            poolId: string;
            tokenAType: string;
            tokenBType: string;
            positionId: string;
        }) => {
            if (!account) throw new Error('Wallet not connected');

            const tx = new Transaction();

            const [coinA, coinB] = tx.moveCall({
                target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::collect_fee`,
                typeArguments: [tokenAType, tokenBType],
                arguments: [
                    tx.object(poolId),
                    tx.object(positionId),
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
            toast.success('Fees claimed successfully!');
            queryClient.invalidateQueries({ queryKey: ['positions'] });
        },
        onError: (error) => {
            console.error('Claim fees failed:', error);
            toast.error(`Failed to claim fees: ${error.message}`);
        },
    });
}
