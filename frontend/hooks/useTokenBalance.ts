import { useQuery } from '@tanstack/react-query';
import { Token } from '@/types';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';

export function useTokenBalance(token: Token | null) {
    const client = useSuiClient();
    const account = useCurrentAccount();

    return useQuery({
        queryKey: ['balance', account?.address, token?.address],
        queryFn: async () => {
            if (!token || !account) return '0';

            // If it's the native SUI token
            if (token.address === '0x2::sui::SUI') {
                const { totalBalance } = await client.getBalance({
                    owner: account.address,
                });
                return totalBalance;
            }

            // For other tokens (coins)
            const { totalBalance } = await client.getBalance({
                owner: account.address,
                coinType: token.address,
            });

            return totalBalance;
        },
        enabled: !!token && !!account,
        refetchInterval: 10000,
    });
}

export function useAllTokenBalances(tokens: Token[]) {
    const client = useSuiClient();
    const account = useCurrentAccount();

    return useQuery({
        queryKey: ['allBalances', account?.address],
        queryFn: async () => {
            if (!account) return {};

            const balances: Record<string, string> = {};

            // Fetch all coin balances at once
            const allBalances = await client.getAllBalances({
                owner: account.address,
            });

            // Map the results to our token list
            tokens.forEach((token) => {
                const balanceInfo = allBalances.find((b) => b.coinType === token.address);
                balances[token.symbol] = balanceInfo ? balanceInfo.totalBalance : '0';
            });

            return balances;
        },
        enabled: !!account && tokens.length > 0,
        refetchInterval: 10000,
    });
}
