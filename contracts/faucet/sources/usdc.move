module faucet::usdc {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct USDC has drop {}

    fun init(witness: USDC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6, 
            b"USDC", 
            b"USDC Coin", 
            b"Testnet USDC", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_share_object(treasury);
    }

    public entry fun mint(
        treasury_cap: &mut coin::TreasuryCap<USDC>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }
}
