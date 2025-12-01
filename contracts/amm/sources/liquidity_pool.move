/// Liquidity Pool Module
/// Core AMM with constant product formula (x * y = k)
module amm::liquidity_pool {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};

    /// Error codes
    const E_INSUFFICIENT_LIQUIDITY: u64 = 1;
    const E_INSUFFICIENT_INPUT_AMOUNT: u64 = 2;
    const E_INSUFFICIENT_OUTPUT_AMOUNT: u64 = 3;
    const E_INSUFFICIENT_A_AMOUNT: u64 = 4;
    const E_INSUFFICIENT_B_AMOUNT: u64 = 5;
    const E_INSUFFICIENT_LIQUIDITY_MINTED: u64 = 6;
    const E_INSUFFICIENT_LIQUIDITY_BURNED: u64 = 7;
    const E_INVALID_TO: u64 = 8;
    const E_K_INVARIANT_VIOLATED: u64 = 9;
    const E_DEADLINE_EXPIRED: u64 = 10;
    const E_SLIPPAGE_EXCEEDED: u64 = 11;

    /// Minimum liquidity locked forever (prevents division by zero)
    const MINIMUM_LIQUIDITY: u64 = 1000;

    /// Liquidity Pool
    public struct Pool<phantom TokenA, phantom TokenB> has key, store {
        id: UID,
        /// Reserve of token A
        reserve_a: Balance<TokenA>,
        /// Reserve of token B
        reserve_b: Balance<TokenB>,
        /// Total LP token supply
        lp_supply: u64,
        /// Fee tier in basis points (30 = 0.3%)
        fee_tier: u64,
        /// Accumulated fees for token A
        fee_a: Balance<TokenA>,
        /// Accumulated fees for token B
        fee_b: Balance<TokenB>,
        /// K constant (reserve_a * reserve_b)
        k_last: u128,
    }

use sui::package;
use sui::display;

    public struct LIQUIDITY_POOL has drop {}

    /// LP Token (Non-generic to support single Display object)
    public struct LPToken has key, store {
        id: UID,
        pool_id: ID,
        balance: u64,
        name: String,
        description: String,
        url: String,
        initial_reserve_a: u64,
        initial_reserve_b: u64,
    }

    fun init(witness: LIQUIDITY_POOL, ctx: &mut TxContext) {
        let publisher = package::claim(witness, ctx);
        
        // Create Display for LPToken
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"link"),
            string::utf8(b"project_url"),
            string::utf8(b"creator"),
        ];

        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{url}"),
            string::utf8(b"https://aquaswap.vercel.app/pool/{pool_id}"),
            string::utf8(b"https://aquaswap.vercel.app"),
            string::utf8(b"AquaSwap AMM"),
        ];

        let mut display = display::new_with_fields<LPToken>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_share_object(display);
    }

    public struct PoolCreated<phantom TokenA, phantom TokenB> has copy, drop {
        pool_id: ID,
        fee_tier: u64,
    }

    public struct Swap<phantom TokenA, phantom TokenB> has copy, drop {
        sender: address,
        amount_in: u64,
        amount_out: u64,
        is_a_to_b: bool,
        timestamp: u64,
    }

    public struct LiquidityAdded<phantom TokenA, phantom TokenB> has copy, drop {
        sender: address,
        amount_a: u64,
        amount_b: u64,
        lp_minted: u64,
        timestamp: u64,
    }

    public struct LiquidityRemoved<phantom TokenA, phantom TokenB> has copy, drop {
        sender: address,
        amount_a: u64,
        amount_b: u64,
        lp_burned: u64,
        timestamp: u64,
    }

    public struct FeesReinvested<phantom TokenA, phantom TokenB> has copy, drop {
        amount_a: u64,
        amount_b: u64,
        timestamp: u64,
    }

    /// Create a new liquidity pool
    public fun create_pool<TokenA, TokenB>(
        fee_tier: u64,
        ctx: &mut TxContext
    ): Pool<TokenA, TokenB> {
        let pool = Pool<TokenA, TokenB> {
            id: object::new(ctx),
            reserve_a: balance::zero<TokenA>(),
            reserve_b: balance::zero<TokenB>(),
            lp_supply: 0,
            fee_tier,
            fee_a: balance::zero<TokenA>(),
            fee_b: balance::zero<TokenB>(),
            k_last: 0,
        };

        event::emit(PoolCreated<TokenA, TokenB> {
            pool_id: object::id(&pool),
            fee_tier,
        });

        pool
    }

    /// Add liquidity to the pool
    /// Returns LP tokens representing share of the pool
    public fun add_liquidity<TokenA, TokenB>(
        pool: &mut Pool<TokenA, TokenB>,
        coin_a: Coin<TokenA>,
        coin_b: Coin<TokenB>,
        min_liquidity: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): LPToken {
        let amount_a = coin::value(&coin_a);
        let amount_b = coin::value(&coin_b);

        assert!(amount_a > 0, E_INSUFFICIENT_A_AMOUNT);
        assert!(amount_b > 0, E_INSUFFICIENT_B_AMOUNT);

        let reserve_a = balance::value(&pool.reserve_a);
        let reserve_b = balance::value(&pool.reserve_b);

        let liquidity = if (pool.lp_supply == 0) {
            // First liquidity provider
            // LP tokens = sqrt(amount_a * amount_b) - MINIMUM_LIQUIDITY
            let initial_liquidity = sqrt((amount_a as u128) * (amount_b as u128));
            assert!(initial_liquidity > (MINIMUM_LIQUIDITY as u128), E_INSUFFICIENT_LIQUIDITY_MINTED);
            (initial_liquidity - (MINIMUM_LIQUIDITY as u128)) as u64
        } else {
            // Subsequent liquidity providers
            // liquidity = min(amount_a * total_supply / reserve_a, amount_b * total_supply / reserve_b)
            let liquidity_a = ((amount_a as u128) * (pool.lp_supply as u128) / (reserve_a as u128)) as u64;
            let liquidity_b = ((amount_b as u128) * (pool.lp_supply as u128) / (reserve_b as u128)) as u64;
            
            if (liquidity_a < liquidity_b) { liquidity_a } else { liquidity_b }
        };

        assert!(liquidity >= min_liquidity, E_INSUFFICIENT_LIQUIDITY_MINTED);

        // Add coins to reserves
        balance::join(&mut pool.reserve_a, coin::into_balance(coin_a));
        balance::join(&mut pool.reserve_b, coin::into_balance(coin_b));
        
        // Update LP supply
        pool.lp_supply = pool.lp_supply + liquidity;

        // Update K
        let new_reserve_a = balance::value(&pool.reserve_a);
        let new_reserve_b = balance::value(&pool.reserve_b);
        pool.k_last = (new_reserve_a as u128) * (new_reserve_b as u128);

        // Emit event
        event::emit(LiquidityAdded<TokenA, TokenB> {
            sender: tx_context::sender(ctx),
            amount_a,
            amount_b,
            lp_minted: liquidity,
            timestamp: clock::timestamp_ms(clock),
        });

        // Create LP token
        LPToken {
            id: object::new(ctx),
            pool_id: object::id(pool),
            balance: liquidity,
            name: string::utf8(b"AquaSwap LP Position"),
            description: string::utf8(b"Liquidity Provider Position for AquaSwap AMM"),
            url: string::utf8(b"https://aquaswap.vercel.app/nft-placeholder.png"),
            initial_reserve_a: new_reserve_a,
            initial_reserve_b: new_reserve_b,
        }
    }

    /// Swap token A for token B
    public fun swap_a_to_b<TokenA, TokenB>(
        pool: &mut Pool<TokenA, TokenB>,
        coin_a: Coin<TokenA>,
        min_amount_out: u64,
        deadline: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<TokenB> {
        assert!(clock::timestamp_ms(clock) <= deadline, E_DEADLINE_EXPIRED);
        let amount_in = coin::value(&coin_a);
        assert!(amount_in > 0, E_INSUFFICIENT_INPUT_AMOUNT);

        // Calculate output with fee
        let amount_out = get_amount_out(
            amount_in,
            balance::value(&pool.reserve_a),
            balance::value(&pool.reserve_b),
            pool.fee_tier
        );

        assert!(amount_out >= min_amount_out, E_SLIPPAGE_EXCEEDED);
        assert!(amount_out > 0, E_INSUFFICIENT_OUTPUT_AMOUNT);

        // Calculate fee (already deducted in get_amount_out)
        let fee_amount = (((amount_in as u128) * (pool.fee_tier as u128) / 10000) as u64);
        
        // Add input to reserve
        let mut balance_in = coin::into_balance(coin_a);
        let fee_balance = balance::split(&mut balance_in, fee_amount);
        balance::join(&mut pool.fee_a, fee_balance);
        balance::join(&mut pool.reserve_a, balance_in);

        // Remove output from reserve
        let balance_out = balance::split(&mut pool.reserve_b, amount_out);

        // Verify K invariant
        verify_k_invariant(pool);

        // Emit event
        event::emit(Swap<TokenA, TokenB> {
            sender: tx_context::sender(ctx),
            amount_in,
            amount_out,
            is_a_to_b: true,
            timestamp: clock::timestamp_ms(clock),
        });

        coin::from_balance(balance_out, ctx)
    }

    /// Swap token B for token A
    public fun swap_b_to_a<TokenA, TokenB>(
        pool: &mut Pool<TokenA, TokenB>,
        coin_b: Coin<TokenB>,
        min_amount_out: u64,
        deadline: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<TokenA> {
        assert!(clock::timestamp_ms(clock) <= deadline, E_DEADLINE_EXPIRED);
        let amount_in = coin::value(&coin_b);
        assert!(amount_in > 0, E_INSUFFICIENT_INPUT_AMOUNT);

        // Calculate output with fee
        let amount_out = get_amount_out(
            amount_in,
            balance::value(&pool.reserve_b),
            balance::value(&pool.reserve_a),
            pool.fee_tier
        );

        assert!(amount_out >= min_amount_out, E_SLIPPAGE_EXCEEDED);
        assert!(amount_out > 0, E_INSUFFICIENT_OUTPUT_AMOUNT);

        // Calculate fee
        let fee_amount = (((amount_in as u128) * (pool.fee_tier as u128) / 10000) as u64);
        
        // Add input to reserve
        let mut balance_in = coin::into_balance(coin_b);
        let fee_balance = balance::split(&mut balance_in, fee_amount);
        balance::join(&mut pool.fee_b, fee_balance);
        balance::join(&mut pool.reserve_b, balance_in);

        // Remove output from reserve
        let balance_out = balance::split(&mut pool.reserve_a, amount_out);

        // Verify K invariant
        verify_k_invariant(pool);

        // Emit event
        event::emit(Swap<TokenA, TokenB> {
            sender: tx_context::sender(ctx),
            amount_in,
            amount_out,
            is_a_to_b: false,
            timestamp: clock::timestamp_ms(clock),
        });

        coin::from_balance(balance_out, ctx)
    }

    /// Remove liquidity from pool
    public fun remove_liquidity<TokenA, TokenB>(
        pool: &mut Pool<TokenA, TokenB>,
        lp_token: LPToken,
        min_amount_a: u64,
        min_amount_b: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): (Coin<TokenA>, Coin<TokenB>) {
        let LPToken { 
            id, 
            pool_id, 
            balance: liquidity, 
            name: _, 
            description: _, 
            url: _,
            initial_reserve_a: _,
            initial_reserve_b: _
        } = lp_token;
        object::delete(id);

        assert!(pool_id == object::id(pool), E_INVALID_TO);
        assert!(liquidity > 0, E_INSUFFICIENT_LIQUIDITY_BURNED);

        let reserve_a = balance::value(&pool.reserve_a);
        let reserve_b = balance::value(&pool.reserve_b);

        // Calculate amounts: amount = (liquidity * reserve) / total_supply
        let amount_a = (((liquidity as u128) * (reserve_a as u128) / (pool.lp_supply as u128)) as u64);
        let amount_b = (((liquidity as u128) * (reserve_b as u128) / (pool.lp_supply as u128)) as u64);

        assert!(amount_a >= min_amount_a, E_INSUFFICIENT_A_AMOUNT);
        assert!(amount_b >= min_amount_b, E_INSUFFICIENT_B_AMOUNT);

        // Update LP supply
        pool.lp_supply = pool.lp_supply - liquidity;

        // Remove from reserves
        let balance_a = balance::split(&mut pool.reserve_a, amount_a);
        let balance_b = balance::split(&mut pool.reserve_b, amount_b);

        // Update K
        let new_reserve_a = balance::value(&pool.reserve_a);
        let new_reserve_b = balance::value(&pool.reserve_b);
        pool.k_last = (new_reserve_a as u128) * (new_reserve_b as u128);

        // Emit event
        event::emit(LiquidityRemoved<TokenA, TokenB> {
            sender: tx_context::sender(ctx),
            amount_a,
            amount_b,
            lp_burned: liquidity,
            timestamp: clock::timestamp_ms(clock),
        });
        
        (coin::from_balance(balance_a, ctx), coin::from_balance(balance_b, ctx))
    }

    /// Reinvest accumulated fees into reserves (Auto-compounding)
    public fun reinvest_fees<TokenA, TokenB>(
        pool: &mut Pool<TokenA, TokenB>,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let amount_a = balance::value(&pool.fee_a);
        let amount_b = balance::value(&pool.fee_b);

        if (amount_a > 0) {
            let fees = balance::withdraw_all(&mut pool.fee_a);
            balance::join(&mut pool.reserve_a, fees);
        };

        if (amount_b > 0) {
            let fees = balance::withdraw_all(&mut pool.fee_b);
            balance::join(&mut pool.reserve_b, fees);
        };

        // Update K since reserves changed
        let new_reserve_a = balance::value(&pool.reserve_a);
        let new_reserve_b = balance::value(&pool.reserve_b);
        pool.k_last = (new_reserve_a as u128) * (new_reserve_b as u128);

        event::emit(FeesReinvested<TokenA, TokenB> {
            amount_a,
            amount_b,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    fun get_amount_out(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
        fee_tier: u64
    ): u64 {
        assert!(amount_in > 0, E_INSUFFICIENT_INPUT_AMOUNT);
        assert!(reserve_in > 0 && reserve_out > 0, E_INSUFFICIENT_LIQUIDITY);

        // Apply fee: amount_in_with_fee = amount_in * (10000 - fee_tier) / 10000
        let amount_in_with_fee = (amount_in as u128) * ((10000 - fee_tier) as u128);
        let numerator = amount_in_with_fee * (reserve_out as u128);
        let denominator = ((reserve_in as u128) * 10000) + amount_in_with_fee;

        (numerator / denominator) as u64
    }

    fun verify_k_invariant<TokenA, TokenB>(pool: &Pool<TokenA, TokenB>) {
        let reserve_a = balance::value(&pool.reserve_a);
        let reserve_b = balance::value(&pool.reserve_b);
        let k_new = (reserve_a as u128) * (reserve_b as u128);
        
        // K should be >= k_last (allowing for rounding)
        assert!(k_new >= pool.k_last, E_K_INVARIANT_VIOLATED);
    }

    fun sqrt(y: u128): u128 {
        if (y < 4) {
            if (y == 0) {
                0
            } else {
                1
            }
        } else {
            let mut z = y;
            let mut x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            };
            z
        }
    }

    public fun get_reserves<TokenA, TokenB>(pool: &Pool<TokenA, TokenB>): (u64, u64) {
        (balance::value(&pool.reserve_a), balance::value(&pool.reserve_b))
    }

    public fun get_lp_supply<TokenA, TokenB>(pool: &Pool<TokenA, TokenB>): u64 {
        pool.lp_supply
    }

    public fun get_fees<TokenA, TokenB>(pool: &Pool<TokenA, TokenB>): (u64, u64) {
        (balance::value(&pool.fee_a), balance::value(&pool.fee_b))
    }

    public fun lp_token_balance(lp_token: &LPToken): u64 {
        lp_token.balance
    }

    public fun share_pool<TokenA, TokenB>(pool: Pool<TokenA, TokenB>) {
        transfer::share_object(pool);
    }

    #[test_only]
    public fun create_pool_for_testing<TokenA, TokenB>(
        fee_tier: u64,
        ctx: &mut TxContext
    ): Pool<TokenA, TokenB> {
        create_pool<TokenA, TokenB>(fee_tier, ctx)
    }
}
