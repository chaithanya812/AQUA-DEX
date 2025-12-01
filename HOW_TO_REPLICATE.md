# How to Replicate: AquaSwap Integration Guide

This document details the steps taken to successfully integrate the AquaSwap frontend with the Sui blockchain, specifically focusing on Minting Tokens and Creating Pools. Use this as a guide to replicate the setup or debug future issues.

## 1. Minting Test Tokens (The Faucet)

To allow users to test the DEX, we needed a way to mint free tokens (USDC, ETH). Since we are on Testnet, we deployed our own Faucet contract.

### Step 1: Create the Faucet Package
We created a simple Move package (`contracts/faucet`) with two modules: `usdc.move` and `eth.move`.
- Each module defines a `struct` (USDC/ETH) with the `drop` ability.
- The `init` function creates a `TreasuryCap` and `CoinMetadata`.
- **Crucially**, we used `transfer::public_share_object(treasury)` to make the TreasuryCap a **Shared Object**. This allows *anyone* to call the mint function, not just the deployer.

### Step 2: Deploy to Testnet
We ran:
```bash
sui client publish --gas-budget 100000000
```
This returned the **Package ID** and a list of created objects.

### Step 3: Find the Shared TreasuryCaps
After deployment, we needed the specific Object IDs of the shared TreasuryCaps to call the `mint` function from the frontend.
1.  We looked at the transaction details or used `sui client objects` to list all objects.
2.  We filtered for objects with type `0x2::coin::TreasuryCap<...>` that were **Shared**.
    *   *Note: Do not use the "Immutable" or "AddressOwner" objects if you want public minting.*

**Found IDs:**
- **USDC TreasuryCap:** `0x3216c99a196f1bc729dfe5a312be927796186e737cd889acbfa042474792204d`
- **ETH TreasuryCap:** `0x3170333a46e8a914242515eb1c229d652cb127e281ade58de4a6d59dc9855e3b`

### Step 4: Update Frontend (`MintTokens.tsx`)
We updated the `MintTokens` component to:
1.  Use the new **Package ID**.
2.  Use the specific **Shared TreasuryCap IDs** found above.
3.  Call the `mint` function: `${PACKAGE_ID}::usdc::mint(treasury_cap, amount, recipient, clock)`.

---

## 2. Creating Liquidity Pools

The "Create Pool" feature allows users to initialize a new trading pair.

### Step 1: The Smart Contract (`liquidity_pool.move`)
The `create_pool` function in our AMM contract:
- Takes `fee_tier` as an argument.
- Creates a `Pool` object.
- **Returns:** `Pool<TokenA, TokenB>`.
- *Important:* It does NOT return an LP NFT or mint initial liquidity. That happens in `add_liquidity`.

### Step 2: Frontend Implementation (`usePool.ts`)
We used `tx.moveCall` to execute `create_pool`.
**The Challenge:** Move functions that return objects require those objects to be handled (consumed) in the same transaction block. You can't just leave them "hanging".

**The Fix:**
1.  **Capture the Result:** `const [pool] = tx.moveCall(...)`
2.  **Share the Pool:** We immediately called `0x2::transfer::public_share_object(pool)` in the same transaction block. This makes the pool publicly accessible for everyone to swap and add liquidity.

```typescript
// Example from usePool.ts
const [pool] = tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::create_pool`,
    typeArguments: [tokenAType, tokenBType],
    arguments: [tx.pure.u64(feeTier)],
});

// Share it!
tx.moveCall({
    target: `0x2::transfer::public_share_object`,
    typeArguments: [`${PACKAGE_ID}::${MODULES.LIQUIDITY_POOL}::Pool<${tokenAType}, ${tokenBType}>`],
    arguments: [pool],
});
```

---

## 3. Debugging Tips

### "Dependent package not found"
- **Cause:** You are trying to use a Package ID that doesn't exist on the network you are connected to.
- **Fix:** Redeploy the package or double-check your `sui client active-env` (Testnet vs Devnet).

### "Mutable parameter provided, immutable parameter expected"
- **Cause:** You are trying to pass an Owned object (which you own) where a Shared or Immutable object is expected, or vice-versa.
- **Fix:** Check the object's owner using `sui client object <ID>`. If it says "AddressOwner", it's private. If it says "Shared", it's public.

### "UnusedValueWithoutDrop"
- **Cause:** A Move function returned a value (like a Pool object) but you didn't do anything with it (like transfer or share it).
- **Fix:** Pass the returned object to another function (e.g., `transfer::public_share_object`) in the same transaction block.

### "CommandArgumentError"
- **Cause:** You tried to access a return value that doesn't exist (e.g., trying to get the 2nd return value when the function only returns 1).
- **Fix:** Check the Move function signature carefully to see exactly what it returns.
