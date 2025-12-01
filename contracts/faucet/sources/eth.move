module faucet::eth {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct ETH has drop {}

    fun init(witness: ETH, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            8, 
            b"ETH", 
            b"Ethereum", 
            b"Testnet ETH", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_share_object(treasury);
    }

    public entry fun mint(
        treasury_cap: &mut coin::TreasuryCap<ETH>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }
}
