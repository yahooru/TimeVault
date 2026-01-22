program timevault_subscription_9483.aleo {
    struct Subscription {
        user: address,
        tier: u8,
        start_time: u64,
        end_time: u64,
        vaults_used: u64,
        is_active: bool,
    }

    mapping subscriptions: address => Subscription;
    mapping vault_limits: u8 => u64;
    mapping tier_prices: u8 => u64;

    @noupgrade
    async constructor() {}

    async transition initialize_tiers() -> Future {
        return finalize_initialize_tiers();
    }

    async function finalize_initialize_tiers() {
        // Free Tier: 10 vaults
        Mapping::set(vault_limits, 0u8, 10u64);
        // Pro Tier: 1,000,000 vaults (effectively unlimited)
        Mapping::set(vault_limits, 1u8, 1000000u64);
        
        // Prices in Aleo credits (microcredits usually, but here we just store a flag/value)
        Mapping::set(tier_prices, 0u8, 0u64);
        Mapping::set(tier_prices, 1u8, 999000u64); // Example price
    }

    async transition subscribe(
        tier: u8,
        current_time: u64
    ) -> Future {
        assert(tier == 0u8 || tier == 1u8);
        return finalize_subscribe(self.caller, tier, current_time);
    }

    async function finalize_subscribe(
        user: address,
        tier: u8,
        current_time: u64
    ) {
        // Subscriptions last 30 days
        let duration: u64 = 2592000u64; 
        let end_time: u64 = current_time + duration;
        
        let sub: Subscription = Subscription {
            user: user,
            tier: tier,
            start_time: current_time,
            end_time: end_time,
            vaults_used: 0u64,
            is_active: true,
        };
        Mapping::set(subscriptions, user, sub);
    }

    async transition increment_vault_count() -> Future {
        return finalize_increment_vault_count(self.caller);
    }

    async function finalize_increment_vault_count(
        user: address
    ) {
        let sub: Subscription = Mapping::get(subscriptions, user);
        let limit: u64 = Mapping::get(vault_limits, sub.tier);
        
        assert(sub.vaults_used < limit);
        
        let updated_sub: Subscription = Subscription {
            user: sub.user,
            tier: sub.tier,
            start_time: sub.start_time,
            end_time: sub.end_time,
            vaults_used: sub.vaults_used + 1u64,
            is_active: sub.is_active,
        };
        Mapping::set(subscriptions, user, updated_sub);
    }
}
