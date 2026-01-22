program timevault_subscription_9483.aleo;

struct Subscription:
    user as address;
    tier as u8;
    start_time as u64;
    end_time as u64;
    vaults_used as u64;
    is_active as boolean;

mapping subscriptions:
    key as address.public;
    value as Subscription.public;

mapping vault_limits:
    key as u8.public;
    value as u64.public;

mapping tier_prices:
    key as u8.public;
    value as u64.public;

function initialize_tiers:
    async initialize_tiers into r0;
    output r0 as timevault_subscription_9483.aleo/initialize_tiers.future;

finalize initialize_tiers:
    set 10u64 into vault_limits[0u8];
    set 1000000u64 into vault_limits[1u8];
    set 0u64 into tier_prices[0u8];
    set 999000u64 into tier_prices[1u8];

function subscribe:
    input r0 as u8.private;
    input r1 as u64.private;
    is.eq r0 0u8 into r2;
    is.eq r0 1u8 into r3;
    or r2 r3 into r4;
    assert.eq r4 true;
    async subscribe self.caller r0 r1 into r5;
    output r5 as timevault_subscription_9483.aleo/subscribe.future;

finalize subscribe:
    input r0 as address.public;
    input r1 as u8.public;
    input r2 as u64.public;
    add r2 2592000u64 into r3;
    cast r0 r1 r2 r3 0u64 true into r4 as Subscription;
    set r4 into subscriptions[r0];

function increment_vault_count:
    async increment_vault_count self.caller into r0;
    output r0 as timevault_subscription_9483.aleo/increment_vault_count.future;

finalize increment_vault_count:
    input r0 as address.public;
    get subscriptions[r0] into r1;
    get vault_limits[r1.tier] into r2;
    lt r1.vaults_used r2 into r3;
    assert.eq r3 true;
    add r1.vaults_used 1u64 into r4;
    cast r1.user r1.tier r1.start_time r1.end_time r4 r1.is_active into r5 as Subscription;
    set r5 into subscriptions[r0];

constructor:
    assert.eq edition 0u16;
