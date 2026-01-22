program timevault_main_9482.aleo {
    struct VaultData {
        creator: address,
        recipient: address,
        ipfs_hash_part1: field,
        ipfs_hash_part2: field,
        unlock_time: u64,
        unlock_type: u8,
        vault_type: u8,
        is_unlocked: bool,
        created_at: u64,
    }

    mapping vault_counter: u8 => u64;
    mapping vaults: u64 => VaultData;
    mapping user_vault_count: address => u64;
    mapping user_vaults: field => u64;

    @noupgrade
    async constructor() {}

    async transition create_vault(
        recipient: address,
        ipfs_hash_part1: field,
        ipfs_hash_part2: field,
        unlock_time: u64,
        unlock_type: u8,
        vault_type: u8,
        current_time: u64
    ) -> Future {
        return finalize_create_vault(
            self.caller,
            recipient,
            ipfs_hash_part1,
            ipfs_hash_part2,
            unlock_time,
            unlock_type,
            vault_type,
            current_time
        );
    }

    async function finalize_create_vault(
        creator: address,
        recipient: address,
        ipfs_hash_part1: field,
        ipfs_hash_part2: field,
        unlock_time: u64,
        unlock_type: u8,
        vault_type: u8,
        current_time: u64
    ) {
        let current_counter: u64 = Mapping::get_or_use(vault_counter, 0u8, 0u64);
        let vault_id: u64 = current_counter + 1u64;
        Mapping::set(vault_counter, 0u8, vault_id);

        let vault: VaultData = VaultData {
            creator: creator,
            recipient: recipient,
            ipfs_hash_part1: ipfs_hash_part1,
            ipfs_hash_part2: ipfs_hash_part2,
            unlock_time: unlock_time,
            unlock_type: unlock_type,
            vault_type: vault_type,
            is_unlocked: false,
            created_at: current_time,
        };
        Mapping::set(vaults, vault_id, vault);

        let creator_count: u64 = Mapping::get_or_use(user_vault_count, creator, 0u64);
        let creator_vault_key: field = BHP256::hash_to_field(creator) + BHP256::hash_to_field(creator_count);
        Mapping::set(user_vaults, creator_vault_key, vault_id);
        Mapping::set(user_vault_count, creator, creator_count + 1u64);

        if (recipient != creator) {
            let recipient_count: u64 = Mapping::get_or_use(user_vault_count, recipient, 0u64);
            let recipient_vault_key: field = BHP256::hash_to_field(recipient) + BHP256::hash_to_field(recipient_count);
            Mapping::set(user_vaults, recipient_vault_key, vault_id);
            Mapping::set(user_vault_count, recipient, recipient_count + 1u64);
        }
    }

    async transition unlock_vault(
        vault_id: u64,
        current_time: u64
    ) -> Future {
        return finalize_unlock_vault(self.caller, vault_id, current_time);
    }

    async function finalize_unlock_vault(
        caller: address,
        vault_id: u64,
        current_time: u64
    ) {
        let vault: VaultData = Mapping::get(vaults, vault_id);
        
        assert_eq(vault.is_unlocked, false);
        assert(vault.recipient == caller || vault.creator == caller);
        assert(current_time >= vault.unlock_time);

        let updated_vault: VaultData = VaultData {
            creator: vault.creator,
            recipient: vault.recipient,
            ipfs_hash_part1: vault.ipfs_hash_part1,
            ipfs_hash_part2: vault.ipfs_hash_part2,
            unlock_time: vault.unlock_time,
            unlock_type: vault.unlock_type,
            vault_type: vault.vault_type,
            is_unlocked: true,
            created_at: vault.created_at,
        };
        Mapping::set(vaults, vault_id, updated_vault);
    }
}
