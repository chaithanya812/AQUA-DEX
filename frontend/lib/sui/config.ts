import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

export const PACKAGE_ID = '0x01e8a2098a6ad53f95679263837ff5f1a46c7795283b213fb471b66a4d50480a';
export const UPGRADE_CAP = '0x3ae6814b18d390baf96b8a3a3851b1a3fe449740a68cfad8808de9084962bb1e';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl('testnet'),
        packageId: PACKAGE_ID,
        modules: {
            liquidityPool: 'liquidity_pool',
            lpPositionNft: 'lp_position_nft',
        }
    },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };

// Module names
export const MODULES = {
    LIQUIDITY_POOL: 'liquidity_pool',
    LP_POSITION_NFT: 'lp_position_nft',
} as const;
